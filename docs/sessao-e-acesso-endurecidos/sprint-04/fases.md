---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-04
atualizado_em: 2026-10-01
fases:
  - id: F-04.1
    titulo: "Limites de uso"
    status: nao_iniciado
    criterio_saida: "as tasks T-04.01, T-04.02 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01", "T-04.02"]
  - id: F-04.2
    titulo: "Guardas"
    status: nao_iniciado
    criterio_saida: "as tasks T-04.03, T-04.04, T-04.05 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.03", "T-04.04", "T-04.05"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-04 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_04_1["F-04.1 — Limites de uso"]
    T_04_01["T-04.01<br/>Limite de login provado na …"]
    T_04_02["T-04.02<br/>Limite de uso na leitura pu…"]
  end
  subgraph fase_04_2["F-04.2 — Guardas"]
    T_04_03["T-04.03<br/>auditoria.listar confere o …"]
    T_04_04["T-04.04<br/>Pagina de detalhe da conver…"]
    T_04_05["T-04.05<br/>Teste de arquitetura das gu…"]
  end
  T_04_01 --> T_04_02
  T_04_02 --> T_04_03
  T_04_03 --> T_04_04
  T_04_04 --> T_04_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_04_01 concluida
  class T_04_02 pendente
  class T_04_03 pendente
  class T_04_04 pendente
  class T_04_05 pendente
  class T_04_01,T_04_02,T_04_03,T_04_04,T_04_05 critico
```

---

## F-04.1 — Limites de uso

**Objetivo:** Limites de uso.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** as tasks T-04.01, T-04.02 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Guardas

**Objetivo:** Guardas.

**Tasks que a compõem:** T-04.03, T-04.04, T-04.05

**Critério de saída:** as tasks T-04.03, T-04.04, T-04.05 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma
