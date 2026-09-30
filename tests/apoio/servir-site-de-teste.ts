/**
 * Um "site do cliente" de mentira, para ver o chat embutido funcionando num site
 * de outra origem (FT-06, roteiro de QA e verificação no navegador):
 *
 *   npx tsx tests/apoio/servir-site-de-teste.ts <porta> <origem-do-app> <id-do-agente>
 *   ex.: npx tsx tests/apoio/servir-site-de-teste.ts 4321 http://localhost:3000 agente-de-exemplo
 *
 * Abra http://localhost:<porta>/ . A página traz o trecho de uma linha que a aba
 * Publicar entrega, no fim do <body>, e um CSS hostil (botões vermelhos, fonte
 * forçada) para provar que o Shadow DOM isola o estilo do site. Para testar
 * `data-position` e `data-color`, use /esquerda e /cor. A rota /iframe-direto emoldura a
 * página do chat sem o script, para provar o bloqueio por `frame-ancestors` quando este
 * site não está nos domínios permitidos. Para o agente inativo ou
 * que não existe, passe outro id. Ctrl+C encerra.
 */
import { createServer } from 'node:http'

const [, , portaTexto, origemDoApp, agenteId] = process.argv
const porta = Number(portaTexto)
if (!Number.isInteger(porta) || !origemDoApp || !agenteId) {
  console.error('Uso: npx tsx tests/apoio/servir-site-de-teste.ts <porta> <origem-do-app> <id-do-agente>')
  process.exit(1)
}

function pagina(atributos: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Loja Exemplo (site do cliente)</title>
  <style>
    /* CSS hostil de propósito: nada disto pode vazar para dentro do chat. */
    * { font-family: 'Comic Sans MS', cursive !important; }
    button { background: red !important; color: yellow !important; border-radius: 0 !important; }
    body { margin: 0; padding: 24px; background: #fff8e1; }
    main { max-width: 640px; margin: 0 auto; }
  </style>
</head>
<body>
  <main>
    <h1>Loja Exemplo</h1>
    <p>Este é o site do cliente. O botão do chat aparece no canto da tela.</p>
    <p><a href="/">padrão</a> · <a href="/esquerda">botão à esquerda</a> · <a href="/cor">cor sobrescrita</a></p>
    <button type="button">Um botão do site (vermelho de propósito)</button>
  </main>
  <script src="${origemDoApp}/widget.js" data-agent="${agenteId}" ${atributos} async></script>
</body>
</html>`
}

const rotas: Record<string, string> = {
  '/': '',
  '/esquerda': 'data-position="esquerda"',
  '/cor': 'data-color="#c2410c"',
}

const iframeDireto = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Iframe direto</title></head>
<body style="margin:0;padding:24px;font-family:sans-serif">
  <h1>Iframe direto da página do chat</h1>
  <p>Se este site não estiver nos domínios permitidos, o navegador recusa o quadro abaixo.</p>
  <iframe title="chat" src="${origemDoApp}/embed/${agenteId}" style="width:380px;height:520px;border:2px solid #888"></iframe>
</body></html>`

createServer((req, res) => {
  const caminho = (req.url ?? '/').split('?')[0] ?? '/'
  if (caminho === '/iframe-direto') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(iframeDireto)
    return
  }
  const atributos = rotas[caminho]
  if (atributos === undefined) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Não encontrado')
    return
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(pagina(atributos))
}).listen(porta, () => {
  console.log(`Site de teste em http://localhost:${porta}/  (widget de ${origemDoApp}, agente ${agenteId})`)
})
