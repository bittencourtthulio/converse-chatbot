---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-02
titulo: "Dados, armazenamento e trechos"
status: concluido
criterio_saida: "tests/fontes-modelo.test.ts, tests/armazenamento.test.ts, tests/agentes.test.ts e tests/trechos.test.ts passam e a suite esta verde."
fases: ["F-02.1", "F-02.2"]
riscos: ["cascata de foreign key depende do adaptador ligar as chaves: provada na FT-03 (tests/conversas-modelo.test.ts)", "arquivo e linha podem divergir se o processo morrer entre as duas gravacoes (base/banco-armazenamento-e-ambiente.md)"]
atualizado_em: 2026-09-30
---

# Sprint 02 — Dados, armazenamento e trechos

## Objetivo

Modelo Fonte e Trecho, armazenamento em disco seguro, exclusao do agente apagando o diretorio e a divisao em trechos.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Modelo e disco | nenhuma |
| F-02.2 | Divisao em trechos | F-02.1 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/fontes-modelo.test.ts, tests/armazenamento.test.ts, tests/agentes.test.ts e tests/trechos.test.ts passam e a suite esta verde.

## Riscos conhecidos

- cascata de foreign key depende do adaptador ligar as chaves: provada na FT-03 (tests/conversas-modelo.test.ts)
- arquivo e linha podem divergir se o processo morrer entre as duas gravacoes (base/banco-armazenamento-e-ambiente.md)
