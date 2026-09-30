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
