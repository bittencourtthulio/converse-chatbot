---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-05
atualizado_em: 2026-09-30
fases:
  - id: F-05.1
    titulo: "Script"
    status: nao_iniciado
    criterio_saida: "Montagem e interacao do widget."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.01", "T-05.02"]
  - id: F-05.2
    titulo: "Rota do script"
    status: nao_iniciado
    criterio_saida: "/widget.js em producao."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.03"]
---

# Fases — Sprint 05

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Script"]
    T_05_01["T-05.01<br/>Widget: montagem, config e i"]
    T_05_02["T-05.02<br/>Widget: abrir, fechar, foco "]
  end
  subgraph fase_05_2["F-05.2 — Rota do script"]
    T_05_03["T-05.03<br/>Rota /widget.js"]
  end
  T_05_01 --> T_05_02
  T_05_02 --> T_05_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_05_01 concluida
  class T_05_02 pendente
  class T_05_03 pendente
  class T_05_01,T_05_02,T_05_03 critico
```

---

## F-05.1 — Script

**Objetivo:** Montagem e interacao do widget.

**Tasks que a compõem:** T-05.01, T-05.02

**Critério de saída:** Montagem e interacao do widget.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Rota do script

**Objetivo:** /widget.js em producao.

**Tasks que a compõem:** T-05.03

**Critério de saída:** /widget.js em producao.

**Roda em paralelo com:** nenhuma
