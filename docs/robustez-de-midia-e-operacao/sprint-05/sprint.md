---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-05
atualizado_em: 2026-10-01
titulo: "Correlação e interface"
status: pendente
criterio_saida: "as rotas de fontes devolvem X-Correlacao, a badge de canal tem padrão, o aviso de exclusão cita o que mais é apagado e o alternador de tema tem teste de comportamento"
fases: ["F-05.1", "F-05.2"]
riscos: ["o rótulo e o padrão não podem reduzir o contraste do texto da badge", "mudar o log.ts desloca linhas citadas em CONVENCOES e LACUNAS"]
---

# Sprint 05 — Correlação e interface

## Objetivo

As rotas de fontes devolvem X-Correlacao, a badge de canal tem padrão, o aviso de exclusão cita o que mais é apagado e o alternador de tema tem teste de comportamento.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Correlação nas rotas de upload | nenhuma |
| F-05.2 | Interface: canal, exclusão e tema | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

As rotas de fontes devolvem X-Correlacao, a badge de canal tem padrão, o aviso de exclusão cita o que mais é apagado e o alternador de tema tem teste de comportamento.

## Riscos conhecidos

- o rótulo e o padrão não podem reduzir o contraste do texto da badge
- mudar o log.ts desloca linhas citadas em CONVENCOES e LACUNAS
