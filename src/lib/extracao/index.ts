// Fachada da extração (PR-45): um ponto só que, dado o formato e os bytes,
// confere o conteúdo e devolve o texto. Limita tamanho do texto e tempo, e
// converte qualquer exceção em `ErroDeAplicacao` amigável (sem o texto da
// biblioteca). Sem `next/*`, sem rede e sem importar serviços.
import { ErroDeAplicacao } from '../erros'
import { conferirConteudoDeTexto, conferirPdf } from './conteudo'
import { extrairCsv } from './csv'
import { extrairDocx } from './docx'
import { FORMATOS, type Formato } from './formatos'
import { extrairHtml } from './html'
import { extrairJson } from './json'
import { extrairLegenda } from './legenda'
import { LIMITES } from './limites'
import { extrairPdf } from './pdf'
import { extrairTextoSimples } from './texto'
import { conferirDocx } from './zip'

export type Extrator = (bytes: Uint8Array) => string | Promise<string>

export interface EntradaDeExtracao {
  formato: Formato
  bytes: Uint8Array
}

export interface OpcoesDeExtracao {
  prazoMs?: number
  maxCaracteres?: number
  /** Só para teste: troca o extrator de um formato. */
  extratores?: Partial<Record<Formato, Extrator>>
}

const EXTRATORES: Record<Formato, Extrator> = {
  pdf: (b) => extrairPdf(b),
  docx: (b) => extrairDocx(b),
  txt: extrairTextoSimples,
  md: extrairTextoSimples,
  csv: extrairCsv,
  html: extrairHtml,
  json: extrairJson,
  srt: (b) => extrairLegenda(b, 'srt'),
  vtt: (b) => extrairLegenda(b, 'vtt'),
}

/** Confere que os bytes são mesmo do formato que a extensão anunciou. */
export function validarConteudo(formato: Formato, bytes: Uint8Array): void {
  if (formato === 'pdf') conferirPdf(bytes)
  else if (formato === 'docx') conferirDocx(bytes)
  else if (!FORMATOS[formato].binario) conferirConteudoDeTexto(formato, bytes)
}

export async function extrairTexto(
  entrada: EntradaDeExtracao,
  opcoes: OpcoesDeExtracao = {},
): Promise<string> {
  const prazo = opcoes.prazoMs ?? LIMITES.prazoDaExtracaoMs
  const maximo = opcoes.maxCaracteres ?? LIMITES.caracteresExtraidos
  const extrator = opcoes.extratores?.[entrada.formato] ?? EXTRATORES[entrada.formato]

  let temporizador: ReturnType<typeof setTimeout> | undefined
  const passouDoPrazo = new Promise<never>((_, rejeitar) => {
    temporizador = setTimeout(
      () =>
        rejeitar(
          new ErroDeAplicacao(
            'A leitura do arquivo demorou demais e foi interrompida.',
            422,
            'extracao_demorou',
          ),
        ),
      prazo,
    )
  })

  let texto: string
  try {
    texto = await Promise.race([Promise.resolve().then(() => extrator(entrada.bytes)), passouDoPrazo])
  } catch (erro) {
    if (erro instanceof ErroDeAplicacao) throw erro
    throw new ErroDeAplicacao(
      'Não foi possível extrair o texto deste arquivo.',
      422,
      'extracao_falhou',
    )
  } finally {
    clearTimeout(temporizador)
  }

  if (texto.trim() === '') {
    throw new ErroDeAplicacao('Nenhum texto foi encontrado neste arquivo: ele não tem texto.', 422, 'extracao_vazia')
  }
  if (texto.length > maximo) {
    throw new ErroDeAplicacao(
      `O texto extraído passa de ${maximo.toLocaleString('pt-BR').replace(/\.000\.000$/, ' milhões')} de caracteres. ` +
        'Divida o arquivo em partes menores.',
      422,
      'texto_grande_demais',
    )
  }
  return texto
}
