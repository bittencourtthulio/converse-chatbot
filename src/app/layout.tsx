import type { Metadata } from 'next'
import { ambiente } from '@/lib/ambiente'
import { geist, inter, serifaItalica } from './fontes'
import '../estilos/global.css'

export function generateMetadata(): Metadata {
  const nome = ambiente.nomeDoProduto
  return {
    title: { default: nome, template: `%s · ${nome}` },
    description: `${nome}: agentes de IA que respondem com a base de conhecimento da sua empresa.`,
  }
}

/**
 * Resolve o tema antes da primeira pintura: a escolha salva, ou a preferência
 * do sistema quando não há escolha. Sem isso a página piscaria no tema errado.
 */
const SCRIPT_DO_TEMA = `try{var t=localStorage.getItem('tema');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    // O script altera data-theme antes de o React hidratar; sem o aviso
    // suprimido, o React reclamaria da diferença nesse atributo.
    <html lang="pt-BR" className={`${geist.variable} ${inter.variable} ${serifaItalica.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DO_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
