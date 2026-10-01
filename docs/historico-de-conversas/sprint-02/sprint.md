---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-02
atualizado_em: 2026-10-01
titulo: "Servico de historico"
status: concluido
criterio_saida: "A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-02.01, T-02.02, T-02.03, T-02.04, T-02.05)."
fases: ["F-02.1", "F-02.2"]
riscos: ["LIKE sobre mensagens varre a tabela: limite de 200 conversas casadas e texto de ate 200 caracteres (PR-79)", "dado pessoal no rotulo e no ouvinte: so o mascarado (PR-78, PR-80)"]
---

# Sprint 02 — Servico de historico

## Objetivo

O servico src/servicos/historico.ts lista com paginacao e filtros sem N+1, le uma conversa com fontes, exporta em texto e apaga uma ou varias com o ponto de extensao da auditoria.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Listar com filtros | nenhuma |
| F-02.2 | Ler, exportar e apagar | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-02.01, T-02.02, T-02.03, T-02.04, T-02.05).

## Riscos conhecidos

- LIKE sobre mensagens varre a tabela: limite de 200 conversas casadas e texto de ate 200 caracteres (PR-79)
- dado pessoal no rotulo e no ouvinte: so o mascarado (PR-78, PR-80)
