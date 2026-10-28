#!/usr/bin/env bash
# pre-edit-scope.sh — bloqueia Edit/Write fora do escopo do agente `servicos`.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
rel="$(caminho_relativo "$(cat)")"
[ -z "$rel" ] && exit 0
negar_comum "$rel"
liberado_a_todos "$rel" && exit 0
case "$rel" in
  src/servicos/recuperacao*.ts) echo "[scope] '$rel' é a busca FTS5: agente dados." >&2; exit 2 ;;
  src/servicos/*) exit 0 ;;
  prisma/*|prisma.config.ts|src/lib/prisma.ts) echo "[scope] '$rel' é esquema/migração: agente dados." >&2; exit 2 ;;
  src/lib/*|scripts/*|.github/*|Dockerfile|docker-*) echo "[scope] '$rel' é infraestrutura: agente infra." >&2; exit 2 ;;
  src/app/*|src/componentes/*|src/estilos/*|src/widget/*|src/proxy.ts) echo "[scope] '$rel' é apresentação: agente interface." >&2; exit 2 ;;
  *) echo "[scope] '$rel' está fora do escopo do agente servicos (src/servicos/**, tests/**). Devolva ao orquestrador." >&2; exit 2 ;;
esac
