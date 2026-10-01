---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-04
atualizado_em: 2026-10-01
titulo: "Tela Configuracoes > Sistema"
status: concluido
criterio_saida: "A tela /configuracoes/sistema existe so para admin, mostra o estado e os detalhes sem valor de segredo, e funciona a 375 px nos dois temas (provado por teste de estilos)"
fases: ["F-04.1", "F-04.2"]
riscos: ["testes que contam itens de menu e abas mudam (menu.test.ts, rotas.test.ts)", "a tela precisa de dado de backup que so existe na sprint 5: nesta sprint o campo mostra Nenhum backup"]
---

# Sprint 04 — Tela Configuracoes > Sistema

## Objetivo

Entrega a tela do estado de saude com guarda de admin no layout, item de menu so para admin, cartoes por assunto e os tres estados.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Menu, guarda e esqueleto | nenhuma |
| F-04.2 | Cartoes e estilos | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A tela /configuracoes/sistema existe so para admin, mostra o estado e os detalhes sem valor de segredo, e funciona a 375 px nos dois temas (provado por teste de estilos).

## Riscos conhecidos

- testes que contam itens de menu e abas mudam (menu.test.ts, rotas.test.ts)
- a tela precisa de dado de backup que so existe na sprint 5: nesta sprint o campo mostra Nenhum backup
