---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-01 Fundação e esqueleto de aplicação

## Problema

O usuário entra com e-mail e senha numa interface no estilo de um SaaS, chega ao painel inicial e, pela área de Configurações, um admin cadastra outra conta que entra e troca a própria senha.

## Escopo

O esqueleto (autenticação JWT, papéis, usuário de demonstração, painel, Configurações > Usuários, Meu perfil, troca de senha) já está no código, herdado do template, e verde (61 testes). A feature ADAPTA, SEMEIA/VERIFICA e CONVERTE:

1. Design SaaS padrão no lugar do VS Code (PR-23): barra lateral com logotipo, navegação por lista em um único arquivo, cabeçalho com título, menu do usuário e alternador de tema (persistido, sem flash), cartões, tabelas, badges, botões, campos, alertas, estado vazio, esqueleto de carregamento; login em cartão centralizado; gaveta abaixo de 768px; alvos de 44px; foco visível; contraste 4,5:1.
2. Nome do produto por `APP_NAME` (PR-03), em `src/lib/ambiente.ts`.
3. Limite de tentativas de login (PR-16, parte do login) e módulo reutilizável `src/lib/limite-de-uso.ts`.
4. Cabeçalhos de segurança em `next.config.ts`.
5. Regra de lint para a direção das camadas.
6. `npm run setup` com `migrate deploy`; `.env.example` com `APP_NAME`.
7. Seed de demonstração (PR-25), sem agente de exemplo (vem na FT-02).
8. Pipeline de CI (PR-26).
9. README do projeto.
10. Verificação da suíte herdada em cópia limpa.
11. Conversão das convenções (`stackx-detectar`).
12. Painel inicial com título, subtítulo e estado vazio bem desenhado.

## Não-objetivos

Agentes e chave do OpenRouter (FT-02); conversa de teste (FT-03); base de conhecimento (FT-04, FT-08); respostas com conhecimento (FT-05); chat embutido (FT-06, que sobrescreve o `X-Frame-Options`); Telegram (FT-07); histórico e números do painel (FT-09); privacidade e auditoria (FT-10); contêiner, saúde e backup (FT-11); limite de uso do chat público e do Telegram (FT-06, FT-07, que só reutilizam o módulo).

## Critérios de aceite de negócio cobertos

- Entro com a conta de demonstração e chego a um painel e a um menu.
- Um administrador cadastra outro usuário, e essa pessoa entra e troca a própria senha.
- A interface funciona no celular e nos temas claro e escuro.

## Premissas aplicáveis

PR-02, PR-03, PR-12, PR-13, PR-16, PR-23, PR-25, PR-26, PR-27, PR-28, PR-29, PR-31, PR-32, PR-33, PR-34 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
