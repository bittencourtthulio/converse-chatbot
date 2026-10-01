// T-01.03: caracterização do SQLite com o adaptador better-sqlite3 do Prisma 7. Antes de
// escrever o strftime do painel e o LIKE do histórico, o teste prova o que o banco guarda
// e como ele responde (lacunas 1 e 2 da base). Cada afirmação sobre formato é uma expectativa.
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { criarAgenteDeTeste, criarConversaDeTeste } from './apoio/historico'
import { limparBanco } from './ajuda'

beforeEach(limparBanco)

async function gravar(conteudos: string[], quando = new Date('2026-03-10T12:00:00.000Z')) {
  const agente = await criarAgenteDeTeste()
  return criarConversaDeTeste({
    agenteId: agente.id,
    canal: 'widget',
    atualizadoEm: quando,
    mensagens: conteudos.map((conteudo) => ({ papel: 'user' as const, conteudo, criadoEm: quando })),
  })
}

async function achar(texto: string): Promise<string[]> {
  const linhas = await prisma.$queryRaw<Array<{ conteudo: string }>>`
    SELECT conteudo FROM mensagens WHERE conteudo LIKE ${texto} ESCAPE '\\' ORDER BY conteudo`
  return linhas.map((l) => l.conteudo)
}

describe('formato do DateTime (integração com o SQLite de teste)', () => {
  it('guarda o instante como texto ISO 8601 em UTC, com milissegundos e deslocamento +00:00', async () => {
    const quando = new Date('2026-03-10T12:00:00.000Z')
    await gravar(['x'], quando)
    const [linha] = await prisma.$queryRaw<Array<{ tipo: string; valor: string }>>`
      SELECT typeof(criadoEm) AS tipo, '' || criadoEm AS valor FROM mensagens`
    expect(linha?.tipo).toBe('text')
    expect(linha?.valor).toBe('2026-03-10T12:00:00.000+00:00')
  })

  it('strftime com localtime sobre o texto ISO agrupa pelo dia local do processo', async () => {
    // Meia-noite local de 10/03/2026 menos um minuto e mais um minuto: dias locais diferentes.
    const meiaNoite = new Date(2026, 2, 10, 0, 0, 0, 0)
    await gravar(['antes'], new Date(meiaNoite.getTime() - 60_000))
    await gravar(['depois'], new Date(meiaNoite.getTime() + 60_000))
    const dias = await prisma.$queryRaw<Array<{ dia: string; n: number | bigint }>>`
      SELECT strftime('%Y-%m-%d', criadoEm, 'localtime') AS dia, COUNT(*) AS n
      FROM mensagens GROUP BY dia ORDER BY dia`
    expect(dias.map((d) => d.dia)).toEqual(['2026-03-09', '2026-03-10'])
    expect(dias.map((d) => Number(d.n))).toEqual([1, 1])
  })
})

describe('fuso do processo (funcional)', () => {
  it('o mesmo instante cai em dias locais diferentes conforme o TZ do processo', async () => {
    const original = process.env.TZ
    await gravar(['x'], new Date('2026-03-10T01:30:00.000Z'))
    const diaLocal = async () => {
      const [l] = await prisma.$queryRaw<Array<{ dia: string }>>`
        SELECT strftime('%Y-%m-%d', criadoEm, 'localtime') AS dia FROM mensagens`
      return l?.dia
    }
    try {
      process.env.TZ = 'UTC'
      expect(await diaLocal()).toBe('2026-03-10')
      process.env.TZ = 'America/Sao_Paulo'
      expect(await diaLocal()).toBe('2026-03-09')
    } finally {
      if (original === undefined) delete process.env.TZ
      else process.env.TZ = original
    }
  })
})

describe('LIKE com ESCAPE (funcional)', () => {
  it('acha texto sem acento ignorando maiúsculas', async () => {
    await gravar(['Qual o prazo de ENTREGA?', 'outra coisa'])
    expect(await achar('%entrega%')).toEqual(['Qual o prazo de ENTREGA?'])
  })

  it('não ignora maiúsculas em letra acentuada (limite conhecido, PR-79)', async () => {
    await gravar(['AÇÃO urgente'])
    expect(await achar('%ação%')).toEqual([])
    expect(await achar('%AÇÃO%')).toEqual(['AÇÃO urgente'])
  })

  it('escapa percentual, sublinhado e barra invertida como literais', async () => {
    await gravar(['desconto de 50% hoje', 'desconto de 50 reais', 'a_b', 'axb', 'caminho C:\\temp', 'caminho C:/temp'])
    expect(await achar('%50\\%%')).toEqual(['desconto de 50% hoje'])
    expect(await achar('%a\\_b%')).toEqual(['a_b'])
    expect(await achar('%C:\\\\temp%')).toEqual(['caminho C:\\temp'])
    // Sem escape o curinga casa mais do que devia: é o que o escape evita.
    expect((await achar('%a_b%')).sort()).toEqual(['a_b', 'axb'])
  })

  it('texto com aspas e ponto e vírgula é só parâmetro', async () => {
    await gravar(["x'; DROP TABLE mensagens; --"])
    expect(await achar("%'; DROP TABLE%")).toEqual(["x'; DROP TABLE mensagens; --"])
    expect(await prisma.mensagem.count()).toBe(1)
  })
})
