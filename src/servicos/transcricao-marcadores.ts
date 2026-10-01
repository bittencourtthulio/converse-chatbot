// Marcadores de tempo do texto de vídeo e áudio (FT-08, PR-74, PR-75). Cada
// parte da transcrição (10 minutos) começa com `[MM:SS]` (ou `[H:MM:SS]` a
// partir de uma hora); as legendas do YouTube ganham um marcador a cada cerca
// de 60 segundos. O texto segue para o mesmo `normalizarTexto` e
// `dividirEmTrechos` das outras fontes, então o marcador aparece no começo do
// trecho que abre a parte. Funções puras, sem imports.

/**
 * O texto que marca um segmento de 10 minutos sem fala (música, silêncio): o modelo devolveu vazio (FT-13,
 * PR-105). Entra em `segmentos/NN.txt` como qualquer transcrição, para a retomada não pagar de novo, e no
 * texto final como `[MM:SS] [sem fala]`.
 */
export const MARCADOR_SEM_FALA = '[sem fala]'

/** O texto do segmento é só o marcador de trecho sem fala? */
export function ehSemFala(texto: string): boolean {
  return texto.trim() === MARCADOR_SEM_FALA
}

const MARCADOR_DE_TEMPO = /\[\d{1,2}:\d{2}(?::\d{2})?\]/g

/**
 * O trecho é feito só de marcadores de tempo e de `[sem fala]`, sem palavra nenhuma? Esse trecho não vai ao
 * índice de busca (PR-105): casaria com "sem fala" e "10:00" e não diz nada. O que mistura fala e marcador
 * é indexado como está.
 */
export function trechoSoDeMarcadores(texto: string): boolean {
  // A sobreposição entre trechos pode cortar um marcador ao meio: "fala]" no começo ou "[sem" no fim.
  return (
    texto
      .replaceAll(MARCADOR_DE_TEMPO, '')
      .replaceAll(MARCADOR_SEM_FALA, '')
      .replace(/^\s*(?:(?:sem\s+)?fala|\d{1,2}(?::\d{2})*)\]/, '')
      .replace(/\[(?:sem(?:\s+fala)?|\d{1,2}(?::\d{0,2})*)?\s*$/, '')
      .trim() === ''
  )
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

/** `[00:00]`, `[10:00]`, `[1:00:00]`. Valor negativo ou inválido vira `[00:00]`. */
export function formatarMarcador(segundos: number): string {
  const total = Number.isFinite(segundos) && segundos > 0 ? Math.floor(segundos) : 0
  const horas = Math.floor(total / 3600)
  const minutos = Math.floor((total % 3600) / 60)
  const resto = total % 60
  return horas > 0 ? `[${horas}:${doisDigitos(minutos)}:${doisDigitos(resto)}]` : `[${doisDigitos(minutos)}:${doisDigitos(resto)}]`
}

export interface ParteTranscrita {
  inicioSegundos: number
  texto: string
}

/** Junta as partes com o marcador do início de cada uma; parte vazia é ignorada. */
export function juntarPartes(partes: ParteTranscrita[]): string {
  return partes
    .map((p) => ({ ...p, texto: p.texto.trim() }))
    .filter((p) => p.texto !== '')
    .map((p) => `${formatarMarcador(p.inicioSegundos)} ${p.texto}`)
    .join('\n\n')
}

export interface FalaDeLegenda {
  /** Início da fala, em segundos. */
  inicio: number
  texto: string
}

/**
 * O texto de uma legenda: as falas de cada minuto de vídeo formam um bloco que
 * abre com o marcador do minuto. Minuto sem fala não ganha marcador.
 */
export function montarTextoDeLegenda(falas: FalaDeLegenda[], intervaloSegundos = 60): string {
  const blocos = new Map<number, string[]>()
  const ordenadas = falas
    .map((f) => ({ inicio: Number.isFinite(f.inicio) && f.inicio > 0 ? f.inicio : 0, texto: f.texto.replace(/\s+/g, ' ').trim() }))
    .filter((f) => f.texto !== '')
    .sort((a, b) => a.inicio - b.inicio)
  for (const f of ordenadas) {
    const abertura = Math.floor(f.inicio / intervaloSegundos) * intervaloSegundos
    blocos.set(abertura, [...(blocos.get(abertura) ?? []), f.texto])
  }
  return [...blocos.entries()].map(([abertura, textos]) => `${formatarMarcador(abertura)} ${textos.join(' ')}`).join('\n\n')
}
