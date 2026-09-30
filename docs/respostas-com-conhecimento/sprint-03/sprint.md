---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-03
titulo: "Prompt fundamentado e turno de chat"
status: pendente
criterio_saida: "tests/chat-prompt-fundamentado.test.ts, tests/fontes-da-resposta.test.ts, tests/chat-fundamentado.test.ts, tests/chat-fontes.test.ts e tests/conversas.test.ts passam e a suite inteira esta verde."
fases: ["F-03.1", "F-03.2"]
riscos: ["o comportamento do modelo real nao e testavel: so a estrutura do prompt (limite conhecido, PR-52)", "falha de gravacao das fontes nao pode derrubar a resposta (PR-53)"]
atualizado_em: 2026-09-30
---

# Sprint 03 — Prompt fundamentado e turno de chat

## Objetivo

O turno de chat entra em modo fundamentado, monta o prompt com material delimitado, emite e grava as fontes e a retomada as devolve.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Pecas puras | nenhuma |
| F-03.2 | Integracao no turno | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/chat-prompt-fundamentado.test.ts, tests/fontes-da-resposta.test.ts, tests/chat-fundamentado.test.ts, tests/chat-fontes.test.ts e tests/conversas.test.ts passam e a suite inteira esta verde.

## Riscos conhecidos

- o comportamento do modelo real nao e testavel: so a estrutura do prompt (limite conhecido, PR-52)
- falha de gravacao das fontes nao pode derrubar a resposta (PR-53)
