import Link from 'next/link'
import { Alerta } from '@/componentes/Alerta'

export interface ModeloSugerido {
  id: string
  nome: string
}

/**
 * Campo de modelo do agente (PR-06). É um campo de texto com sugestões, não um
 * select fechado: o OpenRouter lança modelos toda semana e a lista pode estar
 * incompleta ou indisponível, então o identificador digitado sempre vale.
 * Sem chave configurada não há lista, só o aviso e, para admin, o caminho até
 * Integrações.
 */
export function SeletorDeModelo({
  valorInicial,
  modelos,
  temChave,
  reserva,
  ehAdmin,
}: {
  valorInicial: string
  modelos: ModeloSugerido[]
  temChave: boolean
  /** A lista veio da reserva embutida porque o OpenRouter não respondeu. */
  reserva: boolean
  ehAdmin: boolean
}) {
  const idDaLista = 'modelos-do-openrouter'
  const comSugestoes = temChave && modelos.length > 0

  return (
    <div className="campo-com-aviso">
      <label className="campo">
        <span>Modelo</span>
        <input
          type="text"
          name="modelo"
          defaultValue={valorInicial}
          required
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          placeholder="openai/gpt-4o-mini"
          list={comSugestoes ? idDaLista : undefined}
        />
      </label>

      {comSugestoes && (
        <datalist id={idDaLista}>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </datalist>
      )}

      {!temChave && (
        <Alerta variante="aviso">
          Nenhuma chave do OpenRouter cadastrada, então não há lista de modelos: digite o
          identificador do modelo, como <code>openai/gpt-4o-mini</code>.{' '}
          {ehAdmin ? (
            <Link href="/configuracoes/integracoes">Cadastrar a chave em Integrações</Link>
          ) : (
            'Peça a um administrador para cadastrar a chave.'
          )}
        </Alerta>
      )}

      {temChave && reserva && (
        <Alerta variante="aviso">
          Não foi possível carregar a lista completa do OpenRouter. Mostramos uma lista reduzida
          de modelos comuns; você pode digitar qualquer outro identificador.
        </Alerta>
      )}
    </div>
  )
}
