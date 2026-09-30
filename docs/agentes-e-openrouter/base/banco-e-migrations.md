# Banco, migrations e testes

## Contrato de entrada

`prisma/schema.prisma` tem um modelo, `Usuario` (`@@map("usuarios")`, id `cuid()`, `papel` texto `admin|usuario`, datas `criadoEm`/`atualizadoEm`). Uma migration: `prisma/migrations/20260830193658_esquema_inicial/migration.sql`. Client gerado em `src/gerado/prisma` (não versionado, `.gitignore`); acesso por `src/lib/prisma.ts` com adaptador better-sqlite3.

## Contrato de saída

`tests/setup.ts:22-37` recria um banco SQLite por arquivo de teste com `prisma migrate deploy` (as mesmas migrations de produção). `tests/ajuda.ts:10-40`: `criarUsuario`, `criarAdmin`, `limparBanco` (só apaga `usuario`: tabelas novas precisam entrar em `limparBanco`). `fileParallelism: false` (`vitest.config.ts:14`).

## Limites e cotas

Timeouts: teste 30 s, hook 180 s (`vitest.config.ts:9-10`). SQLite: escrita de um processo (PR-30).

## Erros conhecidos e tratamento

`db push` apaga tabelas FTS5 e é proibido (`docs/stack/CONVENCOES.md`, seção 4). Migração só acrescenta; o Prisma não gera reversão. Migração nova em desenvolvimento: `prisma migrate dev` (cria o SQL e aplica no banco de desenvolvimento; exige `DATABASE_URL`).

## Riscos para a nossa implementação

- Tabela singleton em SQLite: precisa de chave fixa (`id = "unica"`) e `upsert`; sem isso duas linhas quebram a leitura.
- `Agente.criadoPorId` referencia `Usuario`; a exclusão de usuário é só desativação hoje (`src/servicos/usuarios.ts`), sem cascata; a FT-10 fará exclusão definitiva e decidirá o destino dos agentes.
- Teste que lê SQL de migrations (lacuna 9) precisa achar `prisma/migrations/*/migration.sql` e aceitar a migration inicial (que cria tabelas, sem `DROP`).

## Fonte

`prisma/schema.prisma`, `prisma/migrations/`, `tests/setup.ts`, `tests/ajuda.ts`, `vitest.config.ts`, `docs/stack/CONVENCOES.md` — acessados em 2026-09-30.
