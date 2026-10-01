---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-03
atualizado_em: 2026-10-01
fases:
  - id: F-03.1
    titulo: "Teto do corpo em stream"
    status: pendente
    criterio_saida: "as tasks T-03.01, T-03.02 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02"]
  - id: F-03.2
    titulo: "Extração isolada e limite de páginas"
    status: pendente
    criterio_saida: "as tasks T-03.03, T-03.04, T-03.05 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.03", "T-03.04", "T-03.05"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Teto do corpo em stream"]
    T_03_01["T-03.01<br/>Leitor de corpo com teto …"]
    T_03_02["T-03.02<br/>Rota de documentos com co…"]
  end
  subgraph fase_03_2["F-03.2 — Extração isolada e limite de páginas"]
    T_03_03["T-03.03<br/>Extração isolada em proce…"]
    T_03_04["T-03.04<br/>Fila usa a extração isola…"]
    T_03_05["T-03.05<br/>Extração isolada sob o bu…"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03
  T_03_03 --> T_03_04
  T_03_04 --> T_03_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_03,T_03_04,T_03_05 pendente
  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_01,T_03_02,T_03_03,T_03_04,T_03_05 critico
```

---

## F-03.1 — Teto do corpo em stream

**Objetivo:** Teto do corpo em stream.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** as tasks T-03.01, T-03.02 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Extração isolada e limite de páginas

**Objetivo:** Extração isolada e limite de páginas.

**Tasks que a compõem:** T-03.03, T-03.04, T-03.05

**Critério de saída:** as tasks T-03.03, T-03.04, T-03.05 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

