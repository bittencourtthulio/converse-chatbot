#!/usr/bin/env bash
# pre-bash-guard.sh — bloqueia comandos fora do papel do agente `interface`.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
cmd="$(jq -r '.tool_input.command // empty')"
guard_comum "$cmd"
case "$cmd" in
  *"prisma migrate"*|*"db:migrate"*|*"db:seed"*|*"npm run setup"*|*"npm install"*|*"npm i "*)
    echo "[guard] banco e dependências não são da interface. Peça ao orquestrador (agentes dados/infra)." >&2; exit 2 ;;
esac
exit 0
