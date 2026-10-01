// A versão do app e as migrations que ele traz (FT-11). A versão vem do `package.json` e é a que a
// tela Sistema mostra e o backup registra; as migrations são as pastas de `prisma/migrations`, o que
// a restauração compara com o que o backup trazia.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const versoes = new Map<string, string>()

/** A versão do `package.json` de `raiz` (padrão: o diretório de execução), ou "desconhecida". */
export function versaoDoApp(raiz: string = process.cwd()): string {
  const memo = versoes.get(raiz)
  if (memo) return memo
  let versao = 'desconhecida'
  try {
    const pacote = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf8')) as { version?: unknown }
    if (typeof pacote.version === 'string' && pacote.version) versao = pacote.version
  } catch {
    // Sem package.json legível a versão é desconhecida: o que a usa continua funcionando.
  }
  versoes.set(raiz, versao)
  return versao
}

const PADRAO_DA_MIGRATION = /^\d{14}_[a-z0-9_]+$/

/** Os nomes das migrations que este app traz, em ordem (as pastas de `prisma/migrations`). Vazio se a pasta não existe. */
export function migracoesDoApp(raiz: string = process.cwd()): string[] {
  try {
    return readdirSync(path.join(raiz, 'prisma', 'migrations'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && PADRAO_DA_MIGRATION.test(e.name))
      .map((e) => e.name)
      .sort()
  } catch {
    return []
  }
}
