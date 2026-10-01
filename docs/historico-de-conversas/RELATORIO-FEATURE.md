---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-09
trabalho_id: historico-de-conversas
status: entregue
sprints: 6
tasks: 24
testes_suite: 2251
data: 2026-10-01
---

# Relatório da FT-09 — Histórico de conversas e painel

Branch `feat/historico-de-conversas`, a partir de `feat/conhecimento-em-video` (PRs empilhados). Realiza a parte de apagar conversa do PR-18; a retenção automática, a exclusão de usuário e o aviso de privacidade são da FT-10. PR local: descrição em `docs/entregas/historico-de-conversas/PR.md`, pacote de QA em `docs/entregas/historico-de-conversas/QA-PACOTE.md`.

## O que foi entregue

- `src/servicos/historico.ts`: `listarConversas` (filtros por agente, canal, texto e período; 25 por página, máximo 100; duas consultas SQL parametrizadas, sem N+1, provado por contador de consultas), `obterConversa` (mensagens em ordem e fontes por `lerFontesGravadas`), `exportarConversaTexto`, `apagarConversa` e `apagarConversas` (até 50, transação, cascata, só o que existe) e o ponto de extensão `aoApagarConversa`. Lógica pura em `src/servicos/historico-logica.ts`: rótulo mascarado (PR-78), prévia sem markdown, `escaparLike` (PR-79), validação dos filtros.
- Rotas finas: `DELETE /api/conversas/[id]`, `POST /api/conversas/apagar` e `GET /api/conversas/[id]/exportar` (`text/plain`, anexo `conversa-<id>.txt`, `no-store`); 401, 404 e 422.
- Telas: item **Conversas** no menu abaixo de Agentes; `/conversas` com filtros na URL, badges de canal, paginação, seleção, **Apagar selecionadas** com confirmação na tela e tabela que vira cartões abaixo de 768 px; `/conversas/[id]` com a transcrição em bolhas (`TextoDoModelo`, nunca `dangerouslySetInnerHTML`), horários, fontes de cada resposta (componente da FT-05), metadados, Exportar e Apagar.
- Painel inicial (`src/servicos/painel.ts`): números dos últimos 7 dias com quebra por canal, gráfico SVG de 14 dias com tabela equivalente, conversas recentes, alerta de fontes com erro e primeiros passos que somem sozinhos; título e subtítulo mantidos.
- Seed: duas conversas fictícias (painel e widget) no agente de exemplo, com fontes que citam a fonte de exemplo; a seed continua recusando produção.
- Tokens `--canal-*` e `--grafico-*` (claro e escuro, com contraste testado); premissas PR-78 a PR-85; convenções e lacunas com `arquivo:linha`.

## Como demonstrar

`npm run setup`, `npm run build`, `npm run start`, entrar com as contas de demonstração e seguir `docs/entregas/historico-de-conversas/QA-PACOTE.md`. Para gerar conversas dos três canais sem serviços reais: OpenRouter simulado (`npx tsx tests/apoio/servir-falso.ts`), Telegram simulado (`npx tsx tests/apoio/servir-telegram-falso.ts`) e a página `/embed/<agente>` (ou o site de teste `tests/apoio/servir-site-de-teste.ts`).

## O que a próxima feature precisa saber

- **Pontos de extensão da auditoria (FT-10).** `aoApagarConversa(ouvinte: (apagada: ConversaApagada) => void): () => void` em `src/servicos/historico.ts`, com `ConversaApagada = { conversaId, agenteId, canal, usuarioId, quantidadeDeMensagens }`, chamado uma vez por conversa depois de confirmada a exclusão; nunca o texto nem o `identificadorExterno`; ouvinte que lança não derruba a exclusão. `aoAlterarCanal(ouvinte: (alteracao: AlteracaoDoCanal) => void): () => void` em `src/servicos/canal-telegram.ts`, com `AlteracaoDoCanal = { acao: 'conectar' | 'desconectar' | 'pausar' | 'retomar' | 'limite', agenteId, usuarioId }`. Os dois devolvem a função que remove o ouvinte; registre-os na inicialização da auditoria. As funções de apagar recebem `usuarioId` da sessão: `apagarConversa(id, usuarioId)` e `apagarConversas(ids, usuarioId)`.
- **Dados pessoais por canal e como apagar por visitante ou chat.** `widget`: `Conversa.identificadorExterno` é o `visitanteId` (16 a 64 caracteres, opaco, no `localStorage` do visitante), `criadoPorId` nulo; `telegram`: `identificadorExterno` é o id numérico do chat e o nome público está no `titulo` ("Telegram: Nome"); `painel`: `criadoPorId` é o usuário. Em todos, o texto livre de `Mensagem.conteudo` e `Mensagem.fontes` (com `trechoTexto`) pode ter dado pessoal. A exclusão desta feature é **por conversa**; a FT-10 precisa de exclusão por `identificadorExterno` (e `canal`): `prisma.conversa.deleteMany({ where: { canal, identificadorExterno } })` apaga as mensagens em cascata, e deve avisar o ouvinte da mesma forma. A interface mostra só o rótulo mascarado (`rotuloDoInterlocutor`); a retenção por dias pode reutilizar o filtro de data de `Conversa.atualizadoEm`.
- **Consultas do painel que a FT-11 deve considerar** (backup e saúde): `numerosDoPainel` (uma agregação em `mensagens` JOIN `conversas` por `criadoEm` dos últimos 7 dias, mais `COUNT` de agentes e `GROUP BY status` de fontes), `serieDeMensagens` (`strftime('%Y-%m-%d', criadoEm, 'localtime')` dos últimos 14 dias) e `listarConversas` (duas consultas; com texto, `LIKE` sobre `Mensagem.conteudo` sem índice, limitado a 200 conversas casadas). Não há índice em `mensagens(criadoEm)`; com volume alto a varredura cresce. O `DateTime` fica como texto ISO em UTC e o dia do painel segue o `TZ` do processo: o contêiner precisa fixar `TZ`. Nenhuma tabela, migration nem variável de ambiente nova.
- Módulos novos: `src/servicos/historico.ts`, `src/servicos/historico-logica.ts`, `src/servicos/painel.ts`, `src/app/api/conversas/`, `src/app/(sistema)/conversas/`, `src/app/(sistema)/(painel)/`, `src/componentes/` (`ListaDeConversas`, `ListaComSelecao`, `FiltrosDeConversas`, `BadgeDeCanal`, `TranscricaoDaConversa`, `AcoesDaConversa`, `CartoesDoPainel`, `PrimeirosPassos`, `ConversasRecentes`, `GraficoDeMensagens`, `conversas-logica.ts`, `painel-logica.ts`, `apagar-conversas.ts`), `tests/apoio/historico.ts` (fixtures de conversa) e `tests/apoio/contador-de-consultas.ts` (conta consultas: `vi.mock('@/lib/prisma')` com `criarClienteContador`).
- Nenhuma variável de ambiente nova, nenhuma dependência nova.

## Desvios do plano

- Arquivos além da lista das tasks, declarados nelas no momento em que surgiram: `src/app/api/conversas/resposta.ts` (T-03.01); a página da lista em `conversas/(lista)/` em vez de `conversas/` (T-04.02, para o `loading.tsx` não envolver o `[id]`); `page.tsx` da lista passando a usar `ListaComSelecao` (T-04.03); `layout.tsx` e `carregar-conversa.ts` do detalhe e `tests/conversas-detalhe-rota.test.ts` (T-04.04, para o 404 sair antes do `loading.tsx`); a página do painel movida para `(sistema)/(painel)/` com o `loading.tsx` (T-05.04, pelo mesmo motivo); `src/servicos/historico-logica.ts` e `tests/historico-logica.test.ts` (T-06.02, achado da verificação: a prévia mostrava markdown cru).
- O formato do `DateTime` no SQLite era texto ISO em UTC, não inteiro: a T-01.03 o provou antes do `strftime` do painel.
- A verificação no navegador usou um Chrome sem janela por CDP porque a extensão do Chrome não conectou; o `widget.js` num site de terceiro não foi repetido (a página `/embed` foi usada), e os 375 px são emulados (PEND-07).
- A T-06.03 escreveu a documentação e o teste de `tests/projeto.test.ts` no mesmo passo; nas demais tasks de código o teste foi escrito antes e rodou vermelho primeiro.
- Os testes de rota usam o `.next` do último `npm run build`; a rodada final foi depois de um build novo.

## Premissas e pendências

Novas: PR-78 (rótulo mascarado), PR-79 (busca por LIKE limitada), PR-80 (apagar em lote e ponto de extensão), PR-81 (painel, números, gráfico e fuso), PR-82 (primeiros passos), PR-83 (exportação e contrato HTTP), PR-84 (conversas da seed), PR-85 (tokens de canal e de série). PR-18 passa a realizada também na FT-09 (apagar conversa). Sem pendência nova; a PEND-07 ganhou as telas da FT-09. Limites conhecidos em `docs/stack/LACUNAS.md` (22 a 27).

## Verificação

2251 testes na suíte inteira (241 novos); `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Verificação no navegador em `docs/historico-de-conversas/VERIFICACAO-VISUAL.md`: três canais, filtros, detalhe com fontes, exportar, apagar uma e em lote, painel, tema escuro e 375 px sem rolagem lateral vistos; celular real, leitor de tela e o `widget.js` não.
