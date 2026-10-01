import Link from 'next/link'
import { CuboIsometrico, type ArranjoDeCubos } from '@/componentes/CuboIsometrico'
import { Icone } from '@/componentes/Icones'

/**
 * Landing pública (FT-14). Componente de servidor, sem JavaScript no cliente: o FAQ é `<details>`,
 * as âncoras são links e o tema segue a preferência do sistema (o script do layout raiz).
 * Conteúdo só com o que o produto faz hoje; sem cadastro público (PR-02), sem prova social.
 */

const CANAIS: Array<{ titulo: string; texto: string; arranjo: ArranjoDeCubos }> = [
  {
    titulo: 'Chat no seu site',
    texto:
      'Cole um script antes do fim da página e o chat aparece num botão. Você escolhe a cor, a posição e quais sites podem exibi-lo.',
    arranjo: 'unico',
  },
  {
    titulo: 'Telegram',
    texto: 'Crie um bot no BotFather, cole o token e o agente passa a responder nas conversas privadas.',
    arranjo: 'par',
  },
  {
    titulo: 'Painel de testes',
    texto: 'Converse com o agente dentro do sistema antes de publicar e veja de quais fontes saiu cada resposta.',
    arranjo: 'pilha',
  },
]

const FONTES: Array<{ titulo: string; texto: string }> = [
  { titulo: 'Arquivos', texto: 'PDF, DOCX, TXT, Markdown, CSV, HTML, JSON e legendas SRT e VTT.' },
  { titulo: 'Textos', texto: 'Cole um texto com título e ele entra na base na hora.' },
  { titulo: 'Vídeos', texto: 'Envie um vídeo ou um áudio. A fala vira texto e entra na base.' },
  { titulo: 'Links do YouTube', texto: 'Cole o link e o sistema lê as legendas do vídeo, sem baixá-lo.' },
]

const PASSOS: Array<{ titulo: string; texto: string }> = [
  { titulo: 'Crie o agente', texto: 'Escreva as instruções, escolha o modelo de linguagem e a mensagem de boas-vindas.' },
  { titulo: 'Alimente a base', texto: 'Envie arquivos, textos, vídeos ou links do YouTube. O agente só responde com o que está lá.' },
  { titulo: 'Publique', texto: 'Ligue o chat no seu site com um script ou conecte um bot do Telegram.' },
]

const SEGURANCA: Array<{ titulo: string; texto: string }> = [
  { titulo: 'Chaves cifradas', texto: 'A chave do provedor de IA e o token do Telegram são guardados cifrados e nunca voltam ao navegador.' },
  { titulo: 'Limites de uso', texto: 'Há limite de mensagens por minuto e por dia nos canais públicos, e de tentativas de login.' },
  { titulo: 'Retenção de dados', texto: 'Conversas sem atividade são apagadas depois de 90 dias. O administrador muda o prazo.' },
  { titulo: 'Exclusão de dados', texto: 'Apague uma conversa, exporte ou apague tudo de uma pessoa, ou exclua um usuário.' },
  { titulo: 'Trilha de auditoria', texto: 'Quem trocou uma chave, apagou conversas ou mudou a retenção fica registrado, sem o texto das conversas.' },
  { titulo: 'Backup', texto: 'O administrador gera e restaura cópias de segurança do banco e dos arquivos.' },
]

const PERGUNTAS: Array<{ pergunta: string; resposta: string }> = [
  {
    pergunta: 'Posso testar o agente antes de publicar?',
    resposta:
      'Sim. A aba Testar conversa com o agente dentro do sistema e mostra as fontes de cada resposta. A prévia da aba Publicar mostra como o chat fica no site.',
  },
  {
    pergunta: 'O agente inventa respostas?',
    resposta:
      'Ele recebe a ordem de responder só com a base e de dizer que não encontrou quando a base não cobre a pergunta. Um modelo de linguagem pode errar mesmo assim, por isso vale testar com as perguntas reais da sua empresa.',
  },
  {
    pergunta: 'Para onde vão as mensagens?',
    resposta:
      'As conversas ficam no banco do seu servidor. Para gerar cada resposta, a pergunta e os trechos da base seguem para o provedor de modelos configurado pelo administrador, o OpenRouter.',
  },
  {
    pergunta: 'Preciso de uma chave de IA?',
    resposta: 'Sim. O administrador cadastra a chave do OpenRouter uma vez, em Configurações, e todos os agentes a usam.',
  },
  {
    pergunta: 'Como consigo acesso?',
    resposta: 'Não há cadastro aberto. Um administrador cria a conta de cada pessoa. Se você já tem uma, use o botão Entrar.',
  },
]

function Divisor() {
  return (
    <div className="lp-divisor" aria-hidden="true">
      <span className="lp-divisor-losango" />
    </div>
  )
}

function CartaoDeConversa() {
  return (
    <figure className="lp-cartao" aria-label="Exemplo ilustrativo de uma conversa com o agente">
      <div className="lp-cartao-topo">
        <span className="lp-cartao-avatar" aria-hidden="true">
          <Icone nome="conversa" tamanho={16} />
        </span>
        <span className="lp-cartao-nome">Atendimento</span>
      </div>
      <div className="lp-cartao-conversa">
        <p className="lp-bolha lp-bolha-visitante">Qual é o prazo para pedir reembolso?</p>
        <p className="lp-bolha lp-bolha-agente">
          Você pode pedir em até 7 dias corridos depois da compra <sup>[1]</sup>. O reembolso volta pelo mesmo meio de pagamento{' '}
          <sup>[2]</sup>.
        </p>
        <ul className="lp-cartao-fontes" aria-label="Fontes citadas">
          <li>
            <span>[1]</span> Política de reembolso.pdf
          </li>
          <li>
            <span>[2]</span> Perguntas frequentes.md
          </li>
        </ul>
      </div>
      <figcaption className="lp-cartao-legenda">Exemplo ilustrativo</figcaption>
    </figure>
  )
}

export function PaginaInicial({ nome }: { nome: string }) {
  return (
    <div className="lp" id="topo">
      <header className="lp-topo">
        <div className="lp-topo-interno">
          <a href="#topo" className="logotipo" aria-label={`${nome}, início da página`}>
            <span className="logotipo-marca">
              <Icone nome="conversa" tamanho={18} />
            </span>
            <span className="logotipo-nome">{nome}</span>
          </a>
          <nav className="lp-menu" aria-label="Seções da página">
            <a href="#canais">Canais</a>
            <a href="#conhecimento">Conhecimento</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#seguranca">Segurança</a>
            <a href="#perguntas">Perguntas</a>
          </nav>
          <Link href="/entrar" className="botao secundario lp-topo-entrar">
            Entrar
          </Link>
        </div>
      </header>

      <main>
        <section className="lp-faixa lp-hero" aria-labelledby="titulo-hero">
          <div className="lp-coluna lp-hero-grade">
            <div className="lp-hero-texto">
              <h1 id="titulo-hero" className="lp-titulo-hero">
                Agentes de IA que respondem <span className="lp-tinta-suave">com o que a sua empresa</span>{' '}
                <em className="lp-editorial">já sabe.</em>
              </h1>
              <p className="lp-subtitulo">
                Envie arquivos, textos e vídeos. O agente responde com base neles e mostra de onde tirou cada resposta. Publique no seu
                site ou no Telegram.
              </p>
              <div className="lp-acoes">
                <Link href="/entrar" className="botao primario lp-botao">
                  Entrar
                </Link>
                <a href="#como-funciona" className="botao secundario lp-botao">
                  Como funciona
                </a>
              </div>
            </div>
            <div className="lp-hero-painel">
              <CartaoDeConversa />
            </div>
          </div>
        </section>

        <Divisor />

        <section id="canais" className="lp-faixa" aria-labelledby="titulo-canais">
          <div className="lp-coluna lp-secao">
            <h2 id="titulo-canais" className="lp-titulo">
              Um agente, <span className="lp-tinta-suave">três lugares para conversar.</span>
            </h2>
            <ul className="lp-celulas lp-celulas-3">
              {CANAIS.map((c) => (
                <li key={c.titulo} className="lp-celula">
                  <div className="lp-ilustracao">
                    <CuboIsometrico arranjo={c.arranjo} />
                  </div>
                  <h3 className="lp-celula-titulo">{c.titulo}</h3>
                  <p className="lp-celula-texto">{c.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="conhecimento" className="lp-faixa" aria-labelledby="titulo-conhecimento">
          <div className="lp-coluna lp-secao">
            <h2 id="titulo-conhecimento" className="lp-titulo">
              Uma base de conhecimento <span className="lp-tinta-suave">que você controla.</span>
            </h2>
            <p className="lp-lead">
              O agente busca na base os trechos que respondem à pergunta e cita as fontes. Quando não acha nada, ele diz que não
              encontrou, em vez de inventar.
            </p>
            <ul className="lp-celulas lp-celulas-4">
              {FONTES.map((f) => (
                <li key={f.titulo} className="lp-celula lp-celula-texto-so">
                  <h3 className="lp-celula-titulo">{f.titulo}</h3>
                  <p className="lp-celula-texto">{f.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Divisor />

        <section id="como-funciona" className="lp-faixa" aria-labelledby="titulo-como">
          <div className="lp-coluna lp-secao">
            <h2 id="titulo-como" className="lp-titulo">
              Como funciona <span className="lp-tinta-suave">em três passos.</span>
            </h2>
            <ol className="lp-passos">
              {PASSOS.map((p) => (
                <li key={p.titulo} className="lp-passo">
                  <h3 className="lp-celula-titulo">{p.titulo}</h3>
                  <p className="lp-celula-texto">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="seguranca" className="lp-faixa" aria-labelledby="titulo-seguranca">
          <div className="lp-coluna lp-secao">
            <h2 id="titulo-seguranca" className="lp-titulo">
              Segurança e privacidade <span className="lp-tinta-suave">desde o primeiro dia.</span>
            </h2>
            <ul className="lp-lista-seguranca">
              {SEGURANCA.map((s) => (
                <li key={s.titulo}>
                  <h3 className="lp-celula-titulo">{s.titulo}</h3>
                  <p className="lp-celula-texto">{s.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Divisor />

        <section id="perguntas" className="lp-faixa" aria-labelledby="titulo-perguntas">
          <div className="lp-coluna lp-secao lp-secao-faq">
            <h2 id="titulo-perguntas" className="lp-titulo">
              Perguntas frequentes
            </h2>
            <div className="lp-faq">
              {PERGUNTAS.map((p) => (
                <details key={p.pergunta} className="lp-faq-item">
                  <summary>{p.pergunta}</summary>
                  <p>{p.resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-rodape">
        <div className="lp-coluna lp-rodape-interno">
          <span className="lp-rodape-nome">{nome}</span>
          <nav aria-label="Rodapé" className="lp-rodape-links">
            <Link href="/entrar">Entrar</Link>
            <a href="#como-funciona">Como funciona</a>
            <a href="#seguranca">Segurança</a>
            <a href="#perguntas">Perguntas</a>
            <a href="#topo">Voltar ao topo</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
