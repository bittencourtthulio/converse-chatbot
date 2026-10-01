'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { EstadoDoFormulario } from '@/app/acoes'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { Alerta } from '@/componentes/Alerta'
import { Badge } from '@/componentes/Badge'
import { formatarAtividade } from '@/componentes/conversas-logica'
import {
  PALAVRA_DE_CONFIRMACAO,
  podeConfirmarApagarTitular,
  type EstadoDaBuscaDoTitular,
  type TitularNaTela,
} from '@/componentes/privacidade-logica'
import {
  exportarTitularNoNavegador,
  type FormatoDeExportacao,
  type ResultadoDaExportacao,
} from '@/componentes/exportar-titular'

export type AcaoDeBuscaDoTitular = (estado: EstadoDaBuscaDoTitular, form: FormData) => Promise<EstadoDaBuscaDoTitular>

interface Props {
  acaoDeBusca: AcaoDeBuscaDoTitular
  acaoDeApagar: AcaoDeFormulario
  /** Só para teste: troca o download. */
  exportar?: (criterio: { canal: string; identificador: string }, formato: FormatoDeExportacao) => Promise<ResultadoDaExportacao>
}

const plural = (n: number, singular: string, mais: string) => `${n} ${n === 1 ? singular : mais}`

function BotaoBuscar() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao primario" disabled={pending}>
      {pending ? 'Buscando…' : 'Buscar'}
    </button>
  )
}

function ResumoDoTitular({ t }: { t: TitularNaTela }) {
  return (
    <div className="dados-do-canal">
      <h3 className="secao-subtitulo">{t.rotulo}</h3>
      <p className="texto-de-apoio sem-margem">
        {plural(t.conversas, 'conversa', 'conversas')} · {plural(t.mensagens, 'mensagem', 'mensagens')} · última atividade {formatarAtividade(t.ultimaAtividade)}
      </p>
      <p className="texto-de-apoio sem-margem">Agentes: {t.agentes.join(', ')}</p>
    </div>
  )
}

interface PropsDoResultado {
  busca: EstadoDaBuscaDoTitular
  acaoDeApagar: AcaoDeFormulario
  exportar: NonNullable<Props['exportar']>
}

/**
 * O resultado de uma busca: o resumo, as ações e a confirmação de apagar. Fica com a `key` da
 * busca, então uma busca nova começa limpa (sem confirmação aberta nem erro antigo).
 */
function ResultadoDaBusca({ busca, acaoDeApagar, exportar }: PropsDoResultado) {
  const [exclusao, apagar, apagando] = useActionState<EstadoDoFormulario, FormData>(acaoDeApagar, {})
  const [confirmando, setConfirmando] = useState(false)
  const [digitado, setDigitado] = useState('')
  const [exportando, setExportando] = useState<FormatoDeExportacao | null>(null)
  const [erroDeExportacao, setErroDeExportacao] = useState<string | null>(null)

  const resultado = busca.busca
  const criterio = { canal: busca.canal ?? '', identificador: busca.identificador ?? '' }

  async function baixar(formato: FormatoDeExportacao) {
    setExportando(formato)
    setErroDeExportacao(null)
    const r = await exportar(criterio, formato)
    setExportando(null)
    if (!r.ok) setErroDeExportacao(r.mensagem)
  }

  // Depois de apagar, só a confirmação do que foi apagado: o resultado já não vale.
  if (exclusao.sucesso) return <Alerta variante="sucesso">{exclusao.sucesso}</Alerta>
  if (!resultado) return null

  if (resultado.estado === 'nenhum') {
    return <Alerta variante="info">Nenhum titular encontrado com esse identificador neste canal.</Alerta>
  }

  if (resultado.estado === 'varios') {
    return (
      <div className="pilha pilha-compacta">
        <Alerta variante="aviso">
          Mais de um titular combina com o que você digitou. Digite mais caracteres do identificador (os 10 primeiros de cada um aparecem abaixo) e busque de novo.
        </Alerta>
        <div className="dados-por-canal">
          {resultado.titulares.map((t) => (
            <div key={`${t.prefixo}-${t.rotulo}`} className="dados-do-canal">
              <h3 className="secao-subtitulo">
                <code className="chave-mascarada">{t.prefixo}</code>
              </h3>
              <p className="texto-de-apoio sem-margem">
                {plural(t.conversas, 'conversa', 'conversas')} · {plural(t.mensagens, 'mensagem', 'mensagens')} · última atividade {formatarAtividade(t.ultimaAtividade)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const unico = resultado.titulares[0]
  if (!unico) return null
  return (
    <div className="pilha pilha-compacta">
      <ResumoDoTitular t={unico} />
      {erroDeExportacao && <Alerta variante="erro">{erroDeExportacao}</Alerta>}
      {exclusao.erro && <Alerta variante="erro">{exclusao.erro}</Alerta>}
      <div className="linha">
        <button type="button" className="botao secundario" onClick={() => void baixar('json')} disabled={exportando !== null}>
          {exportando === 'json' ? 'Gerando…' : 'Exportar em JSON'}
        </button>
        <button type="button" className="botao secundario" onClick={() => void baixar('txt')} disabled={exportando !== null}>
          {exportando === 'txt' ? 'Gerando…' : 'Exportar em TXT'}
        </button>
        {!confirmando && (
          <button type="button" className="botao perigo" onClick={() => setConfirmando(true)}>
            Apagar tudo
          </button>
        )}
      </div>

      {confirmando && (
        <form action={apagar} className="confirmacao-de-exclusao" role="alertdialog" aria-labelledby="apagar-titular-titulo" aria-describedby="apagar-titular-texto">
          <input type="hidden" name="canal" value={criterio.canal} />
          <input type="hidden" name="identificador" value={criterio.identificador} />
          <p className="secao-titulo sem-margem" id="apagar-titular-titulo">
            Apagar todos os dados de {unico.rotulo}?
          </p>
          <p className="texto-de-apoio" id="apagar-titular-texto">
            Serão apagadas de vez {plural(unico.conversas, 'conversa', 'conversas')} e {plural(unico.mensagens, 'mensagem', 'mensagens')}. Isso é irreversível e fica
            registrado na auditoria, só com as contagens. Exporte antes se precisar entregar uma cópia.
          </p>
          <label className="campo">
            <span>
              Para confirmar, digite <strong>{PALAVRA_DE_CONFIRMACAO}</strong>
            </span>
            <input type="text" name="confirmacao" value={digitado} onChange={(e) => setDigitado(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
          </label>
          <div className="linha">
            <button type="submit" className="botao perigo" disabled={apagando || !podeConfirmarApagarTitular(digitado)}>
              {apagando ? 'Apagando…' : 'Confirmar exclusão'}
            </button>
            <button
              type="button"
              className="botao secundario"
              onClick={() => {
                setConfirmando(false)
                setDigitado('')
              }}
              disabled={apagando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/**
 * As ferramentas do titular (FT-10, PR-90, D-24): buscar por canal e identificador, exportar em
 * JSON ou TXT e apagar tudo, com a confirmação na própria tela. A busca só leva a exportar e
 * apagar quando resolve a um titular único; senão pede mais caracteres. O identificador
 * completo nunca aparece: o que se mostra é o rótulo e, para desambiguar, 10 caracteres.
 */
export function FerramentasDoTitular({ acaoDeBusca, acaoDeApagar, exportar = exportarTitularNoNavegador }: Props) {
  const [busca, buscar] = useActionState(acaoDeBusca, {} as EstadoDaBuscaDoTitular)

  return (
    <section className="cartao" aria-labelledby="titulo-titular">
      <div className="cartao-corpo pilha pilha-compacta">
        <h2 className="secao-titulo sem-margem" id="titulo-titular">
          Direitos do titular
        </h2>
        <p className="texto-de-apoio">
          Atenda o pedido de uma pessoa que quer saber o que o sistema guarda dela ou quer que tudo seja apagado. Busque pelo canal e pelo identificador; no chat
          embutido, os 6 primeiros caracteres que aparecem na lista de conversas bastam, e o sistema pede mais se mais de uma pessoa combinar.
        </p>

        <form action={buscar} className="formulario" role="search" aria-label="Buscar titular">
          {busca.erro && <Alerta variante="erro">{busca.erro}</Alerta>}
          <label className="campo">
            <span>Canal</span>
            <select name="canal" defaultValue="widget">
              <option value="widget">Chat embutido (identificador do visitante)</option>
              <option value="telegram">Telegram (número do chat)</option>
            </select>
          </label>
          <label className="campo">
            <span>Identificador</span>
            <input type="text" name="identificador" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={64} required />
          </label>
          <div>
            <BotaoBuscar />
          </div>
        </form>

        <ResultadoDaBusca key={JSON.stringify([busca.canal, busca.identificador, busca.busca])} busca={busca} acaoDeApagar={acaoDeApagar} exportar={exportar} />
        <div className="linha">
          <Badge variante="neutro">Só admin</Badge>
        </div>
      </div>
    </section>
  )
}
