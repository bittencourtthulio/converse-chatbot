---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-04
atualizado_em: 2026-10-01
fases:
  - id: F-04.1
    titulo: "Regra do expurgo"
    status: nao_iniciado
    criterio_saida: "tests/expurgo.test.ts passa com os testes de fronteira"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01"]
  - id: F-04.2
    titulo: "Agendador"
    status: nao_iniciado
    criterio_saida: "tests/expurgo-agendador.test.ts e tests/instrumentacao.test.ts passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.02"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

---

## F-04.1 — Regra do expurgo

**Objetivo:** Regra do expurgo.

**Tasks que a compõem:** T-04.01

**Critério de saída:** tests/expurgo.test.ts passa com os testes de fronteira.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Agendador

**Objetivo:** Agendador.

**Tasks que a compõem:** T-04.02

**Critério de saída:** tests/expurgo-agendador.test.ts e tests/instrumentacao.test.ts passam.

**Roda em paralelo com:** nenhuma

