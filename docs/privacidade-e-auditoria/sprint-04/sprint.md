---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-04
atualizado_em: 2026-10-01
titulo: "Expurgo automatico em segundo plano"
status: nao_iniciado
criterio_saida: "a suite inteira passa com 0 failed e o expurgo apaga so o que passou do corte, em lotes, e roda pela subida do servidor"
fases: ["F-04.1", "F-04.2"]
riscos: ["lote de exclusao no SQLite sem medida de limite seguro (base/00-LACUNAS.md, lacuna 3): usa 500 por premissa PR-89", "o agendador e por processo (PR-05) e nao deve rodar durante a restauracao da FT-11"]
---

# Sprint 04 — Expurgo automatico em segundo plano

## Objetivo

Entrega a regra de expurgo com os limites exatos testados e a tarefa em segundo plano iniciada pela subida do servidor.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Regra do expurgo | nenhuma |
| F-04.2 | Agendador | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

a suite inteira passa com 0 failed e o expurgo apaga so o que passou do corte, em lotes, e roda pela subida do servidor.

## Riscos conhecidos

- lote de exclusao no SQLite sem medida de limite seguro (base/00-LACUNAS.md, lacuna 3): usa 500 por premissa PR-89
- o agendador e por processo (PR-05) e nao deve rodar durante a restauracao da FT-11
