import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { ChatDeTeste, type ChatDeTesteProps } from '@/componentes/ChatDeTeste'

const base: ChatDeTesteProps = {
  agente: { id: 'ag1', nome: 'Ana da Loja', mensagemInicial: 'Olá! Como posso ajudar?' },
  temChave: true,
  ehAdmin: false,
}
const html = (props: Partial<ChatDeTesteProps> = {}) =>
  renderToStaticMarkup(<ChatDeTeste {...base} {...props} />)

describe('estado vazio', () => {
  const saida = html()

  it('traz a mensagem inicial do agente como primeira bolha e a sugestão', () => {
    expect(saida).toContain('bolha-agente')
    expect(saida).toContain('Olá! Como posso ajudar?')
    expect(saida).toContain('Faça uma pergunta')
    expect(saida.indexOf('Olá! Como posso ajudar?')).toBeLessThan(saida.indexOf('Faça uma pergunta'))
  })

  it('o campo é rotulado, o envio tem botão Enviar e o foco pode ir ao campo', () => {
    expect(saida).toMatch(/<label[^>]*class="somente-leitor"[^>]*>Mensagem para o agente<\/label>/)
    expect(saida).toMatch(/<textarea[^>]*name="mensagem"/)
    expect(saida).toContain('maxLength="4000"')
    expect(saida).toMatch(/<button[^>]*type="submit"[^>]*>.*Enviar<\/button>/)
    expect(saida).toContain('Enter envia, Shift+Enter quebra a linha')
  })

  it('a região da conversa é um log com aria-live polite, rolável por teclado', () => {
    expect(saida).toMatch(/role="log"/)
    expect(saida).toContain('aria-live="polite"')
    expect(saida).toContain('tabindex="0"')
  })

  it('o botão Enviar começa desabilitado e Nova conversa também (nada a recomeçar)', () => {
    expect(saida).toMatch(/<button[^>]*type="submit"[^>]*disabled/)
    expect(saida).toMatch(/<button[^>]*disabled[^>]*>Nova conversa<\/button>/)
  })

  it('não mostra Parar, contador nem erro', () => {
    expect(saida).not.toContain('Parar')
    expect(saida).not.toContain('de 4000 caracteres')
    expect(saida).not.toContain('role="alert"')
  })

  it('sem mensagem inicial não desenha a bolha', () => {
    const sem = html({ agente: { ...base.agente, mensagemInicial: '' } })
    expect(sem).not.toContain('bolha-agente')
  })
})

describe('conversa retomada', () => {
  const saida = html({
    retomada: {
      conversaId: 'c1',
      mensagens: [
        { id: 'm1', papel: 'user', conteudo: 'Qual o horário?' },
        { id: 'm2', papel: 'assistant', conteudo: 'Abrimos **às 9h**.\n\n- segunda a sexta' },
      ],
    },
  })

  it('mostra as bolhas na ordem, a do usuário à direita e a do agente à esquerda', () => {
    const inicial = saida.indexOf('Olá! Como posso ajudar?')
    const usuario = saida.indexOf('Qual o horário?')
    const agente = saida.indexOf('Abrimos')
    expect(inicial).toBeLessThan(usuario)
    expect(usuario).toBeLessThan(agente)
    expect(saida).toContain('chat-linha-usuario')
    expect(saida).toContain('chat-linha-agente')
  })

  it('a resposta do agente passa pelo renderizador seguro', () => {
    expect(saida).toContain('<strong>às 9h</strong>')
    expect(saida).toContain('<ul><li>segunda a sexta</li></ul>')
  })

  it('a sugestão de estado vazio some e Nova conversa fica habilitada', () => {
    expect(saida).not.toContain('Faça uma pergunta')
    expect(saida).not.toMatch(/<button[^>]*disabled[^>]*>Nova conversa<\/button>/)
  })

  it('cada bolha tem nome acessível de quem fala', () => {
    expect(saida).toContain('Você: ')
    expect(saida).toContain('Ana da Loja: ')
  })

  it('o texto do usuário é escapado', () => {
    const perigoso = html({
      retomada: {
        conversaId: 'c2',
        mensagens: [{ id: 'm', papel: 'user', conteudo: '<img src=x onerror=alert(1)>' }],
      },
    })
    expect(perigoso).not.toContain('<img')
    expect(perigoso).toContain('&lt;img')
  })
})

describe('sem chave do OpenRouter', () => {
  it('avisa antes de enviar; admin ganha o link para Integrações', () => {
    const admin = html({ temChave: false, ehAdmin: true })
    expect(admin).toContain('não consegue responder')
    expect(admin).toContain('href="/configuracoes/integracoes"')
    const comum = html({ temChave: false, ehAdmin: false })
    expect(comum).toContain('Peça a um administrador')
    expect(comum).not.toContain('href="/configuracoes/integracoes"')
  })

  it('com chave não há aviso', () => {
    expect(html()).not.toContain('não consegue responder')
  })
})

describe('regras de código', () => {
  const arquivos = (pasta: string): string[] =>
    readdirSync(pasta).flatMap((nome) => {
      const caminho = path.join(pasta, nome)
      if (nome === 'gerado') return []
      return statSync(caminho).isDirectory() ? arquivos(caminho) : /\.(ts|tsx)$/.test(nome) ? [caminho] : []
    })

  it('só componente cliente de src/componentes faz fetch para /api (ChatDeTeste e, desde a FT-04, o painel de conhecimento)', () => {
    const usam = arquivos(path.join(process.cwd(), 'src')).filter((f) =>
      /fetch\s*\(\s*[`'"]\/api/.test(readFileSync(f, 'utf8')),
    )
    expect(usam.map((f) => path.basename(f))).toContain('ChatDeTeste.tsx')
    for (const f of usam) {
      expect(path.relative(process.cwd(), f).startsWith('src/componentes/'), f).toBe(true)
      expect(readFileSync(f, 'utf8').trimStart().startsWith("'use client'"), f).toBe(true)
    }
  })

  it('o componente não usa dangerouslySetInnerHTML nem cor literal', () => {
    const fonte = readFileSync('src/componentes/ChatDeTeste.tsx', 'utf8')
    expect(fonte).not.toContain('dangerouslySetInnerHTML')
    expect(fonte).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/)
  })
})
