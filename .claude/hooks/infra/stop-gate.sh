#!/usr/bin/env bash
# stop-gate.sh — gate de saída do agente `infra`: tipos, lint e teste de projeto.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
sair_se_repetido "$(cat)"
rodar_gate infra \
  "tipos|npx tsc --noEmit" \
  "lint|npm run lint" \
  "projeto|npx vitest run tests/projeto.test.ts"
exit 0
