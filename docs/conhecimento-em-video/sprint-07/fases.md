---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-07
atualizado_em: 2026-09-30
fases:
  - id: F-07.1
    titulo: "Verificacao e documentacao"
    status: nao_iniciado
    criterio_saida: "Verificacao no navegador registrada e convencoes, lacunas e README atualizados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-07.01", "T-07.02"]
  - id: F-07.2
    titulo: "Fechamento"
    status: nao_iniciado
    criterio_saida: "MAPA, premissas, recursao e projeto atualizados e o portao pronto."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-07.03"]
---

# Fases — Sprint 07

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-07 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_07_1["F-07.1 — Verificacao e documentacao"]
    T_07_01["T-07.01<br/>Verificacao ponta a ponta no"]
    T_07_02["T-07.02<br/>Convencoes, lacunas e README"]
  end
  subgraph fase_07_2["F-07.2 — Fechamento"]
    T_07_03["T-07.03<br/>Fechamento no laco do buildx"]
  end
  T_07_01 --> T_07_02
  T_07_02 --> T_07_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_07_01 pendente
  class T_07_02 pendente
  class T_07_03 pendente
```

---

## F-07.1 — Verificacao e documentacao

**Objetivo:** Verificacao no navegador registrada e convencoes, lacunas e README atualizados.

**Tasks que a compõem:** T-07.01, T-07.02

**Critério de saída:** Verificacao no navegador registrada e convencoes, lacunas e README atualizados.

**Roda em paralelo com:** nenhuma

---

## F-07.2 — Fechamento

**Objetivo:** MAPA, premissas, recursao e projeto atualizados e o portao pronto.

**Tasks que a compõem:** T-07.03

**Critério de saída:** MAPA, premissas, recursao e projeto atualizados e o portao pronto.

**Roda em paralelo com:** nenhuma

---

