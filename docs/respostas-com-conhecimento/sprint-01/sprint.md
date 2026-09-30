---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-01
titulo: "Indice FTS5 por migration"
status: pendente
criterio_saida: "tests/indice-fts5.test.ts, tests/indice-fts5-cascata.test.ts e tests/apoio-conhecimento.test.ts passam, migrate deploy aplica do zero e a suite inteira esta verde."
fases: ["F-01.1", "F-01.2"]
riscos: ["gatilhos podem nao disparar na cascata de chave estrangeira (base/00-LACUNAS.md, lacuna 1): o teste decide e, se falhar, fontes.excluir e agentes.excluir apagam os trechos antes", "prisma migrate dev pode estranhar a tabela virtual (lacuna 2): a migration e escrita a mao e aplicada por migrate deploy"]
atualizado_em: 2026-09-30
---

# Sprint 01 — Indice FTS5 por migration

## Objetivo

A tabela virtual trechos_fts, os gatilhos e o preenchimento inicial existem por migration, provados do zero e na cascata, e ha apoio de teste para montar uma base pronta.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Migration e gatilhos | nenhuma |
| F-01.2 | Cascata, reprocessamento e apoio | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/indice-fts5.test.ts, tests/indice-fts5-cascata.test.ts e tests/apoio-conhecimento.test.ts passam, migrate deploy aplica do zero e a suite inteira esta verde.

## Riscos conhecidos

- gatilhos podem nao disparar na cascata de chave estrangeira (base/00-LACUNAS.md, lacuna 1): o teste decide e, se falhar, fontes.excluir e agentes.excluir apagam os trechos antes
- prisma migrate dev pode estranhar a tabela virtual (lacuna 2): a migration e escrita a mao e aplicada por migrate deploy
