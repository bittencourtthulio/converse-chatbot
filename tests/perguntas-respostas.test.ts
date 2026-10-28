import { afterAll, beforeEach, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/agentes/[id]/fontes/perguntas-respostas/route'
import { prisma } from '@/lib/prisma'
import { adicionarPerguntaResposta, trechosDaFonte } from '@/servicos/fontes'
import { obterFila } from '@/servicos/fontes-fila'
import { buscarNaBase } from '@/servicos/recuperacao'
import { criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste } from './apoio/fontes'

const sessao = vi.hoisted(() => vi.fn())
vi.mock('@/app/sessao-servidor', () => ({ usuarioAtual: sessao }))

beforeEach(limparBanco)
afterAll(limparBanco)

it('salva o par, processa e recupera a resposta pela pergunta na base do agente', async () => {
  const autor = await criarUsuario()
  const { agente } = await criarAgenteDeTeste()
  const pergunta = 'Qual é o prazo para solicitar uma troca?'
  const resposta = 'Você pode solicitar a troca em até sete dias após o recebimento.'
  const fonte = await adicionarPerguntaResposta(autor, agente.id, { pergunta, resposta })
  expect(fonte).toMatchObject({ tipo: 'pergunta_resposta', titulo: pergunta, status: 'pendente' })
  expect(fonte).not.toHaveProperty('caminhoArquivo')
  await obterFila().processarPendentes()
  const pagina = await trechosDaFonte(autor, agente.id, fonte.id)
  expect(pagina.fonte.status).toBe('pronto')
  expect(pagina.trechos[0]?.texto).toBe(`Pergunta: ${pergunta}\n\nResposta: ${resposta}`)
  const encontrados = await buscarNaBase(agente.id, pergunta)
  expect(encontrados).toEqual(expect.arrayContaining([
    expect.objectContaining({ fonteId: fonte.id, texto: expect.stringContaining(resposta) }),
  ]))
  const outro = await criarAgenteDeTeste('Outro agente')
  expect(await buscarNaBase(outro.agente.id, pergunta)).toEqual([])
})

it('recusa campos ausentes, vazios ou acima do limite sem criar fontes', async () => {
  const autor = await criarUsuario()
  const { agente } = await criarAgenteDeTeste()
  for (const entrada of [null, {}, { pergunta: ' ', resposta: 'Resposta' },
    { pergunta: 'Pergunta', resposta: ' ' }, { pergunta: 'a'.repeat(501), resposta: 'Resposta' },
    { pergunta: 'Pergunta', resposta: 'a'.repeat(200_001) }]) {
    await expect(adicionarPerguntaResposta(autor, agente.id, entrada)).rejects.toMatchObject({ status: 422 })
  }
  expect(await prisma.fonte.count()).toBe(0)
  await expect(adicionarPerguntaResposta(autor, 'inexistente', { pergunta: 'Pergunta?', resposta: 'Resposta' }))
    .rejects.toMatchObject({ status: 404 })
})

it('a rota exige sessão e retorna o par cadastrado com status 202', async () => {
  const autor = await criarUsuario()
  const { agente } = await criarAgenteDeTeste()
  const request = () => new Request('http://localhost/api/agentes/a1/fontes/perguntas-respostas', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pergunta: 'Qual é o prazo?', resposta: 'Sete dias.' }),
  })
  const contexto = { params: Promise.resolve({ id: agente.id }) }
  sessao.mockResolvedValue(null)
  expect((await POST(request(), contexto)).status).toBe(401)
  expect(await prisma.fonte.count()).toBe(0)
  sessao.mockResolvedValue(autor)
  const r = await POST(request(), contexto)
  expect(r.status).toBe(202)
  expect(await r.json()).toMatchObject({ fonte: { tipo: 'pergunta_resposta', titulo: 'Qual é o prazo?' } })
})
