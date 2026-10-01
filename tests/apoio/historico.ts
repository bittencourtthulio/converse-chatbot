// Fixtures do histórico de conversas (FT-09, T-01.02): grava agente, conversas dos três
// canais, mensagens e fontes no banco de teste, direto pelo Prisma, para controlar
// instantes e identificadores. A limpeza é a de `limparBanco` (a cascata cuida do resto).
import { prisma } from '../../src/lib/prisma.js'
import { criarUsuario } from '../ajuda.js'
import type { FonteDaResposta } from '../../src/servicos/fontes-da-resposta.js'

let contador = 0
const proximo = () => (contador += 1)

export async function criarAgenteDeTeste(opcoes?: { nome?: string; criadoPorId?: string }) {
  const criadoPorId = opcoes?.criadoPorId ?? (await criarUsuario()).id
  return prisma.agente.create({
    data: { nome: opcoes?.nome ?? `Agente ${proximo()}`, modelo: 'openai/gpt-4o-mini', criadoPorId },
  })
}

/** Uma fonte da resposta (com um trecho citado), no formato gravado em `Mensagem.fontes`. */
export function fonteDeTeste(titulo: string, posicao = 1): FonteDaResposta {
  return {
    fonteId: `fonte-${titulo.replace(/\W+/g, '-').toLowerCase()}`,
    titulo,
    citada: true,
    trechos: [{ n: 1, posicao, trechoTexto: `Trecho ${posicao} de ${titulo}.` }],
  }
}

export interface MensagemDeTeste {
  papel: 'user' | 'assistant'
  conteudo: string
  criadoEm?: Date
  fontes?: FonteDaResposta[]
}

export interface ConversaDeTeste {
  agenteId: string
  canal: 'painel' | 'widget' | 'telegram'
  identificadorExterno?: string | null
  titulo?: string | null
  criadoPorId?: string | null
  atualizadoEm?: Date
  mensagens?: MensagemDeTeste[]
}

/** Identificador externo típico do canal: visitante do widget ou id de chat do Telegram. */
export function identificadorDoCanal(canal: ConversaDeTeste['canal']): string | null {
  const n = proximo()
  if (canal === 'widget') return `visitante${String(n).padStart(8, '0')}abcdefgh`
  if (canal === 'telegram') return String(100000 + n)
  return null
}

export async function criarConversaDeTeste(entrada: ConversaDeTeste) {
  const mensagens = entrada.mensagens ?? []
  const base = entrada.atualizadoEm ?? new Date()
  const identificadorExterno =
    entrada.identificadorExterno !== undefined ? entrada.identificadorExterno : identificadorDoCanal(entrada.canal)
  const titulo =
    entrada.titulo !== undefined
      ? entrada.titulo
      : entrada.canal === 'telegram'
        ? `Telegram: Pessoa ${proximo()}`
        : (mensagens[0]?.conteudo.slice(0, 60) ?? null)
  return prisma.conversa.create({
    data: {
      agenteId: entrada.agenteId,
      canal: entrada.canal,
      identificadorExterno,
      titulo,
      criadoPorId: entrada.criadoPorId ?? null,
      criadoEm: base,
      atualizadoEm: base,
      mensagens: {
        create: mensagens.map((m, i) => ({
          papel: m.papel,
          conteudo: m.conteudo,
          criadoEm: m.criadoEm ?? new Date(base.getTime() + i * 1000),
          fontes: m.fontes ? JSON.stringify(m.fontes) : null,
        })),
      },
    },
  })
}
