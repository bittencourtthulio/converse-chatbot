/**
 * Sobe o OpenRouter simulado como processo avulso, para conversar com um agente
 * no navegador sem gastar crédito (roteiro de QA, verificação visual):
 *
 *   npx tsx tests/apoio/servir-falso.ts
 *   OPENROUTER_BASE_URL=<url impressa> npm run dev
 *
 * Em Configurações > Integrações, cadastre a chave de teste `CHAVE_VALIDA`
 * (impressa junto da URL). A resposta é fixa e traz lista, negrito, link e
 * código; cada trecho chega 300 ms depois do anterior, para dar tempo de ver
 * a resposta chegando e de apertar Parar. Ctrl+C encerra.
 *
 * Vídeo e áudio (FT-08): um pedido de transcrição (`input_audio`) devolve uma
 * frase por parte do áudio (a parte 1 fala de reembolso, a 2 de atendimento e a
 * 3 de entregas), cada uma com 3 segundos de atraso, para dar tempo de ver a
 * etapa "Transcrevendo parte N de M" e a barra de progresso andando.
 *
 * Porta de controle (padrão 4401; `npx tsx tests/apoio/servir-falso.ts [porta]`):
 *   GET  /estado      os pedidos de transcrição recebidos: parte (0, 1, 2...), tentativa e formato
 *   POST /configurar  muda o comportamento: JSON de OpcoesDoFalso, por exemplo
 *                     {"falhasPorParte":{"1":402}} faz a segunda parte falhar com "sem saldo" e
 *                     {"falhasPorParte":{}} desfaz; {"latenciaPorParteMs":{"0":20000}} alonga a parte 1
 */
import { createServer } from 'node:http'
import { CHAVE_VALIDA, iniciarOpenRouterFalso } from './openrouter-falso'

const falso = await iniciarOpenRouterFalso({
  trechos: [
    'Claro! ',
    'Aqui vai **uma resposta** de exemplo:\n\n',
    '- primeiro item\n',
    '- segundo item\n\n',
    'Veja [a documentação](https://exemplo.com) ',
    'e use `codigo` quando precisar.\n\n',
    '```\nconst a = 1\n```',
  ],
  intervaloEntreTrechosMs: 300,
  transcricoes: [
    'A política de reembolso da loja permite devolver qualquer produto em até trinta dias corridos, com a nota fiscal.',
    'O atendimento ao cliente funciona de segunda a sexta, das nove às dezoito horas, pelo chat e por e-mail.',
    'As entregas acontecem em até cinco dias úteis para todo o Brasil, com código de rastreamento.',
  ],
  latenciaPorParteMs: { 0: 3000, 1: 3000, 2: 3000 },
})
const portaDeControle = Number(process.argv[2] ?? 4401)
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
    res.end(JSON.stringify({ audios: falso.audios.map((a) => ({ parte: a.parte, tentativa: a.tentativa, formato: a.formato })) }))
    return
  }
  res.writeHead(404).end()
}).listen(portaDeControle, '127.0.0.1')
console.log(`OPENROUTER_BASE_URL=${falso.url}`)
console.log(`Controle: http://127.0.0.1:${portaDeControle}/estado`)
console.log(`Chave de teste para cadastrar: ${CHAVE_VALIDA}`)
setInterval(() => undefined, 1 << 30)
