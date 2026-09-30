-- CreateTable
CREATE TABLE "configuracao_do_chat" (
    "agenteId" TEXT NOT NULL PRIMARY KEY,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "titulo" TEXT NOT NULL DEFAULT '',
    "cor" TEXT NOT NULL DEFAULT '#4f46e5',
    "posicao" TEXT NOT NULL DEFAULT 'direita',
    "avatar" TEXT NOT NULL DEFAULT 'iniciais',
    "avisoDePrivacidade" TEXT NOT NULL DEFAULT '',
    "avisoDePrivacidadeUrl" TEXT NOT NULL DEFAULT '',
    "dominiosPermitidos" TEXT NOT NULL DEFAULT '[]',
    "limiteDiario" INTEGER NOT NULL DEFAULT 500,
    "sugestoes" TEXT NOT NULL DEFAULT '[]',
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "configuracao_do_chat_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
