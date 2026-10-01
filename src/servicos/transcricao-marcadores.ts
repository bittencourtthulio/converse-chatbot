// Marcadores de tempo do texto de vídeo e áudio (FT-08, PR-74, PR-75). Cada
// parte da transcrição (10 minutos) começa com `[MM:SS]` (ou `[H:MM:SS]` a
// partir de uma hora); as legendas do YouTube ganham um marcador a cada cerca
// de 60 segundos. O texto segue para o mesmo `normalizarTexto` e
// `dividirEmTrechos` das outras fontes, então o marcador aparece no começo do
// trecho que abre a parte. Funções puras, sem imports.

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
