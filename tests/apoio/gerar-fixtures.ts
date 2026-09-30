// Grava as fixtures de tests/apoio/fixtures-fontes.ts em tests/fixtures/:
//   npx tsx tests/apoio/gerar-fixtures.ts
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { gerarFixtures } from './fixtures-fontes'

const pasta = path.resolve(process.cwd(), 'tests/fixtures')
mkdirSync(pasta, { recursive: true })
for (const [nome, bytes] of Object.entries(gerarFixtures())) {
  writeFileSync(path.join(pasta, nome), bytes)
  console.log(`tests/fixtures/${nome} (${bytes.length} bytes)`)
}
