---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-10
trabalho_id: privacidade-e-auditoria
status: entregue
sprints: 7
tasks: 28
testes_suite: 2544
data: 2026-10-01
---

# Relatório da FT-10 — Privacidade e auditoria

Branch `feat/privacidade-e-auditoria`, a partir de `feat/historico-de-conversas` (PRs empilhados). Realiza PR-18 (retenção, exclusão de usuário, aviso de privacidade, direitos do titular) e PR-19 (auditoria). PR local: descrição em `docs/entregas/privacidade-e-auditoria/PR.md`, pacote de QA em `docs/entregas/privacidade-e-auditoria/QA-PACOTE.md`.

## O que foi entregue

- **Trilha de auditoria** (`src/servicos/auditoria.ts`, `auditoria-acoes.ts`, `auditoria-ouvintes.ts`): `RegistroDeAuditoria` somente-acréscimo com 18 ações fechadas e detalhes validados (sem segredo, texto de conversa nem identificador). Chave do OpenRouter, usuário (criar, editar, excluir) e exclusão de agente gravam na **mesma transação** da ação; o resto, de melhor esforço (erro no log, ação intacta). `aoAlterarCanal` e `aoApagarConversa` ligados por `ligarAuditoria` (idempotente, iniciada pelo `instrumentation.ts`, ouvintes em `globalThis`). Só `purgarAnterioresA` remove linhas; um teste varre `src/` para provar.
- **Exclusão definitiva de usuário** (`excluirDefinitivamente` em `src/servicos/usuarios.ts`): só admin ativo, recusa a si mesmo e o último admin; agentes passam ao admin que exclui, conversas e fontes ficam sem criador, a sessão cai; a tela exige digitar o e-mail (conferido também no servidor).
- **Retenção e expurgo** (`src/servicos/privacidade.ts`, `src/servicos/expurgo.ts`): padrão 90 dias (7 a 3650, ou "sem expurgo" explícito com aviso de risco); lotes de 500; roda 1 minuto depois da subida e a cada 6 horas; também purga o dedupe do Telegram (7 dias) e a auditoria (365 dias, `AUDITORIA_RETENCAO_DIAS`); `expurgo_automatico` só com contagens.
- **Direitos do titular** (`src/servicos/titular.ts`, `POST /api/titulares/exportar`): busca por prefixo com desambiguação, exportar (JSON e TXT) e apagar tudo; o visitante apaga a própria conversa (`DELETE /api/publico/agentes/[id]/conversa`, botão no chat embutido).
- **Aviso de privacidade padrão** do workspace (chat embutido quando o agente não tem aviso, e anexo ao `/start` do Telegram) e painel "Dados pessoais tratados" com a base legal "legítimo interesse, a confirmar pela empresa".
- **Telas** `/configuracoes/privacidade` e `/configuracoes/auditoria` (admin, guarda em `layout.tsx`, cartões em tela estreita, dois temas); itens no menu só para admin.
- Premissas PR-86 a PR-91, pendência PEND-08, convenções e lacunas com arquivo e linha, README e `tests/apoio/semear-privacidade.ts`.

## Como demonstrar

`npm run setup`, `DATABASE_URL=file:./prisma/dev.db npx tsx tests/apoio/semear-privacidade.ts`, `npm run build`, `npm run start`, entrar com a conta admin de demonstração e seguir `docs/entregas/privacidade-e-auditoria/QA-PACOTE.md`. Para conectar o Telegram sem serviço real use `npx tsx tests/apoio/servir-telegram-falso.ts`.

## O que a FT-11 precisa saber

- **Restauração.** Chame `registrar({ator, acao: 'restauracao', alvoTipo: 'sistema', detalhes: {origem, resultado}})` de `src/servicos/auditoria.ts` **depois** de restaurar (ou `registrarMelhorEsforco`); o tipo `restauracao` já existe no conjunto fechado e aceita as chaves `origem` e `resultado`. O ator é o usuário autenticado (ou `'sistema'` num comando de linha de comando). A restauração substitui o banco: o registro deve ser gravado no banco já restaurado.
- **Tabelas novas no backup:** `registros_de_auditoria` (e as colunas novas de `configuracao_do_workspace`: `retencaoDiasConversas`, `avisoDePrivacidadePadrao`, `avisoDePrivacidadePadraoUrl`). Migration `prisma/migrations/20261002000000_privacidade_e_auditoria`. Nenhum arquivo novo em `storage/`.
- **Expurgo em segundo plano.** `obterAgendadorDoExpurgo()` (`src/servicos/expurgo.ts`) roda por processo, 1 minuto depois da subida e a cada 6 horas. **Pare-o antes de restaurar** (`obterAgendadorDoExpurgo().parar()`) e inicie de novo depois (`.iniciar()`): uma rodada durante a restauração apagaria conversas de um banco que está sendo trocado, e um backup antigo restaurado seria expurgado na primeira rodada (as conversas com `atualizadoEm` anterior ao corte somem de novo). A saúde pode ler `ativo()` do agendador.
- **`TZ` e relógio.** O corte do expurgo e da auditoria é em instante UTC e não depende do `TZ`; o `TZ` só afeta o dia local do painel (FT-09) e o filtro de período da auditoria (`AAAA-MM-DD` no dia local do servidor): o contêiner precisa fixar `TZ`. Os testes injetam o relógio (`executarExpurgo({agora})`, `criarAgendadorDoExpurgo({agendar, cancelar, executar})`).
- **Variável nova:** `AUDITORIA_RETENCAO_DIAS` (padrão 365, só `src/lib/ambiente.ts:142`). A retenção das conversas não é variável: fica no banco.
- **Log:** os eventos novos são `auditoria_falhou`, `auditoria_nao_ligou`, `expurgo_falhou` e `expurgo_nao_iniciou`, sempre sem conteúdo; o log estruturado e a correlação continuam sendo da FT-11 (PR-21).
- A auditoria de melhor esforço é assíncrona: o desligamento limpo pode chamar `aguardarGravacoesPendentes()`.

## Desvios do plano

Os desvios task a task estão em `docs/privacidade-e-auditoria/FECHAMENTO.md`. Os principais:

- Arquivos além da lista das tasks, declarados nelas no momento em que surgiram: `tests/usuarios-excluir-acao.test.ts`, `tests/privacidade-acoes.test.ts`, `tests/titular-acoes.test.ts`, `src/componentes/exportar-titular.ts`, as páginas esqueleto da T-06.01 e a conferência de e-mail no serviço de exclusão.
- Citações de linha de `docs/stack/CONVENCOES.md` e `tests/projeto.test.ts` refeitas várias vezes (`ambiente.ts`, `canal-telegram.ts`, `historico.ts`, `integracoes.ts`, `chat-publico.ts`, `telegram-atendimento.ts`, `acoes.ts`) porque cada serviço tocado deslocou linhas citadas; a regra é rodar `tests/projeto.test.ts` a cada edição de serviço.
- Em vez de `esquecerVisitante`, "Apagar minha conversa" limpa só a conversa guardada daquele agente e mantém o id do visitante (pode haver conversas com outros agentes).
- A verificação no navegador achou e corrigiu três defeitos: o estouro horizontal da tela de Usuários a 375 px (regra de CSS da FT-09), o campo de dias da retenção com 18 px e o prefixo de desambiguação igual para dois visitantes.
- A extensão do Chrome não conectou; a verificação usou um Chrome sem janela por CDP. A primeira tentativa se conectou por engano a um aplicativo Electron de outro projeto na porta 9333 (registrado em `docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md`) e foi refeita do zero num Chrome próprio.
- As tasks de prova (T-07.01) e a T-01.02 não tiveram vermelho prévio.
- A suíte inteira roda ~7,5 minutos: nas tasks que só criaram arquivos de teste novos o `suite` ficou `parcial`; rodou inteira no fim de cada sprint e no fechamento.

## Premissas e pendências

Novas: PR-86 (trilha somente-acréscimo e ligação dos ouvintes), PR-87 (falha de gravação), PR-88 (exclusão de usuário), PR-89 (retenção e expurgo), PR-90 (direitos do titular), PR-91 (aviso padrão e painel de dados, `Provisória: true`). PR-18 e PR-19 passam a realizadas. Pendência nova: **PEND-08** (`decisao_humana`: confirmar a base legal e os prazos); a PEND-07 ganhou as telas da FT-10. Limites conhecidos em `docs/stack/LACUNAS.md` (28 a 33).

## Verificação

2544 testes na suíte inteira (293 novos); `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Verificação no navegador em `docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md`: cada ação aparece na tela de Auditoria, o expurgo rodou sozinho contra dados semeados com datas antigas, o titular foi exportado e apagado, o visitante apagou a própria conversa, nos dois temas e a 375 px sem rolagem lateral; celular real, leitor de tela, Telegram real e o `widget.js` em site de terceiro não foram vistos.
