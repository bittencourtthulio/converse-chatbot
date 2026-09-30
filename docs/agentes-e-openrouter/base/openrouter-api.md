# API do OpenRouter (modo EXTERNO)

## Contrato de entrada

- Base: `https://openrouter.ai/api/v1`. Autenticação `Authorization: Bearer <chave>` (`https://openrouter.ai/docs/api-reference/authentication.md`, acesso 2026-09-30).
- Cabeçalhos opcionais de identificação: `HTTP-Referer` e `X-OpenRouter-Title`; `X-Title` também é aceito (`https://openrouter.ai/docs/api-reference/overview.md:196-197`).
- `POST /chat/completions`: `model`, `messages[{role,content}]`, `stream: true|false`, `temperature`, `max_tokens` (`streaming.md`). Temperatura: faixa do provedor por modelo; a intenção do produto é 0 a 2. Faixa por modelo: `NÃO DOCUMENTADO`.
- `GET /models`: sem parâmetros obrigatórios; pública (resposta real verificada em 2026-09-30 sem chave).
- `GET /key` (verificação de chave e créditos): `https://openrouter.ai/docs/api-reference/limits.md:239`.

## Contrato de saída

- `GET /models` devolve `{ data: [ { id, name, context_length, pricing, architecture, supported_parameters, ... } ] }`; 464 modelos no acesso de 2026-09-30 (consulta ao vivo, campos `id`, `name`, `context_length` presentes).
- Não-stream: `choices[0].message.content` (`streaming.md`). Stream: SSE com linhas `data: {json}`; texto em `choices[0].delta.content`; o último chunk antes de `[DONE]` traz `usage` e repete `finish_reason` (`streaming.md:294-302`).
- Comentários SSE começam com `:` e devem ser ignorados, por exemplo `: OPENROUTER PROCESSING` (`streaming.md:219-229`).
- `GET /key`: `limit_remaining` (número ou nulo), `is_free_tier` (`limits.md:290-303`).

## Limites e cotas

- Modelos gratuitos: 20 requisições por minuto (`limits.md`, constante `FREE_MODEL_RATE_LIMIT_RPM = 20`); 50 por dia sem créditos, 1000 com créditos (`FREE_MODEL_NO_CREDITS_RPD`, `FREE_MODEL_HAS_CREDITS_RPD`).
- `Retry-After` pode vir em 429, 503 e em 402 com `metadata.limit_source = openrouter_in_flight_budget` (`errors.md:123-125`).
- Timeouts do cliente: `NÃO DOCUMENTADO` (decisão nossa).

## Erros conhecidos e tratamento

Corpo de erro: `{ "error": { "code": number, "message": string, "metadata"?: {} } }`, com o mesmo status HTTP (`errors.md`). Códigos: 400 requisição inválida, 401 chave inválida ou desativada, 402 créditos insuficientes, 403 proibido (guardrail, moderação), 408 tempo esgotado, 429 limite de taxa, 502 modelo fora do ar ou resposta inválida, 503 sem provedor disponível (`errors.md:112-121`). Depois que os cabeçalhos 200 saíram, o erro chega como evento SSE com `error` no topo e `choices[0].finish_reason = "error"`, e o stream termina; pode ser o primeiro e único evento (`streaming.md:485-499`). Mensagem do provedor e `metadata` podem conter texto do provedor: não devem ser repassados brutos.

## Riscos para a nossa implementação

- JSON parcial entre chunks de rede: linhas SSE podem ser cortadas no meio; é preciso buffer por linha.
- Comentário SSE passado a `JSON.parse` quebra o parser (`streaming.md:229`).
- `finish_reason: error` num 200 não pode ser tratado como sucesso.
- Cancelamento só é honrado por provedores que suportam; caso contrário o custo é integral (`streaming.md:454-456`): a nossa parte é abortar a conexão.
- A lista de modelos muda todo dia e é grande (464): cache curto e lista de reserva quando a chamada falha.
- A chave nunca deve aparecer em log ou mensagem de erro.

## Fonte

`https://openrouter.ai/docs/api-reference/{authentication,errors,streaming,limits,overview}.md` e `GET https://openrouter.ai/api/v1/models` — acessados em 2026-09-30.
