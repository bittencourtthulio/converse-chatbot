---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-03
atualizado_em: 2026-09-30
titulo: "Servico do canal"
status: pendente
criterio_saida: "conectar, desconectar, pausar, retomar, estado e verificar funcionam contra o simulado, com token cifrado, segredo em hash e HTTPS exigido."
fases: ["F-03.1", "F-03.2"]
riscos: ["a pausa nao pode re-registrar o webhook porque o segredo em claro nao e guardado (PR-65)", "a regra HTTPS tem excecao so fora de producao"]
---

# Sprint 03 — Servico do canal

## Objetivo

conectar, desconectar, pausar, retomar, estado e verificar funcionam contra o simulado, com token cifrado, segredo em hash e HTTPS exigido.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Conectar e estado | nenhuma |
| F-03.2 | Ciclo e limite | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

conectar, desconectar, pausar, retomar, estado e verificar funcionam contra o simulado, com token cifrado, segredo em hash e HTTPS exigido.

## Riscos conhecidos

- a pausa nao pode re-registrar o webhook porque o segredo em claro nao e guardado (PR-65)
- a regra HTTPS tem excecao so fora de producao
