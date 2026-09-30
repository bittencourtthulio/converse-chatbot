#!/usr/bin/env bash
# memox-reindexar.sh — hook Stop.
#
# Reconstroi o indice quando detecta artefato novo ou alterado desde a ultima
# reconstrucao. A reconstrucao e sempre do zero (etapa 5): nao ha atualizacao
# incremental, e por isso nao existe a classe de bug de indice dessincronizado.
#
# Contrato:
#   - assincrono: nao bloqueia o encerramento da sessao;
#   - sai com 0 SEMPRE;
#   - inativo, sem erro, quando nao ha artefato nenhum;
#   - nao roda nada se nenhum artefato mudou.

set -u
trap 'exit 0' ERR

# drena o stdin do hook sem bloquear
if [ ! -t 0 ]; then
  timeout 1 cat >/dev/null 2>&1 || true
fi

DIR_HOOK="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMOX_PY="$DIR_HOOK/../skills/memox/assets/memox.py"
[ -f "$MEMOX_PY" ] || exit 0

PY="$(command -v python3 || true)"
[ -n "$PY" ] || exit 0

RAIZ="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# inativo sem artefato
if [ ! -d "$RAIZ/docs/relatorios" ] && [ ! -d "$RAIZ/docs/manutencao" ] \
   && [ ! -d "$RAIZ/docs/entregas" ] && [ ! -d "$RAIZ/docs/legado" ]; then
  exit 0
fi

# assincrono: desacopla do processo do hook e nao segura o Stop
(
  "$PY" "$MEMOX_PY" reindexar --raiz "$RAIZ" --formato silencioso >/dev/null 2>&1
) &

exit 0
