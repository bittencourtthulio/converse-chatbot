---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-06
atualizado_em: 2026-09-30
fases:
  - id: F-06.1
    titulo: "Aba Publicar"
    status: nao_iniciado
    criterio_saida: "Formulario, previa e codigo."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01", "T-06.02"]
  - id: F-06.2
    titulo: "Seed e rotas"
    status: nao_iniciado
    criterio_saida: "Agente de exemplo publicado e a aba em producao."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.03", "T-06.04"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-06 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_06_1["F-06.1 — Aba Publicar"]
    T_06_01["T-06.01<br/>Aba, subrota e acao de salva"]
    T_06_02["T-06.02<br/>Codigo para incorporar, prev"]
  end
  subgraph fase_06_2["F-06.2 — Seed e rotas"]
    T_06_03["T-06.03<br/>Seed com o chat publicado"]
    T_06_04["T-06.04<br/>Rota da aba Publicar em prod"]
  end
  T_06_01 --> T_06_02
  T_06_02 --> T_06_03
  T_06_03 --> T_06_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_06_01 concluida
  class T_06_02 concluida
  class T_06_03 pendente
  class T_06_04 pendente
  class T_06_01,T_06_02,T_06_03,T_06_04 critico
```

---

## F-06.1 — Aba Publicar

**Objetivo:** Formulario, previa e codigo.

**Tasks que a compõem:** T-06.01, T-06.02

**Critério de saída:** Formulario, previa e codigo.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Seed e rotas

**Objetivo:** Agente de exemplo publicado e a aba em producao.

**Tasks que a compõem:** T-06.03, T-06.04

**Critério de saída:** Agente de exemplo publicado e a aba em producao.

**Roda em paralelo com:** nenhuma
