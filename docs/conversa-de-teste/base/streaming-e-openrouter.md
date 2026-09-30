# Adaptador `conversar`, SSE do provedor e servidor simulado

## Contrato de entrada

`conversar(pedido)` em `src/lib/openrouter.ts:139-171`. `PedidoDeConversa` (`src/lib/openrouter.ts:120-133`): `chave` (texto), `modelo`, `mensagens` (`{role: 'system'|'user'|'assistant', content}`), `temperatura?`, `maxTokens?`, `sinal?` (AbortSignal), `tempoPrimeiroByteMs?` (padrão 30 000), `tempoTotalMs?` (padrão 120 000). O corpo enviado ao provedor tem `stream: true` e só inclui `temperature` e `max_tokens` quando informados (`src/lib/openrouter.ts:148-156`).

## Contrato de saída

`AsyncGenerator<string>`: cada item é um trecho de texto de `choices[0].delta.content` (`src/lib/sse.ts:41`). O adaptador NÃO devolve o uso de tokens: `lerTrechosDeSSE` ignora o campo `usage` do evento final (`src/lib/sse.ts:9-14`, só lê `error` e `choices`). Portanto `tokensEntrada` e `tokensSaida` não vêm do adaptador atual. Cancelamento pelo `sinal` termina a iteração sem erro (`src/lib/openrouter.ts:161`). Erro do provedor, inclusive no meio do stream, vira `ErroDeAplicacao` com código `provedor_*` (`src/lib/erros.ts:45-90`).

## Limites e cotas

Timeout até o primeiro byte 30 s e total 120 s (`src/lib/openrouter.ts:130-133`, PR-38). Tamanho máximo de `messages` e `max_tokens` por modelo: `NÃO DOCUMENTADO` no repositório (`docs/agentes-e-openrouter/base/00-LACUNAS.md`, lacuna 3).

## Erros conhecidos e tratamento

Códigos de `erroDoProvedor` (`src/lib/erros.ts:45-90`): `provedor_tempo_esgotado` (504), `provedor_chave_invalida`, `provedor_sem_saldo`, `provedor_modelo_invalido`, `provedor_limite`, `provedor_indisponivel` (todos 502). As mensagens já são em português, sem corpo do provedor, e estão redigidas para o operador (a de chave inválida cita "Configurações > Integrações"). Para o visitante (FT-06/07) é preciso uma segunda saída genérica: hoje não existe.

## Riscos para a nossa implementação

- A mensagem de `provedor_chave_invalida` cita uma tela de admin: não pode chegar a visitante.
- Sem o `usage`, `tokensEntrada/tokensSaida` ficam nulos ou estimados; estimar por caracteres precisa ser declarado como estimativa.
- Cancelamento termina o gerador sem erro: o serviço de chat precisa saber que terminou por cancelamento (o próprio `sinal.aborted`) para não gravar resposta parcial como completa.
- Um teste de rota com o servidor de produção precisa apontar `OPENROUTER_BASE_URL` ao servidor simulado (padrão já usado em `tests/rotas.test.ts:59-62`).

## Servidor simulado (`tests/apoio/openrouter-falso.ts`)

`iniciarOpenRouterFalso(opcoes)` devolve `{url, requisicoes, cancelamentos, configurar, fechar}`. Opções úteis à FT-03: `resposta`, `trechos`, `intervaloEntreTrechosMs`, `erroHttp`, `erroNoMeioApos`, `chavesValidas`, `latenciaMs`; `CHAVE_VALIDA = 'sk-or-v1-chave-de-teste-0000'` (`tests/apoio/openrouter-falso.ts:38`). Modelo aceito no chat precisa estar em `modelos` (`MODELOS_PADRAO` inclui `openai/gpt-4o-mini`). `requisicoes` guarda o corpo JSON: permite afirmar sobre as mensagens enviadas (prompt, histórico, `max_tokens`).

## Fonte

`src/lib/openrouter.ts`, `src/lib/sse.ts`, `src/lib/erros.ts`, `tests/apoio/openrouter-falso.ts`, `docs/agentes-e-openrouter/base/openrouter-api.md` — acessados em 2026-09-30.
