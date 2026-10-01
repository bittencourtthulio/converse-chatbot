#!/bin/sh
# Entrypoint da imagem (FT-11, PR-99).
#   servidor (padrão)  aplica as migrations e executa o servidor de produção. O `exec` faz o Node ser o processo
#                      que recebe o SIGTERM do `docker stop`: o desligamento limpo (para o expurgo, deixa a fila
#                      terminar o passo corrente, espera a auditoria) está em src/instrumentation.ts e liga com
#                      NEXT_MANUAL_SIG_HANDLE=1, que a imagem define.
#   qualquer outro     executa o comando como está: npm run backup, npm run restore -- <arquivo>, npm run admin:criar.
set -e

comando="${1:-servidor}"

case "$comando" in
  servidor)
    if [ -z "${DATABASE_URL:-}" ]; then
      echo "DATABASE_URL não está definida: o servidor não pode subir." >&2
      exit 1
    fi
    # Cria o banco na primeira subida e aplica o que faltar nas seguintes. Só acrescenta; nunca apaga dado.
    node node_modules/prisma/build/index.js migrate deploy
    exec node node_modules/next/dist/bin/next start -H 0.0.0.0 -p "${PORT:-3000}"
    ;;
  *)
    exec "$@"
    ;;
esac
