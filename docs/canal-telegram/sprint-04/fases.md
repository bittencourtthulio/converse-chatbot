---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-04
atualizado_em: 2026-09-30
fases:
  - id: F-04.1
    titulo: "Autenticar, validar e deduplicar"
    status: pendente
    criterio_saida: "Segredo, formato e dedupe com purga prontos."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01"]
  - id: F-04.2
    titulo: "Atender"
    status: pendente
    criterio_saida: "Comandos, resposta e limites."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.02", "T-04.03", "T-04.04"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Autenticar, validar e deduplicar"]
    T_04_01["T-04.01<br/>Autenticar o segredo, valida"]
  end
  subgraph fase_04_2["F-04.2 — Atender"]
    T_04_02["T-04.02<br/>Comandos, mensagens nao text"]
    T_04_03["T-04.03<br/>Resposta do agente no Telegr"]
    T_04_04["T-04.04<br/>Limites por chat, por conver"]
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

## F-04.1 — Autenticar, validar e deduplicar

**Objetivo:** Segredo, formato e dedupe com purga prontos.

**Tasks que a compõem:** T-04.01

**Critério de saída:** Segredo, formato e dedupe com purga prontos.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Atender

**Objetivo:** Comandos, resposta e limites.

**Tasks que a compõem:** T-04.02, T-04.03, T-04.04

**Critério de saída:** Comandos, resposta e limites.

**Roda em paralelo com:** nenhuma

---
