import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { extrairCsv } from '@/lib/extracao/csv'
import { extrairJson } from '@/lib/extracao/json'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))

describe('CSV', () => {
  it('a fixture vira cabeçalho e um registro por linha, com campo entre aspas e vírgula', () => {
    expect(extrairCsv(fixture('exemplo.csv'))).toBe(
      [
        'Colunas: loja, produto, preço, estoque',
        'loja: Loja Exemplo; produto: Caderno; preço: 12,90; estoque: 40',
        'loja: Loja Exemplo; produto: Caneta azul; preço: 2,50; estoque: 300',
        'loja: Loja Exemplo; produto: Grampeador, médio; preço: 18,00; estoque: 15',
      ].join('\n'),
    )
  })

  it('nome;idade com Ana;30 vira Colunas e nome: Ana; idade: 30', () => {
    expect(extrairCsv(Buffer.from('nome;idade\nAna;30\n'))).toBe('Colunas: nome, idade\nnome: Ana; idade: 30')
  })

  it('o delimitador vírgula também é entendido, e vírgula entre aspas não divide', () => {
    expect(extrairCsv(Buffer.from('a,b\n"x, y",z\n'))).toBe('Colunas: a, b\na: x, y; b: z')
  })

  it('aspas duplicadas, quebra de linha dentro de campo e CRLF', () => {
    const csv = 'nome;nota\r\n"Ana ""Nana""";"linha um\nlinha dois"\r\nBia;ok\r\n'
    expect(extrairCsv(Buffer.from(csv))).toBe(
      'Colunas: nome, nota\nnome: Ana "Nana"; nota: linha um linha dois\nnome: Bia; nota: ok',
    )
  })

  it('valores vazios saem, linhas em branco somem e campo a mais ganha nome', () => {
    expect(extrairCsv(Buffer.from('a;b;c\n1;;3\n\n;;\n4;5;6;7\n'))).toBe(
      'Colunas: a, b, c\na: 1; c: 3\na: 4; b: 5; c: 6; coluna 4: 7',
    )
  })

  it('só o cabeçalho ou arquivo vazio devolve o texto sem registros', () => {
    expect(extrairCsv(Buffer.from('a;b\n'))).toBe('Colunas: a, b')
    expect(extrairCsv(Buffer.from('\n\n'))).toBe('')
  })
})

describe('JSON', () => {
  it('{a:{b:[1,2]}} vira a.b[0]: 1 e a.b[1]: 2', () => {
    expect(extrairJson(Buffer.from('{"a":{"b":[1,2]}}'))).toBe('a.b[0]: 1\na.b[1]: 2')
  })

  it('a fixture vira uma linha caminho: valor por folha', () => {
    expect(extrairJson(fixture('exemplo.json'))).toBe(
      [
        'loja: Loja Exemplo',
        'horario.abre: 09:00',
        'horario.fecha: 18:00',
        'produtos[0].nome: Caderno',
        'produtos[0].preco: 12.9',
        'produtos[1].nome: Caneta azul',
        'produtos[1].preco: 2.5',
      ].join('\n'),
    )
  })

  it('chaves fora do padrão usam colchetes, vazios saem e booleanos e null se comportam', () => {
    const json = JSON.stringify({ 'nome completo': 'Ana', vazio: '', lista: [], obj: {}, nulo: null, ok: true, n: 0 })
    expect(extrairJson(Buffer.from(json))).toBe('["nome completo"]: Ana\nok: true\nn: 0')
  })

  it('valor raiz que não é objeto nem lista é o próprio valor, e quebras de linha viram espaço', () => {
    expect(extrairJson(Buffer.from('"olá"'))).toBe('olá')
    expect(extrairJson(Buffer.from('["a\\nb", {"c": 1}]'))).toBe('[0]: a b\n[1].c: 1')
  })

  it('JSON inválido lança erro em português', () => {
    expect(() => extrairJson(Buffer.from('{ não é json'))).toThrow(/JSON/)
  })
})
