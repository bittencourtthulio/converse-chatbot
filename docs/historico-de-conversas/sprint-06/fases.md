---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-06
atualizado_em: 2026-10-01
fases:
  - id: F-06.1
    titulo: "Seed, verificacao e documentacao"
    status: nao_iniciado
    criterio_saida: "A seed tem as conversas, a verificacao esta registrada e as convencoes estao atualizadas."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01", "T-06.02", "T-06.03"]
  - id: F-06.2
    titulo: "Fechamento"
    status: nao_iniciado
    criterio_saida: "MAPA, premissas, recursao e projeto atualizados e o portao pronto."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.04"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-06 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_06_1["F-06.1 — Seed, verificacao e documentacao"]
    T_06_01["T-06.01<br/>Conversas ficticias na seed"]
    T_06_02["T-06.02<br/>Verificacao no navegador dos"]
    T_06_03["T-06.03<br/>Convencoes, lacunas e README"]
  end
  subgraph fase_06_2["F-06.2 — Fechamento"]
    T_06_04["T-06.04<br/>Fechamento no laco do buildx"]
  end
  T_06_01 --> T_06_02
  T_06_02 --> T_06_03
  T_06_03 --> T_06_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_06_01 pendente
  class T_06_02 pendente
  class T_06_03 pendente
  class T_06_04 pendente
```

---

## F-06.1 — Seed, verificacao e documentacao

**Objetivo:** Seed, verificacao e documentacao.

**Tasks que a compõem:** T-06.01, T-06.02, T-06.03

**Critério de saída:** A seed tem as conversas, a verificacao esta registrada e as convencoes estao atualizadas.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Fechamento

**Objetivo:** Fechamento.

**Tasks que a compõem:** T-06.04

**Critério de saída:** MAPA, premissas, recursao e projeto atualizados e o portao pronto.

**Roda em paralelo com:** nenhuma

