// T-02.02 (FT-10, PR-86): a trilha é somente-acréscimo. Nenhuma função, rota ou ação de
// servidor atualiza ou apaga registro; a única remoção é a purga por idade.
import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import * as auditoria from '@/servicos/auditoria'
import { limparBanco } from './ajuda'
import { criarRegistroDeTeste } from './apoio/privacidade'

beforeEach(limparBanco)
afterAll(limparBanco)

const raiz = process.cwd()

function arquivosDe(dir: string, acumulado: string[] = []): string[] {
  for (const nome of readdirSync(path.join(raiz, dir))) {
    const relativo = `${dir}/${nome}`
    if (statSync(path.join(raiz, relativo)).isDirectory()) {
      if (nome !== 'gerado') arquivosDe(relativo, acumulado)
    } else if (/\.(ts|tsx)$/.test(nome)) acumulado.push(relativo)
  }
  return acumulado
}
const ler = (arquivo: string) => readFileSync(path.join(raiz, arquivo), 'utf8')
const todos = arquivosDe('src')

describe('só o serviço de auditoria toca a tabela (integração: varredura de src/)', () => {
  it('nenhum outro arquivo de src/ usa o modelo registroDeAuditoria nem a tabela por SQL', () => {
    const intrusos = todos.filter(
      (a) => a !== 'src/servicos/auditoria.ts' && /registroDeAuditoria|registros_de_auditoria/.test(ler(a)),
    )
    expect(intrusos).toEqual([])
  })

  it('o serviço só usa create, count, findMany e uma única remoção (deleteMany da purga)', () => {
    const fonte = ler('src/servicos/auditoria.ts')
    const operacoes = [...fonte.matchAll(/registroDeAuditoria\.(\w+)\(/g)].map((m) => m[1])
    expect(new Set(operacoes)).toEqual(new Set(['create', 'count', 'findMany', 'deleteMany']))
    expect(operacoes.filter((o) => o === 'deleteMany')).toHaveLength(1)
    expect(fonte).not.toMatch(/\$executeRaw|\$queryRaw|registroDeAuditoria\.(update|updateMany|upsert|delete)\(/)
  })

  it('os exports do serviço não têm função de editar ou apagar além de purgarAnterioresA', () => {
    const funcoes = Object.entries(auditoria)
      .filter(([, v]) => typeof v === 'function')
      .map(([nome]) => nome)
      .sort()
    expect(funcoes).toEqual(['aguardarGravacoesPendentes', 'listar', 'purgarAnterioresA', 'registrar', 'registrarMelhorEsforco'])
  })

  it('nenhuma rota de src/app/api tem caminho de auditoria nem importa o serviço com DELETE, PUT ou PATCH', () => {
    const rotas = todos.filter((a) => /^src\/app\/api\/.*route\.ts$/.test(a))
    expect(rotas.length).toBeGreaterThan(0)
    expect(rotas.filter((r) => /auditoria/i.test(r))).toEqual([])
    const comRemocao = rotas.filter((r) => /export\s+(async\s+)?function\s+(DELETE|PUT|PATCH)\b/.test(ler(r)))
    expect(comRemocao.filter((r) => /servicos\/auditoria/.test(ler(r)))).toEqual([])
  })

  it('as ações de servidor não importam o serviço de auditoria (só leem pela página)', () => {
    expect(ler('src/app/acoes.ts')).not.toMatch(/servicos\/auditoria/)
  })
})

describe('purgarAnterioresA (funcional)', () => {
  it('apaga só os registros estritamente anteriores ao corte e devolve a contagem', async () => {
    const corte = new Date('2026-01-10T12:00:00.000Z')
    await criarRegistroDeTeste({ quando: new Date('2026-01-10T11:59:59.999Z') })
    await criarRegistroDeTeste({ quando: new Date('2026-01-01T00:00:00.000Z') })
    await criarRegistroDeTeste({ quando: corte })
    await criarRegistroDeTeste({ quando: new Date('2026-01-10T12:00:00.001Z') })
    expect(await auditoria.purgarAnterioresA(corte)).toBe(2)
    const restantes = await prisma.registroDeAuditoria.findMany({ orderBy: { quando: 'asc' } })
    expect(restantes.map((r) => r.quando.toISOString())).toEqual(['2026-01-10T12:00:00.000Z', '2026-01-10T12:00:00.001Z'])
  })

  it('sem nada anterior ao corte devolve 0 e não mexe em nada', async () => {
    await criarRegistroDeTeste({ quando: new Date('2026-05-05T00:00:00.000Z') })
    expect(await auditoria.purgarAnterioresA(new Date('2026-01-01T00:00:00.000Z'))).toBe(0)
    expect(await prisma.registroDeAuditoria.count()).toBe(1)
  })
})
