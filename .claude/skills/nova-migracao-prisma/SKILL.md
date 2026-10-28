---
name: nova-migracao-prisma
description: Use ao criar tabela, coluna, índice ou gatilho no banco deste projeto (SQLite + Prisma 7 + FTS5), ao escrever migration à mão ou ao mexer em `prisma/schema.prisma`. Não use para mudar regra de negócio nem para consultar dados.
---

# Nova migração Prisma (SQLite + FTS5)

## Quando usar
- Mudança em `prisma/schema.prisma` que precisa de migration.
- Migration escrita à mão (gatilho, tabela virtual, índice especial).

## Quando NÃO usar
- Consulta ou regra nova que não muda o esquema (agente `servicos`).
- Qualquer coisa que apague tabela ou coluna: pare e peça autorização ao usuário (ver passo 5).

## Procedimento
1. **Teste primeiro.** Escreva/estenda o teste que exige o novo esquema (`tests/<assunto>.test.ts`, banco `prisma/test.db` por arquivo). Veja-o falhar.
2. **Edite `prisma/schema.prisma`.** Só acrescente. Modelos e campos em português, como os existentes.
3. **Crie a pasta** `prisma/migrations/AAAAMMDDHHMMSS_<nome>/migration.sql` com data posterior à última (`ls prisma/migrations`). Escreva o SQL à mão; **não use `prisma migrate dev`** (não foi verificado com a tabela virtual FTS5) **nem `db push`** (apaga o FTS5).
4. **Aplique** com `npm run db:migrate` (`migrate deploy`) e gere o client com `npx prisma generate`. Nunca edite `src/gerado/`.
5. **Se tocar `trechos`:** os gatilhos do `trechos_fts` precisam continuar valendo; rode `tests/indice-fts5.test.ts` e, se renumerou `rowid`, chame `reconstruirIndiceDeTrechos()`.
6. **Se for destrutiva** (`DROP TABLE`/`DROP COLUMN`): exige a marca `-- destrutiva-autorizada` na migration **e** autorização explícita do usuário **e** backup antes (`npm run backup`). Sem os três, não faça.
7. **Verifique:** `npx tsc --noEmit` e `npx vitest run tests/migracoes.test.ts tests/indice-fts5.test.ts tests/recuperacao.test.ts` mais o teste do passo 1. Cole a saída.

## Red flags
- ✅ Migration só cria; teste do passo 1 passa; `migrate status` limpo.
- 🚩 `ALTER`/`DROP` sem marca; migration antiga editada; `db push` no histórico do comando; SQL com texto concatenado.
- 🚩 Coluna `NOT NULL` sem `DEFAULT` numa tabela que já tem linhas.

## Exemplo
Entrada: "guardar o idioma do agente".
Saída: teste em `tests/agentes.test.ts` → `idioma String @default("pt-BR")` no schema → `prisma/migrations/20261029120000_idioma_do_agente/migration.sql` com `ALTER TABLE "agentes" ADD COLUMN "idioma" TEXT NOT NULL DEFAULT 'pt-BR';` → `npm run db:migrate` → verificação do passo 7.

## Checklist final
- [ ] Teste escrito antes e verde agora
- [ ] Migration só acrescenta (ou tem marca + autorização + backup)
- [ ] `migrate deploy`, nunca `dev`/`db push`
- [ ] FTS5 intacto se `trechos` mudou
- [ ] Saída real de tsc e vitest colada
