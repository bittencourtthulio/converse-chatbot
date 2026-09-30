---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-03
atualizado_em: 2026-09-30
fases:
  - id: F-03.1
    titulo: "API publica"
    status: nao_iniciado
    criterio_saida: "As tres rotas publicas por HTTP real."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02", "T-03.03"]
  - id: F-03.2
    titulo: "Cabecalhos de /embed"
    status: nao_iniciado
    criterio_saida: "proxy.ts e next.config.ts."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.04"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — API publica"]
    T_03_01["T-03.01<br/>Rota GET config e OPTIONS"]
    T_03_02["T-03.02<br/>Rota POST conversar"]
    T_03_03["T-03.03<br/>Rota GET conversa"]
  end
  subgraph fase_03_2["F-03.2 — Cabecalhos de /embed"]
    T_03_04["T-03.04<br/>proxy.ts e X-Frame-Options f"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03
  T_03_03 --> T_03_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 pendente
  class T_03_01,T_03_02,T_03_03,T_03_04 critico
```

---

## F-03.1 — API publica

**Objetivo:** As tres rotas publicas por HTTP real.

**Tasks que a compõem:** T-03.01, T-03.02, T-03.03

**Critério de saída:** As tres rotas publicas por HTTP real.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Cabecalhos de /embed

**Objetivo:** proxy.ts e next.config.ts.

**Tasks que a compõem:** T-03.04

**Critério de saída:** proxy.ts e next.config.ts.

**Roda em paralelo com:** nenhuma
