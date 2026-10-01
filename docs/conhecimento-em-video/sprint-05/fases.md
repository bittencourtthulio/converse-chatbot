---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-05
atualizado_em: 2026-09-30
fases:
  - id: F-05.1
    titulo: "Biblioteca do YouTube"
    status: nao_iniciado
    criterio_saida: "Id, pagina, faixas e legenda com SSRF testados contra o simulado."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.01", "T-05.02", "T-05.03"]
  - id: F-05.2
    titulo: "Servico, rota e fila"
    status: nao_iniciado
    criterio_saida: "Servico, rota e fila do YouTube testados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.04", "T-05.05", "T-05.06"]
---

# Fases — Sprint 05

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-05 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_05_1["F-05.1 — Biblioteca do YouTube"]
    T_05_01["T-05.01<br/>YouTube: id e validacao da U"]
    T_05_02["T-05.02<br/>YouTube: pagina e faixas"]
    T_05_03["T-05.03<br/>YouTube: baixar a legenda co"]
  end
  subgraph fase_05_2["F-05.2 — Servico, rota e fila"]
    T_05_04["T-05.04<br/>Servico: adicionar YouTube"]
    T_05_05["T-05.05<br/>Rota do YouTube"]
    T_05_06["T-05.06<br/>Fila: fonte YouTube"]
  end
  T_05_01 --> T_05_02
  T_05_02 --> T_05_03
  T_05_01 --> T_05_04
  T_05_04 --> T_05_05
  T_05_03 --> T_05_06
  T_05_04 --> T_05_06

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_05_01 pendente
  class T_05_02 pendente
  class T_05_03 pendente
  class T_05_04 pendente
  class T_05_05 pendente
  class T_05_06 pendente
```

---

## F-05.1 — Biblioteca do YouTube

**Objetivo:** Id, pagina, faixas e legenda com SSRF testados contra o simulado.

**Tasks que a compõem:** T-05.01, T-05.02, T-05.03

**Critério de saída:** Id, pagina, faixas e legenda com SSRF testados contra o simulado.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Servico, rota e fila

**Objetivo:** Servico, rota e fila do YouTube testados.

**Tasks que a compõem:** T-05.04, T-05.05, T-05.06

**Critério de saída:** Servico, rota e fila do YouTube testados.

**Roda em paralelo com:** nenhuma

---

