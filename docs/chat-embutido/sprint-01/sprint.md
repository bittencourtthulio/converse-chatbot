---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-01
titulo: "Capacidade de testar: dados, modulos puros e harness de DOM"
status: nao_iniciado
criterio_saida: "A suite inteira esta verde com a migration nova, os modulos de dominio e cor testados e um teste de happy-dom rodando."
fases: ["F-01.1", "F-01.2"]
riscos: ["happy-dom pode nao cobrir Shadow DOM ou postMessage com origin (lacuna 4 da base); plano B e jsdom (D-11)", "migration tem de so acrescentar (tests/migracoes.test.ts)"]
atualizado_em: 2026-09-30
---

# Sprint 01 — Capacidade de testar: dados, modulos puros e harness de DOM

## Objetivo

Modelo de dados da configuracao do chat, modulos puros de dominio e de cor, variavel APP_URL e harness de DOM, sem funcionalidade de negocio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Modelo e modulos puros | nenhuma |
| F-01.2 | Ambiente e harness de DOM | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite inteira esta verde com a migration nova, os modulos de dominio e cor testados e um teste de happy-dom rodando.

## Riscos conhecidos

- happy-dom pode nao cobrir Shadow DOM ou postMessage com origin (lacuna 4 da base); plano B e jsdom (D-11)
- migration tem de so acrescentar (tests/migracoes.test.ts)
