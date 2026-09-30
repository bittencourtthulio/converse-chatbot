import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CartoesDeResumo } from '@/componentes/CartoesDeResumo'
import { ListaDeTrechos } from '@/componentes/ListaDeTrechos'
import type { FonteVisivel, PaginaDeTrechos } from '@/servicos/fontes'

const fonte = (extra: Partial<FonteVisivel> = {}): FonteVisivel => ({
  id: 'f1',
  agenteId: 'a1',
  tipo: 'arquivo',
  titulo: 'Manual do produto.pdf',
  nomeOriginal: 'Manual do produto.pdf',
  tipoMime: 'application/pdf',
  tamanhoBytes: 2048,
  status: 'pronto',
  mensagemErro: null,
  totalTrechos: 2,
  caracteres: 1800,
  criadoEm: new Date('2026-09-30T15:00:00Z'),
  atualizadoEm: new Date('2026-09-30T15:00:00Z'),
  processadoEm: new Date('2026-09-30T15:01:00Z'),
  ...extra,
})

const pagina = (extra: Partial<PaginaDeTrechos> = {}): PaginaDeTrechos => ({
  fonte: fonte(),
  trechos: [
    { id: 't0', indice: 0, texto: 'Primeiro trecho do manual.', caracteres: 26 },
    { id: 't1', indice: 1, texto: 'Segundo trecho.', caracteres: 15 },
  ],
  pagina: 1,
  porPagina: 20,
  totalPaginas: 1,
  totalTrechos: 2,
  ...extra,
})

describe('CartoesDeResumo', () => {
  it('mostra fontes, prontas e caracteres com separador de milhares', () => {
    const html = renderToStaticMarkup(
      <CartoesDeResumo resumo={{ total: 12, prontas: 9, emProcessamento: 2, comErro: 1, caracteres: 1234567 }} />,
    )
    expect(html).toContain('aria-label="Resumo da base"')
    for (const esperado of ['Fontes', '12', 'Prontas', '9', 'Caracteres', '1.234.567']) {
      expect(html).toContain(esperado)
    }
    expect(html).toMatch(/2 em processamento/)
    expect(html).toMatch(/1 com erro/)
  })

  it('base vazia mostra zeros e nenhuma nota de situação', () => {
    const html = renderToStaticMarkup(
      <CartoesDeResumo resumo={{ total: 0, prontas: 0, emProcessamento: 0, comErro: 0, caracteres: 0 }} />,
    )
    expect(html).not.toMatch(/em processamento|com erro/)
    expect(html).toContain('>0<')
  })
})

describe('ListaDeTrechos', () => {
  it('mostra o título da fonte, o status e os trechos numerados como texto', () => {
    const html = renderToStaticMarkup(<ListaDeTrechos dados={pagina()} voltarPara="/agentes/a1/conhecimento" />)
    expect(html).toContain('Manual do produto.pdf')
    expect(html).toContain('Pronto')
    expect(html).toContain('Primeiro trecho do manual.')
    expect(html).toContain('Trecho 1')
    expect(html).toContain('Trecho 2')
    expect(html).toContain('href="/agentes/a1/conhecimento"')
  })

  it('um trecho com <script> aparece escapado como texto', () => {
    const html = renderToStaticMarkup(
      <ListaDeTrechos
        dados={pagina({ trechos: [{ id: 'x', indice: 0, texto: '<script>alert(1)</script> & "aspas"', caracteres: 34 }] })}
        voltarPara="/x"
      />,
    )
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('dangerouslySetInnerHTML')
  })

  it('na página 2 de 3 mostra Anterior, Próxima e o total de páginas', () => {
    const html = renderToStaticMarkup(
      <ListaDeTrechos
        dados={pagina({
          pagina: 2,
          totalPaginas: 3,
          totalTrechos: 45,
          trechos: [{ id: 'a', indice: 20, texto: 'meio', caracteres: 4 }],
        })}
        voltarPara="/x"
        caminhoDaPagina="/agentes/a1/conhecimento/f1"
      />,
    )
    expect(html).toContain('Página 2 de 3')
    expect(html).toMatch(/href="\/agentes\/a1\/conhecimento\/f1\?pagina=1"[^>]*>[^<]*Anterior/)
    expect(html).toMatch(/href="\/agentes\/a1\/conhecimento\/f1\?pagina=3"[^>]*>[^<]*Próxima/)
    expect(html).toContain('Trecho 21')
  })

  it('na primeira página o Anterior não é link, e numa página só não há paginação', () => {
    const primeira = renderToStaticMarkup(
      <ListaDeTrechos dados={pagina({ totalPaginas: 2, totalTrechos: 25 })} voltarPara="/x" caminhoDaPagina="/p" />,
    )
    expect(primeira).toMatch(/aria-disabled="true"[^>]*>[^<]*Anterior/)
    expect(primeira).toContain('?pagina=2')
    const unica = renderToStaticMarkup(<ListaDeTrechos dados={pagina()} voltarPara="/x" />)
    expect(unica).not.toContain('Paginação dos trechos')
  })

  it('fonte sem trechos mostra o estado vazio e, em erro, o motivo', () => {
    const erro = renderToStaticMarkup(
      <ListaDeTrechos
        dados={pagina({
          fonte: fonte({ status: 'erro', mensagemErro: 'Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado.', totalTrechos: 0 }),
          trechos: [],
          totalTrechos: 0,
        })}
        voltarPara="/x"
      />,
    )
    expect(erro).toContain('Este PDF não tem texto selecionável')
    expect(erro).toContain('role="alert"')
    expect(erro).toContain('Nenhum trecho')

    const processando = renderToStaticMarkup(
      <ListaDeTrechos dados={pagina({ fonte: fonte({ status: 'processando', totalTrechos: 0 }), trechos: [], totalTrechos: 0 })} voltarPara="/x" />,
    )
    expect(processando).toMatch(/ainda está sendo processada|Ainda em processamento/i)
  })
})
