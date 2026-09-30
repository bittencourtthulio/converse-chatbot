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
})
console.log(`OPENROUTER_BASE_URL=${falso.url}`)
console.log(`Chave de teste para cadastrar: ${CHAVE_VALIDA}`)
setInterval(() => undefined, 1 << 30)
