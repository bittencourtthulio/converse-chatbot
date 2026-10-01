// T-04.01: lógica pura da tela de conversas (filtros por searchParams, links de página,
// seleção em lote e formatação), sem navegador.
import { describe, it, expect } from 'vitest'
import {
  ESTADO_INICIAL_DO_LOTE,
  descricaoDaPagina,
  entradaDeFiltros,
  formatarAtividade,
  hrefDaPagina,
  paginasVisiveis,
  reduzirLote,
  type EstadoDoLote,
} from '@/componentes/conversas-logica'

describe('entradaDeFiltros', () => {
  it('lê agente, canal, texto, de, ate e pagina dos searchParams', () => {
    expect(
      entradaDeFiltros({ agente: 'ag1', canal: 'telegram', texto: 'troca', de: '2026-03-01', ate: '2026-03-31', pagina: '3' }),
    ).toEqual({ agenteId: 'ag1', canal: 'telegram', texto: 'troca', de: '2026-03-01', ate: '2026-03-31', pagina: 3 })
  })
  it('sem parâmetros vale só a página 1', () => {
    expect(entradaDeFiltros({})).toEqual({ pagina: 1 })
  })
  it('página inválida vira 1', () => {
    for (const pagina of ['0', '-2', 'abc', '1.5', '', undefined, ['x']]) {
      expect(entradaDeFiltros({ pagina: pagina as string }).pagina, String(pagina)).toBe(1)
    }
  })
  it('usa o primeiro valor quando o parâmetro se repete e ignora o que é inválido', () => {
    const f = entradaDeFiltros({ canal: ['widget', 'painel'], de: 'ontem', ate: '2026-02-30', texto: '   ' })
    expect(f).toEqual({ canal: 'widget', pagina: 1 })
    expect(entradaDeFiltros({ canal: 'email' })).toEqual({ pagina: 1 })
  })
})

describe('hrefDaPagina', () => {
  it('mantém os filtros e troca a página; a página 1 sai limpa', () => {
    const f = { agenteId: 'a b', canal: 'widget' as const, texto: '50%', pagina: 2 }
    expect(hrefDaPagina(f, 3)).toBe('/conversas?agente=a+b&canal=widget&texto=50%25&pagina=3')
    expect(hrefDaPagina(f, 1)).toBe('/conversas?agente=a+b&canal=widget&texto=50%25')
    expect(hrefDaPagina({ pagina: 1 }, 1)).toBe('/conversas')
  })
})

describe('paginação', () => {
  it('descreve o intervalo mostrado', () => {
    expect(descricaoDaPagina({ pagina: 2, tamanho: 25, total: 30 })).toBe('26 a 30 de 30 conversas')
    expect(descricaoDaPagina({ pagina: 1, tamanho: 25, total: 1 })).toBe('1 a 1 de 1 conversa')
    expect(descricaoDaPagina({ pagina: 1, tamanho: 25, total: 0 })).toBe('Nenhuma conversa')
  })
  it('lista as páginas ao redor da atual, com a primeira e a última', () => {
    expect(paginasVisiveis(1, 3)).toEqual([1, 2, 3])
    expect(paginasVisiveis(5, 10)).toEqual([1, 4, 5, 6, 10])
    expect(paginasVisiveis(1, 1)).toEqual([1])
  })
})

describe('formatarAtividade', () => {
  it('mostra data e hora em pt-BR no fuso de Brasília', () => {
    expect(formatarAtividade('2026-03-10T15:30:00.000Z')).toBe('10/03/2026 12:30')
    expect(formatarAtividade(new Date('2026-03-10T15:30:00.000Z'))).toBe('10/03/2026 12:30')
  })
})

describe('reduzirLote', () => {
  const marcar = (e: EstadoDoLote, ...ids: string[]) => ids.reduce((s, id) => reduzirLote(s, { tipo: 'alternar', id }), e)

  it('marca e desmarca uma conversa', () => {
    const a = marcar(ESTADO_INICIAL_DO_LOTE, 'c1', 'c2')
    expect(a.selecionadas).toEqual(['c1', 'c2'])
    expect(marcar(a, 'c1').selecionadas).toEqual(['c2'])
  })
  it('marcar todas as da página junta as ids sem repetir, e desmarcar todas limpa só as da página', () => {
    const a = reduzirLote(marcar(ESTADO_INICIAL_DO_LOTE, 'c1'), { tipo: 'marcarTodas', ids: ['c1', 'c2', 'c3'] })
    expect(a.selecionadas).toEqual(['c1', 'c2', 'c3'])
    const b = reduzirLote(a, { tipo: 'desmarcarTodas', ids: ['c2', 'c3'] })
    expect(b.selecionadas).toEqual(['c1'])
  })
  it('respeita o limite de 50 selecionadas e avisa', () => {
    const ids = Array.from({ length: 60 }, (_, i) => `c${i}`)
    const cheio = reduzirLote(ESTADO_INICIAL_DO_LOTE, { tipo: 'marcarTodas', ids })
    expect(cheio.selecionadas).toHaveLength(50)
    expect(cheio.aviso).toMatch(/50/)
    const mais = reduzirLote(cheio, { tipo: 'alternar', id: 'extra' })
    expect(mais.selecionadas).toHaveLength(50)
    expect(mais.aviso).toMatch(/50/)
    expect(reduzirLote(cheio, { tipo: 'alternar', id: 'c0' }).selecionadas).toHaveLength(49)
  })
  it('o fluxo de confirmação: pedir, cancelar sem apagar, confirmar, falhar e concluir', () => {
    const sel = marcar(ESTADO_INICIAL_DO_LOTE, 'c1', 'c2')
    expect(reduzirLote(ESTADO_INICIAL_DO_LOTE, { tipo: 'pedirConfirmacao' }).confirmando).toBe(false)
    const pediu = reduzirLote(sel, { tipo: 'pedirConfirmacao' })
    expect(pediu.confirmando).toBe(true)
    const cancelou = reduzirLote(pediu, { tipo: 'cancelar' })
    expect(cancelou).toMatchObject({ confirmando: false, selecionadas: ['c1', 'c2'] })
    const apagando = reduzirLote(pediu, { tipo: 'apagando' })
    expect(apagando.apagando).toBe(true)
    const falhou = reduzirLote(apagando, { tipo: 'falhou', mensagem: 'Erro X' })
    expect(falhou).toMatchObject({ apagando: false, erro: 'Erro X', confirmando: true, selecionadas: ['c1', 'c2'] })
    expect(reduzirLote(falhou, { tipo: 'concluido' })).toEqual(ESTADO_INICIAL_DO_LOTE)
  })
  it('mudar a seleção fecha a confirmação aberta', () => {
    const pediu = reduzirLote(marcar(ESTADO_INICIAL_DO_LOTE, 'c1'), { tipo: 'pedirConfirmacao' })
    expect(marcar(pediu, 'c2').confirmando).toBe(false)
  })
  it('limpar zera a seleção', () => {
    expect(reduzirLote(marcar(ESTADO_INICIAL_DO_LOTE, 'c1'), { tipo: 'limpar' })).toEqual(ESTADO_INICIAL_DO_LOTE)
  })
})
