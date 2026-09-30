'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { entrar } from '@/servicos/autenticacao'
import { criar, editar, desativar } from '@/servicos/usuarios'
import { atualizarPerfil, trocarSenha } from '@/servicos/perfil'
import { ErroDeAplicacao } from '@/lib/erros'
import {
  exigirUsuario,
  exigirUsuarioAdmin,
  gravarCookieDeSessao,
  apagarCookieDeSessao,
} from '@/lib/sessao-servidor'

export interface EstadoDoFormulario {
  erro?: string
  sucesso?: string
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

export async function autenticar(
  _estado: EstadoDoFormulario,
  form: FormData,
): Promise<EstadoDoFormulario> {
  try {
    const { token } = await entrar({
      email: form.get('email'),
      senha: form.get('senha'),
    })
    await gravarCookieDeSessao(token)
  } catch (erro) {
    return { erro: mensagemDe(erro) }
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
