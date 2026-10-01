# Esquema do banco e migrations

## Contrato de entrada

Modelos Prisma em `prisma/schema.prisma`. `ConfiguracaoDoWorkspace` é singleton (`id` fixo `unica`) com `openrouterChaveCifrada`, `modeloDeTranscricao`, `atualizadoEm`, `atualizadoPor` sem chave estrangeira (`prisma/schema.prisma:36-48`). `Usuario` tem `sessoesValidasDesde`, relações `agentes`, `conversas`, `fontes` (`prisma/schema.prisma:13-30`). `Agente.criadoPorId` é `String` obrigatória com relação sem `onDelete` (restritiva) (`prisma/schema.prisma:57-59`). `Conversa.criadoPorId` é opcional com `onDelete: SetNull` (`prisma/schema.prisma:84-85`); `Fonte.criadoPorId` idem (`prisma/schema.prisma:130-131`). `Conversa` tem `canal`, `identificadorExterno`, `atualizadoEm` e índice `(agenteId, atualizadoEm)` (`prisma/schema.prisma:74-92`); `Mensagem` cai em cascata com a conversa (`prisma/schema.prisma:102-103`). `AtualizacaoTelegram` tem `@@index([criadoEm])` (`prisma/schema.prisma:222`).

## Contrato de saída

Nove migrations em `prisma/migrations/` (de `20260830193658_esquema_inicial` a `20261001000000_conhecimento_em_video`). `tests/setup.ts:31-38` aplica `prisma migrate deploy` num `prisma/test.db` por arquivo de teste.

## Limites e cotas

Regra "migração só acrescenta": `DROP TABLE` e `DROP COLUMN` exigem a marca `-- destrutiva-autorizada` (`tests/migracoes.test.ts:8-9`, `docs/stack/CONVENCOES.md` seção 4). `DateTime` no SQLite é texto ISO em UTC (`docs/stack/CONVENCOES.md` seção 5, linha FT-09 PR-81).

## Erros conhecidos e tratamento

Tornar `Agente.criadoPorId` anulável no SQLite faz o Prisma recriar a tabela (`DROP TABLE`/`RENAME`), o que exigiria a marca destrutiva e arrisca as FKs de `trechos`, `fontes`, `conversas` e `configuracao_do_chat` que apontam para `agentes`. NÃO DOCUMENTADO se o Prisma 7 recria a tabela neste caso (a prova seria gerar a migration; não feita na F1).

## Riscos para a nossa implementação

Excluir um usuário com agentes falha pela FK restritiva de `Agente.criadoPorId`; a exclusão precisa tratar isso em código antes do `delete`. `atualizadoPor` não tem FK, então fica com id órfão ao excluir o usuário. Uma coluna nova em `ConfiguracaoDoWorkspace` precisa de padrão para a linha existente.

## Fonte

`prisma/schema.prisma`, `prisma/migrations/`, `tests/setup.ts`, `tests/migracoes.test.ts` — acessado em 2026-10-01
