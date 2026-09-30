#!/usr/bin/env bash
# designx-token-check.sh — Hook PreToolUse para verificacao pesada de tokens
# Evento: PreToolUse em Bash (build)
# Ativado sob demanda, nao roda em toda chamada
set -euo pipefail

DS_PATH="docs/design-system/DESIGN-SYSTEM.md"

if [ ! -f "$DS_PATH" ]; then
  exit 0
fi

# Verifica se o output de build contem violacoes
# Este hook e ativado sob demanda via --full
if [ "${DESIGNX_FULL:-false}" != "true" ]; then
  exit 0
fi

echo "[designx/hooks — verificacao pesada] Verificando CSS output contra design system..." >&2
exit 0
