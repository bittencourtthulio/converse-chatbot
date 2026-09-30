---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-02
atualizado_em: 2026-09-30
fases:
  - id: F-02.1
    titulo: "Termos e expressao MATCH"
    status: concluido
    criterio_saida: "Funcoes puras de termos e expressao seguras."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01"]
  - id: F-02.2
    titulo: "Busca, desempenho e seed"
    status: concluido
    criterio_saida: "buscarTrechos filtra, ordena, limita e e rapido; a seed e recuperavel."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.02", "T-02.03", "T-02.04"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo.

```mermaid
flowchart TD
  T02_01["T-02.01 Termos, stopwords e expressao MATCH"]
  T02_02["T-02.02 buscarTrechos com filtros e BM25"]
  T02_03["T-02.03 Desempenho e reconstrucao do indice"]
  T02_04["T-02.04 Seed coberta pelo indice"]
  T02_01 --> T02_02
  T02_02 --> T02_03
  T02_02 --> T02_04
```

---

## F-02.1 — Termos e expressao MATCH

**Objetivo:** Funcoes puras de termos e expressao seguras.

**Tasks que a compõem:** T-02.01

**Critério de saída:** Funcoes puras de termos e expressao seguras.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Busca, desempenho e seed

**Objetivo:** buscarTrechos filtra, ordena, limita e e rapido; a seed e recuperavel.

**Tasks que a compõem:** T-02.02, T-02.03, T-02.04

**Critério de saída:** buscarTrechos filtra, ordena, limita e e rapido; a seed e recuperavel.

**Roda em paralelo com:** nenhuma

