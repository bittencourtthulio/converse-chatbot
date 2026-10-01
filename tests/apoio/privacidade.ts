// Fixtures da privacidade e da auditoria (FT-10, T-01.02): conversas em lote com instante
// exato de atualização e registros de auditoria com `quando` explícito, direto pelo Prisma.
import { randomBytes } from 'node:crypto'
import { prisma } from '../../src/lib/prisma.js'
import { criarUsuario } from '../ajuda.js'

export interface LoteDeConversas {
  agenteId: string
  canal: 'painel' | 'widget' | 'telegram'
  quantidade: number
  /** O instante de criação e de atualização da conversa i (padrão: agora). */
  atualizadoEm?: (indice: number) => Date
  /** O identificador externo da conversa i (padrão: aleatório de 20 caracteres no widget, sequencial no Telegram). */
  identificador?: (indice: number) => string | null
  /** Padrão 2 (uma pergunta e uma resposta). */
  mensagensPorConversa?: number
}

/** Cria o lote com `createMany` (rápido, serve a 1000+ conversas) e devolve os ids na ordem. */
export async function criarConversasEmLote(lote: LoteDeConversas): Promise<string[]> {
  const porConversa = lote.mensagensPorConversa ?? 2
  const ids: string[] = []
  const conversas: Array<Record<string, unknown>> = []
  const mensagens: Array<Record<string, unknown>> = []
  for (let i = 0; i < lote.quantidade; i += 1) {
    const id = `cv${randomBytes(10).toString('hex')}`
    const quando = lote.atualizadoEm ? lote.atualizadoEm(i) : new Date()
    const identificador =
      lote.identificador !== undefined
        ? lote.identificador(i)
        : lote.canal === 'widget'
          ? randomBytes(10).toString('hex')
          : lote.canal === 'telegram'
            ? String(900000 + i)
            : null
    ids.push(id)
    conversas.push({
      id,
      agenteId: lote.agenteId,
      canal: lote.canal,
      identificadorExterno: identificador,
      titulo: lote.canal === 'telegram' ? `Telegram: Pessoa ${i}` : null,
      criadoEm: quando,
      atualizadoEm: quando,
    })
    for (let m = 0; m < porConversa; m += 1) {
      mensagens.push({
        conversaId: id,
        papel: m % 2 === 0 ? 'user' : 'assistant',
        conteudo: m % 2 === 0 ? `Pergunta ${i}` : `Resposta ${i}`,
        criadoEm: new Date(quando.getTime() + m * 1000),
      })
    }
  }
  // O SQLite limita o número de variáveis por consulta: grava em pedaços.
  for (let a = 0; a < conversas.length; a += 200) {
    await prisma.conversa.createMany({ data: conversas.slice(a, a + 200) as never })
  }
  for (let a = 0; a < mensagens.length; a += 200) {
    await prisma.mensagem.createMany({ data: mensagens.slice(a, a + 200) as never })
  }
  return ids
}

/** Um registro de auditoria direto no banco, com `quando` explícito. */
export async function criarRegistroDeTeste(opcoes: {
  acao?: string
  quando?: Date
  usuarioId?: string | null
  alvoTipo?: string
  alvoId?: string | null
  detalhes?: Record<string, unknown>
}) {
  const usuario = opcoes.usuarioId === undefined ? await criarUsuario() : null
  const usuarioId = opcoes.usuarioId === undefined ? (usuario?.id ?? null) : opcoes.usuarioId
  const rotulo = usuario ? `${usuario.nome} <${usuario.email}>` : 'Usuário de teste <teste@teste.local>'
  return prisma.registroDeAuditoria.create({
    data: {
      quando: opcoes.quando ?? new Date(),
      usuarioId,
      usuarioRotulo: rotulo,
      acao: opcoes.acao ?? 'usuario_criado',
      alvoTipo: opcoes.alvoTipo ?? 'usuario',
      alvoId: opcoes.alvoId ?? null,
      detalhes: JSON.stringify(opcoes.detalhes ?? {}),
    },
  })
}
