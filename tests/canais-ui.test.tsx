/**
 * T-06.02 (FT-07, PR-14, PR-23, PR-69): o cartão do Telegram da aba Canais.
 * Renderizado no servidor com cada estado da visão; a interação em si (clique,
 * confirmação) é lógica pura testada em `canais-logica.test.ts`.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { CartaoTelegram } from '@/componentes/CartaoTelegram'
import {
  visaoDoCartaoTelegram,
  type DadosDoCanalTelegram,
} from '@/componentes/canais-logica'

const acao = async () => ({})
const acoes = { conectar: acao, desconectar: acao, pausar: acao, retomar: acao, verificar: acao, salvarLimite: acao }

const dadosBase: DadosDoCanalTelegram = {
  ativo: true,
  estado: 'conectado',
  bot: { username: 'loja_bot', nome: 'Loja da Ana', url: 'https://t.me/loja_bot' },
  webhookUrl: 'https://converse.exemplo.com/api/telegram/abc/webhook',
  conectadoEm: '30/09/2026 12:00',
  ultimoErro: null,
  ultimoErroEm: null,
  ultimaMensagemEm: null,
  limiteDiario: 500,
}

function renderizar(opcoes: { canal?: Partial<DadosDoCanalTelegram> | null; appUrlServe?: boolean; confirmando?: boolean } = {}) {
  const canal = opcoes.canal === null ? null : { ...dadosBase, ...opcoes.canal }
  const visao = visaoDoCartaoTelegram({ canal, appUrlServe: opcoes.appUrlServe ?? true })
  return renderToStaticMarkup(
    <CartaoTelegram
      agenteId="agente-1"
      titulo="Telegram"
      resumo="Converse com este agente pelo Telegram."
      canal={canal}
      visao={visao}
      acoes={acoes}
      confirmandoInicial={opcoes.confirmando}
    />,
  )
}

const campoDeToken = (html: string) => (html.match(/<input[^>]*name="token"[^>]*>/g) ?? [])

describe('cartão do Telegram: ainda não conectado', () => {
  const html = renderizar({ canal: null })

  it('mostra o título, o selo Não conectado e o passo a passo com o @BotFather e /newbot', () => {
    expect(html).toContain('Telegram')
    expect(html).toContain('Não conectado')
    expect(html).toContain('@BotFather')
    expect(html).toContain('/newbot')
    expect(html).toMatch(/<ol[^>]*>/)
    expect(html.match(/<li>/g)).toHaveLength(3)
    expect(html).toContain('href="https://t.me/BotFather"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it('o campo do token é senha, nunca preenchido, sem preenchimento automático e com rótulo', () => {
    const campos = campoDeToken(html)
    expect(campos).toHaveLength(1)
    expect(campos[0]).toContain('type="password"')
    expect(campos[0]).toContain('autoComplete="off"')
    expect(campos[0]).not.toMatch(/\svalue=/)
    expect(html).toContain('Token do bot')
    expect(html).toMatch(/<label[^>]*class="campo"/)
  })

  it('o botão Conectar está habilitado e não há aviso quando APP_URL serve ao Telegram', () => {
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*>Conectar<\/button>/)
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>Conectar</)
    expect(html).not.toContain('APP_URL')
  })

  it('o campo envia o id do agente e não mostra nada de canal conectado', () => {
    expect(html).toContain('name="id"')
    expect(html).toContain('value="agente-1"')
    for (const proibido of ['Verificar', 'Pausar', 'Desconectar', 'Limite diário']) expect(html).not.toContain(proibido)
  })
})

describe('cartão do Telegram: sem APP_URL HTTPS', () => {
  const html = renderizar({ canal: null, appUrlServe: false })

  it('explica a conexão direta e mantém Conectar habilitado', () => {
    expect(html).toMatch(/role="status"/)
    expect(html).toContain('alerta-aviso')
    expect(html).toContain('diretamente')
    expect(html).toContain('servidor estiver ligado')
    expect(html).not.toMatch(/<button[^>]*disabled[^>]*>Conectar<\/button>/)
  })
})

describe('cartão do Telegram: conectado', () => {
  const html = renderizar()

  it('mostra o bot com link para o Telegram, o selo e os dados do canal', () => {
    expect(html).toContain('Loja da Ana')
    expect(html).toContain('href="https://t.me/loja_bot"')
    expect(html).toContain('@loja_bot')
    expect(html).toContain('badge-sucesso')
    expect(html).toContain('Conectado')
    expect(html).toContain('Nenhuma ainda')
    expect(html).toContain('<code>https://converse.exemplo.com/api/telegram/abc/webhook</code>')
    expect(html).toContain('30/09/2026 12:00')
  })

  it('tem Verificar, Pausar, Desconectar e o limite diário com o valor atual', () => {
    expect(html).toMatch(/>Verificar<\/button>/)
    expect(html).toMatch(/>Pausar<\/button>/)
    expect(html).toMatch(/>Desconectar<\/button>/)
    expect(html).toMatch(/<input[^>]*name="limiteDiario"[^>]*>/)
    expect(html).toMatch(/name="limiteDiario"[^>]*value="500"|value="500"[^>]*name="limiteDiario"/)
    expect(html).toContain('Limite diário')
  })

  it('o token só aparece num campo vazio, dentro de "Trocar o token", e a tela nunca o repete', () => {
    expect(html).toContain('<details')
    expect(html).toContain('Trocar o token do bot')
    for (const campo of campoDeToken(html)) expect(campo).not.toMatch(/\svalue=/)
    expect(html).not.toMatch(/\d{6,}:[A-Za-z0-9_-]{20,}/)
  })

  it('sem erro, não há alerta de erro', () => {
    expect(html).not.toContain('alerta-erro')
  })

  it('canal com webhook segue visível mesmo sem APP_URL', () => {
    const sem = renderizar({ appUrlServe: false })
    expect(sem).not.toContain('APP_URL')
    expect(sem).toContain('Loja da Ana')
    expect(sem).toMatch(/>Verificar<\/button>/)
  })
})

describe('cartão do Telegram: pausado e com erro', () => {
  it('pausado mostra o selo Pausado e o botão Retomar no lugar de Pausar', () => {
    const html = renderizar({ canal: { ativo: false, estado: 'pausado' } })
    expect(html).toContain('badge-aviso')
    expect(html).toContain('Pausado')
    expect(html).toMatch(/>Retomar<\/button>/)
    expect(html).not.toMatch(/>Pausar<\/button>/)
  })

  it('com erro mostra o selo, o último erro e quando aconteceu', () => {
    const html = renderizar({ canal: { estado: 'com_erro', ultimoErro: 'O Telegram recusou o token.', ultimoErroEm: '30/09/2026 13:00' } })
    expect(html).toContain('badge-perigo')
    expect(html).toContain('Com erro')
    expect(html).toContain('alerta-erro')
    expect(html).toContain('O Telegram recusou o token.')
    expect(html).toContain('30/09/2026 13:00')
  })

  it('mostra a última mensagem quando há', () => {
    const html = renderizar({ canal: { ultimaMensagemEm: '30/09/2026 14:20' } })
    expect(html).toContain('30/09/2026 14:20')
    expect(html).not.toContain('Nenhuma ainda')
  })
})

describe('desconectar com confirmação na própria tela', () => {
  it('só confirma depois do primeiro clique: o bloco de confirmação não existe no início', () => {
    const inicial = renderizar()
    expect(inicial).not.toContain('Confirmar desconexão')
    expect(inicial).not.toContain('alertdialog')
  })

  it('com a confirmação aberta, mostra o aviso, Confirmar desconexão e Cancelar', () => {
    const html = renderizar({ confirmando: true })
    expect(html).toContain('role="alertdialog"')
    expect(html).toContain('Confirmar desconexão')
    expect(html).toContain('Cancelar')
    expect(html).toMatch(/histórico/i)
  })
})

describe('acessibilidade e estilo', () => {
  it('a seção é rotulada pelo título, não há estilo inline e todo campo tem rótulo', () => {
    const html = renderizar()
    expect(html).toMatch(/<section[^>]*aria-labelledby="titulo-do-canal-telegram"/)
    expect(html).toContain('id="titulo-do-canal-telegram"')
    expect(html).not.toContain('style="')
    const campos = (html.match(/<input(?![^>]*type="hidden")[^>]*>/g) ?? []).length
    const rotulos = (html.match(/<label/g) ?? []).length
    expect(rotulos).toBeGreaterThanOrEqual(campos)
  })

  it('o CSS do cartão usa só tokens: alvo de toque de 44px, sem cor literal, e uma coluna a 375px', () => {
    const css = readFileSync('src/estilos/global.css', 'utf8')
    const regras = css.split('\n').filter((l) => l.includes('.canal-'))
    expect(regras.length).toBeGreaterThan(5)
    expect(css).toMatch(/\.canal-cartao[^{]*\{[^}]*min-height:\s*var\(--alvo-toque\)/s)
    const bloco = css.slice(css.indexOf('/* ---------- canais'))
    expect(bloco).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|rgba\(|hsl\(/)
    expect(bloco).toMatch(/@media \(max-width: 480px\)/)
  })
})
