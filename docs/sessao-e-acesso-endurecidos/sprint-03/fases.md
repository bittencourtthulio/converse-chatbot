---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-03
atualizado_em: 2026-10-01
fases:
  - id: F-03.1
    titulo: "Acoes de servidor"
    status: nao_iniciado
    criterio_saida: "as tasks T-03.01, T-03.02 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02"]
  - id: F-03.2
    titulo: "Renovacao no proxy"
    status: nao_iniciado
    criterio_saida: "as tasks T-03.03 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.03"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Acoes de servidor"]
    T_03_01["T-03.01<br/>Acao sair revoga a sessao"]
    T_03_02["T-03.02<br/>salvarSenha grava o cookie …"]
  end
  subgraph fase_03_2["F-03.2 — Renovacao no proxy"]
    T_03_03["T-03.03<br/>Renovacao do cookie no proxy"]
  end
  T_03_01 --> T_03_02
  T_03_01 --> T_03_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 pendente
  class T_03_02 pendente
  class T_03_03 pendente
  class T_03_01,T_03_02,T_03_03 critico
```

---

## F-03.1 — Acoes de servidor

**Objetivo:** Acoes de servidor.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** as tasks T-03.01, T-03.02 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Renovacao no proxy

**Objetivo:** Renovacao no proxy.

**Tasks que a compõem:** T-03.03

**Critério de saída:** as tasks T-03.03 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma
