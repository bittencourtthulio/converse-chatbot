'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ABAS_DO_AGENTE, hrefDaAba, type AbaDoAgente } from '@/componentes/abas-do-agente'

/**
 * Navegação entre as seções de um agente. As abas vêm de `abas-do-agente.ts`.
 * `caminhoAtual` existe para teste e para quem já sabe a rota; sem ele vale o
 * caminho do navegador.
 */
export function AbasDoAgente({
  agenteId,
  abas = ABAS_DO_AGENTE,
  caminhoAtual,
}: {
  agenteId: string
  abas?: AbaDoAgente[]
  caminhoAtual?: string
}) {
  const doRoteador = usePathname()
  const caminho = caminhoAtual ?? doRoteador ?? ''

  return (
    <nav className="abas" aria-label="Seções do agente">
      {abas.map((aba) => {
        const href = hrefDaAba(agenteId, aba)
        const ativa = aba.caminho === '' ? caminho === href : caminho === href || caminho.startsWith(`${href}/`)
        return (
          <Link key={href} href={href} className="aba" aria-current={ativa ? 'page' : undefined}>
            {aba.rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
