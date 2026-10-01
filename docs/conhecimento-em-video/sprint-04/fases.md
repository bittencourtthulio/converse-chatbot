---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-04
atualizado_em: 2026-09-30
fases:
  - id: F-04.1
    titulo: "Montagem e transcricao"
    status: nao_iniciado
    criterio_saida: "Marcadores, modelo efetivo e transcreverMidia testados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01", "T-04.02", "T-04.03"]
  - id: F-04.2
    titulo: "Fila"
    status: nao_iniciado
    criterio_saida: "Raias, andamento e fim a fim com ffmpeg real e OpenRouter simulado."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.04", "T-04.05"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Montagem e transcricao"]
    T_04_01["T-04.01<br/>Marcadores de tempo e montag"]
    T_04_02["T-04.02<br/>Modelo de transcricao efetiv"]
    T_04_03["T-04.03<br/>Transcricao de midia por par"]
  end
  subgraph fase_04_2["F-04.2 — Fila"]
    T_04_04["T-04.04<br/>Fila: duas raias e andamento"]
    T_04_05["T-04.05<br/>Video fim a fim na fila"]
  end
  T_04_01 --> T_04_03
  T_04_02 --> T_04_03
  T_04_03 --> T_04_04
  T_04_04 --> T_04_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 concluida
  class T_04_02 concluida
  class T_04_03 concluida
  class T_04_04 concluida
  class T_04_05 pendente
```

---

## F-04.1 — Montagem e transcricao

**Objetivo:** Marcadores, modelo efetivo e transcreverMidia testados.

**Tasks que a compõem:** T-04.01, T-04.02, T-04.03

**Critério de saída:** Marcadores, modelo efetivo e transcreverMidia testados.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Fila

**Objetivo:** Raias, andamento e fim a fim com ffmpeg real e OpenRouter simulado.

**Tasks que a compõem:** T-04.04, T-04.05

**Critério de saída:** Raias, andamento e fim a fim com ffmpeg real e OpenRouter simulado.

**Roda em paralelo com:** nenhuma

---

