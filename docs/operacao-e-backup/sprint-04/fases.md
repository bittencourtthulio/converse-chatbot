---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-04
atualizado_em: 2026-10-01
fases:
  - id: F-04.1
    titulo: "Menu, guarda e esqueleto"
    status: nao_iniciado
    criterio_saida: "O item Sistema aparece so para admin e o nao admin recebe 307"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01"]
  - id: F-04.2
    titulo: "Cartoes e estilos"
    status: nao_iniciado
    criterio_saida: "Os cartoes mostram o detalhe e o CSS prova 375 px e tokens"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.02", "T-04.03"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Menu, guarda e esqueleto"]
    T_04_01["T-04.01<br/>Item de menu, guarda de…"]
  end
  subgraph fase_04_2["F-04.2 — Cartoes e estilos"]
    T_04_02["T-04.02<br/>Cartoes de detalhe do…"]
    T_04_03["T-04.03<br/>Estilos e responsividade da…"]
  end
  T_04_01 --> T_04_02
  T_04_02 --> T_04_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 pendente
  class T_04_02 pendente
  class T_04_03 pendente
  class T_04_03,T_04_02,T_04_01 critico
```

---

## F-04.1 — Menu, guarda e esqueleto

**Objetivo:** Menu, guarda e esqueleto.

**Tasks que a compõem:** T-04.01

**Critério de saída:** O item Sistema aparece so para admin e o nao admin recebe 307.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Cartoes e estilos

**Objetivo:** Cartoes e estilos.

**Tasks que a compõem:** T-04.02, T-04.03

**Critério de saída:** Os cartoes mostram o detalhe e o CSS prova 375 px e tokens.

**Roda em paralelo com:** nenhuma

---

