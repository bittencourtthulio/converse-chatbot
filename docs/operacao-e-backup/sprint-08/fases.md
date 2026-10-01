---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-08
atualizado_em: 2026-10-01
fases:
  - id: F-08.1
    titulo: "Documentacao e convencoes"
    status: concluido
    criterio_saida: "tests/projeto.test.ts confere README, exemplo de ambiente, convencoes e lacunas"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-08.01", "T-08.02"]
  - id: F-08.2
    titulo: "Verificacao e fechamento"
    status: nao_iniciado
    criterio_saida: "VERIFICACAO-VISUAL.md escrito e MAPA, PREMISSAS e RECURSAO atualizados"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-08.03", "T-08.04"]
---

# Fases — Sprint 08

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-08 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_08_1["F-08.1 — Documentacao e convencoes"]
    T_08_01["T-08.01<br/>Exemplo de ambiente e…"]
    T_08_02["T-08.02<br/>Convencoes e lacunas com…"]
  end
  subgraph fase_08_2["F-08.2 — Verificacao e fechamento"]
    T_08_03["T-08.03<br/>Verificacao no navegador"]
    T_08_04["T-08.04<br/>Fechamento no laco do buildx"]
  end
  T_08_01 --> T_08_02
  T_08_02 --> T_08_03
  T_08_03 --> T_08_04

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_08_01 concluida
  class T_08_02 concluida
  class T_08_03 pendente
  class T_08_04 pendente
  class T_08_04,T_08_03,T_08_02,T_08_01 critico
```

---

## F-08.1 — Documentacao e convencoes

**Objetivo:** Documentacao e convencoes.

**Tasks que a compõem:** T-08.01, T-08.02

**Critério de saída:** tests/projeto.test.ts confere README, exemplo de ambiente, convencoes e lacunas.

**Roda em paralelo com:** nenhuma

---

## F-08.2 — Verificacao e fechamento

**Objetivo:** Verificacao e fechamento.

**Tasks que a compõem:** T-08.03, T-08.04

**Critério de saída:** VERIFICACAO-VISUAL.md escrito e MAPA, PREMISSAS e RECURSAO atualizados.

**Roda em paralelo com:** nenhuma

---

