---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-02
atualizado_em: 2026-09-30
fases:
  - id: F-02.1
    titulo: "Modelo e disco"
    status: nao_iniciado
    criterio_saida: "Excluir agente ou fonte apaga linha e arquivo."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01", "T-02.02", "T-02.03"]
  - id: F-02.2
    titulo: "Divisao em trechos"
    status: nao_iniciado
    criterio_saida: "Testes de propriedade passam."
    paralelizavel: true
    paralela_com: ["F-02.1"]
    tasks: ["T-02.04"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo.

---

## F-02.1 — Modelo e disco

**Objetivo:** Tabelas, armazenamento e exclusao coerentes.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03

**Critério de saída:** Excluir agente ou fonte apaga linha e arquivo.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Divisao em trechos

**Objetivo:** Funcao pura de divisao.

**Tasks que a compõem:** T-02.04

**Critério de saída:** Testes de propriedade passam.

**Roda em paralelo com:** F-02.1
