#!/usr/bin/env bash
# designx-cartografa.sh — Hook PreToolUse para cartografia visual
# Modo padrao: BLOQUEIO (excecao a regra universal de hooks de metodo)
# Falha aberta: se cartografo nao rodar, registra erro e sai com 0
set -euo pipefail

MODO="${DESIGNX_CARTOGRAFA_MODO:-bloqueio}"
DS_PATH="docs/design-system/DESIGN-SYSTEM.md"

# Se DS ja existe, nao faz nada
if [ -f "$DS_PATH" ]; then
  exit 0
fi

# Se designx nao esta ativo (sem .expx/designx.json), sai silenciosamente
if [ ! -f ".expx/designx.json" ]; then
  exit 0
fi

# Verifica se ha UI no projeto
if ! find src/ -name "*.tsx" -o -name "*.jsx" -o -name "*.css" 2>/dev/null | head -1 | grep -q .; then
  exit 0
fi

# Se modo e aviso, so registra
if [ "$MODO" = "aviso" ]; then
  echo "[designx/hooks — aviso, a acao NAO foi bloqueada] Nenhum DESIGN-SYSTEM.md encontrado. Rode a cartografia visual antes de continuar."
  exit 0
fi

# Modo bloqueio: impede e sugere acao
echo "designx: Nenhum DESIGN-SYSTEM.md encontrado em docs/design-system/. Para criar via cartografia visual, rode: /designx-cartography" >&2
exit 2
