---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-01
atualizado_em: 2026-09-30
fases:
  - id: F-01.1
    titulo: "Dados e ambiente"
    status: concluido
    criterio_saida: "Migration e variaveis de ambiente prontas e testadas."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01", "T-01.02"]
  - id: F-01.2
    titulo: "Simulados e apoio de teste"
    status: concluido
    criterio_saida: "Simulados de OpenRouter com audio e de YouTube, e apoio de ffmpeg, testados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.03", "T-01.04", "T-01.05"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Dados e ambiente"]
    T_01_01["T-01.01<br/>Migration e campos de video"]
    T_01_02["T-01.02<br/>Variaveis de ambiente do vid"]
  end
  subgraph fase_01_2["F-01.2 — Simulados e apoio de teste"]
    T_01_03["T-01.03<br/>Simulado do OpenRouter com a"]
    T_01_04["T-01.04<br/>Apoio de ffmpeg e CI"]
    T_01_05["T-01.05<br/>Simulado do YouTube"]
  end
  T_01_01 --> T_01_02
  T_01_02 --> T_01_03
  T_01_02 --> T_01_04
  T_01_02 --> T_01_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 concluida
  class T_01_04 concluida
  class T_01_05 concluida
```

---

## F-01.1 — Dados e ambiente

**Objetivo:** Migration e variaveis de ambiente prontas e testadas.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** Migration e variaveis de ambiente prontas e testadas.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Simulados e apoio de teste

**Objetivo:** Simulados de OpenRouter com audio e de YouTube, e apoio de ffmpeg, testados.

**Tasks que a compõem:** T-01.03, T-01.04, T-01.05

**Critério de saída:** Simulados de OpenRouter com audio e de YouTube, e apoio de ffmpeg, testados.

**Roda em paralelo com:** nenhuma

---

