'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Alerta } from '@/componentes/Alerta'
import type { AcaoDeFormulario } from '@/componentes/Formulario'

function Botao() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao primario" disabled={pending}>
      {pending ? 'Gerando backup…' : 'Gerar backup agora'}
    </button>
  )
}

/**
 * O botão "Gerar backup agora" (FT-11, PR-96): copia o banco e os arquivos enviados para um arquivo
 * em BACKUP_DIR. Enquanto gera, o botão fica desabilitado; o resultado (ou o erro) aparece na própria
 * tela. O servidor confere o papel de admin de novo.
 */
export function GeradorDeBackup({ acao }: { acao: AcaoDeFormulario }) {
  const [retorno, gerar] = useActionState(acao, {})
  return (
    <form action={gerar} className="sistema-backup-gerador">
      {retorno.erro && <Alerta variante="erro">{retorno.erro}</Alerta>}
      {retorno.sucesso && <Alerta variante="sucesso">{retorno.sucesso}</Alerta>}
      <Botao />
      <p className="texto-de-apoio">Copia o banco de dados e os arquivos enviados para um único arquivo, sem parar o sistema.</p>
    </form>
  )
}
