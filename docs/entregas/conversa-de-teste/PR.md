---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
branch: feat/conversa-de-teste
branch_base: feat/agentes-e-openrouter
atualizado_em: 2026-09-30
---

# FT-03 — Conversa de teste com o agente (projeto plataforma-chatbot-ia)

O usuário conversa com um agente na aba Testar do painel e vê a resposta do modelo chegando em tempo real; quando o provedor falha, a conversa mostra uma mensagem clara em português, sem texto técnico. A conversa fica salva e é retomada ao recarregar a página.
Entram as tabelas de conversa e mensagem (reutilizáveis pelos canais seguintes), o serviço do turno (`responderMensagem`), as duas saídas de mensagem de erro (operador e visitante) e o primeiro handler em `src/app/api` (stream SSE).

Este PR está empilhado sobre `feat/agentes-e-openrouter` (FT-02).

## Arquivos alterados

```
./
  M .env.example
  M README.md
docs/conversa-de-teste/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/conversa-de-teste/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A banco-e-testes.md
  A interface-do-agente.md
  A servicos-handlers-e-sessao.md
  A streaming-e-openrouter.md
docs/conversa-de-teste/sprint-01/
  A tasks.md
docs/conversa-de-teste/sprint-02/
  A tasks.md
docs/conversa-de-teste/sprint-03/
  A tasks.md
docs/conversa-de-teste/sprint-04/
  A tasks.md
docs/conversa-de-teste/sprint-05/
  A tasks.md
docs/conversa-de-teste/sprint-06/
  A tasks.md
docs/conversa-de-teste/sprint-07/
  A tasks.md
docs/entregas/conversa-de-teste/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/
  M schema.prisma
prisma/migrations/20260930170000_conversas/
  A migration.sql
src/app/
  A eventos-sse.ts
src/app/(sistema)/agentes/[id]/
  M page.tsx
src/app/(sistema)/agentes/[id]/testar/
  A loading.tsx
  A page.tsx
src/app/api/agentes/[id]/conversar/
  A route.ts
src/componentes/
  A ChatDeTeste.tsx
  M Icones.tsx
  A TextoDoModelo.tsx
  M abas-do-agente.ts
  A estado-da-conversa.ts
  M itens-de-menu.ts
  A leitor-de-sse.ts
  A texto-seguro.ts
src/estilos/
  M global.css
src/lib/
  M ambiente.ts
src/servicos/
  A chat-erros.ts
  A chat-prompt.ts
  A chat.ts
  A conversas.ts
  M integracoes.ts
tests/
  M abas-do-agente.test.tsx
  M ajuda.ts
  M ambiente.test.ts
  A chat-de-teste.test.tsx
  A chat-erros.test.ts
  A chat-falhas.test.ts
  A chat-prompt.test.ts
  A chat.test.ts
  A conversar-rota.test.ts
  A conversas-modelo.test.ts
  A conversas.test.ts
  A estado-da-conversa.test.ts
  A eventos-sse.test.ts
  M integracoes.test.ts
  A leitor-de-sse.test.ts
  M projeto.test.ts
  M rotas.test.ts
  A texto-seguro.test.tsx
tests/apoio/
  A chat.ts
  A servir-falso.ts
```

Total: 75 arquivos.

## Origem

Feature FT-03 (`conversa-de-teste`) do mapa do projeto `plataforma-chatbot-ia`, que realiza a premissa PR-22. Planejamento e decisões em `docs/conversa-de-teste/` (decisões `D-00` a `D-22`, premissas novas PR-41 a PR-44).

## Análise de impacto

Acrescenta duas tabelas (`conversas` e `mensagens`, migration só de `CREATE TABLE` e `CREATE INDEX`), uma variável de ambiente opcional (`MAX_TOKENS_RESPOSTA`), uma rota (`POST /api/agentes/[id]/conversar`, exige sessão) e a aba "Testar" no agente. Excluir um agente passa a apagar também as conversas dele (o texto da tela de exclusão avisa). Não muda login, usuários, integrações nem as tabelas existentes; nenhum teste chama a rede real.

Detalhe: [00-DECISOES.md](../../conversa-de-teste/00-DECISOES.md)

## O que foi testado

- Tabelas e cascata: `tests/conversas-modelo.test.ts`, `tests/migracoes.test.ts`.
- Serviços: `tests/conversas.test.ts`, `tests/chat-prompt.test.ts`, `tests/chat-erros.test.ts`, `tests/chat.test.ts`, `tests/chat-falhas.test.ts` (falhas do provedor, erro no meio do stream, cancelamento e log sem conteúdo).
- Rota e stream: `tests/eventos-sse.test.ts`, `tests/conversar-rota.test.ts` (servidor de produção com o OpenRouter simulado: 401, 404, 422, 409, stream completo, erro no meio, chave recusada, cancelamento).
- Interface: `tests/texto-seguro.test.tsx`, `tests/leitor-de-sse.test.ts`, `tests/estado-da-conversa.test.ts`, `tests/chat-de-teste.test.tsx`, `tests/abas-do-agente.test.tsx`, `tests/rotas.test.ts`.
- Verificação visual em `docs/conversa-de-teste/VERIFICACAO-VISUAL.md` (temas claro e escuro vistos; 375 px não foi possível).

Suíte: 573 testes passaram (398 herdados e 175 novos), mais lint, `npx tsc --noEmit`, `npm run build` e `npm audit --audit-level=high` (0 vulnerabilidades) sem falha — `npm test`

## Como reverter

Reverter os commits da branch `feat/conversa-de-teste`. A migration só cria tabelas novas, então um banco já migrado continua funcionando com o código anterior (as tabelas ficam sem uso).

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 10 casos. Colaterais: a tela de exclusão de agente tem texto novo e o menu do agente ganhou a aba "Testar".

## Onde eu quero seu olho

### OLHO OBRIGATÓRIO — ler linha a linha

- `prisma/migrations/20260930170000_conversas/migration.sql` (A, +34/-0) — O3 migração de banco: só CREATE TABLE e CREATE INDEX (verificado por tests/migracoes.test.ts); a cascata é provada por tests/conversas-modelo.test.ts
- `prisma/schema.prisma` (M, +47/-1) — O3 modelo de banco: duas tabelas novas com chave estrangeira em cascata do agente e SET NULL do usuário; provado por tests/conversas-modelo.test.ts
- `src/app/api/agentes/[id]/conversar/route.ts` (A, +61/-0) — O2 primeiro handler HTTP: sessão conferida no servidor (401), status por erro e cabeçalhos do stream; provado por tests/conversar-rota.test.ts contra o servidor de produção
- `src/app/eventos-sse.ts` (A, +60/-0) — O1 o que chega ao navegador em caso de erro: só a mensagem do operador, sem texto técnico; provado por tests/eventos-sse.test.ts
- `src/lib/ambiente.ts` (M, +4/-0) — O1 configuração: getter novo de MAX_TOKENS_RESPOSTA; provado por tests/ambiente.test.ts
- `src/servicos/chat-erros.ts` (A, +53/-0) — O1 vazamento de detalhe: decide o que o operador e o visitante veem de um erro; provado por tests/chat-erros.test.ts
- `src/servicos/chat.ts` (A, +152/-0) — O1 turno de conversa: usa a chave do OpenRouter decifrada, define a ordem das gravações (pergunta antes, resposta só no fim), o descarte da resposta parcial e o log sem conteúdo; provado por tests/chat.test.ts e tests/chat-falhas.test.ts
- `src/servicos/conversas.ts` (A, +206/-0) — O2 autorização por posse: conversa de outro usuário, canal ou agente vira 404; provado por tests/conversas.test.ts
- `src/servicos/integracoes.ts` (M, +12/-0) — O1 segredo: função nova que só diz se há chave gravada, sem decifrar; provado por tests/integracoes.test.ts

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` (M, +4/-0)
- `README.md` (M, +8/-0)
- `src/app/(sistema)/agentes/[id]/page.tsx` (M, +1/-1)
- `src/app/(sistema)/agentes/[id]/testar/loading.tsx` (A, +15/-0)
- `src/app/(sistema)/agentes/[id]/testar/page.tsx` (A, +29/-0)
- `src/componentes/ChatDeTeste.tsx` (A, +291/-0)
- `src/componentes/Icones.tsx` (M, +2/-0)
- `src/componentes/TextoDoModelo.tsx` (A, +46/-0)
- `src/componentes/abas-do-agente.ts` (M, +4/-1)
- `src/componentes/estado-da-conversa.ts` (A, +152/-0)
- `src/componentes/itens-de-menu.ts` (M, +2/-0)
- `src/componentes/leitor-de-sse.ts` (A, +102/-0)
- `src/componentes/texto-seguro.ts` (A, +112/-0)
- `src/servicos/chat-prompt.ts` (A, +57/-0)

Os 52 arquivos dispensáveis (testes, estilos e documentos) estão em [ATENCAO.md](ATENCAO.md).
