---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-01
atualizado_em: 2026-10-01
titulo: "Capacidade de testar: relogio, cookies e login contra o servidor"
status: nao_iniciado
criterio_saida: "o relogio falso alcanca o limitador padrao, os cookies e cabecalhos do Next sao simulaveis por apoio de teste e o login por formulario funciona contra o servidor de producao, tudo coberto por teste"
fases: ["F-01.1", "F-01.2"]
riscos: ["a acao de login enviada sem JavaScript depende dos campos ocultos que o React 19 gera (base/proxy-e-renovacao.md)", "o servidor de producao usa o .next existente: rodar npm run build antes (CONVENCOES, lacuna 17)"]
---

# Sprint 01 — Capacidade de testar: relogio, cookies e login contra o servidor

## Objetivo

O relogio falso alcanca o limitador padrao, os cookies e cabecalhos do Next sao simulaveis por apoio de teste e o login por formulario funciona contra o servidor de producao, tudo coberto por teste.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Relogio e cookies falsos | nenhuma |
| F-01.2 | Login por formulario em producao | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

O relogio falso alcanca o limitador padrao, os cookies e cabecalhos do Next sao simulaveis por apoio de teste e o login por formulario funciona contra o servidor de producao, tudo coberto por teste.

## Riscos conhecidos

- a acao de login enviada sem JavaScript depende dos campos ocultos que o React 19 gera (base/proxy-e-renovacao.md)
- o servidor de producao usa o .next existente: rodar npm run build antes (CONVENCOES, lacuna 17)
