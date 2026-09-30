---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-01
atualizado_em: 2026-09-30
fases:
  - id: F-01.1
    titulo: "Ambiente e dependencias"
    status: nao_iniciado
    criterio_saida: "Ambiente e dependencias verificados por teste."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.01", "T-01.02"]
  - id: F-01.2
    titulo: "Fixtures reais"
    status: nao_iniciado
    criterio_saida: "As dez fixtures existem e batem com o gerador."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-01.03", "T-01.04"]
---

# Fases — Sprint 01

> O paralelismo declarado aqui é definitivo.

---

## F-01.1 — Ambiente e dependencias

**Objetivo:** Variaveis lidas em um so lugar e tres bibliotecas com versao fixa.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** Ambiente e dependencias verificados por teste.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Fixtures reais

**Objetivo:** Fixtures dos dez formatos geradas por codigo e conferidas.

**Tasks que a compõem:** T-01.03, T-01.04

**Critério de saída:** As dez fixtures existem e batem com o gerador.

**Roda em paralelo com:** nenhuma
