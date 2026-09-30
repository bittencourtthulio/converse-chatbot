-- CreateTable
CREATE TABLE "fontes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agenteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "nomeOriginal" TEXT,
    "tipoMime" TEXT,
    "tamanhoBytes" INTEGER NOT NULL,
    "caminhoArquivo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "mensagemErro" TEXT,
    "totalTrechos" INTEGER NOT NULL DEFAULT 0,
    "caracteres" INTEGER NOT NULL DEFAULT 0,
    "criadoPorId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "processadoEm" DATETIME,
    CONSTRAINT "fontes_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fontes_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trechos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fonteId" TEXT NOT NULL,
    "agenteId" TEXT NOT NULL,
    "indice" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "caracteres" INTEGER NOT NULL,
    CONSTRAINT "trechos_fonteId_fkey" FOREIGN KEY ("fonteId") REFERENCES "fontes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "trechos_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "fontes_agenteId_idx" ON "fontes"("agenteId");

-- CreateIndex
CREATE INDEX "trechos_fonteId_indice_idx" ON "trechos"("fonteId", "indice");

-- CreateIndex
CREATE INDEX "trechos_agenteId_idx" ON "trechos"("agenteId");

