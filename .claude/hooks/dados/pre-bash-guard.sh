#!/usr/bin/env bash
# pre-bash-guard.sh — bloqueia comandos fora do papel do agente `dados`.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
cmd="$(jq -r '.tool_input.command // empty')"
guard_comum "$cmd"
# Migração só acrescenta: migration aplicada não se remove nem se renomeia.
case "$cmd" in
  *"rm "*prisma/migrations*|*"mv "*prisma/migrations*)
    echo "[guard] migrations aplicadas não se removem nem se renomeiam; corrija avançando com uma migration nova." >&2; exit 2 ;;
esac
exit 0
