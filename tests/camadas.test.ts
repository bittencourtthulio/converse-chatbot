/**
 * A direção das camadas (CONVENCOES.md, seção 5) precisa ser regra de lint,
 * não convenção de revisão. Este teste roda o ESLint de verdade, com a
 * configuração do repositório, sobre trechos de amostra colocados no caminho
 * de cada camada.
 */
import { describe, it, expect } from 'vitest'
import { ESLint } from 'eslint'

const eslint = new ESLint({ overrideConfigFile: 'eslint.config.mjs' })

async function violacoes(caminho: string, codigo: string): Promise<string[]> {
  const [resultado] = await eslint.lintText(codigo, { filePath: caminho })
  return (resultado?.messages ?? [])
    .filter((m) => m.ruleId === 'no-restricted-imports')
    .map((m) => m.message)
}

describe('direção das camadas', () => {
  it('serviço não importa next/*', async () => {
    const r = await violacoes(
      'src/servicos/amostra.ts',
      "import { cookies } from 'next/headers'\nexport const x = cookies\n",
    )
    expect(r).toHaveLength(1)
    expect(r[0]).toContain('serviços')
  })

  it('serviço não importa a apresentação', async () => {
    const app = await violacoes(
      'src/servicos/amostra.ts',
      "import { autenticar } from '@/app/acoes'\nexport const x = autenticar\n",
    )
    const comp = await violacoes(
      'src/servicos/amostra.ts',
      "import { Formulario } from '@/componentes/Formulario'\nexport const x = Formulario\n",
    )
    expect(app).toHaveLength(1)
    expect(comp).toHaveLength(1)
  })

  it('src/lib não importa serviços nem apresentação', async () => {
    const servico = await violacoes(
      'src/lib/amostra.ts',
      "import { entrar } from '@/servicos/autenticacao'\nexport const x = entrar\n",
    )
    const app = await violacoes(
      'src/lib/amostra.ts',
      "import { sair } from '@/app/acoes'\nexport const x = sair\n",
    )
    expect(servico).toHaveLength(1)
    expect(app).toHaveLength(1)
  })

  it('apresentação não importa o Prisma direto', async () => {
    const app = await violacoes(
      'src/app/amostra.tsx',
      "import { prisma } from '@/lib/prisma'\nexport const x = prisma\n",
    )
    const comp = await violacoes(
      'src/componentes/Amostra.tsx',
      "import { prisma } from '@/lib/prisma'\nexport const x = prisma\n",
    )
    expect(app).toHaveLength(1)
    expect(comp).toHaveLength(1)
  })

  it('as direções permitidas passam', async () => {
    expect(
      await violacoes(
        'src/servicos/amostra.ts',
        "import { prisma } from '@/lib/prisma'\nexport const x = prisma\n",
      ),
    ).toEqual([])
    expect(
      await violacoes(
        'src/app/amostra.tsx',
        "import { entrar } from '@/servicos/autenticacao'\nexport const x = entrar\n",
      ),
    ).toEqual([])
    expect(
      await violacoes(
        'src/lib/amostra.ts',
        "import { ambiente } from '@/lib/ambiente'\nexport const x = ambiente\n",
      ),
    ).toEqual([])
  })
})
