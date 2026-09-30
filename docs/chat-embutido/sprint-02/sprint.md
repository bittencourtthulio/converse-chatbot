---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-02
titulo: "Servicos de configuracao e de chat publico"
status: nao_iniciado
criterio_saida: "Os testes dos quatro servicos novos e do tradutor SSE passam e a suite inteira esta verde."
fases: ["F-02.1", "F-02.2"]
riscos: ["o teto diario conta tentativas e tem corrida benigna (PR-57)", "fluxoDeEventos e compartilhado com o painel: regressao possivel (D-08)"]
atualizado_em: 2026-09-30
---

# Sprint 02 — Servicos de configuracao e de chat publico

## Objetivo

Servico de configuracao por agente, leitura publica, limites com teto diario e o servico do turno publico com fontes reduzidas.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Configuracao | nenhuma |
| F-02.2 | Turno publico | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Os testes dos quatro servicos novos e do tradutor SSE passam e a suite inteira esta verde.

## Riscos conhecidos

- o teto diario conta tentativas e tem corrida benigna (PR-57)
- fluxoDeEventos e compartilhado com o painel: regressao possivel (D-08)
