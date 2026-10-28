// Limites de validação e de extração (PR-10, PR-45), num só lugar. O tamanho
// máximo de cada arquivo não está aqui: vem de MAX_UPLOAD_MB, em ambiente.ts.

export const LIMITES = {
  /** PDF com mais páginas que isto é recusado. */
  paginasDoPdf: 500,
  /** Texto extraído de uma fonte acima disto vira erro. */
  caracteresExtraidos: 5_000_000,
  /** Soma real do tamanho descompactado das entradas de um DOCX (zip bomb). */
  descompactadoDoDocxBytes: 100 * 1024 * 1024,
  /** Descompactado dividido por compactado acima disto é recusado. */
  razaoDeCompressao: 100,
  /** Prazo de uma extração, em milissegundos. */
  prazoDaExtracaoMs: 120_000,
  arquivosPorEnvio: 10,
  tituloDoTexto: 120,
  pergunta: 500,
  conteudoDoTexto: 200_000,
  nomeDoArquivo: 200,
} as const
