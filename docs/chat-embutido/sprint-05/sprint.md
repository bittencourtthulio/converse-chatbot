---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-05
titulo: "Script widget.js"
status: nao_iniciado
criterio_saida: "Os testes do script com happy-dom e o teste de producao da rota passam e a suite inteira esta verde."
fases: ["F-05.1", "F-05.2"]
riscos: ["happy-dom pode divergir de navegador real: a verificacao ponta a ponta da sprint 07 cobre", "script e servido com cache de 300 s"]
atualizado_em: 2026-09-30
---

# Sprint 05 — Script widget.js

## Objetivo

Script JavaScript puro servido por rota, com botao flutuante, painel em Shadow DOM, iframe preguicoso e postMessage estrito.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Script | nenhuma |
| F-05.2 | Rota do script | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Os testes do script com happy-dom e o teste de producao da rota passam e a suite inteira esta verde.

## Riscos conhecidos

- happy-dom pode divergir de navegador real: a verificacao ponta a ponta da sprint 07 cobre
- script e servido com cache de 300 s
