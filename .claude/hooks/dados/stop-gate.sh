#!/usr/bin/env bash
# stop-gate.sh — gate de saída do agente `dados`: tipos e testes de migração/FTS5 verdes.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
sair_se_repetido "$(cat)"
rodar_gate dados \
  "tipos|npx tsc --noEmit" \
  "migrações e FTS5|npx vitest run tests/migracoes.test.ts tests/indice-fts5.test.ts tests/recuperacao.test.ts"
exit 0
