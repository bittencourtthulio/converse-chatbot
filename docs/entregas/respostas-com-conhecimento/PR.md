---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
branch: feat/respostas-com-conhecimento
branch_base: feat/conhecimento-arquivos-e-texto
atualizado_em: 2026-09-30
---

# FT-05 — Respostas com base no conhecimento (projeto plataforma-chatbot-ia)

O agente responde a partir das fontes da própria base, mostra de quais fontes tirou a resposta e diz que não sabe quando a base não cobre a pergunta. Entram o índice de busca textual (FTS5 do SQLite, por migration), o serviço de recuperação, o modo fundamentado do turno de chat com o conteúdo da base tratado como dado (PR-15), o evento `fontes` gravado em `Mensagem.fontes`, as Fontes e as referências `[n]` na aba Testar, o cartão "Testar busca" e a rota `POST /api/agentes/[id]/buscar`.

Este PR está empilhado sobre `feat/conhecimento-arquivos-e-texto` (FT-04). Sem remoto configurado: nenhum push nem PR foi feito; esta descrição é o PR.

## Arquivos alterados

```
./
  M README.md
docs/entregas/respostas-com-conhecimento/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/respostas-com-conhecimento/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/respostas-com-conhecimento/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A fts5-e-migration.md
  A interface-testar-e-conhecimento.md
  A turno-de-chat-e-sse.md
docs/respostas-com-conhecimento/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/respostas-com-conhecimento/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/respostas-com-conhecimento/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/respostas-com-conhecimento/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/respostas-com-conhecimento/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/respostas-com-conhecimento/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/migrations/20260930190000_busca_fts5/
  A migration.sql
src/app/
  M eventos-sse.ts
src/app/api/agentes/[id]/buscar/
  A route.ts
src/componentes/
  M ChatDeTeste.tsx
  A FontesDaResposta.tsx
  M PainelDeConhecimento.tsx
  A TestarBusca.tsx
  M TextoDoModelo.tsx
  A busca-logica.ts
  M estado-da-conversa.ts
  A fontes-da-resposta-logica.ts
  M leitor-de-sse.ts
  M texto-seguro.ts
src/estilos/
  M global.css
src/servicos/
  M chat-prompt.ts
  M chat.ts
  M conversas.ts
  A fontes-da-resposta.ts
  A recuperacao-termos.ts
  A recuperacao.ts
tests/
  A apoio-conhecimento.test.ts
  A busca-logica.test.ts
  A buscar-rota.test.ts
  A chat-fontes.test.ts
  A chat-fundamentado.test.ts
  A chat-prompt-fundamentado.test.ts
  M conversar-rota.test.ts
  M conversas.test.ts
  M estado-da-conversa.test.ts
  M eventos-sse.test.ts
  A fontes-da-resposta-ui.test.tsx
  A fontes-da-resposta.test.ts
  A indice-fts5-cascata.test.ts
  A indice-fts5.test.ts
  M leitor-de-sse.test.ts
  M painel-de-conhecimento.test.tsx
  M projeto.test.ts
  A recuperacao-desempenho.test.ts
  A recuperacao-termos.test.ts
  A recuperacao.test.ts
  M seed.test.ts
  M texto-seguro.test.tsx
tests/apoio/
  A conhecimento.ts
```

Total: 85 arquivos.

## Origem

Feature FT-05 (`respostas-com-conhecimento`) do mapa do projeto `plataforma-chatbot-ia`, que realiza as premissas PR-04, PR-15 e PR-30. Planejamento e decisões em `docs/respostas-com-conhecimento/` (decisões `D-00` a `D-18`, premissas novas PR-50 a PR-54).

## Análise de impacto

Acrescenta uma migration (tabela virtual FTS5 `trechos_fts` e três gatilhos em `trechos`, que rodam em toda escrita de trechos, inclusive na cascata e na fila), o primeiro SQL cru do sistema (`prisma.$queryRaw` parametrizado, texto do usuário nunca concatenado), uma rota que exige sessão, um evento novo no SSE (clientes antigos o ignoram) e o uso de `Mensagem.fontes`. Muda o comportamento do chat de todo agente que tenha fonte pronta: o prompt passa a levar o material da base; agente sem fonte pronta continua idêntico. Sem variável de ambiente nova e sem dependência nova. O índice depende do `rowid` de `trechos`: depois de restaurar backup ou de um `VACUUM`, rodar `reconstruirIndiceDeTrechos()` (PR-50, a lembrar na FT-11).

Detalhe: [00-DECISOES.md](../../respostas-com-conhecimento/00-DECISOES.md)

## O que foi testado

- Índice e migration: `tests/indice-fts5.test.ts`, `tests/indice-fts5-cascata.test.ts` (insert, update, delete, cascata de fonte e agente, reprocessamento, preenchimento de dados pré-existentes).
- Recuperação: `tests/recuperacao-termos.test.ts`, `tests/recuperacao.test.ts` (perguntas hostis, continuação, filtros), `tests/recuperacao-desempenho.test.ts` (5.000 trechos), `tests/seed.test.ts`.
- Prompt e turno: `tests/chat-prompt-fundamentado.test.ts`, `tests/chat-fundamentado.test.ts` (requisição capturada no OpenRouter falso, trecho malicioso dentro do bloco), `tests/chat-fontes.test.ts`, `tests/fontes-da-resposta.test.ts`, `tests/conversas.test.ts`.
- Protocolo e rotas no servidor de produção: `tests/eventos-sse.test.ts`, `tests/leitor-de-sse.test.ts`, `tests/conversar-rota.test.ts`, `tests/buscar-rota.test.ts`.
- Interface: `tests/texto-seguro.test.tsx`, `tests/estado-da-conversa.test.ts`, `tests/fontes-da-resposta-ui.test.tsx`, `tests/busca-logica.test.ts`, `tests/painel-de-conhecimento.test.tsx`; convenções e README em `tests/projeto.test.ts`.
Suíte: 1065 testes, 0 falhas — `npm test` (o teste de rotas exige `npm run build` antes). `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Verificação visual parcial em `docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md`.

## Desvios do plano

- Em `tasks.md`, o campo `suite` das tasks foi trocado de `parcial` para `verde`: cada task rodou o subconjunto afetado, e a suíte inteira rodou verde no fim de cada sprint e no estado final; a linha de resultado na prosa de cada task descreve o subconjunto que rodou.
- `docs/projeto/PROJETO.md` (contador `features_entregues`) foi editado sem constar numa task e passou a ser declarado na T-06.03.
- `src/componentes/ChatDeTeste.tsx` recebeu um `else if` já na T-04.01 (o tipo novo de evento quebrava o `tsc`), antes da task de interface que o previa.
- `src/estilos/global.css` foi corrigido também na T-06.02 (alinhamento do chip de fonte, achado da verificação visual).
- Previstos e não alterados: `prisma/seed.ts`, `tests/rotas.test.ts`, `tests/apoio/servidor.ts`, `src/app/(sistema)/agentes/[id]/testar/page.tsx`.
- Em várias tasks teste e código nasceram no mesmo passo em vez de o teste em vermelho primeiro.
- Limite conhecido: o comportamento do modelo real diante do prompt (citar `[n]`, tratar o material como dado, dizer que não encontrou) não é testável sem chamar o provedor; os testes provam a estrutura do prompt contra o OpenRouter simulado.

## Como reverter

Reverter o código é desfazer os commits. Efeito que o versionador NÃO desfaz: a migration aplicada (a tabela virtual `trechos_fts` e os gatilhos continuam no banco até um backup ser restaurado, pois o projeto não tem reversão de migration); `Mensagem.fontes` já gravada continua nas mensagens.
