# Correlação nas rotas de upload

## Contrato de entrada

O `src/proxy.ts` gera 8 caracteres hexadecimais por requisição, repassa em `x-correlacao` e devolve `X-Correlacao` (`src/proxy.ts:34-45`). O `matcher` exclui `_next/static`, `_next/image`, `favicon.ico` e `api/agentes/[^/]+/fontes` (`src/proxy.ts:54-56`), que casa também `fontes/[fonteId]`, `fontes/[fonteId]/reprocessar`, `fontes/texto`, `fontes/video` e `fontes/youtube`.

## Contrato de saída

`respostaDeErro` devolve `X-Correlacao` no erro e usa `correlacaoDaRequisicao()` (que gera código novo se o cabeçalho de requisição não existe) (`src/app/api/resposta-de-erro.ts:10-18`, `src/app/correlacao-servidor.ts:15-24`). Os caminhos de **sucesso** das rotas de fontes (`Response.json({fontes...}, {headers: semCache})`, `fontes/route.ts:19,51`; `texto/route.ts:22`; `video/route.ts:47`; `youtube/route.ts:32`) e as respostas locais `erroDeTipo` e `erroDeTamanho` (`resposta.ts:22-34`) não levam `X-Correlacao`.

## Limites e cotas

Formato do código: `^[0-9a-f]{8}$` (`correlacao-servidor.ts:8`). NÃO DOCUMENTADO outro limite.

## Erros conhecidos e tratamento

Achado 1 de `premissas-71-100.md` (PR-93): "atualizar a premissa para registrar a exceção, ou fazer essas rotas devolverem o cabeçalho também no sucesso". O comentário do proxy já admite que o erro devolve `X-Correlacao` (`proxy.ts:50-53`). Teste existente: `tests/rotas.test.ts` e `tests/log-arquitetura.test.ts` cobrem o proxy; nenhum prova o cabeçalho nas rotas de fontes.

## Riscos para a nossa implementação

(1) Um único helper (`src/lib/log.ts` tem `novaCorrelacao`; o cabeçalho de resposta é `X-Correlacao`) compartilhado entre o proxy e `resposta.ts` evita dois formatos: precisa viver onde os dois alcancem (`src/lib/`), sem `next/*`. (2) O valor deve ser o do cabeçalho de requisição quando existir (o log do erro usa a mesma correlação) e novo quando não existir (rota fora do proxy). (3) Todas as respostas dessas rotas precisam levar o cabeçalho: sucesso, erro de aplicação, 415, 413 e 401; um invólucro por handler (`comCorrelacao(handler)`) cobre os cinco arquivos de rota sem repetição. (4) Os 413 de corpo grande saem sem ler o corpo: o cabeçalho tem de ir mesmo assim. (5) Atualizar a premissa PR-93 para dizer que o proxy cobre tudo menos essas rotas, que se cobrem sozinhas.

## Fonte

`src/proxy.ts`, `src/app/correlacao-servidor.ts`, `src/app/api/resposta-de-erro.ts`, `src/app/api/agentes/[id]/fontes/**/route.ts`, `docs/projeto/validacao/premissas-71-100.md` (achado 1) — acessado em 2026-10-01
