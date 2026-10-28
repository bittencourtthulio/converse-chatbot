#!/usr/bin/env bash
# legadox · orcamento-de-mudanca · PreToolUse em ferramentas de escrita
#
# Camada 5, regra inviolavel 6: o orcamento por task nao e estourado em silencio.
#
# Conta arquivos e linhas ja alterados na task e compara com o teto da faixa:
#   BAIXO  5 arquivos / 150 linhas      (nao atua — hook de metodo nao roda em BAIXO)
#   MEDIO  3 arquivos /  80 linhas
#   ALTO   2 arquivos /  40 linhas
#
# Este e o hook que impede o classico "a IA refatorou 40 arquivos para corrigir um
# rotulo". Impossivel garantir por instrucao porque o estouro e gradual: cada
# arquivo a mais parece razoavel sozinho.
#
# Nasce em aviso. Vai gerar dado interessante rapido: quantas vezes o teto e
# tocado, e em que faixa.

set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/comum/legadox-comum.sh"

HOOK="orcamento-de-mudanca"

legadox_saida_rapida
legadox_deve_atuar || legadox_permitir   # so MEDIO e ALTO

ALVO="$(legadox_arquivo_alvo)"
[ -z "$ALVO" ] && legadox_permitir

FAIXA="$(legadox_faixa)"
case "$FAIXA" in
  ALTO)  TETO_ARQ=2; TETO_LIN=40 ;;
  MEDIO) TETO_ARQ=3; TETO_LIN=80 ;;
  *)     legadox_permitir ;;
esac

# Os tetos sao editaveis na secao de limiares do PERFIL. O valor do PERFIL vence.
#
# Uma passada de awk, nao uma cadeia de greps: este bloco roda em toda escrita, e a
# versao anterior subia seis processos so para ler dois numeros de uma linha.
PERFIL="$LEGADO/PERFIL.md"
if [ -f "$PERFIL" ]; then
  # Sem IGNORECASE (extensao do gawk, ignorada pelo awk do macOS): tudo comparado
  # em minusculas, a mao. Ver a mesma nota em comum/legadox-comum.sh.
  TETOS="$(awk -v faixa="$FAIXA" '
    BEGIN { fx = tolower(faixa); a = ""; l = "" }
    {
      linha = tolower($0)
      if (linha ~ ("^[[:space:]]*" fx "[[:space:]]") && linha ~ /arquivo/) {
        if (match(linha, /[0-9]+[[:space:]]*arquivo/))
          { s = substr(linha, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); a = s }
        if (match(linha, /[0-9]+[[:space:]]*linha/))
          { s = substr(linha, RSTART, RLENGTH); gsub(/[^0-9]/, "", s); l = s }
        print a " " l; exit
      }
    }' "$PERFIL" 2>/dev/null || true)"
  if [ -n "$TETOS" ]; then
    A="${TETOS%% *}"; L="${TETOS##* }"
    case "$A" in ''|*[!0-9]*) ;; *) TETO_ARQ="$A" ;; esac
    case "$L" in ''|*[!0-9]*) ;; *) TETO_LIN="$L" ;; esac
  fi
fi

command -v git >/dev/null 2>&1 || legadox_permitir
git -C "$RAIZ" rev-parse --git-dir >/dev/null 2>&1 || legadox_permitir

# O que conta (Camada 5): so codigo de producao.
# Nao contam testes, documentacao, nem os artefatos de docs/legado/.
# Esta funcao e a autoridade sobre o que conta. Os pathspecs do git abaixo sao
# apenas uma otimizacao; o que decide de fato e este filtro.
conta_para_orcamento() {
  case "$1" in
    docs/*|.expx/*|.claude/*|.opencode/*|.hooks/*) return 1 ;;
    .git/*|node_modules/*|vendor/*) return 1 ;;
    *.md|*.txt|*.lock|*.jsonl) return 1 ;;
    *test*|*Test*|*spec*|*Spec*|*__tests__*|*/tests/*|*/test/*) return 1 ;;
  esac
  return 0
}

# Estado atual do diff da task, contra HEAD. Cobre working tree e staged.
#
# --numstat sozinho varre o repositorio inteiro e e, de longe, a parte mais cara
# deste hook. Como so codigo de producao conta, os caminhos que nunca contam sao
# excluidos no proprio git, e nao depois no shell: em repo grande a diferenca e
# a que decide se o dev sente ou nao o hook.
ARQS=0; LINS=0; LISTA=""
while IFS=$'\t' read -r add del arq; do
  [ -z "${arq:-}" ] && continue
  conta_para_orcamento "$arq" || continue
  # Arquivo binario vem com "-" no lugar do numero.
  case "$add" in ''|*[!0-9]*) add=0 ;; esac
  case "$del" in ''|*[!0-9]*) del=0 ;; esac
  ARQS=$((ARQS+1))
  LINS=$((LINS+add+del))
  LISTA="$LISTA$arq"$'\n'
done < <(git -C "$RAIZ" diff HEAD --numstat -- \
           ':(exclude)docs/**' ':(exclude).hooks/**' ':(exclude)*.jsonl' ':(exclude).expx/**' ':(exclude).claude/**' \
           ':(exclude).opencode/**' ':(exclude)*.md' ':(exclude)*.txt' \
           ':(exclude)*.lock' ':(exclude)*test*' ':(exclude)*Test*' \
           ':(exclude)*spec*' ':(exclude)*Spec*' 2>/dev/null || true)

# O arquivo que esta prestes a ser escrito ainda nao esta no diff. Some 1 se for novo.
JA_NO_DIFF=0
printf '%s' "$LISTA" | grep -qxF "$ALVO" && JA_NO_DIFF=1
if [ "$JA_NO_DIFF" -eq 0 ] && conta_para_orcamento "$ALVO"; then
  ARQS=$((ARQS+1))
  LISTA="$LISTA$ALVO"$'\n'
fi

# Dentro do teto: registra e sai calado (regra 2).
if [ "$ARQS" -le "$TETO_ARQ" ] && [ "$LINS" -le "$TETO_LIN" ]; then
  legadox_permitir
fi

TASK="$(legadox_task_atual)"; [ -z "$TASK" ] && TASK="(task nao declarada no lock)"
GASTOS="$(printf '%s' "$LISTA" | grep -v '^$' | sed 's/^/  - /' | head -12)"

MOTIVO=""
[ "$ARQS" -gt "$TETO_ARQ" ] && MOTIVO="arquivos: $ARQS de $TETO_ARQ"
if [ "$LINS" -gt "$TETO_LIN" ]; then
  [ -n "$MOTIVO" ] && MOTIVO="$MOTIVO; "
  MOTIVO="${MOTIVO}linhas: $LINS de $TETO_LIN"
fi

legadox_decidir "$HOOK" "aviso" \
"Orcamento de mudanca estourado — $MOTIVO

Task: $TASK
Faixa do raio: $FAIXA
Teto da faixa: $TETO_ARQ arquivos, $TETO_LIN linhas de codigo de producao
Ja gasto nesta task: $ARQS arquivos, $LINS linhas

Arquivos de producao ja tocados:
$GASTOS

Quanto maior o risco, MENOR o orcamento — onde o estrago seria maior, a mudanca
precisa ser pequena o bastante para caber inteira na cabeca de um revisor.

O caminho NAO e estourar o teto. Na ordem:

  1. Quebrar a task. Quase sempre a saida certa: se ela toca mais arquivos que o
     teto, provavelmente ha duas tasks ali dentro, cada uma com sua costura e seu
     criterio de aceite.
  2. Rever o ponto de costura (Camada 4). Orcamento estourado costuma ser sintoma
     de costura escolhida no lugar errado.
  3. Escalar, se a mudanca for genuinamente indivisivel — declarando por que nao
     divide, o que aumenta o diff, e que alternativa foi avaliada e descartada.

Sem autorizacao registrada, a task nao segue com o orcamento excedido.

Regra inviolavel 6." "$ALVO"
