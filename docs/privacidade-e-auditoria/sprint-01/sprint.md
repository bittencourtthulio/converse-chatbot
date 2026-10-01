---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-01
atualizado_em: 2026-10-01
titulo: "Capacidade de testar: esquema, fixtures e ambiente"
status: nao_iniciado
criterio_saida: "tests/privacidade-modelo.test.ts, tests/privacidade-apoio.test.ts, tests/ambiente.test.ts, tests/migracoes.test.ts e tests/projeto.test.ts passam, tsc e lint sem erro"
fases: ["F-01.1", "F-01.2"]
riscos: ["Prisma 7 com SQLite: a migration de colunas novas precisa ter padrao para a linha existente (base/schema-e-migracoes.md)", "instante de atualizadoEm precisa ser gravado explicitamente em teste, o @updatedAt pode sobrescrever (testado na T-01.02)"]
---

# Sprint 01 — Capacidade de testar: esquema, fixtures e ambiente

## Objetivo

Entrega o que o TDD das sprints seguintes precisa: o esquema da trilha de auditoria e das colunas de privacidade, as fixtures de conversa antiga e a variavel de ambiente da retencao da auditoria, sem funcionalidade de negocio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Esquema e migration | nenhuma |
| F-01.2 | Apoio de teste e ambiente | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/privacidade-modelo.test.ts, tests/privacidade-apoio.test.ts, tests/ambiente.test.ts, tests/migracoes.test.ts e tests/projeto.test.ts passam, tsc e lint sem erro.

## Riscos conhecidos

- Prisma 7 com SQLite: a migration de colunas novas precisa ter padrao para a linha existente (base/schema-e-migracoes.md)
- instante de atualizadoEm precisa ser gravado explicitamente em teste, o @updatedAt pode sobrescrever (testado na T-01.02)
