---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-06
atualizado_em: 2026-09-30
fases:
  - id: F-06.1
    titulo: "Aba"
    status: nao_iniciado
    criterio_saida: "Aba navegavel."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01"]
  - id: F-06.2
    titulo: "Logica pura"
    status: nao_iniciado
    criterio_saida: "Logica coberta."
    paralelizavel: true
    paralela_com: ["F-06.1"]
    tasks: ["T-06.02"]
  - id: F-06.3
    titulo: "Telas"
    status: nao_iniciado
    criterio_saida: "Telas renderizam os estados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.03", "T-06.04"]
  - id: F-06.4
    titulo: "Adicionar e estilo"
    status: nao_iniciado
    criterio_saida: "Fluxo de adicionar completo e tokens verdes."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.05", "T-06.06"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo.

---

## F-06.1 — Aba

**Objetivo:** Aba e icones.

**Tasks que a compõem:** T-06.01

**Critério de saída:** Aba navegavel.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Logica pura

**Objetivo:** Modulos testaveis sem navegador.

**Tasks que a compõem:** T-06.02

**Critério de saída:** Logica coberta.

**Roda em paralelo com:** F-06.1

---

## F-06.3 — Telas

**Objetivo:** Paginas do servidor e painel.

**Tasks que a compõem:** T-06.03, T-06.04

**Critério de saída:** Telas renderizam os estados.

**Roda em paralelo com:** nenhuma

---

## F-06.4 — Adicionar e estilo

**Objetivo:** Envio de arquivos e texto, e estilos.

**Tasks que a compõem:** T-06.05, T-06.06

**Critério de saída:** Fluxo de adicionar completo e tokens verdes.

**Roda em paralelo com:** nenhuma
