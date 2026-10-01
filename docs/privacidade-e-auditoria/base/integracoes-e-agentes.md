# Chave do OpenRouter, modelo de transcrição e exclusão de agente

## Contrato de entrada

`salvarChaveDoOpenrouter(autor, {chave})` e `removerChaveDoOpenrouter(autor)` gravam por `upsert` em `ConfiguracaoDoWorkspace` com `atualizadoPor` (`src/servicos/integracoes.ts:92-129`). `salvarModeloDeTranscricao(autor, {modelo})` (`src/servicos/integracoes.ts:216-228`). `excluir(autor, id)` de agente usa `deleteMany` e depois apaga o diretório de arquivos (`src/servicos/agentes.ts:149-160`).

## Contrato de saída

`EstadoDoOpenrouter` só com máscara (`src/servicos/integracoes.ts:15-22`). A chave e a máscara nunca devem ir à auditoria (briefing item 1).

## Limites e cotas

Chave: 10 a 300 caracteres, sem espaços (`src/servicos/integracoes.ts:28-37`). Modelo: até 100 caracteres (`src/servicos/integracoes.ts:187-194`).

## Erros conhecidos e tratamento

`mensagemSemSegredo` em `src/app/acoes.ts:36-41` impede vazamento de chave em erro inesperado. Exclusão de agente com conversas apaga em cascata `conversas`, `fontes`, `trechos`, `canal` e `config do chat` (`prisma/schema.prisma:74-92,201-217`).

## Riscos para a nossa implementação

`agente_excluido` precisa registrar o nome do agente antes do `deleteMany` (depois, o nome se perdeu); `excluir` não é transacional. Gravar auditoria na mesma transação que a ação obriga a mover o `upsert` e o `deleteMany` para `prisma.$transaction`.

## Fonte

`src/servicos/integracoes.ts`, `src/servicos/agentes.ts`, `src/app/acoes.ts` — acessado em 2026-10-01
