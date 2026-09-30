'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { entrar, exigirLimiteDeLogin } from '@/servicos/autenticacao'
import { ipDoCliente } from '@/lib/requisicao'
import { criar, editar, desativar } from '@/servicos/usuarios'
import { atualizarPerfil, trocarSenha } from '@/servicos/perfil'
import { salvarConfiguracao as salvarConfiguracaoDoChat } from '@/servicos/chat-publico-config'
import { criar as criarAgenteNoServico, editar as editarAgenteNoServico, excluir as excluirAgenteNoServico } from '@/servicos/agentes'
import {
  salvarChaveDoOpenrouter,
  removerChaveDoOpenrouter,
  testarConexaoDoOpenrouter,
} from '@/servicos/integracoes'
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
