// Integrações do workspace (PR-06, PR-14): a chave do OpenRouter, uma só por
// instalação, gravada cifrada. O estado que sai daqui nunca leva a chave nem o
// texto cifrado: só a máscara. Só o admin lê o estado e mexe na chave (PR-12).
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { cifrar, decifrar, mascararSegredo } from '@/lib/cripto'
import { ErroDeAplicacao, entradaInvalida, naoAutenticado } from '@/lib/erros'
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

/**
 * Há chave do OpenRouter gravada? Só responde sim ou não: não decifra nada,
 * então serve a qualquer usuário (a tela de teste avisa antes de enviar).
 */
export async function chaveDoOpenrouterConfigurada(): Promise<boolean> {
  const linha = await prisma.configuracaoDoWorkspace.findUnique({
    where: { id: ID_DA_CONFIGURACAO },
    select: { openrouterChaveCifrada: true },
  })
  return Boolean(linha?.openrouterChaveCifrada)
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

// Modelo de transcrição (FT-08, PR-73): o do banco, se o admin definiu um; senão
// o de OPENROUTER_MODELO_TRANSCRICAO; senão a constante do ambiente.ts. O campo é
// texto livre porque a lista de modelos do OpenRouter não diz quais aceitam áudio.

export interface EstadoDoModeloDeTranscricao {
  /** O modelo que a próxima transcrição vai usar. */
  efetivo: string
  /** O que o admin salvou, ou `null` se vale o padrão. */
  salvo: string | null
  /** O padrão do ambiente (variável ou constante). */
  padrao: string
}

const entradaDoModelo = z.object({
  modelo: z
    .string({ message: 'Informe o modelo de transcrição.' })
    .trim()
    .max(100, 'O nome do modelo pode ter até 100 caracteres.')
    .regex(/^[A-Za-z0-9._:/-]*$/, 'O nome do modelo só pode ter letras, números e . _ : / -'),
})

async function modeloSalvo(): Promise<string | null> {
  const linha = await prisma.configuracaoDoWorkspace.findUnique({
    where: { id: ID_DA_CONFIGURACAO },
    select: { modeloDeTranscricao: true },
  })
  return linha?.modeloDeTranscricao?.trim() || null
}

/** O modelo que a fila usa para transcrever: banco, depois ambiente, depois constante. */
export async function modeloDeTranscricaoEfetivo(): Promise<string> {
  return (await modeloSalvo()) ?? ambiente.openrouterModeloTranscricao
}

/** O modelo em uso, para a tela avisar do consumo de créditos: vale para qualquer usuário. */
export async function estadoDoModeloDeTranscricao(autor: UsuarioAutenticado): Promise<EstadoDoModeloDeTranscricao> {
  if (!autor?.id) throw naoAutenticado()
  const salvo = await modeloSalvo()
  const padrao = ambiente.openrouterModeloTranscricao
  return { efetivo: salvo ?? padrao, salvo, padrao }
}

/** Salva o modelo de transcrição (só admin). Vazio restaura o padrão. */
export async function salvarModeloDeTranscricao(
  autor: UsuarioAutenticado,
  entrada: unknown,
): Promise<EstadoDoModeloDeTranscricao> {
  exigirAdmin(autor)
  const dados = entradaDoModelo.safeParse(entrada)
  if (!dados.success) throw entradaInvalida(dados.error.issues[0]?.message ?? 'Entrada inválida.')
  const modelo = dados.data.modelo === '' ? null : dados.data.modelo
  await prisma.configuracaoDoWorkspace.upsert({
    where: { id: ID_DA_CONFIGURACAO },
    create: { id: ID_DA_CONFIGURACAO, modeloDeTranscricao: modelo, atualizadoPor: autor.id },
    update: { modeloDeTranscricao: modelo, atualizadoPor: autor.id },
  })
  return estadoDoModeloDeTranscricao(autor)
}
