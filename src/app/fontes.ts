// Fontes servidas pelo próprio servidor (FT-14): os arquivos vêm dos pacotes npm, o Next os copia
// para o build e nenhuma requisição sai para rede de fontes, nem no build nem na execução.
// Geist na interface e nos títulos, Inter no texto corrido e uma serifa itálica que só o título
// do hero da landing usa.
import localFont from 'next/font/local'

export const geist = localFont({
  src: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  variable: '--fonte-geist',
  weight: '100 900',
  display: 'swap',
})

export const inter = localFont({
  src: '../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--fonte-inter',
  weight: '100 900',
  display: 'swap',
})

export const serifaItalica = localFont({
  src: '../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2',
  variable: '--fonte-serifa',
  weight: '400',
  style: 'italic',
  display: 'swap',
  preload: false,
})
