-- Busca textual da base de conhecimento (FT-05, PR-04, PR-30, PR-50).
--
-- SQL cru escrito à mão: o Prisma não modela tabela virtual. `db push` é
-- proibido porque apaga tabelas FTS5; este arquivo só é aplicado por
-- `prisma migrate deploy`. A migration só acrescenta.
--
-- Conteúdo externo: `trechos_fts` guarda só o índice e lê o texto de `trechos`
-- pelo rowid implícito (trechos.id é texto, então o rowid não é a chave).
-- Tokenizer `unicode61 remove_diacritics 2`: a busca ignora caixa e acento.
CREATE VIRTUAL TABLE "trechos_fts" USING fts5(
    "texto",
    content='trechos',
    content_rowid='rowid',
    tokenize='unicode61 remove_diacritics 2'
);

-- Os gatilhos mantêm o índice em dia para qualquer escrita em `trechos`, inclusive
-- a da seed e a da fila (createMany) e a cascata de exclusão de fonte e de agente.
CREATE TRIGGER "trechos_fts_ai" AFTER INSERT ON "trechos" BEGIN
    INSERT INTO "trechos_fts"(rowid, "texto") VALUES (new.rowid, new."texto");
END;

CREATE TRIGGER "trechos_fts_ad" AFTER DELETE ON "trechos" BEGIN
    INSERT INTO "trechos_fts"("trechos_fts", rowid, "texto") VALUES ('delete', old.rowid, old."texto");
END;

CREATE TRIGGER "trechos_fts_au" AFTER UPDATE OF "texto" ON "trechos" BEGIN
    INSERT INTO "trechos_fts"("trechos_fts", rowid, "texto") VALUES ('delete', old.rowid, old."texto");
    INSERT INTO "trechos_fts"(rowid, "texto") VALUES (new.rowid, new."texto");
END;

-- Preenchimento inicial: os trechos que já existiam antes desta migration.
INSERT INTO "trechos_fts"("trechos_fts") VALUES ('rebuild');
