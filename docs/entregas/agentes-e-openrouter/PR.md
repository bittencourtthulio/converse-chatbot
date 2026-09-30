---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
branch: feat/agentes-e-openrouter
branch_base: feat/fundacao-e-esqueleto
atualizado_em: 2026-09-30
---

# FT-02 — Agentes e chave do OpenRouter (projeto plataforma-chatbot-ia)

O admin cadastra a chave do OpenRouter em Configurações > Integrações (criptografada em repouso, só a máscara aparece, nunca volta ao navegador) e qualquer usuário cria, edita e exclui agentes escolhendo instruções, modelo, temperatura e mensagem inicial.
Junto vêm o adaptador do OpenRouter (modelos com cache e reserva, verificação de chave e conversa em stream com parser SSE) e um servidor simulado reutilizável, para as próximas features testarem sem a rede real.

Este PR está empilhado sobre `feat/fundacao-e-esqueleto` (FT-01).

## Arquivos alterados

```
./
  M .env.example
  M README.md
docs/agentes-e-openrouter/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/agentes-e-openrouter/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A ambiente-e-segredos.md
  A banco-e-migrations.md
  A interface-e-menu.md
  A openrouter-api.md
docs/agentes-e-openrouter/sprint-01/
  A tasks.md
docs/agentes-e-openrouter/sprint-02/
  A tasks.md
docs/agentes-e-openrouter/sprint-03/
  A tasks.md
docs/agentes-e-openrouter/sprint-04/
  A tasks.md
docs/agentes-e-openrouter/sprint-05/
  A tasks.md
docs/agentes-e-openrouter/sprint-06/
  A tasks.md
docs/entregas/agentes-e-openrouter/
  A ATENCAO.md
  A ENTREGA.md
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
  M seed.ts
prisma/migrations/20260930145651_configuracao_do_workspace/
  A migration.sql
prisma/migrations/20260930150122_agentes/
  A migration.sql
src/app/
  M acoes.ts
src/app/(sistema)/agentes/(lista)/
  A loading.tsx
  A page.tsx
src/app/(sistema)/agentes/[id]/
  A carregar-agente.ts
  A layout.tsx
  A loading.tsx
  A page.tsx
src/app/(sistema)/agentes/novo/
  A loading.tsx
  A page.tsx
src/app/(sistema)/configuracoes/integracoes/
  A layout.tsx
  A loading.tsx
  A page.tsx
src/componentes/
  A AbasDoAgente.tsx
  A BotaoExcluirAgente.tsx
  A FormularioDeAgente.tsx
  M Icones.tsx
  A PainelDaChaveOpenrouter.tsx
  A SeletorDeModelo.tsx
  A abas-do-agente.ts
  M itens-de-menu.ts
src/estilos/
  M global.css
src/lib/
  M ambiente.ts
  A cripto.ts
  M erros.ts
  A openrouter.ts
  A sse.ts
src/servicos/
  A agentes.ts
  A integracoes.ts
tests/
  A abas-do-agente.test.tsx
  A acoes-de-agente.test.ts
  A agentes-modelos.test.ts
  A agentes.test.ts
  M ajuda.ts
  M ambiente.test.ts
  M componentes.test.tsx
  A cripto.test.ts
  A erros.test.ts
  A formulario-de-agente.test.tsx
  A integracoes-conexao.test.ts
  A integracoes.test.ts
  M menu.test.ts
  A migracoes.test.ts
  A openrouter-conversar.test.ts
  A openrouter-falso.test.ts
  A openrouter.test.ts
  M projeto.test.ts
  M rotas.test.ts
  M seed.test.ts
  A seletor-de-modelo.test.tsx
  M setup.ts
  A sse.test.ts
tests/apoio/
  A openrouter-falso.ts
```

Total: 86 arquivos.

## Origem

Feature FT-02 (`agentes-e-openrouter`) do mapa do projeto `plataforma-chatbot-ia`, que realiza as premissas PR-01, PR-06 e PR-14. Planejamento e decisões em `docs/agentes-e-openrouter/` (decisões `D-00` a `D-25`, premissas novas PR-38 a PR-40).

## Análise de impacto

Acrescenta duas tabelas (`configuracao_do_workspace` e `agentes`, migrations só de `CREATE TABLE`), duas variáveis de ambiente opcionais (`OPENROUTER_BASE_URL`, `APP_URL`) e uma que só é exigida ao gravar ou ler segredo (`ENCRYPTION_KEY`). O menu ganha "Agentes" e, para admin, "Integrações". Corrige a borda dos botões secundários de `<button>`, que já vinha sem borda da FT-01. Não muda login, usuários, perfil nem as tabelas existentes; não há chamada à rede real em nenhum teste.

Detalhe: [00-DECISOES.md](../../agentes-e-openrouter/00-DECISOES.md)

## O que foi testado

- Criptografia e ambiente: `tests/cripto.test.ts`, `tests/ambiente.test.ts`, `tests/erros.test.ts`.
- Parser SSE e adaptador do OpenRouter contra o servidor simulado: `tests/sse.test.ts`, `tests/openrouter.test.ts`, `tests/openrouter-conversar.test.ts`, `tests/openrouter-falso.test.ts`.
- Chave do workspace, serviço de integrações e serviço de agentes: `tests/integracoes.test.ts`, `tests/integracoes-conexao.test.ts`, `tests/agentes.test.ts`, `tests/agentes-modelos.test.ts`, `tests/acoes-de-agente.test.ts`.
- Migrations sem remoção sem marca (`tests/migracoes.test.ts`) e seed com o agente de exemplo (`tests/seed.test.ts`).
- Telas e componentes: `tests/componentes.test.tsx`, `tests/menu.test.ts`, `tests/abas-do-agente.test.tsx`, `tests/seletor-de-modelo.test.tsx`, `tests/formulario-de-agente.test.tsx`, `tests/rotas.test.ts` (servidor de produção: guarda de admin, 404, e a chave e o texto cifrado ausentes da resposta).
- Verificação visual em `docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md` (formulários a 375 px não vistos em navegador).

Suíte: 398 testes passaram (184 herdados e 214 novos), mais lint, `npx tsc --noEmit`, `npm run build` e `npm audit --audit-level=high` (0 vulnerabilidades) sem falha — `npm test`

## Como reverter

Reverter os commits da branch `feat/agentes-e-openrouter`. As migrations só criam tabelas novas, então um banco já migrado continua funcionando com o código anterior (as tabelas ficam sem uso).

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 10 casos. Colaterais: o visual dos botões secundários mudou em todas as telas (agora com borda).

## Onde eu quero seu olho

### OLHO OBRIGATÓRIO — ler linha a linha

- `prisma/migrations/20260930145651_configuracao_do_workspace/migration.sql` (A, +7/-0) — O3 migração de banco: só CREATE TABLE (verificado por tests/migracoes.test.ts)
- `prisma/migrations/20260930150122_agentes/migration.sql` (A, +13/-0) — O3 migração de banco: só CREATE TABLE (verificado por tests/migracoes.test.ts)
- `prisma/schema.prisma` (M, +33/-0) — O3 migração/modelo de banco: acrescenta duas tabelas (configuracao_do_workspace guarda a chave cifrada; agentes com chave estrangeira); provado por tests/integracoes.test.ts e tests/agentes.test.ts
- `src/app/(sistema)/configuracoes/integracoes/layout.tsx` (A, +15/-0) — O2 guarda de admin no servidor (307 antes do carregamento); provado por tests/rotas.test.ts
- `src/app/(sistema)/configuracoes/integracoes/page.tsx` (A, +47/-0) — O1 exibe estado da chave: recebe só a máscara; provado por tests/rotas.test.ts (nem a chave nem o texto cifrado na resposta)
- `src/app/acoes.ts` (M, +113/-0) — O2 ações de servidor: chave do OpenRouter, exclusão de agente; mensagemSemSegredo evita vazar a chave em log; provado por tests/acoes-de-agente.test.ts e tests/rotas.test.ts
- `src/lib/ambiente.ts` (M, +18/-0) — O1 configuração e segredo: getter preguiçoso de ENCRYPTION_KEY e URLs do provedor; provado por tests/ambiente.test.ts
- `src/lib/cripto.ts` (A, +86/-0) — O1 segredo: AES-256-GCM, IV, validação de ENCRYPTION_KEY, mensagens sem valor de chave; provado por tests/cripto.test.ts
- `src/lib/openrouter.ts` (A, +191/-0) — O4 efeito externo com credencial: envia a chave em Authorization, timeouts, cancelamento e mapeamento de erros sem vazar corpo; provado por tests/openrouter.test.ts e tests/openrouter-conversar.test.ts contra servidor simulado (nunca contra o provedor real)
- `src/servicos/agentes.ts` (A, +183/-0) — O2 autorização e validação: decisão PR-40 de que qualquer usuário gerencia qualquer agente, exclusão definitiva, zod; provado por tests/agentes.test.ts
- `src/servicos/integracoes.ts` (A, +139/-0) — O1 segredo e autorização: só admin, grava cifrado, estado só com máscara, chave decifrada só para serviços; provado por tests/integracoes.test.ts e tests/integracoes-conexao.test.ts

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` (M, +15/-0)
- `README.md` (M, +13/-4)
- `prisma/seed.ts` (M, +24/-0)
- `src/app/(sistema)/agentes/(lista)/loading.tsx` (A, +10/-0)
- `src/app/(sistema)/agentes/(lista)/page.tsx` (A, +64/-0)
- `src/app/(sistema)/agentes/[id]/carregar-agente.ts` (A, +17/-0)
- `src/app/(sistema)/agentes/[id]/layout.tsx` (A, +29/-0)
- `src/app/(sistema)/agentes/[id]/loading.tsx` (A, +6/-0)
- `src/app/(sistema)/agentes/[id]/page.tsx` (A, +53/-0)
- `src/app/(sistema)/agentes/novo/loading.tsx` (A, +6/-0)
- `src/app/(sistema)/agentes/novo/page.tsx` (A, +30/-0)
- `src/app/(sistema)/configuracoes/integracoes/loading.tsx` (A, +6/-0)
- `src/componentes/AbasDoAgente.tsx` (A, +37/-0)
- `src/componentes/BotaoExcluirAgente.tsx` (A, +82/-0)
- `src/componentes/FormularioDeAgente.tsx` (A, +139/-0)
- `src/componentes/Icones.tsx` (M, +13/-0)
- `src/componentes/PainelDaChaveOpenrouter.tsx` (A, +130/-0)
- `src/componentes/SeletorDeModelo.tsx` (A, +80/-0)
- `src/componentes/abas-do-agente.ts` (A, +16/-0)
- `src/componentes/itens-de-menu.ts` (M, +18/-1)
- `src/lib/erros.ts` (M, +48/-0)
- `src/lib/sse.ts` (A, +70/-0)

Os 52 arquivos dispensáveis (testes, estilos e documentos) estão em [ATENCAO.md](ATENCAO.md).
