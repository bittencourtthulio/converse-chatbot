---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-01
atualizado_em: 2026-10-01
fases:
  - id: F-01.1
    titulo: "Esquema e migration"
    status: nao_iniciado
    criterio_saida: "tests/privacidade-modelo.test.ts e tests/migracoes.test.ts passam com a migration aplicada por migrate deploy"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01"]
  - id: F-01.2
    titulo: "Apoio de teste e ambiente"
    status: nao_iniciado
    criterio_saida: "As fixtures e a leitura de AUDITORIA_RETENCAO_DIAS passam em teste"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.02", "T-01.03"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

---

## F-01.1 — Esquema e migration

**Objetivo:** Esquema e migration.

**Tasks que a compõem:** T-01.01

**Critério de saída:** tests/privacidade-modelo.test.ts e tests/migracoes.test.ts passam com a migration aplicada por migrate deploy.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Apoio de teste e ambiente

**Objetivo:** Apoio de teste e ambiente.

**Tasks que a compõem:** T-01.02, T-01.03

**Critério de saída:** As fixtures e a leitura de AUDITORIA_RETENCAO_DIAS passam em teste.

**Roda em paralelo com:** nenhuma

