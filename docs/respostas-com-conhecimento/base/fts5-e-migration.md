# FTS5 do SQLite, Prisma e migration

## Contrato de entrada

- SQLite embutido no `better-sqlite3` 12.11.1 reporta `sqlite_version()` 3.53.2 (conferido em 2026-09-30 executando `node -e` contra `:memory:`); FTS5 está compilado: `CREATE VIRTUAL TABLE ... USING fts5(texto, content='t', content_rowid='rowid', tokenize='unicode61 remove_diacritics 2')` foi criada sem erro nessa verificação.
- Conteúdo externo: a tabela FTS guarda só o índice; o texto vem da tabela `trechos` pelo `rowid`. `trechos.id` é `TEXT PRIMARY KEY` (`prisma/migrations/20260930180000_fontes/migration.sql`), então o `rowid` é o implícito do SQLite.
- Sincronização: gatilhos `AFTER INSERT`, `AFTER DELETE` e `AFTER UPDATE` em `trechos`; na verificação local, o gatilho de insert e a consulta `MATCH '"troca" OR "devolucao"'` devolveram a linha para o texto "Política de TROCA e devolução" (sem acento e sem caixa); `MATCH '"polit"*'` (prefixo) também.
- `MATCH` recebe uma expressão da sintaxe de consulta do FTS5; `bm25(tabela)` devolve número negativo (menor = mais relevante) — o valor observado para um único documento foi `-0.000002375`.
- Prisma: `prisma.$queryRaw` com template tagueado parametriza valores (`src/lib/prisma.ts` já usa o adaptador `better-sqlite3`). `prisma migrate deploy` (usado por `tests/setup.ts:27` e por `npm run setup`, `package.json:15`) executa o SQL do arquivo de migration.

## Contrato de saída

- Uma consulta `SELECT t.id, t.texto, t.indice, f.titulo, bm25(trechos_fts) FROM trechos_fts JOIN trechos ... WHERE trechos_fts MATCH ? AND t.agenteId = ? AND f.status = 'pronto' ORDER BY bm25 LIMIT n` é a forma pretendida; a escrita exata é decisão da F3.
- `INSERT INTO trechos_fts(trechos_fts) VALUES('rebuild')` reconstrói o índice a partir de `trechos`.

## Limites e cotas

- Tamanho máximo de consulta FTS5 e de número de termos: `NÃO DOCUMENTADO` no que foi lido; a FT-05 limita os termos que envia.
- Desempenho com ~5.000 trechos: a ser medido pelo teste de sanidade da FT-05; sem número prévio documentado.

## Erros conhecidos e tratamento

- Expressão `MATCH` inválida (aspas soltas, operador solto, `NEAR`, `:`, `*` no lugar errado) lança erro de sintaxe do FTS5; por isso o texto do usuário nunca vai direto ao `MATCH` (brief, item 2; PR-13: "consulta sempre parametrizada").
- `prisma db push` apaga tabelas virtuais FTS5 (`docs/stack/CONVENCOES.md` seção 4, "Regra do `setup`"; PR-30); por isso o projeto usa só `migrate deploy`.

## Riscos para a nossa implementação

- `prisma migrate dev` pode estranhar a tabela virtual e suas tabelas de sombra (`trechos_fts_data`, `_idx`, `_content`, `_docsize`, `_config`) na detecção de divergência: `NÃO DOCUMENTADO` no repositório; a mitigação é escrever a migration à mão com `--create-only`/pasta manual e confirmar com `migrate deploy` do zero e `migrate status`.
- `rowid` de tabela sem chave `INTEGER PRIMARY KEY` pode ser renumerado por `VACUUM`: `NÃO VERIFICADO` aqui; é risco do conteúdo externo (o índice aponta para `rowid`) e deve virar premissa com `rebuild` como remédio (a FT-11 faz backup e precisa saber).
- A regra `tests/migracoes.test.ts` recusa linha com `DROP TABLE`/`DROP COLUMN` sem a marca `-- destrutiva-autorizada`; a migration nova não pode conter essas palavras.
- Cascata: a exclusão de fonte e de agente apaga trechos por `ON DELETE CASCADE`; se os gatilhos de `DELETE` disparam nas linhas apagadas por cascata de chave estrangeira é comportamento do SQLite que deve ser provado por teste (brief, item 1), não assumido.
- `limparBanco` (`tests/ajuda.ts:39`) apaga trechos por `deleteMany`; se os gatilhos funcionam, o índice fica limpo junto.

## Fonte

`prisma/migrations/20260930180000_fontes/migration.sql`, `prisma/schema.prisma`, `tests/setup.ts`, `tests/migracoes.test.ts`, `docs/stack/CONVENCOES.md`, `docs/projeto/PREMISSAS.md` (PR-04, PR-13, PR-30), verificação com `better-sqlite3` em memória — acessados em 2026-09-30.
