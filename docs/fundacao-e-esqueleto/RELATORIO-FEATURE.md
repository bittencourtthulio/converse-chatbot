---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-01
trabalho_id: fundacao-e-esqueleto
status: entregue
sprints: 5
tasks: 21
testes_suite: 184
data: 2026-09-30
---

# Relatório da FT-01 — Fundação e esqueleto de aplicação

Branch `feat/fundacao-e-esqueleto`, a partir de `main`. PR local: descrição em `docs/entregas/fundacao-e-esqueleto/PR.md`, pacote de QA em `docs/entregas/fundacao-e-esqueleto/QA-PACOTE.md`.

## O que foi entregue

- Design de SaaS padrão no lugar da casca de IDE: barra lateral com logotipo, cabeçalho com título da página, menu do usuário, gaveta abaixo de 768px, alternador de tema sem flash, tokens semânticos em `src/estilos/tokens.css` com contraste 4,5:1 provado por teste, componentes de estado (vazio, carregando, erro).
- Itens de menu em um único arquivo, `src/componentes/itens-de-menu.ts`.
- Nome do produto por `APP_NAME` (padrão Converse), lido em `src/lib/ambiente.ts`.
- `src/lib/limite-de-uso.ts` (janela deslizante, relógio injetável) e limite de tentativas de login (5 por minuto por IP e e-mail, 20 por IP).
- Cabeçalhos de segurança em `next.config.ts`.
- Regra `no-restricted-imports` para as três camadas; `sessao-servidor` movido de `src/lib` para `src/app`.
- `setup` com `migrate deploy`, CI em `.github/workflows/ci.yml`, README do projeto, seed verificada, convenções convertidas.

## Como demonstrar

`npm run setup`, `npm run dev`, entrar com `admin@exemplo.local` / `demo1234` (contas fictícias) e seguir `QA-PACOTE.md`.

## Verificação

184 testes (61 herdados, 123 novos); lint, `npx tsc --noEmit`, build e `npm audit --audit-level=high` verdes, também numa cópia limpa do commit (`VERIFICACAO-COPIA-LIMPA.md`). Verificação visual em `VERIFICACAO-VISUAL.md`.

## Desvios do plano

- Seis arquivos não previstos, declarados depois nas tasks e no `ENTREGA.md`: guarda de admin em `usuarios/layout.tsx` e `loading.tsx` movido para `usuarios/` (o carregamento no nível do sistema fazia o redirecionamento virar 200), `FormularioDeLogin.tsx`, `iniciais.ts` e seu teste, remoção de `Navegacao.tsx`.
- Task T-05.04 acrescentada (fechamento no laço do buildx).
- O histórico de esforço (`HISTORICO.md`) não foi gravado: o esforço real por task não foi medido.
- A verificação a 375px usou quadros sem JavaScript (PEND-07).
- O primeiro portão da mergex barrou em V9; os desvios foram declarados e o portão refeito, sem alterar código.

## Premissas e pendências

Novas: PR-35 (densidade), PR-36 (limites de login e IP), PR-37 (cabeçalhos sem CSP). Nova pendência: PEND-07 (verificação em celular real).
