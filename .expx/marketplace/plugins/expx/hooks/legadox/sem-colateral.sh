#!/usr/bin/env bash
# legadox · sem-colateral · PostToolUse em ferramentas de escrita
#
# Camada 6, regra inviolavel 5: nenhuma melhoria colateral.
# Detecta diff que e so formatacao, renomeacao fora do escopo, reorganizacao de
# import, ou correcao automatica de estilo. Avisa e sugere registrar em DIVIDA.md.
#
# PostToolUse roda depois do sucesso e nao desfaz nada. O valor aqui e o modelo ver
# o aviso e reverter por conta, mais o registro no rastro.
#
# No PostToolUse o exit 2 NAO bloqueia e o stderr NAO chega ao modelo: o unico canal
# e JSON no stdout (hookSpecificOutput.additionalContext). Quem cuida disso e o
# legadox_falar da lib comum — nao escreva em stderr aqui.
#
# Heuristica mais confiavel primeiro (a do desenho): diff onde nenhum token
# nao-espaco mudou de posicao relativa e reformatacao. As demais sao acrescimo, e
# cada uma so fala quando sozinha explica o diff inteiro.
#
# Este e o hook mais fragil do conjunto — por isso e o ultimo e nasce em aviso.

set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/comum/legadox-comum.sh"

HOOK="sem-colateral"

# A Camada 6 vale em TODA faixa, inclusive BAIXO — e uma proibicao, nao uma etapa.
# Por isso aqui nao ha legadox_deve_atuar: basta o modo legado estar ativo.
legadox_saida_rapida

ALVO="$(legadox_arquivo_alvo)"
[ -z "$ALVO" ] && legadox_permitir

case "$ALVO" in
  docs/*|.expx/*|.claude/*|.opencode/*|*.md|*.lock) legadox_permitir ;;
esac

command -v git >/dev/null 2>&1 || legadox_permitir
git -C "$RAIZ" rev-parse --git-dir >/dev/null 2>&1 || legadox_permitir
git -C "$RAIZ" ls-files --error-unmatch "$ALVO" >/dev/null 2>&1 || legadox_permitir

# O diff do arquivo e lido UMA vez e reaproveitado pelas tres heuristicas.
# Rodar git diff por heuristica triplicava o custo do hook sem necessidade.
DIFF="$(git -C "$RAIZ" diff HEAD -- "$ALVO" 2>/dev/null || true)"
[ -z "$DIFF" ] && legadox_permitir

ADD="$(printf '%s\n' "$DIFF" | grep -c '^+[^+]' || true)"
DEL="$(printf '%s\n' "$DIFF" | grep -c '^-[^-]' || true)"
case "$ADD" in ''|*[!0-9]*) ADD=0 ;; esac
case "$DEL" in ''|*[!0-9]*) DEL=0 ;; esac
[ "$ADD" -eq 0 ] && [ "$DEL" -eq 0 ] && legadox_permitir

ACHADO=""

# --- Heuristica 1: reformatacao pura --------------------------------------
# Compara o diff normal com o diff que ignora todo espaco em branco. Se ignorando
# espaco nao sobra alteracao nenhuma, nenhum token mudou de posicao relativa:
# o diff e formatacao.
SEM_ESPACO="$(git -C "$RAIZ" diff HEAD -w --ignore-blank-lines --numstat -- "$ALVO" 2>/dev/null | head -1 || true)"
if [ -z "$SEM_ESPACO" ] && { [ "$ADD" -gt 0 ] || [ "$DEL" -gt 0 ]; }; then
  ACHADO="reformatacao: $((ADD+DEL)) linhas mudaram, mas nenhum token nao-espaco mudou de posicao relativa"
fi

# --- Heuristica 2: so imports reorganizados -------------------------------
if [ -z "$ACHADO" ]; then
  NAO_IMPORT="$(printf '%s\n' "$DIFF" \
    | grep -E '^[+-][^+-]' \
    | grep -vicE '^[+-][[:space:]]*(import|from|use|using|require|#include)\b' || true)"
  case "$NAO_IMPORT" in ''|*[!0-9]*) NAO_IMPORT=1 ;; esac
  if [ "$NAO_IMPORT" -eq 0 ] && [ $((ADD+DEL)) -gt 2 ]; then
    ACHADO="reorganizacao de import: todas as $((ADD+DEL)) linhas alteradas sao linhas de import"
  fi
fi

# --- Heuristica 3: troca em massa equilibrada (renomeacao) ----------------
# Muitas linhas, adicionadas e removidas na mesma proporcao, e nenhuma linha
# realmente nova: assinatura tipica de rename automatico.
if [ -z "$ACHADO" ] && [ "$ADD" -ge 8 ] && [ "$ADD" -eq "$DEL" ]; then
  ACHADO="possivel renomeacao em massa: $ADD linhas adicionadas e $DEL removidas, em equilibrio exato"
fi

[ -z "$ACHADO" ] && legadox_permitir

legadox_decidir "$HOOK" "aviso" \
"Possivel melhoria colateral em $ALVO

Sinal: $ACHADO

Em arquivo tocado e proibido renomear fora do escopo, reformatar, rodar corretor
automatico de estilo, reorganizar imports, atualizar dependencia, converter sintaxe
antiga, extrair metodo nao previsto no plano, remover codigo morto ou comentado, e
\"aproveitar e corrigir\" outro problema percebido.

Um diff de 400 linhas de formatacao esconde as 3 que importam, e revisao humana e a
unica defesa que sobra em legado.

Duas excecoes, so estas: mudanca exigida pela propria task, e formatacao automatica
imposta por hook do repositorio — que precisa ser declarada no fechamento.

O caminho: desfaca o que nao foi pedido (git checkout -- $ALVO recupera o arquivo
inteiro; um diff parcial precisa ser desfeito a mao) e registre o que incomodou em
docs/legado/DIVIDA.md: arquivo, o que foi visto, por que incomoda, risco de mexer.
Registro, nunca correcao.

Se este diff for legitimo — a mudanca que a task pediu de fato — siga; este hook
esta em modo aviso e nao barra nada.

Regra inviolavel 5." "$ALVO"
