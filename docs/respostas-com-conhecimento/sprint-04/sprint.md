---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-04
titulo: "Protocolo SSE e rotas"
status: pendente
criterio_saida: "tests/eventos-sse.test.ts, tests/leitor-de-sse.test.ts, tests/conversar-rota.test.ts, tests/buscar-rota.test.ts e tests/rotas.test.ts passam (apos npm run build) e a suite inteira esta verde."
fases: ["F-04.1", "F-04.2"]
riscos: ["os testes de rota exigem npm run build antes", "evento novo nao pode encerrar o stream nem quebrar cliente antigo"]
atualizado_em: 2026-09-30
---

# Sprint 04 — Protocolo SSE e rotas

## Objetivo

O evento fontes atravessa o SSE de forma compativel, e existe POST /api/agentes/[id]/buscar.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | SSE compativel | nenhuma |
| F-04.2 | Rota de busca | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/eventos-sse.test.ts, tests/leitor-de-sse.test.ts, tests/conversar-rota.test.ts, tests/buscar-rota.test.ts e tests/rotas.test.ts passam (apos npm run build) e a suite inteira esta verde.

## Riscos conhecidos

- os testes de rota exigem npm run build antes
- evento novo nao pode encerrar o stream nem quebrar cliente antigo
