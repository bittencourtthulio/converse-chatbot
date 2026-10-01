---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-03
atualizado_em: 2026-10-01
fases:
  - id: F-03.1
    titulo: "Handlers"
    status: nao_iniciado
    criterio_saida: "Os tres handlers passam contra o servidor de producao."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02"]
  - id: F-03.2
    titulo: "Menu"
    status: nao_iniciado
    criterio_saida: "Conversas aparece no menu abaixo de Agentes e herda o titulo no detalhe."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.03"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Handlers"]
    T_03_01["T-03.01<br/>DELETE de conversa e apagar "]
    T_03_02["T-03.02<br/>Exportar conversa em texto"]
  end
  subgraph fase_03_2["F-03.2 — Menu"]
    T_03_03["T-03.03<br/>Item de menu Conversas"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 pendente
```

---

## F-03.1 — Handlers

**Objetivo:** Handlers.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** Os tres handlers passam contra o servidor de producao.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Menu

**Objetivo:** Menu.

**Tasks que a compõem:** T-03.03

**Critério de saída:** Conversas aparece no menu abaixo de Agentes e herda o titulo no detalhe.

**Roda em paralelo com:** nenhuma

