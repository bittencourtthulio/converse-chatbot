'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useReducer, useRef, useState } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { Icone } from '@/componentes/Icones'
import { FontesDaResposta } from '@/componentes/FontesDaResposta'
import { TextoDoModelo } from '@/componentes/TextoDoModelo'
import {
  abrirFonte,
  alternarAberta,
  fonteDoNumero,
  idDoChip,
  numerosDeReferencia,
} from '@/componentes/fontes-da-resposta-logica'
import { lerEventos, type FonteDaResposta } from '@/componentes/leitor-de-sse'
import {
  LIMITE_DA_MENSAGEM,
  contadorVisivel,
  decidirTecla,
  estadoInicial,
  podeEnviar,
  reduzir,
  type Bolha,
  type ErroDaConversa,
} from '@/componentes/estado-da-conversa'

export interface ChatDeTesteProps {
  agente: { id: string; nome: string; mensagemInicial: string }
  /** A última conversa do painel deste usuário com o agente, se houver. */
  retomada?: {
    conversaId: string
    mensagens: Array<{ id: string; papel: 'user' | 'assistant'; conteudo: string; fontes?: FonteDaResposta[] }>
  }
  /** Há chave do OpenRouter cadastrada. Sem ela o envio falharia, e a tela avisa antes. */
  temChave: boolean
  ehAdmin: boolean
}

const CODIGOS_DE_CHAVE = ['chat_sem_chave', 'provedor_chave_invalida']

function ehProblemaDeChave(erro: ErroDaConversa): boolean {
  return CODIGOS_DE_CHAVE.includes(erro.codigo)
}

function BolhaDeMensagem({ bolha, nome }: { bolha: Bolha; nome: string }) {
  const doUsuario = bolha.papel === 'user'
  const digitando = bolha.estado === 'digitando'
  const fontes = bolha.fontes ?? []
  const [abertas, setAbertas] = useState<string[]>([])
  const idBase = useId()
  const referencias = fontes.length > 0 ? numerosDeReferencia(fontes) : undefined

  // Clicar em [n] no texto abre o trecho da fonte e leva o foco até o chip dela.
  const aoReferenciar = (n: number) => {
    const fonteId = fonteDoNumero(fontes, n)
    if (!fonteId) return
    setAbertas((atuais) => abrirFonte(atuais, fonteId))
    requestAnimationFrame(() => document.getElementById(idDoChip(idBase, fonteId))?.focus())
  }
  return (
    <div className={`chat-linha ${doUsuario ? 'chat-linha-usuario' : 'chat-linha-agente'}`}>
      <div className={`bolha ${doUsuario ? 'bolha-usuario' : 'bolha-agente'}`}>
        <span className="somente-leitor">{doUsuario ? 'Você: ' : `${nome}: `}</span>
        {doUsuario ? (
          <p className="bolha-texto-simples">{bolha.texto}</p>
        ) : digitando && bolha.texto === '' ? (
          <span className="indicador-de-digitacao" role="status">
            <span className="somente-leitor">O agente está escrevendo…</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </span>
        ) : (
          <TextoDoModelo texto={bolha.texto} referencias={referencias} aoReferenciar={aoReferenciar} />
        )}
        {!doUsuario && fontes.length > 0 && (
          <FontesDaResposta
            fontes={fontes}
            idBase={idBase}
            abertas={abertas}
            aoAlternar={(fonteId) => setAbertas((atuais) => alternarAberta(atuais, fonteId))}
          />
        )}
        {bolha.estado === 'interrompida' && <span className="bolha-nota">Resposta interrompida.</span>}
        {bolha.estado === 'erro' && <span className="bolha-nota">Resposta incompleta.</span>}
      </div>
    </div>
  )
}

/**
 * A conversa de teste com o agente (FT-03). É o único lugar do sistema que
 * chama `fetch`: a rota `/api/agentes/[id]/conversar` devolve a resposta em
 * SSE e o estado da tela vem do reducer de `estado-da-conversa.ts`.
 */
export function ChatDeTeste({ agente, retomada, temChave, ehAdmin }: ChatDeTesteProps) {
  const [estado, despachar] = useReducer(reduzir, retomada, estadoInicial)
  const [texto, setTexto] = useState('')
  const idDoCampo = useId()
  const idDoContador = useId()
  const controle = useRef<AbortController | null>(null)
  const campo = useRef<HTMLTextAreaElement>(null)
  const lista = useRef<HTMLDivElement>(null)
  const pertoDoFim = useRef(true)
  const contagem = useRef(0)

  // Foco no campo ao abrir e depois de cada resposta.
  useEffect(() => {
    if (!estado.transmitindo) campo.current?.focus()
  }, [estado.transmitindo])

  // Rolagem automática, a menos que a pessoa tenha subido para reler.
  useEffect(() => {
    const el = lista.current
    if (el && pertoDoFim.current) el.scrollTop = el.scrollHeight
  }, [estado.bolhas, estado.erro])

  useEffect(() => () => controle.current?.abort(), [])

  const aoRolar = () => {
    const el = lista.current
    if (el) pertoDoFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  const enviar = useCallback(async () => {
    if (!podeEnviar(texto, estado.transmitindo)) return
    const pergunta = texto.trim()
    const abortar = new AbortController()
    controle.current = abortar
    contagem.current += 1
    pertoDoFim.current = true
    despachar({
      tipo: 'enviar',
      texto: pergunta,
      idDoUsuario: `u-${contagem.current}`,
      idDoAgente: `a-${contagem.current}`,
    })
    setTexto('')
    try {
      const resposta = await fetch(`/api/agentes/${agente.id}/conversar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: pergunta,
          ...(estado.conversaId && { conversaId: estado.conversaId }),
        }),
        signal: abortar.signal,
      })
      if (!resposta.ok || !resposta.body) {
        const corpo = (await resposta.json().catch(() => null)) as Partial<ErroDaConversa> | null
        despachar({
          tipo: 'recusada',
          erro: {
            codigo: corpo?.codigo ?? `http_${resposta.status}`,
            mensagem: corpo?.mensagem ?? 'Não foi possível enviar a mensagem. Tente de novo.',
          },
        })
        setTexto(pergunta)
        return
      }
      const conversaId = resposta.headers.get('X-Conversa-Id')
      if (conversaId) despachar({ tipo: 'conversa', conversaId })
      for await (const evento of lerEventos(resposta.body, abortar.signal)) {
        if (evento.tipo === 'trecho') despachar({ tipo: 'trecho', texto: evento.texto })
        else if (evento.tipo === 'fontes') despachar({ tipo: 'fontes', fontes: evento.fontes })
        else if (evento.tipo === 'fim') {
          despachar({ tipo: 'fim', conversaId: evento.conversaId, mensagemId: evento.mensagemId })
        } else if (evento.tipo === 'erro') {
          despachar({
            tipo: 'erro',
            erro: { codigo: evento.codigo, mensagem: evento.mensagem, correlacao: evento.correlacao },
          })
        }
      }
    } catch {
      if (!abortar.signal.aborted) {
        despachar({
          tipo: 'erro',
          erro: {
            codigo: 'conexao_interrompida',
            mensagem: 'Não foi possível falar com o servidor. Verifique a conexão e tente de novo.',
          },
        })
      }
    }
  }, [agente.id, estado.conversaId, estado.transmitindo, texto])

  const parar = () => {
    controle.current?.abort()
    despachar({ tipo: 'parar' })
  }

  const novaConversa = () => {
    controle.current?.abort()
    despachar({ tipo: 'nova' })
    setTexto('')
    campo.current?.focus()
  }

  const vazio = estado.bolhas.length === 0
  const excedeu = texto.length > LIMITE_DA_MENSAGEM

  return (
    <section className="chat" aria-label={`Conversa de teste com ${agente.nome}`}>
      <div className="chat-topo">
        <p className="chat-topo-titulo">Conversa de teste</p>
        <button
          type="button"
          className="botao secundario botao-pequeno"
          onClick={novaConversa}
          disabled={vazio && !estado.erro}
        >
          Nova conversa
        </button>
      </div>

      {!temChave && (
        <Alerta variante="aviso">
          O OpenRouter ainda não foi configurado, então o agente não consegue responder.{' '}
          {ehAdmin ? (
            <>
              Cadastre a chave em <Link href="/configuracoes/integracoes">Configurações &gt; Integrações</Link>.
            </>
          ) : (
            'Peça a um administrador que cadastre a chave em Configurações > Integrações.'
          )}
        </Alerta>
      )}

      <div
        ref={lista}
        className="chat-mensagens"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Mensagens da conversa"
        tabIndex={0}
        onScroll={aoRolar}
      >
        {agente.mensagemInicial !== '' && (
          <BolhaDeMensagem
            nome={agente.nome}
            bolha={{ id: 'inicial', papel: 'assistant', texto: agente.mensagemInicial, estado: 'completa' }}
          />
        )}
        {vazio && (
          <p className="chat-sugestao">
            Faça uma pergunta para ver como o agente responde. Esta conversa fica salva ao recarregar a
            página; use &ldquo;Nova conversa&rdquo; para recomeçar.
          </p>
        )}
        {estado.bolhas.map((b) => (
          <BolhaDeMensagem key={b.id} bolha={b} nome={agente.nome} />
        ))}
      </div>

      {estado.erro && (
        <Alerta variante="erro">
          {estado.erro.mensagem}
          {ehAdmin && ehProblemaDeChave(estado.erro) && (
            <>
              {' '}
              <Link href="/configuracoes/integracoes">Abrir Integrações</Link>
            </>
          )}
        </Alerta>
      )}

      <form
        className="chat-campo"
        onSubmit={(e) => {
          e.preventDefault()
          void enviar()
        }}
      >
        <label htmlFor={idDoCampo} className="somente-leitor">
          Mensagem para o agente
        </label>
        <textarea
          id={idDoCampo}
          ref={campo}
          name="mensagem"
          rows={2}
          maxLength={LIMITE_DA_MENSAGEM}
          placeholder="Escreva sua mensagem. Enter envia, Shift+Enter quebra a linha."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (decidirTecla(e.nativeEvent) === 'enviar') {
              e.preventDefault()
              void enviar()
            }
          }}
          aria-describedby={idDoContador}
        />
        <div className="chat-campo-rodape">
          <span
            id={idDoContador}
            className={excedeu ? 'chat-contador chat-contador-limite' : 'chat-contador'}
            aria-live="polite"
          >
            {contadorVisivel(texto.length) ? `${texto.length} de ${LIMITE_DA_MENSAGEM} caracteres` : ''}
          </span>
          {estado.transmitindo ? (
            <button type="button" className="botao secundario" onClick={parar}>
              <Icone nome="parar" tamanho={16} />
              Parar
            </button>
          ) : (
            <button type="submit" className="botao primario" disabled={!podeEnviar(texto, false)}>
              <Icone nome="enviar" tamanho={16} />
              Enviar
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
