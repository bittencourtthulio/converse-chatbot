---
expx_schema: 1
expx_tool: runx
kind: fases
trabalho_id: OC-2026-0001
sprint_id: sprint-01
atualizado_em: 2026-10-28
fases:
  - id: F-01.1
    titulo: Regressao e isolamento do helper
    status: concluido
    criterio_saida: Teste de regressao falha antes do fix, passa depois, e a suite inteira fica verde sem alterar prisma/dev.db
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03]
---

# Fases — Sprint 01

## F-01.1 — Regressão e isolamento do helper

- **Objetivo:** provar o defeito com um teste e corrigi-lo no helper.
- **Tasks:** T-01.01 (teste), T-01.02 (fix), T-01.03 (teste de start, D-03).
- **Critério de saída:** o teste de regressão falha antes do fix e passa depois; suíte inteira verde; `prisma/dev.db` inalterado.
- **Paralela com:** nenhuma.
