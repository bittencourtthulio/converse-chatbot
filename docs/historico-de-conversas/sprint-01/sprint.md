---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-01
atualizado_em: 2026-10-01
titulo: "Capacidade de testar: contador de consultas, fixtures, SQLite e tokens"
status: nao_iniciado
criterio_saida: "A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-01.01, T-01.02, T-01.03, T-01.04)."
fases: ["F-01.1", "F-01.2"]
riscos: ["formato do DateTime no SQLite nao documentado (base/00-LACUNAS.md, lacuna 1): a prova por teste vem antes de qualquer strftime", "contar consultas exige cliente Prisma com log de consultas, sem exemplo no repositorio (lacuna 3)"]
---

# Sprint 01 — Capacidade de testar: contador de consultas, fixtures, SQLite e tokens

## Objetivo

Entrega o que o TDD das sprints seguintes precisa: contador de consultas ao banco, fixtures de conversas dos tres canais, a prova do formato de DateTime e do LIKE no SQLite e os tokens de canal e de serie, sem funcionalidade de negocio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Apoio de teste e caracterizacao do SQLite | nenhuma |
| F-01.2 | Tokens de canal e de serie | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-01.01, T-01.02, T-01.03, T-01.04).

## Riscos conhecidos

- formato do DateTime no SQLite nao documentado (base/00-LACUNAS.md, lacuna 1): a prova por teste vem antes de qualquer strftime
- contar consultas exige cliente Prisma com log de consultas, sem exemplo no repositorio (lacuna 3)
