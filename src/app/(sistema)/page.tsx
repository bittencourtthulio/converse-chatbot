import { exigirUsuario } from '@/lib/sessao-servidor'

/**
 * O painel — a tela inicial (P-9, E-1). Vem com título e subtítulo, e o
 * corpo vazio de propósito: são as features do projeto que o preenchem.
 */
export default async function Painel() {
  const usuario = await exigirUsuario()

  return (
    <>
      <h1 className="titulo-da-tela">Painel</h1>
      <p className="subtitulo-da-tela">
        Bem-vindo, {usuario.nome}. Esta é a tela inicial do sistema.
      </p>

      <p className="vazio">
        Ainda não há nada para mostrar aqui. As telas do projeto aparecem
        nesta área conforme forem entregues.
      </p>
    </>
  )
}
