---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-01
atualizado_em: 2026-10-01
fases:
  - id: F-01.1
    titulo: "Rede bloqueada e teste estável"
    status: pendente
    criterio_saida: "as tasks T-01.01, T-01.02 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01", "T-01.02"]
  - id: F-01.2
    titulo: "Apoios de mídia e de upload"
    status: pendente
    criterio_saida: "as tasks T-01.03, T-01.04 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.03", "T-01.04"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Rede bloqueada e teste estável"]
    T_01_01["T-01.01<br/>Trava contra rede real no…"]
    T_01_02["T-01.02<br/>Teste do embed estável co…"]
  end
  subgraph fase_01_2["F-01.2 — Apoios de mídia e de upload"]
    T_01_03["T-01.03<br/>OpenRouter falso com silê…"]
    T_01_04["T-01.04<br/>Apoios de PDF grande e de…"]
  end
  T_01_02 --> T_01_03
  T_01_03 --> T_01_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01,T_01_02,T_01_03,T_01_04 pendente
  class T_01_01,T_01_02,T_01_03,T_01_04 critico
```

---

## F-01.1 — Rede bloqueada e teste estável

**Objetivo:** Rede bloqueada e teste estável.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** as tasks T-01.01, T-01.02 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Apoios de mídia e de upload

**Objetivo:** Apoios de mídia e de upload.

**Tasks que a compõem:** T-01.03, T-01.04

**Critério de saída:** as tasks T-01.03, T-01.04 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

