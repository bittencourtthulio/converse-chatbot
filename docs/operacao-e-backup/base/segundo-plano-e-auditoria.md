# Segundo plano, auditoria e pontos de contato

## Contrato de entrada

Fila de fontes: `Fila` tem `processarUma`, `processarPendentes`, `retomar`, `iniciar`, `acordar` e `ocioso` e não tem `parar` (`src/servicos/fontes-fila.ts:40-53`); `obterFila()` guarda o singleton em `globalThis` (`src/servicos/fontes-fila.ts:321`). A situação das fontes está em `Fonte.status` (`pendente`, `processando`, `pronto`, `erro`; a tela de Conhecimento e o painel já agregam por `GROUP BY status`, `src/servicos/painel.ts`). Agendador do expurgo: `AgendadorDoExpurgo` com `iniciar`, `parar`, `ativo` e `ocioso` (`src/servicos/expurgo.ts:135-190`), singleton por `obterAgendadorDoExpurgo()` (`src/servicos/expurgo.ts:192`); a última execução não é guardada em memória, mas cada rodada que apaga algo grava a ação `expurgo_automatico` na auditoria (`src/servicos/expurgo.ts:63`, `src/servicos/auditoria-acoes.ts:10-29`). Auditoria: `registrar(evento, cliente?)` (`src/servicos/auditoria.ts:101`), `registrarMelhorEsforco` (`:127`), `aguardarGravacoesPendentes` (`:155`), `listar` e `purgarAnterioresA` (`:250`); o conjunto fechado `ACOES` tem 18 ações e termina em `restauracao`, que aceita as chaves `origem` e `resultado` (`src/servicos/auditoria-acoes.ts:29,57-76`). A frase e o rótulo de cada ação moram em `src/componentes/auditoria-logica.ts:8-27` e na função `descreverRegistro`; já existe a frase da restauração (`tests/auditoria-logica.test.ts:95`).

## Contrato de saída

`registrar` devolve `RegistroListado`. O ator pode ser `'sistema'` (rótulo "Sistema") ou um `UsuarioAutenticado` (`src/servicos/auditoria.ts:28-41,55-58`). Recusa detalhe que parece segredo (`PARECE_SEGREDO`, `src/servicos/auditoria-acoes.ts:79-86`) e texto acima de 200 caracteres.

## Limites e cotas

A fila usa concorrência 2 na raia leve e 1 na de mídia (`src/servicos/fontes-fila.ts:57-62`). O expurgo roda 1 minuto após a subida e a cada 6 horas (`src/servicos/expurgo.ts:18-30`). `tests/auditoria-acoes.test.ts:7-8` exige exatamente 18 ações: acrescentar `backup_gerado` muda esse teste, o filtro da tela (`OPCOES_DE_ACAO`) e `tests/auditoria-logica.test.ts`.

## Erros conhecidos e tratamento

Falha de gravação da auditoria de melhor esforço vira o log `auditoria_falhou` (`src/servicos/auditoria.ts:138-144`). Fila e expurgo só valem por processo (PR-05, lacuna 29).

## Riscos para a nossa implementação

Desligamento limpo precisa parar o agendador do expurgo, chamar `aguardarGravacoesPendentes()` e deixar a fila terminar o passo corrente: a fila não tem `parar`, então a F3 precisa acrescentar uma forma de parar de reivindicar fontes novas. Fonte deixada em `processando` volta a `pendente` no próximo start por `retomar()` (`src/instrumentation.ts:23-27`). A restauração não pode concorrer com o expurgo nem com a fila.

## Fonte

`src/servicos/fontes-fila.ts`, `src/servicos/expurgo.ts`, `src/servicos/auditoria.ts`, `src/servicos/auditoria-acoes.ts`, `src/componentes/auditoria-logica.ts`, `tests/auditoria-acoes.test.ts` — acessado em 2026-10-01
