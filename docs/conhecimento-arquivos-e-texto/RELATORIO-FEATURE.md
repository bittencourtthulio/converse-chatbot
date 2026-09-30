---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-04
trabalho_id: conhecimento-arquivos-e-texto
status: entregue
sprints: 7
tasks: 37
testes_suite: 891
data: 2026-09-30
---

# Relatório da FT-04 — Base de conhecimento: arquivos e textos

Branch `feat/conhecimento-arquivos-e-texto`, a partir de `feat/conversa-de-teste` (PRs empilhados). PR local: descrição em `docs/entregas/conhecimento-arquivos-e-texto/PR.md`, pacote de QA em `docs/entregas/conhecimento-arquivos-e-texto/QA-PACOTE.md`.

## O que foi entregue

- Tabelas `fontes` e `trechos` (migration só acrescenta; cascata do agente e da fonte provada). `Fonte.tipo` já reserva `video` e `youtube` para a FT-08.
- `src/lib/armazenamento.ts` (originais em `<STORAGE_DIR>/fontes/<agente>/<fonte>/original`, nome enviado nunca em caminho) e a exclusão do agente apagando o diretório dele.
- `src/lib/extracao/`: validação do conteúdo real (PDF, DOCX com leitura própria do ZIP contra zip bomb, texto com BOM e Latin-1, JSON) e extração de PDF (`unpdf`), DOCX (`mammoth`), TXT, MD, CSV, HTML (`parse5`), JSON, SRT e VTT, atrás da fachada `extrairTexto`.
- `src/servicos/trechos.ts` (trechos de até 1000 caracteres, sobreposição de 150), `src/servicos/fontes-fila.ts` (fila no mesmo processo, concorrência 2, retomada na subida por `src/instrumentation.ts`) e `src/servicos/fontes.ts`.
- Cinco rotas em `src/app/api/agentes/[id]/fontes/` e a aba "Conhecimento" (resumo, adicionar arquivos e texto, lista com status e polling de 2 s, reprocessar, excluir com confirmação, "Ver conteúdo" paginado).
- Seed com fonte de exemplo já processada; `STORAGE_DIR` e `MAX_UPLOAD_MB` no `.env.example`; convenções e lacunas 5 e 8 convertidas.

## Como demonstrar

`npm run setup`, `npm run build`, `npm run start`, entrar com as contas de demonstração do README e seguir `docs/entregas/conhecimento-arquivos-e-texto/QA-PACOTE.md`. Arquivos de exemplo em `tests/fixtures/`.

## Verificação

891 testes na suíte inteira (318 novos); `npx tsc --noEmit`, lint, build e `npm audit --audit-level=high` (0) verdes. Verificação visual em `docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md`: temas claro e escuro vistos no navegador com upload real; 375 px, spinner de "Processando" e arrastar-e-soltar não foi possível ver.

## Desvios do plano

Todos em `docs/entregas/conhecimento-arquivos-e-texto/ENTREGA.md`. Os principais: `next` e `eslint-config-next` 16.3.3 para 16.3.8 pela auditoria (vulnerabilidade crítica publicada depois da FT-03); `route.ts` escrito inteiro na T-05.01; módulos `fonte-da-tela.ts` e `enviar-arquivo.ts` não previstos; testes da FT-03 ajustados (`chat-de-teste.test.tsx`, `rotas.test.ts`, `abas-do-agente.test.tsx`); a auditoria da F5 achou um paralelismo falso (ALTA) e o plano foi regerado uma vez; o portão E2 acusou 14 arquivos `sprint.md`/`fases.md` não declarados, declarados na T-07.04.

## Premissas e pendências

Novas: PR-45 (validação do upload e da extração), PR-46 (trechos), PR-47 (armazenamento e ciclo de vida), PR-48 (fila) e PR-49 (contrato HTTP e tela). PR-13 passou a constar como realizada também na FT-04. Sem pendência nova; a PEND-07 (verificação em celular real) ganhou a aba Conhecimento.
