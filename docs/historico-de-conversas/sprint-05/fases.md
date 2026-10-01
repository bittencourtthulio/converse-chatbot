---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-05
atualizado_em: 2026-10-01
fases:
  - id: F-05.1
    titulo: "Servico do painel"
    status: nao_iniciado
    criterio_saida: "painel.ts devolve numeros, serie, recentes e primeiros passos."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.01", "T-05.02"]
  - id: F-05.2
    titulo: "Tela do painel"
    status: nao_iniciado
    criterio_saida: "O painel renderiza grafico acessivel, cartoes e listas com os tres estados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.03", "T-05.04"]
---

# Fases — Sprint 05

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Servico do painel"]
    T_05_01["T-05.01<br/>Numeros e serie de 14 dias"]
    T_05_02["T-05.02<br/>Recentes, alerta e primeiros"]
  end
  subgraph fase_05_2["F-05.2 — Tela do painel"]
    T_05_03["T-05.03<br/>Grafico de mensagens por dia"]
    T_05_04["T-05.04<br/>Pagina do painel com cartoes"]
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
  class T_05_03 concluida
  class T_05_04 pendente
```

---

## F-05.1 — Servico do painel

**Objetivo:** Servico do painel.

**Tasks que a compõem:** T-05.01, T-05.02

**Critério de saída:** painel.ts devolve numeros, serie, recentes e primeiros passos.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Tela do painel

**Objetivo:** Tela do painel.

**Tasks que a compõem:** T-05.03, T-05.04

**Critério de saída:** O painel renderiza grafico acessivel, cartoes e listas com os tres estados.

**Roda em paralelo com:** nenhuma

