---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-03
atualizado_em: 2026-09-30
fases:
  - id: F-03.1
    titulo: "Conectar e estado"
    status: pendente
    criterio_saida: "Conectar valida, grava cifrado e expoe o estado sem segredo."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01"]
  - id: F-03.2
    titulo: "Ciclo e limite"
    status: pendente
    criterio_saida: "Desconectar, pausar, retomar, verificar, limite diario e o teto por canal."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.02", "T-03.03"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Conectar e estado"]
    T_03_01["T-03.01<br/>Conectar o bot e ler o estad"]
  end
  subgraph fase_03_2["F-03.2 — Ciclo e limite"]
    T_03_02["T-03.02<br/>Desconectar, pausar, retomar"]
    T_03_03["T-03.03<br/>Teto diario parametrizado po"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 pendente
  class T_03_03 pendente
  class T_03_01,T_03_02,T_03_03 critico
```

---

## F-03.1 — Conectar e estado

**Objetivo:** Conectar valida, grava cifrado e expoe o estado sem segredo.

**Tasks que a compõem:** T-03.01

**Critério de saída:** Conectar valida, grava cifrado e expoe o estado sem segredo.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Ciclo e limite

**Objetivo:** Desconectar, pausar, retomar, verificar, limite diario e o teto por canal.

**Tasks que a compõem:** T-03.02, T-03.03

**Critério de saída:** Desconectar, pausar, retomar, verificar, limite diario e o teto por canal.

**Roda em paralelo com:** nenhuma

---
