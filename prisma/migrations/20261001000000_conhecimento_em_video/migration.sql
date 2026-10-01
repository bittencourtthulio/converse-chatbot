-- FT-08: campos de vídeo e YouTube em fontes e modelo de transcrição na
-- configuração do workspace. Só acrescenta colunas anuláveis.

-- AlterTable
ALTER TABLE "fontes" ADD COLUMN "progresso" INTEGER;
ALTER TABLE "fontes" ADD COLUMN "etapa" TEXT;
ALTER TABLE "fontes" ADD COLUMN "duracaoSegundos" INTEGER;
ALTER TABLE "fontes" ADD COLUMN "urlOrigem" TEXT;

-- AlterTable
ALTER TABLE "configuracao_do_workspace" ADD COLUMN "modeloDeTranscricao" TEXT;
