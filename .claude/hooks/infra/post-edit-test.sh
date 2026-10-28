#!/usr/bin/env bash
# post-edit-test.sh — após editar, roda o teste que casa com o arquivo (domínio infra).
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
rel="$(caminho_relativo "$(cat)")"
case "$rel" in
  package.json|.github/*|Dockerfile|docker-compose.yml|.env.example)
    saida="$(cd "$RAIZ" && npx vitest run tests/projeto.test.ts 2>&1)" || {
      printf '%s\n' "$saida" | tail -n 30 >&2
      echo "[post-edit] tests/projeto.test.ts falhou (confere scripts, exemplo de ambiente, CI e README)." >&2; exit 2; }
    exit 0 ;;
esac
testar_relacionado "$rel"
exit 0
