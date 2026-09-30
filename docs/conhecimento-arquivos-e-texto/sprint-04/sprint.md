---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-04
titulo: "Servico e fila em segundo plano"
status: nao_iniciado
criterio_saida: "tests/fontes-fila*.test.ts, tests/fontes*.test.ts e tests/instrumentacao.test.ts passam e a suite esta verde."
fases: ["F-04.1", "F-04.2", "F-04.3"]
riscos: ["duas execucoes da mesma fonte se a reivindicacao nao for atomica: updateMany condicional (PR-48)", "register() bloquear a subida se esperar o processamento (base/servicos-handlers-e-fila.md)"]
atualizado_em: 2026-09-30
---

# Sprint 04 — Servico e fila em segundo plano

## Objetivo

Fila com concorrencia 2 e retomada, servico fontes completo e instrumentation.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Fila | nenhuma |
| F-04.2 | Servico fontes | nenhuma |
| F-04.3 | Subida do servidor | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/fontes-fila*.test.ts, tests/fontes*.test.ts e tests/instrumentacao.test.ts passam e a suite esta verde.

## Riscos conhecidos

- duas execucoes da mesma fonte se a reivindicacao nao for atomica: updateMany condicional (PR-48)
- register() bloquear a subida se esperar o processamento (base/servicos-handlers-e-fila.md)
