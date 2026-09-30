#!/usr/bin/env bash
# git-perigoso — PreToolUse em execução de comando.
#
# Barra as operações onde o erro não tem volta:
#   - push forçado, em qualquer forma
#   - push ou commit direto na branch principal
#   - reescrita de histórico já enviado
#   - descarte de alteração local
#   - limpeza destrutiva de arquivo não rastreado
#
# O falso positivo aqui é raro; o custo do falso negativo é o trabalho de
# outra pessoa perdido.
#
# Modo padrão: BLOQUEIO (hook de segurança, falha fechada).
#
# Regra 1 do desenho: casar com PRECISÃO. Uma regra frouxa que barre qualquer
# coisa contendo "push" atrapalha o dev o dia inteiro. Todo casamento aqui
# exige `git` como programa e a forma real da opção.

HOOK="git-perigoso"
PADRAO="bloqueio"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=base.sh
. "$DIR/base.sh"

ENTRADA="$(cat)"
[ "$(printf '%s' "$ENTRADA" | jq -r '.tool_name // empty' 2>/dev/null)" = "Bash" ] || exit 0

CMD="$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -n "$CMD" ] || exit 0

# Saída antecipada: se não invoca git, este hook não tem assunto.
# É o que mantém o custo perto de zero na maioria esmagadora das chamadas.
printf '%s' "$CMD" | grep -Eq '(^|[;&|`(){}[:space:]])git([[:space:]]|$)' || exit 0

CWD="$(printf '%s' "$ENTRADA" | jq -r '.cwd // empty' 2>/dev/null)"
RAIZ="$(expx_raiz "${CWD:-$PWD}")"

MODO="$(expx_modo "$HOOK" "$PADRAO" "$RAIZ")"
[ "$MODO" = "desligado" ] && exit 0

# Qual é a branch principal deste repositório: pergunta ao repositório,
# não adivinha. Sem estado próprio (regra 6 do contrato).
principal() {
  local p
  p="$(git -C "$RAIZ" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null)"
  p="${p#origin/}"
  if [ -z "$p" ]; then
    for c in main master; do
      if git -C "$RAIZ" show-ref --verify --quiet "refs/heads/$c"; then p="$c"; break; fi
    done
  fi
  printf '%s\n' "${p:-main}"
}

barra() { expx_barra "$MODO" "$RAIZ" "$HOOK" "$1" "$2"; }

# --------------------------------------------------------------------------
# 1. Push forçado — em qualquer forma
# --------------------------------------------------------------------------
# --force, -f, --force-with-lease, --force-if-includes e o +refspec.
if printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+push([[:space:]]|$)'; then
  if printf '%s' "$CMD" | grep -Eq '[[:space:]](--force([-a-z]*)?|-f)([[:space:]=]|$)' \
  || printf '%s' "$CMD" | grep -Eq 'push[^|;&]*[[:space:]]\+[A-Za-z0-9_./-]+:'; then
    barra "push forcado" \
"mergex/git-perigoso — push forçado

Comando: $CMD

Push forçado reescreve o que já está no remoto. O commit de outra pessoa que
estiver naquela branch desaparece do histórico, e ela só descobre no próximo
pull — quando já perdeu o trabalho.

Isto é bloqueado em qualquer forma: --force, -f, --force-with-lease e +refspec.

O que fazer:
  - Divergiu da base? Rebaseie ou faça merge da base na sua branch e empurre
    normalmente.
  - Precisa desfazer algo já enviado? Faça um commit que reverte (git revert).
    O histórico cresce, mas ninguém perde nada.
  - É mesmo necessário reescrever? É decisão humana, fora da mergex."
  fi
fi

# --------------------------------------------------------------------------
# 2. Push ou commit direto na branch principal
# --------------------------------------------------------------------------
PRINCIPAL="$(principal)"
ATUAL="$(git -C "$RAIZ" branch --show-current 2>/dev/null)"

# commit: barra quando a branch ativa É a principal
if printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+commit([[:space:]]|$)'; then
  if [ -n "$ATUAL" ] && [ "$ATUAL" = "$PRINCIPAL" ]; then
    barra "commit na branch principal" \
"mergex/git-perigoso — commit direto na branch principal

Branch ativa: $ATUAL (a principal deste repositório)

O trabalho da mergex nasce numa branch própria (E0), antes da primeira linha
de código. Commit direto na principal pula a revisão inteira: não há PR, não
há classificação de atenção humana, não há portão.

O que fazer:
  - Crie a branch do trabalho e commite nela:
      git switch -c <tipo>/<trabalho_id>-<slug>
  - Ou acione /mergex-abrir, que faz isso registrando a branch no ENTREGA.md."
  fi
fi

# push explícito para a principal
if printf '%s' "$CMD" | grep -Eq "git([[:space:]]+-[^[:space:]]+)*[[:space:]]+push([[:space:]]|$)"; then
  if printf '%s' "$CMD" | grep -Eq "[[:space:]](HEAD:)?(refs/heads/)?${PRINCIPAL}([[:space:]]|$)" \
  || { [ -n "$ATUAL" ] && [ "$ATUAL" = "$PRINCIPAL" ]; }; then
    barra "push na branch principal" \
"mergex/git-perigoso — push direto na branch principal

Alvo: $PRINCIPAL

Código entra na principal por pull request revisado, não por push direto.
Integrar é decisão humana (regra 16 da mergex).

O que fazer:
  - Empurre a branch do trabalho e abra o PR:
      git push -u origin <sua-branch>
  - Ou acione /mergex-pr, que sobe a branch e abre o PR pelos artefatos."
  fi
fi

# --------------------------------------------------------------------------
# 3. Reescrita de histórico já enviado
# --------------------------------------------------------------------------
if printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+(rebase|filter-branch|filter-repo)([[:space:]]|$)' \
|| printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+commit[^|;&]*[[:space:]]--amend([[:space:]]|$)' \
|| printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+reset[^|;&]*[[:space:]]--hard([[:space:]]|$)'; then
  # Só é perigoso se o que seria reescrito já foi enviado ao remoto.
  # Sem upstream, é histórico local: não barra (precisão, regra 1).
  UP="$(git -C "$RAIZ" rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"
  if [ -n "$UP" ]; then
    JA_ENVIADO="$(git -C "$RAIZ" rev-list --count "$UP..HEAD" 2>/dev/null || echo 0)"
    # HEAD == upstream => todo commit local já está no remoto: reescrever mexe
    # no que os outros já têm.
    if [ "${JA_ENVIADO:-0}" = "0" ]; then
      barra "reescrita de historico ja enviado" \
"mergex/git-perigoso — reescrita de histórico já enviado

Comando: $CMD
Branch:  ${ATUAL:-?} (acompanha $UP)

Todos os commits desta branch já estão no remoto. Reescrevê-los troca os
identificadores do que outras pessoas já baixaram — e a reconciliação delas
vira conflito ou perda.

O que fazer:
  - Desfazer algo já enviado: git revert <commit> (novo commit, nada some).
  - Ajustar só o que ainda é local: confira com
      git log --oneline $UP..HEAD
    Se estiver vazio, não há nada local para ajustar.
  - Reescrever mesmo assim é decisão humana, fora da mergex."
    fi
  fi
fi

# --------------------------------------------------------------------------
# 4. Descarte de alteração local
# --------------------------------------------------------------------------
# git checkout -- <path> / git restore <path> / git stash drop|clear
DESCARTA=0
if printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+checkout[^|;&]*[[:space:]]--([[:space:]]|$)'; then
  DESCARTA=1
elif printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+rest''ore([[:space:]]|$)'; then
  # Só desfazer o stage nao toca a arvore de trabalho e nao destroi nada.
  # Barrar isso seria o falso positivo que atrapalha o dia inteiro.
  if printf '%s' "$CMD" | grep -Eq '[[:space:]]--worktree([[:space:]]|=|$)'; then
    DESCARTA=1
  elif printf '%s' "$CMD" | grep -Eq '[[:space:]]--staged([[:space:]]|=|$)'; then
    DESCARTA=0
  else
    DESCARTA=1
  fi
elif printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+stash[[:space:]]+(drop|clear)([[:space:]]|$)'; then
  DESCARTA=1
fi
if [ "$DESCARTA" = "1" ]; then
  SUJO="$(git -C "$RAIZ" status --porcelain 2>/dev/null | head -20)"
  if [ -n "$SUJO" ]; then
    barra "descarte de alteracao local" \
"mergex/git-perigoso — descarte de alteração local

Comando: $CMD

Há alteração não commitada na árvore. Este comando a joga fora, e o
versionador não guarda cópia do que nunca foi commitado — não há como voltar.

A alteração pode não ser sua: pode ser trabalho de quem estava na máquina.

Pendente agora:
$SUJO

O que fazer:
  - Guardar antes de descartar:  git stash push -m 'antes de descartar'
  - Ver o que exatamente se perde: git diff
  - Descartar mesmo assim é decisão humana, fora da mergex."
  fi
fi

# --------------------------------------------------------------------------
# 5. Limpeza destrutiva de arquivo não rastreado
# --------------------------------------------------------------------------
if printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+clean([[:space:]]|$)'; then
  if printf '%s' "$CMD" | grep -Eq '[[:space:]]-[a-zA-Z]*[fdx]'; then
    ALVOS="$(git -C "$RAIZ" clean -nd 2>/dev/null | head -20)"
    barra "limpeza destrutiva" \
"mergex/git-perigoso — limpeza destrutiva de arquivos não rastreados

Comando: $CMD

git clean apaga arquivo que o versionador nunca viu. Não há histórico, não há
stash, não há recuperação. Arquivo de ambiente, dado local e trabalho ainda
não commitado de outra pessoa somem juntos.

Seria removido:
${ALVOS:-  (não foi possível pré-visualizar)}

O que fazer:
  - Veja antes, sempre:  git clean -nd
  - Remova só o que você conhece, pelo caminho, com rm.
  - Limpar em bloco é decisão humana, fora da mergex."
  fi
fi

expx_permite "$RAIZ" "$HOOK" "comando git sem operacao destrutiva"
