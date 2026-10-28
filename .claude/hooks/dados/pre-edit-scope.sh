#!/usr/bin/env bash
# pre-edit-scope.sh — bloqueia Edit/Write fora do escopo do agente `dados`.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
rel="$(caminho_relativo "$(cat)")"
[ -z "$rel" ] && exit 0
negar_comum "$rel"
liberado_a_todos "$rel" && exit 0
case "$rel" in
  prisma/*|prisma.config.ts|src/lib/prisma.ts|src/servicos/recuperacao*.ts) exit 0 ;;
  src/servicos/*) echo "[scope] '$rel' é regra de negócio: agente servicos. O agente dados cuida de prisma/**, src/lib/prisma.ts e src/servicos/recuperacao*.ts." >&2; exit 2 ;;
  src/lib/*|scripts/*|.github/*|Dockerfile|docker-*) echo "[scope] '$rel' é infraestrutura: agente infra." >&2; exit 2 ;;
  src/app/*|src/componentes/*|src/estilos/*|src/widget/*|src/proxy.ts) echo "[scope] '$rel' é apresentação: agente interface." >&2; exit 2 ;;
  *) echo "[scope] '$rel' está fora do escopo do agente dados (prisma/**, src/lib/prisma.ts, src/servicos/recuperacao*.ts, tests/**). Devolva ao orquestrador." >&2; exit 2 ;;
esac
