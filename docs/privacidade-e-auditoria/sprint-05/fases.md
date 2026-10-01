---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-05
atualizado_em: 2026-10-01
fases:
  - id: F-05.1
    titulo: "Titular pelo admin"
    status: concluido
    criterio_saida: "tests/titular.test.ts e tests/titulares-exportar-rota.test.ts passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.01", "T-05.02"]
  - id: F-05.2
    titulo: "Visitante apaga a propria conversa"
    status: concluido
    criterio_saida: "tests/publico-apagar.test.ts, tests/publico-apagar-rota.test.ts e os testes do embed passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.03", "T-05.04"]
---

# Fases — Sprint 05

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

---

## F-05.1 — Titular pelo admin

**Objetivo:** Titular pelo admin.

**Tasks que a compõem:** T-05.01, T-05.02

**Critério de saída:** tests/titular.test.ts e tests/titulares-exportar-rota.test.ts passam.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Visitante apaga a propria conversa

**Objetivo:** Visitante apaga a propria conversa.

**Tasks que a compõem:** T-05.03, T-05.04

**Critério de saída:** tests/publico-apagar.test.ts, tests/publico-apagar-rota.test.ts e os testes do embed passam.

**Roda em paralelo com:** nenhuma

