/**
 * Sanidade de desempenho e reconstrução do índice (FT-05, PR-50, PR-51): com
 * cerca de 5.000 trechos a busca continua na casa das dezenas de milissegundos;
 * o limite de aprovação é folgado (500 ms na mediana) para não ser instável.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { buscarTrechos, reconstruirIndiceDeTrechos } from '@/servicos/recuperacao'
import { limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

const ASSUNTOS = ['cadernos', 'canetas', 'grampeadores', 'pastas', 'etiquetas', 'papel sulfite', 'envelopes', 'marcadores']
let agenteId: string

beforeAll(async () => {
  await limparBanco()
  agenteId = (await criarAgenteDeTeste()).agente.id
  const fonte = await criarFonteDeTeste({ agenteId, tipo: 'texto', status: 'pronto' })
  const dados = Array.from({ length: 5000 }, (_, i) => {
    const texto = `Trecho ${i} sobre ${ASSUNTOS[i % ASSUNTOS.length]}: política de troca número ${i % 97}, entrega em ${i % 9} dias úteis e atendimento das ${i % 12}h às 18h. ${'Texto de enchimento da base. '.repeat(20)}`
    return { fonteId: fonte.id, agenteId, indice: i, texto, caracteres: texto.length }
  })
  for (let i = 0; i < dados.length; i += 500) await prisma.trecho.createMany({ data: dados.slice(i, i + 500) })
}, 120_000)

afterAll(async () => {
  await limparBanco()
})

describe('desempenho com 5.000 trechos', () => {
  it('a mediana de 20 buscas fica abaixo de 500 ms e cada busca respeita o limite de 6', async () => {
    const perguntas = ['grampeadores', 'política de troca número 42', 'quanto tempo leva a entrega?', 'canetas e cadernos', 'atendimento às 9h']
    const tempos: number[] = []
    for (let i = 0; i < 20; i += 1) {
      const inicio = performance.now()
      const achados = await buscarTrechos(agenteId, perguntas[i % perguntas.length]!)
      tempos.push(performance.now() - inicio)
      expect(achados.length).toBeGreaterThan(0)
      expect(achados.length).toBeLessThanOrEqual(6)
    }
    tempos.sort((a, b) => a - b)
    expect(tempos[10]!).toBeLessThan(500)
  })
})

describe('reconstruirIndiceDeTrechos', () => {
  it('depois de o índice ser esvaziado, a reconstrução faz a busca voltar a achar', async () => {
    expect((await buscarTrechos(agenteId, 'grampeadores')).length).toBeGreaterThan(0)
    await prisma.$executeRawUnsafe(`INSERT INTO trechos_fts(trechos_fts) VALUES('delete-all')`)
    expect(await buscarTrechos(agenteId, 'grampeadores')).toEqual([])

    await reconstruirIndiceDeTrechos()

    expect((await buscarTrechos(agenteId, 'grampeadores')).length).toBeGreaterThan(0)
  })
})
