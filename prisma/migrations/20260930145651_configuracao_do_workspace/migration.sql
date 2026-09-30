-- CreateTable
CREATE TABLE "configuracao_do_workspace" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'unica',
    "openrouterChaveCifrada" TEXT,
    "atualizadoEm" DATETIME NOT NULL,
    "atualizadoPor" TEXT
);
