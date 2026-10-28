'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { Alerta } from '@/componentes/Alerta'
import estilos from './SeletorDeModelo.module.css'

export interface ModeloSugerido {
  id: string
  nome: string
}

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')

/** Catálogo pesquisável. O formulário envia o id, e preserva modelos de agentes antigos. */
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
  reserva: boolean
  ehAdmin: boolean
}) {
  const id = useId()
  const [selecionado, setSelecionado] = useState(valorInicial)
  const [aberto, setAberto] = useState(false)
  const [pesquisa, setPesquisa] = useState('')
  const [ativo, setAtivo] = useState(0)
  const campo = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)
  const busca = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const ordenados = useMemo(
    () => [...modelos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [modelos],
  )
  const termos = normalizar(pesquisa).trim().split(/\s+/)
  const filtrados = ordenados.filter((modelo) => {
    const texto = normalizar(`${modelo.nome} ${modelo.id}`)
    return termos.every((termo) => texto.includes(termo))
  })
  const atual = modelos.find((modelo) => modelo.id === selecionado)
  const indiceAtivo = Math.min(ativo, filtrados.length - 1)

  useEffect(() => {
    if (!aberto) return
    busca.current?.focus()
    function fecharFora(evento: PointerEvent) {
      if (!campo.current?.contains(evento.target as Node)) setAberto(false)
    }
    document.addEventListener('pointerdown', fecharFora)
    return () => document.removeEventListener('pointerdown', fecharFora)
  }, [aberto])

  useEffect(() => {
    if (aberto) {
      lista.current?.children[indiceAtivo]?.scrollIntoView?.({ block: 'nearest' })
    }
  }, [aberto, indiceAtivo, pesquisa])

  function abrir(ultimo = false) {
    setPesquisa('')
    setAtivo(ultimo ? ordenados.length - 1 : 0)
    setAberto(true)
  }

  function escolher(modelo: ModeloSugerido) {
    setSelecionado(modelo.id)
    setAberto(false)
    botao.current?.focus()
  }

  function navegar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      const direcao = evento.key === 'ArrowDown' ? 1 : -1
      setAtivo(Math.max(0, Math.min(filtrados.length - 1, indiceAtivo + direcao)))
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      if (!evento.nativeEvent.isComposing && filtrados[indiceAtivo]) escolher(filtrados[indiceAtivo])
    } else if (evento.key === 'Escape') {
      evento.preventDefault()
      setAberto(false)
      botao.current?.focus()
    }
  }

  return (
    <div className="campo-com-aviso">
      <div
        className={`campo ${estilos.campo}`}
        ref={campo}
        onBlur={(evento) => {
          if (!evento.currentTarget.contains(evento.relatedTarget)) setAberto(false)
        }}
      >
        <span id={`${id}-rotulo`}>Modelo</span>
        <input type="hidden" name="modelo" value={selecionado} />
        <button
          ref={botao}
          type="button"
          className={estilos.gatilho}
          aria-labelledby={`${id}-rotulo ${id}-valor`}
          aria-haspopup="listbox"
          aria-expanded={aberto}
          aria-controls={aberto ? `${id}-lista` : undefined}
          onClick={() => aberto ? setAberto(false) : abrir()}
          onKeyDown={(evento) => {
            if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
              evento.preventDefault()
              abrir(evento.key === 'ArrowUp')
            }
          }}
        >
          <span className={estilos.identidade} id={`${id}-valor`}>
            <span>{atual?.nome ?? selecionado}</span>
            {atual && <small>{atual.id}</small>}
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m8 9 4-4 4 4m-8 6 4 4 4-4" />
          </svg>
        </button>

        {aberto && (
          <div className={estilos.menu}>
            <div className={estilos.busca}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" />
              </svg>
              <input
                ref={busca}
                type="text"
                role="combobox"
                aria-label="Pesquisar modelos"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={`${id}-lista`}
                aria-activedescendant={indiceAtivo >= 0 ? `${id}-opcao-${indiceAtivo}` : undefined}
                autoComplete="off"
                spellCheck={false}
                placeholder="Pesquisar por nome ou provedor…"
                value={pesquisa}
                onChange={(evento) => {
                  setPesquisa(evento.target.value)
                  setAtivo(0)
                }}
                onKeyDown={navegar}
              />
            </div>
            <ul ref={lista} id={`${id}-lista`} className={estilos.lista} role="listbox" aria-labelledby={`${id}-rotulo`}>
              {filtrados.map((modelo, indice) => (
                <li
                  key={modelo.id}
                  id={`${id}-opcao-${indice}`}
                  role="option"
                  aria-selected={modelo.id === selecionado}
                  className={estilos.opcao}
                  data-ativo={indice === indiceAtivo}
                  onPointerMove={() => setAtivo(indice)}
                  onMouseDown={(evento) => evento.preventDefault()}
                  onClick={() => escolher(modelo)}
                >
                  <span className={estilos.identidade}>
                    <span>{modelo.nome}</span>
                    <small>{modelo.id}</small>
                  </span>
                  {modelo.id === selecionado && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
            <p className={estilos.estado} role="status">
              {filtrados.length === 0
                ? 'Nenhum modelo encontrado. Tente outro nome ou provedor.'
                : `${filtrados.length} ${filtrados.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}`}
            </p>
          </div>
        )}
      </div>

      {!temChave && (
        <Alerta variante="aviso">
          Nenhuma chave do OpenRouter cadastrada. Você pode escolher o modelo; para conversar com o agente, cadastre uma chave.{' '}
          {ehAdmin ? (
            <Link href="/configuracoes/integracoes">Cadastrar a chave em Integrações</Link>
          ) : (
            'Peça a um administrador para cadastrar a chave.'
          )}
        </Alerta>
      )}

      {reserva && (
        <Alerta variante="aviso">
          Não foi possível carregar a lista completa do OpenRouter. Mostramos uma lista reduzida
          de modelos comuns. Tente novamente mais tarde para ver todos os modelos.
        </Alerta>
      )}
    </div>
  )
}
