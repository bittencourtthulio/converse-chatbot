// Lógica pura da tela de vídeo (FT-08, PR-76), sem DOM nem rede: o componente
// só a liga ao navegador. Testável no ambiente `node`. As conferências daqui
// são conveniência; o servidor confere tudo de novo.
import { formatarTamanho } from '@/componentes/conhecimento-logica'
import { EXTENSOES_DE_MIDIA, formatoDeMidia } from '@/lib/midia-formatos'
import { extrairIdDoYoutube } from '@/lib/youtube-url'

export type ResultadoDaValidacao = { ok: true } | { ok: false; motivo: string }

/** Extensão, vazio e tamanho, antes de gastar a rede. A assinatura real dos bytes é do servidor. */
export function validarVideoNoNavegador(nome: string, tamanho: number, maxBytes: number): ResultadoDaValidacao {
  if (!formatoDeMidia(nome)) {
    return { ok: false, motivo: `Formato não aceito. Formatos aceitos: ${EXTENSOES_DE_MIDIA.join(', ')}.` }
  }
  if (tamanho === 0) return { ok: false, motivo: 'O arquivo está vazio.' }
  if (tamanho > maxBytes) {
    return {
      ok: false,
      motivo: `O arquivo tem ${formatarTamanho(tamanho)} e o limite é de ${formatarTamanho(maxBytes)}.`,
    }
  }
  return { ok: true }
}

/** O link do YouTube ao digitar: o motivo aparece já, sem esperar o envio. */
export function validarLinkDoYoutube(texto: string): ResultadoDaValidacao {
  if (texto.trim() === '') return { ok: false, motivo: 'Cole o link do vídeo do YouTube.' }
  try {
    extrairIdDoYoutube(texto)
    return { ok: true }
  } catch (erro) {
    return { ok: false, motivo: erro instanceof Error ? erro.message : 'Link inválido.' }
  }
}

/** A origem de uma fonte só vira âncora se for um link do YouTube (nunca `javascript:` nem outro host). */
export function ehLinkDoYoutube(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    extrairIdDoYoutube(url)
    return true
  } catch {
    return false
  }
}

/** `1h 02min`, `2min 05s`, `45s`; sem duração, `null`. */
export function formatarDuracao(segundos: number | null | undefined): string | null {
  if (typeof segundos !== 'number' || !Number.isFinite(segundos) || segundos <= 0) return null
  const total = Math.round(segundos)
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const resto = total % 60
  const dois = (n: number) => String(n).padStart(2, '0')
  if (horas > 0) return `${horas}h ${dois(minutos)}min`
  if (minutos > 0) return `${minutos}min ${dois(resto)}s`
  return `${resto}s`
}

/** O texto de andamento de uma fonte em processamento: etapa e percentual. */
export function textoDaEtapa(etapa: string | null | undefined, progresso: number | null | undefined): string | null {
  const percentual = typeof progresso === 'number' && Number.isFinite(progresso) ? Math.max(0, Math.min(100, Math.round(progresso))) : null
  if (etapa && percentual !== null) return `${etapa} · ${percentual}%`
  if (etapa) return etapa
  if (percentual !== null) return `Processando · ${percentual}%`
  return null
}

export function avisoDeCreditos(modelo: string): string {
  return `A transcrição consome créditos do OpenRouter e usa o modelo ${modelo}. Um administrador pode trocá-lo em Configurações > Integrações.`
}

export function descreverLimitesDeVideo(maxBytes: number, maxMinutos: number): string {
  return `Até ${formatarTamanho(maxBytes)} e ${maxMinutos} ${maxMinutos === 1 ? 'minuto' : 'minutos'} por arquivo.`
}

export type ResultadoDoEnvio = { aceito: true } | { aceito: false; motivo: string }

/** Traduz a resposta de `fontes/video` e `fontes/youtube`: 202 aceita; o resto traz a mensagem da API. */
export function interpretarRespostaDaFonte(status: number, corpo: string): ResultadoDoEnvio {
  if (status === 202) return { aceito: true }
  let mensagem: string | null = null
  try {
    const json = JSON.parse(corpo) as { mensagem?: unknown }
    if (typeof json.mensagem === 'string' && json.mensagem) mensagem = json.mensagem
  } catch {
    mensagem = null
  }
  return { aceito: false, motivo: mensagem ?? `Não foi possível enviar (erro ${status}).` }
}
