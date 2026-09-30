/**
 * Fontes da resposta na aba Testar (FT-05, PR-53, PR-23): a lógica pura, o
 * componente e o chat com a conversa retomada. Sem navegador: markup estático.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChatDeTeste } from '@/componentes/ChatDeTeste'
import { FontesDaResposta } from '@/componentes/FontesDaResposta'
import {
  alternarAberta,
  fonteDoNumero,
  idDoChip,
  numerosDeReferencia,
  resumoDasConsultadas,
  separarFontes,
} from '@/componentes/fontes-da-resposta-logica'
import type { FonteDaResposta } from '@/componentes/leitor-de-sse'

const FONTES: FonteDaResposta[] = [
  { fonteId: 'fA', titulo: 'Política de troca', citada: true, trechos: [{ n: 1, posicao: 2, trechoTexto: 'Troca em sete dias.' }, { n: 3, posicao: 3, trechoTexto: 'Sem uso.' }] },
  { fonteId: 'fB', titulo: 'Entrega <b>', citada: false, trechos: [{ n: 2, posicao: 1, trechoTexto: 'Frete grátis.' }] },
]

describe('lógica das fontes', () => {
  it('separa citadas e consultadas mantendo a ordem', () => {
    const { citadas, consultadas } = separarFontes(FONTES)
    expect(citadas.map((f) => f.fonteId)).toEqual(['fA'])
    expect(consultadas.map((f) => f.fonteId)).toEqual(['fB'])
  })

  it('os números de referência são os de todos os trechos, e o número acha a fonte', () => {
    expect(numerosDeReferencia(FONTES)).toEqual([1, 3, 2])
    expect(fonteDoNumero(FONTES, 3)).toBe('fA')
    expect(fonteDoNumero(FONTES, 2)).toBe('fB')
    expect(fonteDoNumero(FONTES, 9)).toBeUndefined()
  })

  it('alternar abre e fecha sem repetir', () => {
    expect(alternarAberta([], 'fA')).toEqual(['fA'])
    expect(alternarAberta(['fA', 'fB'], 'fA')).toEqual(['fB'])
  })

  it('o rótulo das consultadas conta quantas são', () => {
    expect(resumoDasConsultadas(1)).toBe('Consultada, sem citação (1)')
    expect(resumoDasConsultadas(3)).toBe('Consultadas, sem citação (3)')
  })

  it('o id do chip é estável por mensagem e fonte', () => {
    expect(idDoChip('m1', 'fA')).toBe('m1-fonte-fA')
  })
})

const html = (abertas: string[] = [], fontes = FONTES) =>
  renderToStaticMarkup(<FontesDaResposta fontes={fontes} idBase="m1" abertas={abertas} aoAlternar={() => undefined} />)

describe('FontesDaResposta', () => {
  it('mostra a região Fontes com o chip citado em destaque e o título escapado', () => {
    const saida = html()
    expect(saida).toContain('aria-label="Fontes da resposta"')
    expect(saida).toMatch(/<p class="fontes-titulo">Fontes<\/p>/)
    expect(saida).toMatch(/<button[^>]*class="chip-de-fonte chip-de-fonte-citada"[^>]*>/)
    expect(saida).toContain('Política de troca')
    expect(saida).toContain('[1]')
    expect(saida).toContain('[3]')
    expect(saida).toContain('(citada na resposta)')
    expect(saida).not.toContain('<b>')
    expect(saida).toContain('Entrega &lt;b&gt;')
  })

  it('as apenas consultadas ficam numa seção recolhida (details fechado)', () => {
    const saida = html()
    expect(saida).toMatch(/<details class="fontes-consultadas">/)
    expect(saida).not.toMatch(/<details[^>]* open/)
    expect(saida).toContain('Consultada, sem citação (1)')
    const aposDetails = saida.slice(saida.indexOf('<details'))
    expect(aposDetails).toContain('Entrega')
    expect(saida.slice(0, saida.indexOf('<details'))).not.toContain('Entrega')
  })

  it('o chip é um botão com aria-expanded, e o trecho só aparece expandido', () => {
    const fechado = html()
    expect(fechado).toMatch(/aria-expanded="false"/)
    expect(fechado).not.toContain('Troca em sete dias.')

    const aberto = html(['fA'])
    expect(aberto).toMatch(/id="m1-fonte-fA"[^>]*aria-expanded="true"|aria-expanded="true"[^>]*id="m1-fonte-fA"/)
    expect(aberto).toContain('Troca em sete dias.')
    expect(aberto).toContain('Sem uso.')
    expect(aberto).toContain('Trecho 2')
    expect(aberto).toContain('Trecho 3')
    expect(aberto).toContain('aria-controls="m1-fonte-fA-trechos"')
    expect(aberto).toContain('id="m1-fonte-fA-trechos"')
  })

  it('sem nenhuma citada não desenha a lista de citadas, só a seção recolhida', () => {
    const saida = html([], [{ ...FONTES[1]! }])
    expect(saida).not.toContain('chip-de-fonte-citada')
    expect(saida).toContain('<details')
  })

  it('sem fontes não desenha nada', () => {
    expect(html([], [])).toBe('')
  })
})

describe('ChatDeTeste com a conversa retomada trazendo fontes', () => {
  const props = {
    agente: { id: 'ag1', nome: 'Ana', mensagemInicial: '' },
    temChave: true,
    ehAdmin: false,
    retomada: {
      conversaId: 'c1',
      mensagens: [
        { id: 'm1', papel: 'user' as const, conteudo: 'Qual o prazo de troca?' },
        { id: 'm2', papel: 'assistant' as const, conteudo: 'São sete dias [1], sem uso [3], e [9] não existe.', fontes: FONTES },
      ],
    },
  }
  const saida = renderToStaticMarkup(<ChatDeTeste {...props} />)

  it('o texto da resposta tem as referências [1] e [3] como botões e deixa [9] como texto', () => {
    expect(saida).toContain('data-referencia="1"')
    expect(saida).toContain('data-referencia="3"')
    expect(saida).not.toContain('data-referencia="9"')
    expect(saida).toContain('[9] não existe')
  })

  it('as fontes aparecem abaixo da resposta, dentro da bolha do agente', () => {
    expect(saida).toContain('fontes-da-resposta')
    expect(saida.indexOf('São sete dias')).toBeLessThan(saida.indexOf('fontes-da-resposta'))
  })

  it('a mensagem do usuário não tem fontes', () => {
    const doUsuario = saida.slice(saida.indexOf('Qual o prazo de troca?'), saida.indexOf('São sete dias'))
    expect(doUsuario).not.toContain('fontes-da-resposta')
  })

  it('sem fontes a conversa retomada é igual à da FT-03', () => {
    const sem = renderToStaticMarkup(
      <ChatDeTeste {...props} retomada={{ conversaId: 'c1', mensagens: [{ id: 'm2', papel: 'assistant', conteudo: 'Oi [1]' }] }} />,
    )
    expect(sem).not.toContain('fontes-da-resposta')
    expect(sem).not.toContain('referencia-de-fonte')
  })
})
