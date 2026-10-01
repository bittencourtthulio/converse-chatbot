---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-03
atualizado_em: 2026-09-30
fases:
  - id: F-03.1
    titulo: "Armazenamento"
    status: nao_iniciado
    criterio_saida: "Gravacao em stream e pastas de trabalho testadas."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02"]
  - id: F-03.2
    titulo: "Servico e rota"
    status: nao_iniciado
    criterio_saida: "Servico adicionarVideo e handler testados, inclusive contra next start."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.03", "T-03.04"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Armazenamento"]
    T_03_01["T-03.01<br/>Armazenamento: gravar em str"]
    T_03_02["T-03.02<br/>Armazenamento: pastas e segm"]
  end
  subgraph fase_03_2["F-03.2 — Servico e rota"]
    T_03_03["T-03.03<br/>Servico: adicionar video"]
    T_03_04["T-03.04<br/>Rota de upload de video"]
  end
  T_03_01 --> T_03_02
  T_03_01 --> T_03_03
  T_03_03 --> T_03_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 pendente
  class T_03_02 pendente
  class T_03_03 pendente
  class T_03_04 pendente
```

---

## F-03.1 — Armazenamento

**Objetivo:** Gravacao em stream e pastas de trabalho testadas.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** Gravacao em stream e pastas de trabalho testadas.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Servico e rota

**Objetivo:** Servico adicionarVideo e handler testados, inclusive contra next start.

**Tasks que a compõem:** T-03.03, T-03.04

**Critério de saída:** Servico adicionarVideo e handler testados, inclusive contra next start.

**Roda em paralelo com:** nenhuma

---

