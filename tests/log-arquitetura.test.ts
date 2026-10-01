/**
 * Regra de arquitetura do log (FT-11, PR-92): `src/lib/log.ts` é o único ponto de saída de log do
 * servidor, então nenhum `console.*` pode existir em `src/` fora dele. Dois guardas: a regra
 * `no-console` do ESLint (provada com o ESLint real e a configuração do repositório) e uma
 * varredura de todos os arquivos de `src/`. Exceções declaradas: o próprio `log.ts` e os arquivos
 * que são saída de comando de linha de comando (`prisma/seed.ts`, `scripts/` e `tests/`).
 */
import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.mjs' })

async function regrasDeConsole(caminho: string, codigo: string): Promise<number> {
  const [resultado] = await eslint.lintText(codigo, { filePath: caminho })
  return (resultado?.messages ?? []).filter((m) => m.ruleId === 'no-console').length
}

const CODIGO = "export function f() {\n  console.log('x')\n  console.error('y')\n}\n"

describe('regra no-console do ESLint', () => {
  it.each([
    'src/servicos/novo.ts',
    'src/app/novo.ts',
    'src/app/api/novo/route.ts',
    'src/componentes/Novo.tsx',
    'src/lib/novo.ts',
    'src/instrumentation.ts',
  ])('console em %s é erro', async (caminho) => {
    expect(await regrasDeConsole(caminho, CODIGO)).toBe(2)
  })

  it.each(['src/lib/log.ts', 'prisma/seed.ts', 'scripts/backup.ts', 'scripts/restore.ts', 'tests/qualquer.test.ts'])(
    'console em %s é permitido (exceção declarada)',
    async (caminho) => {
      expect(await regrasDeConsole(caminho, CODIGO)).toBe(0)
    },
  )
})

describe('varredura de src/', () => {
  const raiz = path.join(process.cwd(), 'src')

  function arquivos(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const completo = path.join(dir, e.name)
      if (e.isDirectory()) return e.name === 'gerado' ? [] : arquivos(completo)
      return /\.(ts|tsx|js|mjs)$/.test(e.name) ? [completo] : []
    })
  }

  it('só src/lib/log.ts usa console', () => {
    const usam = arquivos(raiz)
      .filter((f) => /\bconsole\s*\.\s*(log|error|warn|info|debug|trace)\b|\bconsole\s*\[/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')))
      .map((f) => path.relative(process.cwd(), f).split(path.sep).join('/'))
    expect(usam).toEqual(['src/lib/log.ts'])
  })
})
