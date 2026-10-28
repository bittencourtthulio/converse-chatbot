CREATE TABLE "chamadas_de_ia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iniciadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluidoEm" DATETIME,
    "funcao" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "modeloSolicitado" TEXT,
    "modelo" TEXT,
    "geracaoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'em_andamento',
    "statusHttp" INTEGER,
    "erroCodigo" TEXT,
    "tokensEntrada" INTEGER,
    "tokensSaida" INTEGER,
    "tokensTotal" INTEGER,
    "custoUsd" REAL,
    "duracaoMs" INTEGER
);
CREATE INDEX "chamadas_de_ia_iniciadoEm_id_idx" ON "chamadas_de_ia"("iniciadoEm", "id");
