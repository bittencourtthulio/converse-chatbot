import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { PainelDoSistema } from '@/componentes/PainelDoSistema'
import { obterSistema } from '@/servicos/sistema'

/**
 * Configurações > Sistema (FT-11, PR-95): o estado de saúde e o detalhe da instalação, só para o
 * admin. A guarda está no layout da pasta e é repetida aqui. Carregando é o `loading.tsx` da pasta e
 * erro inesperado é o `error.tsx` do sistema, com o código de referência.
 */
export default async function Sistema() {
  const admin = await exigirUsuarioAdmin()
  const sistema = await obterSistema(admin)

  return (
    <div className="pilha">
      <CabecalhoDaPagina titulo="Sistema" subtitulo="O estado de saúde, a versão e o que está configurado nesta instalação." />
      <PainelDoSistema sistema={sistema} />
    </div>
  )
}
