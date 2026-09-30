---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-03
titulo: "Rotas publicas e cabecalhos do iframe"
status: nao_iniciado
criterio_saida: "Os testes de producao das rotas publicas e dos cabecalhos de /embed passam e a suite inteira esta verde."
fases: ["F-03.1", "F-03.2"]
riscos: ["Prisma dentro do proxy.ts pode nao funcionar (lacuna 1, D-09)", "o next start dos testes precisa de npm run build antes", "sem TRUST_PROXY todos os testes compartilham o IP desconhecido: os testes usam X-Forwarded-For com TRUST_PROXY=1"]
atualizado_em: 2026-09-30
---

# Sprint 03 — Rotas publicas e cabecalhos do iframe

## Objetivo

Rotas publicas de config, conversar e conversa, com CORS e limites, e o proxy com frame-ancestors dinamico.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | API publica | nenhuma |
| F-03.2 | Cabecalhos de /embed | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Os testes de producao das rotas publicas e dos cabecalhos de /embed passam e a suite inteira esta verde.

## Riscos conhecidos

- Prisma dentro do proxy.ts pode nao funcionar (lacuna 1, D-09)
- o next start dos testes precisa de npm run build antes
- sem TRUST_PROXY todos os testes compartilham o IP desconhecido: os testes usam X-Forwarded-For com TRUST_PROXY=1
