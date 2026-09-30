---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-01
titulo: "Capacidade de testar"
status: nao_iniciado
criterio_saida: "tests/fixtures-fontes.test.ts, tests/ambiente.test.ts e tests/dependencias-extracao.test.ts passam, a suite inteira esta verde e npm audit --audit-level=high devolve 0."
fases: ["F-01.1", "F-01.2"]
riscos: ["unpdf pode nao passar no vitest sem ajuste de ambiente (base/extracao-bibliotecas.md, lacuna 3)", "um PDF ou DOCX escrito a mao pode nao ser aceito pelas bibliotecas: a task T-01.04 prova com elas"]
atualizado_em: 2026-09-30
---

# Sprint 01 — Capacidade de testar

## Objetivo

Variaveis de ambiente, dependencias de extracao com versao fixa e fixtures reais em tests/fixtures/ para que as sprints seguintes tenham TDD executavel.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Ambiente e dependencias | nenhuma |
| F-01.2 | Fixtures reais | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/fixtures-fontes.test.ts, tests/ambiente.test.ts e tests/dependencias-extracao.test.ts passam, a suite inteira esta verde e npm audit --audit-level=high devolve 0.

## Riscos conhecidos

- unpdf pode nao passar no vitest sem ajuste de ambiente (base/extracao-bibliotecas.md, lacuna 3)
- um PDF ou DOCX escrito a mao pode nao ser aceito pelas bibliotecas: a task T-01.04 prova com elas
