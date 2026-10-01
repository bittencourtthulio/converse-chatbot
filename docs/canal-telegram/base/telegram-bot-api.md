# Telegram Bot API (modo EXTERNO)

Fonte única de todas as afirmações deste arquivo: https://core.telegram.org/bots/api (acessada em 2026-09-30). Onde a página não afirma, está `NÃO DOCUMENTADO`.

## 1. Contrato de entrada

- URL base: `https://api.telegram.org/bot<token>/<método>`; o token vai no caminho (fonte, seção de autorização; formato de exemplo `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`).
- `setWebhook`: `url` (HTTPS; vazio remove o webhook), `secret_token` opcional de 1 a 256 caracteres `[A-Za-z0-9_-]` enviado no cabeçalho `X-Telegram-Bot-Api-Secret-Token` em cada requisição, `allowed_updates` (lista JSON de tipos), `max_connections` de 1 a 100 (padrão 40). Portas aceitas: 443, 80, 88, 8443.
- `deleteWebhook`: `drop_pending_updates` opcional (booleano).
- `getMe` e `getWebhookInfo`: sem parâmetros.
- `sendMessage`: `chat_id` e `text` (1 a 4096 caracteres após o processamento de entidades); `parse_mode` opcional (não será usado, PR da FT-07).
- `sendChatAction`: `chat_id`, `action` (`typing`); o indicador dura 5 segundos (a fonte descreve como duração implícita de 5 s).

## 2. Contrato de saída

- Sucesso: `{ ok: true, result: ... }`. Erro: `{ ok: false, error_code: <número>, description: <texto> }` (fonte, seção de resposta).
- `getWebhookInfo`: `url`, `has_custom_certificate`, `pending_update_count`, `ip_address`, `last_error_date`, `last_error_message`, `max_connections`, `allowed_updates`.
- `getMe` devolve um `User`: `id`, `is_bot`, `first_name`, `username` (opcional) etc.
- Update entregue ao webhook: `update_id` (inteiro) e, para texto, `message` com `chat.type` (`private`, `group`, `supergroup`, `channel`), `chat.id`, `from` (`User`, opcional), `text` (opcional).
- `ResponseParameters.retry_after` no erro 429: `NÃO DOCUMENTADO` nesta consulta resumida; o adaptador trata o campo como opcional e o simulado o emite.

## 3. Limites e cotas

- Texto de mensagem: 4096 caracteres (fonte, `sendMessage`).
- Taxa de envio por chat e global: `NÃO DOCUMENTADO` na consulta; o adaptador respeita `retry_after` quando vem, com uma tentativa extra no máximo.
- Reenvio do webhook em resposta não 2xx: a API "repete a requisição e desiste depois de um tempo razoável" (fonte); o prazo exato é `NÃO DOCUMENTADO`.

## 4. Erros conhecidos e tratamento

- Token inválido: `ok:false` com `error_code` 401 (comportamento conhecido da API; a página resumida só dá o formato). Bot sem acesso ou chat bloqueado pelo usuário: 403. Não encontrado: 404. Pedido inválido (por exemplo URL de webhook recusada, texto vazio): 400. Excesso de uso: 429. A tradução para mensagens em pt-BR é decisão nossa (F2).
- O descrição do erro do Telegram não é repassada ao usuário (pode repetir parte do pedido).

## 5. Riscos para a nossa implementação

- O token está no caminho da URL: qualquer erro de `fetch` que inclua a URL (mensagem de `TypeError`, `cause`, pilha) vaza o token. Redigir em um ponto só.
- Webhook exige HTTPS público e portas 443, 80, 88 ou 8443; sem URL pública o `setWebhook` falha. Em desenvolvimento só com túnel.
- O `secret_token` aceita só `[A-Za-z0-9_-]` de até 256: o segredo gerado deve usar `base64url`/hex.
- Resposta lenta do webhook causa reenvio do mesmo `update_id`: responder 200 rápido e deduplicar.
- Chat de grupo/canal entrega `message` também; só `private` será atendido.

## 6. Fonte

https://core.telegram.org/bots/api, acessada em 2026-09-30 (resumo parcial por ferramenta de leitura de página; itens não confirmados estão marcados `NÃO DOCUMENTADO`).
