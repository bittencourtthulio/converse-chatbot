---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-04
atualizado_em: 2026-10-01
titulo: "Tela Conversas: lista, lote e detalhe"
status: nao_iniciado
criterio_saida: "A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-04.01, T-04.02, T-04.03, T-04.04)."
fases: ["F-04.1", "F-04.2"]
riscos: ["conteudo de visitante e nao confiavel: so TextoDoModelo, nunca dangerouslySetInnerHTML (CONVENCOES, texto de origem nao confiavel)", "interacao de cliente sem jsdom: logica em modulo puro e happy-dom por arquivo"]
---

# Sprint 04 — Tela Conversas: lista, lote e detalhe

## Objetivo

A tela /conversas lista com filtros, paginacao e lote, e /conversas/[id] mostra a transcricao com fontes, exporta e apaga, com estados, 375px e dois temas.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Lista | nenhuma |
| F-04.2 | Lote e detalhe | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-04.01, T-04.02, T-04.03, T-04.04).

## Riscos conhecidos

- conteudo de visitante e nao confiavel: so TextoDoModelo, nunca dangerouslySetInnerHTML (CONVENCOES, texto de origem nao confiavel)
- interacao de cliente sem jsdom: logica em modulo puro e happy-dom por arquivo
