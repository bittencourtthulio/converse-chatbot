---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
branch: feat/historico-de-conversas
branch_base: feat/conhecimento-em-video
atualizado_em: 2026-10-01
---

# FT-09 — Histórico de conversas e painel (projeto plataforma-chatbot-ia)

O usuário passa a ler as conversas de todos os canais (painel, chat embutido e Telegram), filtrar por agente, canal, texto e período, ver as fontes de cada resposta, exportar em `.txt` e apagar uma conversa ou várias, e a tela inicial mostra os números de agentes, fontes e mensagens, um gráfico de 14 dias, as conversas recentes e os primeiros passos. A parte de apagar conversa do PR-18 passa a existir; retenção, exclusão de usuário, aviso de privacidade e auditoria são da FT-10.

Este PR está empilhado sobre `feat/conhecimento-em-video` (FT-08), como todos os anteriores. Sem remoto configurado: o push e a abertura do PR não foram feitos (`git remote -v` vazio, PEND-05).

## Arquivos alterados

```
./
  M README.md
docs/entregas/historico-de-conversas/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/historico-de-conversas/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/historico-de-conversas/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A canais-e-rotulos.md
  A conversas-e-modelo.md
  A painel-e-agregacao.md
  A seed-testes-e-ci.md
  A telas-menu-e-componentes.md
docs/historico-de-conversas/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/historico-de-conversas/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/historico-de-conversas/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/historico-de-conversas/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/historico-de-conversas/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/historico-de-conversas/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/
  M seed.ts
src/app/(sistema)/
  D page.tsx
src/app/(sistema)/(painel)/
  A loading.tsx
  A page.tsx
src/app/(sistema)/conversas/(lista)/
  A loading.tsx
  A page.tsx
src/app/(sistema)/conversas/[id]/
  A carregar-conversa.ts
  A layout.tsx
  A loading.tsx
  A not-found.tsx
  A page.tsx
src/app/api/conversas/
  A resposta.ts
src/app/api/conversas/[id]/
  A route.ts
src/app/api/conversas/[id]/exportar/
  A route.ts
src/app/api/conversas/apagar/
  A route.ts
src/componentes/
  A AcoesDaConversa.tsx
  A BadgeDeCanal.tsx
  A CartoesDoPainel.tsx
  A ConversasRecentes.tsx
  A FiltrosDeConversas.tsx
  A GraficoDeMensagens.tsx
  A ListaComSelecao.tsx
  A ListaDeConversas.tsx
  A PrimeirosPassos.tsx
  A TranscricaoDaConversa.tsx
  A apagar-conversas.ts
  A conversas-logica.ts
  M itens-de-menu.ts
  A painel-logica.ts
src/estilos/
  M global.css
  M tokens.css
src/servicos/
  A historico-logica.ts
  A historico.ts
  A painel.ts
tests/
  A contador-de-consultas.test.ts
  A conversas-apagar-rota.test.ts
  A conversas-detalhe-rota.test.ts
  A conversas-detalhe-ui.test.tsx
  A conversas-exportar-rota.test.ts
  A conversas-lista-estilos.test.ts
  A conversas-lista-ui.test.tsx
  A conversas-logica.test.ts
  A conversas-lote-ui.test.tsx
  A grafico-de-mensagens.test.tsx
  A historico-apagar.test.ts
  A historico-apoio.test.ts
  A historico-consultas.test.ts
  A historico-listar.test.ts
  A historico-logica.test.ts
  A historico-obter.test.ts
  A historico-texto.test.ts
  M menu.test.ts
  A painel-logica.test.ts
  A painel-numeros.test.ts
  A painel-passos.test.ts
  A painel-serie.test.ts
  A painel-ui.test.tsx
  M projeto.test.ts
  M rotas.test.ts
  A seed-conversas.test.ts
  A sqlite-formatos.test.ts
  A tokens-historico.test.ts
tests/apoio/
  A contador-de-consultas.ts
  A historico.ts
```

Total: 108 arquivos.

## Origem

Feature FT-09, slug `historico-de-conversas` (projeto `plataforma-chatbot-ia`), origem `premissa` (PR-18). Decisões da F2 respondidas pelo buildx em `docs/historico-de-conversas/00-DECISOES.md`; premissas novas PR-78 a PR-85 em `docs/projeto/PREMISSAS.md`.

## O que foi testado

- Sprint 01 (T-01.01 a T-01.04): contador de consultas ao banco em teste, fixtures de conversas dos três canais, caracterização do SQLite (o `DateTime` é texto ISO em UTC, o `LIKE` e o dia local) e tokens de canal e de série com contraste.
- Sprint 02 (T-02.01 a T-02.05): serviço de histórico: lógica pura (rótulo mascarado, prévia, escape do `LIKE`, filtros), `listarConversas` com duas consultas provadas por contador (sem N+1), filtro por texto limitado a 200 conversas, `obterConversa`, exportação e apagar em lote com `aoApagarConversa`.
- Sprint 03 (T-03.01 a T-03.03): handlers `DELETE`, lote e exportação contra o servidor de produção (401, 404, 422) e o item de menu.
- Sprint 04 (T-04.01 a T-04.04): lógica da tela, lista com filtros e cartões, seleção e apagar em lote com confirmação na tela (`happy-dom`), detalhe com transcrição segura (`<script>`, `<img onerror>`, `javascript:`) e 404 de verdade.
- Sprint 05 (T-05.01 a T-05.04): números e série do painel com bordas de dia, de fuso e de horário de verão, recentes, alerta e primeiros passos (nunca a chave), gráfico acessível e a página do painel.
- Sprint 06 (T-06.01 a T-06.04): conversas fictícias da seed, verificação no navegador dos três canais, convenções, lacunas e README, fechamento.

Registro `suite: parcial` por task (subconjunto declarado na linha de cada task); a suíte inteira rodou verde ao fechar cada sprint (2046, 2103, 2115, 2173, 2218 e 2251 testes) e no estado final do HEAD: 2251 testes em 176 arquivos, 241 novos. `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Comando: `npm test` (os testes de rota exigem `npm run build` antes).

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 26 casos.
Colaterais a observar: a aba Testar depois de apagar a conversa do painel, o chat embutido de um visitante cuja conversa foi apagada, a aba Canais (desconectar mantém o histórico), o menu e o título do cabeçalho no celular e a tela inicial (atalho Cadastrar usuário só do admin).

## Onde eu quero seu olho

### OLHO OBRIGATÓRIO — ler linha a linha

- `src/app/(sistema)/(painel)/page.tsx` — O4 papel: o link da chave do OpenRouter só vai ao admin e a chave nunca chega à página; também substitui a página inicial (`(sistema)/page.tsx`) e mantém o atalho Cadastrar usuário
- `src/app/(sistema)/conversas/(lista)/page.tsx` — O4 dado pessoal e entrada de usuário: os filtros vêm da URL (`searchParams`), a lista mostra rótulo e prévia de conversas, e o 422 do serviço vira aviso; redireciona para a última página quando a atual esvaziou
- `src/app/(sistema)/conversas/[id]/carregar-conversa.ts` — O4 acesso a dado pessoal: mapeia o 404 do serviço para `notFound()` e lê a conversa uma vez por requisição (`cache`)
- `src/app/(sistema)/conversas/[id]/layout.tsx` — O4 autorização: confere sessão e existência da conversa acima do `loading.tsx` para o 404 ser de verdade; sem ele o id inexistente sairia 200
- `src/app/(sistema)/conversas/[id]/page.tsx` — O4 dado pessoal: mostra a conversa inteira (metadados, transcrição, exportar, apagar); a conversa vai ao cliente como texto, sem o identificador externo
- `src/app/api/conversas/[id]/exportar/route.ts` — O5 contrato público novo (download `.txt`) e O4 dado pessoal que sai do sistema: nome do arquivo só com o id interno, `Content-Disposition`, `no-store`, `nosniff`, rótulo mascarado no texto
- `src/app/api/conversas/[id]/route.ts` — O5 contrato público novo (`DELETE /api/conversas/[id]`) e O4 sessão conferida no servidor; efeito irreversível (apaga conversa e mensagens)
- `src/app/api/conversas/apagar/route.ts` — O5 contrato público novo (`POST /api/conversas/apagar`, `{ids}`) e O4 sessão e limite de 50 no servidor; efeito irreversível em lote
- `src/app/api/conversas/resposta.ts` — O4 autenticação: `exigirSessao` (401 em JSON) e o erro sem pilha com correlação, compartilhados pelos três handlers
- `src/componentes/AcoesDaConversa.tsx` — Efeito irreversível: confirmação de apagar uma conversa e navegação de volta por `window.location.href` (com `eslint-disable` justificado); coberto em `happy-dom`
- `src/componentes/ListaComSelecao.tsx` — Efeito irreversível: a confirmação de apagar em lote é a única barreira antes da exclusão definitiva; sem confirmação na tela (sem `window.confirm`), foco devolvido ao cancelar; coberto por `tests/conversas-lote-ui.test.tsx` em `happy-dom`, mas sem navegador real além da verificação visual
- `src/componentes/TranscricaoDaConversa.tsx` — O4 conteúdo de terceiros não confiável (XSS): renderiza o texto do visitante e a resposta do modelo; só `TextoDoModelo` e texto de React, nunca `dangerouslySetInnerHTML` (provado com `<script>`, `<img onerror>` e `javascript:` em `tests/conversas-detalhe-ui.test.tsx`)
- `src/servicos/historico-logica.ts` — O4 mascaramento de dado pessoal (`rotuloDoInterlocutor`, PR-78), escape do `LIKE` (`escaparLike`, injeção de curinga) e validação de entrada dos filtros e do lote; um erro aqui vaza o identificador do visitante ou deixa o texto virar curinga
- `src/servicos/historico.ts` — O4 dado pessoal: lê o texto de conversas de visitantes e do Telegram, monta o rótulo mascarado e apaga em lote (efeito irreversível: a exclusão não tem reversão); SQL cru parametrizado com `LIKE` sobre o conteúdo (`condicoes`, `universo`), transação de exclusão e ponto de extensão da auditoria. Provado em `tests/historico-*.test.ts`, mas é o arquivo onde o erro custa mais
- `src/servicos/painel.ts` — O2 regra de cálculo: janelas de 7 e 14 dias, dia local por `strftime(..., 'localtime')` sobre `DateTime` guardado como texto ISO em UTC, dias vazios em zero, e O4 `primeirosPassos` que nunca devolve a chave do OpenRouter (só booleanos); SQL cru parametrizado

### LEITURA RÁPIDA — conferir intenção, não implementação

- `README.md` — L2 documentação: seção nova "Conversas e painel inicial"; leia por intenção (o que o usuário vê e o que fica para a FT-10)
- `docs/projeto/MAPA.md` — L2 estado do projeto: FT-09 entregue, contadores e painel
- `docs/projeto/PREMISSAS.md` — L2 decisões tomadas em nome do humano: PR-78 a PR-85 (leia o campo "O que invalida") e PR-18, PR-25 e PR-27 passam a realizadas também na FT-09
- `docs/projeto/PROJETO.md` — L2 contador `features_entregues` 9
- `docs/projeto/RECURSAO.md` — L2 acrescenta a FT-09 à PEND-07 (verificação em celular real), sem pendência nova
- `docs/stack/CONVENCOES.md` — L2 documentação das convenções novas com `arquivo:linha` (conferidas por `tests/projeto.test.ts`)
- `docs/stack/LACUNAS.md` — L2 documentação: lacunas 22 a 27
- `prisma/seed.ts` — L2 acrescenta duas conversas fictícias com id fixo, só se não existem; o guarda de produção não foi tocado e `tests/seed-conversas.test.ts` prova a recusa e a idempotência; sem dado real
- `src/app/(sistema)/(painel)/loading.tsx` — L3 arquivo novo; esqueleto de carregamento do painel
- `src/app/(sistema)/conversas/(lista)/loading.tsx` — L3 arquivo novo; esqueleto de carregamento
- `src/app/(sistema)/conversas/[id]/loading.tsx` — L3 arquivo novo; esqueleto de carregamento
- `src/app/(sistema)/conversas/[id]/not-found.tsx` — L3 arquivo novo; estado de conversa inexistente, 404 provado em `tests/conversas-detalhe-rota.test.ts`
- `src/componentes/BadgeDeCanal.tsx` — L3 arquivo novo; texto do canal e classe por token
- `src/componentes/CartoesDoPainel.tsx` — L3 arquivo novo; números vindos de `painel.ts`
- `src/componentes/ConversasRecentes.tsx` — L3 arquivo novo; prévia de conversa só como texto de React, provado em `tests/painel-ui.test.tsx`
- `src/componentes/FiltrosDeConversas.tsx` — L3 arquivo novo; formulário GET sem JavaScript; valores vêm da URL e do React
- `src/componentes/GraficoDeMensagens.tsx` — L3 arquivo novo; SVG acessível e tabela equivalente, `tests/grafico-de-mensagens.test.tsx`
- `src/componentes/ListaDeConversas.tsx` — L3 arquivo novo com os dois testes verdes; exibe rótulo e prévia (texto de terceiros) só como texto de React, provado com `<script>` em `tests/conversas-lista-ui.test.tsx`
- `src/componentes/PrimeirosPassos.tsx` — L3 arquivo novo; esconde o link das Integrações do usuário comum (não é controle de acesso: a página das Integrações confere o papel no servidor)
- `src/componentes/apagar-conversas.ts` — L3 arquivo novo; só monta o `fetch` das exclusões (o `fetch` é injetável); a exclusão em si é decidida no servidor
- `src/componentes/conversas-logica.ts` — L3 arquivo novo; filtros da URL, links, reducer do lote em módulo puro, `tests/conversas-logica.test.ts`
- `src/componentes/itens-de-menu.ts` — L2 camada isolada com cobertura existente: acrescenta o item Conversas; `tests/menu.test.ts` lê a lista real
- `src/componentes/painel-logica.ts` — L3 arquivo novo; escala das barras e descrição em módulo puro, `tests/painel-logica.test.ts`
- `src/estilos/global.css` — L2 camada isolada: seções novas e delimitadas das conversas e do painel; `tests/conversas-lista-estilos.test.ts` e `tests/grafico-de-mensagens.test.tsx` leem o CSS real e `tests/tokens.test.ts` varre cor literal; o layout visual só foi visto no navegador (`VERIFICACAO-VISUAL.md`)
- `src/estilos/tokens.css` — L2 camada isolada com cobertura: tokens novos nos três blocos de tema; `tests/tokens-historico.test.ts` e `tests/tokens.test.ts` conferem existência, blocos escuros idênticos e contraste
- `tests/apoio/contador-de-consultas.ts` — L3 arquivo novo de apoio de teste; conta consultas pelo log do Prisma e é a prova do "sem N+1"
- `tests/apoio/historico.ts` — L3 arquivo novo de apoio de teste; fixtures de conversa dos três canais
- `tests/menu.test.ts` — L2 altera uma asserção existente de propósito (o grupo sem título passa a ter Conversas) e acrescenta casos
- `tests/rotas.test.ts` — L2 altera asserções existentes de propósito (o painel deixa de mostrar "Ainda não há o que mostrar"): confira que a asserção nova é o comportamento pretendido; também acrescenta `/conversas` à lista de rotas protegidas

### DISPENSÁVEL — a máquina já provou

- `docs/entregas/historico-de-conversas/ENTREGA.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/00-AUDITORIA.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/00-BLOQUEIOS.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/00-DECISOES.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/BRIEFING-BUILDX.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/FECHAMENTO.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/ORQUESTRADOR.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/RELATORIO-FEATURE.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/VERIFICACAO-VISUAL.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/base/00-INDICE.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/base/00-LACUNAS.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/base/canais-e-rotulos.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/base/conversas-e-modelo.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/base/painel-e-agregacao.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/base/seed-testes-e-ci.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/base/telas-menu-e-componentes.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-01/fases.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-01/sprint.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-01/tasks.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-02/fases.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-02/sprint.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-02/tasks.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-03/fases.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-03/sprint.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-03/tasks.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-04/fases.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-04/sprint.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-04/tasks.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-05/fases.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-05/sprint.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-05/tasks.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-06/fases.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-06/sprint.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/historico-de-conversas/sprint-06/tasks.md` — D3 (estendido): artefato do método da própria feature, não é código
- `src/app/(sistema)/page.tsx` — D2 movimentação coberta por teste verde: a página inicial foi movida para `(sistema)/(painel)/page.tsx` (o conteúdo novo está em OLHO OBRIGATÓRIO) e `tests/rotas.test.ts` cobre a rota `/`
- `tests/contador-de-consultas.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-apagar-rota.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-detalhe-rota.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-detalhe-ui.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-exportar-rota.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-lista-estilos.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-lista-ui.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-logica.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/conversas-lote-ui.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/grafico-de-mensagens.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/historico-apagar.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/historico-apoio.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/historico-consultas.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/historico-listar.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/historico-logica.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/historico-obter.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/historico-texto.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/painel-logica.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/painel-numeros.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/painel-passos.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/painel-serie.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/painel-ui.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/projeto.test.ts` — D1 só acrescenta casos (convenções, lacunas e README da FT-09); nenhuma asserção existente mudou
- `tests/seed-conversas.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/sqlite-formatos.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `tests/tokens-historico.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251)
- `docs/entregas/historico-de-conversas/ATENCAO.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/entregas/historico-de-conversas/PR.md` — D3 (estendido): artefato do método da própria feature, não é código
- `docs/entregas/historico-de-conversas/QA-PACOTE.md` — D3 (estendido): artefato do método da própria feature, não é código

## Fora de escopo

Retenção automática, exclusão de usuário, aviso de privacidade e auditoria persistida (FT-10: aqui só existe o ponto de extensão `aoApagarConversa`); contêiner, backup e saúde (FT-11); busca semântica ou FTS de conversas; exclusão por visitante ou chat; transferência para atendente humano; novos canais; edição de conversa (`docs/historico-de-conversas/BRIEFING-BUILDX.md`).
