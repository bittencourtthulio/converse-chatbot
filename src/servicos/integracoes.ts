// Integrações do workspace (PR-06, PR-14): a chave do OpenRouter, uma só por
// instalação, gravada cifrada. O estado que sai daqui nunca leva a chave nem o
// texto cifrado: só a máscara. Só o admin lê o estado e mexe na chave (PR-12).
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { cifrar, decifrar, mascararSegredo } from '@/lib/cripto'
import { ErroDeAplicacao, entradaInvalida } from '@/lib/erros'
import { verificarChave } from '@/lib/openrouter'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'

const ID_DA_CONFIGURACAO = 'unica'

export interface EstadoDoOpenrouter {
  configurada: boolean
  /** `sk-or-…a1b2`. Nulo se não há chave ou se ela não pôde ser lida. */
  mascara: string | null
  atualizadoEm: Date | null
  /** Mensagem para o admin quando há chave gravada, mas ilegível. */
  problema: string | null
}

// A mensagem de erro não repete o valor digitado: ele é a chave.
const entradaDaChave = z.object({
  chave: z
    .string({ message: 'Informe a chave do OpenRouter.' })
    .trim()
    .min(1, 'Informe a chave do OpenRouter.')
    .min(10, 'A chave informada parece curta demais.')
    .max(300, 'A chave informada é longa demais.')
    .regex(/^\S+$/, 'A chave não pode ter espaços.'),
})

const SEM_CHAVE: EstadoDoOpenrouter = {
  configurada: false,
  mascara: null,
  atualizadoEm: null,
  problema: null,
}

async function lerEstado(): Promise<EstadoDoOpenrouter> {
  const linha = await prisma.configuracaoDoWorkspace.findUnique({
    where: { id: ID_DA_CONFIGURACAO },
  })
  if (!linha?.openrouterChaveCifrada) return SEM_CHAVE

  try {
    const chave = decifrar(linha.openrouterChaveCifrada)
    return {
      configurada: true,
      mascara: mascararSegredo(chave),
      atualizadoEm: linha.atualizadoEm,
      problema: null,
    }
  } catch (erro) {
    // ENCRYPTION_KEY ausente ou trocada: a tela avisa, o resto do sistema segue.
    const mensagem =
      erro instanceof ErroDeAplicacao && erro.codigo === 'configuracao_invalida'
        ? erro.message
        : 'Não foi possível ler a chave gravada (a ENCRYPTION_KEY mudou?). Cadastre a chave de novo.'
    return {
      configurada: true,
      mascara: null,
      atualizadoEm: linha.atualizadoEm,
      problema: mensagem,
    }
  }
}

export async function estadoDoOpenrouter(
  autor: UsuarioAutenticado,
): Promise<EstadoDoOpenrouter> {
  exigirAdmin(autor)
  return lerEstado()
}

export async function salvarChaveDoOpenrouter(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<EstadoDoOpenrouter> {
  exigirAdmin(autor)
  const dados = entradaDaChave.safeParse(entrada)
  if (!dados.success) {
    throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  }
  const cifrada = cifrar(dados.data.chave)
  await prisma.configuracaoDoWorkspace.upsert({
    where: { id: ID_DA_CONFIGURACAO },
    create: {
      id: ID_DA_CONFIGURACAO,
      openrouterChaveCifrada: cifrada,
      atualizadoPor: autor.id,
    },
    update: { openrouterChaveCifrada: cifrada, atualizadoPor: autor.id },
  })
  return lerEstado()
}

export async function removerChaveDoOpenrouter(
  autor: UsuarioAutenticado,
): Promise<EstadoDoOpenrouter> {
  exigirAdmin(autor)
  await prisma.configuracaoDoWorkspace.upsert({
    where: { id: ID_DA_CONFIGURACAO },
    create: { id: ID_DA_CONFIGURACAO, openrouterChaveCifrada: null, atualizadoPor: autor.id },
    update: { openrouterChaveCifrada: null, atualizadoPor: autor.id },
  })
  return lerEstado()
}

/**
 * A chave do OpenRouter em claro, para os serviços que falam com o provedor
 * (a conversa de teste da FT-03 e os canais). Nunca chega ao navegador: quem
 * chama não a devolve. `null` se não houver chave; erro claro se ela for
 * ilegível (ENCRYPTION_KEY ausente ou trocada).
 */
export async function obterChaveDoOpenrouter(): Promise<string | null> {
  const linha = await prisma.configuracaoDoWorkspace.findUnique({
    where: { id: ID_DA_CONFIGURACAO },
  })
  if (!linha?.openrouterChaveCifrada) return null
  return decifrar(linha.openrouterChaveCifrada)
}

/** Testa a chave gravada contra o OpenRouter. Só admin. */
export async function testarConexaoDoOpenrouter(
  autor: UsuarioAutenticado,
): Promise<{ ok: true; saldoRestante: number | null }> {
  exigirAdmin(autor)
  const chave = await obterChaveDoOpenrouter()
  if (!chave) {
    throw new ErroDeAplicacao(
      'Nenhuma chave do OpenRouter cadastrada. Cadastre uma antes de testar.',
      409,
      'chave_nao_configurada',
    )
  }
  const { saldoRestante } = await verificarChave(chave)
  return { ok: true, saldoRestante }
}
