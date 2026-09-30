/**
 * T-04.02 (FT-06, PR-61): a interface do chat embutido, renderizada no servidor
 * (o ambiente é `node`, sem DOM: a interação fica na lógica pura de
 * `embed-logica.ts`; o que se prova aqui é o que a tela mostra).
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ChatEmbutido, type ChatEmbutidoProps, type ConfiguracaoDoEmbed } from '@/componentes/ChatEmbutido'
import { AvatarDoChat } from '@/componentes/AvatarDoChat'

const configuracao: ConfiguracaoDoEmbed = {
  titulo: 'Ana da Loja',
  cor: '#2563eb',
  posicao: 'direita',
  avatar: 'iniciais',
  mensagemInicial: 'Olá! Como posso ajudar?',
  avisoDePrivacidade: { texto: 'Guardamos a conversa por 90 dias.', url: 'https://exemplo.com/privacidade' },
  sugestoes: ['Qual o horário?', 'Como troco um produto?'],
}
const html = (props: Partial<ChatEmbutidoProps> = {}, c: Partial<ConfiguracaoDoEmbed> = {}) =>
  renderToStaticMarkup(
    <ChatEmbutido agenteId="ag1" modo="publico" configuracao={{ ...configuracao, ...c }} {...props} />,
  )

describe('estado inicial', () => {
  const saida = html({ aoFechar: () => undefined })

  it('cabeçalho com avatar (iniciais) e título em h1', () => {
    expect(saida).toMatch(/<h1>Ana da Loja<\/h1>/)
    expect(saida).toContain('avatar-do-chat')
    expect(saida).toMatch(/<span class="avatar-do-chat"[^>]*aria-hidden="true"[^>]*>AL<\/span>/)
  })

  it('mensagem inicial do agente como primeira bolha', () => {
    expect(saida).toContain('bolha-agente')
    expect(saida).toContain('Olá! Como posso ajudar?')
  })

  it('sugestões como botões, dentro de um grupo rotulado', () => {
    expect(saida).toMatch(/role="group"[^>]*aria-label="Perguntas sugeridas"/)
    expect(saida).toMatch(/<button[^>]*type="button"[^>]*class="embed-sugestao"[^>]*>Qual o horário\?<\/button>/)
    expect(saida).toContain('Como troco um produto?')
  })

  it('campo rotulado, limite de 1000 e enviar desabilitado até haver texto', () => {
    expect(saida).toMatch(/<label[^>]*class="somente-leitor"[^>]*>Sua mensagem<\/label>/)
    expect(saida).toMatch(/<textarea[^>]*name="mensagem"/)
    expect(saida).toContain('maxLength="1000"')
    expect(saida).toMatch(/<button[^>]*type="submit"[^>]*aria-label="Enviar mensagem"[^>]*disabled=""/)
  })

  it('aviso de privacidade no rodapé, com link que abre fora sem vazar a origem', () => {
    expect(saida).toContain('Guardamos a conversa por 90 dias.')
    expect(saida).toMatch(/<a href="https:\/\/exemplo\.com\/privacidade" target="_blank" rel="noopener noreferrer">Saiba mais<\/a>/)
  })

  it('a região das mensagens é um log rolável por teclado, e o botão fechar e nova conversa têm nome', () => {
    expect(saida).toMatch(/role="log"/)
    expect(saida).toContain('tabindex="0"')
    expect(saida).toMatch(/aria-label="Fechar o chat"/)
    expect(saida).toMatch(/<button[^>]*disabled=""[^>]*aria-label="Nova conversa"/)
  })

  it('não mostra erro, contador nem selo de prévia', () => {
    expect(saida).not.toContain('role="alert"')
    expect(saida).not.toContain('de 1000 caracteres')
    expect(saida).not.toContain('Prévia')
  })
})

describe('o que some quando não há configuração', () => {
  it('sem aviso e sem sugestões esses blocos não aparecem', () => {
    const saida = html({}, { avisoDePrivacidade: null, sugestoes: [] })
    expect(saida).not.toContain('embed-aviso')
    expect(saida).not.toContain('embed-sugestoes')
  })

  it('sem mensagem inicial não desenha a bolha', () => {
    expect(html({}, { mensagemInicial: '' })).not.toContain('bolha-agente')
  })

  it('aviso sem link não desenha o link', () => {
    const saida = html({}, { avisoDePrivacidade: { texto: 'Só texto.', url: null } })
    expect(saida).toContain('Só texto.')
    expect(saida).not.toContain('Saiba mais')
  })

  it('sem aoFechar não há botão de fechar (a página aberta direto não se fecha)', () => {
    expect(html()).not.toContain('Fechar o chat')
  })
})

describe('cor do agente e modo', () => {
  it('a cor e o texto sobre ela entram como variáveis de CSS, escolhidos por luminância', () => {
    expect(html()).toContain('--cor-do-agente:#2563eb')
    expect(html()).toContain('--cor-do-agente-fg:var(--fg-em-cor-escura)')
    expect(html({}, { cor: '#ffeb3b' })).toContain('--cor-do-agente-fg:var(--fg-em-cor-clara)')
  })

  it('cor inválida nunca vira CSS solto', () => {
    const saida = html({}, { cor: 'red;background:url(x)' })
    expect(saida).not.toContain('url(x)')
    expect(saida).toMatch(/--cor-do-agente:#[0-9a-f]{6}/)
  })

  it('a prévia mostra o selo e o modo no contêiner', () => {
    const saida = html({ modo: 'previa' })
    expect(saida).toContain('Prévia')
    expect(saida).toContain('data-modo="previa"')
    expect(html()).toContain('data-modo="publico"')
  })
})

describe('texto de origem não confiável', () => {
  it('título com HTML é escapado', () => {
    const saida = html({}, { titulo: '<script>alert(1)</script>' })
    expect(saida).not.toContain('<script>alert')
    expect(saida).toContain('&lt;script&gt;')
  })

  it('a mensagem inicial passa pelo renderizador seguro: link http(s) sim, javascript: não', () => {
    const bom = html({}, { mensagemInicial: 'Veja [o site](https://exemplo.com).' })
    expect(bom).toContain('href="https://exemplo.com/"')
    const ruim = html({}, { mensagemInicial: 'Clique [aqui](javascript:alert(1)).' })
    expect(ruim).not.toContain('href="javascript:')
  })

  it('o arquivo do componente não usa dangerouslySetInnerHTML', () => {
    for (const f of ['ChatEmbutido.tsx', 'AvatarDoChat.tsx']) {
      expect(readFileSync(path.join(process.cwd(), 'src/componentes', f), 'utf8')).not.toContain('dangerouslySetInnerHTML')
    }
  })
})

describe('AvatarDoChat', () => {
  it.each(['chat', 'robo', 'estrela', 'fone'] as const)('o avatar %s é um ícone SVG decorativo', (avatar) => {
    const saida = renderToStaticMarkup(<AvatarDoChat avatar={avatar} titulo="Ana" />)
    expect(saida).toContain('<svg')
    expect(saida).toContain('aria-hidden="true"')
    expect(saida).not.toContain('>A<')
  })

  it('as iniciais usam as duas primeiras palavras do título', () => {
    expect(renderToStaticMarkup(<AvatarDoChat avatar="iniciais" titulo="Atendimento Loja Exemplo" />)).toContain('>AE<')
  })
})

describe('estilos', () => {
  const css = readFileSync(path.join(process.cwd(), 'src/estilos/global.css'), 'utf8')
  it('há estilos do embed, com foco, movimento reduzido e 375px, só com tokens', () => {
    expect(css).toContain('.embed {')
    expect(css).toContain('.embed-enviar')
    expect(css).toMatch(/@media \(max-width: 480px\)[^}]*\{[^}]*\.embed/s)
    expect(css).toMatch(/prefers-reduced-motion[^}]*\{[^}]*\.embed|\.embed[^}]*prefers-reduced-motion/s)
    expect(css).toContain('var(--cor-do-agente)')
    expect(css).toContain('var(--cor-do-agente-fg)')
  })
})
