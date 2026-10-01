---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-05
atualizado_em: 2026-10-01
fases:
  - id: F-05.1
    titulo: "Sessao de ponta a ponta"
    status: nao_iniciado
    criterio_saida: "as tasks T-05.01, T-05.02, T-05.03 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.01", "T-05.02", "T-05.03"]
  - id: F-05.2
    titulo: "Portoes da suite"
    status: nao_iniciado
    criterio_saida: "as tasks T-05.04 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.04"]
---

# Fases — Sprint 05

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Sessao de ponta a ponta"]
    T_05_01["T-05.01<br/>Cookie do login real e logi…"]
    T_05_02["T-05.02<br/>Logout e reuso do cookie ro…"]
    T_05_03["T-05.03<br/>Renovacao do usuario ativo …"]
  end
  subgraph fase_05_2["F-05.2 — Portoes da suite"]
    T_05_04["T-05.04<br/>Portoes: suite inteira, tsc…"]
  end
  T_05_01 --> T_05_02
  T_05_02 --> T_05_03
  T_05_03 --> T_05_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_05_01 concluida
  class T_05_02 concluida
  class T_05_03 pendente
  class T_05_04 pendente
  class T_05_01,T_05_02,T_05_03,T_05_04 critico
```

---

## F-05.1 — Sessao de ponta a ponta

**Objetivo:** Sessao de ponta a ponta.

**Tasks que a compõem:** T-05.01, T-05.02, T-05.03

**Critério de saída:** as tasks T-05.01, T-05.02, T-05.03 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Portoes da suite

**Objetivo:** Portoes da suite.

**Tasks que a compõem:** T-05.04

**Critério de saída:** as tasks T-05.04 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma
