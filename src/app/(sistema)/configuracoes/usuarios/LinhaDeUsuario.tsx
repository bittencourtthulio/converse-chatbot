'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { desativarUsuario, excluirUsuario } from '@/app/acoes'
import { Badge } from '@/componentes/Badge'
import {
  TEXTO_DA_EXCLUSAO,
  emailConfere,
  podeOferecerExclusao,
} from '@/componentes/excluir-usuario-logica'

interface Props {
  usuario: {
    id: string
    nome: string
    email: string
    papel: string
    ativo: boolean
    ehVoce: boolean
  }
}

export function LinhaDeUsuario({ usuario }: Props) {
  const [estado, executar] = useActionState(desativarUsuario, {})
  const [estadoDaExclusao, executarExclusao, excluindo] = useActionState(excluirUsuario, {})
  const [confirmando, setConfirmando] = useState(false)
  const [digitado, setDigitado] = useState('')
  const botaoExcluir = useRef<HTMLButtonElement>(null)
  const campo = useRef<HTMLInputElement>(null)
  const devolverFoco = useRef(false)

  useEffect(() => {
    if (confirmando) campo.current?.focus()
    else if (devolverFoco.current) {
      devolverFoco.current = false
      botaoExcluir.current?.focus()
    }
  }, [confirmando])

  function cancelar() {
    devolverFoco.current = true
    setConfirmando(false)
    setDigitado('')
  }

  return (
    <>
      <tr>
        <td>
          <span className="linha">
            {usuario.nome}
            {usuario.ehVoce && <Badge>Você</Badge>}
          </span>
        </td>
        <td className="celula-secundaria">{usuario.email}</td>
        <td>
          <Badge variante={usuario.papel === 'admin' ? 'acento' : 'neutro'}>
            {usuario.papel === 'admin' ? 'Administrador' : 'Usuário'}
          </Badge>
        </td>
        <td>
          <Badge variante={usuario.ativo ? 'sucesso' : 'neutro'}>
            {usuario.ativo ? 'Ativo' : 'Desativado'}
          </Badge>
        </td>
        <td className="coluna-acoes">
          {estado.erro && (
            <span role="alert">
              <Badge variante="perigo">{estado.erro}</Badge>{' '}
            </span>
          )}
          <span className="linha">
            {usuario.ativo && (
              <form action={executar} className="linha">
                <input type="hidden" name="id" value={usuario.id} />
                <button type="submit" className="botao secundario botao-pequeno">
                  Desativar
                </button>
              </form>
            )}
            {podeOferecerExclusao(usuario) && !confirmando && (
              <button
                ref={botaoExcluir}
                type="button"
                className="botao perigo botao-pequeno"
                onClick={() => setConfirmando(true)}
              >
                Excluir definitivamente
              </button>
            )}
          </span>
        </td>
      </tr>
      {confirmando && (
        <tr>
          <td colSpan={5}>
            <form
              action={executarExclusao}
              className="confirmacao-de-exclusao"
              role="alertdialog"
              aria-labelledby={`excluir-titulo-${usuario.id}`}
              aria-describedby={`excluir-descricao-${usuario.id}`}
            >
              <input type="hidden" name="id" value={usuario.id} />
              <p className="secao-titulo sem-margem" id={`excluir-titulo-${usuario.id}`}>
                Excluir {usuario.nome} definitivamente?
              </p>
              <p className="texto-de-apoio" id={`excluir-descricao-${usuario.id}`}>
                {TEXTO_DA_EXCLUSAO.descricao} {TEXTO_DA_EXCLUSAO.alternativa}
              </p>
              <label className="campo">
                <span>
                  Para confirmar, digite o e-mail <strong>{usuario.email}</strong>
                </span>
                <input
                  ref={campo}
                  type="text"
                  name="confirmacao"
                  value={digitado}
                  onChange={(e) => setDigitado(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </label>
              {estadoDaExclusao.erro && (
                <p className="fonte-erro" role="alert">
                  {estadoDaExclusao.erro}
                </p>
              )}
              <div className="linha">
                <button
                  type="submit"
                  className="botao perigo"
                  disabled={excluindo || !emailConfere(digitado, usuario.email)}
                >
                  {excluindo ? 'Excluindo…' : 'Confirmar exclusão'}
                </button>
                <button type="button" className="botao secundario" onClick={cancelar} disabled={excluindo}>
                  Cancelar
                </button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  )
}
