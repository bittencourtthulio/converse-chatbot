'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import { Alerta } from '@/componentes/Alerta'
import { Badge } from '@/componentes/Badge'

export interface EstadoVisivelDaChave {
  configurada: boolean
  /** `sk-or-…a1b2`: a chave em si nunca chega aqui. */
  mascara: string | null
  /** Já formatada em pt-BR pelo servidor. */
  atualizadoEm: string | null
  problema: string | null
}

function Botao({
  rotulo,
  ocupado,
  variante,
}: {
  rotulo: string
  ocupado: string
  variante: 'primario' | 'secundario' | 'perigo'
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={`botao ${variante}`} disabled={pending}>
      {pending ? ocupado : rotulo}
    </button>
  )
}

function Retorno({ erro, sucesso }: { erro?: string; sucesso?: string }) {
  if (erro) return <Alerta variante="erro">{erro}</Alerta>
  if (sucesso) return <Alerta variante="sucesso">{sucesso}</Alerta>
  return null
}

/**
 * Chave do OpenRouter (PR-06, PR-14): o campo é sempre vazio e a chave gravada
 * nunca volta ao navegador; a tela só mostra a máscara. As ações vêm do
 * servidor por propriedade, e cada uma confere o papel de admin.
 */
export function PainelDaChaveOpenrouter({
  estado,
  acoes,
}: {
  estado: EstadoVisivelDaChave
  acoes: { salvar: AcaoDeFormulario; testar: AcaoDeFormulario; remover: AcaoDeFormulario }
}) {
  const [aoSalvar, salvar] = useActionState(acoes.salvar, {})
  const [aoTestar, testar] = useActionState(acoes.testar, {})
  const [aoRemover, remover] = useActionState(acoes.remover, {})

  return (
    <section className="cartao" aria-labelledby="titulo-openrouter">
      <div className="cartao-corpo pilha pilha-compacta">
        <div className="linha linha-entre">
          <h2 className="secao-titulo sem-margem" id="titulo-openrouter">
            OpenRouter
          </h2>
          <Badge variante={estado.configurada ? 'sucesso' : 'neutro'}>
            {estado.configurada ? 'Configurada' : 'Não configurada'}
          </Badge>
        </div>

        <p className="texto-de-apoio">
          Uma chave para toda a instalação: todos os agentes usam esta chave e
          cada agente escolhe o próprio modelo. Ela fica criptografada e não é
          exibida de novo depois de salva. Crie a sua em{' '}
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
            openrouter.ai/keys
          </a>
          .
        </p>

        {estado.problema && <Alerta variante="aviso">{estado.problema}</Alerta>}

        {estado.configurada && estado.mascara && (
          <div className="linha">
            <span className="texto-de-apoio">Chave cadastrada:</span>
            <code className="chave-mascarada">{estado.mascara}</code>
            {estado.atualizadoEm && (
              <span className="texto-de-apoio">· atualizada em {estado.atualizadoEm}</span>
            )}
          </div>
        )}

        <form action={salvar} className="formulario">
          <Retorno erro={aoSalvar.erro} sucesso={aoSalvar.sucesso} />
          <label className="campo">
            <span>{estado.configurada ? 'Nova chave' : 'Chave da API'}</span>
            <input
              type="password"
              name="chave"
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-or-v1-…"
            />
          </label>
          <div>
            <Botao
              rotulo={estado.configurada ? 'Substituir chave' : 'Salvar chave'}
              ocupado="Salvando…"
              variante="primario"
            />
          </div>
        </form>

        {estado.configurada && (
          <div className="pilha pilha-compacta">
            <Retorno erro={aoTestar.erro} sucesso={aoTestar.sucesso} />
            <Retorno erro={aoRemover.erro} sucesso={aoRemover.sucesso} />
            <div className="linha">
              <form action={testar}>
                <Botao rotulo="Testar conexão" ocupado="Testando…" variante="secundario" />
              </form>
              <form action={remover}>
                <Botao rotulo="Remover chave" ocupado="Removendo…" variante="secundario" />
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
