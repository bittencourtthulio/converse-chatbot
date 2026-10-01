-- Sessão revogável e contador de versão de sessão (FT-12, PR-101, PR-103). Só acrescenta.

-- CreateTable
CREATE TABLE "sessoes_revogadas" (
    "jti" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "revogadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "sessoes_revogadas_expiraEm_idx" ON "sessoes_revogadas"("expiraEm");

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "versaoDaSessao" INTEGER NOT NULL DEFAULT 0;
