---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-03
atualizado_em: 2026-09-30
fases:
  - id: F-03.1
    titulo: "Regras de arquivo"
    status: concluido
    criterio_saida: "Arquivo mentiroso ou perigoso e recusado."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02", "T-03.03"]
  - id: F-03.2
    titulo: "Adaptadores"
    status: concluido
    criterio_saida: "Cada adaptador extrai a fixture do seu formato."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.04", "T-03.05", "T-03.06", "T-03.07", "T-03.08"]
  - id: F-03.3
    titulo: "Fachada"
    status: concluido
    criterio_saida: "As nove fixtures passam pela fachada."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.09"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo.

---

## F-03.1 — Regras de arquivo

**Objetivo:** Formatos, limites, conteudo real e ZIP.

**Tasks que a compõem:** T-03.01, T-03.02, T-03.03

**Critério de saída:** Arquivo mentiroso ou perigoso e recusado.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Adaptadores

**Objetivo:** Um adaptador por formato.

**Tasks que a compõem:** T-03.04, T-03.05, T-03.06, T-03.07, T-03.08

**Critério de saída:** Cada adaptador extrai a fixture do seu formato.

**Roda em paralelo com:** nenhuma

---

## F-03.3 — Fachada

**Objetivo:** extrairTexto unico com limites e erro amigavel.

**Tasks que a compõem:** T-03.09

**Critério de saída:** As nove fixtures passam pela fachada.

**Roda em paralelo com:** nenhuma
