---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-01
atualizado_em: 2026-10-01
fases:
  - id: F-01.1
    titulo: "Relogio e cookies falsos"
    status: nao_iniciado
    criterio_saida: "as tasks T-01.01, T-01.02 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01", "T-01.02"]
  - id: F-01.2
    titulo: "Login por formulario em producao"
    status: nao_iniciado
    criterio_saida: "as tasks T-01.03 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.03"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — Relogio e cookies falsos"]
    T_01_01["T-01.01<br/>Relogio do limitador alcanc…"]
    T_01_02["T-01.02<br/>Cookies e cabecalhos falsos…"]
  end
  subgraph fase_01_2["F-01.2 — Login por formulario em producao"]
    T_01_03["T-01.03<br/>Login por formulario contra…"]
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
  class T_01_03 concluida
  class T_01_01,T_01_02,T_01_03 critico
```

---

## F-01.1 — Relogio e cookies falsos

**Objetivo:** Relogio e cookies falsos.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** as tasks T-01.01, T-01.02 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Login por formulario em producao

**Objetivo:** Login por formulario em producao.

**Tasks que a compõem:** T-01.03

**Critério de saída:** as tasks T-01.03 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma
