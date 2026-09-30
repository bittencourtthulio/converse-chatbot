---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
atualizado_em: 2026-09-30
areas:
  - arquivo: streaming-e-openrouter.md
    titulo: Adaptador conversar, SSE do provedor e servidor simulado
    lacunas: 1
  - arquivo: banco-e-testes.md
    titulo: Banco, migrations e isolamento de teste
    lacunas: 1
  - arquivo: servicos-handlers-e-sessao.md
    titulo: Serviços, sessão, guardas e primeiro handler HTTP
    lacunas: 1
  - arquivo: interface-do-agente.md
    titulo: Interface, abas, componentes, estilos e testes de componente
    lacunas: 2
---

# Índice da base — conversa-de-teste

Modo INTERNO: a feature consome o adaptador do OpenRouter já construído (FT-02). Briefing em `../BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `streaming-e-openrouter.md` | Adaptador e simulado | `conversar`, ausência de `usage`, códigos de erro do provedor, opções do servidor falso. |
| `banco-e-testes.md` | Banco | Modelos atuais, migrations aditivas, `limparBanco`, cascata a provar. |
| `servicos-handlers-e-sessao.md` | Serviços e HTTP | Guardas de sessão, ausência de handler em `src/app/api`, contrato de Route Handler e stream do Next 16. |
| `interface-do-agente.md` | Interface | Abas, componentes, tokens, testes de componente sem jsdom. |
