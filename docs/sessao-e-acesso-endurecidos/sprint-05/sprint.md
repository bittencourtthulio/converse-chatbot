---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-05
atualizado_em: 2026-10-01
titulo: "Prova de ponta a ponta no servidor de producao"
status: nao_iniciado
criterio_saida: "contra next start: Set-Cookie do login real, login imediato apos a troca de senha, logout com cookie roubado barrado, renovacao do usuario ativo alem do TTL e queda do inativo; build, tsc, lint, suite inteira e audit verdes"
fases: ["F-05.1", "F-05.2"]
riscos: ["o relogio do servidor de producao nao e injetavel: a prova usa JWT_TTL_SEGUNDOS curto e espera real de poucos segundos", "carga alheia na maquina pode estourar o tempo: esperar, nao culpar o codigo"]
---

# Sprint 05 — Prova de ponta a ponta no servidor de producao

## Objetivo

Contra next start: Set-Cookie do login real, login imediato apos a troca de senha, logout com cookie roubado barrado, renovacao do usuario ativo alem do TTL e queda do inativo; build, tsc, lint, suite inteira e audit verdes.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Sessao de ponta a ponta | nenhuma |
| F-05.2 | Portoes da suite | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Contra next start: Set-Cookie do login real, login imediato apos a troca de senha, logout com cookie roubado barrado, renovacao do usuario ativo alem do TTL e queda do inativo; build, tsc, lint, suite inteira e audit verdes.

## Riscos conhecidos

- o relogio do servidor de producao nao e injetavel: a prova usa JWT_TTL_SEGUNDOS curto e espera real de poucos segundos
- carga alheia na maquina pode estourar o tempo: esperar, nao culpar o codigo
