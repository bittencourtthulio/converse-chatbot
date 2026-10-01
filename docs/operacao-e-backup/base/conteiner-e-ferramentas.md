# Contêiner, `tar`, API de backup do SQLite e sinal do Next (modo externo)

## Contrato de entrada

API de backup online do `better-sqlite3`: `db.backup(destino, {attached?, progress?})` devolve uma promessa; o diretório de destino precisa existir (`node_modules/better-sqlite3/lib/methods/backup.js:8-33`), copia por passos com `transfer` e fecha ao terminar (`:36-60`). Pacote `tar` 7.5.22 é a versão `latest` do registro (`npm view tar`, 2026-10-01) e não está instalado (`ls node_modules`). Docker 29.2.1 e Compose v5.1.0 respondem nesta máquina (`docker info`, `docker compose version`), com 23 contêineres de outros projetos já em execução, 11 CPUs e 7,6 GiB. `NEXT_MANUAL_SIG_HANDLE` desliga os manipuladores de `SIGINT` e `SIGTERM` do Next (`node_modules/next/dist/server/lib/start-server.js:389-392`); sem ela, o Next trata o sinal e sai com 143 (`start-server.js:374-377`). `register()` roda uma vez e termina antes de o servidor atender (`node_modules/next/dist/docs/01-app/02-guides/instrumentation.md:19`); `onRequestError(erro, request{path, method, headers}, context{routeType...})` recebe o `digest` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md:36-123`).

## Contrato de saída

Node 22.23.3 e npm 10.9.9 locais (`node -v`, `npm -v`); o CI usa Node 22 (`.github/workflows/ci.yml:23`). Imagem base escolhida na F2.

## Limites e cotas

`docker stop` espera 10 segundos antes de `SIGKILL` por padrão (NÃO DOCUMENTADO nos arquivos locais; o compose tem `stop_grace_period`). Memória do build do Next no contêiner: NÃO DOCUMENTADO.

## Erros conhecidos e tratamento

`db.backup` recusa diretório inexistente com `TypeError` e não aceita `:memory:` (`backup.js:22-29`). O módulo nativo `better-sqlite3` é compilado ou baixado por plataforma: a imagem precisa instalar dependências na mesma arquitetura em que roda.

## Riscos para a nossa implementação

Imagem final precisa do CLI do Prisma (`migrate deploy`) e do `tsx` (scripts de backup e restauração), hoje em `devDependencies`. A pasta `src/gerado/` (client do Prisma) não é versionada (`.gitignore`) e precisa de `prisma generate` no build. `src/widget/widget.js` é lido na construção (`src/app/widget.js/route.ts`, CONVENCOES seção 5): `next build` precisa dele presente. O volume `/data` precisa pertencer ao usuário não-root.

## Fonte

`node_modules/better-sqlite3/lib/methods/backup.js`, `node_modules/next/dist/server/lib/start-server.js`, documentação local do Next (`node_modules/next/dist/docs/`), saída de `docker info` e `npm view tar` — acessado em 2026-10-01
