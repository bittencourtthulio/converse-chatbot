---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-02
atualizado_em: 2026-09-30
titulo: "Adaptador do Telegram"
status: concluido
criterio_saida: "src/lib/telegram.ts cobre os seis metodos com erro em portugues e o token nunca aparece em erro, log ou pilha, provado por teste."
fases: ["F-02.1", "F-02.2"]
riscos: ["o token vai na URL: qualquer erro de fetch pode incluir o endereco inteiro", "retry_after do 429 nao e documentado na consulta (lacuna 1): tratado como opcional"]
---

# Sprint 02 — Adaptador do Telegram

## Objetivo

src/lib/telegram.ts cobre os seis metodos com erro em portugues e o token nunca aparece em erro, log ou pilha, provado por teste.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Nucleo e metodos de configuracao | nenhuma |
| F-02.2 | Envio e prova do token | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

src/lib/telegram.ts cobre os seis metodos com erro em portugues e o token nunca aparece em erro, log ou pilha, provado por teste.

## Riscos conhecidos

- o token vai na URL: qualquer erro de fetch pode incluir o endereco inteiro
- retry_after do 429 nao e documentado na consulta (lacuna 1): tratado como opcional
