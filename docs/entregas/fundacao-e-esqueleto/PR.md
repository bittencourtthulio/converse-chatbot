---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
branch: feat/fundacao-e-esqueleto
branch_base: main
atualizado_em: 2026-09-30
---

# FT-01 — Fundação e esqueleto de aplicação (projeto plataforma-chatbot-ia)

O sistema passa a ter cara de SaaS padrão (barra lateral, cabeçalho, menu do usuário, temas claro e escuro, gaveta no celular), o nome do produto sai de `APP_NAME`, o login limita tentativas, toda resposta leva cabeçalhos de segurança e a direção das camadas passa a ser imposta por lint.
Quem entra com e-mail e senha chega a um painel, e o administrador cadastra outra conta que entra e troca a própria senha, como antes, só que agora com o novo visual e mais proteção.

## Arquivos alterados

```
./
  M .env.example
  M .gitignore
  M README.md
  M eslint.config.mjs
  M next.config.ts
  M package.json
  M vitest.config.ts
.github/workflows/
  A ci.yml
docs/entregas/fundacao-e-esqueleto/
  A ENTREGA.md
docs/fundacao-e-esqueleto/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A VERIFICACAO-COPIA-LIMPA.md
  A VERIFICACAO-VISUAL.md
docs/fundacao-e-esqueleto/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A ambiente-e-configuracao.md
  A autenticacao-e-sessao.md
  A camadas-e-lint.md
  A interface-atual.md
  A testes-e-banco.md
docs/fundacao-e-esqueleto/sprint-01/
  A tasks.md
docs/fundacao-e-esqueleto/sprint-02/
  A tasks.md
docs/fundacao-e-esqueleto/sprint-03/
  A tasks.md
docs/fundacao-e-esqueleto/sprint-04/
  A tasks.md
docs/fundacao-e-esqueleto/sprint-05/
  A tasks.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
src/app/
  M acoes.ts
  M layout.tsx
  R sessao-servidor.ts
src/app/(sistema)/
  A error.tsx
  M layout.tsx
  M page.tsx
src/app/(sistema)/configuracoes/usuarios/
  M LinhaDeUsuario.tsx
  A layout.tsx
  A loading.tsx
  M page.tsx
src/app/(sistema)/perfil/
  M page.tsx
src/app/(sistema)/perfil/senha/
  M page.tsx
src/app/entrar/
  M page.tsx
src/componentes/
  A Alerta.tsx
  M AlternadorDeTema.tsx
  A Badge.tsx
  A BarraLateral.tsx
  A Cabecalho.tsx
  A CabecalhoDaPagina.tsx
  A CascaDoSistema.tsx
  A Esqueleto.tsx
  A EstadoVazio.tsx
  M Formulario.tsx
  A FormularioDeLogin.tsx
  A Icones.tsx
  A Logotipo.tsx
  A MenuDoUsuario.tsx
  D Navegacao.tsx
  A iniciais.ts
  A itens-de-menu.ts
src/estilos/
  M global.css
  M tokens.css
src/lib/
  M ambiente.ts
  M erros.ts
  A limite-de-uso.ts
  A requisicao.ts
src/servicos/
  M autenticacao.ts
tests/
  A ambiente.test.ts
  A camadas.test.ts
  A componentes.test.tsx
  A iniciais.test.ts
  A limite-de-login.test.ts
  A limite-de-uso.test.ts
  A menu.test.ts
  A projeto.test.ts
  A requisicao.test.ts
  M rotas.test.ts
  A seed.test.ts
  A tokens.test.ts
```

Total: 84 arquivos.

## Origem

Feature FT-01 (`fundacao-e-esqueleto`) do mapa do projeto `plataforma-chatbot-ia`: adaptar o esqueleto herdado do template, semear e verificar a demonstração e converter as convenções. Planejamento e decisões em `docs/fundacao-e-esqueleto/` (decisões `D-00` a `D-18`, premissas novas PR-35 a PR-37).

## Análise de impacto

Muda o visual de todas as telas, o fluxo de login (agora com limite de tentativas) e o script `setup` (agora `prisma migrate deploy`). Não muda o modelo de dados nem as regras de usuários, perfil e troca de senha. O antigo `sessao-servidor` saiu de `src/lib` para `src/app`.

Detalhe: [00-DECISOES.md](../../fundacao-e-esqueleto/00-DECISOES.md)

## O que foi testado

- Regra de lint das camadas e sessão do servidor em `src/app`: `tests/camadas.test.ts` roda o ESLint real sobre amostras das quatro direções proibidas.
- Scripts, exemplo de ambiente, CI, README e seed: `tests/projeto.test.ts` e `tests/seed.test.ts`.
- Limite de uso (`tests/limite-de-uso.test.ts`), nome do produto e proxy (`tests/ambiente.test.ts`, `tests/requisicao.test.ts`), limite de login (`tests/limite-de-login.test.ts`) e cabeçalhos de segurança (`tests/rotas.test.ts`).
- Tokens e contraste 4,5:1 nos dois temas, sem cor literal (`tests/tokens.test.ts`); menu e ícones (`tests/menu.test.ts`, `tests/iniciais.test.ts`).
- Casca, login, painel e telas do sistema: `tests/rotas.test.ts` contra o servidor de produção e `tests/componentes.test.tsx`.
- Verificação visual em navegador nos dois temas (`docs/fundacao-e-esqueleto/VERIFICACAO-VISUAL.md`) e a suíte inteira numa cópia limpa (`docs/fundacao-e-esqueleto/VERIFICACAO-COPIA-LIMPA.md`).

Suíte: 184 testes passaram (61 herdados e 123 novos), mais lint, `npx tsc --noEmit`, `npm run build` e `npm audit --audit-level=high` sem falha, também numa cópia limpa do commit — `npm test`

## Como reverter

Reverter os commits da branch `feat/fundacao-e-esqueleto`. Nenhuma migração nova foi criada e nenhum dado é transformado, então não há efeito que o versionador não desfaça.

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 10 casos. Colaterais: todas as telas do sistema mudaram de visual; confira a troca de senha e o cadastro de usuários.

## Onde eu quero seu olho

### OLHO OBRIGATÓRIO — ler linha a linha

- `eslint.config.mjs` — regra da direção das camadas; provada por tests/camadas.test.ts
- `next.config.ts` — cabeçalhos de segurança de toda resposta; coberto por tests/rotas.test.ts
- `src/app/(sistema)/configuracoes/usuarios/layout.tsx` — guarda de admin acima do carregamento (307 de verdade); coberto por tests/rotas.test.ts
- `src/app/acoes.ts` — ação de login chama o limite antes de autenticar; ação de troca de senha e admin intactas
- `src/app/sessao-servidor.ts` — movido de src/lib; guarda de sessão e de admin no servidor
- `src/lib/limite-de-uso.ts` — módulo de segurança reutilizado depois por chat público e Telegram; testes em tests/limite-de-uso.test.ts
- `src/lib/requisicao.ts` — decide em que IP confiar (X-Forwarded-For só com TRUST_PROXY=1); testes em tests/requisicao.test.ts
- `src/servicos/autenticacao.ts` — limite de tentativas de login: chave por IP e e-mail, 429 com mensagem; testes em tests/limite-de-login.test.ts

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `.github/workflows/ci.yml` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `package.json` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/configuracoes/usuarios/loading.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/configuracoes/usuarios/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/error.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/layout.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/perfil/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/perfil/senha/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/entrar/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/layout.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Alerta.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/AlternadorDeTema.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Badge.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/BarraLateral.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Cabecalho.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/CabecalhoDaPagina.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/CascaDoSistema.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Esqueleto.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/EstadoVazio.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Formulario.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/FormularioDeLogin.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Icones.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Logotipo.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/MenuDoUsuario.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Navegacao.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/iniciais.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/itens-de-menu.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/lib/ambiente.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/lib/erros.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `vitest.config.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente

### DISPENSÁVEL — a máquina já provou

- `.gitignore` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `README.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/entregas/fundacao-e-esqueleto/ENTREGA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/00-AUDITORIA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/00-BLOQUEIOS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/00-DECISOES.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/BRIEFING-BUILDX.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/FECHAMENTO.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/ORQUESTRADOR.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/VERIFICACAO-COPIA-LIMPA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/VERIFICACAO-VISUAL.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/00-INDICE.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/00-LACUNAS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/ambiente-e-configuracao.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/autenticacao-e-sessao.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/camadas-e-lint.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/interface-atual.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/testes-e-banco.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-01/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-02/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-03/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-04/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-05/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/MAPA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/PREMISSAS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/PROJETO.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/RECURSAO.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/stack/CONVENCOES.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/stack/LACUNAS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `src/estilos/global.css` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `src/estilos/tokens.css` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/ambiente.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/camadas.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/componentes.test.tsx` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/iniciais.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/limite-de-login.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/limite-de-uso.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/menu.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/projeto.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/requisicao.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/rotas.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/seed.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/tokens.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem


## Fora de escopo

Agentes, chave do OpenRouter, base de conhecimento, chat embutido, Telegram, histórico, privacidade, contêiner e backup (FT-02 a FT-11). O limite de uso do chat público e do Telegram só reutiliza o módulo criado aqui. Verificação em celular real: PEND-07 em `docs/projeto/RECURSAO.md`.
