---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-02
atualizado_em: 2026-10-01
fases:
  - id: F-02.1
    titulo: "Listar com filtros"
    status: nao_iniciado
    criterio_saida: "listarConversas pagina, filtra e ordena com uma consulta agregada."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01", "T-02.02", "T-02.03"]
  - id: F-02.2
    titulo: "Ler, exportar e apagar"
    status: nao_iniciado
    criterio_saida: "obterConversa, exportarConversaTexto, apagarConversa e apagarConversas passam em teste."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.04", "T-02.05"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Listar com filtros"]
    T_02_01["T-02.01<br/>Logica pura do historico"]
    T_02_02["T-02.02<br/>listarConversas: pagina, fil"]
    T_02_03["T-02.03<br/>Filtro por texto com LIKE"]
  end
  subgraph fase_02_2["F-02.2 — Ler, exportar e apagar"]
    T_02_04["T-02.04<br/>obterConversa e exportarConv"]
    T_02_05["T-02.05<br/>apagarConversa, apagarConver"]
  end
  T_02_01 --> T_02_02
  T_02_02 --> T_02_03
  T_02_03 --> T_02_04
  T_02_04 --> T_02_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 concluida
  class T_02_04 pendente
  class T_02_05 pendente
```

---

## F-02.1 — Listar com filtros

**Objetivo:** Listar com filtros.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03

**Critério de saída:** listarConversas pagina, filtra e ordena com uma consulta agregada.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Ler, exportar e apagar

**Objetivo:** Ler, exportar e apagar.

**Tasks que a compõem:** T-02.04, T-02.05

**Critério de saída:** obterConversa, exportarConversaTexto, apagarConversa e apagarConversas passam em teste.

**Roda em paralelo com:** nenhuma

