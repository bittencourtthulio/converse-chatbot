---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
branch: feat/canal-telegram
branch_base: feat/chat-embutido
atualizado_em: 2026-09-30
---

# FT-07 — Canal Telegram (projeto plataforma-chatbot-ia)

O usuário conecta o token de um bot do Telegram a um agente, na nova aba **Canais**, e passa a conversar com esse agente pelo aplicativo. Entram o adaptador do Telegram (o token vai na URL e nunca aparece em erro ou log), o serviço do canal (token cifrado, segredo do webhook só em hash, `APP_URL` HTTPS exigida), o webhook com resposta rápida e dedupe, o atendimento (só chat privado de texto, comandos, fontes, limites) e a aba Canais.

Este PR está empilhado sobre `feat/chat-embutido` (FT-06) para evitar conflito nos arquivos compartilhados (`abas-do-agente.ts`, `ambiente.ts`, `.env.example`, `chat-publico-limites.ts`); a FT-07 depende funcionalmente só da FT-05 e não usa nada do chat embutido. Sem remoto configurado: nenhum push nem PR foi feito; esta descrição é o PR.

## Arquivos alterados

```
./
  M .env.example
  M README.md
docs/canal-telegram/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/canal-telegram/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A dados-segredo-e-ambiente.md
  A rotas-painel-e-testes.md
  A telegram-bot-api.md
  A turno-e-limites.md
docs/canal-telegram/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/canal-telegram/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/canal-telegram/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/canal-telegram/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/canal-telegram/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/canal-telegram/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/canal-telegram/sprint-07/
  A fases.md
  A sprint.md
  A tasks.md
docs/entregas/canal-telegram/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/
  M schema.prisma
prisma/migrations/20260930220000_canal_telegram/
  A migration.sql
src/app/
  M acoes.ts
src/app/(sistema)/agentes/[id]/canais/
  A loading.tsx
  A page.tsx
src/app/api/telegram/[agenteId]/webhook/
  A route.ts
src/componentes/
  A CartaoTelegram.tsx
  M abas-do-agente.ts
  A canais-logica.ts
  A canais.ts
src/estilos/
  M global.css
src/lib/
  M ambiente.ts
  A exclusao-mutua.ts
  A telegram.ts
src/servicos/
  A canal-telegram.ts
  M chat-publico-limites.ts
  M conversas.ts
  A telegram-atendimento.ts
  A telegram-limites.ts
  A telegram-webhook.ts
tests/
  M abas-do-agente.test.tsx
  M ajuda.ts
  M ambiente.test.ts
  A canais-logica.test.ts
  A canais-ui.test.tsx
  A canal-telegram-ciclo.test.ts
  A canal-telegram-conectar.test.ts
  A canal-telegram-modelo.test.ts
  M chat-publico-limites.test.ts
  M conversas.test.ts
  A exclusao-mutua.test.ts
  M projeto.test.ts
  M publicar-rota.test.ts
  M rotas.test.ts
  A telegram-acoes.test.ts
  A telegram-comandos.test.ts
  A telegram-envio.test.ts
  A telegram-falso.test.ts
  A telegram-limites.test.ts
  A telegram-resposta.test.ts
  A telegram-token-nao-vaza.test.ts
  A telegram-webhook-base.test.ts
  A telegram-webhook-rota.test.ts
  A telegram.test.ts
tests/apoio/
  M servidor.ts
  A servir-telegram-falso.ts
  A telegram-falso.ts
```

Total: 94 arquivos. Sem mudança em `package.json`, `package-lock.json` nem `.gitignore`.

## Origem

Feature FT-07 `canal-telegram` do projeto `plataforma-chatbot-ia`; realiza PR-07, PR-14 e PR-16 e cria PR-63 a PR-70 (`docs/projeto/PREMISSAS.md`). Briefing em `docs/canal-telegram/BRIEFING-BUILDX.md`, decisões em `docs/canal-telegram/00-DECISOES.md`.

## O que foi testado

- Sprint 01: migration aditiva e modelos, variáveis de ambiente, servidor simulado do Telegram.
- Sprint 02: adaptador (seis métodos, divisão acima de 4096, `retry_after` uma vez, 50 combinações de método e falha provando que o token não vaza).
- Sprint 03: conectar, desconectar, pausar, retomar, verificar, limite diário e `exigirTetoDiario` por canal.
- Sprint 04: autenticação em tempo constante, dedupe e purga, comandos, resposta com fontes e "digitando", limites e exclusão mútua.
- Sprint 05: o webhook contra o servidor de produção (401, 200 rápido, reenvio, pausa, 413, log sem token) e as ações de servidor.
- Sprint 06: lógica pura e cartão da aba Canais (estados, aviso de `APP_URL`, token nunca preenchido, 44 px, uma coluna a 480 px).
- Sprint 07: verificação ponta a ponta no Chrome contra o Telegram simulado (`docs/canal-telegram/VERIFICACAO-VISUAL.md`), convenções com `arquivo:linha` conferidas por teste.

Suíte: 1730 testes passando (249 novos) — `npm test` depois de `npm run build`; `npx tsc --noEmit`, `npm run lint` e `npm audit --audit-level=high` (0) verdes. As tasks guardam `suite: parcial` (subconjunto da task); a suíte inteira rodou verde ao fechar cada sprint e no estado final.

## Como reverter

`git revert` dos commits da branch. A migration `20260930220000_canal_telegram` só cria duas tabelas; o Prisma não reverte migration, então desfazê-la num banco que já a aplicou exige apagar as tabelas `atualizacoes_telegram` e `canais_telegram` (com backup antes). Efeitos que o versionador NÃO desfaz: o webhook registrado no Telegram (use Desconectar na tela, ou revogue o token no @BotFather) e as conversas já gravadas pelo canal (`canal = 'telegram'`).

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 20 casos.
Colaterais a observar: abas Publicar, Testar e Conhecimento do mesmo agente, limite diário do chat embutido (separado do Telegram), exclusão de agente com bot conectado, bot sem chave do OpenRouter.

## Onde eu quero seu olho

Detalhe e justificativa de cada arquivo em [ATENCAO.md](ATENCAO.md).

### OLHO OBRIGATÓRIO — ler linha a linha

- `prisma/migrations/20260930220000_canal_telegram/migration.sql` — O3: só `CREATE TABLE` e índices únicos (agente, bot, canal+update)
- `prisma/schema.prisma` — O3: modelos novos `CanalTelegram` e `AtualizacaoTelegram` (cascata com o agente, `botId` único)
- `src/app/acoes.ts` — O4: `mensagemSemSegredo`, nenhum retorno leva segredo, sessão no servidor
- `src/app/api/telegram/[agenteId]/webhook/route.ts` — O5: `POST` do Telegram, 401 sem corpo, 413 acima de 64 KB, 200 imediato e atendimento em `after()`
- `src/lib/ambiente.ts` — O4: `TELEGRAM_PERMITIR_URL_NAO_HTTPS` só vale fora de produção
- `src/lib/telegram.ts` — O4: o token vai no caminho da URL do Telegram
- `src/servicos/canal-telegram.ts` — O4: formato do token, `APP_URL` HTTPS, token cifrado antes do `setWebhook`, segredo de 32 bytes só em hash, bot único, reconexão gira o segredo, `aoAlterarCanal`
- `src/servicos/chat-publico-limites.ts` — O2: `exigirTetoDiario` ganhou o parâmetro de canal (padrão `widget`)
- `src/servicos/conversas.ts` — O4: `criar` ganhou `titulo` opcional (nome público do Telegram)
- `src/servicos/telegram-atendimento.ts` — O4: nome público no título (PR-18), só chat privado, comandos, resposta em texto puro com fontes, falha vira frase única, `ultimoErro` seguro
- `src/servicos/telegram-limites.ts` — O2: 10 por minuto por chat, 60 por conversa, teto diário do canal
- `src/servicos/telegram-webhook.ts` — O4: segredo em tempo constante contra o hash, 401 igual para tudo que não autentica, dedupe por `update_id`, 200 para ilegível

### LEITURA RÁPIDA — conferir intenção, não implementação

22 arquivos: componentes novos da aba Canais, a lista de abas, estilos, README, convenções, lacunas, documentos do projeto e testes que alteram asserção existente (ver ATENCAO.md).

### DISPENSÁVEL — a máquina já provou

60 arquivos: testes que só acrescentam casos ou apoio novo e artefatos do método (planos, base, decisões, relatórios), sem código nem contrato.

## Fora de escopo

Telegram real (PEND-06), leitura e exclusão das conversas (FT-09), retenção e auditoria (FT-10), backup, deploy e URL pública definitiva (FT-11), grupos e mídia, vários bots por agente. Mensagens enviadas com o canal pausado ou com o processo reiniciando entre o 200 e a resposta não são atendidas depois (`docs/stack/LACUNAS.md`, 18 a 21).
