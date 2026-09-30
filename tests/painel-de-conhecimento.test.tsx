import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PainelDeConhecimento } from '@/componentes/PainelDeConhecimento'
import { LinhaDeFonte } from '@/componentes/LinhaDeFonte'
import { BotaoExcluirFonte, proximoEstadoDaExclusaoDeFonte } from '@/componentes/BotaoExcluirFonte'
import { serializarFonte, type FonteDaTela } from '@/componentes/fonte-da-tela'
import type { FonteVisivel } from '@/servicos/fontes'

const fonte = (extra: Partial<FonteDaTela> = {}): FonteDaTela => ({
  id: 'f1',
  agenteId: 'a1',
  tipo: 'arquivo',
  titulo: 'Manual.pdf',
  nomeOriginal: 'Manual.pdf',
  tipoMime: 'application/pdf',
  tamanhoBytes: 1536,
  status: 'pronto',
  mensagemErro: null,
  totalTrechos: 3,
  caracteres: 2100,
  criadoEm: '2026-09-30T15:00:00.000Z',
  atualizadoEm: '2026-09-30T15:00:00.000Z',
  processadoEm: '2026-09-30T15:01:00.000Z',
  ...extra,
})

const RESUMO = { total: 4, prontas: 1, emProcessamento: 2, comErro: 1, caracteres: 2100 }

const painel = (fontes: FonteDaTela[], resumo = RESUMO) =>
  renderToStaticMarkup(
    <PainelDeConhecimento agenteId="a1" fontesIniciais={fontes} resumoInicial={resumo} limiteDeUploadBytes={25 * 1024 * 1024} />,
  )

describe('serializarFonte', () => {
  it('troca as datas por texto ISO, para a fonte cruzar do servidor para o navegador', () => {
    const visivel: FonteVisivel = {
      ...fonte(),
      criadoEm: new Date('2026-09-30T15:00:00Z'),
      atualizadoEm: new Date('2026-09-30T15:00:00Z'),
      processadoEm: null,
    }
    const tela = serializarFonte(visivel)
    expect(tela.criadoEm).toBe('2026-09-30T15:00:00.000Z')
    expect(tela.processadoEm).toBeNull()
    expect(JSON.parse(JSON.stringify(tela))).toEqual(tela)
  })
})

describe('linha de fonte', () => {
  it('mostra título, tamanho, data, ícone do tipo e o link Ver conteúdo', () => {
    const html = renderToStaticMarkup(<LinhaDeFonte fonte={fonte()} aoMudar={() => undefined} aoExcluir={() => undefined} />)
    expect(html).toContain('Manual.pdf')
    expect(html).toContain('1,5 KB')
    expect(html).toMatch(/30\/09\/2026.*12:00/)
    expect(html).toContain('href="/agentes/a1/conhecimento/f1"')
    expect(html).toContain('Ver conteúdo')
    expect(html).toContain('<svg')
  })

  it('cada status tem rótulo em texto, e só processando tem spinner', () => {
    const de = (status: string) =>
      renderToStaticMarkup(<LinhaDeFonte fonte={fonte({ status })} aoMudar={() => undefined} aoExcluir={() => undefined} />)
    expect(de('pendente')).toContain('Na fila')
    expect(de('pronto')).toContain('Pronto')
    const processando = de('processando')
    expect(processando).toContain('Processando')
    expect(processando).toContain('spinner')
    expect(de('pronto')).not.toContain('spinner')
    expect(de('pendente')).not.toContain('spinner')
  })

  it('em erro mostra o motivo e o botão Reprocessar; nos outros estados, não', () => {
    const erro = renderToStaticMarkup(
      <LinhaDeFonte
        fonte={fonte({ status: 'erro', mensagemErro: 'Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado.' })}
        aoMudar={() => undefined}
        aoExcluir={() => undefined}
      />,
    )
    expect(erro).toContain('Este PDF não tem texto selecionável')
    expect(erro).toContain('Reprocessar')
    for (const status of ['pronto', 'pendente', 'processando']) {
      const html = renderToStaticMarkup(
        <LinhaDeFonte fonte={fonte({ status })} aoMudar={() => undefined} aoExcluir={() => undefined} />,
      )
      expect(html, status).not.toContain('Reprocessar')
    }
  })

  it('o título da fonte entra como texto, nunca como HTML', () => {
    const html = renderToStaticMarkup(
      <LinhaDeFonte fonte={fonte({ titulo: '<img src=x onerror=alert(1)>' })} aoMudar={() => undefined} aoExcluir={() => undefined} />,
    )
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })
})

describe('excluir com confirmação na própria tela', () => {
  it('a máquina vai de inicial a confirmando e volta ao cancelar, sem window.confirm', () => {
    expect(proximoEstadoDaExclusaoDeFonte('inicial', 'excluir')).toBe('confirmando')
    expect(proximoEstadoDaExclusaoDeFonte('confirmando', 'cancelar')).toBe('inicial')
    expect(proximoEstadoDaExclusaoDeFonte('inicial', 'cancelar')).toBe('inicial')
  })

  it('no estado inicial há só o botão Excluir; confirmando, a pergunta com Confirmar e Cancelar', () => {
    const inicial = renderToStaticMarkup(<BotaoExcluirFonte fonte={{ id: 'f', agenteId: 'a', titulo: 'Manual' }} aoExcluir={() => undefined} />)
    expect(inicial).toContain('Excluir')
    expect(inicial).not.toContain('Confirmar')
    const aberto = renderToStaticMarkup(
      <BotaoExcluirFonte fonte={{ id: 'f', agenteId: 'a', titulo: 'Manual' }} aoExcluir={() => undefined} confirmandoInicial />,
    )
    expect(aberto).toContain('Excluir “Manual”?')
    expect(aberto).toContain('Confirmar exclusão')
    expect(aberto).toContain('Cancelar')
    expect(aberto).toContain('role="alertdialog"')
  })
})

describe('painel', () => {
  it('mostra os cartões de resumo, a lista com um item por fonte e o aviso de atualização automática', () => {
    const html = painel([fonte(), fonte({ id: 'f2', titulo: 'Política', status: 'processando' })])
    expect(html).toContain('aria-label="Resumo da base"')
    expect(html).toContain('aria-label="Fontes da base"')
    expect(html.match(/class="fonte-item"/g) ?? []).toHaveLength(2)
    expect(html).toContain('Política')
    expect(html).toContain('role="status"')
  })

  it('sem fonte mostra o convite para adicionar a primeira', () => {
    const html = painel([], { total: 0, prontas: 0, emProcessamento: 0, comErro: 0, caracteres: 0 })
    expect(html).toContain('Nenhuma fonte ainda')
    expect(html).toMatch(/Envie arquivos ou cole um texto/)
    expect(html).not.toContain('class="fonte-item"')
  })
})

describe('cartão Testar busca (FT-05)', () => {
  const saida = painel([fonte()])

  it('o painel traz o cartão com título, campo rotulado e botão Buscar', () => {
    expect(saida).toContain('Testar busca')
    expect(saida).toMatch(/<label[^>]*class="campo busca-campo"[^>]*><span>Pergunta<\/span><input[^>]*name="pergunta"/)
    expect(saida).toContain('maxLength="500"')
    expect(saida).toMatch(/<button[^>]*type="submit"[^>]*>Buscar<\/button>/)
  })

  it('começa no estado inicial, sem resultado nem erro', () => {
    expect(saida).toContain('Os trechos encontrados aparecem aqui.')
    expect(saida).not.toContain('Buscando na base')
    expect(saida).not.toContain('busca-lista')
  })

  it('vem depois de Adicionar e antes da lista de fontes', () => {
    expect(saida.indexOf('Testar busca')).toBeGreaterThan(saida.indexOf('aria-label="Resumo da base"'))
    expect(saida.indexOf('Testar busca')).toBeLessThan(saida.indexOf('id="titulo-das-fontes"'))
  })
})
