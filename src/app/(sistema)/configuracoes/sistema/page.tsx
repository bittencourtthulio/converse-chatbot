import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { Badge } from '@/componentes/Badge'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { obterSistema } from '@/servicos/sistema'

const ESTADO = {
  ok: { rotulo: 'Tudo em ordem', variante: 'sucesso' },
  degradado: { rotulo: 'Funcionando com limitações', variante: 'aviso' },
  falha: { rotulo: 'Com falha', variante: 'perigo' },
} as const

/**
 * Configurações > Sistema (FT-11, PR-95): o estado de saúde e o detalhe da instalação, só para o
 * admin. A guarda está no layout da pasta e é repetida aqui. Carregando é o `loading.tsx` da pasta e
 * erro inesperado é o `error.tsx` do sistema, com o código de referência.
 */
export default async function Sistema() {
  const admin = await exigirUsuarioAdmin()
  const sistema = await obterSistema(admin)
  const estado = ESTADO[sistema.saude.status]

  return (
    <div className="pilha">
      <CabecalhoDaPagina titulo="Sistema" subtitulo="O estado de saúde, a versão e o que está configurado nesta instalação." />
      <section className="cartao" aria-labelledby="titulo-estado-geral">
        <div className="cartao-corpo">
          <div className="linha linha-entre">
            <h2 className="secao-titulo sem-margem" id="titulo-estado-geral">
              Estado geral
            </h2>
            <Badge variante={estado.variante}>{estado.rotulo}</Badge>
          </div>
        </div>
      </section>
    </div>
  )
}
