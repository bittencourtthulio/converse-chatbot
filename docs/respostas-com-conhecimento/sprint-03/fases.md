---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-03
atualizado_em: 2026-09-30
fases:
  - id: F-03.1
    titulo: "Pecas puras"
    status: pendente
    criterio_saida: "Prompt fundamentado e fontes da resposta como funcoes puras."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02"]
  - id: F-03.2
    titulo: "Integracao no turno"
    status: pendente
    criterio_saida: "Modo fundamentado, evento e gravacao das fontes, retomada."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.03", "T-03.04", "T-03.05"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo.

```mermaid
flowchart TD
  T03_01["T-03.01 Prompt fundamentado"]
  T03_02["T-03.02 Fontes da resposta como funcoes puras"]
  T03_03["T-03.03 Modo fundamentado em responderMensagem"]
  T03_04["T-03.04 Evento fontes e gravacao em Mensagem.fon"]
  T03_05["T-03.05 Retomada da conversa com fontes"]
  T03_01 --> T03_03
  T03_02 --> T03_03
  T03_03 --> T03_04
  T03_04 --> T03_05
```

---

## F-03.1 — Pecas puras

**Objetivo:** Prompt fundamentado e fontes da resposta como funcoes puras.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** Prompt fundamentado e fontes da resposta como funcoes puras.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Integracao no turno

**Objetivo:** Modo fundamentado, evento e gravacao das fontes, retomada.

**Tasks que a compõem:** T-03.03, T-03.04, T-03.05

**Critério de saída:** Modo fundamentado, evento e gravacao das fontes, retomada.

**Roda em paralelo com:** nenhuma

