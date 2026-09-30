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

describe('pipeline de verificação', () => {
  const ci = ler('.github/workflows/ci.yml')

  it('usa Node 22', () => {
    expect(ci).toMatch(/node-version:\s*['"]?22['"]?/)
  })

  it('roda os passos de verificação na ordem do PR-26', () => {
    const passos = [
      'npm ci',
      'npx prisma generate',
      'npm run lint',
      'npx tsc --noEmit',
      'npm run build',
      'npm test',
      'npm audit --audit-level=high',
    ]
    let posicao = -1
    for (const passo of passos) {
      const onde = ci.indexOf(passo, posicao + 1)
      expect(onde, `passo ausente ou fora de ordem: ${passo}`).toBeGreaterThan(posicao)
      posicao = onde
    }
  })

  it('o build recebe DATABASE_URL e JWT_SECRET de CI, sem segredo do repositório', () => {
    expect(ci).toMatch(/DATABASE_URL:\s*file:/)
    expect(ci).toMatch(/JWT_SECRET:\s*\S+/)
    expect(ci).not.toContain('secrets.')
  })
})

describe('README do projeto', () => {
  const readme = ler('README.md')

  it('diz como rodar, com Node 22 e as contas de demonstração', () => {
    expect(readme).toContain('Node 22')
    expect(readme).toContain('cp .env.example .env')
    expect(readme).toContain('JWT_SECRET')
    for (const comando of ['npm install', 'npm run setup', 'npm run dev']) {
      expect(readme, comando).toContain(comando)
    }
    expect(readme).toContain('admin@exemplo.local')
    expect(readme).toContain('usuario@exemplo.local')
  })

  it('documenta cada script do package.json', () => {
    for (const nome of Object.keys(pacote.scripts)) {
      const comando = nome === 'test' ? 'npm test' : `npm run ${nome}`
      expect(readme, comando).toContain(comando)
    }
  })

  it('descreve as três camadas e as variáveis de ambiente', () => {
    for (const pasta of ['src/app', 'src/servicos', 'src/lib']) {
      expect(readme, pasta).toContain(pasta)
    }
    for (const variavel of ['APP_NAME', 'TRUST_PROXY', 'DATABASE_URL']) {
      expect(readme, variavel).toContain(variavel)
    }
  })

  it('é o README do Converse, não o do template', () => {
    expect(readme).toContain('Converse')
    expect(readme).not.toMatch(/template do buildx/i)
  })
})
