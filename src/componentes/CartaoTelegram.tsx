'use client'

import { useActionState, useReducer } from 'react'
import { useFormStatus } from 'react-dom'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { Alerta } from '@/componentes/Alerta'
import { Badge } from '@/componentes/Badge'
import {
  PASSOS_DO_TELEGRAM,
  proximoEstadoDaDesconexao,
  type DadosDoCanalTelegram,
  type VisaoDoCartaoTelegram,
} from '@/componentes/canais-logica'

export interface AcoesDoTelegram {
  conectar: AcaoDeFormulario
  desconectar: AcaoDeFormulario
  pausar: AcaoDeFormulario
  retomar: AcaoDeFormulario
  verificar: AcaoDeFormulario
  salvarLimite: AcaoDeFormulario
}

function Botao({
  rotulo,
  ocupado,
  variante,
  desabilitado = false,
}: {
  rotulo: string
  ocupado: string
  variante: 'primario' | 'secundario' | 'perigo'
  desabilitado?: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={`botao ${variante}`} disabled={pending || desabilitado}>
      {pending ? ocupado : rotulo}
    </button>
  )
}

function Retorno({ erro, sucesso }: { erro?: string; sucesso?: string }) {
  if (erro) return <Alerta variante="erro">{erro}</Alerta>
  if (sucesso) return <Alerta variante="sucesso">{sucesso}</Alerta>
  return null
}

/** O campo do token: senha, sempre vazio e sem preenchimento automático (PR-14). */
function FormularioDoToken({
  agenteId,
  acao,
  rotulo,
  podeConectar,
}: {
  agenteId: string
  acao: AcaoDeFormulario
  rotulo: string
  podeConectar: boolean
}) {
  const [retorno, executar] = useActionState(acao, {})
  return (
    <form action={executar} className="formulario">
      <Retorno erro={retorno.erro} sucesso={retorno.sucesso} />
      <input type="hidden" name="id" value={agenteId} />
      <label className="campo">
        <span>Token do bot</span>
        <input
          type="password"
          name="token"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="123456789:ABC…"
        />
      </label>
      <div>
        <Botao rotulo={rotulo} ocupado="Conectando…" variante="primario" desabilitado={!podeConectar} />
      </div>
    </form>
  )
}

/** Um botão de ação que não pede campo: Verificar, Pausar e Retomar. */
function FormularioDeAcao({
  agenteId,
  acao,
  rotulo,
  ocupado,
}: {
  agenteId: string
  acao: AcaoDeFormulario
  rotulo: string
  ocupado: string
}) {
  const [retorno, executar] = useActionState(acao, {})
  return (
    <form action={executar} className="canal-acao">
      <input type="hidden" name="id" value={agenteId} />
      <Botao rotulo={rotulo} ocupado={ocupado} variante="secundario" />
      {(retorno.erro || retorno.sucesso) && (
        <div className="canal-retorno">
          <Retorno erro={retorno.erro} sucesso={retorno.sucesso} />
        </div>
      )}
    </form>
  )
}

function Desconectar({
  agenteId,
  acao,
  confirmandoInicial,
}: {
  agenteId: string
  acao: AcaoDeFormulario
  confirmandoInicial: boolean
}) {
  const [estado, enviar] = useReducer(proximoEstadoDaDesconexao, confirmandoInicial ? 'confirmando' : 'inicial')
  const [retorno, executar] = useActionState(acao, {})

  if (estado === 'inicial') {
    return (
      <div className="canal-acao">
        <button type="button" className="botao secundario" onClick={() => enviar('desconectar')}>
          Desconectar
        </button>
        {retorno.erro && (
          <div className="canal-retorno">
            <Alerta variante="erro">{retorno.erro}</Alerta>
          </div>
        )}
      </div>
    )
  }
  return (
    <form
      action={executar}
      className="confirmacao-de-exclusao canal-confirmacao"
      role="alertdialog"
      aria-labelledby="titulo-da-desconexao"
      aria-describedby="descricao-da-desconexao"
    >
      <input type="hidden" name="id" value={agenteId} />
      <p className="secao-titulo sem-margem" id="titulo-da-desconexao">
        Desconectar o bot?
      </p>
      <p className="texto-de-apoio" id="descricao-da-desconexao">
        O bot deixa de responder e o token é apagado daqui. O histórico das conversas é mantido. Para conectar de novo,
        cole o token outra vez.
      </p>
      <div className="linha">
        <Botao rotulo="Confirmar desconexão" ocupado="Desconectando…" variante="perigo" />
        <button type="button" className="botao secundario" onClick={() => enviar('cancelar')}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function LimiteDiario({ agenteId, acao, limite }: { agenteId: string; acao: AcaoDeFormulario; limite: number }) {
  const [retorno, executar] = useActionState(acao, {})
  return (
    <form action={executar} className="formulario canal-limite">
      <Retorno erro={retorno.erro} sucesso={retorno.sucesso} />
      <input type="hidden" name="id" value={agenteId} />
      <label className="campo campo-curto">
        <span>Limite diário de mensagens</span>
        <input type="number" name="limiteDiario" min={1} max={100000} step={1} required defaultValue={limite} inputMode="numeric" />
        <span className="campo-ajuda">
          Conta as mensagens recebidas por este bot no dia (a partir da meia-noite do servidor). Passou do limite, o bot
          responde que volta amanhã.
        </span>
      </label>
      <div>
        <Botao rotulo="Salvar limite" ocupado="Salvando…" variante="secundario" />
      </div>
    </form>
  )
}

/**
 * O cartão do Telegram da aba Canais (FT-07, PR-69). Sem bot, traz o passo a
 * passo e o campo do token; com bot, o estado, as ações e o limite. O token
 * nunca é preenchido de volta e nenhum segredo chega aqui: só o bot (nome e
 * @usuário). As ações vêm do servidor por propriedade.
 */
export function CartaoTelegram({
  agenteId,
  titulo,
  resumo,
  canal,
  visao,
  acoes,
  confirmandoInicial = false,
}: {
  agenteId: string
  titulo: string
  resumo: string
  canal: DadosDoCanalTelegram | null
  visao: VisaoDoCartaoTelegram
  acoes: AcoesDoTelegram
  /** Só para teste: começa com o bloco de confirmação de desconexão aberto. */
  confirmandoInicial?: boolean
}) {
  return (
    <section className="cartao canal-cartao" aria-labelledby="titulo-do-canal-telegram">
      <div className="cartao-corpo pilha pilha-compacta">
        <div className="linha linha-entre">
          <h2 className="secao-titulo sem-margem" id="titulo-do-canal-telegram">
            {titulo}
          </h2>
          <Badge variante={visao.selo.variante}>{visao.selo.texto}</Badge>
        </div>
        <p className="texto-de-apoio">{resumo}</p>

        {visao.motivoSemConectar && <Alerta variante="aviso">{visao.motivoSemConectar}</Alerta>}

        {canal === null ? (
          <>
            <ol className="canal-passos">
              <li>
                Abra o{' '}
                <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
                  @BotFather
                </a>{' '}
                no Telegram e crie um bot com o comando <code>/newbot</code>.
              </li>
              <li>{PASSOS_DO_TELEGRAM[1]}</li>
              <li>{PASSOS_DO_TELEGRAM[2]}</li>
            </ol>
            <FormularioDoToken agenteId={agenteId} acao={acoes.conectar} rotulo="Conectar" podeConectar={visao.podeConectar} />
          </>
        ) : (
          <>
            <dl className="canal-detalhes">
              <div>
                <dt>Bot</dt>
                <dd>
                  {canal.bot.nome} ·{' '}
                  <a href={canal.bot.url} target="_blank" rel="noopener noreferrer">
                    @{canal.bot.username}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Última mensagem</dt>
                <dd>{canal.ultimaMensagemEm ?? 'Nenhuma ainda'}</dd>
              </div>
              <div>
                <dt>Conectado em</dt>
                <dd>{canal.conectadoEm}</dd>
              </div>
              <div>
                <dt>Webhook</dt>
                <dd>
                  <code>{canal.webhookUrl}</code>
                </dd>
              </div>
            </dl>

            {canal.ultimoErro && (
              <Alerta variante="erro">
                <strong>Último erro{canal.ultimoErroEm ? ` (${canal.ultimoErroEm})` : ''}:</strong> {canal.ultimoErro}
              </Alerta>
            )}

            <div className="canal-acoes">
              <FormularioDeAcao agenteId={agenteId} acao={acoes.verificar} rotulo="Verificar" ocupado="Verificando…" />
              <FormularioDeAcao
                agenteId={agenteId}
                acao={canal.ativo ? acoes.pausar : acoes.retomar}
                rotulo={visao.rotuloDaPausa}
                ocupado={canal.ativo ? 'Pausando…' : 'Retomando…'}
              />
              <Desconectar agenteId={agenteId} acao={acoes.desconectar} confirmandoInicial={confirmandoInicial} />
            </div>

            <LimiteDiario agenteId={agenteId} acao={acoes.salvarLimite} limite={canal.limiteDiario} />

            <details className="canal-trocar">
              <summary>Trocar o token do bot</summary>
              <p className="texto-de-apoio">
                Cole o token de outro bot (ou um token novo do mesmo). A conexão é refeita e o segredo do webhook muda.
              </p>
              <FormularioDoToken
                agenteId={agenteId}
                acao={acoes.conectar}
                rotulo="Trocar token"
                podeConectar={visao.podeConectar}
              />
            </details>
          </>
        )}
      </div>
    </section>
  )
}
