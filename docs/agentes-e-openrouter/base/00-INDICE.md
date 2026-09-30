---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
atualizado_em: 2026-09-30
areas:
  - arquivo: openrouter-api.md
    titulo: API do OpenRouter
    lacunas: 3
  - arquivo: ambiente-e-segredos.md
    titulo: Ambiente, erros e segredos existentes
    lacunas: 0
  - arquivo: banco-e-migrations.md
    titulo: Banco, migrations e testes
    lacunas: 1
  - arquivo: interface-e-menu.md
    titulo: Interface, menu, guardas e componentes
    lacunas: 2
---

# Índice da base — agentes-e-openrouter

Modo EXTERNO (OpenRouter) com o mínimo interno que a integração toca. Briefing em `BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `openrouter-api.md` | API do OpenRouter | Rotas, autenticação, cabeçalhos, SSE, comentários, erros e erro no meio do stream. |
| `ambiente-e-segredos.md` | Ambiente e erros | `ambiente.ts` lazy, `ErroDeAplicacao`, risco de segredo em log. |
| `banco-e-migrations.md` | Banco e testes | Modelo único, uma migration, banco por arquivo de teste, singleton e migração aditiva. |
| `interface-e-menu.md` | Interface | Menu, guardas de admin, formulários, estados e classes de estilo. |
