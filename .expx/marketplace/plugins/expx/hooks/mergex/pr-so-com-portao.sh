#!/usr/bin/env bash
# pr-so-com-portao — PreToolUse em execução de comando.
#
# Barra o push e a abertura de pull request quando o portão de prontidão não
# registrou PRONTO no rastro.
#
# O portão (E2) barra e explica; sem ele, o trabalho incompleto chega ao
# revisor — que é exatamente o recurso caro que a skill existe para poupar.
#
# Modo padrão: AVISO (hook de método). FALHA ABERTA.

HOOK="pr-so-com-portao"
PADRAO="aviso"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../comum/base.sh
. "$DIR/../comum/base.sh"

ENTRADA="$(cat)"
[ "$(printf '%s' "$ENTRADA" | jq -r '.tool_name // empty' 2>/dev/null)" = "Bash" ] || exit 0

CMD="$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -n "$CMD" ] || exit 0

# Dois gatilhos: push da branch, e abertura de PR pela ferramenta do serviço.
ACAO=""
if printf '%s' "$CMD" | grep -Eq 'git([[:space:]]+-[^[:space:]]+)*[[:space:]]+push([[:space:]]|$)'; then
  ACAO="push"
elif printf '%s' "$CMD" | grep -Eq '(^|[;&|[:space:]])(gh|glab)[[:space:]]+(pr|mr)[[:space:]]+create([[:space:]]|$)'; then
  ACAO="abertura de pull request"
fi
[ -n "$ACAO" ] || exit 0

CWD="$(printf '%s' "$ENTRADA" | jq -r '.cwd // empty' 2>/dev/null)"
RAIZ="$(expx_raiz "${CWD:-$PWD}")"

MODO="$(expx_modo "$HOOK" "$PADRAO" "$RAIZ")"
[ "$MODO" = "desligado" ] && exit 0

# --------------------------------------------------------------------------
# O portão registrou PRONTO?
# --------------------------------------------------------------------------
# Sem estado próprio: a resposta está no ENTREGA.md (campo `portao`) e no
# rastro (evento `veredito_emitido` do E2). O ENTREGA.md é a fonte primária.
ENTREGA="$(ls -t "$RAIZ"/docs/entregas/*/ENTREGA.md 2>/dev/null | head -1)"

# Sem entrega registrada, não há trabalho da mergex em curso: não é assunto
# deste hook. Push de outra coisa não pode ser atrapalhado (precisão, regra 1).
[ -n "$ENTREGA" ] || exit 0

PORTAO="$(grep -E '^portao:' "$ENTREGA" 2>/dev/null | head -1 | sed 's/^portao:[[:space:]]*//' | tr -d '"' | tr -d "'" | tr -d '[:space:]')"

case "$PORTAO" in
  pronto)
    expx_permite "$RAIZ" "$HOOK" "portao pronto: $ACAO liberado"
    ;;
  bloqueado)
    MOTIVO="o portão de prontidão registrou BLOQUEADO"
    DETALHE="O portão barrou este trabalho. Ele não segue para revisão enquanto o que
falta não for corrigido — a mergex não maquia entrega incompleta (regra 6)."
    ;;
  *)
    MOTIVO="o portão de prontidão ainda não rodou"
    DETALHE="O campo 'portao' do ENTREGA.md está '${PORTAO:-null}': o E2 ainda não deu
veredito sobre esta entrega."
    ;;
esac

TRAB="$(basename "$(dirname "$ENTREGA")")"

expx_barra "$MODO" "$RAIZ" "$HOOK" "$ACAO sem portao pronto ($TRAB)" \
"mergex/pr-so-com-portao — $ACAO antes do portão de prontidão

Trabalho: $TRAB
Portão:   ${PORTAO:-não registrado}

$DETALHE

O portão roda as dez verificações (V1..V10): tasks concluídas, suíte verde,
dois testes por task, teste de regressão, QA, auditoria, bloqueios, modo legado,
arquivos fora do escopo e segredo no diff.

O que fazer:
  - Rode o portão:  /mergex-check
  - PRONTO   → o push e o PR seguem normalmente.
  - BLOQUEADO → a saída nomeia o que falta e onde corrigir."
