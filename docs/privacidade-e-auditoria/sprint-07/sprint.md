---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-07
atualizado_em: 2026-10-01
titulo: "Prova ponta a ponta, verificacao e fechamento"
status: nao_iniciado
criterio_saida: "a suite inteira passa com 0 failed, tsc, lint, build e audit verdes e a documentacao e o mapa fechados"
fases: ["F-07.1", "F-07.2"]
riscos: ["a verificacao no navegador depende de Chrome por CDP e de servidores simulados (docs/historico-de-conversas/VERIFICACAO-VISUAL.md)", "o laco do buildx precisa fechar MAPA, PREMISSAS, RECURSAO e PROJETO no mesmo commit"]
---

# Sprint 07 — Prova ponta a ponta, verificacao e fechamento

## Objetivo

Prova pelo servidor de producao que a auditoria registra pelo ouvinte e pela rota publica, registra a verificacao visual, documenta e fecha a feature no laco do buildx.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-07.1 | Prova ponta a ponta | nenhuma |
| F-07.2 | Verificacao, documentacao e fechamento | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

a suite inteira passa com 0 failed, tsc, lint, build e audit verdes e a documentacao e o mapa fechados.

## Riscos conhecidos

- a verificacao no navegador depende de Chrome por CDP e de servidores simulados (docs/historico-de-conversas/VERIFICACAO-VISUAL.md)
- o laco do buildx precisa fechar MAPA, PREMISSAS, RECURSAO e PROJETO no mesmo commit
