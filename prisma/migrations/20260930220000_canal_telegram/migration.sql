-- CreateTable
CREATE TABLE "canais_telegram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agenteId" TEXT NOT NULL,
    "tokenCifrado" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "botUsername" TEXT NOT NULL,
    "botNome" TEXT NOT NULL,
    "segredoDoWebhookHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT NOT NULL,
    "conectadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoErro" TEXT,
    "ultimoErroEm" DATETIME,
    "ultimaMensagemEm" DATETIME,
    "limiteDiario" INTEGER NOT NULL DEFAULT 500,
    CONSTRAINT "canais_telegram_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "atualizacoes_telegram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "canalId" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "atualizacoes_telegram_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "canais_telegram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "canais_telegram_agenteId_key" ON "canais_telegram"("agenteId");

-- CreateIndex
CREATE UNIQUE INDEX "canais_telegram_botId_key" ON "canais_telegram"("botId");

-- CreateIndex
CREATE INDEX "atualizacoes_telegram_criadoEm_idx" ON "atualizacoes_telegram"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "atualizacoes_telegram_canalId_updateId_key" ON "atualizacoes_telegram"("canalId", "updateId");
