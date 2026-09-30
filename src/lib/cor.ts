// Cor do agente (FT-06, PR-61). A cor é dado do usuário: entra no CSS por
// variável em tempo de execução, e as cores do sistema continuam só em
// `tokens.css`. Por isso este módulo trabalha com trios RGB (nenhum hex
// literal no código: `tests/tokens.test.ts`), e o hex é montado por função.

export type Rgb = [number, number, number]

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/

/** `#rrggbb` em minúsculas (expande `#rgb`), ou `null` se não é cor hexadecimal. */
export function normalizarCor(entrada: string): string | null {
  if (typeof entrada !== 'string') return null
  const t = entrada.trim().toLowerCase()
  if (!HEX.test(t)) return null
  if (t.length === 4) return `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`
  return t
}

export function hexParaRgb(hex: string): Rgb {
  const n = normalizarCor(hex)
  if (!n) throw new Error('Cor inválida.')
  return [1, 3, 5].map((i) => Number.parseInt(n.slice(i, i + 2), 16)) as Rgb
}

export function rgbParaHex(rgb: Rgb): string {
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function luminancia(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }) as Rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Razão de contraste WCAG entre duas cores hexadecimais (de 1 a 21). */
export function razaoDeContraste(a: string, b: string): number {
  const [maior, menor] = [luminancia(hexParaRgb(a)), luminancia(hexParaRgb(b))].sort((x, y) => y - x) as [
    number,
    number,
  ]
  return (maior + 0.05) / (menor + 0.05)
}

/** Texto usado sobre cor clara e sobre cor escura: espelham `--fg-em-cor-clara` e `--fg-em-cor-escura`. */
// Preto puro: só ele garante 4,5:1 sobre qualquer cor junto do branco (o pior caso é ~4,58).
export const FG_EM_COR_CLARA: Rgb = [0, 0, 0]
export const FG_EM_COR_ESCURA: Rgb = [255, 255, 255]

/** Fundos do chat nos dois temas, para o aviso de baixo contraste (espelham `--bg-surface`). */
const FUNDO_CLARO: Rgb = [255, 255, 255]
const FUNDO_ESCURO: Rgb = [17, 26, 46]

export interface TextoSobreCor {
  token: '--fg-em-cor-clara' | '--fg-em-cor-escura'
  razao: number
}

/** O texto de maior contraste sobre a cor: escuro ou claro, por luminância relativa. */
export function corDoTextoSobre(cor: string): TextoSobreCor {
  const clara = razaoDeContraste(rgbParaHex(FG_EM_COR_CLARA), cor)
  const escura = razaoDeContraste(rgbParaHex(FG_EM_COR_ESCURA), cor)
  return clara >= escura
    ? { token: '--fg-em-cor-clara', razao: clara }
    : { token: '--fg-em-cor-escura', razao: escura }
}

/** Abaixo disto a cor quase some contra o fundo do chat. A cor é área preenchida com texto próprio legível, então o piso é baixo: só o "quase invisível" avisa. */
export const CONTRASTE_MINIMO_DO_DESTAQUE = 1.5

/** Aviso em português se a cor mal se vê contra o fundo de um dos temas; `null` se está boa. */
export function avisoDeBaixoContraste(cor: string): string | null {
  const noClaro = razaoDeContraste(cor, rgbParaHex(FUNDO_CLARO))
  const noEscuro = razaoDeContraste(cor, rgbParaHex(FUNDO_ESCURO))
  if (noClaro < CONTRASTE_MINIMO_DO_DESTAQUE && noEscuro < CONTRASTE_MINIMO_DO_DESTAQUE) {
    return 'Esta cor tem pouco contraste com o fundo do chat nos temas claro e escuro.'
  }
  if (noClaro < CONTRASTE_MINIMO_DO_DESTAQUE) {
    return 'Esta cor tem pouco contraste com o fundo claro do chat: o destaque pode ficar difícil de ver.'
  }
  if (noEscuro < CONTRASTE_MINIMO_DO_DESTAQUE) {
    return 'Esta cor tem pouco contraste com o fundo escuro do chat: o destaque pode ficar difícil de ver.'
  }
  return null
}

const AMOSTRAS: Array<{ nome: string; rgb: Rgb }> = [
  { nome: 'Índigo', rgb: [79, 70, 229] },
  { nome: 'Azul', rgb: [37, 99, 235] },
  { nome: 'Verde', rgb: [5, 150, 105] },
  { nome: 'Laranja', rgb: [194, 65, 12] },
  { nome: 'Rosa', rgb: [219, 39, 119] },
  { nome: 'Roxo', rgb: [126, 34, 206] },
  { nome: 'Grafite', rgb: [71, 85, 105] },
  { nome: 'Vermelho', rgb: [220, 38, 38] },
]

export const AMOSTRAS_DE_COR = AMOSTRAS.map(({ nome, rgb }) => ({ nome, hex: rgbParaHex(rgb) }))

/** O índigo do sistema; a migration usa o mesmo valor como padrão. */
export const COR_PADRAO = AMOSTRAS_DE_COR[0]!.hex
