---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-02
atualizado_em: 2026-10-01
titulo: "Trilha de auditoria: servico e ligacoes"
status: concluido
criterio_saida: "a suite inteira passa com 0 failed e as acoes de PR-19 gravam registro, as de transacao com rollback e as demais com erro no log"
fases: ["F-02.1", "F-02.2"]
riscos: ["ouvintes em Set de modulo podem nao ser compartilhados entre instrumentation e rotas em next start (base/canais-e-conversas.md); prova na T-07.01", "transacao interativa do Prisma no SQLite precisa de o cliente da transacao ser repassado a registrar (base/integracoes-e-agentes.md)"]
---

# Sprint 02 — Trilha de auditoria: servico e ligacoes

## Objetivo

Entrega o servico de auditoria somente-acrescimo e liga cada acao critica a ele: por ouvinte onde ja existe e por chamada direta nos servicos de integracoes, usuarios e agentes.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Servico de auditoria | nenhuma |
| F-02.2 | Ligacoes nos servicos | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

a suite inteira passa com 0 failed e as acoes de PR-19 gravam registro, as de transacao com rollback e as demais com erro no log.

## Riscos conhecidos

- ouvintes em Set de modulo podem nao ser compartilhados entre instrumentation e rotas em next start (base/canais-e-conversas.md); prova na T-07.01
- transacao interativa do Prisma no SQLite precisa de o cliente da transacao ser repassado a registrar (base/integracoes-e-agentes.md)
