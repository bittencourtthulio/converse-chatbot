---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-03
atualizado_em: 2026-10-01
titulo: "Rotas HTTP e menu"
status: nao_iniciado
criterio_saida: "A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-03.01, T-03.02, T-03.03)."
fases: ["F-03.1", "F-03.2"]
riscos: ["Content-Disposition e nome de arquivo sem dado pessoal (PR-83)", "testes de rota exigem npm run build antes"]
---

# Sprint 03 — Rotas HTTP e menu

## Objetivo

Os handlers DELETE, de lote e de exportacao respondem com sessao e codigos corretos, e o item Conversas entra no menu abaixo de Agentes.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Handlers | nenhuma |
| F-03.2 | Menu | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-03.01, T-03.02, T-03.03).

## Riscos conhecidos

- Content-Disposition e nome de arquivo sem dado pessoal (PR-83)
- testes de rota exigem npm run build antes
