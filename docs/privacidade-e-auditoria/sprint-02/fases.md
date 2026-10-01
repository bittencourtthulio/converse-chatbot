---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-02
atualizado_em: 2026-10-01
fases:
  - id: F-02.1
    titulo: "Servico de auditoria"
    status: concluido
    criterio_saida: "tests/auditoria.test.ts e tests/auditoria-somente-acrescimo.test.ts passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01", "T-02.02"]
  - id: F-02.2
    titulo: "Ligacoes nos servicos"
    status: concluido
    criterio_saida: "Cada acao de PR-19 grava registro e as de transacao desfazem a acao se a auditoria falha"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.03", "T-02.04", "T-02.05", "T-02.06"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

---

## F-02.1 — Servico de auditoria

**Objetivo:** Servico de auditoria.

**Tasks que a compõem:** T-02.01, T-02.02

**Critério de saída:** tests/auditoria.test.ts e tests/auditoria-somente-acrescimo.test.ts passam.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Ligacoes nos servicos

**Objetivo:** Ligacoes nos servicos.

**Tasks que a compõem:** T-02.03, T-02.04, T-02.05, T-02.06

**Critério de saída:** Cada acao de PR-19 grava registro e as de transacao desfazem a acao se a auditoria falha.

**Roda em paralelo com:** nenhuma

