---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-04
atualizado_em: 2026-10-01
fases:
  - id: F-04.1
    titulo: "Lista"
    status: nao_iniciado
    criterio_saida: "A lista renderiza filtros, badges, paginacao e estados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01", "T-04.02"]
  - id: F-04.2
    titulo: "Lote e detalhe"
    status: nao_iniciado
    criterio_saida: "O lote apaga com confirmacao na tela e o detalhe mostra a transcricao segura com fontes."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.03", "T-04.04"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Lista"]
    T_04_01["T-04.01<br/>Logica da tela de conversas"]
    T_04_02["T-04.02<br/>Pagina da lista de conversas"]
  end
  subgraph fase_04_2["F-04.2 — Lote e detalhe"]
    T_04_03["T-04.03<br/>Selecao e apagar em lote com"]
    T_04_04["T-04.04<br/>Detalhe da conversa"]
  end
  T_04_01 --> T_04_02
  T_04_02 --> T_04_03
  T_04_03 --> T_04_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 concluida
  class T_04_02 pendente
  class T_04_03 pendente
  class T_04_04 pendente
```

---

## F-04.1 — Lista

**Objetivo:** Lista.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** A lista renderiza filtros, badges, paginacao e estados.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Lote e detalhe

**Objetivo:** Lote e detalhe.

**Tasks que a compõem:** T-04.03, T-04.04

**Critério de saída:** O lote apaga com confirmacao na tela e o detalhe mostra a transcricao segura com fontes.

**Roda em paralelo com:** nenhuma

