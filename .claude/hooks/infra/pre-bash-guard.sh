#!/usr/bin/env bash
# pre-bash-guard.sh — bloqueia comandos fora do papel do agente `infra`.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
cmd="$(jq -r '.tool_input.command // empty')"
guard_comum "$cmd"
case "$cmd" in
  *"npm audit fix"*|*"npm update"*)
    echo "[guard] atualizar dependências em lote muda o lockfile sem revisão. Troque uma versão fixa por vez e rode a suíte." >&2; exit 2 ;;
  *"npm run restore"*|*"scripts/restore"*)
    echo "[guard] restaurar backup sobrescreve banco e storage/. Só sob pedido explícito do usuário, com o servidor parado." >&2; exit 2 ;;
esac
exit 0
