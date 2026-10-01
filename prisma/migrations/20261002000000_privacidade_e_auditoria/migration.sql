-- Privacidade e auditoria (FT-10, PR-19, PR-86, PR-89, PR-91). Só acrescenta.

-- AlterTable
ALTER TABLE "configuracao_do_workspace" ADD COLUMN "retencaoDiasConversas" INTEGER DEFAULT 90;
ALTER TABLE "configuracao_do_workspace" ADD COLUMN "avisoDePrivacidadePadrao" TEXT NOT NULL DEFAULT '';
ALTER TABLE "configuracao_do_workspace" ADD COLUMN "avisoDePrivacidadePadraoUrl" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "registros_de_auditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quando" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,
    "usuarioRotulo" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "alvoTipo" TEXT NOT NULL,
    "alvoId" TEXT,
    "detalhes" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "registros_de_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "registros_de_auditoria_quando_idx" ON "registros_de_auditoria"("quando");

-- CreateIndex
CREATE INDEX "registros_de_auditoria_acao_idx" ON "registros_de_auditoria"("acao");
