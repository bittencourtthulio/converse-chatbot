---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-06
atualizado_em: 2026-09-30
fases:
  - id: F-06.1
    titulo: "Convencoes e verificacao visual"
    status: pendente
    criterio_saida: "Evidencia em docs/stack, README e verificacao visual."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01", "T-06.02"]
  - id: F-06.2
    titulo: "Fechamento"
    status: pendente
    criterio_saida: "Registro da feature no laco do buildx."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.03"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo.

```mermaid
flowchart TD
  T06_01["T-06.01 Convencoes e lacunas com evidencia"]
  T06_02["T-06.02 README e verificacao visual"]
  T06_03["T-06.03 Fechamento no laco do buildx"]
  T06_01 --> T06_02
  T06_02 --> T06_03
```

---

## F-06.1 — Convencoes e verificacao visual

**Objetivo:** Evidencia em docs/stack, README e verificacao visual.

**Tasks que a compõem:** T-06.01, T-06.02

**Critério de saída:** Evidencia em docs/stack, README e verificacao visual.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Fechamento

**Objetivo:** Registro da feature no laco do buildx.

**Tasks que a compõem:** T-06.03

**Critério de saída:** Registro da feature no laco do buildx.

**Roda em paralelo com:** nenhuma

