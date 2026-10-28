import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import { conversar, listarModelos, limparCacheDeModelos, transcreverAudio, verificarChave } from '@/lib/openrouter'
import { obterConsumoDeIA } from '@/servicos/consumo-ia'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'
import { CHAVE_VALIDA, iniciarOpenRouterFalso, type OpenRouterFalso } from './apoio/openrouter-falso'
import { cenarioDeChat, coletar, responderMensagem } from './apoio/chat'

let falso: OpenRouterFalso
const pedido = { chave: CHAVE_VALIDA, modelo: 'openai/gpt-4o-mini', mensagens: [{ role: 'user' as const, content: 'conteudo-privado' }] }
async function consumir(opcoes: Partial<Parameters<typeof conversar>[0]> = {}) {
  let texto = ''
  for await (const trecho of conversar({ ...pedido, ...opcoes })) texto += trecho
  return texto
}
beforeEach(async () => {
  await limparBanco()
  limparCacheDeModelos()
  falso = await iniciarOpenRouterFalso({ uso: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120, cost: 0.00123456 } })
  process.env.OPENROUTER_BASE_URL = falso.url
})
afterEach(async () => { vi.restoreAllMocks(); await falso.fechar(); delete process.env.OPENROUTER_BASE_URL })

describe('registro das chamadas do OpenRouter', () => {
  it('captura custo e tokens do último SSE mesmo depois de finish_reason, com pacotes partidos', async () => {
    falso.configurar({ partirChunks: true, modeloRespondido: 'openai/modelo-resolvido' })
    await consumir({ contexto: { funcao: 'responderMensagem', origem: 'widget' } })
    const registro = await prisma.chamadaDeIA.findFirstOrThrow()
    expect(registro).toMatchObject({ status: 'sucesso', funcao: 'responderMensagem', origem: 'widget', modeloSolicitado: pedido.modelo, modelo: 'openai/modelo-resolvido', tokensEntrada: 100, tokensSaida: 20, tokensTotal: 120, custoUsd: 0.00123456, geracaoId: 'gen-falso', statusHttp: 200 })
    expect(registro.duracaoMs).toBeGreaterThanOrEqual(0)
    expect(JSON.stringify(registro)).not.toMatch(/conteudo-privado|sk-or|Olá/)
  })
  it('registra cada transcrição e preserva custo mesmo quando o modelo devolve texto vazio', async () => {
    falso.configurar({ silencios: [0] })
    await expect(transcreverAudio({ chave: CHAVE_VALIDA, modelo: 'google/gemini-2.5-flash', audioBase64: 'audio-privado', formato: 'mp3' })).rejects.toMatchObject({ codigo: 'transcricao_vazia' })
    expect(await prisma.chamadaDeIA.findFirstOrThrow()).toMatchObject({ funcao: 'transcreverAudio', status: 'erro', custoUsd: 0.00123456, erroCodigo: 'transcricao_vazia' })
  })
  it('registra consultas e teste da chave sem custo e não conta cache como chamada', async () => {
    await listarModelos(); await listarModelos(); await verificarChave(CHAVE_VALIDA)
    const registros = await prisma.chamadaDeIA.findMany()
    expect(registros).toHaveLength(2)
    expect(registros.map(r => r.funcao).sort()).toEqual(['listarModelos', 'verificarChave'])
    expect(registros.every(r => r.custoUsd === 0 && r.status === 'sucesso')).toBe(true)
  })
  it('registra falha HTTP uma única vez sem inventar custo nem guardar o corpo do erro', async () => {
    falso.configurar({ erroHttp: 402 })
    await expect(consumir()).rejects.toMatchObject({ codigo: 'provedor_sem_saldo' })
    expect(await prisma.chamadaDeIA.findMany()).toMatchObject([{ status: 'erro', statusHttp: 402, custoUsd: null }])
  })
  it('registra erro no meio do stream e timeout', async () => {
    falso.configurar({ trechos: ['um', 'dois'], erroNoMeioApos: 1 })
    await expect(consumir()).rejects.toBeDefined()
    falso.configurar({ erroNoMeioApos: null, latenciaMs: 200 })
    await expect(consumir({ tempoPrimeiroByteMs: 20 })).rejects.toMatchObject({ codigo: 'provedor_tempo_esgotado' })
    expect((await prisma.chamadaDeIA.findMany()).map(r => r.status)).toEqual(['erro', 'erro'])
  })
  it('registra cancelamento por sinal e por interrupção do consumidor', async () => {
    falso.configurar({ trechos: ['um', 'dois', 'tres'], intervaloEntreTrechosMs: 20 })
    const controle = new AbortController()
    for await (const trecho of conversar({ ...pedido, sinal: controle.signal })) { expect(trecho).toBeTruthy(); controle.abort() }
    for await (const trecho of conversar(pedido)) { expect(trecho).toBeTruthy(); break }
    expect((await prisma.chamadaDeIA.findMany()).map(r => r.status)).toEqual(['cancelada', 'cancelada'])
  })
  it('mantém custo ausente distinto de modelo gratuito', async () => {
    falso.configurar({ uso: { cost: 0, prompt_tokens: 0, completion_tokens: 0 } }); await consumir()
    falso.configurar({ uso: {} }); await consumir()
    expect((await prisma.chamadaDeIA.findMany({ orderBy: { iniciadoEm: 'asc' } })).map(r => r.custoUsd)).toEqual([0, null])
  })
  it.each(['painel', 'widget', 'telegram'] as const)('identifica a função e a origem reais do canal %s', async canal => {
    const { agente } = await cenarioDeChat()
    const fonte = await prisma.fonte.create({ data: { agenteId: agente.id, tipo: 'texto', titulo: 'Atendimento', status: 'pronto', tamanhoBytes: 50 } })
    await prisma.trecho.create({ data: { agenteId: agente.id, fonteId: fonte.id, indice: 0, texto: 'Horário de atendimento: segunda a sexta das 9h às 18h.', caracteres: 50 } })
    const { erro } = await coletar(responderMensagem({ agenteId: agente.id, canal, mensagem: 'Qual é o horário de atendimento?', identificadorExterno: canal === 'painel' ? undefined : 'identificador-privado' }))
    expect(erro).toBeUndefined()
    const registro = await prisma.chamadaDeIA.findFirstOrThrow({ where: { caminho: '/chat/completions' } })
    expect(registro).toMatchObject({ funcao: 'responderMensagem', origem: canal, status: 'sucesso', custoUsd: 0.00123456 })
    expect(JSON.stringify(registro)).not.toContain('identificador-privado')
  })
  it('ignora custo e contagens inválidos retornados pelo provedor', async () => {
    falso.configurar({ uso: { cost: -1, prompt_tokens: '100', completion_tokens: 1.5, total_tokens: 2147483648 } })
    await consumir()
    expect(await prisma.chamadaDeIA.findFirstOrThrow()).toMatchObject({ custoUsd: null, tokensEntrada: null, tokensSaida: null, tokensTotal: null })
  })
  it('falha de persistência não interrompe a resposta do modelo', async () => {
    vi.spyOn(prisma.chamadaDeIA, 'create').mockRejectedValueOnce(new Error('falha de banco'))
    await expect(consumir()).resolves.toContain('assistente simulado')
  })
})

describe('relatório de consumo', () => {
  const agora = new Date('2026-10-28T15:00:00Z')
  async function registrar(dias: number, custoUsd: number | null, status = 'sucesso') {
    return prisma.chamadaDeIA.create({ data: { iniciadoEm: new Date(agora.getTime() - dias * 86400000), funcao: 'responderMensagem', origem: 'painel', caminho: '/chat/completions', modelo: 'openai/gpt-4o-mini', status, custoUsd, tokensEntrada: 100, tokensSaida: 20, tokensTotal: 120 } })
  }
  it('restringe o relatório a administradores', async () => {
    await expect(obterConsumoDeIA(await criarUsuario())).rejects.toMatchObject({ status: 403 })
  })
  it('aplica os quatro períodos e inclui a fronteira inicial sem contar chamadas futuras', async () => {
    const admin = await criarAdmin()
    for (const dias of [0, 7, 15, 30, 90, 91, -1]) await registrar(dias, 1)
    for (const [dias, total] of [[7, 2], [15, 3], [30, 4], [90, 5]]) {
      const relatorio = await obterConsumoDeIA(admin, { dias, agora })
      expect(relatorio.total).toBe(total)
      expect(relatorio.custoTotalUsd).toBe(total)
    }
  })
  it('soma o período inteiro com paginação apenas no histórico e mede pendências e erros', async () => {
    const admin = await criarAdmin()
    for (let i = 0; i < 55; i++) await registrar(1, 0.01)
    await registrar(2, null, 'erro'); await registrar(3, null, 'cancelada'); await registrar(4, null, 'em_andamento')
    const r = await obterConsumoDeIA(admin, { dias: 7, pagina: 2, agora })
    expect(r.total).toBe(58); expect(r.itens).toHaveLength(8)
    expect(r.custoTotalUsd).toBeCloseTo(0.55)
    expect(r.custosNaoInformados).toBe(3); expect(r.erros).toBe(1); expect(r.canceladas).toBe(1); expect(r.emAndamento).toBe(1)
    expect(r.tokensTotal).toBe(58 * 120)
    expect(r.porModelo[0]).toMatchObject({ chamadas: 58, custoUsd: expect.closeTo(0.55) })
    expect(r.porFuncao[0]).toMatchObject({ funcao: 'responderMensagem', chamadas: 58 })
  })
  it('normaliza parâmetros inválidos e devolve a última página existente', async () => {
    const admin = await criarAdmin(); await registrar(1, 0)
    const r = await obterConsumoDeIA(admin, { dias: 123, pagina: 999, agora })
    expect(r.dias).toBe(7); expect(r.pagina).toBe(1); expect(r.itens).toHaveLength(1)
  })
})
