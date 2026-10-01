# Log, erro e correlação hoje

## Contrato de entrada

Não existe módulo de log. Há 22 chamadas `console.*` em `src/` (varredura de `grep -rn "console\." src`): `src/instrumentation.ts:14,20,29` (eventos `auditoria_nao_ligou`, `expurgo_nao_iniciou`, `fila_nao_iniciou`), `src/app/eventos-sse.ts:26`, `src/app/acoes.ts:50` (`console.error(erro)`, imprime o objeto do erro inteiro) e `src/app/acoes.ts:61`, `src/app/api/conversas/resposta.ts:14`, `src/app/api/agentes/[id]/fontes/resposta.ts:14`, `src/servicos/auditoria.ts:138`, `canal-telegram.ts:49`, `fontes.ts:303,339`, `fontes-fila.ts:222`, `historico.ts:271`, `chat.ts:75,89,124`, `telegram-webhook.ts:146,186`, `expurgo.ts:163`, `agentes.ts:177`, `transcricao-de-midia.ts:158`. Todas escrevem uma linha `JSON.stringify({evento, ...})`, sem `nivel` nem `quando`. `prisma/seed.ts:246-259` usa `console.log` e `console.error` como saída de comando de linha de comando.

## Contrato de saída

A correlação é gerada por `gerarCorrelacao()` (4 bytes em hexadecimal, `src/servicos/chat-erros.ts:30`) e devolvida por `mensagemParaOperador` como "Código de referência: <id>" (`src/servicos/chat-erros.ts:39-50`). Rotas de conversas e fontes têm `erroEmJson` próprio (`src/app/api/conversas/resposta.ts:11-18`). A tela de erro do sistema mostra `error.digest` (`src/app/(sistema)/error.tsx:6-27`). Não existem `src/app/error.tsx`, `global-error.tsx` nem `not-found.tsx` na raiz de `src/app` (`ls src/app`); há `not-found.tsx` apenas em `src/app/embed/[id]` (FT-06, CONVENCOES seção 5). Nenhum cabeçalho `X-Correlacao` existe.

## Limites e cotas

`src/proxy.ts:28` roda só em `/embed/:path*`, no runtime Node, e o valor de `matcher` precisa ser constante (`src/proxy.ts:27`). O log do turno de conversa nunca leva conteúdo (PR-42, `src/servicos/chat.ts:72-86`). Teto de tamanho de linha de log: NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

57 ocorrências de `console` em `tests/`: 27 são `vi.spyOn(console, ...)` que leem o JSON da linha, por exemplo `tests/chat-falhas.test.ts:17`, `tests/eventos-sse.test.ts:172`, `tests/instrumentacao.test.ts:96,175`; `tests/projeto.test.ts:419` confere a citação `src/app/acoes.ts:50` com o texto `console.error(erro)`. `tests/telegram-token-nao-vaza.test.ts:71` e `tests/integracoes-conexao.test.ts:84-86` provam que token e chave não chegam ao console.

## Riscos para a nossa implementação

Trocar o formato da linha (`evento` por `msg`, mais `nivel` e `quando`) quebra os testes acima, que passam a ser atualizados. O ESLint do projeto usa `eslint-config-next` e as regras de camada (`eslint.config.mjs:62-67`); a regra contra `console` precisa de exceção para `src/lib/log.ts` e para `prisma/seed.ts` e `scripts/`. `src/lib` não pode importar `src/servicos` nem `next/*` além de `headers()` (`docs/stack/CONVENCOES.md` seção 5), por isso a correlação por requisição em `src/lib/log.ts` fica em `AsyncLocalStorage` puro, sem `next/headers`.

## Fonte

`src/instrumentation.ts`, `src/app/acoes.ts`, `src/app/eventos-sse.ts`, `src/app/api/conversas/resposta.ts`, `src/servicos/chat-erros.ts`, `src/servicos/chat.ts`, `src/proxy.ts`, `src/app/(sistema)/error.tsx`, `tests/` — acessado em 2026-10-01
