/**
 * Confere os arquivos de projeto que não são código mas que quebram a
 * instalação de quem chega: scripts, exemplo de ambiente, pipeline e README.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const raiz = process.cwd()
const ler = (arquivo: string) => readFileSync(path.join(raiz, arquivo), 'utf8')
const pacote = JSON.parse(ler('package.json')) as {
  scripts: Record<string, string>
}

describe('scripts do package.json', () => {
  it('o setup aplica as migrations versionadas, não db push', () => {
    expect(pacote.scripts.setup).toBe(
      'prisma generate && prisma migrate deploy && npm run db:seed',
    )
    expect(pacote.scripts['db:push']).toBeUndefined()
    expect(JSON.stringify(pacote.scripts)).not.toContain('db push')
  })
})

describe('exemplo de ambiente', () => {
  const exemplo = ler('.env.example')
  const valorDe = (chave: string): string | undefined => {
    const linha = exemplo
      .split('\n')
      .find((l) => l.startsWith(`${chave}=`))
    return linha?.slice(chave.length + 1).replace(/^"|"$/g, '')
  }

  it('documenta o nome do produto e a confiança no proxy', () => {
    expect(valorDe('APP_NAME')).toBeDefined()
    expect(valorDe('TRUST_PROXY')).toBeDefined()
    expect(exemplo).toContain('APP_NAME')
    expect(exemplo).toContain('TRUST_PROXY')
  })

  it('não traz segredo real', () => {
    expect(valorDe('JWT_SECRET')).toBe('')
  })
})
