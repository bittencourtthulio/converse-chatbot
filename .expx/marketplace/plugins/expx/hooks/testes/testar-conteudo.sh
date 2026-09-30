#!/usr/bin/env bash
# Verificador do CONTEUDO das skills. Diferente do testar.sh, que roda os hooks
# Python, este confere que os markdown da runx dizem o que o metodo exige que
# digam. Markdown nao tem compilador: sem isso, uma regra pode sumir de um
# reference e ninguem percebe ate a proxima ocorrencia rodar errado.
#
# Cada asercao tem NOME. Uma asercao que so faz grep de palavra comum nao
# discrimina: as daqui casam estrutura (kind declarado, enum com os quatro
# valores, o caminho literal que os hooks buscam).
set -uo pipefail

R="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
S="$R/.claude/skills/runx"

ok=0; falhou=0
afirma() { # afirma <nome> <descricao> ; le o predicado do stdin (exit 0 = passa)
  local nome="$1" desc="$2"
  if "${@:3}"; then
    ok=$((ok+1)); printf '  ok    %-32s %s\n' "$nome" "$desc"
  else
    falhou=$((falhou+1)); printf '  FALHA %-32s %s\n' "$nome" "$desc"
  fi
}

# --- predicados -------------------------------------------------------------
# Todos recebem o texto ja lido; usam grep -q com padroes estruturais.

tem() { grep -qE "$2" "$1" 2>/dev/null; }
conta_ge() { [ "$(grep -cE "$2" "$1" 2>/dev/null)" -ge "$3" ]; }

echo "== andaime condensado =="

afirma kind-plano-declarado \
  "00-schema.md declara o kind plano" \
  tem "$S/references/00-schema.md" '^### .*`kind: plano`|kind: plano'

afirma kind-plano-tem-as-tres-chaves \
  "o kind plano traz sprint, fases e tasks no mesmo bloco" \
  bash -c 'awk "/kind: plano/,/^###|^## /" "'"$S"'/references/00-schema.md" \
    | grep -q "^sprint:" && awk "/kind: plano/,/^###|^## /" "'"$S"'/references/00-schema.md" \
    | grep -q "^fases:" && awk "/kind: plano/,/^###|^## /" "'"$S"'/references/00-schema.md" \
    | grep -q "^tasks:"'

afirma kind-compartilhado-intacto \
  "os kinds sprint, fases e tasks continuam declarados" \
  bash -c 'grep -q "### .sprint-NN/sprint.md. → .kind: sprint." "'"$S"'/references/00-schema.md" \
    && grep -q "### .sprint-NN/fases.md. → .kind: fases." "'"$S"'/references/00-schema.md" \
    && grep -q "### .sprint-NN/tasks.md. → .kind: tasks." "'"$S"'/references/00-schema.md"'

afirma template-condensado-existe \
  "TEMPLATE-plano-condensado.md existe" \
  test -f "$S/assets/TEMPLATE-plano-condensado.md"

# O template usa "---" tambem como separador de prosa entre os blocos de task, igual ao
# TEMPLATE-tasks.md. O que importa e que o FRONTMATTER seja um so: abre na linha 1 e
# fecha antes de qualquer prosa. Discrimina o caso real de erro — dois frontmatters em
# sequencia, que o parser dos hooks leria pela metade.
afirma template-condensado-frontmatter-unico \
  "o frontmatter do template abre na linha 1 e fecha antes da prosa" \
  bash -c 'f="'"$S"'/assets/TEMPLATE-plano-condensado.md"; \
    [ "$(head -1 "$f")" = "---" ] || exit 1; \
    fim=$(awk "NR>1 && /^---$/ {print NR; exit}" "$f"); \
    [ -n "$fim" ] || exit 1; \
    depois=$(awk -v f="$fim" "NR>f && NF {print; exit}" "$f"); \
    case "$depois" in ---*) exit 1 ;; esac; \
    awk -v f="$fim" "NR<f" "$f" | grep -q "^tasks:"'

afirma template-condensado-campos-da-task \
  "o template traz os 11 campos do contrato da task" \
  bash -c 'f="'"$S"'/assets/TEMPLATE-plano-condensado.md"; for c in id titulo objetivo arquivos \
    teste_integracao teste_funcional criterio_aceite depende_de paralelizavel status teste_regressao; do \
    grep -q "$c" "$f" || exit 1; done'

afirma e2-escolhe-formato \
  "02-plano.md diz quando usar cada formato" \
  bash -c 'grep -q "condensado" "'"$S"'/references/02-plano.md" \
    && grep -qE "1 sprint e 1 fase|uma sprint e uma fase" "'"$S"'/references/02-plano.md"'

afirma e2-condensado-no-caminho-dos-hooks \
  "o condensado e gravado em sprint-NN/tasks.md" \
  bash -c 'awk "/[Cc]ondensado/,0" "'"$S"'/references/02-plano.md" | grep -q "sprint-NN/tasks.md"'

afirma skill-documenta-condensado \
  "SKILL.md menciona o formato condensado" \
  tem "$S/SKILL.md" 'condensad'

echo "== suite parcial =="

afirma enum-suite-tem-parcial \
  "o enum suite lista parcial" \
  bash -c 'grep -E "^\| .suite." "'"$S"'/references/00-schema.md" | grep -q "parcial"'

afirma enum-suite-mantem-os-tres \
  "o enum suite mantem verde, vermelha e nao_executada" \
  bash -c 'l=$(grep -E "^\| .suite." "'"$S"'/references/00-schema.md"); \
    echo "$l" | grep -q "verde" && echo "$l" | grep -q "vermelha" && echo "$l" | grep -q "nao_executada"'

# Discrimina: a frase ANTIGA do 03-fix diz "Verde na suite inteira, NAO em um
# subconjunto" — um grep por "subconjunto" passaria com o texto errado. Exigimos a
# instrucao nova (rodar o subconjunto afetado) E a ausencia da proibicao antiga.
afirma e3-suite-parcial \
  "03-fix.md manda rodar o subconjunto afetado pela task" \
  bash -c 'f="'"$S"'/references/03-fix.md"; \
    grep -qE "subconjunto afetado|testes afetados pela task" "$f" \
    && ! grep -q "Verde na suíte inteira, não em um subconjunto" "$f"'

afirma e3-registra-suite-parcial \
  "03-fix.md manda gravar suite: parcial na task" \
  bash -c 'grep -q "suite: parcial\|suite. parcial" "'"$S"'/references/03-fix.md"'

# Discrimina: o 04-qa ja dizia "A suite inteira passa" no Passo 2. Exigimos que a
# exigencia esteja ligada ao VEREDITO e a task com suite parcial.
afirma e4-exige-completa \
  "04-qa.md liga a suite completa ao veredito" \
  bash -c 'f="'"$S"'/references/04-qa.md"; grep -qE "parcial" "$f" \
    && grep -qiE "antes de emitir o veredito|antes do veredito" "$f"'

echo "== investigador por evidencia =="

afirma investigador-corte-tres \
  "01-investigacao.md traz o corte de 3 arquivos" \
  bash -c 'grep -qE "3 \(tr[eê]s\)|tr[eê]s ou mais|>= ?3|3 ou mais" "'"$S"'/references/01-investigacao.md"'

afirma investigador-le-direto-abaixo-do-corte \
  "01-investigacao.md diz o que fazer abaixo do corte" \
  bash -c 'awk "/ou mais|>= ?3/,0" "'"$S"'/references/01-investigacao.md" | grep -qiE "direto|voc[eê] mesm|sess[aã]o principal"'

afirma qa-e-revisor-sempre \
  "qa e revisor-testes continuam sem corte por tamanho" \
  bash -c 'grep -q "agente .qa." "'"$S"'/references/04-qa.md" \
    && grep -q "revisor-testes" "'"$S"'/references/03-fix.md"'

echo "== sessoes paralelas =="

afirma regras-continuam-16 \
  "as regras inviolaveis agora sao 16" \
  bash -c '[ "$(awk "/^## Regras inviol/,/^Regra transversal/" "'"$S"'/SKILL.md" | grep -cE "^[0-9]+\. ")" -eq 16 ]'

afirma regra-16-cita-worktree \
  "a regra 16 cita worktree" \
  bash -c 'awk "/^## Regras inviol/,/^Regra transversal/" "'"$S"'/SKILL.md" | grep -E "^16\. " | grep -qi worktree'

afirma skill-secao-sessoes-paralelas \
  "SKILL.md tem a secao Sessoes paralelas" \
  tem "$S/SKILL.md" '^## Sessões paralelas'

afirma skill-tabela-hooks-novos \
  "a tabela de hooks lista os tres hooks novos" \
  bash -c 'f="'"$S"'/SKILL.md"; grep -q "uma-ocorrencia-por-arvore" "$f" \
    && grep -q "task-reivindicada" "$f" && grep -q "arvore-limpa-antes-da-suite" "$f"'

afirma skill-rastro-sessao-harness \
  "a secao O rastro cita sessao e harness como chaves extras" \
  bash -c 'awk "/^### O rastro/,/^## /" "'"$S"'/SKILL.md" | grep -q "sessao" \
    && awk "/^### O rastro/,/^## /" "'"$S"'/SKILL.md" | grep -q "harness"'

afirma schema-ocorrencia-worktree \
  "o kind ocorrencia tem a chave worktree" \
  bash -c 'awk "/kind: ocorrencia/,/^### /" "'"$S"'/references/00-schema.md" | grep -q "^worktree:"'

afirma template-ocorrencia-worktree \
  "TEMPLATE-ocorrencia.md tem a chave worktree" \
  tem "$S/assets/TEMPLATE-ocorrencia.md" '^worktree:'

afirma e1-passo-worktree \
  "01-investigacao.md manda abrir worktree com git worktree add -b" \
  bash -c 'f="'"$S"'/references/01-investigacao.md"; grep -q "git worktree add -b" "$f" \
    && grep -q "package-lock.json" "$f" && grep -q "pnpm-lock.yaml" "$f" && grep -q "requirements.txt" "$f"'

afirma e1-uma-por-arvore \
  "01-investigacao.md declara uma ocorrencia aberta por arvore, com opt-out" \
  bash -c 'f="'"$S"'/references/01-investigacao.md"; grep -qi "uma ocorrência aberta por árvore" "$f" \
    && grep -qi "sem worktree" "$f"'

afirma e3-task-iniciada \
  "03-fix.md grava task_iniciada, task_concluida e task_bloqueada com --task" \
  bash -c 'f="'"$S"'/references/03-fix.md"; grep -q -- "--evento task_iniciada" "$f" \
    && grep -q -- "--evento task_concluida" "$f" && grep -q -- "--evento task_bloqueada" "$f" \
    && grep -q -- "--task" "$f"'

afirma e3-reivindicacao \
  "03-fix.md trata task reivindicada por outra sessao" \
  bash -c 'grep -qi "reivindicad" "'"$S"'/references/03-fix.md" && grep -qi "outra sessão" "'"$S"'/references/03-fix.md"'

afirma e4-portao-arvore \
  "04-qa.md tem um passo que exige arvore limpa antes da suite completa" \
  bash -c 'f="'"$S"'/references/04-qa.md"; grep -q "git status --porcelain" "$f" && grep -qi "não grave" "$f"'

afirma e2-orq-area-de-trabalho \
  "TEMPLATE-ORQUESTRADOR.md tem a linha Area de trabalho" \
  tem "$S/assets/TEMPLATE-ORQUESTRADOR.md" 'Área de trabalho:'

afirma readme-mimocode \
  "README documenta a coluna MimoCode e a flag --mimocode" \
  bash -c 'f="'"$R"'/README.md"; grep -q "MimoCode" "$f" && grep -q -- "--mimocode" "$f"'

echo "== invariantes do metodo =="

# DR-53: o 07-diagrama.md cita {{ }} como sintaxe de no hexagonal do Mermaid, dentro de
# aspas. E legitimo e esta documentado; os demais arquivos de instrucao nao podem ter.
afirma sem-marcador-vazado \
  "nenhum arquivo de instrucao tem marcador {{...}} vazado (DR-14)" \
  bash -c 'achou=$(grep -rlE "\{\{[a-zA-Z]" "'"$S"'/SKILL.md" "'"$S"'/references/" 2>/dev/null \
    | grep -v "07-diagrama.md"); [ -z "$achou" ]'

afirma decisoes-registradas \
  "DECISOES-DA-SKILL.md registra o ajuste de custo fixo" \
  tem "$S/DECISOES-DA-SKILL.md" '[Cc]usto fixo'

printf '\n  %s ok, %s falhas\n' "$ok" "$falhou"
[ "$falhou" -eq 0 ]
