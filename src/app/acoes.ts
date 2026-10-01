'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { entrar, exigirLimiteDeLogin } from '@/servicos/autenticacao'
import { ipDoCliente } from '@/lib/requisicao'
import { criar, editar, desativar, excluirDefinitivamente } from '@/servicos/usuarios'
import { atualizarPerfil, trocarSenha } from '@/servicos/perfil'
import { salvarConfiguracao as salvarConfiguracaoDoChat } from '@/servicos/chat-publico-config'
import { criar as criarAgenteNoServico, editar as editarAgenteNoServico, excluir as excluirAgenteNoServico } from '@/servicos/agentes'
import {
  salvarChaveDoOpenrouter,
  removerChaveDoOpenrouter,
  salvarModeloDeTranscricao,
  testarConexaoDoOpenrouter,
} from '@/servicos/integracoes'
import {
  conectar as conectarCanalTelegram,
  definirLimiteDiario as definirLimiteDoCanalTelegram,
  desconectar as desconectarCanalTelegram,
  pausar as pausarCanalTelegram,
  retomar as retomarCanalTelegram,
  verificar as verificarCanalTelegram,
} from '@/servicos/canal-telegram'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  exigirUsuario,
  exigirUsuarioAdmin,
  gravarCookieDeSessao,
  apagarCookieDeSessao,
} from '@/app/sessao-servidor'

export interface EstadoDoFormulario {
  erro?: string
  sucesso?: string
  /** Só o login: o e-mail digitado, devolvido para não ser apagado no erro. */
  email?: string
}

/**
 * Converte o erro em mensagem para a tela. Erro de aplicação carrega
 * mensagem segura; qualquer outro vira uma frase genérica — rastro de
 * pilha não chega ao usuário (L17).
 */
function mensagemDe(erro: unknown): string {
  if (erro instanceof ErroDeAplicacao) return erro.message
  console.error(erro)
  return 'Não foi possível concluir. Tente de novo.'
}

/**
 * Como `mensagemDe`, para ações que lidam com segredo: um erro inesperado
 * registra só o nome, nunca o objeto (que poderia carregar a chave, como o
 * erro de validação do Prisma, que imprime os argumentos).
 */
function mensagemSemSegredo(erro: unknown): string {
  if (erro instanceof ErroDeAplicacao) return erro.message
  console.error('Erro inesperado numa ação de integração:', erro instanceof Error ? erro.name : 'desconhecido')
  return 'Não foi possível concluir. Tente de novo.'
}

export async function autenticar(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    exigirLimiteDeLogin({ ip: await ipDoCliente(), email: form.get('email') })
    const { token } = await entrar({
      email: form.get('email'),
      senha: form.get('senha'),
    })
    await gravarCookieDeSessao(token)
  } catch (erro) {
    return { erro: mensagemDe(erro), email: String(form.get('email') ?? '') }
  }
  redirect('/')
}

export async function sair(): Promise<void> {
  await apagarCookieDeSessao()
  redirect('/entrar')
}

export async function criarUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const autor = await exigirUsuarioAdmin()
    await criar(autor, {
      nome: form.get('nome'),
      email: form.get('email'),
      senha: form.get('senha'),
      papel: form.get('papel') ?? 'usuario',
    })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/usuarios')
  return { sucesso: 'Usuário criado.' }
}

export async function editarUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const autor = await exigirUsuarioAdmin()
    const id = String(form.get('id'))
    await editar(autor, id, {
      nome: form.get('nome'),
      email: form.get('email'),
      papel: form.get('papel'),
    })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/usuarios')
  return { sucesso: 'Usuário atualizado.' }
}

export async function desativarUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const autor = await exigirUsuarioAdmin()
    await desativar(autor, String(form.get('id')))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/usuarios')
  return { sucesso: 'Usuário desativado.' }
}

/**
 * Exclusão definitiva e irreversível de um usuário (FT-10, PR-88): só admin, e a confirmação
 * de e-mail digitada na tela é conferida no servidor.
 */
export async function excluirUsuario(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const autor = await exigirUsuarioAdmin()
    const confirmacao = form.get('confirmacao')
    await excluirDefinitivamente(
      String(form.get('id')),
      autor.id,
      typeof confirmacao === 'string' ? confirmacao : '',
    )
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/usuarios')
  return { sucesso: 'Usuário excluído definitivamente.' }
}

export async function salvarPerfil(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const usuario = await exigirUsuario()
    await atualizarPerfil(usuario, {
      nome: form.get('nome'),
      email: form.get('email'),
    })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/perfil')
  return { sucesso: 'Perfil atualizado.' }
}

export async function salvarSenha(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const usuario = await exigirUsuario()
    // O token novo mantém quem trocou a senha dentro da sessão; as outras
    // sessões do mesmo usuário caem.
    const { token } = await trocarSenha(usuario, {
      senhaAtual: form.get('senhaAtual'),
      senhaNova: form.get('senhaNova'),
      confirmacao: form.get('confirmacao'),
    })
    await gravarCookieDeSessao(token)
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  return { sucesso: 'Senha alterada. As outras sessões foram encerradas.' }
}

export async function salvarChaveOpenrouter(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const admin = await exigirUsuarioAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: form.get('chave') })
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
  revalidatePath('/configuracoes/integracoes')
  return { sucesso: 'Chave salva. Use "Testar conexão" para conferir.' }
}

export async function testarConexaoOpenrouter(): Promise<EstadoDoFormulario> {
  try {
    const admin = await exigirUsuarioAdmin()
    const { saldoRestante } = await testarConexaoDoOpenrouter(admin)
    return {
      sucesso:
        saldoRestante === null
          ? 'Conexão funcionando: o OpenRouter aceitou a chave.'
          : `Conexão funcionando. Crédito restante da chave: US$ ${saldoRestante.toFixed(2)}.`,
    }
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
}

export async function removerChaveOpenrouter(): Promise<EstadoDoFormulario> {
  try {
    const admin = await exigirUsuarioAdmin()
    await removerChaveDoOpenrouter(admin)
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
  revalidatePath('/configuracoes/integracoes')
  return { sucesso: 'Chave removida.' }
}

/** Modelo de transcrição de vídeo (FT-08, PR-73): só o admin; vazio ou `restaurar` volta ao padrão. */
export async function salvarModeloTranscricao(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  let restaurado = false
  try {
    const admin = await exigirUsuarioAdmin()
    const modelo = form.get('restaurar') ? '' : form.get('modelo')
    restaurado = typeof modelo === 'string' && modelo.trim() === ''
    await salvarModeloDeTranscricao(admin, { modelo: modelo ?? '' })
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/configuracoes/integracoes')
  return { sucesso: restaurado ? 'Modelo restaurado para o padrão.' : 'Modelo de transcrição salvo.' }
}

/** Os campos do formulário de agente, como o serviço os valida. */
function camposDoAgente(form: FormData) {
  return {
    nome: form.get('nome'),
    instrucoes: form.get('instrucoes'),
    modelo: form.get('modelo'),
    temperatura: form.get('temperatura'),
    mensagemInicial: form.get('mensagemInicial'),
  }
}

export async function criarAgente(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  let id: string
  try {
    const autor = await exigirUsuario()
    id = (await criarAgenteNoServico(autor, camposDoAgente(form))).id
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/agentes')
  // Fora do try/catch: `redirect` lança um sinal que não pode ser engolido.
  redirect(`/agentes/${id}`)
}

export async function editarAgente(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const autor = await exigirUsuario()
    await editarAgenteNoServico(autor, String(form.get('id')), camposDoAgente(form))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/agentes')
  revalidatePath(`/agentes/${String(form.get('id'))}`)
  return { sucesso: 'Alterações salvas.' }
}

export async function excluirAgente(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const autor = await exigirUsuario()
    await excluirAgenteNoServico(autor, String(form.get('id')))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath('/agentes')
  redirect('/agentes')
}

/** Os campos do formulário do chat, como o serviço os valida; campo ausente vira texto vazio. */
function camposDoChat(form: FormData) {
  const texto = (nome: string) => String(form.get(nome) ?? '')
  return {
    // Caixa desmarcada não vai no envio: ausente é desligado.
    ativo: form.get('ativo') === 'on',
    titulo: texto('titulo'),
    cor: texto('cor'),
    posicao: texto('posicao'),
    avatar: texto('avatar'),
    avisoDePrivacidade: texto('avisoDePrivacidade'),
    avisoDePrivacidadeUrl: texto('avisoDePrivacidadeUrl'),
    dominiosPermitidos: texto('dominiosPermitidos'),
    limiteDiario: texto('limiteDiario'),
    sugestoes: texto('sugestoes'),
  }
}

export async function salvarChat(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const id = String(form.get('id') ?? '')
  try {
    const autor = await exigirUsuario()
    await salvarConfiguracaoDoChat(autor, id, camposDoChat(form))
  } catch (erro) {
    return { erro: mensagemDe(erro) }
  }
  revalidatePath(`/agentes/${id}/publicar`)
  return { sucesso: 'Configuração do chat salva.' }
}

// Canal Telegram (FT-07, PR-65, PR-69). As ações lidam com token: erro inesperado
// só registra o nome (`mensagemSemSegredo`) e nenhum retorno leva segredo.
const abaDeCanais = (agenteId: string) => `/agentes/${agenteId}/canais`

export async function conectarTelegram(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const id = String(form.get('id') ?? '')
  let usuario: string
  try {
    const autor = await exigirUsuario()
    const canal = await conectarCanalTelegram(autor, id, form.get('token'))
    usuario = canal.bot.username
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
  revalidatePath(abaDeCanais(id))
  return { sucesso: `Bot conectado: @${usuario}. Envie uma mensagem a ele no Telegram para testar.` }
}

export async function desconectarTelegram(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const id = String(form.get('id') ?? '')
  let aviso = ''
  try {
    const autor = await exigirUsuario()
    const { webhookRemovido } = await desconectarCanalTelegram(autor, id)
    if (!webhookRemovido) {
      aviso = ' O Telegram não confirmou a remoção do webhook; revogue o token no @BotFather se quiser garantir que o bot pare de enviar atualizações.'
    }
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
  revalidatePath(abaDeCanais(id))
  return { sucesso: `Bot desconectado. O histórico das conversas foi mantido.${aviso}` }
}

export async function pausarTelegram(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const id = String(form.get('id') ?? '')
  try {
    await pausarCanalTelegram(await exigirUsuario(), id)
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
  revalidatePath(abaDeCanais(id))
  return { sucesso: 'Bot pausado. Ele não responderá até você retomar; as mensagens enviadas nesse período não serão atendidas depois.' }
}

export async function retomarTelegram(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const id = String(form.get('id') ?? '')
  try {
    await retomarCanalTelegram(await exigirUsuario(), id)
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
  revalidatePath(abaDeCanais(id))
  return { sucesso: 'Bot retomado.' }
}

export async function verificarTelegram(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const id = String(form.get('id') ?? '')
  try {
    const r = await verificarCanalTelegram(await exigirUsuario(), id)
    const pendentes = r.pendentes > 0 ? ` Atualizações pendentes no Telegram: ${r.pendentes}.` : ''
    const ultimo = r.ultimoErroDoTelegram ? ` Último erro de entrega relatado pelo Telegram: ${r.ultimoErroDoTelegram}.` : ''
    revalidatePath(abaDeCanais(id))
    if (!r.urlConfere) {
      return {
        erro: `O endereço registrado no Telegram é diferente do esperado. Reconecte o bot para registrá-lo de novo.${pendentes}${ultimo}`,
      }
    }
    return { sucesso: `O webhook está correto.${pendentes}${ultimo}` }
  } catch (erro) {
    revalidatePath(abaDeCanais(id))
    return { erro: mensagemSemSegredo(erro) }
  }
}

export async function salvarLimiteTelegram(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  const id = String(form.get('id') ?? '')
  try {
    await definirLimiteDoCanalTelegram(await exigirUsuario(), id, form.get('limiteDiario'))
  } catch (erro) {
    return { erro: mensagemSemSegredo(erro) }
  }
  revalidatePath(abaDeCanais(id))
  return { sucesso: 'Limite diário salvo.' }
}
