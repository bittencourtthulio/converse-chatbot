---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
atualizado_em: 2026-10-01
areas:
  - arquivo: conversas-e-modelo.md
    titulo: Conversas, mensagens e o serviço atual
    lacunas: 2
  - arquivo: canais-e-rotulos.md
    titulo: Dado pessoal por canal e rótulo do interlocutor
    lacunas: 0
  - arquivo: telas-menu-e-componentes.md
    titulo: Menu, páginas, componentes e tokens existentes
    lacunas: 1
  - arquivo: seed-testes-e-ci.md
    titulo: Seed, apoio de teste, build e CI
    lacunas: 1
  - arquivo: painel-e-agregacao.md
    titulo: Dados do painel inicial e agregação em SQL
    lacunas: 1
---

# Índice da base — historico-de-conversas

Modo INTERNO (a feature é do próprio sistema, sem serviço externo novo). Briefing em `../BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `conversas-e-modelo.md` | Dados e serviço | Modelos `Conversa` e `Mensagem`, o que `conversas.ts` já faz e não faz, risco de N+1 e de `LIKE`. |
| `canais-e-rotulos.md` | Canais | O que widget, Telegram e painel guardam de dado pessoal, rótulos mascarados, pontos de extensão da FT-10. |
| `telas-menu-e-componentes.md` | Apresentação | Menu, páginas modelo, componentes reaproveitáveis (fontes, texto seguro, badge, alerta), tokens. |
| `seed-testes-e-ci.md` | Teste e operação | Seed idempotente, apoios de teste, comandos verificados, testes que mudam. |
| `painel-e-agregacao.md` | Painel | Fontes de número existentes, agregação por dia e riscos de fuso. |
