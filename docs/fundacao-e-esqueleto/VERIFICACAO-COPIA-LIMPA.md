# Verificação em cópia limpa — fundacao-e-esqueleto

Data: 2026-09-30. Estado verificado: commit `3c50648` da branch `feat/fundacao-e-esqueleto`, clonado com `git clone` para um diretório temporário fora do repositório (sem `node_modules`, sem `.next`, sem client do Prisma gerado, sem banco). Segredos passados por variável de ambiente inline; Node 22.

| Comando | Resultado |
|---|---|
| `npm ci` | codigo 0, 0 vulnerabilidades reportadas |
| `npx prisma generate` | codigo 0 |
| `npx prisma migrate deploy` | codigo 0, migration aplicada |
| `npm run lint` | codigo 0 |
| `npx tsc --noEmit` | codigo 0 |
| `npm run build` | codigo 0 |
| `npm test` | codigo 0, 15 arquivos, 184 testes passaram |
| `npm audit --audit-level=high` | codigo 0, 0 vulnerabilidades |
| `npm run setup` | codigo 0, seed aplicada com as duas contas de demonstração |

A contagem de testes do clone (184) é igual à da árvore de trabalho no mesmo commit: 61 herdados do template mais 123 novos da feature.
