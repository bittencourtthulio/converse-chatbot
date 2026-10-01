---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-06
atualizado_em: 2026-10-01
fases:
  - id: F-06.1
    titulo: "Documentacao e convencoes"
    status: nao_iniciado
    criterio_saida: "as tasks T-06.01 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01"]
  - id: F-06.2
    titulo: "Verificacao e fechamento"
    status: nao_iniciado
    criterio_saida: "as tasks T-06.02, T-06.03 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.02", "T-06.03"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-06 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_06_1["F-06.1 — Documentacao e convencoes"]
    T_06_01["T-06.01<br/>README, convencoes e lacuna…"]
  end
  subgraph fase_06_2["F-06.2 — Verificacao e fechamento"]
    T_06_02["T-06.02<br/>Verificacao no navegador"]
    T_06_03["T-06.03<br/>Fechamento no laco do buildx"]
  end
  T_06_01 --> T_06_02
  T_06_02 --> T_06_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_06_01 concluida
  class T_06_02 concluida
  class T_06_03 pendente
  class T_06_01,T_06_02,T_06_03 critico
```

---

## F-06.1 — Documentacao e convencoes

**Objetivo:** Documentacao e convencoes.

**Tasks que a compõem:** T-06.01

**Critério de saída:** as tasks T-06.01 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Verificacao e fechamento

**Objetivo:** Verificacao e fechamento.

**Tasks que a compõem:** T-06.02, T-06.03

**Critério de saída:** as tasks T-06.02, T-06.03 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma
