// A fonte como a tela a vê: só o que cruza do servidor para o navegador. As
// datas viajam como texto ISO (a resposta JSON do polling também as traz assim).
// Módulo sem 'use client' para o servidor poder chamar `serializarFonte`.
import type { FonteVisivel, ResumoDaBase } from '@/servicos/fontes'

export type FonteDaTela = Omit<FonteVisivel, 'criadoEm' | 'atualizadoEm' | 'processadoEm'> & {
  criadoEm: string
  atualizadoEm: string
  processadoEm: string | null
}

export type ResumoDaTela = ResumoDaBase

const iso = (d: Date | string) => (typeof d === 'string' ? d : d.toISOString())

export function serializarFonte(f: FonteVisivel | FonteDaTela): FonteDaTela {
  return {
    ...f,
    criadoEm: iso(f.criadoEm),
    atualizadoEm: iso(f.atualizadoEm),
    processadoEm: f.processadoEm ? iso(f.processadoEm) : null,
  }
}

/** A mensagem de erro de uma resposta da API (`{ codigo, mensagem }`), ou uma frase padrão. */
export async function mensagemDaResposta(resposta: Response, padrao: string): Promise<string> {
  try {
    const corpo = (await resposta.json()) as { mensagem?: unknown }
    return typeof corpo.mensagem === 'string' && corpo.mensagem ? corpo.mensagem : padrao
  } catch {
    return padrao
  }
}
