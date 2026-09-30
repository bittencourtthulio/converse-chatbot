---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-04
atualizado_em: 2026-09-30
fases:
  - id: F-04.1
    titulo: "SSE compativel"
    status: concluido
    criterio_saida: "Tradutor e leitor aceitam fontes."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.01", "T-04.02"]
  - id: F-04.2
    titulo: "Rota de busca"
    status: concluido
    criterio_saida: "Handler fino de busca com sessao e validacao."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-04.03"]
---

# Fases — Sprint 04

> O paralelismo declarado aqui é definitivo.

```mermaid
flowchart TD
  T04_01["T-04.01 Tradutor e leitor do evento fontes"]
  T04_02["T-04.02 Rota de conversa emite fontes de ponta a"]
  T04_03["T-04.03 POST /api/agentes/[id]/buscar"]
  T04_01 --> T04_02
```

---

## F-04.1 — SSE compativel

**Objetivo:** Tradutor e leitor aceitam fontes.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** Tradutor e leitor aceitam fontes.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Rota de busca

**Objetivo:** Handler fino de busca com sessao e validacao.

**Tasks que a compõem:** T-04.03

**Critério de saída:** Handler fino de busca com sessao e validacao.

**Roda em paralelo com:** nenhuma

