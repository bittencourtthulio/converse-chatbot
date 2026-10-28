---
paths:
  - "prisma/**"
  - "src/servicos/recuperacao*.ts"
  - "tests/indice-fts5*.test.ts"
---
# FTS5 e migrations

- `trechos_fts` é tabela virtual de conteúdo externo sobre `trechos`, tokenizer `unicode61 remove_diacritics 2`, com três gatilhos (insert, delete, update do texto) e `rebuild` inicial. Mora em `prisma/migrations/20260930190000_busca_fts5/migration.sql`, escrita à mão: o Prisma não a modela.
- Só `migrate deploy` a aplica. `db push` a apagaria. [[restricoes-inviolaveis]]
- O `rowid` implícito de `trechos` liga índice e conteúdo. `VACUUM` ou restauração de backup pode renumerá-lo: rode `reconstruirIndiceDeTrechos()` (`src/servicos/recuperacao.ts`).
- Consulta: `prisma.$queryRaw` parametrizado, só fontes `pronto` do agente, BM25, teto de 6 trechos. Termos limpos e entre aspas (`recuperacao-termos.ts`).
- Prisma 7 + SQLite guarda `DateTime` como texto ISO em UTC; agregação por dia depende do `TZ` do processo.
- Nova migration: pasta `AAAAMMDDHHMMSS_nome`; só acrescenta. Skill: `nova-migracao-prisma`.
