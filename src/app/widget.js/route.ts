// GET /widget.js: o script do chat embutido (FT-06, PR-60). O código vive no
// arquivo legível `src/widget/widget.js` e é lido uma vez, na construção (a rota é
// estática): o servidor em produção não precisa do diretório `src`. Cabeçalhos: é
// script de terceiros incluído por <script src> em outros sites, então leva CORS
// aberto e `Cross-Origin-Resource-Policy: cross-origin`; o cache de 5 minutos
// deixa uma correção chegar rápido.
import { readFileSync } from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-static'

export function GET() {
  const codigo = readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), 'src/widget/widget.js'), 'utf8')
  return new Response(codigo, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
