import Link from 'next/link'
import { Badge } from '@/componentes/Badge'
import type { PrimeirosPassos as Passos } from '@/servicos/painel'

interface Passo {
  feito: boolean
  titulo: string
  descricao: string
  link?: { href: string; texto: string }
}

/**
 * A lista de primeiros passos do painel (PR-82). Some sozinha quando todos estão feitos. O
 * link das Integrações só vai para o admin (só ele configura a chave); o usuário comum vê o
 * passo, com a orientação de pedir a um administrador. O estado de cada passo é texto
 * ("Feito" ou "Pendente"), nunca só cor.
 */
export function PrimeirosPassos({ passos, ehAdmin }: { passos: Passos; ehAdmin: boolean }) {
  if (passos.completo) return null
  const lista: Passo[] = [
    {
      feito: passos.chaveConfigurada,
      titulo: 'Configurar a chave do OpenRouter',
      descricao: ehAdmin
        ? 'Sem a chave, os agentes não conseguem responder.'
        : 'Peça a um administrador para configurar a chave: sem ela, os agentes não conseguem responder.',
      ...(ehAdmin && { link: { href: '/configuracoes/integracoes', texto: 'Abrir Integrações' } }),
    },
    {
      feito: passos.primeiroAgente,
      titulo: 'Criar o primeiro agente',
      descricao: 'Escreva as instruções, escolha o modelo e ajuste a temperatura.',
      link: { href: '/agentes/novo', texto: 'Criar agente' },
    },
    {
      feito: passos.primeiraFontePronta,
      titulo: 'Adicionar a primeira fonte de conhecimento',
      descricao: 'Abra um agente e envie um arquivo, um texto ou um vídeo na aba Conhecimento.',
      link: { href: '/agentes', texto: 'Ir para os agentes' },
    },
    {
      feito: passos.canalAtivo,
      titulo: 'Publicar o chat ou conectar o Telegram',
      descricao: 'Na aba Publicar do agente, copie o script do chat; na aba Canais, conecte um bot.',
      link: { href: '/agentes', texto: 'Ir para os agentes' },
    },
  ]
  const feitos = lista.filter((p) => p.feito).length
  return (
    <section className="cartao cartao-corpo" aria-labelledby="primeiros-passos-titulo">
      <h2 className="secao-titulo" id="primeiros-passos-titulo">
        Primeiros passos
      </h2>
      <p className="texto-de-apoio">
        {feitos} de {lista.length} concluídos. Esta lista some quando você terminar.
      </p>
      <ol className="primeiros-passos">
        {lista.map((p) => (
          <li key={p.titulo} className={p.feito ? 'passo-feito' : 'passo-pendente'}>
            <div className="passo-corpo">
              <p className="passo-titulo">{p.titulo}</p>
              <p className="texto-de-apoio">{p.descricao}</p>
              {!p.feito && p.link && (
                <Link href={p.link.href} className="botao secundario botao-pequeno">
                  {p.link.texto}
                </Link>
              )}
            </div>
            <Badge variante={p.feito ? 'sucesso' : 'aviso'}>{p.feito ? 'Feito' : 'Pendente'}</Badge>
          </li>
        ))}
      </ol>
    </section>
  )
}
