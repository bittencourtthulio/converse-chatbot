---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-05
atualizado_em: 2026-10-01
titulo: "Painel inicial preenchido"
status: concluido
criterio_saida: "A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-05.01, T-05.02, T-05.03, T-05.04)."
fases: ["F-05.1", "F-05.2"]
riscos: ["agrupar por dia no fuso do servidor: teste de borda com TZ fixado e dias sem mensagem (PR-81)", "o passo da chave do OpenRouter nunca recebe a chave, so um booleano (PR-82, PR-14)"]
---

# Sprint 05 — Painel inicial preenchido

## Objetivo

O servico painel.ts agrega os numeros e a serie de 14 dias em SQL, e a tela inicial mostra cartoes, grafico acessivel, conversas recentes, alerta de fontes com erro e primeiros passos.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Servico do painel | nenhuma |
| F-05.2 | Tela do painel | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite relativa a sprint passa, tsc e lint sem erro e todas as tasks da sprint estao concluidas (T-05.01, T-05.02, T-05.03, T-05.04).

## Riscos conhecidos

- agrupar por dia no fuso do servidor: teste de borda com TZ fixado e dias sem mensagem (PR-81)
- o passo da chave do OpenRouter nunca recebe a chave, so um booleano (PR-82, PR-14)
