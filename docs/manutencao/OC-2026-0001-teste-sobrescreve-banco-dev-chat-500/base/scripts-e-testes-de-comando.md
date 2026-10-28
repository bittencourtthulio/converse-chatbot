# Scripts de backup/restauração e os testes que os rodam

## O que é e onde vive

- `scripts/backup.ts`, `scripts/restore.ts`, `scripts/criar-admin.ts`: comandos de linha de comando; os três começam com `import 'dotenv/config'` (`scripts/backup.ts:7`, `scripts/restore.ts:14`, `scripts/criar-admin.ts:7`).
- `tests/apoio/comando.ts`: `rodarScript`, que sobe o script como processo filho com ambiente mínimo.
- `tests/backup-comando.test.ts` e `tests/restauracao-comando.test.ts`: os testes que rodam os scripts.

## Contrato de entrada

`rodarScript(script, variaveis, args, opcoes)` (`tests/apoio/comando.ts:19`). O filho recebe só `PATH`, `HOME` e as variáveis do teste; as de valor `undefined` são descartadas (`tests/apoio/comando.ts:30-31`). O comentário do helper promete: "para nenhum teste tocar o banco do desenvolvedor por esquecimento" (`tests/apoio/comando.ts:23`).

## Contrato de saída

O script grava no arquivo SQLite de `ambiente.bancoArquivo`, que vem de `DATABASE_URL` (`src/lib/ambiente.ts:282-288`); sem a variável lança "obrigatória ausente" (`src/lib/ambiente.ts:284`).

## Estrutura de dados

Ver `chave-openrouter-e-conversar.md`.

## Funções e trechos relevantes

```
const r = await rodarScript('backup', variaveis({ DATABASE_URL: undefined }))
```
`tests/backup-comando.test.ts:78` — "sem DATABASE_URL sai com código diferente de zero".

```
const semBanco = await rodarScript('restore', variaveis(d, { DATABASE_URL: undefined }), [b.caminho])
```
`tests/restauracao-comando.test.ts:210` — mesma ideia, com um backup real de fixture.

`import 'dotenv/config'` carrega o `.env` da raiz (cwd do filho = `process.cwd()`, `tests/apoio/comando.ts:34`) e define `DATABASE_URL` se ela não existir no ambiente. `prisma.config.ts` também faz `import 'dotenv/config'` e cai em `file:./prisma/dev.db` sem a variável (`prisma.config.ts:1,14`).

## Quem chama e quem é chamado

**Chamadores:** os dois testes acima passam `DATABASE_URL: undefined`. Os demais testes passam sempre `DATABASE_URL` de um diretório temporário (`tests/restauracao-comando.test.ts:38-44`, `tests/backup-comando.test.ts:23-29`, `tests/restauracao-fim-a-fim.test.ts:69`).

**Dependências:** `restore.ts` troca o banco e o `storage/` e grava a auditoria `restauracao` (`scripts/restore.ts:4-9`).

## Testes existentes

Os dois testes citados esperam código de saída diferente de zero e `DATABASE_URL` no stderr. Com `DATABASE_URL` presente em `.env`, o script não falha: roda de verdade contra o banco de desenvolvimento. Nenhum teste cobre "o filho não lê o `.env` do desenvolvedor".

## Limites e regras de negócio conhecidas

`restore` guarda o estado anterior em `BACKUP_DIR/pre-restauracao-<data>` (`scripts/restore.ts:7`); nos testes `BACKUP_DIR` é diretório temporário, apagado ao fim.

## Riscos para esta ocorrência

- Mexer em `scripts/*.ts` altera comando de operação real; preferir corrigir o helper de teste.
- Outros testes com `DATABASE_URL` indefinido, hoje ou no futuro, repetem o problema.

## Fonte

`scripts/backup.ts`, `scripts/restore.ts`, `scripts/criar-admin.ts`, `prisma.config.ts`, `src/lib/ambiente.ts`, `tests/apoio/comando.ts`, `tests/backup-comando.test.ts`, `tests/restauracao-comando.test.ts`, `tests/restauracao-fim-a-fim.test.ts` — mapeado em 2026-10-28
