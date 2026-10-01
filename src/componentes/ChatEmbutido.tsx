'use client'

import { useCallback, useEffect, useId, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { AvatarDoChat, type AvatarDoChatNome } from '@/componentes/AvatarDoChat'
import { Icone } from '@/componentes/Icones'
import { TextoDoModelo } from '@/componentes/TextoDoModelo'
import { decidirTecla, type Bolha } from '@/componentes/estado-da-conversa'
import {
  LIMITE_DA_MENSAGEM_DO_EMBED,
  LIMITE_PARA_AVISO_DO_EMBED,
  ESTADO_INICIAL_DO_APAGAR,
  MENSAGEM_DE_SEM_CONEXAO,
  apagarMinhaConversaNoServidor,
  armazenamentoDoNavegador,
  corpoDoEnvio,
  criarGuardaDoVisitante,
  enderecosDoEmbed,
  erroDaResposta,
  estiloDoAgente,
  lerRetomada,
  podeEnviarNoEmbed,
  reduzirApagar,
  reduzirEmbed,
  sugestoesVisiveis,
  type GuardaDoVisitante,
  type ModoDoEmbed,
} from '@/componentes/embed-logica'
import { estadoInicial } from '@/componentes/estado-da-conversa'
import { fonteDoNumero, numerosDeReferencia } from '@/componentes/fontes-da-resposta-logica'
import { lerEventos } from '@/componentes/leitor-de-sse'
import {
  avisarOPai,
  lerMensagemDePrevia,
  mensagemDeFechar,
  mensagemDePronto,
  mensagemDeRedimensionar,
} from '@/componentes/embed-mensagens'

/** O que a página do iframe mostra do agente: só campos visuais (PR-56). */
export interface ConfiguracaoDoEmbed {
  titulo: string
  cor: string
  posicao: 'direita' | 'esquerda'
  avatar: AvatarDoChatNome
  mensagemInicial: string
  avisoDePrivacidade: { texto: string; url: string | null } | null
  sugestoes: string[]
}

export interface ChatEmbutidoProps {
  agenteId: string
  configuracao: ConfiguracaoDoEmbed
  modo: ModoDoEmbed
  /** Avisa a página que hospeda o iframe que o visitante quer fechar o chat. */
  aoFechar?: () => void
}

function BolhaDoEmbed({ bolha, titulo }: { bolha: Bolha; titulo: string }) {
  const doVisitante = bolha.papel === 'user'
  const digitando = bolha.estado === 'digitando'
  const fontes = bolha.fontes ?? []
  const idBase = useId()
  const referencias = fontes.length > 0 ? numerosDeReferencia(fontes) : undefined

  // Clicar em [n] leva o foco ao chip da fonte daquele trecho.
  const aoReferenciar = (n: number) => {
    const fonteId = fonteDoNumero(fontes, n)
    if (fonteId) document.getElementById(`${idBase}-${fonteId}`)?.focus()
  }

  return (
    <div className={`chat-linha ${doVisitante ? 'chat-linha-usuario' : 'chat-linha-agente'}`}>
      <div className={`bolha ${doVisitante ? 'bolha-usuario bolha-do-embed' : 'bolha-agente'}`}>
        <span className="somente-leitor">{doVisitante ? 'Você: ' : `${titulo}: `}</span>
        {doVisitante ? (
          <p className="bolha-texto-simples">{bolha.texto}</p>
        ) : digitando && bolha.texto === '' ? (
          <span className="indicador-de-digitacao" role="status">
            <span className="somente-leitor">O assistente está escrevendo…</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </span>
        ) : (
          <TextoDoModelo texto={bolha.texto} referencias={referencias} aoReferenciar={aoReferenciar} />
        )}
        {!doVisitante && fontes.length > 0 && (
          <ul className="embed-fontes" aria-label="Fontes da resposta">
            {fontes.map((f) => (
              <li
                key={f.fonteId}
                id={`${idBase}-${f.fonteId}`}
                tabIndex={-1}
                className={f.citada ? 'embed-chip embed-chip-citada' : 'embed-chip'}
              >
                {f.titulo}
                {f.citada && (
                  <span className="embed-chip-numeros"> {f.trechos.map((t) => `[${t.n}]`).join(' ')}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {bolha.estado === 'interrompida' && <span className="bolha-nota">Resposta interrompida.</span>}
        {bolha.estado === 'erro' && <span className="bolha-nota">Resposta incompleta.</span>}
      </div>
    </div>
  )
}

/**
 * O chat compacto da página do iframe (FT-06, PR-61). O estado da conversa é o
 * reducer puro do painel (`estado-da-conversa.ts`) e a lógica de visitante,
 * endereços e erros vem de `embed-logica.ts`; aqui só há DOM e `fetch`. Modo
 * `publico`: API pública, visitante no `localStorage` (com try/catch), conversa
 * retomada. Modo `previa`: endpoint do painel, para o usuário logado ver o chat
 * sem gastar o limite público.
 */
export function ChatEmbutido({ agenteId, configuracao: configuracaoInicial, modo, aoFechar }: ChatEmbutidoProps) {
  // A prévia do painel muda a configuração ao vivo por postMessage; o público não.
  const [configuracao, setConfiguracao] = useState(configuracaoInicial)
  // No servidor é falso; no navegador, verdadeiro se a página está dentro de um iframe.
  const moldurado = useSyncExternalStore(
    () => () => undefined,
    () => window.parent !== window,
    () => false,
  )
  const [expandido, setExpandido] = useState(false)
  const [estado, despachar] = useReducer(reduzirEmbed, undefined, () => estadoInicial())
  const [texto, setTexto] = useState('')
  const [retomando, setRetomando] = useState(false)
  const [apagar, despacharApagar] = useReducer(reduzirApagar, ESTADO_INICIAL_DO_APAGAR)
  const idDoCampo = useId()
  const idDaConfirmacao = useId()
  const guarda = useRef<GuardaDoVisitante | null>(null)
  const controle = useRef<AbortController | null>(null)
  const campo = useRef<HTMLTextAreaElement>(null)
  const lista = useRef<HTMLDivElement>(null)
  const pertoDoFim = useRef(true)
  const contagem = useRef(0)
  const enderecos = enderecosDoEmbed(modo, agenteId)

  const obterGuarda = useCallback((): GuardaDoVisitante => {
    guarda.current ??= criarGuardaDoVisitante(modo === 'publico' ? armazenamentoDoNavegador() : null)
    return guarda.current
  }, [modo])

  // Ao abrir: se há conversa guardada, pede ao servidor as últimas mensagens dela.
  useEffect(() => {
    if (modo !== 'publico' || !enderecos.retomar) return
    const g = obterGuarda()
    if (!g.conversaId(agenteId)) return
    const abortar = new AbortController()
    setRetomando(true)
    fetch(enderecos.retomar, { headers: { 'X-Visitante-Id': g.visitanteId() }, signal: abortar.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((corpo: unknown) => {
        const r = lerRetomada(corpo)
        if (r) despachar({ tipo: 'retomar', retomada: r })
        else g.esquecerConversa(agenteId)
      })
      .catch(() => undefined)
      .finally(() => setRetomando(false))
    return () => abortar.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agenteId, modo])

  // Prévia: a configuração ainda não salva chega do painel, da mesma origem.
  useEffect(() => {
    if (modo !== 'previa') return
    const ouvir = (evento: MessageEvent) => {
      const nova = lerMensagemDePrevia(evento, window.location.origin)
      if (nova) setConfiguracao((atual) => ({ ...atual, ...nova }))
    }
    window.addEventListener('message', ouvir)
    // Só agora o iframe escuta: o painel espera este aviso para mandar a configuração.
    avisarOPai(mensagemDePronto(), window)
    return () => window.removeEventListener('message', ouvir)
  }, [modo])

  // Foco no campo ao abrir e depois de cada resposta.
  useEffect(() => {
    if (!estado.transmitindo && !retomando) campo.current?.focus()
  }, [estado.transmitindo, retomando])

  // Rolagem automática, a menos que a pessoa tenha subido para reler.
  useEffect(() => {
    const el = lista.current
    if (el && pertoDoFim.current) el.scrollTop = el.scrollHeight
  }, [estado.bolhas, estado.erro, retomando])

  useEffect(() => () => controle.current?.abort(), [])

  const aoRolar = () => {
    const el = lista.current
    if (el) pertoDoFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  const enviar = useCallback(
    async (mensagem: string) => {
      if (!podeEnviarNoEmbed(mensagem, estado.transmitindo)) return
      const pergunta = mensagem.trim()
      const g = obterGuarda()
      const abortar = new AbortController()
      controle.current = abortar
      contagem.current += 1
      pertoDoFim.current = true
      despachar({ tipo: 'enviar', texto: pergunta, idDoUsuario: `u-${contagem.current}`, idDoAgente: `a-${contagem.current}` })
      setTexto('')
      try {
        const resposta = await fetch(enderecos.conversar, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            corpoDoEnvio(modo, {
              visitanteId: modo === 'publico' ? g.visitanteId() : '',
              conversaId: estado.conversaId ?? g.conversaId(agenteId),
              mensagem: pergunta,
            }),
          ),
          signal: abortar.signal,
        })
        if (!resposta.ok || !resposta.body) {
          const corpo: unknown = await resposta.json().catch(() => null)
          despachar({ tipo: 'recusada', erro: erroDaResposta(modo, resposta.status, corpo) })
          // A conversa guardada não existe mais no servidor: a próxima começa outra.
          if (resposta.status === 404) g.esquecerConversa(agenteId)
          setTexto(pergunta)
          return
        }
        const conversaId = resposta.headers.get('X-Conversa-Id')
        if (conversaId) {
          despachar({ tipo: 'conversa', conversaId })
          g.guardarConversa(agenteId, conversaId)
        }
        for await (const evento of lerEventos(resposta.body, abortar.signal)) {
          if (evento.tipo === 'trecho') despachar({ tipo: 'trecho', texto: evento.texto })
          else if (evento.tipo === 'fontes') despachar({ tipo: 'fontes', fontes: evento.fontes })
          else if (evento.tipo === 'fim') {
            despachar({ tipo: 'fim', conversaId: evento.conversaId, mensagemId: evento.mensagemId })
            g.guardarConversa(agenteId, evento.conversaId)
          } else if (evento.tipo === 'erro') {
            // No canal público a mensagem do servidor já é a frase única; a prévia mostra a do painel.
            despachar({ tipo: 'erro', erro: erroDaResposta(modo, 200, evento) })
          }
        }
      } catch {
        if (!abortar.signal.aborted) {
          despachar({ tipo: 'erro', erro: { codigo: 'conexao_interrompida', mensagem: MENSAGEM_DE_SEM_CONEXAO } })
        }
      }
    },
    [agenteId, enderecos.conversar, estado.conversaId, estado.transmitindo, modo, obterGuarda],
  )

  const novaConversa = () => {
    controle.current?.abort()
    despachar({ tipo: 'nova' })
    obterGuarda().esquecerConversa(agenteId)
    setTexto('')
    campo.current?.focus()
  }

  // "Apagar minha conversa" (FT-10, PR-90): apaga no servidor tudo o que este visitante tem com
  // o agente e recomeça do zero. O id do visitante fica (pode haver conversas com outros agentes).
  const apagarMinhaConversa = async () => {
    if (!enderecos.apagar || apagar.apagando) return
    despacharApagar({ tipo: 'apagando' })
    const r = await apagarMinhaConversaNoServidor(enderecos.apagar, obterGuarda().visitanteId())
    if (!r.ok) {
      despacharApagar({ tipo: 'falhou', mensagem: r.mensagem })
      return
    }
    controle.current?.abort()
    despachar({ tipo: 'nova' })
    obterGuarda().esquecerConversa(agenteId)
    setTexto('')
    despacharApagar({ tipo: 'concluido' })
    campo.current?.focus()
  }

  const fechar = aoFechar ?? (() => void avisarOPai(mensagemDeFechar(), window))
  const podeFechar = Boolean(aoFechar) || moldurado
  const alternarTamanho = () => {
    const proximo = !expandido
    setExpandido(proximo)
    avisarOPai(mensagemDeRedimensionar(proximo), window)
  }

  const { titulo, cor, avatar, mensagemInicial, avisoDePrivacidade, sugestoes } = configuracao
  const vazio = estado.bolhas.length === 0
  const excedeu = texto.length > LIMITE_DA_MENSAGEM_DO_EMBED
  const ofertadas = retomando ? [] : sugestoesVisiveis(sugestoes, estado.bolhas.length)

  return (
    <section
      className="embed"
      style={estiloDoAgente(cor)}
      data-modo={modo}
      aria-label={`Chat com ${titulo}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && podeFechar) fechar()
      }}
    >
      <header className="embed-cabecalho">
        <AvatarDoChat avatar={avatar} titulo={titulo} />
        <div className="embed-titulo">
          <h1>{titulo}</h1>
          {modo === 'previa' && <span className="embed-selo">Prévia</span>}
        </div>
        <button
          type="button"
          className="embed-botao-icone"
          onClick={novaConversa}
          disabled={vazio && !estado.erro}
          aria-label="Nova conversa"
          title="Nova conversa"
        >
          <Icone nome="atualizar" tamanho={18} />
        </button>
        {modo === 'publico' && (
          <button
            type="button"
            className="embed-botao-icone"
            onClick={() => despacharApagar({ tipo: 'pedir' })}
            aria-label="Apagar minha conversa"
            aria-expanded={apagar.confirmando}
            aria-controls={idDaConfirmacao}
            title="Apagar minha conversa"
          >
            <Icone nome="lixeira" tamanho={18} />
          </button>
        )}
        {moldurado && modo === 'publico' && (
          <button
            type="button"
            className="embed-botao-icone embed-ampliar"
            onClick={alternarTamanho}
            aria-label={expandido ? 'Reduzir o chat' : 'Ampliar o chat'}
            aria-pressed={expandido}
            title={expandido ? 'Reduzir' : 'Ampliar'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              {expandido ? (
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              ) : (
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              )}
            </svg>
          </button>
        )}
        {podeFechar && (
          <button type="button" className="embed-botao-icone" onClick={fechar} aria-label="Fechar o chat" title="Fechar">
            <Icone nome="fechar" tamanho={18} />
          </button>
        )}
      </header>

      {apagar.confirmando && (
        <div
          id={idDaConfirmacao}
          className="embed-apagar"
          role="alertdialog"
          aria-labelledby={`${idDaConfirmacao}-titulo`}
          aria-describedby={`${idDaConfirmacao}-texto`}
        >
          <p className="embed-apagar-titulo" id={`${idDaConfirmacao}-titulo`}>
            Apagar minha conversa?
          </p>
          <p className="embed-apagar-texto" id={`${idDaConfirmacao}-texto`}>
            Todas as suas mensagens com este assistente serão apagadas de vez. Isso não pode ser desfeito.
          </p>
          {apagar.erro && (
            <p className="embed-apagar-erro" role="alert">
              {apagar.erro}
            </p>
          )}
          <div className="embed-apagar-acoes">
            <button type="button" className="embed-apagar-confirmar" onClick={() => void apagarMinhaConversa()} disabled={apagar.apagando}>
              {apagar.apagando ? 'Apagando…' : 'Apagar tudo'}
            </button>
            <button type="button" className="embed-apagar-cancelar" onClick={() => despacharApagar({ tipo: 'cancelar' })} disabled={apagar.apagando}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {apagar.apagada && (
        <p className="embed-apagar-aviso" role="status">
          Conversa apagada. Você pode começar uma nova quando quiser.
        </p>
      )}

      <div
        ref={lista}
        className="embed-mensagens"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Mensagens da conversa"
        tabIndex={0}
        onScroll={aoRolar}
      >
        {mensagemInicial !== '' && (
          <BolhaDoEmbed
            titulo={titulo}
            bolha={{ id: 'inicial', papel: 'assistant', texto: mensagemInicial, estado: 'completa' }}
          />
        )}
        {retomando && (
          <p className="embed-carregando" role="status">
            Carregando a conversa…
          </p>
        )}
        {estado.bolhas.map((b) => (
          <BolhaDoEmbed key={b.id} bolha={b} titulo={titulo} />
        ))}
        {ofertadas.length > 0 && (
          <div className="embed-sugestoes" role="group" aria-label="Perguntas sugeridas">
            {ofertadas.map((s) => (
              <button key={s} type="button" className="embed-sugestao" onClick={() => void enviar(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {estado.erro && <Alerta variante="erro">{estado.erro.mensagem}</Alerta>}

      <form
        className="embed-campo"
        onSubmit={(e) => {
          e.preventDefault()
          void enviar(texto)
        }}
      >
        <label htmlFor={idDoCampo} className="somente-leitor">
          Sua mensagem
        </label>
        <textarea
          id={idDoCampo}
          ref={campo}
          name="mensagem"
          rows={1}
          maxLength={LIMITE_DA_MENSAGEM_DO_EMBED}
          placeholder="Escreva sua mensagem…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (decidirTecla(e.nativeEvent) === 'enviar') {
              e.preventDefault()
              void enviar(texto)
            }
          }}
        />
        {estado.transmitindo ? (
          <button
            type="button"
            className="embed-enviar"
            aria-label="Parar a resposta"
            onClick={() => {
              controle.current?.abort()
              despachar({ tipo: 'parar' })
            }}
          >
            <Icone nome="parar" tamanho={18} />
          </button>
        ) : (
          <button type="submit" className="embed-enviar" aria-label="Enviar mensagem" disabled={!podeEnviarNoEmbed(texto, false)}>
            <Icone nome="enviar" tamanho={18} />
          </button>
        )}
        {texto.length >= LIMITE_PARA_AVISO_DO_EMBED && (
          <span className={excedeu ? 'embed-contador embed-contador-limite' : 'embed-contador'} aria-live="polite">
            {texto.length} de {LIMITE_DA_MENSAGEM_DO_EMBED} caracteres
          </span>
        )}
      </form>

      {avisoDePrivacidade && (
        <p className="embed-aviso">
          {avisoDePrivacidade.texto}
          {avisoDePrivacidade.url && (
            <>
              {' '}
              <a href={avisoDePrivacidade.url} target="_blank" rel="noopener noreferrer">
                Saiba mais
              </a>
            </>
          )}
        </p>
      )}
    </section>
  )
}
