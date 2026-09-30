---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-06
titulo: "Aba Publicar e seed"
status: nao_iniciado
criterio_saida: "Os testes da aba, da acao, da seed e das rotas passam e a suite inteira esta verde."
fases: ["F-06.1", "F-06.2"]
riscos: ["a previa usa o endpoint do painel e cria conversa canal painel (PR-61)", "copiar depende de navigator.clipboard: fallback obrigatorio"]
atualizado_em: 2026-09-30
---

# Sprint 06 — Aba Publicar e seed

## Objetivo

Aba Publicar com formulario, previa, codigo para incorporar e o agente de exemplo publicado.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-06.1 | Aba Publicar | nenhuma |
| F-06.2 | Seed e rotas | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Os testes da aba, da acao, da seed e das rotas passam e a suite inteira esta verde.

## Riscos conhecidos

- a previa usa o endpoint do painel e cria conversa canal painel (PR-61)
- copiar depende de navigator.clipboard: fallback obrigatorio
