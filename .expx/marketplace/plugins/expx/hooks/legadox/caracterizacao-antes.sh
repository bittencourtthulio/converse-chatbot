#!/usr/bin/env bash
# legadox · caracterizacao-antes · PreToolUse em escrita de arquivo de implementacao
#
# Regra inviolavel 4: em raio MEDIO ou ALTO, nada e alterado antes de existir teste
# de caracterizacao passando no codigo atual.
#
# Hoje essa regra depende de o modelo lembrar dela quinze tasks adiante. Este hook
# a torna mecanica: le a lista de arquivos caracterizados do plano e barra a escrita
# em arquivo de implementacao que nao esteja nela.
#
# Nasce em aviso: a lista de caracterizados e lida por convencao do plano, e plano
# escrito fora do formato esperado geraria falso positivo.

set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/comum/legadox-comum.sh"

HOOK="caracterizacao-antes"

legadox_saida_rapida
legadox_deve_atuar || legadox_permitir   # so MEDIO e ALTO

ALVO="$(legadox_arquivo_alvo)"
[ -z "$ALVO" ] && legadox_permitir

# Nao se aplica a: artefatos do metodo, documentacao, config, e os proprios testes.
case "$ALVO" in
  docs/*|.expx/*|.claude/*|.opencode/*|*.md|*.json|*.yml|*.yaml|*.lock) legadox_permitir ;;
esac
case "$ALVO" in
  *test*|*Test*|*spec*|*Spec*|*__tests__*|*/tests/*|*/test/*) legadox_permitir ;;
esac

# Arquivo novo nao tem comportamento a congelar: caracterizacao nao se aplica.
[ -f "$RAIZ/$ALVO" ] || legadox_permitir

# A lista de caracterizados sai do arquivo do raio e do plano do trabalho.
# Convencao: o caminho do arquivo aparece numa linha que fala de caracterizacao.
esta_caracterizado() {
  local alvo="$1" base="${1##*/}"
  local fontes=""
  local raio; raio="$(legadox_arquivo_raio)"
  [ -n "$raio" ] && fontes="$raio"

  local id; id="$(legadox_trabalho_id)"
  if [ -n "$id" ]; then
    # Planos da sprintx e da runx, onde a task de caracterizacao e declarada.
    # O glob do shell cobre a profundidade util sem subir um find por escrita.
    local p g
    for p in "$RAIZ/docs/$id" "$RAIZ/docs/manutencao/$id"; do
      [ -d "$p" ] || continue
      for g in "$p"/*.md "$p"/*/*.md "$p"/*/*/*.md; do
        [ -f "$g" ] && fontes="$fontes $g"
      done
    done
  fi

  [ -z "${fontes// /}" ] && return 1

  # Um arquivo conta como caracterizado quando aparece perto da palavra
  # caracteriza(cao) — na mesma linha ou nas 3 seguintes. Uma passada so:
  # a versao anterior varria os mesmos arquivos duas vezes, por caminho e por nome.
  grep -ihA3 -E 'caracteriza' $fontes 2>/dev/null \
    | grep -qF -e "$alvo" -e "$base" && return 0
  return 1
}

if esta_caracterizado "$ALVO"; then
  legadox_rastro "arquivo_alterado" "ok" "arquivo caracterizado" "$HOOK" "$ALVO"
  legadox_permitir
fi

FAIXA="$(legadox_faixa)"
legadox_decidir "$HOOK" "aviso" \
"Alteracao em arquivo sem teste de caracterizacao declarado.

Arquivo alvo: $ALVO
Faixa do raio: $FAIXA

Em raio MEDIO ou ALTO o comportamento atual precisa estar congelado por teste antes
de qualquer alteracao — inclusive o comportamento errado, porque ha cliente
dependendo dele. O teste de caracterizacao nao julga se esta certo: registra o que e,
e precisa passar no codigo atual, sem modificacao nenhuma.

Nao encontrei $ALVO na lista de arquivos caracterizados do plano nem do arquivo de raio.

O caminho: rode /legadox-caracterizar para este arquivo, confirme que a suite passa
no codigo intocado, e so entao altere.

Se o teste ja existe e eu nao o encontrei, declare-o no plano numa linha que cite o
caminho do arquivo junto da palavra caracterizacao.

Regra inviolavel 4." "$ALVO"
