# Restauração: servidor de pé em outro contêiner

## Contrato de entrada

`npm run restore -- <arquivo.tar.gz> [--forcar] [--url-saude=<url>]` (`scripts/restore.ts:50-58`). A recusa de hoje é `servidorResponde(url)`: um `fetch` com 1,5 s a `http://127.0.0.1:${PORT ?? 3000}/api/saude` (`scripts/restore.ts:27-34,63-74`). Qualquer resposta HTTP conta como servidor de pé; sem `--forcar` o comando sai com 1.

## Contrato de saída

Código de saída 0 com o resumo (`scripts/restore.ts:131-146`) ou 1 com mensagem; `--forcar` com servidor de pé só avisa (`:73`). A lógica de validação e troca está em `src/lib/restauracao.ts` (sem Prisma e sem servidor, `:2`).

## Limites e cotas

Sem prazo de batimento hoje. O servidor do contêiner roda `next start` pelo entrypoint (`docker-entrypoint.sh`, `exec node node_modules/next/dist/bin/next start`), e o desligamento limpo por `SIGTERM` só liga com `NEXT_MANUAL_SIG_HANDLE=1` (`src/instrumentation.ts:45-47,91-103`; `Dockerfile:46`). O diretório de dados é o do `DATABASE_URL` (`ambiente.bancoArquivo`, `/data` na imagem; `scripts/restore.ts:59`).

## Erros conhecidos e tratamento

Lacuna 37 de `docs/stack/LACUNAS.md`: a recusa só enxerga o mesmo host; com o servidor em outro contêiner do mesmo volume ela não vale (PR-98, PEND-20). Testes: `tests/restauracao-comando.test.ts`, `tests/restauracao-fim-a-fim.test.ts`, `tests/restauracao-recusas.test.ts` (servidor simulado em `--url-saude`), `tests/restauracao-troca.test.ts`, `tests/restauracao-validacao.test.ts`, `tests/backups-rota.test.ts`.

## Riscos para a nossa implementação

(1) A trava é um arquivo no diretório do banco; o `register()` do `instrumentation.ts` o cria e um temporizador (a cada 10 s) o regrava; remover no `SIGTERM` (`desligarComCalma`) e também em `process.on('exit')`. (2) Servidor morto sem limpar deixa trava velha: batimento com mais de 30 s é ignorado com aviso. (3) Relógios diferentes entre máquinas: gravar `batimentoEm` no conteúdo e comparar com o relógio do comando; a tolerância de 30 s cobre diferenças pequenas; relógio e diretório injetáveis para teste. (4) O arquivo `.servidor.lock` mora ao lado de `app.db`; o backup e a restauração não podem copiá-lo nem trocá-lo (conferir `src/lib/backup.ts` e `restauracao.ts`: o backup copia o banco por API, o `storage/` por varredura). (5) Os testes que sobem `next start` (`tests/apoio/servidor.ts`) não podem deixar a trava para trás. (6) `tsx scripts/restore.ts` importa `../src/lib/ambiente` (`:18`): o novo módulo da trava deve viver em `src/lib/` sem `next/*`.

## Fonte

`scripts/restore.ts`, `src/instrumentation.ts`, `docker-entrypoint.sh`, `Dockerfile`, `docs/stack/LACUNAS.md` (lacuna 37), `docs/operacao-e-backup/`, `tests/restauracao-*.test.ts` — acessado em 2026-10-01
