/**
 * T-06.01 (FT-07, PR-69): a lógica pura do cartão do Telegram na aba Canais: o
 * estado vira a visão (selo, botões, aviso de APP_URL, link do bot) sem navegador.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  AVISO_SEM_APP_URL,
  PASSOS_DO_TELEGRAM,
  dadosDoCanal,
  formatarData,
  proximoEstadoDaDesconexao,
  visaoDoCartaoTelegram,
  type DadosDoCanalTelegram,
} from '@/componentes/canais-logica'
import { CANAIS_DO_AGENTE } from '@/componentes/canais'
import type { EstadoDoCanal } from '@/servicos/canal-telegram'

const estadoBase: EstadoDoCanal = {
  conectado: true,
  ativo: true,
  estado: 'conectado',
  bot: { id: '1', username: 'loja_bot', nome: 'Loja', url: 'https://t.me/loja_bot' },
  webhookUrl: 'https://converse.exemplo.com/api/telegram/x/webhook',
  conectadoEm: new Date('2026-09-30T15:00:00Z'),
  ultimoErro: null,
  ultimoErroEm: null,
  ultimaMensagemEm: null,
  limiteDiario: 500,
}

const comoDados = (parcial: Partial<EstadoDoCanal> = {}): DadosDoCanalTelegram =>
  dadosDoCanal({ ...estadoBase, ...parcial }) as DadosDoCanalTelegram

describe('visaoDoCartaoTelegram', () => {
  it('sem canal: não conectado, Conectar habilitado só com APP_URL que o Telegram aceita', () => {
    const ok = visaoDoCartaoTelegram({ canal: null, appUrlServe: true })
    expect(ok).toMatchObject({ situacao: 'nao_conectado', selo: { texto: 'Não conectado', variante: 'neutro' }, podeConectar: true, motivoSemConectar: null, linkDoBot: null })
    const sem = visaoDoCartaoTelegram({ canal: null, appUrlServe: false })
    expect(sem.podeConectar).toBe(false)
    expect(sem.motivoSemConectar).toBe(AVISO_SEM_APP_URL)
  })

  it('o aviso de APP_URL explica HTTPS, o túnel e a variável', () => {
    expect(AVISO_SEM_APP_URL).toMatch(/HTTPS/)
    expect(AVISO_SEM_APP_URL).toMatch(/túnel/i)
    expect(AVISO_SEM_APP_URL).toMatch(/APP_URL/)
  })

  it('conectado, pausado e com erro têm selo, variante e rótulo do botão de pausa próprios', () => {
    const conectado = visaoDoCartaoTelegram({ canal: comoDados(), appUrlServe: true })
    expect(conectado).toMatchObject({ situacao: 'conectado', selo: { texto: 'Conectado', variante: 'sucesso' }, rotuloDaPausa: 'Pausar', linkDoBot: 'https://t.me/loja_bot' })
    const pausado = visaoDoCartaoTelegram({ canal: comoDados({ ativo: false, estado: 'pausado' }), appUrlServe: true })
    expect(pausado).toMatchObject({ situacao: 'pausado', selo: { texto: 'Pausado', variante: 'aviso' }, rotuloDaPausa: 'Retomar' })
    const comErro = visaoDoCartaoTelegram({ canal: comoDados({ estado: 'com_erro', ultimoErro: 'falhou' }), appUrlServe: true })
    expect(comErro).toMatchObject({ situacao: 'com_erro', selo: { texto: 'Com erro', variante: 'perigo' } })
  })

  it('canal já conectado continua operável mesmo se APP_URL deixou de servir; só a troca de token fica bloqueada', () => {
    const v = visaoDoCartaoTelegram({ canal: comoDados(), appUrlServe: false })
    expect(v.situacao).toBe('conectado')
    expect(v.podeConectar).toBe(false)
    expect(v.motivoSemConectar).toBe(AVISO_SEM_APP_URL)
  })
})

describe('dadosDoCanal', () => {
  it('é nulo sem canal e formata as datas em português; nunca carrega o id do bot nem segredo', () => {
    expect(dadosDoCanal(null)).toBeNull()
    const d = comoDados({ ultimaMensagemEm: new Date('2026-09-30T18:30:00Z'), ultimoErroEm: new Date('2026-09-30T18:31:00Z'), ultimoErro: 'x' })
    expect(d.ultimaMensagemEm).toMatch(/\d{2}\/\d{2}\/\d{2,4}/)
    expect(d.ultimoErroEm).toMatch(/\d{2}\/\d{2}\/\d{2,4}/)
    expect(Object.keys(d).sort()).toEqual(['ativo', 'bot', 'conectadoEm', 'estado', 'limiteDiario', 'ultimaMensagemEm', 'ultimoErro', 'ultimoErroEm', 'webhookUrl'])
    expect(Object.keys(d.bot).sort()).toEqual(['nome', 'url', 'username'])
  })

  it('formatarData devolve nulo para nulo', () => {
    expect(formatarData(null)).toBeNull()
  })
})

describe('desconectar com confirmação na própria tela', () => {
  it('o primeiro clique só abre a confirmação; cancelar volta; confirmar é outra ação', () => {
    expect(proximoEstadoDaDesconexao('inicial', 'desconectar')).toBe('confirmando')
    expect(proximoEstadoDaDesconexao('confirmando', 'cancelar')).toBe('inicial')
    expect(proximoEstadoDaDesconexao('inicial', 'cancelar')).toBe('inicial')
  })
})

describe('passo a passo e lista de canais', () => {
  it('o passo a passo cita o @BotFather, /newbot, o token e Conectar', () => {
    const texto = PASSOS_DO_TELEGRAM.join(' ')
    expect(PASSOS_DO_TELEGRAM).toHaveLength(3)
    expect(texto).toMatch(/@BotFather/)
    expect(texto).toMatch(/\/newbot/)
    expect(texto).toMatch(/token/i)
    expect(texto).toMatch(/Conectar/)
  })

  it('a lista de canais é uma só e nasce com o Telegram; outro canal é uma entrada nova', () => {
    expect(CANAIS_DO_AGENTE.map((c) => c.id)).toEqual(['telegram'])
    expect(CANAIS_DO_AGENTE[0]).toMatchObject({ id: 'telegram', titulo: 'Telegram' })
  })

  it('o módulo é puro: não importa serviço de valor, banco nem next', () => {
    const fonte = readFileSync('src/componentes/canais-logica.ts', 'utf8')
    expect(fonte).not.toMatch(/from '@\/lib\/prisma'|from 'next\//)
    for (const linha of fonte.split('\n').filter((l) => l.startsWith('import'))) {
      if (linha.includes('@/servicos')) expect(linha).toMatch(/^import type /)
    }
  })
})
