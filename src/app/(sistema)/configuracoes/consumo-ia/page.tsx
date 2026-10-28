import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { PainelDeConsumoDeIA } from '@/componentes/PainelDeConsumoDeIA'
import { obterConsumoDeIA } from '@/servicos/consumo-ia'

export default async function ConsumoDeIA({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const admin = await exigirUsuarioAdmin()
  const parametros = await searchParams
  const consumo = await obterConsumoDeIA(admin, {
    dias: typeof parametros.dias === 'string' ? Number(parametros.dias) : undefined,
    pagina: typeof parametros.pagina === 'string' ? Number(parametros.pagina) : undefined,
  })
  return (
    <div className="pilha">
      <CabecalhoDaPagina titulo="Consumo de IA" subtitulo="Acompanhe os custos e todas as chamadas ao OpenRouter nesta instalação." />
      <PainelDeConsumoDeIA consumo={consumo} />
    </div>
  )
}
