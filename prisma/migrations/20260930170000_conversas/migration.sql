-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agenteId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "identificadorExterno" TEXT,
    "titulo" TEXT,
    "criadoPorId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "conversas_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversas_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversaId" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "modelo" TEXT,
    "tokensEntrada" INTEGER,
    "tokensSaida" INTEGER,
    "fontes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mensagens_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "conversas_agenteId_atualizadoEm_idx" ON "conversas"("agenteId", "atualizadoEm");

-- CreateIndex
CREATE INDEX "mensagens_conversaId_criadoEm_idx" ON "mensagens"("conversaId", "criadoEm");

