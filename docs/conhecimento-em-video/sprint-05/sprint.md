---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-05
atualizado_em: 2026-09-30
titulo: "YouTube por legendas"
status: nao_iniciado
criterio_saida: "A suite inteira esta verde e um link de YouTube simulado vira fonte pronta pela rota e pela fila, sem nunca tocar host fora da lista."
fases: ["F-05.1", "F-05.2"]
riscos: ["o formato real das legendas do YouTube e NAO DOCUMENTADO e pode mudar (base/youtube-legendas.md; PR-75)", "SSRF: a URL e do usuario e o servidor faz a requisicao"]
---

# Sprint 05 — YouTube por legendas

## Objetivo

A suite inteira esta verde e um link de YouTube simulado vira fonte pronta pela rota e pela fila, sem nunca tocar host fora da lista.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Biblioteca do YouTube | nenhuma |
| F-05.2 | Servico, rota e fila | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite inteira esta verde e um link de YouTube simulado vira fonte pronta pela rota e pela fila, sem nunca tocar host fora da lista.

## Riscos conhecidos

- o formato real das legendas do YouTube e NAO DOCUMENTADO e pode mudar (base/youtube-legendas.md; PR-75)
- SSRF: a URL e do usuario e o servidor faz a requisicao
