---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-01
atualizado_em: 2026-10-01
fases:
  - id: F-01.1
    titulo: "Dependencias e instalacao de teste"
    status: concluido
    criterio_saida: "A prova das ferramentas e o apoio de instalacao passam em teste"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01", "T-01.02"]
  - id: F-01.2
    titulo: "Nucleo do log"
    status: nao_iniciado
    criterio_saida: "tests/log.test.ts passa com redacao, niveis, correlacao e erro sem pilha"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.03"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Dependencias e instalacao de teste"]
    T_01_01["T-01.01<br/>Dependencias tar e…"]
    T_01_02["T-01.02<br/>Instalacao de teste com…"]
  end
  subgraph fase_01_2["F-01.2 — Nucleo do log"]
    T_01_03["T-01.03<br/>Modulo de log com redacao,…"]
  end
  T_01_01 --> T_01_02
  T_01_02 --> T_01_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 pendente
  class T_01_03,T_01_02,T_01_01 critico
```

---

## F-01.1 — Dependencias e instalacao de teste

**Objetivo:** Dependencias e instalacao de teste.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** A prova das ferramentas e o apoio de instalacao passam em teste.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Nucleo do log

**Objetivo:** Nucleo do log.

**Tasks que a compõem:** T-01.03

**Critério de saída:** tests/log.test.ts passa com redacao, niveis, correlacao e erro sem pilha.

**Roda em paralelo com:** nenhuma

---

