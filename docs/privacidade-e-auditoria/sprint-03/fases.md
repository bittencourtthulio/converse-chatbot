---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-03
atualizado_em: 2026-10-01
fases:
  - id: F-03.1
    titulo: "Exclusao definitiva de usuario"
    status: nao_iniciado
    criterio_saida: "tests/usuarios-excluir.test.ts e tests/usuarios-excluir-ui.test.tsx passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.01", "T-03.02"]
  - id: F-03.2
    titulo: "Retencao e aviso padrao"
    status: nao_iniciado
    criterio_saida: "tests/privacidade.test.ts e tests/privacidade-aviso-canais.test.ts passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-03.03", "T-03.04"]
---

# Fases — Sprint 03

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

---

## F-03.1 — Exclusao definitiva de usuario

**Objetivo:** Exclusao definitiva de usuario.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** tests/usuarios-excluir.test.ts e tests/usuarios-excluir-ui.test.tsx passam.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Retencao e aviso padrao

**Objetivo:** Retencao e aviso padrao.

**Tasks que a compõem:** T-03.03, T-03.04

**Critério de saída:** tests/privacidade.test.ts e tests/privacidade-aviso-canais.test.ts passam.

**Roda em paralelo com:** nenhuma

