#!/usr/bin/env bash
# stop-gate.sh — gate de saída do agente `interface`: tipos, lint, camadas e tokens.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
sair_se_repetido "$(cat)"
rodar_gate interface \
  "tipos|npx tsc --noEmit" \
  "lint da apresentação|npx eslint src/app src/componentes" \
  "camadas e tokens|npx vitest run tests/camadas.test.ts tests/tokens.test.ts"
exit 0
