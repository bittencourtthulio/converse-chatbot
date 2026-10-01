---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-06
atualizado_em: 2026-09-30
fases:
  - id: F-06.1
    titulo: "Logica e painel do video"
    status: nao_iniciado
    criterio_saida: "Logica pura, opcao Video e painel com duas abas testados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01", "T-06.02"]
  - id: F-06.2
    titulo: "Lista, trechos e configuracao"
    status: nao_iniciado
    criterio_saida: "Linha de fonte, ver conteudo e modelo de transcricao testados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.03", "T-06.04"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-06 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_06_1["F-06.1 — Logica e painel do video"]
    T_06_01["T-06.01<br/>Logica pura e envio do video"]
    T_06_02["T-06.02<br/>Painel de video com duas aba"]
  end
  subgraph fase_06_2["F-06.2 — Lista, trechos e configuracao"]
    T_06_03["T-06.03<br/>Lista e Ver conteudo do vide"]
    T_06_04["T-06.04<br/>Modelo de transcricao nas In"]
  end
  T_06_01 --> T_06_02
  T_06_02 --> T_06_03
  T_06_03 --> T_06_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_06_01 pendente
  class T_06_02 pendente
  class T_06_03 pendente
  class T_06_04 pendente
```

---

## F-06.1 — Logica e painel do video

**Objetivo:** Logica pura, opcao Video e painel com duas abas testados.

**Tasks que a compõem:** T-06.01, T-06.02

**Critério de saída:** Logica pura, opcao Video e painel com duas abas testados.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Lista, trechos e configuracao

**Objetivo:** Linha de fonte, ver conteudo e modelo de transcricao testados.

**Tasks que a compõem:** T-06.03, T-06.04

**Critério de saída:** Linha de fonte, ver conteudo e modelo de transcricao testados.

**Roda em paralelo com:** nenhuma

---

