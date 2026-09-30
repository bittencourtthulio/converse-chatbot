---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
atualizado_em: 2026-09-30
areas:
  - arquivo: camadas-e-lint.md
    titulo: Camadas, lint e scripts
    lacunas: 2
  - arquivo: interface-atual.md
    titulo: Interface atual herdada do template
    lacunas: 1
  - arquivo: autenticacao-e-sessao.md
    titulo: Autenticacao e sessao
    lacunas: 1
  - arquivo: ambiente-e-configuracao.md
    titulo: Ambiente e configuracao
    lacunas: 4
  - arquivo: testes-e-banco.md
    titulo: Testes e banco
    lacunas: 0
---

# Índice da base — fundacao-e-esqueleto

Modo INTERNO: a feature é do próprio sistema. O briefing do buildx está em `BRIEFING-BUILDX.md` (na pasta acima).

| Arquivo | Área | Resumo |
|---|---|---|
| `camadas-e-lint.md` | Camadas, lint e scripts | Pastas por camada, ESLint sem regra de direção, scripts do `package.json` (`setup` usa `db push`). |
| `interface-atual.md` | Interface atual | Casca de IDE em `global.css` e `tokens.css`, layout do sistema, navegação, alternador de tema, login. |
| `autenticacao-e-sessao.md` | Autenticação e sessão | Fluxo de login (ação, serviço, cookie), erros, ausência de limite de tentativas. |
| `ambiente-e-configuracao.md` | Ambiente e configuração | `ambiente.ts`, `.env.example`, `next.config.ts`, seed, ausência de `APP_NAME`, de cabeçalhos e de CI. |
| `testes-e-banco.md` | Testes e banco | Vitest, setup com `migrate deploy`, teste de rotas com servidor de produção, ajudante de teste. |
