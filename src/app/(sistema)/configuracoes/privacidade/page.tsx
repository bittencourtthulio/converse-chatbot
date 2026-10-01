import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'

/** Esqueleto da tela (T-06.01): o conteúdo entra nas tasks seguintes da sprint 06. */
export default async function Pagina() {
  await exigirUsuarioAdmin()
  return <CabecalhoDaPagina titulo="Privacidade" subtitulo="Retenção das conversas, aviso de privacidade e direitos do titular." />
}
