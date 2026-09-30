---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
atualizado_em: 2026-09-30
areas:
  - arquivo: api-publica-e-limites.md
    titulo: API pública, turno de chat, limites e conversas
    lacunas: 1
  - arquivo: embed-e-csp.md
    titulo: Página do iframe, cabeçalhos de segurança e proxy do Next
    lacunas: 2
  - arquivo: widget-e-script.md
    titulo: Script widget.js, testes de DOM e ferramentas de verificação
    lacunas: 3
  - arquivo: configuracao-e-painel.md
    titulo: Configuração do chat por agente, aba Publicar, seed
    lacunas: 0
---

# Índice da base — chat-embutido

Modo INTERNO (código das FT-01 a FT-05) mais a documentação do `proxy.ts` do Next 16 instalada no repositório. Briefing em `../BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `api-publica-e-limites.md` | Serviços e protocolo | `responderMensagem` com canal `widget`, posse da conversa, limitador, IP e `TRUST_PROXY`, tradutor SSE com erro do operador, contagem do teto diário. |
| `embed-e-csp.md` | Segurança de borda | `X-Frame-Options: DENY` global, `proxy.ts` do Next 16, `frame-ancestors` dinâmico, layout fora do grupo `(sistema)`. |
| `widget-e-script.md` | Script do cliente | Rota do script, Shadow DOM, `postMessage`, testes com DOM, cores literais, verificação no navegador. |
| `configuracao-e-painel.md` | Dados e painel | Modelo `Agente`, migrations aditivas, abas, ações, `APP_URL`, seed, regra de tokens. |
