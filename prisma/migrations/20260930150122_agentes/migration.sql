-- CreateTable
CREATE TABLE "agentes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "instrucoes" TEXT NOT NULL DEFAULT '',
    "modelo" TEXT NOT NULL,
    "temperatura" REAL NOT NULL DEFAULT 0.7,
    "mensagemInicial" TEXT NOT NULL DEFAULT '',
    "criadoPorId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "agentes_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
