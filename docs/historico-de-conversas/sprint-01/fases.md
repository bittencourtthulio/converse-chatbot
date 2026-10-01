---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-01
atualizado_em: 2026-10-01
fases:
  - id: F-01.1
    titulo: "Apoio de teste e caracterizacao do SQLite"
    status: nao_iniciado
    criterio_saida: "O contador, as fixtures e a caracterizacao do SQLite passam em teste."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01", "T-01.02", "T-01.03"]
  - id: F-01.2
    titulo: "Tokens de canal e de serie"
    status: nao_iniciado
    criterio_saida: "Tokens de canal e de serie existem nos tres blocos com contraste de 4,5:1."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.04"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Apoio de teste e caracterizacao do SQLite"]
    T_01_01["T-01.01<br/>Contador de consultas ao ban"]
    T_01_02["T-01.02<br/>Fixtures de conversas dos tr"]
    T_01_03["T-01.03<br/>Caracterizacao do SQLite: Da"]
  end
  subgraph fase_01_2["F-01.2 — Tokens de canal e de serie"]
    T_01_04["T-01.04<br/>Tokens de canal e de serie d"]
  end
  T_01_01 --> T_01_02
  T_01_02 --> T_01_03
  T_01_03 --> T_01_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 pendente
  class T_01_04 pendente
```

---

## F-01.1 — Apoio de teste e caracterizacao do SQLite

**Objetivo:** Apoio de teste e caracterizacao do SQLite.

**Tasks que a compõem:** T-01.01, T-01.02, T-01.03

**Critério de saída:** O contador, as fixtures e a caracterizacao do SQLite passam em teste.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Tokens de canal e de serie

**Objetivo:** Tokens de canal e de serie.

**Tasks que a compõem:** T-01.04

**Critério de saída:** Tokens de canal e de serie existem nos tres blocos com contraste de 4,5:1.

**Roda em paralelo com:** nenhuma

