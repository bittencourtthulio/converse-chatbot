---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-06
atualizado_em: 2026-10-01
fases:
  - id: F-06.1
    titulo: "Menu e guardas"
    status: nao_iniciado
    criterio_saida: "tests/menu.test.ts e tests/rotas.test.ts passam com os dois itens e as duas guardas"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01"]
  - id: F-06.2
    titulo: "Tela de auditoria"
    status: nao_iniciado
    criterio_saida: "tests/auditoria-logica.test.ts e tests/auditoria-ui.test.tsx passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.02", "T-06.03"]
  - id: F-06.3
    titulo: "Tela de privacidade"
    status: nao_iniciado
    criterio_saida: "tests/privacidade-ui.test.tsx e tests/titular-ui.test.tsx passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.04", "T-06.05"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

---

## F-06.1 — Menu e guardas

**Objetivo:** Menu e guardas.

**Tasks que a compõem:** T-06.01

**Critério de saída:** tests/menu.test.ts e tests/rotas.test.ts passam com os dois itens e as duas guardas.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Tela de auditoria

**Objetivo:** Tela de auditoria.

**Tasks que a compõem:** T-06.02, T-06.03

**Critério de saída:** tests/auditoria-logica.test.ts e tests/auditoria-ui.test.tsx passam.

**Roda em paralelo com:** nenhuma

---

## F-06.3 — Tela de privacidade

**Objetivo:** Tela de privacidade.

**Tasks que a compõem:** T-06.04, T-06.05

**Critério de saída:** tests/privacidade-ui.test.tsx e tests/titular-ui.test.tsx passam.

**Roda em paralelo com:** nenhuma

