# Banco, armazenamento em disco e ambiente

## Contrato de entrada

`prisma/schema.prisma` tem `Usuario`, `ConfiguracaoDoWorkspace`, `Agente`, `Conversa` e `Mensagem` (`@@map` em snake_case plural, ids `cuid()`, `onDelete: Cascade` de Conversa para Agente e de Mensagem para Conversa, `SetNull` em `Conversa.criadoPorId`). Quatro migrations aditivas em `prisma/migrations/` (a última: `20260930170000_conversas`). A regra "migração só acrescenta" é verificada por `tests/migracoes.test.ts:14`. `Agente.criadoPorId` é `RESTRICT`. Não existe modelo `Fonte` nem `Trecho`. `STORAGE_DIR` e `MAX_UPLOAD_MB` não existem em `src/lib/ambiente.ts` nem em `.env.example`; o `.gitignore` já ignora `storage/` (linha "arquivos enviados pelos usuários", `.gitignore`).

## Contrato de saída

`src/lib/ambiente.ts` expõe getters (`maxTokensDaResposta` usa `inteiroComPadrao`, que rejeita não inteiro positivo). `tests/setup.ts` aplica `prisma migrate deploy` num arquivo por arquivo de teste e define `ENCRYPTION_KEY`; não define `STORAGE_DIR` (`docs/stack/CONVENCOES.md` seção 3: "diretório temporário por teste, apontado por `STORAGE_DIR`. Ainda não há armazenamento"). `limparBanco` (`tests/ajuda.ts`) apaga `mensagem`, `conversa`, `agente`, `configuracaoDoWorkspace`, `usuario`. A exclusão do agente é `deleteMany` em `src/servicos/agentes.ts` (`excluir`), sem tocar em disco. A seed (`prisma/seed.ts`) cria as duas contas e o agente `agente-de-exemplo` com `upsert` e usa o client próprio (`PrismaClient` com adaptador better-sqlite3), sem importar `src/servicos`.

## Limites e cotas

SQLite, um processo escritor (PR-30, PR-05). `foreign_keys` ligado por padrão pelo adaptador: cascata provada na FT-03 (`tests/conversas-modelo.test.ts`). Tamanho de linha e de texto por linha no SQLite: `NÃO DOCUMENTADO` nesta base (limite padrão do SQLite não lido); trechos de ~1000 caracteres são pequenos, mas o texto colado chega a 200.000 caracteres e o texto extraído de uma fonte a 5 milhões (briefing), então `Trecho.texto` nunca guarda o texto inteiro de uma fonte.

## Erros conhecidos e tratamento

`db push` proibido. Migração nova por `prisma migrate dev --name <nome>` contra `DATABASE_URL` local, arquivo gerado depois conferido (deve só acrescentar). Excluir agente com `Fonte` em cascata apaga linhas, mas não arquivos: o ajuste em `excluir` precisa apagar o diretório do agente (PR-11).

## Riscos para a nossa implementação

- O disco e o banco podem divergir: processo que morre entre gravar arquivo e gravar linha (ou o inverso) deixa arquivo órfão ou linha sem arquivo; ordem de operações e reprocessamento precisam tratar.
- Caminho de arquivo nunca deve conter texto do usuário (PR-13): só `agenteId` e `fonteId` (ids `cuid`, gerados pelo servidor).
- Teste que grava em disco precisa de diretório temporário por teste apagado ao fim.
- `limparBanco` precisa apagar `trecho` e `fonte` antes de `agente` (o cascade cobre, mas a lista explícita evita surpresa) e o teste de migração precisa continuar verde.

## Fonte

`prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `src/lib/ambiente.ts`, `src/servicos/agentes.ts`, `tests/setup.ts`, `tests/ajuda.ts`, `tests/migracoes.test.ts`, `.gitignore`, `.env.example`, `docs/stack/CONVENCOES.md` — acessados em 2026-09-30.
