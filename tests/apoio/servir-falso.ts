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
 */
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
console.log(`OPENROUTER_BASE_URL=${falso.url}`)
console.log(`Chave de teste para cadastrar: ${CHAVE_VALIDA}`)
setInterval(() => undefined, 1 << 30)
