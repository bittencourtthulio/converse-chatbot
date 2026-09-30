---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-04
atualizado_em: 2026-09-30
fases:
  - id: F-04.1
    titulo: "Logica e interface"
    status: nao_iniciado
    criterio_saida: "Modulos puros e componente de chat."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01", "T-04.02"]
  - id: F-04.2
    titulo: "Mensagens e pagina"
    status: nao_iniciado
    criterio_saida: "postMessage com o pai e a rota /embed/[id]."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.03", "T-04.04"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Logica e interface"]
    T_04_01["T-04.01<br/>Logica pura do embed"]
    T_04_02["T-04.02<br/>Componente ChatEmbutido"]
  end
  subgraph fase_04_2["F-04.2 — Mensagens e pagina"]
    T_04_03["T-04.03<br/>Mensagens do iframe e previa"]
    T_04_04["T-04.04<br/>Pagina /embed/[id]"]
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
  class T_04_01,T_04_02,T_04_03,T_04_04 critico
```

---

## F-04.1 — Logica e interface

**Objetivo:** Modulos puros e componente de chat.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** Modulos puros e componente de chat.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Mensagens e pagina

**Objetivo:** postMessage com o pai e a rota /embed/[id].

**Tasks que a compõem:** T-04.03, T-04.04

**Critério de saída:** postMessage com o pai e a rota /embed/[id].

**Roda em paralelo com:** nenhuma
