#!/usr/bin/env bash
# stop-gate.sh — gate de saída do agente `servicos`: tipos, lint das camadas e teste de camadas.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
sair_se_repetido "$(cat)"
rodar_gate servicos \
  "tipos|npx tsc --noEmit" \
  "lint de src/servicos|npx eslint src/servicos" \
  "camadas|npx vitest run tests/camadas.test.ts"
exit 0
