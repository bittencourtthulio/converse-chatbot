---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-01
atualizado_em: 2026-09-30
fases:
  - id: F-01.1
    titulo: "Modelo e modulos puros"
    status: concluido
    criterio_saida: "Tabela, dominios e cor prontos e testados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01", "T-01.02", "T-01.03"]
  - id: F-01.2
    titulo: "Ambiente e harness de DOM"
    status: concluido
    criterio_saida: "APP_URL publica e ambiente de teste com DOM."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.04", "T-01.05"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Modelo e modulos puros"]
    T_01_01["T-01.01<br/>Migration e modelo da config"]
    T_01_02["T-01.02<br/>Modulo de dominios permitido"]
    T_01_03["T-01.03<br/>Modulo de cor e tokens sobre"]
  end
  subgraph fase_01_2["F-01.2 — Ambiente e harness de DOM"]
    T_01_04["T-01.04<br/>Leitura de APP_URL publica"]
    T_01_05["T-01.05<br/>happy-dom e apoio de teste d"]
  end
  T_01_01 --> T_01_02
  T_01_02 --> T_01_03
  T_01_03 --> T_01_04
  T_01_04 --> T_01_05

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
  class T_01_01,T_01_02,T_01_03,T_01_04,T_01_05 critico
```

---

## F-01.1 — Modelo e modulos puros

**Objetivo:** Tabela, dominios e cor prontos e testados.

**Tasks que a compõem:** T-01.01, T-01.02, T-01.03

**Critério de saída:** Tabela, dominios e cor prontos e testados.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Ambiente e harness de DOM

**Objetivo:** APP_URL publica e ambiente de teste com DOM.

**Tasks que a compõem:** T-01.04, T-01.05

**Critério de saída:** APP_URL publica e ambiente de teste com DOM.

**Roda em paralelo com:** nenhuma
