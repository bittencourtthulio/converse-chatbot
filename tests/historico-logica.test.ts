// T-02.01: lógica pura do histórico (rótulo mascarado, prévia, escape de LIKE, filtros).
import { describe, it, expect } from 'vitest'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  TAMANHO_DA_PREVIA,
  escaparLike,
  fimDoDia,
  inicioDoDia,
  lerFiltros,
  previaDaMensagem,
  rotuloDoInterlocutor,
} from '@/servicos/historico-logica'

describe('rotuloDoInterlocutor', () => {
  it('widget: "Visitante " mais os 6 primeiros caracteres do visitanteId', () => {
    expect(rotuloDoInterlocutor({ canal: 'widget', identificadorExterno: 'abcdef123456', titulo: 'oi', nomeDoUsuario: null })).toBe('Visitante abcdef')
  })
  it('widget sem identificador não inventa um', () => {
    expect(rotuloDoInterlocutor({ canal: 'widget', identificadorExterno: null, titulo: null, nomeDoUsuario: null })).toBe('Visitante')
  })
  it('telegram: o título da conversa, nunca o id do chat', () => {
    const r = rotuloDoInterlocutor({ canal: 'telegram', identificadorExterno: '987654321', titulo: 'Telegram: Maria', nomeDoUsuario: null })
    expect(r).toBe('Telegram: Maria')
    expect(r).not.toContain('987654321')
    expect(rotuloDoInterlocutor({ canal: 'telegram', identificadorExterno: '1', titulo: null, nomeDoUsuario: null })).toBe('Telegram: contato')
  })
  it('painel: o nome do usuário, ou "Usuário removido" quando ele não existe mais', () => {
    expect(rotuloDoInterlocutor({ canal: 'painel', identificadorExterno: null, titulo: 'x', nomeDoUsuario: 'Ana' })).toBe('Ana')
    expect(rotuloDoInterlocutor({ canal: 'painel', identificadorExterno: null, titulo: 'x', nomeDoUsuario: null })).toBe('Usuário removido')
  })
})

describe('previaDaMensagem', () => {
  it('colapsa espaços e quebras de linha', () => {
    expect(previaDaMensagem('  olá \n\n  mundo  ')).toBe('olá mundo')
  })
  it('tira a marcação de markdown: negrito, código, link, lista e título', () => {
    expect(previaDaMensagem('# Olá\nClaro! **uma resposta** de `exemplo`:\n\n- primeiro item\n- segundo item\nVeja [a documentação](https://exemplo.com).')).toBe(
      'Olá Claro! uma resposta de exemplo: primeiro item segundo item Veja a documentação.',
    )
    expect(previaDaMensagem('1. um\n2. dois')).toBe('um dois')
    expect(previaDaMensagem('preço 2*3 e 50%')).toBe('preço 2*3 e 50%')
  })
  it('corta em 120 caracteres, com reticências, sem passar do limite', () => {
    const longa = 'a'.repeat(300)
    const previa = previaDaMensagem(longa)
    expect(previa).toHaveLength(TAMANHO_DA_PREVIA)
    expect(previa.endsWith('…')).toBe(true)
    expect(previaDaMensagem('a'.repeat(120))).toBe('a'.repeat(120))
  })
  it('não parte um par substituto (emoji) ao cortar', () => {
    const previa = previaDaMensagem('😀'.repeat(200))
    expect(previa.endsWith('…')).toBe(true)
    expect(previa).not.toMatch(/[\ud800-\udbff]…$/)
  })
  it('texto ausente vira vazio', () => {
    expect(previaDaMensagem(null)).toBe('')
  })
})

describe('escaparLike', () => {
  it('transforma percentual, sublinhado e barra invertida em literais', () => {
    expect(escaparLike('50%')).toBe('50\\%')
    expect(escaparLike('a_b')).toBe('a\\_b')
    expect(escaparLike('C:\\temp')).toBe('C:\\\\temp')
    expect(escaparLike('%_\\')).toBe('\\%\\_\\\\')
  })
  it('deixa o resto intacto', () => {
    expect(escaparLike("entrega 'rápida'")).toBe("entrega 'rápida'")
  })
})

describe('lerFiltros', () => {
  it('aplica os padrões: página 1, 25 por página', () => {
    expect(lerFiltros({})).toEqual({ pagina: 1, tamanho: 25 })
  })
  it('aceita agente, canal, texto, período e paginação', () => {
    const f = lerFiltros({ agenteId: 'ag1', canal: 'widget', texto: '  entrega ', de: '2026-03-01', ate: '2026-03-31', pagina: '2', tamanho: '50' })
    expect(f).toMatchObject({ agenteId: 'ag1', canal: 'widget', texto: 'entrega', pagina: 2, tamanho: 50 })
    expect(f.de).toEqual(inicioDoDia('2026-03-01'))
    expect(f.ate).toEqual(fimDoDia('2026-03-31'))
  })
  it('texto vazio e filtro vazio são ignorados', () => {
    const f = lerFiltros({ texto: '   ', agenteId: '', canal: '' })
    expect(f).toEqual({ pagina: 1, tamanho: 25 })
  })
  it.each([
    [{ pagina: 0 }],
    [{ pagina: '-1' }],
    [{ pagina: 'x' }],
    [{ tamanho: 0 }],
    [{ tamanho: 101 }],
    [{ canal: 'email' }],
    [{ texto: 'a'.repeat(201) }],
    [{ de: '2026-13-40' }],
    [{ de: '2026-03-10', ate: '2026-03-01' }],
  ])('recusa %j com erro 422', (entrada) => {
    try {
      lerFiltros(entrada)
      throw new Error('deveria recusar')
    } catch (e) {
      expect(e).toBeInstanceOf(ErroDeAplicacao)
      expect((e as ErroDeAplicacao).status).toBe(422)
    }
  })
  it('o dia vai da meia-noite local à meia-noite seguinte', () => {
    const a = inicioDoDia('2026-03-10')
    const b = fimDoDia('2026-03-10')
    expect(a.getHours()).toBe(0)
    expect(b.getTime() - a.getTime()).toBeGreaterThanOrEqual(23 * 3600_000)
    expect(b.getTime() - a.getTime()).toBeLessThanOrEqual(25 * 3600_000)
  })
})
