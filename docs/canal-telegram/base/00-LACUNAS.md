# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Formato e semântica de `retry_after` no 429 do Telegram e prazo/política do reenvio do webhook: `NÃO DOCUMENTADO` na consulta resumida de https://core.telegram.org/bots/api; será simulado e tratado como opcional. (telegram-bot-api)
2. Limites de taxa de envio por chat/global do Telegram: `NÃO DOCUMENTADO` na consulta; sem número afirmado. (telegram-bot-api)
3. Se o `after` do Next 16 em `next start` roda o envio ao Telegram depois do 200 em um route handler com leitura de `request`: documentado em geral (`after.md`), será provado por teste de produção. (rotas-painel-e-testes)
4. Teto do `update_id` do Telegram para escolher o tipo de coluna: `NÃO DOCUMENTADO`; usar texto ou BigInt. (dados-segredo-e-ambiente)
5. Como exercitar `TELEGRAM_PERMITIR_URL_NAO_HTTPS` em teste de produção, já que `NODE_ENV=production` a ignora: decisão da F2. (dados-segredo-e-ambiente)
6. Ferramentas de navegador para a verificação ponta a ponta: disponibilidade `NÃO DOCUMENTADO` até a task de verificação.
7. Contexto histórico do `memox`: não consultado; a ausência não é lacuna.
