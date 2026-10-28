#!/usr/bin/env bash
# post-edit-test.sh — após editar, roda o teste que casa com o arquivo (domínio interface).
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
rel="$(caminho_relativo "$(cat)")"
case "$rel" in
  src/estilos/*)
    saida="$(cd "$RAIZ" && npx vitest run tests/tokens.test.ts 2>&1)" || {
      printf '%s\n' "$saida" | tail -n 30 >&2
      echo "[post-edit] tests/tokens.test.ts falhou: cor, sombra, raio e fonte só em tokens.css." >&2; exit 2; }
    exit 0 ;;
esac
testar_relacionado "$rel"
exit 0
