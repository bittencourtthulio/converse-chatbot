import { describe, it, expect } from 'vitest'
import {
  estadoInicialDosEnvios,
  reducerDosEnvios,
  pendentesDeEnvio,
  resumoDosEnvios,
  type EstadoDosEnvios,
} from '@/componentes/estado-dos-envios'

const A = { id: 'a', nome: 'a.pdf', tamanho: 100 }
const B = { id: 'b', nome: 'b.txt', tamanho: 50 }

function aplicar(estado: EstadoDosEnvios, ...acoes: Parameters<typeof reducerDosEnvios>[1][]) {
  return acoes.reduce(reducerDosEnvios, estado)
}

describe('reducer dos envios', () => {
  it('começa vazio', () => {
    expect(estadoInicialDosEnvios.itens).toEqual([])
  })

  it('um envio vai de aguardando a enviando com percentual e a aceito', () => {
    let e = aplicar(estadoInicialDosEnvios, { tipo: 'adicionar', arquivos: [A] })
    expect(e.itens[0]).toMatchObject({ id: 'a', situacao: 'aguardando', percentual: 0 })

    e = aplicar(e, { tipo: 'iniciar', id: 'a' }, { tipo: 'progresso', id: 'a', percentual: 40 })
    expect(e.itens[0]).toMatchObject({ situacao: 'enviando', percentual: 40 })

    e = aplicar(e, { tipo: 'resultado', id: 'a', aceito: true })
    expect(e.itens[0]).toMatchObject({ situacao: 'aceito', percentual: 100 })
    expect(e.itens[0]!.motivo).toBeUndefined()
  })

  it('recusado guarda o motivo, e falha de rede vira recusado com a mensagem', () => {
    let e = aplicar(estadoInicialDosEnvios, { tipo: 'adicionar', arquivos: [A, B] })
    e = aplicar(
      e,
      { tipo: 'iniciar', id: 'a' },
      { tipo: 'resultado', id: 'a', aceito: false, motivo: 'O arquivo está vazio.' },
      { tipo: 'iniciar', id: 'b' },
      { tipo: 'falha', id: 'b', motivo: 'Sem conexão.' },
    )
    expect(e.itens[0]).toMatchObject({ situacao: 'recusado', motivo: 'O arquivo está vazio.' })
    expect(e.itens[1]).toMatchObject({ situacao: 'recusado', motivo: 'Sem conexão.' })
  })

  it('arquivo já recusado no navegador entra como recusado e não vai para o envio', () => {
    const e = aplicar(estadoInicialDosEnvios, {
      tipo: 'adicionar',
      arquivos: [A, { ...B, recusadoComMotivo: 'Formato não aceito.' }],
    })
    expect(e.itens[1]).toMatchObject({ situacao: 'recusado', motivo: 'Formato não aceito.' })
    expect(pendentesDeEnvio(e).map((i) => i.id)).toEqual(['a'])
  })

  it('o percentual nunca passa de 100 nem volta atrás, e só vale em enviando', () => {
    let e = aplicar(estadoInicialDosEnvios, { tipo: 'adicionar', arquivos: [A] }, { tipo: 'iniciar', id: 'a' })
    e = aplicar(e, { tipo: 'progresso', id: 'a', percentual: 70 }, { tipo: 'progresso', id: 'a', percentual: 30 })
    expect(e.itens[0]!.percentual).toBe(70)
    e = aplicar(e, { tipo: 'progresso', id: 'a', percentual: 500 })
    expect(e.itens[0]!.percentual).toBe(100)
    e = aplicar(e, { tipo: 'resultado', id: 'a', aceito: true }, { tipo: 'progresso', id: 'a', percentual: 10 })
    expect(e.itens[0]!.percentual).toBe(100)
  })

  it('remover tira um item; limpar tira os terminados e mantém os em andamento', () => {
    let e = aplicar(
      estadoInicialDosEnvios,
      { tipo: 'adicionar', arquivos: [A, B, { id: 'c', nome: 'c.md', tamanho: 1 }] },
      { tipo: 'iniciar', id: 'a' },
      { tipo: 'resultado', id: 'a', aceito: true },
      { tipo: 'iniciar', id: 'b' },
    )
    expect(aplicar(e, { tipo: 'remover', id: 'c' }).itens.map((i) => i.id)).toEqual(['a', 'b'])
    e = aplicar(e, { tipo: 'limpar_terminados' })
    expect(e.itens.map((i) => i.id)).toEqual(['b', 'c'])
  })

  it('ações sobre id inexistente não mudam nada', () => {
    const e = aplicar(estadoInicialDosEnvios, { tipo: 'adicionar', arquivos: [A] })
    expect(aplicar(e, { tipo: 'iniciar', id: 'x' }, { tipo: 'progresso', id: 'x', percentual: 5 })).toEqual(e)
  })

  it('ids repetidos não duplicam o item', () => {
    const e = aplicar(estadoInicialDosEnvios, { tipo: 'adicionar', arquivos: [A] }, { tipo: 'adicionar', arquivos: [A] })
    expect(e.itens).toHaveLength(1)
  })

  it('resumo conta por situação e diz se há envio em andamento', () => {
    let e = aplicar(
      estadoInicialDosEnvios,
      { tipo: 'adicionar', arquivos: [A, B, { id: 'c', nome: 'c', tamanho: 1, recusadoComMotivo: 'x' }] },
      { tipo: 'iniciar', id: 'a' },
    )
    expect(resumoDosEnvios(e)).toEqual({ total: 3, aguardando: 1, enviando: 1, aceitos: 0, recusados: 1, emAndamento: true })
    e = aplicar(e, { tipo: 'resultado', id: 'a', aceito: true }, { tipo: 'iniciar', id: 'b' }, { tipo: 'resultado', id: 'b', aceito: true })
    expect(resumoDosEnvios(e)).toMatchObject({ aceitos: 2, emAndamento: false })
  })
})
