#!/usr/bin/env bash
# pre-edit-scope.sh — bloqueia Edit/Write fora do escopo do agente `interface`.
set -uo pipefail
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"
rel="$(caminho_relativo "$(cat)")"
[ -z "$rel" ] && exit 0
negar_comum "$rel"
liberado_a_todos "$rel" && exit 0
case "$rel" in
  src/app/*|src/componentes/*|src/estilos/*|src/widget/*|src/proxy.ts) exit 0 ;;
  src/servicos/*) echo "[scope] '$rel' é regra de negócio: agente servicos (a tela só chama o serviço)." >&2; exit 2 ;;
  src/lib/*|scripts/*|.github/*|Dockerfile|docker-*) echo "[scope] '$rel' é infraestrutura: agente infra." >&2; exit 2 ;;
  prisma/*|prisma.config.ts) echo "[scope] '$rel' é dados: agente dados." >&2; exit 2 ;;
  *) echo "[scope] '$rel' está fora do escopo do agente interface (src/app/**, src/componentes/**, src/estilos/**, src/widget/**, src/proxy.ts, tests/**). Devolva ao orquestrador." >&2; exit 2 ;;
esac
