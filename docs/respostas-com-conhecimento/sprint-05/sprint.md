---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-05
titulo: "Interface: fontes na conversa e Testar busca"
status: concluido
criterio_saida: "tests/texto-seguro.test.tsx, tests/estado-da-conversa.test.ts, tests/fontes-da-resposta-ui.test.tsx, tests/chat-de-teste.test.tsx, tests/busca-logica.test.ts e tests/painel-de-conhecimento.test.tsx passam e a suite inteira esta verde."
fases: ["F-05.1", "F-05.2"]
riscos: ["sem jsdom: o comportamento interativo e provado em modulos puros e por renderToStaticMarkup", "cor literal em CSS reprova tests/tokens.test.ts"]
atualizado_em: 2026-09-30
---

# Sprint 05 — Interface: fontes na conversa e Testar busca

## Objetivo

A aba Testar mostra Fontes e referencias [n], a conversa retomada as traz, e a aba Conhecimento tem o cartao Testar busca.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Logica pura da conversa | nenhuma |
| F-05.2 | Componentes e estilos | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/texto-seguro.test.tsx, tests/estado-da-conversa.test.ts, tests/fontes-da-resposta-ui.test.tsx, tests/chat-de-teste.test.tsx, tests/busca-logica.test.ts e tests/painel-de-conhecimento.test.tsx passam e a suite inteira esta verde.

## Riscos conhecidos

- sem jsdom: o comportamento interativo e provado em modulos puros e por renderToStaticMarkup
- cor literal em CSS reprova tests/tokens.test.ts
