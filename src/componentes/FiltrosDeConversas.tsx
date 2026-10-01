import Link from 'next/link'
import { CANAIS_DO_HISTORICO, rotuloDoCanal } from '@/servicos/historico-logica'
import type { FiltrosDaTela } from '@/componentes/conversas-logica'

/**
 * Os filtros da lista: um formulário GET, que funciona sem JavaScript e deixa o filtro na
 * URL (compartilhável e com o botão Voltar). Agente, canal, texto e período.
 */
export function FiltrosDeConversas({
  agentes,
  filtros,
}: {
  agentes: Array<{ id: string; nome: string }>
  filtros: FiltrosDaTela
}) {
  const ativo = Boolean(filtros.agenteId || filtros.canal || filtros.texto || filtros.de || filtros.ate)
  return (
    <form method="get" action="/conversas" role="search" aria-label="Filtrar conversas" className="filtros-de-conversas cartao">
      <label className="campo">
        <span>Agente</span>
        <select name="agente" defaultValue={filtros.agenteId ?? ''}>
          <option value="">Todos os agentes</option>
          {agentes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="campo">
        <span>Canal</span>
        <select name="canal" defaultValue={filtros.canal ?? ''}>
          <option value="">Todos os canais</option>
          {CANAIS_DO_HISTORICO.map((c) => (
            <option key={c} value={c}>
              {rotuloDoCanal(c)}
            </option>
          ))}
        </select>
      </label>
      <label className="campo campo-largo">
        <span>Buscar no texto</span>
        <input type="text" name="texto" maxLength={200} defaultValue={filtros.texto ?? ''} placeholder="Palavra ou frase das mensagens" autoComplete="off" />
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
          <Link href="/conversas" className="botao secundario">
            Limpar filtros
          </Link>
        )}
      </div>
    </form>
  )
}
