#!/usr/bin/env bash
# arvore-limpa-antes-da-suite — PreToolUse em Bash, so quando o comando parece
# execucao de suite (mesmo padrao de deteccao de comum/rastro-post.sh,
# duplicado deliberadamente: um hook de PreToolUse nao deve depender de um de
# PostToolUse carregar primeiro).
#
# Confere, antes de deixar a suite rodar (regra 21, "Sessoes paralelas"):
#   1. git status --porcelain --untracked-files=all — arquivo sujo fora da
#      uniao de `arquivos` de todas as tasks da feature e sinal de trabalho de
#      outra sessao ou de outra feature.
#   2. o rastro — task `em_andamento` reivindicada por outra sessao (mesmo
#      criterio de task-reivindicada.sh).
#
# So avisa; nunca impede o comando de rodar de verdade. Modo: nasce em
# `aviso`. Falha ABERTA. Sem git, sai 0 em silencio — nao ha o que comparar.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../comum/rastro.sh
. "$DIR/../comum/rastro.sh"

ENTRADA="$(cat)"
CWD="$(rastro_json_get "$ENTRADA" cwd)"
[ -n "$CWD" ] || CWD="$PWD"
RAIZ="$(rastro_raiz "$CWD")"

CMD="$(rastro_tool_input_get "$ENTRADA" command)"
[ -n "$CMD" ] || exit 0

case "$CMD" in
  *"npm test"*|*"npm run test"*|*"yarn test"*|*"pnpm test"*|\
  *pytest*|*"go test"*|*"cargo test"*|*jest*|*vitest*|*rspec*|*phpunit*|*"dotnet test"*|*"mvn test"*) ;;
  *) exit 0 ;;
esac

# Sem git, nada a comparar.
git -C "$RAIZ" rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

TRABALHO="$(rastro_trabalho_id "$RAIZ")"
[ "$TRABALHO" != "sem-trabalho" ] || exit 0

# --------------------------------------------------------- escopo declarado
# Uniao de `arquivos` (cria + altera) de TODAS as tasks de TODAS as sprints da
# feature — nao so a task em andamento. Mesma extracao de escopo-da-task.sh,
# aplicada a todos os tasks.md da feature em vez de so o que tem em_andamento.
FEATURE_DIR="$RAIZ/docs/sprintx/features/$TRABALHO"
DECLARADOS=""
if [ -d "$FEATURE_DIR" ]; then
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    ITENS="$(awk '
      function emitir(linha,   ini, fim, corpo, p, n, i) {
        while (match(linha, /\[[^]]*\]/)) {
          ini = RSTART; fim = RLENGTH
          corpo = substr(linha, ini + 1, fim - 2)
          n = split(corpo, p, ",")
          for (i = 1; i <= n; i++) {
            gsub(/^[ \t]+|[ \t]+$/, "", p[i])
            gsub(/^["'\'']|["'\'']$/, "", p[i])
            if (p[i] != "") print p[i]
          }
          linha = substr(linha, ini + fim)
        }
      }
      /cria:|altera:/ { emitir($0); next }
    ' "$f" 2>/dev/null)"
    DECLARADOS="$DECLARADOS
$ITENS"
  done <<EOF2
$(find "$FEATURE_DIR" -maxdepth 3 -name tasks.md -type f 2>/dev/null)
EOF2
fi

# --------------------------------------------------------------- git status
SUJOS="$(git -C "$RAIZ" status --porcelain --untracked-files=all 2>/dev/null | awk '{print substr($0, 4)}')"

FORA_ESCOPO=""
while IFS= read -r caminho; do
  [ -n "$caminho" ] || continue
  case "$caminho" in
    docs/sprintx/*|docs/eventos/*|.expx/*) continue ;;
  esac
  # Isencao de arquivo de teste, mesmo espirito de escopo-da-task.sh: o metodo
  # MANDA escrever teste antes do codigo (regra 3), e cobrar escopo dele
  # avisaria justamente quem esta obedecendo a regra.
  case "$caminho" in
    tests/*|test/*|*_test.*|*.test.*|*.spec.*|*Test.*|*Spec.*) continue ;;
  esac
  if printf '%s\n' "$DECLARADOS" | grep -qxF "$caminho"; then
    continue
  fi
  FORA_ESCOPO="$FORA_ESCOPO $caminho"
done <<EOF3
$SUJOS
EOF3
FORA_ESCOPO="$(printf '%s' "$FORA_ESCOPO" | sed 's/^ *//')"

# ------------------------------------------------------ reivindicacao ativa
RASTRO_ARQ="$RAIZ/docs/eventos/$TRABALHO.jsonl"
MINHA_SESSAO="$(rastro_sessao)"
TASK_ALHEIA=""
DONA_ALHEIA=""
if [ -f "$RASTRO_ARQ" ] && [ -d "$FEATURE_DIR" ]; then
  IDS_EM_ANDAMENTO="$(grep -l 'status:[ \t]*em_andamento' "$FEATURE_DIR"/sprint-*/tasks.md 2>/dev/null \
    | xargs -I{} awk '
        /^  - id:/ { id = $3; sub(/^[ \t]+/, "", id) }
        /status:[ \t]*em_andamento/ { if (id != "") print id }
      ' {} 2>/dev/null)"
  while IFS= read -r tid; do
    [ -n "$tid" ] || continue
    dona=""
    if command -v jq >/dev/null 2>&1; then
      dona="$(jq -rc --arg t "$tid" '
        select(.task == $t) | select(.evento == "task_iniciada" or .evento == "task_concluida" or .evento == "task_bloqueada")
      ' "$RASTRO_ARQ" 2>/dev/null | tail -1 | jq -r '
        if .evento == "task_iniciada" then (.sessao // "") else "" end
      ' 2>/dev/null)"
    fi
    if [ -n "$dona" ] && [ "$dona" != "$MINHA_SESSAO" ]; then
      TASK_ALHEIA="$tid"; DONA_ALHEIA="$dona"; break
    fi
  done <<EOF4
$IDS_EM_ANDAMENTO
EOF4
fi

[ -z "$FORA_ESCOPO" ] && [ -z "$TASK_ALHEIA" ] && exit 0

PARTES=""
[ -n "$FORA_ESCOPO" ] && PARTES="arquivo(s) sujo(s) fora do escopo: $FORA_ESCOPO"
if [ -n "$TASK_ALHEIA" ]; then
  [ -n "$PARTES" ] && PARTES="$PARTES; "
  PARTES="${PARTES}$TASK_ALHEIA em andamento pela sessao $DONA_ALHEIA"
fi

MSG="sprintx/arvore-limpa-antes-da-suite: rodando a suite com a arvore possivelmente contaminada por outra feature ou sessao — $PARTES. O resultado desta execucao pode nao refletir so o trabalho desta feature ('Sessoes paralelas' do SKILL.md)."

MODO="$(rastro_modo "$RAIZ" arvore-limpa-antes-da-suite metodo)"
[ "$MODO" = "desligado" ] && exit 0

if [ "$MODO" = "bloqueio" ]; then
  rastro_grava "$RAIZ" acao_bloqueada hook bloqueado "arvore contaminada" "[]"
  rastro_bloqueia "$MSG"
fi

rastro_grava "$RAIZ" regra_violada hook aviso "arvore contaminada" "[]"
rastro_aviso_ao_modelo PreToolUse "$MSG"
