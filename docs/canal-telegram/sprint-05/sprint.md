---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-05
atualizado_em: 2026-09-30
titulo: "Rota do webhook e acoes de servidor"
status: pendente
criterio_saida: "O webhook responde 200 rapido e atende depois contra o servidor de producao, e as acoes de servidor gerenciam o canal sem expor o token."
fases: ["F-05.1", "F-05.2"]
riscos: ["after() em next start precisa ser provado por teste de producao (lacuna 3)", "os testes de rota exigem npm run build antes"]
---

# Sprint 05 — Rota do webhook e acoes de servidor

## Objetivo

O webhook responde 200 rapido e atende depois contra o servidor de producao, e as acoes de servidor gerenciam o canal sem expor o token.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Rota do webhook | nenhuma |
| F-05.2 | Acoes de servidor | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

O webhook responde 200 rapido e atende depois contra o servidor de producao, e as acoes de servidor gerenciam o canal sem expor o token.

## Riscos conhecidos

- after() em next start precisa ser provado por teste de producao (lacuna 3)
- os testes de rota exigem npm run build antes
