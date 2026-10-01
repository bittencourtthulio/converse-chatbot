/** A versão do app (FT-11): vem do `package.json`, a mesma que o contêiner e o backup registram. */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { versaoDoApp } from '../src/lib/versao.js'

describe('versaoDoApp', () => {
  it('devolve a versão do package.json', () => {
    const pacote = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as { version: string }
    expect(versaoDoApp()).toBe(pacote.version)
    expect(versaoDoApp()).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('lê de um diretório informado e devolve "desconhecida" se não há package.json legível', () => {
    expect(versaoDoApp(path.join(process.cwd(), 'src'))).toBe('desconhecida')
  })
})
