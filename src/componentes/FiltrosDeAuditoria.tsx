import Link from 'next/link'
import { CAMINHO_DA_AUDITORIA, OPCOES_DE_ACAO, type FiltrosDaTela } from '@/componentes/auditoria-logica'

/**
 * Os filtros da auditoria: um formulário GET, que funciona sem JavaScript e deixa o filtro na
 * URL (compartilhável e com o botão Voltar). Ação, usuário e período.
 */
export function FiltrosDeAuditoria({
  usuarios,
  filtros,
}: {
  usuarios: Array<{ id: string; nome: string; email: string }>
  filtros: FiltrosDaTela
}) {
  const ativo = Boolean(filtros.acao || filtros.usuarioId || filtros.de || filtros.ate)
  return (
    <form method="get" action={CAMINHO_DA_AUDITORIA} role="search" aria-label="Filtrar o registro de auditoria" className="filtros-de-auditoria cartao">
      <label className="campo">
        <span>Ação</span>
        <select name="acao" defaultValue={filtros.acao ?? ''}>
          {OPCOES_DE_ACAO.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
      </label>
      <label className="campo">
        <span>Quem fez</span>
        <select name="usuario" defaultValue={filtros.usuarioId ?? ''}>
          <option value="">Todas as pessoas</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} ({u.email})
            </option>
          ))}
        </select>
      </label>
      <label className="campo">
        <span>De</span>
        <input type="date" name="de" defaultValue={filtros.de ?? ''} />
      </label>
      <label className="campo">
        <span>Até</span>
        <input type="date" name="ate" defaultValue={filtros.ate ?? ''} />
      </label>
      <div className="linha filtros-acoes">
        <button type="submit" className="botao primario">
          Filtrar
        </button>
        {ativo && (
          <Link href={CAMINHO_DA_AUDITORIA} className="botao secundario">
            Limpar filtros
          </Link>
        )}
      </div>
    </form>
  )
}
