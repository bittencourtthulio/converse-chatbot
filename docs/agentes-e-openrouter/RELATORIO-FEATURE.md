---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-02
trabalho_id: agentes-e-openrouter
status: entregue
sprints: 6
tasks: 26
testes_suite: 398
data: 2026-09-30
---

# Relatório da FT-02 — Agentes e chave do OpenRouter

Branch `feat/agentes-e-openrouter`, a partir de `feat/fundacao-e-esqueleto` (PRs empilhados). PR local: descrição em `docs/entregas/agentes-e-openrouter/PR.md`, pacote de QA em `docs/entregas/agentes-e-openrouter/QA-PACOTE.md`.

## O que foi entregue

- Criptografia de segredo (`src/lib/cripto.ts`, AES-256-GCM, formato `v1:`), com `ENCRYPTION_KEY` validada só quando um segredo é gravado ou lido.
- Tabela singleton `configuracao_do_workspace` e serviço `src/servicos/integracoes.ts`; tela Configurações > Integrações só para admin, com máscara, testar conexão e remover. A chave nunca volta ao navegador (provado por `tests/rotas.test.ts`).
- Adaptador do OpenRouter (`src/lib/openrouter.ts`, `src/lib/sse.ts`): `listarModelos`, `verificarChave`, `conversar` em stream, timeouts, cancelamento e erros em português.
- Servidor simulado reutilizável em `tests/apoio/openrouter-falso.ts`.
- Agentes: modelo, serviço `src/servicos/agentes.ts`, telas `/agentes`, `/agentes/novo` e `/agentes/[id]` com `AbasDoAgente`, seletor de modelo e exclusão com confirmação na tela; agente de exemplo na seed; teste que barra migração destrutiva sem marca.

## Como demonstrar

`npm run setup`, `npm run dev`, entrar com `admin@exemplo.local` / `demo1234` (contas fictícias), seguir `docs/entregas/agentes-e-openrouter/QA-PACOTE.md`. Para a chave sem gastar crédito, apontar `OPENROUTER_BASE_URL` para o servidor simulado.

## Verificação

398 testes (184 herdados, 214 novos); `npx tsc --noEmit`, lint, build e `npm audit --audit-level=high` (0) verdes. Verificação visual em `docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md`.

## Desvios do plano

- Plano regerado uma vez (a auditoria barrou T-05.06 e T-05.07 sem teste próprio); 27 tasks viraram 26.
- Arquivos não previstos, declarados nas tasks e no `ENTREGA.md`: `tests/erros.test.ts`, `tests/acoes-de-agente.test.ts`, `tests/agentes-modelos.test.ts`, `carregar-agente.ts`, `agentes/novo/loading.tsx`, `modelosParaOSeletor` em `src/servicos/agentes.ts`, edições em `global.css`; a lista de agentes ficou em `agentes/(lista)/` para o 404 de id inexistente sair como 404.
- O briefing cita `/auth/key`; o adaptador usa `/key` (documentada) e o servidor simulado atende as duas.
- Correção no CSS herdado: botão secundário de `<button>` sem borda (achado da verificação visual).
- O histórico de esforço (`HISTORICO.md`) não foi gravado: o esforço real por task não foi medido.

## Premissas e pendências

Novas: PR-38 (parâmetros do adaptador), PR-39 (formato do segredo e da máscara), PR-40 (limites do cadastro de agente). Sem pendência nova; a PEND-07 (verificação em celular real) ganhou os formulários da FT-02.
