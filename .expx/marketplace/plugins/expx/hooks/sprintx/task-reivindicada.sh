#!/usr/bin/env bash
# task-reivindicada — PreToolUse em escrita no tasks.md.
#
# Avisa quando a escrita PROPOSTA leva uma task a `em_andamento` e o rastro
# mostra que ela ja esta aberta por OUTRA sessao (task_iniciada mais recente
# sem task_concluida/task_bloqueada dela depois). Regra 21, "Sessoes
# paralelas" do SKILL.md, D-08.
#
# Le o texto que VAI SER GRAVADO (tool_input.content ou new_string), mesmo
# padrao de task-so-fecha-verde.sh — o objetivo e barrar ANTES.
#
# Modo: nasce em `aviso`. Falha ABERTA: qualquer duvida sobre o estado do
# plano ou do rastro => permite.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../comum/rastro.sh
. "$DIR/../comum/rastro.sh"

ENTRADA="$(cat)"
CWD="$(rastro_json_get "$ENTRADA" cwd)"
[ -n "$CWD" ] || CWD="$PWD"
RAIZ="$(rastro_raiz "$CWD")"

ALVO="$(rastro_tool_input_get "$ENTRADA" file_path)"
case "$ALVO" in
  */tasks.md) ;;
  *) exit 0 ;;
esac

# O texto que esta sendo escrito. Write traz `content`; Edit traz `new_string`.
NOVO="$(rastro_tool_input_get "$ENTRADA" content)"
[ -n "$NOVO" ] || NOVO="$(rastro_tool_input_get "$ENTRADA" new_string)"
[ -n "$NOVO" ] || exit 0

TRABALHO="$(rastro_trabalho_id "$RAIZ")"
[ "$TRABALHO" != "sem-trabalho" ] || exit 0

RASTRO_ARQ="$RAIZ/docs/eventos/$TRABALHO.jsonl"
[ -f "$RASTRO_ARQ" ] || exit 0

MINHA_SESSAO="$(rastro_sessao)"

# IDs das tasks que a escrita proposta leva a em_andamento — uma por linha.
IDS_EM_ANDAMENTO="$(printf '%s' "$NOVO" | awk '
  /^  - id:/ { id = $3; sub(/^[ \t]+/, "", id) }
  /status:[ \t]*em_andamento/ { if (id != "") print id }
')"
[ -n "$IDS_EM_ANDAMENTO" ] || exit 0

# _sessao_dona <task_id> — sessao que tem a task aberta agora, vazio se ninguem.
# Le o rastro de tras para frente: o evento mais recente com aquele `task`
# entre task_iniciada/task_concluida/task_bloqueada decide.
_sessao_dona() {
  local tid="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -rc --arg t "$tid" '
      select(.task == $t) | select(.evento == "task_iniciada" or .evento == "task_concluida" or .evento == "task_bloqueada")
    ' "$RASTRO_ARQ" 2>/dev/null | tail -1 | jq -r '
      if .evento == "task_iniciada" then (.sessao // "") else "" end
    ' 2>/dev/null
    return 0
  fi
  # Fallback sem jq: grep tolerante, mesma logica de rastro_json_get, aplicada
  # linha a linha, de tras para frente.
  awk -v tid="$tid" '
    index($0, "\"task\":\"" tid "\"") == 0 { next }
    { linhas[NR] = $0 }
    END {
      for (i = NR; i >= 1; i--) {
        l = linhas[i]
        if (index(l, "\"task\":\"" tid "\"") == 0) continue
        if (index(l, "\"evento\":\"task_concluida\"") || index(l, "\"evento\":\"task_bloqueada\"")) { exit }
        if (index(l, "\"evento\":\"task_iniciada\"")) {
          match(l, /"sessao":"[^"]*"/)
          if (RSTART > 0) {
            s = substr(l, RSTART + 10, RLENGTH - 11)
            print s
          }
          exit
        }
      }
    }
  ' "$RASTRO_ARQ" 2>/dev/null
}

TASK_REIVINDICADA=""
DONA=""
while IFS= read -r tid; do
  [ -n "$tid" ] || continue
  dona="$(_sessao_dona "$tid")"
  if [ -n "$dona" ] && [ "$dona" != "$MINHA_SESSAO" ]; then
    TASK_REIVINDICADA="$tid"
    DONA="$dona"
    break
  fi
done <<EOF
$IDS_EM_ANDAMENTO
EOF

[ -n "$TASK_REIVINDICADA" ] || exit 0

MSG="sprintx/task-reivindicada: a task $TASK_REIVINDICADA ja esta reivindicada pela sessao $DONA (evento task_iniciada sem fechamento posterior). Pule para a proxima task paralelizavel com dependencias satisfeitas, ou registre um bloqueio em 00-BLOQUEIOS.md se nao houver nenhuma."

RASTRO_TASK="\"$TASK_REIVINDICADA\""
MODO="$(rastro_modo "$RAIZ" task-reivindicada metodo)"

[ "$MODO" = "desligado" ] && exit 0

if [ "$MODO" = "bloqueio" ]; then
  rastro_grava "$RAIZ" acao_bloqueada hook bloqueado "$TASK_REIVINDICADA reivindicada por $DONA" "[]"
  rastro_bloqueia "$MSG"
fi

rastro_grava "$RAIZ" regra_violada hook aviso "$TASK_REIVINDICADA reivindicada por $DONA" "[]"
rastro_aviso_ao_modelo PreToolUse "$MSG"
