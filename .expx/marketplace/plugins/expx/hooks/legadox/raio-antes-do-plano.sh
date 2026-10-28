#!/usr/bin/env bash
# legadox · raio-antes-do-plano · PreToolUse em escrita em sprint-*/
#
# Regra inviolavel 2: nenhum plano e gerado sem o raio calculado e escrito em
# docs/legado/raio/<trabalho_id>.md.
#
# Nasce em aviso. O raio e barato de calcular e o hook e facil de obedecer, mas
# a deteccao do que e "arquivo de plano" e por convencao de caminho — e convencao
# de caminho e exatamente o tipo de coisa que gera falso positivo em repo alheio.

set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/comum/legadox-comum.sh"

HOOK="raio-antes-do-plano"

legadox_saida_rapida

ALVO="$(legadox_arquivo_alvo)"
[ -z "$ALVO" ] && legadox_permitir

# So fala sobre arquivo de plano: sprint-*/ da sprintx, e os planos da runx.
e_plano=1
case "$ALVO" in
  *sprint-*/*|*/fases/*|*tasks.md|*ORQUESTRADOR.md|*PLANO.md) e_plano=0 ;;
esac
[ "$e_plano" -eq 0 ] || legadox_permitir

# O proprio arquivo de raio nunca e barrado.
case "$ALVO" in docs/legado/*) legadox_permitir ;; esac

RAIO="$(legadox_arquivo_raio)"
[ -n "$RAIO" ] && { legadox_rastro "arquivo_alterado" "ok" "plano com raio calculado" "$HOOK" "$ALVO"; legadox_permitir; }

ID="$(legadox_trabalho_id)"
if [ -z "$ID" ]; then
  ALVO_MSG="Nao ha .expx/trabalho-atual.json, entao nao da para saber qual trabalho este plano
atende nem procurar o arquivo de raio correspondente."
else
  ALVO_MSG="O trabalho corrente e \"$ID\", mas docs/legado/raio/$ID.md nao existe."
fi

legadox_decidir "$HOOK" "aviso" \
"Plano sendo gerado sem raio de impacto calculado.

Arquivo alvo: $ALVO
$ALVO_MSG

O raio decide quais camadas do legadox valem para este trabalho — inclusive o
orcamento de mudanca e a necessidade de caracterizacao. Gerar o plano antes dele
e planejar sem saber o que o plano precisa conter.

O caminho: rode /legadox-raio antes de escrever o plano.

Regra inviolavel 2." "$ALVO"
