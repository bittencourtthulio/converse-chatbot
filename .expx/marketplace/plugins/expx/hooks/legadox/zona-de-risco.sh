#!/usr/bin/env bash
# legadox · zona-de-risco · PreToolUse em ferramentas de escrita
#
# Camada 11, regra inviolavel 8.
# Se o arquivo alvo esta numa zona de risco declarada no PERFIL.md, verifica se as
# perguntas obrigatorias daquela zona foram respondidas no arquivo do raio.
# Nao foram -> BLOQUEIA desde o inicio, sem passar por modo aviso.
#
# E a unica excecao de metodo a adocao gradual: zona de risco e onde errar nao e
# bug, e processo. O custo do falso positivo ali e pequeno perto do falso negativo.

set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/comum/legadox-comum.sh"

HOOK="zona-de-risco"

legadox_saida_rapida

ALVO="$(legadox_arquivo_alvo)"
[ -z "$ALVO" ] && legadox_permitir

# Artefato do proprio metodo nunca e barrado: e assim que as respostas sao escritas.
case "$ALVO" in docs/legado/*|docs/eventos/*|.expx/*) legadox_permitir ;; esac

PERFIL="$LEGADO/PERFIL.md"

# Extrai as zonas do PERFIL: nome da zona e as pastas que a compoem.
# Le a secao de zonas de risco; cada zona declara "Pastas e arquivos que a compoem".
zona_do_arquivo() {
  local alvo="$1" zona_atual="" linha caminho
  while IFS= read -r linha; do
    case "$linha" in
      *Zona:*)
        zona_atual="$(printf '%s' "$linha" | sed 's/.*Zona:[[:space:]]*//; s/[[:space:]]*$//; s/[*_`]//g')"
        ;;
      *Pastas*|*pastas*)
        [ -z "$zona_atual" ] && continue
        # Colhe caminhos plausiveis da linha: tokens com / ou extensao conhecida.
        for caminho in $(printf '%s' "$linha" | tr ',;`*' ' ' | tr -s ' '); do
          case "$caminho" in
            */*|*.php|*.ts|*.js|*.py|*.rb|*.go|*.cs|*.java)
              caminho="${caminho#./}"; caminho="${caminho%/}"
              [ -z "$caminho" ] && continue
              case "$alvo" in
                "$caminho"|"$caminho"/*)
                  printf '%s\n' "$zona_atual"; return 0 ;;
              esac
              ;;
          esac
        done
        ;;
    esac
  done <"$PERFIL"
  return 1
}

ZONA="$(zona_do_arquivo "$ALVO" 2>/dev/null || true)"
[ -z "$ZONA" ] && legadox_permitir

# Zona tocada. As respostas vivem no arquivo do raio do trabalho.
RAIO="$(legadox_arquivo_raio)"

if [ -z "$RAIO" ]; then
  legadox_decidir "$HOOK" "bloqueio" \
"O arquivo $ALVO esta na zona de risco \"$ZONA\", declarada em docs/legado/PERFIL.md.

Nao ha arquivo de raio para o trabalho corrente, entao as perguntas obrigatorias da
zona (Camada 11) nao foram respondidas.

O caminho: rode /legadox-raio para calcular o raio deste trabalho e responder as
perguntas da zona. So depois altere o arquivo.

Regra inviolavel 8 — zona de risco tocada obriga as perguntas respondidas antes do plano." "$ALVO"
fi

# Confere se a secao de perguntas da zona esta de fato preenchida, nao so presente.
# Preenchida = a secao existe e nao restou marcador {{...}} nem resposta vazia.
if ! grep -qiE 'pergunta' "$RAIO" 2>/dev/null; then
  legadox_decidir "$HOOK" "bloqueio" \
"O arquivo $ALVO esta na zona de risco \"$ZONA\".

O arquivo de raio ${RAIO#"$RAIZ"/} nao tem a secao de perguntas obrigatorias da zona.

O caminho: responda as seis perguntas minimas da Camada 11 (mais as especificas
desta zona, declaradas no PERFIL) e registre-as no arquivo do raio antes de alterar.

Regra inviolavel 8." "$ALVO"
fi

if grep -qE '\{\{[^}]*\}\}' "$RAIO" 2>/dev/null; then
  PENDENTES="$(grep -oE '\{\{[^}]*\}\}' "$RAIO" 2>/dev/null | sort -u | head -5 | tr '\n' ' ')"
  legadox_decidir "$HOOK" "bloqueio" \
"O arquivo $ALVO esta na zona de risco \"$ZONA\".

O arquivo de raio ${RAIO#"$RAIZ"/} ainda tem marcadores por preencher: $PENDENTES

O caminho: complete as respostas das perguntas da zona antes de alterar o arquivo.
Marcador nao substituido e pergunta nao respondida.

Regra inviolavel 8." "$ALVO"
fi

legadox_rastro "arquivo_alterado" "ok" "zona \"$ZONA\" com perguntas respondidas" "$HOOK" "$ALVO"
legadox_permitir
