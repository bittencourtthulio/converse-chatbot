#!/usr/bin/env bash
# legadox · aprovacao-em-raio-alto · PreToolUse em escrita de implementacao
#
# Regra inviolavel 9: raio ALTO obriga aprovacao humana explicita e registrada.
# Sem aprovacao no arquivo do raio -> bloqueia.
#
# Nasce em bloqueio, mesma justificativa da zona-de-risco: em raio ALTO o custo
# do falso positivo (um aviso a mais) e desprezivel perto do falso negativo
# (mudanca de alto impacto entrando sem ninguem ter dito sim, por escrito).

set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/comum/legadox-comum.sh"

HOOK="aprovacao-em-raio-alto"

legadox_saida_rapida

# So atua em ALTO. MEDIO e BAIXO passam direto.
[ "$(legadox_faixa)" = "ALTO" ] || legadox_permitir

ALVO="$(legadox_arquivo_alvo)"
[ -z "$ALVO" ] && legadox_permitir

# Artefatos do metodo e testes passam: sao justamente o que precisa ser escrito
# antes da implementacao. O bloqueio e sobre codigo de producao.
case "$ALVO" in
  docs/*|.expx/*|*.md) legadox_permitir ;;
esac
case "$ALVO" in
  *test*|*Test*|*spec*|*Spec*|*__tests__*|*/tests/*|*/test/*) legadox_permitir ;;
esac

RAIO="$(legadox_arquivo_raio)"
[ -z "$RAIO" ] && legadox_permitir   # sem raio, o raio-antes-do-plano e quem fala

# Aprovacao registrada = quem aprovou e quando, escritos no arquivo do raio.
#
# A deteccao procura o sinal POSITIVO ("Aprovado por: <nome>") em qualquer lugar do
# arquivo, e nao dentro de uma secao ancorada pela palavra "aprovacao" — o template
# pode nomear a secao de varias formas, e ancorar nela dava falso bloqueio quando a
# aprovacao estava registrada mas a secao tinha outro titulo.
nao_aprovado() {
  local linha
  # Linha de aprovacao preenchida: "Aprovado por: <algo que nao e marcador/pendencia>"
  linha="$(grep -iE 'aprovad[oa][[:space:]]*(por|em)[[:space:]]*:?' "$RAIO" 2>/dev/null | head -3 || true)"
  [ -z "$linha" ] && return 0

  # Preenchida de verdade: sobra conteudo depois dos dois-pontos.
  printf '%s' "$linha" | grep -qE '\{\{[^}]*\}\}' && return 0
  printf '%s' "$linha" | grep -qiE '(por|em)[[:space:]]*:?[[:space:]]*(pendente|a definir|aguardando|nao registrada|não registrada|n/?a)[[:space:]]*$' && return 0
  printf '%s' "$linha" | grep -qiE 'aprovad[oa][[:space:]]*(por|em)[[:space:]]*:?[[:space:]]*$' && return 0

  return 1
}

if nao_aprovado; then
  legadox_decidir "$HOOK" "bloqueio" \
"Raio ALTO sem aprovacao humana registrada.

Arquivo alvo: $ALVO
Arquivo de raio: ${RAIO#"$RAIZ"/}

A secao de aprovacao do arquivo do raio nao registra quem aprovou e quando.
Aprovacao verbal nao registrada nao conta como aprovacao.

O caminho: leve ao validador declarado na zona (secao 7 do PERFIL.md), obtenha o
sim por escrito, e registre no arquivo do raio no formato:

    Aprovado por: <nome do validador>
    Aprovado em:  <data>
    Risco declarado: <o que foi dito sobre o risco>

Urgencia nao dispensa a aprovacao — ela permite que a aprovacao seja dada na hora,
por escrito, com o risco declarado.

Regra inviolavel 9." "$ALVO"
fi

legadox_rastro "arquivo_alterado" "ok" "raio ALTO com aprovacao registrada" "$HOOK" "$ALVO"
legadox_permitir
