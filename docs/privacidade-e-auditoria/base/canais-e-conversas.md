# Canais, conversas e os pontos de extensão da auditoria

## Contrato de entrada

`aoAlterarCanal(ouvinte)` com `AlteracaoDoCanal {acao: 'conectar'|'desconectar'|'pausar'|'retomar'|'limite', agenteId, usuarioId}` (`src/servicos/canal-telegram.ts:15-35`); chamado por `avisarAlteracao` ao fim de cada operação (`src/servicos/canal-telegram.ts:213,263,276,330`). `aoApagarConversa(ouvinte)` com `ConversaApagada {conversaId, agenteId, canal, usuarioId, quantidadeDeMensagens}` (`src/servicos/historico.ts:225-250`); `apagarConversas(ids, usuarioId)` apaga em transação e avisa depois (`src/servicos/historico.ts:273-295`). Os dois guardam o `Set` de ouvintes em variável de módulo (`src/servicos/canal-telegram.ts:23`, `src/servicos/historico.ts:238`).

## Contrato de saída

Ouvinte que lança não derruba a operação, só registra `console.error` (`src/servicos/canal-telegram.ts:36-44`, `src/servicos/historico.ts:246-254`).

## Limites e cotas

Lote de apagar: 50 ids (`src/servicos/historico.ts`, `LIMITE_DO_LOTE`). Identificadores: widget = `visitanteId` de 16 a 64 caracteres `[A-Za-z0-9_-]` (`src/servicos/chat-publico.ts:41-48`); telegram = id numérico do chat em texto (`src/servicos/telegram-atendimento.ts:161`), título "Telegram: Nome" (`src/servicos/telegram-atendimento.ts:84-87`). `desconectar` mantém as conversas (`src/servicos/canal-telegram.ts:253-263`).

## Erros conhecidos e tratamento

O Telegram `/start` responde `agente.mensagemInicial` ou `MENSAGEM_INICIAL_PADRAO` (`src/servicos/telegram-atendimento.ts:133-139`). Purga do dedupe do Telegram: `purgarAtualizacoes` de 7 dias já existe (`src/servicos/telegram-webhook.ts:106-114`), chamada oportunista a cada hora (`src/servicos/telegram-webhook.ts:119-123`).

## Riscos para a nossa implementação

Em `next start` a instrumentação e os handlers podem ter instâncias separadas do módulo, e o `Set` de ouvintes em variável de módulo pode não ser o mesmo; a prova é um teste contra o servidor de produção (`tests/rotas.test.ts`) (NÃO DOCUMENTADO o comportamento do Next 16 para isso neste repositório). A exclusão por titular precisa varrer `canal` + `identificadorExterno` (`docs/historico-de-conversas/RELATORIO-FEATURE.md`, seção "o que a próxima feature precisa saber"). O ouvinte `aoAlterarCanal` não leva o nome do agente: a auditoria deve buscá-lo ou gravar só o `alvoId`.

## Fonte

`src/servicos/canal-telegram.ts`, `src/servicos/historico.ts`, `src/servicos/telegram-atendimento.ts`, `src/servicos/telegram-webhook.ts`, `docs/historico-de-conversas/RELATORIO-FEATURE.md` — acessado em 2026-10-01
