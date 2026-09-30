---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-01
atualizado_em: 2026-09-30
fases:
  - id: F-01.1
    titulo: "Migration e gatilhos"
    status: concluido
    criterio_saida: "A migration aplica do zero e o indice acompanha insert, update, delete e rebuild."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01"]
  - id: F-01.2
    titulo: "Cascata, reprocessamento e apoio"
    status: concluido
    criterio_saida: "O indice acompanha cascata e reprocessamento e ha helper de base pronta para os testes seguintes."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.02", "T-01.03"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo.

```mermaid
flowchart TD
  T01_01["T-01.01 Migration do indice FTS5 e gatilhos"]
  T01_02["T-01.02 Cascata e reprocessamento mantem o indic"]
  T01_03["T-01.03 Apoio de teste: agente com base pronta"]
  T01_01 --> T01_02
  T01_01 --> T01_03
```

---

## F-01.1 — Migration e gatilhos

**Objetivo:** A migration aplica do zero e o indice acompanha insert, update, delete e rebuild.

**Tasks que a compõem:** T-01.01

**Critério de saída:** A migration aplica do zero e o indice acompanha insert, update, delete e rebuild.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Cascata, reprocessamento e apoio

**Objetivo:** O indice acompanha cascata e reprocessamento e ha helper de base pronta para os testes seguintes.

**Tasks que a compõem:** T-01.02, T-01.03

**Critério de saída:** O indice acompanha cascata e reprocessamento e ha helper de base pronta para os testes seguintes.

**Roda em paralelo com:** nenhuma

