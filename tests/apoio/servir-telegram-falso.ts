/**
 * Sobe o Telegram simulado como processo avulso, para conectar um bot pela tela
 * e disparar updates ao webhook sem usar o Telegram real (FT-07, roteiro de QA e
 * verificação no navegador):
 *
 *   npx tsx tests/apoio/servir-telegram-falso.ts [porta-de-controle] [endereço-local-do-app]
 *   TELEGRAM_API_BASE=<url impressa> APP_URL=https://exemplo.invalid npm run start
 *
 * Na aba Canais do agente, cole o token de teste impresso (fictício). O simulado
 * aceita qualquer `APP_URL` HTTPS, porque nunca chama o app de volta: quem dispara
 * os updates é você, com `curl` (veja o exemplo impresso). A porta de controle
 * (padrão 4400) mostra o que o simulado recebeu, sem tokens, e faz o papel de uma
 * pessoa escrevendo ao bot (o endereço local do app padrão é http://localhost:3000):
 *
 *   GET  /estado      o webhook registrado (url e secret_token) e as mensagens enviadas
 *   POST /enviar      uma mensagem de uma pessoa ao bot: corpo JSON com `texto` (e, se quiser,
 *                     `chatId`, `nome`, `updateId`, `tipoDoChat`, `semTexto`); o simulado manda
 *                     o update ao app com o segredo certo e devolve o status HTTP que o app deu
 *   POST /configurar  muda o comportamento (corpo JSON de OpcoesDoTelegramFalso)
 *
 * Ctrl+C encerra.
 */
import { createServer } from 'node:http'
import { BOT_PADRAO, TOKEN_VALIDO, dispararUpdate, iniciarTelegramFalso, updateDeTexto } from './telegram-falso'

const portaDeControle = Number(process.argv[2] ?? 4400)
const appLocal = (process.argv[3] ?? 'http://localhost:3000').replace(/\/+$/, '')
let proximoUpdate = Date.now()
const falso = await iniciarTelegramFalso()

createServer(async (req, res) => {
  const caminho = (req.url ?? '').split('?')[0]
  if (req.method === 'POST' && caminho === '/configurar') {
    const partes: Buffer[] = []
    for await (const parte of req) partes.push(parte as Buffer)
    falso.configurar(JSON.parse(Buffer.concat(partes).toString('utf8') || '{}'))
    res.writeHead(204).end()
    return
  }
  if (req.method === 'POST' && caminho === '/enviar') {
    const partes: Buffer[] = []
    for await (const parte of req) partes.push(parte as Buffer)
    const pedido = JSON.parse(Buffer.concat(partes).toString('utf8') || '{}') as {
      texto?: string
      chatId?: number
      nome?: string
      updateId?: number
      tipoDoChat?: 'private' | 'group' | 'supergroup' | 'channel'
      semTexto?: boolean
    }
    const registrado = falso.webhook
    const agenteId = registrado ? /\/api\/telegram\/([^/]+)\/webhook$/.exec(registrado.url)?.[1] : undefined
    if (!registrado?.secret_token || !agenteId) {
      res.writeHead(409, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Nenhum bot conectado: cole o token na aba Canais primeiro.')
      return
    }
    proximoUpdate += 1
    const resposta = await dispararUpdate({
      url: `${appLocal}/api/telegram/${agenteId}/webhook`,
      segredo: registrado.secret_token,
      update: updateDeTexto({
        updateId: pedido.updateId ?? proximoUpdate,
        chatId: pedido.chatId ?? 42,
        texto: pedido.texto ?? 'oi',
        nome: pedido.nome,
        tipoDoChat: pedido.tipoDoChat,
        semTexto: pedido.semTexto,
        extra: pedido.semTexto ? { photo: [{ file_id: 'x' }] } : undefined,
      }),
    }).catch(() => null)
    res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ statusDoApp: resposta?.status ?? null }))
    return
  }
  if (req.method === 'GET' && caminho === '/estado') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        webhook: falso.webhook,
        appLocal,
        mensagensEnviadas: falso.mensagensEnviadas(),
        metodos: falso.requisicoes.map((r) => r.metodo),
      }),
    )
    return
  }
  res.writeHead(404).end()
}).listen(portaDeControle, '127.0.0.1')

console.log(`TELEGRAM_API_BASE=${falso.url}`)
console.log(`Token de teste (fictício) para colar na aba Canais: ${TOKEN_VALIDO}`)
console.log(`Bot simulado: @${BOT_PADRAO.username}`)
console.log(`Controle: http://127.0.0.1:${portaDeControle}/estado`)
console.log(
  `Disparar um update: curl -X POST <APP_URL local>/api/telegram/<id-do-agente>/webhook ` +
    `-H 'Content-Type: application/json' -H 'X-Telegram-Bot-Api-Secret-Token: <secret_token do /estado>' ` +
    `-d '{"update_id":1,"message":{"message_id":1,"chat":{"id":42,"type":"private"},"from":{"first_name":"Maria"},"text":"oi"}}'`,
)
setInterval(() => undefined, 1 << 30)
