#!/usr/bin/env bash
# commit-por-task — PreToolUse em execução de comando.
#
# Verifica que o que está sendo commitado corresponde aos arquivos de UMA
# task, e que essa task está `concluida` com `suite: verde`.
#
# É a regra que sustenta a qualidade do histórico — que, como a mergex não
# previne colisão, é o principal ativo de quem for resolver um conflito depois.
#
# Modo padrão: AVISO (hook de método).
# FALHA ABERTA: qualquer erro interno deixa passar. Hook de método que quebra e
# trava o terminal faz o time desligar tudo — inclusive os de segurança.

HOOK="commit-por-task"
PADRAO="aviso"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../comum/base.sh
. "$DIR/../comum/base.sh"

# Falha aberta: sem `set -e`, um comando que retorna não-zero não derruba o
# script — ele segue e, no limite, chega ao fim e sai 0. É esse o comportamento
# desejado para hook de método. Um `trap ... ERR` aqui seria pior: em bash 3.2
# ele não dispara de forma confiável fora de `set -e`, e mascararia o exit 2 de
# um bloqueio legítimo.

ENTRADA="$(cat)"
[ "$(printf '%s' "$ENTRADA" | jq -r '.tool_name // empty' 2>/dev/null)" = "Bash" ] || exit 0

CMD="$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -n "$CMD" ] || exit 0
printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)' || exit 0

CWD="$(printf '%s' "$ENTRADA" | jq -r '.cwd // empty' 2>/dev/null)"
RAIZ="$(expx_raiz "${CWD:-$PWD}")"

MODO="$(expx_modo "$HOOK" "$PADRAO" "$RAIZ")"
[ "$MODO" = "desligado" ] && exit 0

# O que está em preparação. Nada preparado: não é assunto deste hook.
PREP="$(git -C "$RAIZ" diff --cached --name-only 2>/dev/null)"
[ -n "$PREP" ] || exit 0

# --------------------------------------------------------------------------
# As tasks do trabalho
# --------------------------------------------------------------------------
# Sem estado próprio: tudo sai de tasks.md, que já existe.
# Sem tasks.md, não há o que verificar — passa (falha aberta).
# bash 3.2 (o do macOS) não tem mapfile: usa lista separada por linha.
TASKS_ARQS="$(find "$RAIZ/docs" -name tasks.md -not -path '*/node_modules/*' 2>/dev/null)"
[ -n "$TASKS_ARQS" ] || exit 0

# Para cada task do plano, extrai: id, status, suite e arquivos declarados.
# O formato é o do expx-schema v1: blocos por task dentro do tasks.md.
TMP="$(mktemp)" || exit 0
# O trap de limpeza NÃO pode ter `exit`: um `exit 0` aqui sobrescreveria o
# `exit 2` de um bloqueio, e o hook nunca barraria nada. Só remove o temporário
# e preserva o código de saída de quem chamou.
trap 'rm -f "$TMP"' EXIT

while IFS= read -r f; do
  [ -n "$f" ] || continue
  # Formato real do expx-schema v1:
  #   - id: T-01.02
  #     status: concluida
  #     suite: verde
  #     arquivos:
  #       cria: [a/b.ts, c/d.ts]
  #       altera: []
  # Os caminhos vêm em lista de fluxo na mesma linha; há também a forma em
  # bloco (`- caminho`). As duas são aceitas.
  awk '
    function despeja(  linha) {
      if (id != "") print id "\t" status "\t" suite "\t" arquivos
    }
    function coleta(s,   n, i, partes) {
      sub(/^[^:]*:[[:space:]]*/, "", s)
      gsub(/^\[|\]$/, "", s)
      n = split(s, partes, /,[[:space:]]*/)
      for (i = 1; i <= n; i++) {
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", partes[i])
        gsub(/^["'"'"']|["'"'"']$/, "", partes[i])
        if (partes[i] != "") arquivos = arquivos " " partes[i]
      }
    }
    /^[[:space:]]*-[[:space:]]+id:[[:space:]]*T-/ {
      despeja()
      id = $0; sub(/^.*id:[[:space:]]*/, "", id); gsub(/[[:space:]"]+$/, "", id)
      status = ""; suite = ""; arquivos = ""; dentro_arq = 0; next
    }
    /^[[:space:]]*status:/ { s = $0; sub(/^[^:]*:[[:space:]]*/, "", s); gsub(/[[:space:]"]+$/, "", s); status = s; next }
    /^[[:space:]]*suite:/  { s = $0; sub(/^[^:]*:[[:space:]]*/, "", s); gsub(/[[:space:]"]+$/, "", s); suite  = s; next }
    /^[[:space:]]*arquivos:/ { dentro_arq = 1; next }
    /^[[:space:]]*(cria|altera):/ { coleta($0); dentro_arq = 1; next }
    # forma em bloco: "- caminho/arquivo.ext"
    dentro_arq && /^[[:space:]]*-[[:space:]]+[^[:space:]]+/ {
      c = $0; sub(/^[[:space:]]*-[[:space:]]+/, "", c); gsub(/[[:space:]"]+$/, "", c)
      if (c ~ /^[A-Za-z0-9_.\/-]+$/) { arquivos = arquivos " " c; next }
    }
    /^[[:space:]]*[a-z_]+:/ { if ($0 !~ /^[[:space:]]*(cria|altera|arquivos):/) dentro_arq = 0 }
    END { despeja() }
  ' "$f" >> "$TMP" 2>/dev/null || true
done <<< "$TASKS_ARQS"

[ -s "$TMP" ] || exit 0

# --------------------------------------------------------------------------
# A qual task pertence cada arquivo em preparação
# --------------------------------------------------------------------------
TASKS_TOCADAS=""
SEM_TASK=""

while IFS= read -r arquivo; do
  [ -n "$arquivo" ] || continue
  achou=""
  while IFS=$'\t' read -r id status suite arquivos; do
    case " $arquivos " in
      *" $arquivo "*) achou="$id"; break ;;
    esac
  done < "$TMP"
  if [ -n "$achou" ]; then
    case " $TASKS_TOCADAS " in
      *" $achou "*) : ;;
      *) TASKS_TOCADAS="$TASKS_TOCADAS $achou" ;;
    esac
  else
    SEM_TASK="$SEM_TASK  - $arquivo
"
  fi
done <<< "$PREP"

QTD_TASKS="$(printf '%s\n' $TASKS_TOCADAS | grep -c . || true)"

# --------------------------------------------------------------------------
# 1. Commit misturando tasks
# --------------------------------------------------------------------------
if [ "${QTD_TASKS:-0}" -gt 1 ]; then
  expx_barra "$MODO" "$RAIZ" "$HOOK" "commit mistura tasks:$TASKS_TOCADAS" \
"mergex/commit-por-task — o commit mistura mais de uma task

Tasks no que está preparado:$TASKS_TOCADAS

Um commit por task, no momento em que ela fecha (regra 3 da mergex). A mensagem
de commit é o que permite entender a intenção de cada mudança num merge difícil,
meses depois, por quem não participou do trabalho. Misturar tasks apaga isso.

O que fazer:
  - Prepare e commite uma task de cada vez:
      git reset
      git add <arquivos da task>   # por caminho explícito, nunca 'git add .'
      git commit -m '<tipo>(<escopo>): <título da task>'"
fi

# --------------------------------------------------------------------------
# 2. Task não concluída ou com suíte não verde
# --------------------------------------------------------------------------
for id in $TASKS_TOCADAS; do
  linha="$(grep -F "$id	" "$TMP" | head -1)" || continue
  status="$(printf '%s' "$linha" | cut -f2)"
  suite="$(printf '%s' "$linha" | cut -f3)"

  if [ -n "$status" ] && [ "$status" != "concluida" ]; then
    expx_barra "$MODO" "$RAIZ" "$HOOK" "task $id em status $status" \
"mergex/commit-por-task — task ainda não concluída

Task:   $id
Status: $status

O commit acontece quando a task fecha: os dois testes escritos, a suíte inteira
verde, e a task marcada 'concluida' em tasks.md. Antes disso, não commita.

O que fazer:
  - Termine a task, rode a suíte inteira, marque 'status: concluida' e
    'suite: verde' no tasks.md — no frontmatter e na prosa — e commite então."
  fi

  if [ -n "$suite" ] && [ "$suite" != "verde" ]; then
    expx_barra "$MODO" "$RAIZ" "$HOOK" "task $id com suite $suite" \
"mergex/commit-por-task — suíte não está verde

Task:  $id
Suíte: $suite

Commit com suíte vermelha põe no histórico um ponto que não compila ou não
passa. Quem bisecar esse histórico depois cai justamente aí.

O que fazer:
  - Faça a suíte inteira passar — não só os testes novos.
  - Atualize 'suite: verde' no tasks.md e commite."
  fi
done

# --------------------------------------------------------------------------
# 3. Nenhuma task reconhecida
# --------------------------------------------------------------------------
# Não é violação por si: pode ser commit de artefato da própria mergex
# (ENTREGA.md, PR.md). O arquivo-fora-do-plano é quem trata escopo.
if [ "${QTD_TASKS:-0}" = "0" ] && [ -n "$SEM_TASK" ]; then
  exit 0
fi

expx_permite "$RAIZ" "$HOOK" "commit de uma task concluida com suite verde"
