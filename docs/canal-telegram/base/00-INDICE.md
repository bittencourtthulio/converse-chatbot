---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
atualizado_em: 2026-09-30
areas:
  - arquivo: telegram-bot-api.md
    titulo: Telegram Bot API (webhook, envio, erros)
    lacunas: 2
  - arquivo: turno-e-limites.md
    titulo: Turno de conversa, conversas e limites reutilizáveis
    lacunas: 0
  - arquivo: dados-segredo-e-ambiente.md
    titulo: Dados, segredo cifrado e ambiente
    lacunas: 2
  - arquivo: rotas-painel-e-testes.md
    titulo: Handlers, painel, abas e apoio de teste
    lacunas: 2
---

# Índice da base — canal-telegram

Modo EXTERNO (Telegram Bot API) mais INTERNO (código das FT-01 a FT-06). Briefing em `../BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `telegram-bot-api.md` | API externa | Métodos usados, formato de erro, segredo do webhook, limites de 4096 e de portas, riscos do token na URL. |
| `turno-e-limites.md` | Serviços | `responderMensagem` com canal `telegram`, conversas por identificador externo, limites presos ao widget que precisam de parâmetro. |
| `dados-segredo-e-ambiente.md` | Dados e segredo | Schema, migrations aditivas, `limparBanco`, cripto, ambiente, exclusão do agente. |
| `rotas-painel-e-testes.md` | Borda e testes | Handler público, `after`, abas, servidor de produção de teste e simulados. |
