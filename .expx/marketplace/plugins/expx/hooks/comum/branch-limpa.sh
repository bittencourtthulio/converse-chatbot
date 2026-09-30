#!/usr/bin/env bash
# branch-limpa — PreToolUse em execução de comando.
#
# Barra criação ou troca de branch com alteração não commitada pendente.
# Protege o trabalho de quem estava usando a máquina: a alteração pendente
# pode não ser da mergex nem do trabalho corrente.
#
# Modo padrão: BLOQUEIO (hook de segurança, falha fechada).

HOOK="branch-limpa"
PADRAO="bloqueio"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=base.sh
. "$DIR/base.sh"

ENTRADA="$(cat)"
[ "$(printf '%s' "$ENTRADA" | jq -r '.tool_name // empty' 2>/dev/null)" = "Bash" ] || exit 0

CMD="$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -n "$CMD" ] || exit 0

# Saída antecipada.
printf '%s' "$CMD" | grep -Eq '(^|[;&|`(){}[:space:]])git([[:space:]]|$)' || exit 0

# Só troca ou criação de branch interessa:
#   git switch <b> | git switch -c <b> | git checkout <b> | git checkout -b <b>
# `git checkout -- <path>` NÃO é troca de branch (é descarte, assunto do
# git-perigoso): o `--` exclui.
TROCA=0
if printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+switch([[:space:]]|$)'; then
  TROCA=1
elif printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+checkout([[:space:]]|$)'; then
  printf '%s' "$CMD" | grep -Eq 'checkout[^|;&]*[[:space:]]--([[:space:]]|$)' || TROCA=1
fi
[ "$TROCA" = "1" ] || exit 0

CWD="$(printf '%s' "$ENTRADA" | jq -r '.cwd // empty' 2>/dev/null)"
RAIZ="$(expx_raiz "${CWD:-$PWD}")"

MODO="$(expx_modo "$HOOK" "$PADRAO" "$RAIZ")"
[ "$MODO" = "desligado" ] && exit 0

# Árvore suja? Qualquer linha de status --porcelain conta, inclusive arquivo
# apenas não rastreado (DM-26): pode ser trabalho de alguém, e a skill não
# julga o conteúdo do que não é dela.
SUJO="$(git -C "$RAIZ" status --porcelain 2>/dev/null)"
[ -n "$SUJO" ] || expx_permite "$RAIZ" "$HOOK" "arvore limpa na troca de branch"

RESUMO="$(printf '%s' "$SUJO" | head -20)"
QTD="$(printf '%s\n' "$SUJO" | grep -c .)"

expx_barra "$MODO" "$RAIZ" "$HOOK" "troca de branch com arvore suja ($QTD)" \
"mergex/branch-limpa — troca de branch com alteração pendente

Comando: $CMD
Pendente: $QTD arquivo(s)

$RESUMO

Trocar de branch agora carrega essa alteração para a outra branch, ou faz o
comando falhar no meio. E a alteração pode não ser sua: pode ser o trabalho de
quem estava usando esta máquina.

A branch do trabalho nasce de árvore limpa (regra 2 da mergex).

O que fazer:
  - É do trabalho atual?   Commite pela task correspondente.
  - É de outra coisa?      git stash push -m 'trabalho anterior'
  - Não sabe de quem é?    Pare e pergunte. Não descarte."
