---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-01
atualizado_em: 2026-10-01
titulo: "Capacidade de testar: dependencias, instalacao de teste e nucleo do log"
status: em_andamento
criterio_saida: "tests/dependencias-operacao.test.ts, tests/instalacao-apoio.test.ts, tests/log.test.ts e tests/ambiente.test.ts passam, npm audit sem vulnerabilidade high, tsc e lint sem erro"
fases: ["F-01.1", "F-01.2"]
riscos: ["o pacote tar pode trazer vulnerabilidade high (alternativa registrada na D-15)", "mover prisma e tsx para dependencies muda o lockfile inteiro (conferir npm audit e o build)"]
---

# Sprint 01 — Capacidade de testar: dependencias, instalacao de teste e nucleo do log

## Objetivo

Entrega o que o TDD das sprints seguintes precisa: o pacote tar e o better-sqlite3 como dependencias diretas com a prova de que a API de backup preserva o rowid, uma instalacao de teste com dados de todas as camadas e o modulo de log com redacao e correlacao, sem funcionalidade de negocio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Dependencias e instalacao de teste | nenhuma |
| F-01.2 | Nucleo do log | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/dependencias-operacao.test.ts, tests/instalacao-apoio.test.ts, tests/log.test.ts e tests/ambiente.test.ts passam, npm audit sem vulnerabilidade high, tsc e lint sem erro.

## Riscos conhecidos

- o pacote tar pode trazer vulnerabilidade high (alternativa registrada na D-15)
- mover prisma e tsx para dependencies muda o lockfile inteiro (conferir npm audit e o build)
