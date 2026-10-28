#!/usr/bin/env bash
# post-edit-test.sh — após editar, roda o teste que casa com o arquivo (domínio servicos).
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
testar_relacionado "$(caminho_relativo "$(cat)")"
exit 0
