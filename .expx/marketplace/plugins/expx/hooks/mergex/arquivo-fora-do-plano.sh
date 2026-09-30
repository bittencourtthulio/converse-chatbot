#!/usr/bin/env bash
# arquivo-fora-do-plano — PreToolUse em execução de comando.
#
# Compara os arquivos em preparação para commit com a lista declarada na task.
# Fora da lista → aviso.
#
# Sobreposição intencional com o hook de escopo do sprintx e do runx: aquele
# pega na hora da edição, este pega na hora do commit. Um arquivo pode ter sido
# alterado por outro processo, ou o hook de escopo pode ter estado em aviso.
#
# Modo padrão: AVISO (hook de método). FALHA ABERTA.

HOOK="arquivo-fora-do-plano"
PADRAO="aviso"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../comum/base.sh
. "$DIR/../comum/base.sh"

ENTRADA="$(cat)"
[ "$(printf '%s' "$ENTRADA" | jq -r '.tool_name // empty' 2>/dev/null)" = "Bash" ] || exit 0

CMD="$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -n "$CMD" ] || exit 0
printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)' || exit 0

CWD="$(printf '%s' "$ENTRADA" | jq -r '.cwd // empty' 2>/dev/null)"
RAIZ="$(expx_raiz "${CWD:-$PWD}")"

MODO="$(expx_modo "$HOOK" "$PADRAO" "$RAIZ")"
[ "$MODO" = "desligado" ] && exit 0

PREP="$(git -C "$RAIZ" diff --cached --name-only 2>/dev/null)"
[ -n "$PREP" ] || exit 0

TASKS_ARQS="$(find "$RAIZ/docs" -name tasks.md -not -path '*/node_modules/*' 2>/dev/null)"
[ -n "$TASKS_ARQS" ] || exit 0

# Todos os caminhos declarados em qualquer task, em qualquer sprint.
# A comparação é com a UNIÃO: quem cuida de "uma task por commit" é o
# commit-por-task. Aqui a pergunta é outra — este arquivo foi planejado?
DECLARADOS="$(
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    awk '
      function coleta(s,   n, i, partes) {
        sub(/^[^:]*:[[:space:]]*/, "", s)
        gsub(/^\[|\]$/, "", s)
        n = split(s, partes, /,[[:space:]]*/)
        for (i = 1; i <= n; i++) {
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", partes[i])
          gsub(/^["'"'"']|["'"'"']$/, "", partes[i])
          if (partes[i] != "") print partes[i]
        }
      }
      /^[[:space:]]*arquivos:/ { dentro = 1; next }
      /^[[:space:]]*(cria|altera):/ { coleta($0); dentro = 1; next }
      dentro && /^[[:space:]]*-[[:space:]]+[A-Za-z0-9_.\/-]+[[:space:]]*$/ {
        c = $0; sub(/^[[:space:]]*-[[:space:]]+/, "", c); gsub(/[[:space:]]+$/, "", c); print c; next
      }
      /^[[:space:]]*[a-z_]+:/ { if ($0 !~ /^[[:space:]]*(cria|altera|arquivos):/) dentro = 0 }
    ' "$f" 2>/dev/null || true
  done <<< "$TASKS_ARQS" | sort -u
)"
[ -n "$DECLARADOS" ] || exit 0

# Artefatos que a própria mergex grava não precisam estar no plano das tasks:
# eles são a saída da entrega, não o trabalho planejado.
FORA=""
while IFS= read -r arquivo; do
  [ -n "$arquivo" ] || continue
  case "$arquivo" in
    docs/entregas/*|docs/eventos/*) continue ;;
  esac
  printf '%s\n' "$DECLARADOS" | grep -Fxq "$arquivo" || FORA="$FORA  - $arquivo
"
done <<< "$PREP"

[ -n "$FORA" ] || expx_permite "$RAIZ" "$HOOK" "todo arquivo preparado esta declarado"

QTD="$(printf '%s' "$FORA" | grep -c . || true)"
ARQ_JSON="$(printf '%s' "$FORA" | sed 's/^  - //' | jq -R . | jq -sc . 2>/dev/null || echo '[]')"

expx_rastro "$RAIZ" "regra_violada" "aviso" "arquivo fora do plano ($QTD)" "$HOOK" "$ARQ_JSON"

MSG="mergex/arquivo-fora-do-plano — arquivo em preparação que nenhuma task declarou

$FORA
Nunca commitar arquivo fora da lista declarada na task (regra 4 da mergex).
A lista sai de 'arquivos.cria' e 'arquivos.altera' das tasks.

Um arquivo pode chegar aqui por três caminhos, e a saída é diferente em cada um:
  - Foi alterado sem estar no plano  → tire do commit (git restore --staged)
    e registre em DIVIDA.md, ou acrescente-o à task se ele é mesmo do trabalho.
  - É de outro processo ou de outra pessoa → tire do commit e deixe na árvore.
  - O plano é que está desatualizado → atualize a task, não o commit.

Não apague o arquivo: quem decide o que fazer com ele é a pessoa. O portão de
prontidão (V9) volta a barrar por isto, com o arquivo nomeado."

if [ "$MODO" = "bloqueio" ]; then
  expx_rastro "$RAIZ" "acao_bloqueada" "bloqueado" "arquivo fora do plano ($QTD)" "$HOOK" "$ARQ_JSON"
  printf '%s\n' "$MSG" >&2
  exit 2
fi
printf '%s\n' "$MSG" >&2
exit 0
