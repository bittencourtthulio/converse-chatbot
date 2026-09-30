import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'
import { parse } from 'parse5'

const pacote = JSON.parse(readFileSync('package.json', 'utf8')) as {
  dependencies: Record<string, string>
}

describe('bibliotecas de extração', () => {
  it('carregam no Node do teste e respondem à chamada mais simples', async () => {
    expect(typeof getDocumentProxy).toBe('function')
    expect(typeof mammoth.extractRawText).toBe('function')
    const documento = parse('<p>olá</p>')
    expect(documento.nodeName).toBe('#document')
  })

  it('têm versão exata no package.json, sem ^ nem ~', () => {
    expect(pacote.dependencies.unpdf).toBe('1.8.1')
    expect(pacote.dependencies.mammoth).toBe('1.13.0')
    expect(pacote.dependencies.parse5).toBe('8.0.1')
  })
})
