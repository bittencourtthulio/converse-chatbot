---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-04
titulo: "Pagina do iframe"
status: concluido
criterio_saida: "Os testes de logica, de interface e da pagina em producao passam e a suite inteira esta verde."
fases: ["F-04.1", "F-04.2"]
riscos: ["localStorage pode lancar em iframe de terceiro: todo acesso com try/catch (PR-61)", "a interacao do componente nao e testavel sem DOM no ambiente node: a logica vai em modulo puro (CONVENCOES secao 5)"]
atualizado_em: 2026-09-30
---

# Sprint 04 — Pagina do iframe

## Objetivo

Interface de chat compacta em /embed/[id], com visitante, retomada, previa e mensagens ao pai.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Logica e interface | nenhuma |
| F-04.2 | Mensagens e pagina | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Os testes de logica, de interface e da pagina em producao passam e a suite inteira esta verde.

## Riscos conhecidos

- localStorage pode lancar em iframe de terceiro: todo acesso com try/catch (PR-61)
- a interacao do componente nao e testavel sem DOM no ambiente node: a logica vai em modulo puro (CONVENCOES secao 5)
