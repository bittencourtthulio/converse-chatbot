# Banco, FTS5 e armazenamento de arquivos

## Contrato de entrada

SQLite em arquivo por Prisma 7.10.0 e adaptador `better-sqlite3` 12.11.1 (`package.json:20-22`, `node_modules/better-sqlite3/package.json:3`); a URL é `file:<caminho>` (`.env.example:4`, `src/lib/prisma.ts:13`). Tabelas (`@@map` de `prisma/schema.prisma`): `usuarios`, `configuracao_do_workspace`, `agentes`, `conversas`, `mensagens`, `fontes`, `trechos`, `configuracao_do_chat`, `canais_telegram`, `atualizacoes_telegram`, `registros_de_auditoria`. A tabela virtual `trechos_fts` (FTS5, conteúdo externo, `content_rowid='rowid'`) nasce na migration escrita à mão `prisma/migrations/20260930190000_busca_fts5/migration.sql:10-15`, com três gatilhos e `rebuild` inicial (`:19-34`). Dez migrations em `prisma/migrations/` (de `20260830193658_esquema_inicial` a `20261002000000_privacidade_e_auditoria`) e o histórico fica na tabela `_prisma_migrations` do próprio banco. `reconstruirIndiceDeTrechos()` roda `INSERT INTO trechos_fts(trechos_fts) VALUES ('rebuild')` (`src/servicos/recuperacao.ts:126-128`).

## Contrato de saída

Armazenamento: `criarArmazenamento(raiz)` grava `fontes/<agenteId>/<fonteId>/original` por arquivo temporário `original.parcial` e renomeação (`src/lib/armazenamento.ts:45-55`), mais as pastas temporárias `audio/` e `segmentos/NN.txt` do vídeo (`src/lib/armazenamento.ts:40-42,110-143`). A raiz é `ambiente.storageDir` (`STORAGE_DIR`, padrão `./storage`, `src/lib/ambiente.ts:88-94`). O banco de teste é `prisma/test.db`, criado por `prisma migrate deploy` e apagado ao fim (`tests/setup.ts:9,31-36`); existe `prisma/dev.db` do desenvolvedor, que nenhum teste desta feature toca.

## Limites e cotas

`VACUUM` pode renumerar o `rowid` de `trechos` (a tabela tem `id` texto, não inteiro), o que desalinha o índice externo; o remédio é `reconstruirIndiceDeTrechos()` (`docs/stack/LACUNAS.md`, lacuna 11, `docs/stack/CONVENCOES.md` seção 4). `MAX_UPLOAD_MB` 25 e `MAX_VIDEO_MB` 500 por arquivo (`src/lib/ambiente.ts:95-97,115-121`): o `storage/` pode ter muitos gigabytes. Tamanho máximo recomendado de backup: NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

A regra "a migration só acrescenta" é verificada por `tests/migracoes.test.ts:14`. `prisma migrate dev` não foi usado com a tabela virtual (lacuna 10). `db push` está proibido (apaga FTS5).

## Riscos para a nossa implementação

Copiar o arquivo `.db` cru com o servidor escrevendo pode produzir cópia inconsistente: o backup usa a API de backup online. Restaurar exige trocar banco e `storage/` juntos (`fontes.caminho` guarda caminho relativo à raiz do `storage/`). Os temporários (`audio/`, `segmentos/`, `*.parcial`) não entram no backup. A cópia do banco também leva `canais_telegram.tokenCifrado` e `configuracao_do_workspace.openrouterChaveCifrada`, que só decifram com a mesma `ENCRYPTION_KEY`.

## Fonte

`prisma/schema.prisma`, `prisma/migrations/`, `src/lib/prisma.ts`, `src/lib/armazenamento.ts`, `src/servicos/recuperacao.ts`, `docs/stack/CONVENCOES.md`, `docs/stack/LACUNAS.md`, `tests/setup.ts` — acessado em 2026-10-01
