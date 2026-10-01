---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-04
atualizado_em: 2026-09-30
titulo: "Atendimento das atualizacoes"
status: pendente
criterio_saida: "Uma atualizacao do Telegram, autenticada e deduplicada, e atendida ponta a ponta no servico: comandos, resposta com fontes, falhas e limites."
fases: ["F-04.1", "F-04.2"]
riscos: ["responderMensagem grava a pergunta antes do provedor: sem dedupe haveria resposta duplicada", "a exclusao mutua e em memoria e vale por processo (PR-05)"]
---

# Sprint 04 — Atendimento das atualizacoes

## Objetivo

Uma atualizacao do Telegram, autenticada e deduplicada, e atendida ponta a ponta no servico: comandos, resposta com fontes, falhas e limites.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Autenticar, validar e deduplicar | nenhuma |
| F-04.2 | Atender | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Uma atualizacao do Telegram, autenticada e deduplicada, e atendida ponta a ponta no servico: comandos, resposta com fontes, falhas e limites.

## Riscos conhecidos

- responderMensagem grava a pergunta antes do provedor: sem dedupe haveria resposta duplicada
- a exclusao mutua e em memoria e vale por processo (PR-05)
