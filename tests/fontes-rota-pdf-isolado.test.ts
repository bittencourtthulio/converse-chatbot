/**
 * T-03.05 (FT-13, PR-45, PR-107): o processo filho da extração sob o build do Next. Contra `next start`, o
 * upload de um PDF de 3 páginas pela rota vira fonte pronta com o texto e o de 501 páginas vira erro com a
 * mensagem do limite: é a prova de que `node --import tsx src/lib/extracao/trabalhador.ts` funciona no servidor
 * de produção (a imagem de contêiner leva `src/` e o `tsx`, ver o Dockerfile). Se isto falhar, o isolamento é
 * desligado por `EXTRACAO_ISOLADA_ATIVA` e a PEND-27 vira decisão humana.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashDeSenha } from '@/lib/senha'
import { EXTRACAO_ISOLADA_ATIVA } from '@/lib/extracao/isolada'
import { limparBanco } from './ajuda'
import { cookieDe, esperar, subirServidor, type Servidor } from './apoio/servidor'
import { gerarPdf } from './apoio/pdf-sintetico'

const SENHA = 'senha-de-rota-123'
const PORTA = 3254
let servidor: Servidor
let cookie: string
let agenteId: string

beforeAll(async () => {
  await limparBanco()
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin.pdf@teste.local', senhaHash: await hashDeSenha(SENHA), papel: 'admin' },
  })
  agenteId = (await prisma.agente.create({ data: { nome: 'Agente', modelo: 'openai/gpt-4o-mini', criadoPorId: admin.id } })).id
  cookie = await cookieDe('admin.pdf@teste.local', SENHA)
  servidor = await subirServidor(PORTA)
}, 120_000)

afterAll(async () => {
  servidor?.parar()
  await limparBanco()
})

async function enviarPdf(nome: string, bytes: Buffer): Promise<string> {
  const f = new FormData()
  f.append('arquivos', new File([new Uint8Array(bytes)], nome, { type: 'application/pdf' }))
  const r = await fetch(`${servidor.base}/api/agentes/${agenteId}/fontes`, { method: 'POST', headers: { cookie }, body: f })
  expect(r.status).toBe(202)
  const { resultados } = (await r.json()) as { resultados: Array<{ aceito: boolean; fonte?: { id: string } }> }
  return resultados[0]!.fonte!.id
}

async function aguardar(id: string, ...estados: string[]) {
  return esperar(async () => {
    const lista = (await (await fetch(`${servidor.base}/api/agentes/${agenteId}/fontes`, { headers: { cookie } })).json()) as {
      fontes: Array<{ id: string; status: string; mensagemErro: string | null }>
    }
    const f = lista.fontes.find((x) => x.id === id)
    return f && estados.includes(f.status) ? f : undefined
  }, 60_000)
}

describe('extração isolada sob next start', () => {
  it('o isolamento está ligado (se o filho não funcionasse sob o build, a constante seria false)', () => {
    expect(EXTRACAO_ISOLADA_ATIVA).toBe(true)
  })

  it('um PDF de 3 páginas enviado pela rota vira fonte pronta com o texto, e o servidor segue respondendo', async () => {
    const id = await enviarPdf('tres.pdf', gerarPdf(3))
    const durante = await fetch(`${servidor.base}/api/saude`)
    expect(durante.status).toBe(200)
    expect((await aguardar(id, 'pronto', 'erro')).status).toBe('pronto')
    const texto = (await prisma.trecho.findMany({ where: { fonteId: id } })).map((t) => t.texto).join('\n')
    expect(texto).toContain('Pagina 2')
  })

  it('um PDF de 501 páginas vira erro com a mensagem do limite', async () => {
    const id = await enviarPdf('grande.pdf', gerarPdf(501))
    const f = await aguardar(id, 'pronto', 'erro')
    expect(f.status).toBe('erro')
    expect(f.mensagemErro).toBe('Este PDF tem 501 páginas e o limite é de 500 páginas.')
  })
})
