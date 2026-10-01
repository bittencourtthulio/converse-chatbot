/**
 * Sobe o Telegram simulado como processo avulso, para conectar um bot pela tela
 * e disparar updates ao webhook sem usar o Telegram real (FT-07, roteiro de QA e
 * verificação no navegador):
 *
 *   npx tsx tests/apoio/servir-telegram-falso.ts [porta-de-controle]
 *   TELEGRAM_API_BASE=<url impressa> APP_URL=https://exemplo.invalid npm run start
 *
 * Na aba Canais do agente, cole o token de teste impresso (fictício). O simulado
 * aceita qualquer `APP_URL` HTTPS, porque nunca chama o app de volta: quem dispara
 * os updates é você, com `curl` (veja o exemplo impresso). A porta de controle
 * (padrão 4400) mostra o que o simulado recebeu, sem tokens:
 *
 *   GET  /estado      o webhook registrado (url e secret_token) e as mensagens enviadas
 *   POST /configurar  muda o comportamento (corpo JSON de OpcoesDoTelegramFalso)
 *
 * Ctrl+C encerra.
 */
import { createServer } from 'node:http'
import { BOT_PADRAO, TOKEN_VALIDO, iniciarTelegramFalso } from './telegram-falso'

const portaDeControle = Number(process.argv[2] ?? 4400)
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
  if (req.method === 'GET' && caminho === '/estado') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        webhook: falso.webhook,
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
