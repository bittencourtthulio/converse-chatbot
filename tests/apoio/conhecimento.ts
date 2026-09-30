/**
 * Apoio dos testes de recuperação e de chat fundamentado (FT-05): monta agente,
 * fonte e trechos pela mesma via da seed e da fila (`createMany`), de modo que
 * os gatilhos do índice FTS5 os indexem. Só texto fictício.
 */
import { prisma } from '../../src/lib/prisma.js'
import { criarAgenteDeTeste, criarFonteDeTeste } from './fontes'

export interface OpcoesDeBase {
  /** Reaproveita um agente; sem ele, cria um. */
  agenteId?: string
  /** O texto de cada trecho, na ordem. */
  textos: string[]
  titulo?: string
  status?: 'pronto' | 'pendente' | 'processando' | 'erro'
}

export interface BaseDeTeste {
  agenteId: string
  fonteId: string
  trechoIds: string[]
}

export async function criarBase(opcoes: OpcoesDeBase): Promise<BaseDeTeste> {
  const agenteId = opcoes.agenteId ?? (await criarAgenteDeTeste()).agente.id
  const status = opcoes.status ?? 'pronto'
  const fonte = await criarFonteDeTeste({
    agenteId,
    tipo: 'texto',
    titulo: opcoes.titulo ?? 'Fonte de teste',
    nomeOriginal: null,
    status,
  })
  await prisma.trecho.createMany({
    data: opcoes.textos.map((texto, indice) => ({
      fonteId: fonte.id,
      agenteId,
      indice,
      texto,
      caracteres: texto.length,
    })),
  })
  await prisma.fonte.update({
    where: { id: fonte.id },
    data: { totalTrechos: opcoes.textos.length, caracteres: opcoes.textos.join('').length },
  })
  const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id }, orderBy: { indice: 'asc' } })
  return { agenteId, fonteId: fonte.id, trechoIds: trechos.map((t) => t.id) }
}
