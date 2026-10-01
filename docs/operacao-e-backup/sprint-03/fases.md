---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-03
atualizado_em: 2026-10-01
fases:
  - id: F-03.1
    titulo: "Ambiente validado no start"
    status: em_andamento
    criterio_saida: "validarAmbiente lista os nomes ausentes e o servidor de producao nao sobe sem eles"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02"]
  - id: F-03.2
    titulo: "Saude e dados do sistema"
    status: nao_iniciado
    criterio_saida: "tests/saude.test.ts, tests/saude-rota.test.ts e tests/sistema.test.ts passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.03", "T-03.04"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-03 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_03_1["F-03.1 — Ambiente validado no start"]
    T_03_01["T-03.01<br/>validarAmbiente e variaveis…"]
    T_03_02["T-03.02<br/>Start de producao derrubado…"]
  end
  subgraph fase_03_2["F-03.2 — Saude e dados do sistema"]
    T_03_03["T-03.03<br/>Servico de saude e GET…"]
    T_03_04["T-03.04<br/>Dados do sistema para a…"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03
  T_03_03 --> T_03_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_03_01 concluida
  class T_03_02 pendente
  class T_03_03 pendente
  class T_03_04 pendente
  class T_03_04,T_03_03,T_03_02,T_03_01 critico
```

---

## F-03.1 — Ambiente validado no start

**Objetivo:** Ambiente validado no start.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** validarAmbiente lista os nomes ausentes e o servidor de producao nao sobe sem eles.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Saude e dados do sistema

**Objetivo:** Saude e dados do sistema.

**Tasks que a compõem:** T-03.03, T-03.04

**Critério de saída:** tests/saude.test.ts, tests/saude-rota.test.ts e tests/sistema.test.ts passam.

**Roda em paralelo com:** nenhuma

---

