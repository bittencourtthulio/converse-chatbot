// Apoio dos testes da base de conhecimento: cria fontes já gravadas no
// armazenamento temporário do teste, sem passar pelo serviço.
import { prisma } from '../../src/lib/prisma.js'
import { ambiente } from '../../src/lib/ambiente.js'
import { criarArmazenamento } from '../../src/lib/armazenamento.js'
import { criarAdmin } from '../ajuda'

export const armazenamentoDeTeste = () => criarArmazenamento(ambiente.storageDir)

export async function criarAgenteDeTeste(nome = 'Agente de teste') {
  const dono = await criarAdmin()
  const agente = await prisma.agente.create({
    data: { nome, modelo: 'openai/gpt-4o-mini', criadoPorId: dono.id },
  })
  return { dono, agente }
}

export interface OpcoesDeFonte {
  agenteId: string
  tipo?: 'arquivo' | 'texto' | 'video' | 'youtube'
  titulo?: string
  nomeOriginal?: string | null
  bytes?: Uint8Array | null
  status?: string
  criadoPorId?: string
  criadoEm?: Date
}

/** Cria a linha e, com `bytes`, o original em disco (arquivo primeiro, como o serviço). */
export async function criarFonteDeTeste(o: OpcoesDeFonte) {
  const tipo = o.tipo ?? 'arquivo'
  const criada = await prisma.fonte.create({
    data: {
      agenteId: o.agenteId,
      tipo,
      titulo: o.titulo ?? 'Fonte de teste',
      nomeOriginal: o.nomeOriginal === undefined ? 'fonte.txt' : o.nomeOriginal,
      tamanhoBytes: o.bytes?.length ?? 0,
      status: o.status ?? 'pendente',
      criadoPorId: o.criadoPorId,
      ...(o.criadoEm && { criadoEm: o.criadoEm }),
    },
  })
  if (o.bytes === null) return criada
  const caminho = await armazenamentoDeTeste().gravar(o.agenteId, criada.id, o.bytes ?? Buffer.from('Texto de teste.'))
  return prisma.fonte.update({ where: { id: criada.id }, data: { caminhoArquivo: caminho } })
}
