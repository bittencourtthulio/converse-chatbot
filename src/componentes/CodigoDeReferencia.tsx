/**
 * O código de referência de um erro (FT-11, PR-93): o identificador que o usuário informa a quem
 * cuida do sistema e que o operador procura no log. Sem código, não mostra nada.
 */
export function CodigoDeReferencia({ codigo }: { codigo?: string | null }) {
  if (!codigo) return null
  return (
    <p className="codigo-de-referencia">
      Código de referência: <code>{codigo}</code>
    </p>
  )
}
