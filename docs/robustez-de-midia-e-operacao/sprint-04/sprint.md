---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-04
atualizado_em: 2026-10-01
titulo: "Operação: trava do servidor e auditoria"
status: pendente
criterio_saida: "o servidor mantém a trava com batimento que a restauração respeita e a falha de auditoria derruba o start em produção e aparece na saúde e na tela Sistema"
fases: ["F-04.1", "F-04.2"]
riscos: ["relógios de máquinas diferentes entre servidor e restauração (tolerância de 30 s)", "degradar a saúde por auditoria não pode quebrar os testes que não rodam a instrumentação"]
---

# Sprint 04 — Operação: trava do servidor e auditoria

## Objetivo

O servidor mantém a trava com batimento que a restauração respeita e a falha de auditoria derruba o start em produção e aparece na saúde e na tela Sistema.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Trava do servidor e restauração | nenhuma |
| F-04.2 | Auditoria fechada em produção | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

O servidor mantém a trava com batimento que a restauração respeita e a falha de auditoria derruba o start em produção e aparece na saúde e na tela Sistema.

## Riscos conhecidos

- relógios de máquinas diferentes entre servidor e restauração (tolerância de 30 s)
- degradar a saúde por auditoria não pode quebrar os testes que não rodam a instrumentação
