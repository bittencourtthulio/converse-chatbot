---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-06
titulo: "Interface da aba Conhecimento"
status: concluido
criterio_saida: "tests/abas-do-agente.test.tsx, tests/conhecimento*.test.ts(x), tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx e tests/tokens.test.ts passam e a suite esta verde."
fases: ["F-06.1", "F-06.2", "F-06.3", "F-06.4"]
riscos: ["sem jsdom o comportamento interativo so e provado nos modulos puros e na verificacao visual (docs/stack/LACUNAS.md)", "polling empilhado se nao parar (PR-49)"]
atualizado_em: 2026-09-30
---

# Sprint 06 — Interface da aba Conhecimento

## Objetivo

Aba com resumo, adicionar arquivos e texto, lista com status e acoes, e pagina de trechos, acessivel e nos dois temas.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-06.1 | Aba | nenhuma |
| F-06.2 | Logica pura | F-06.1 |
| F-06.3 | Telas | nenhuma |
| F-06.4 | Adicionar e estilo | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/abas-do-agente.test.tsx, tests/conhecimento*.test.ts(x), tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx e tests/tokens.test.ts passam e a suite esta verde.

## Riscos conhecidos

- sem jsdom o comportamento interativo so e provado nos modulos puros e na verificacao visual (docs/stack/LACUNAS.md)
- polling empilhado se nao parar (PR-49)
