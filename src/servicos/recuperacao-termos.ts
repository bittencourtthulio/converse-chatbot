// Termos e expressão MATCH da recuperação (FT-05, PR-51). Funções puras: a
// pergunta do usuário vira uma lista de termos limpos (só letras e dígitos
// minúsculos sem acento) e só esses termos, entre aspas, entram na expressão
// do FTS5. O texto do usuário nunca chega ao SQL por concatenação (PR-13).

export const LIMITE_DE_TERMOS = 12
const TAMANHO_MINIMO = 2
const TAMANHO_MAXIMO = 40
/** Termos com este tamanho ou mais ganham prefixo na busca (cobre a flexão). */
const TAMANHO_PARA_PREFIXO = 4

// Saudação e palavras de ligação do português, já sem acento. Sem dependência
// externa: a lista é este módulo (D-05). Os operadores do FTS5 (or, and, not,
// near) também são ruído; entre aspas seriam inofensivos, mas não ajudam a achar nada.
const STOPWORDS = new Set(
  `a o as os um uma uns umas de do da dos das dum duma em no na nos nas num numa por para pra pro pelo pela pelos pelas
   com sem sobre entre ate ao aos as e ou mas nem que se como qual quais quem quando onde quanto quanta quantos quantas
   porque pois porem so ja tambem entao assim ainda la ca aqui ali
   eu tu ele ela eles elas voce voces nos me te lhe lhes meu minha meus minhas seu sua seus suas teu tua nosso nossa
   isso isto esse essa esses essas este esta estes estas aquele aquela aquilo
   e eh sao foi foram ser sera era eram sou somos fui ter tem tenho temos tinha tiveram haver ha havia estar esta estao
   estou estava estive fazer faz fazem fiz ir vai vao vou posso pode podem poder podia quero quer querem queria quis
   preciso precisa gostaria saber sabe favor por mais menos muito muita muitos muitas pouco pouca todo toda todos todas
   algum alguma alguns algumas nenhum nenhuma outro outra outros outras mesmo mesma
   ola oi opa eai hey hello hi obrigado obrigada valeu vlw tchau ate logo tudo bem beleza blz certo ok okay
   or and not near`
    .split(/\s+/)
    .filter(Boolean),
)

const SAUDACOES_COMPOSTAS = /\b(bom dia|boa tarde|boa noite)\b/g

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** Os termos significativos da pergunta, em ordem, sem repetição. */
export function extrairTermos(texto: string): string[] {
  if (typeof texto !== 'string') return []
  const limpo = normalizar(texto).replace(SAUDACOES_COMPOSTAS, ' ')
  const termos: string[] = []
  for (const palavra of limpo.split(/[^a-z0-9]+/)) {
    if (palavra.length < TAMANHO_MINIMO || palavra.length > TAMANHO_MAXIMO) continue
    if (STOPWORDS.has(palavra) || termos.includes(palavra)) continue
    termos.push(palavra)
    if (termos.length === LIMITE_DE_TERMOS) break
  }
  return termos
}

/** Plural comum do português para o singular, só em termos longos (cupons, devoluções, entregas). */
function singular(termo: string): string {
  if (termo.length < 5) return termo
  if (termo.endsWith('oes') || termo.endsWith('aes')) return `${termo.slice(0, -3)}ao`
  if (termo.endsWith('ns')) return `${termo.slice(0, -2)}m`
  if (termo.endsWith('s')) return termo.slice(0, -1)
  return termo
}

/**
 * A expressão `MATCH`: cada termo entre aspas, ligados por OR; termos longos
 * com prefixo, e o plural longo cai para o singular (`singular`). Só
 * recebe termos de `extrairTermos` (letras e dígitos), por isso as aspas nunca
 * precisam de escape. Sem termos, devolve texto vazio.
 */
export function montarExpressaoMatch(termos: string[]): string {
  return termos
    .map((termo) => {
      const base = singular(termo)
      return base.length >= TAMANHO_PARA_PREFIXO ? `"${base}"*` : `"${base}"`
    })
    .join(' OR ')
}
