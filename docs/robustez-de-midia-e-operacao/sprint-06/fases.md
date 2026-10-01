---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-06
atualizado_em: 2026-10-01
fases:
  - id: F-06.1
    titulo: "Verificação no navegador"
    status: pendente
    criterio_saida: "as tasks T-06.01 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01"]
  - id: F-06.2
    titulo: "Documentos e fechamento"
    status: pendente
    criterio_saida: "as tasks T-06.02, T-06.03 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.02", "T-06.03"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-06 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_06_1["F-06.1 — Verificação no navegador"]
    T_06_01["T-06.01<br/>Verificação no navegador"]
  end
  subgraph fase_06_2["F-06.2 — Documentos e fechamento"]
    T_06_02["T-06.02<br/>Lacunas e convenções da F…"]
    T_06_03["T-06.03<br/>Fechamento no laço do bui…"]
  end
  T_06_01 --> T_06_02
  T_06_02 --> T_06_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_06_01,T_06_02,T_06_03 pendente
  class T_06_01,T_06_02,T_06_03 critico
```

---

## F-06.1 — Verificação no navegador

**Objetivo:** Verificação no navegador.

**Tasks que a compõem:** T-06.01

**Critério de saída:** as tasks T-06.01 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Documentos e fechamento

**Objetivo:** Documentos e fechamento.

**Tasks que a compõem:** T-06.02, T-06.03

**Critério de saída:** as tasks T-06.02, T-06.03 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

