#!/usr/bin/env bash
# pre-edit-scope.sh — bloqueia Edit/Write fora do escopo do agente `infra`.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
rel="$(caminho_relativo "$(cat)")"
[ -z "$rel" ] && exit 0
case "$rel" in .env.example) exit 0 ;; esac
negar_comum "$rel"
liberado_a_todos "$rel" && exit 0
case "$rel" in
  src/lib/prisma.ts) echo "[scope] '$rel' é o acesso ao banco: agente dados." >&2; exit 2 ;;
  src/lib/*|scripts/*|.github/*|Dockerfile|docker-compose.yml|docker-entrypoint.sh|.dockerignore|src/instrumentation*.ts|next.config.ts|eslint.config.mjs|vitest.config.ts|tsconfig.json|package.json|package-lock.json) exit 0 ;;
  prisma/*|prisma.config.ts|src/servicos/recuperacao*.ts) echo "[scope] '$rel' é dados: agente dados." >&2; exit 2 ;;
  src/servicos/*) echo "[scope] '$rel' é regra de negócio: agente servicos." >&2; exit 2 ;;
  src/app/*|src/componentes/*|src/estilos/*|src/widget/*|src/proxy.ts) echo "[scope] '$rel' é apresentação: agente interface." >&2; exit 2 ;;
  *) echo "[scope] '$rel' está fora do escopo do agente infra (src/lib/**, scripts/**, .github/**, Docker, configs, tests/**). Devolva ao orquestrador." >&2; exit 2 ;;
esac
