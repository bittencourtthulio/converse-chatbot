---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-06
atualizado_em: 2026-10-01
titulo: "Telas de Privacidade e Auditoria"
status: concluido
criterio_saida: "a suite inteira passa com 0 failed, as duas rotas redirecionam quem nao e admin com 307 e os itens aparecem so para admin"
fases: ["F-06.1", "F-06.2", "F-06.3"]
riscos: ["a guarda de admin precisa ficar em layout.tsx acima do loading.tsx para o 307 ser real (docs/stack/CONVENCOES.md, Interface)", "tests/menu.test.ts e tests/rotas.test.ts fixam a lista de itens e rotas e precisam ser atualizados e declarados"]
---

# Sprint 06 — Telas de Privacidade e Auditoria

## Objetivo

Entrega as telas Auditoria e Privacidade do admin: tabela somente leitura com filtros e paginacao, retencao, aviso padrao, painel de dados pessoais e ferramentas do titular.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-06.1 | Menu e guardas | nenhuma |
| F-06.2 | Tela de auditoria | nenhuma |
| F-06.3 | Tela de privacidade | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

a suite inteira passa com 0 failed, as duas rotas redirecionam quem nao e admin com 307 e os itens aparecem so para admin.

## Riscos conhecidos

- a guarda de admin precisa ficar em layout.tsx acima do loading.tsx para o 307 ser real (docs/stack/CONVENCOES.md, Interface)
- tests/menu.test.ts e tests/rotas.test.ts fixam a lista de itens e rotas e precisam ser atualizados e declarados
