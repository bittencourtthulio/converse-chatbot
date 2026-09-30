# Banco, migrations e isolamento de teste

## Contrato de entrada

`prisma/schema.prisma` tem `Usuario`, `ConfiguracaoDoWorkspace` e `Agente` (`@@map("agentes")`, id `cuid()`, `criadoPorId` com `ON DELETE RESTRICT`). Três migrations em `prisma/migrations/` (a última, `20260930150122_agentes/migration.sql`, só cria tabela). Client gerado em `src/gerado/prisma` (ignorado pelo git, `.gitignore`), acesso por `src/lib/prisma.ts`.

## Contrato de saída

`tests/setup.ts:22-37` aplica `prisma migrate deploy` num arquivo SQLite por arquivo de teste. `limparBanco` (`tests/ajuda.ts:39-43`) apaga `agente`, `configuracaoDoWorkspace` e `usuario` nessa ordem; tabelas novas com chave para `agentes` precisam ser apagadas antes ou depender de cascata. `tests/migracoes.test.ts:14-40` lê o SQL de todas as migrations e barra `DROP TABLE`/`DROP COLUMN` sem `-- destrutiva-autorizada`.

## Limites e cotas

SQLite com um processo escritor (PR-30). `foreign_keys`: `NÃO DOCUMENTADO` se o adaptador better-sqlite3 do Prisma 7 as liga por padrão; a migration de `agentes` declara a FK, e cascata (`ON DELETE CASCADE`) precisa ser provada por teste (excluir agente e contar conversas).

## Erros conhecidos e tratamento

`db push` é proibido (`docs/stack/CONVENCOES.md`, seção 4). Migração nova em desenvolvimento: `prisma migrate dev --name <nome>` contra `DATABASE_URL` local. A exclusão do agente hoje usa `deleteMany` (`src/servicos/agentes.ts`, função `excluir`) e o texto da tela diz "Apaga o agente e as configurações dele" (`src/app/(sistema)/agentes/[id]/page.tsx`): com conversas, precisa dizer que apaga as conversas também.

## Riscos para a nossa implementação

- Cascata do agente para conversa e de conversa para mensagem: sem `PRAGMA foreign_keys=ON` a cascata não ocorre; testar de verdade.
- `Conversa.atualizadoEm` precisa ser tocado a cada mensagem (índice `agenteId, atualizadoEm` ordena a "última conversa").
- `criadoPorId` de `Conversa` é opcional e sem exclusão de usuário hoje (FT-10 decidirá): usar `SetNull`.

## Fonte

`prisma/schema.prisma`, `prisma/migrations/`, `tests/setup.ts`, `tests/ajuda.ts`, `tests/migracoes.test.ts`, `src/servicos/agentes.ts` — acessados em 2026-09-30.
