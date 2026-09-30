---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-05
atualizado_em: 2026-09-30
fases:
  - id: F-05.1
    titulo: "Logica pura da conversa"
    status: pendente
    criterio_saida: "Referencias [n] e estado com fontes."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.01", "T-05.02"]
  - id: F-05.2
    titulo: "Componentes e estilos"
    status: pendente
    criterio_saida: "Fontes da resposta, chat integrado e Testar busca."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-05.03", "T-05.04"]
---

# Fases — Sprint 05

> O paralelismo declarado aqui é definitivo.

```mermaid
flowchart TD
  T05_01["T-05.01 Referencias [n] no texto do modelo"]
  T05_02["T-05.02 Estado da conversa com fontes"]
  T05_03["T-05.03 Fontes da resposta na aba Testar"]
  T05_04["T-05.04 Cartao Testar busca na aba Conhecimento"]
  T05_01 --> T05_02
  T05_02 --> T05_03
  T05_03 --> T05_04
```

---

## F-05.1 — Logica pura da conversa

**Objetivo:** Referencias [n] e estado com fontes.

**Tasks que a compõem:** T-05.01, T-05.02

**Critério de saída:** Referencias [n] e estado com fontes.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Componentes e estilos

**Objetivo:** Fontes da resposta, chat integrado e Testar busca.

**Tasks que a compõem:** T-05.03, T-05.04

**Critério de saída:** Fontes da resposta, chat integrado e Testar busca.

**Roda em paralelo com:** nenhuma

