/**
 * FT-06, aba Publicar (PR-55, PR-62): o que a tela mostra, renderizada no
 * servidor (o ambiente é `node`; a interação fica na lógica pura). Criado na
 * T-06.01 com o formulário e ampliado na T-06.02 com o código, a prévia e os avisos.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { FormularioDoChat, type ConfiguracaoDoFormulario } from '@/componentes/FormularioDoChat'
import { AMOSTRAS_DE_COR } from '@/lib/cor'
import { CodigoParaIncorporar } from '@/componentes/CodigoParaIncorporar'
import { PainelDePublicacao } from '@/componentes/PainelDePublicacao'
import { PreviaDoChat } from '@/componentes/PreviaDoChat'
import { avisosDaPublicacao, montarSnippet } from '@/componentes/publicar-logica'

const configuracao: ConfiguracaoDoFormulario = {
  ativo: true,
  titulo: 'Fale com a Ana',
  cor: '#2563eb',
  posicao: 'esquerda',
  avatar: 'robo',
  avisoDePrivacidade: 'Guardamos a conversa por 90 dias.',
  avisoDePrivacidadeUrl: 'https://exemplo.com/privacidade',
  dominiosPermitidos: ['exemplo.com', '*.parceiro.com'],
  limiteDiario: 250,
  sugestoes: ['Qual o horário?', 'Como troco um produto?'],
}
const form = (c: Partial<ConfiguracaoDoFormulario> = {}) =>
  renderToStaticMarkup(
    <FormularioDoChat acao={async () => ({})} agente={{ id: 'ag1', nome: 'Assistente da Loja' }} configuracao={{ ...configuracao, ...c }} />,
  )

/** A tag <input> com o name (e, nos radios, o value) dados, sem depender da ordem dos atributos. */
function entrada(html: string, nome: string, valor?: string): string {
  const tags = html.match(/<input[^>]*>/g) ?? []
  const achada = tags.find((t) => t.includes(`name="${nome}"`) && (valor === undefined || t.includes(`value="${valor}"`)))
  if (!achada) throw new Error(`input ${nome}${valor ? `=${valor}` : ''} não encontrado`)
  return achada
}

describe('FormularioDoChat', () => {
  const saida = form()

  it('leva o id do agente escondido e o botão de salvar', () => {
    expect(saida).toMatch(/<input type="hidden" name="id" value="ag1"/)
    expect(saida).toContain('Salvar configuração do chat')
  })

  it('a chave Publicar chat é um switch marcado conforme a configuração', () => {
    const chave = entrada(saida, 'ativo')
    expect(chave).toContain('type="checkbox"')
    expect(chave).toContain('role="switch"')
    expect(chave).toContain('checked=""')
    expect(saida).toContain('Publicar chat')
    expect(entrada(form({ ativo: false }), 'ativo')).not.toContain('checked=""')
  })

  it('todos os campos existem, com o valor gravado', () => {
    expect(entrada(saida, 'titulo')).toContain('value="Fale com a Ana"')
    expect(entrada(saida, 'cor')).toContain('value="#2563eb"')
    expect(entrada(saida, 'limiteDiario')).toContain('value="250"')
    expect(saida).toContain('Guardamos a conversa por 90 dias.')
    expect(saida).toContain('https://exemplo.com/privacidade')
    expect(saida).toContain('exemplo.com\n*.parceiro.com')
    expect(saida).toContain('Qual o horário?\nComo troco um produto?')
  })

  it('a posição e o avatar gravados vêm marcados; cada avatar tem nome acessível', () => {
    expect(entrada(saida, 'posicao', 'esquerda')).toContain('checked=""')
    expect(entrada(saida, 'posicao', 'direita')).not.toContain('checked=""')
    expect(entrada(saida, 'avatar', 'robo')).toContain('checked=""')
    expect(entrada(saida, 'avatar', 'chat')).not.toContain('checked=""')
    for (const nome of ['Iniciais do nome', 'Balão de conversa', 'Robô', 'Estrela', 'Fone de atendimento']) {
      expect(saida).toContain(nome)
    }
  })

  it('oferece as amostras de cor com nome e o seletor do navegador', () => {
    for (const a of AMOSTRAS_DE_COR) expect(saida).toContain(`aria-label="${a.nome}"`)
    expect(saida).toMatch(/type="color"/)
    expect(saida).toContain('Texto do botão')
  })

  it('a ajuda dos domínios explica curinga, localhost e lista vazia', () => {
    expect(saida).toContain('*.seusite.com.br')
    expect(saida).toContain('localhost:3000')
    expect(saida).toMatch(/Vazio libera\s+qualquer site/)
  })

  it('cor quase branca mostra o aviso de baixo contraste; cor boa, não', () => {
    expect(form({ cor: '#fafafa' })).toMatch(/pouco contraste/)
    expect(saida).not.toMatch(/pouco contraste/)
  })

  it('cor inválida mostra o erro no próprio campo', () => {
    expect(form({ cor: 'azul' })).toContain('no formato #rrggbb.')
    expect(form({ cor: 'azul' })).toMatch(/aria-invalid="true"/)
  })

  it('domínio inválido é apontado na hora, e a lista válida não mostra erro', () => {
    expect(form({ dominiosPermitidos: ['exemplo.com', 'nao valido'] })).toContain('Domínio inválido: nao valido.')
    expect(saida).not.toContain('Domínio inválido')
  })

  it('todo campo tem rótulo: cada input visível está dentro de label ou tem aria-label', () => {
    const semRotulo = (saida.match(/<input(?![^>]*type="hidden")[^>]*>/g) ?? []).length
    const rotulos = (saida.match(/<label/g) ?? []).length + (saida.match(/<input[^>]*aria-label=/g) ?? []).length
    expect(rotulos).toBeGreaterThanOrEqual(semRotulo - 1)
  })

  it('o código do componente não usa cor literal nem dangerouslySetInnerHTML', () => {
    const fonte = readFileSync(path.join(process.cwd(), 'src/componentes/FormularioDoChat.tsx'), 'utf8')
    expect(fonte).not.toContain('dangerouslySetInnerHTML')
    expect(fonte).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

const snippet = montarSnippet('https://converse.exemplo.com.br', 'ag1')

describe('CodigoParaIncorporar', () => {
  const saida = renderToStaticMarkup(<CodigoParaIncorporar snippet={snippet} />)

  it('mostra o trecho de uma linha, escapado, com o id do agente', () => {
    expect(saida).toContain('&lt;script src=&quot;https://converse.exemplo.com.br/widget.js&quot; data-agent=&quot;ag1&quot; async&gt;&lt;/script&gt;')
    expect(saida).not.toContain('<script src=')
  })

  it('tem o botão Copiar código e uma região de status para o resultado', () => {
    expect(saida).toMatch(/<button[^>]*type="button"[^>]*>Copiar código<\/button>/)
    expect(saida).toMatch(/role="status"[^>]*aria-live="polite"/)
  })

  it('o bloco de código é focável e nomeado (para copiar com o teclado)', () => {
    expect(saida).toMatch(/<pre[^>]*tabindex="0"[^>]*aria-label="Código para colar no site"|<pre[^>]*aria-label="Código para colar no site"[^>]*tabindex="0"/)
  })

  it('traz as instruções curtas: antes de </body>, HTTPS em produção e atributos opcionais', () => {
    expect(saida).toContain('logo antes de <code>&lt;/body&gt;</code>')
    expect(saida).toContain('HTTPS')
    expect(saida).toContain('data-position')
    expect(saida).toContain('data-color')
  })
})

describe('PreviaDoChat', () => {
  const saida = renderToStaticMarkup(<PreviaDoChat agenteId="ag1" versao="v1" />)

  it('é um iframe da própria plataforma no modo prévia, com título', () => {
    expect(saida).toMatch(/<iframe[^>]*src="\/embed\/ag1\?previa=1"/)
    expect(saida).toMatch(/title="Pré-visualização do chat"/)
  })

  it('explica que as mensagens da prévia não contam no limite diário', () => {
    expect(saida).toContain('não contam no limite')
  })

  it('o id do agente vai codificado na URL', () => {
    expect(renderToStaticMarkup(<PreviaDoChat agenteId="a b/c" versao="v1" />)).toContain('/embed/a%20b%2Fc?previa=1')
  })
})

describe('PainelDePublicacao', () => {
  const avisos = avisosDaPublicacao({
    ativo: false,
    temChave: false,
    fontesProntas: 0,
    confiarNoProxy: false,
    origem: 'http://converse.exemplo.com.br',
  })
  const painel = renderToStaticMarkup(
    <PainelDePublicacao
      acao={async () => ({})}
      agente={{ id: 'ag1', nome: 'Assistente da Loja' }}
      configuracao={configuracao}
      versao="v1"
      snippet={snippet}
      avisos={avisos}
    />,
  )

  it('junta formulário, código, prévia e avisos', () => {
    expect(painel).toContain('Salvar configuração do chat')
    expect(painel).toContain('Código para incorporar')
    expect(painel).toContain('Pré-visualização')
    expect(painel).toContain('publicar-grade')
  })

  it('mostra os avisos de chave, fonte, proxy, HTTPS e chat desligado', () => {
    expect(painel).toContain('mensagem genérica')
    expect(painel).toContain('só com as instruções')
    expect(painel).toContain('TRUST_PROXY=1')
    expect(painel).toContain('HTTPS')
    expect(painel).toContain('desligado')
  })

  it('sem avisos não desenha a área de avisos', () => {
    const limpo = renderToStaticMarkup(
      <PainelDePublicacao
        acao={async () => ({})}
        agente={{ id: 'ag1', nome: 'A' }}
        configuracao={configuracao}
        versao="v1"
        snippet={snippet}
        avisos={[]}
      />,
    )
    expect(limpo).not.toContain('avisos-da-publicacao')
  })
})

describe('estilos da aba Publicar', () => {
  const css = readFileSync(path.join(process.cwd(), 'src/estilos/global.css'), 'utf8')
  it('a grade vira uma coluna em tela estreita e há estilo para cada peça', () => {
    expect(css).toMatch(/@media \(max-width: 1000px\)\s*\{\s*\.publicar-grade \{ grid-template-columns: minmax\(0, 1fr\)/)
    for (const classe of ['.amostra', '.codigo-bloco', '.previa-do-chat', '.campo-chave', '.campo-radio']) {
      expect(css, classe).toContain(classe)
    }
  })
})
