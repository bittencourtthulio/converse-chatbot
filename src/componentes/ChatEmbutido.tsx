'use client'

import { useCallback, useEffect, useId, useReducer, useRef, useState } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { AvatarDoChat, type AvatarDoChatNome } from '@/componentes/AvatarDoChat'
import { Icone } from '@/componentes/Icones'
import { TextoDoModelo } from '@/componentes/TextoDoModelo'
import { decidirTecla, type Bolha } from '@/componentes/estado-da-conversa'
import {
  LIMITE_DA_MENSAGEM_DO_EMBED,
  LIMITE_PARA_AVISO_DO_EMBED,
  MENSAGEM_DE_SEM_CONEXAO,
  armazenamentoDoNavegador,
  corpoDoEnvio,
  criarGuardaDoVisitante,
  enderecosDoEmbed,
  erroDaResposta,
  estiloDoAgente,
  lerRetomada,
  podeEnviarNoEmbed,
  reduzirEmbed,
  sugestoesVisiveis,
  type GuardaDoVisitante,
  type ModoDoEmbed,
} from '@/componentes/embed-logica'
import { estadoInicial } from '@/componentes/estado-da-conversa'
import { fonteDoNumero, numerosDeReferencia } from '@/componentes/fontes-da-resposta-logica'
import { lerEventos } from '@/componentes/leitor-de-sse'

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
export function ChatEmbutido({ agenteId, configuracao, modo, aoFechar }: ChatEmbutidoProps) {
  const [estado, despachar] = useReducer(reduzirEmbed, undefined, () => estadoInicial())
  const [texto, setTexto] = useState('')
  const [retomando, setRetomando] = useState(false)
  const idDoCampo = useId()
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

  const { titulo, cor, avatar, mensagemInicial, avisoDePrivacidade, sugestoes } = configuracao
  const vazio = estado.bolhas.length === 0
  const excedeu = texto.length > LIMITE_DA_MENSAGEM_DO_EMBED
  const ofertadas = retomando ? [] : sugestoesVisiveis(sugestoes, estado.bolhas.length)

  return (
    <section className="embed" style={estiloDoAgente(cor)} data-modo={modo} aria-label={`Chat com ${titulo}`}>
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
        {aoFechar && (
          <button type="button" className="embed-botao-icone" onClick={aoFechar} aria-label="Fechar o chat" title="Fechar">
            <Icone nome="fechar" tamanho={18} />
          </button>
        )}
      </header>

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
