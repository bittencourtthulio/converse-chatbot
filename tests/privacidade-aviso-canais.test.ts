// T-03.04 (FT-10, PR-91): o aviso de privacidade padrão do workspace no chat embutido (quando
// o agente não tem aviso próprio) e no /start do Telegram.
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { configuracaoDaPrevia, configuracaoPublica, salvarConfiguracao } from '@/servicos/chat-publico-config'
import { salvarAvisoPadrao } from '@/servicos/privacidade'
import { conectar } from '@/servicos/canal-telegram'
import { autenticarWebhook, lerUpdate, type CanalAutenticado } from '@/servicos/telegram-webhook'
import { atenderUpdate, MENSAGEM_INICIAL_PADRAO } from '@/servicos/telegram-atendimento'
import { criarAdmin, limparBanco } from './ajuda'
import { iniciarTelegramFalso, TOKEN_VALIDO, updateDeTexto, type TelegramFalso } from './apoio/telegram-falso'

const original = { ...process.env }
beforeEach(limparBanco)
afterAll(limparBanco)

async function cenario(mensagemInicial = 'Olá! Como posso ajudar?') {
  const admin = await criarAdmin()
  const agente = await prisma.agente.create({
    data: { nome: 'Loja', modelo: 'm', mensagemInicial, criadoPorId: admin.id },
  })
  return { admin, agente }
}

describe('chat embutido: aviso do agente ou do workspace (integração)', () => {
  it('sem aviso no agente, a configuração pública e a prévia trazem o aviso padrão com a URL', async () => {
    const { admin, agente } = await cenario()
    await salvarConfiguracao(admin, agente.id, { ativo: true })
    await salvarAvisoPadrao(admin, { texto: 'Seus dados são usados só para atendimento.', url: 'https://exemplo.com.br/privacidade' })
    const esperado = { texto: 'Seus dados são usados só para atendimento.', url: 'https://exemplo.com.br/privacidade' }
    expect((await configuracaoPublica(agente.id))?.avisoDePrivacidade).toEqual(esperado)
    expect((await configuracaoDaPrevia(admin, agente.id)).avisoDePrivacidade).toEqual(esperado)
  })

  it('com aviso próprio o do agente vale, inclusive sem link, e não se mistura com o do workspace', async () => {
    const { admin, agente } = await cenario()
    await salvarAvisoPadrao(admin, { texto: 'Aviso do workspace', url: 'https://exemplo.com.br/privacidade' })
    await salvarConfiguracao(admin, agente.id, { ativo: true, avisoDePrivacidade: 'Aviso deste agente' })
    expect((await configuracaoPublica(agente.id))?.avisoDePrivacidade).toEqual({ texto: 'Aviso deste agente', url: null })
  })

  it('sem nenhum dos dois, o aviso é nulo', async () => {
    const { admin, agente } = await cenario()
    await salvarConfiguracao(admin, agente.id, { ativo: true })
    expect((await configuracaoPublica(agente.id))?.avisoDePrivacidade).toBeNull()
  })

  it('o aviso padrão não vaza campo interno: a configuração pública segue só com os campos visuais', async () => {
    const { admin, agente } = await cenario()
    await salvarConfiguracao(admin, agente.id, { ativo: true })
    await salvarAvisoPadrao(admin, { texto: 'Aviso', url: '' })
    const publica = await configuracaoPublica(agente.id)
    expect(Object.keys(publica ?? {}).sort()).toEqual(
      ['ativo', 'avatar', 'avisoDePrivacidade', 'cor', 'mensagemInicial', 'posicao', 'sugestoes', 'titulo'].sort(),
    )
  })
})

describe('/start do Telegram (integração com o simulado)', () => {
  let falso: TelegramFalso
  let canal: CanalAutenticado
  afterEach(async () => {
    await falso.fechar()
    for (const chave of ['TELEGRAM_API_BASE', 'APP_URL']) {
      if (original[chave] === undefined) delete process.env[chave]
      else process.env[chave] = original[chave]
    }
  })

  async function ligar(mensagemInicial?: string) {
    const { admin, agente } = await cenario(mensagemInicial)
    falso = await iniciarTelegramFalso()
    process.env.TELEGRAM_API_BASE = falso.url
    process.env.APP_URL = 'https://converse.exemplo.com'
    await conectar(admin, agente.id, TOKEN_VALIDO)
    canal = (await autenticarWebhook(agente.id, falso.webhook?.secret_token as string)) as CanalAutenticado
    falso.requisicoes.length = 0
    return admin
  }
  async function start() {
    const lido = lerUpdate(updateDeTexto({ updateId: Math.floor(Math.random() * 1e6), chatId: 42, texto: '/start' }))
    await atenderUpdate(canal, lido!)
  }

  it('envia a mensagem inicial seguida do aviso e da URL', async () => {
    const admin = await ligar('Olá, sou o assistente da loja!')
    await salvarAvisoPadrao(admin, { texto: 'Seus dados são usados só para atendimento.', url: 'https://exemplo.com.br/privacidade' })
    await start()
    expect(falso.mensagensEnviadas()).toEqual([
      {
        chat_id: 42,
        text: 'Olá, sou o assistente da loja!\n\nSeus dados são usados só para atendimento.\nhttps://exemplo.com.br/privacidade',
      },
    ])
  })

  it('sem URL anexa só o texto, e com a mensagem inicial vazia usa a padrão e anexa o aviso', async () => {
    const admin = await ligar('')
    await salvarAvisoPadrao(admin, { texto: 'Aviso curto.', url: '' })
    await start()
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: `${MENSAGEM_INICIAL_PADRAO}\n\nAviso curto.` }])
  })

  it('sem aviso padrão o /start envia só a mensagem inicial', async () => {
    await ligar('Olá, sou o assistente da loja!')
    await start()
    expect(falso.mensagensEnviadas()).toEqual([{ chat_id: 42, text: 'Olá, sou o assistente da loja!' }])
  })
})
