#!/usr/bin/env bash
# legadox · reversao-declarada · PreToolUse em escrita no tasks.md
#
# Regra inviolavel 7: toda task de raio MEDIO ou ALTO declara como se reverte,
# inclusive os efeitos que o versionador nao desfaz.
#
# Barra "status: concluida" em task de raio MEDIO ou ALTO sem plano de reversao
# preenchido. Nasce em aviso.
#
# "Reverter o commit" nao e plano de reversao: o commit nao desfaz dado ja gravado
# no formato novo, migracao aplicada, flag ligada, cache quente, mensagem enviada,
# arquivo gerado, webhook disparado.

set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/comum/legadox-comum.sh"

HOOK="reversao-declarada"

legadox_saida_rapida
legadox_deve_atuar || legadox_permitir   # so MEDIO e ALTO

ALVO="$(legadox_arquivo_alvo)"
[ -z "$ALVO" ] && legadox_permitir
case "$ALVO" in *tasks.md) ;; *) legadox_permitir ;; esac

# O conteudo que esta sendo escrito. Write manda o arquivo inteiro; Edit manda o
# trecho novo. Nos dois casos, o que importa e se ha conclusao sendo declarada aqui.
CONTEUDO="$(legadox_campo '.tool_input.content')"
[ -z "$CONTEUDO" ] && CONTEUDO="$(legadox_campo '.tool_input.new_string')"
[ -z "$CONTEUDO" ] && legadox_permitir

# Ha task sendo marcada como concluida?
printf '%s' "$CONTEUDO" | grep -qiE 'status:[[:space:]]*conclu' || legadox_permitir

# A conferencia e POR TASK, nao pelo arquivo inteiro.
#
# Procurar "reversao" no conteudo todo faz uma task com plano de reversao valer
# por todas as outras do mesmo arquivo: bastava uma declarar, e as demais fechavam
# de graca. Um `tasks.md` sempre teve varias tasks, e o formato condensado
# (`kind: plano`, sprint de fase unica num arquivo so) so tornou o arquivo maior.
#
# Recorta o bloco de cada task pelo marcador `- id:` e confere cada bloco que
# esta indo para `concluida`.
SEM_REVERSAO="$(printf '%s' "$CONTEUDO" | awk '
  function avalia(   b) {
    if (id == "" || !concluida) return
    b = tolower(bloco)
    gsub(/ã/, "a", b)
    if (b !~ /revers(a|ao)|como reverter|rollback/) { print id; return }
    if (b ~ /\{\{[^}]*\}\}/)                        { print id; return }
    if (b ~ /a definir|pendente|nao se aplica|n\/a/)  { print id; return }
  }
  /^[ \t]*-[ \t]*id:/ {
    avalia()
    id = $0; sub(/^[ \t]*-[ \t]*id:[ \t]*/, "", id); sub(/[ \t]+$/, "", id)
    bloco = ""; concluida = 0
  }
  { bloco = bloco "\n" $0 }
  /status:[ \t]*conclu/ { concluida = 1 }
  END { avalia() }
')"

# Sem marcador `- id:` no conteudo (Edit de um trecho solto, por exemplo), cai na
# conferencia antiga sobre o texto todo: e o melhor que da para afirmar ali.
tem_reversao() {
  if printf '%s' "$CONTEUDO" | grep -qE '^[ \t]*-[ \t]*id:'; then
    [ -z "$SEM_REVERSAO" ]
    return
  fi
  printf '%s' "$CONTEUDO" | grep -qiE 'revers(a|ã)o|como reverter|rollback' || return 1
  # Presente mas vazio ou por preencher nao conta.
  printf '%s' "$CONTEUDO" | grep -iA4 -E 'revers(a|ã)o|como reverter|rollback' \
    | grep -qE '\{\{[^}]*\}\}' && return 1
  printf '%s' "$CONTEUDO" | grep -iA2 -E 'revers(a|ã)o|como reverter|rollback' \
    | grep -qiE 'a definir|pendente|n/?a$|nao se aplica|não se aplica' && return 1
  return 0
}

if tem_reversao; then
  legadox_rastro "task_concluida" "ok" "reversao declarada" "$HOOK" "$ALVO"
  legadox_permitir
fi

FAIXA="$(legadox_faixa)"
legadox_decidir "$HOOK" "aviso" \
"Task marcada como concluida sem plano de reversao declarado.

Arquivo: $ALVO
Faixa do raio: $FAIXA

Em raio MEDIO ou ALTO toda task declara como se reverte — e \"reverter o commit\"
nao e plano de reversao. O versionador desfaz o codigo; ele nao desfaz o efeito.

Percorra o inventario antes de concluir:

  - dado ja gravado no formato novo    como se converte de volta
  - migracao aplicada                  ha migracao de volta escrita e testada
  - feature flag                       qual flag desliga, e onde ela vive
  - cache                              o que precisa ser invalidado
  - mensagem ja enviada                e-mail, push, webhook — nao volta; como se comunica
  - arquivo ou remessa ja gerada       onde esta, quem consumiu
  - integracao de saida                o terceiro ja recebeu; ha estorno

Efeito irreversivel obriga aprovacao humana, seja qual for o raio.

O caminho: preencha o plano de reversao no bloco da task antes de marca-la concluida.

Regra inviolavel 7." "$ALVO"
