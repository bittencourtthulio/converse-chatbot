#!/usr/bin/env bash
# Banco de casos dos hooks do runx. Monta uma ocorrencia de mentira em /tmp e
# roda cada hook contra ela, conferindo o codigo de saida esperado.
set -uo pipefail

H="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
W="$(mktemp -d)"
# $W e um repositorio git de verdade (nao so um diretorio .git vazio): alguns
# hooks precisam de raiz_repo() funcionando de verdade, e a suite de arvore
# limpa precisa de `git status` de verdade. WT e um worktree derivado de $W,
# usado pelo caso que prova o comportamento de raiz_repo() dentro dele.
git -C "$W" init -q -b main
git -C "$W" config user.email "t@t.local"; git -C "$W" config user.name "teste"
printf '.expx/\ndocs/eventos/\n' > "$W/.gitignore"
git -C "$W" add -A -- .gitignore >/dev/null 2>&1 || true
git -C "$W" -c commit.gpgsign=false commit -q -m init --allow-empty >/dev/null 2>&1
WT="${W}--worktree"
git -C "$W" worktree add -q -b fix/OC-2026-0142 "$WT" main >/dev/null 2>&1
trap 'git -C "$W" worktree remove --force "$WT" >/dev/null 2>&1; rm -rf "$W" "$WT"' EXIT
OC="$W/docs/manutencao/OC-2026-0142-calculo-frete"
mkdir -p "$OC/sprint-01" "$OC/base" "$W/src/frete" "$W/docs/relatorios/2026-08-29-OC-2026-0142-calculo-frete"
mkdir -p "$WT/src"

ok=0; falhou=0
caso() { # caso <nome> <esperado> <hook> <json>
  local nome="$1" esperado="$2" hook="$3" json="$4" saida real
  saida=$(printf '%s' "$json" | (cd "$W" && python3 "$hook") 2>&1); real=$?
  if [ "$real" -eq "$esperado" ]; then
    ok=$((ok+1)); printf '  ok   %-46s exit=%s\n' "$nome" "$real"
  else
    falhou=$((falhou+1)); printf '  FALHA %-45s esperado=%s real=%s\n     %s\n' \
      "$nome" "$esperado" "$real" "$(printf '%s' "$saida" | head -3)"
  fi
}
w() { printf '{"tool_name":"Write","tool_input":{"file_path":"%s","content":%s}}' "$W/$1" "$2"; }
# caso_py <nome> <cwd> <expressao-esperada> <expressao-python> — compara a saida
# de uma expressao python (biblioteca comum, sem passar por um hook) contra o
# valor esperado, com sys.path apontando para comum/.
caso_py() {
  local nome="$1" cwd="$2" esperado="$3" expr="$4" real esperado_real
  real=$(cd "$cwd" && python3 -c "
import sys; sys.path.insert(0, '$H/comum')
import expx_rastro as R
print($expr)
" 2>&1)
  # raiz_repo() resolve symlink (os.path.realpath); no macOS /var -> /private/var,
  # entao o esperado tambem precisa ser resolvido antes de comparar.
  esperado_real=$(python3 -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$esperado" 2>/dev/null || printf '%s' "$esperado")
  if [ "$real" = "$esperado_real" ]; then
    ok=$((ok+1)); printf '  ok   %-46s => %s\n' "$nome" "$real"
  else
    falhou=$((falhou+1)); printf '  FALHA %-45s esperado=%s real=%s\n' "$nome" "$esperado" "$real"
  fi
}
# script_py <nome> <script-python> — como `caso_py`, mas o script e um bloco
# multi-linha (heredoc) em vez de uma expressao unica; o script IMPRIME
# "True" ou "False" na ultima linha, comparado como string.
script_py() {
  local nome="$1" script="$2" real
  real=$(cd "$W" && python3 -c "
import sys; sys.path.insert(0, '$H/comum')
import expx_rastro as R
$script
" 2>&1)
  if [ "$real" = "True" ]; then
    ok=$((ok+1)); printf '  ok   %-46s => %s\n' "$nome" "$real"
  else
    falhou=$((falhou+1)); printf '  FALHA %-45s esperado=True real=%s\n' "$nome" "$real"
  fi
}

escreve_causa() { cat > "$OC/01-CAUSA-RAIZ.md" <<EOF
---
expx_schema: 1
expx_tool: runx
kind: causa_raiz
trabalho_id: OC-2026-0142
modo: causa_raiz
comprovada: $1
evidencia: teste_falho
arquivos_impactados: [src/frete/calculo.ts]
atualizado_em: 2026-08-29
---
EOF
}
escreve_tasks() { cat > "$OC/sprint-01/tasks.md" <<EOF
---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-0142
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Teste de regressao
    fase: F-01.1
    status: em_andamento
    objetivo: Reproduzir
    arquivos:
      cria: [src/frete/calculo.test.ts]
      altera: []
    teste_regressao: $1
    teste_integracao: Chama o endpoint de cotacao
    teste_funcional: Dado 60kg retorna 120
    criterio_aceite: Falha antes e passa depois
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: Corrigir
    fase: F-01.1
    status: pendente
    objetivo: Ajustar faixa
    arquivos:
      cria: []
      altera: [src/frete/calculo.ts]
    teste_regressao: null
    teste_integracao: Tabela oficial
    teste_funcional: Dado 50.5kg retorna 110
    criterio_aceite: Faixas batem
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---
EOF
}
cat > "$OC/00-OCORRENCIA.md" <<'EOF'
---
expx_schema: 1
expx_tool: runx
kind: ocorrencia
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente
tipo_ocorrencia: bug
recebido_em: 2026-08-28
origem: ticket-4471
tem_reproducao: true
modulo_afetado: [frete]
---
EOF
cat > "$OC/ORQUESTRADOR.md" <<'EOF'
---
expx_schema: 1
expx_tool: runx
kind: orquestrador
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente
tipo_trabalho: ocorrencia
tipo_ocorrencia: bug
estagio: e3
status: em_andamento
sprints: [sprint-01]
caminho_critico: [F-01.1]
concluido_em: null
---
EOF

echo "== segredo-no-commit (seguranca: nasce em BLOQUEIO) =="
caso "chave AWS barrada"        2 "$H/comum/segredo-no-commit.py" "$(w src/frete/calculo.ts '"const k = \"AKIAQY7RZ3LKMNBVCXZQ\""')"
caso "token github barrado"     2 "$H/comum/segredo-no-commit.py" "$(w src/a.ts '"ghp_A1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvWxYz"')"
caso "placeholder da AWS passa" 0 "$H/comum/segredo-no-commit.py" "$(w src/a.ts '"AKIAIOSFODNN7EXAMPLE"')"
caso "chave privada barrada"    2 "$H/comum/segredo-no-commit.py" "$(w src/a.pem '"-----BEGIN RSA PRIVATE KEY-----\nMIIE"')"
caso "senha em url de banco"    2 "$H/comum/segredo-no-commit.py" "$(w src/db.ts '"postgres://admin:s3nh4Sup3r@10.0.0.1/prod"')"
caso "placeholder passa"        0 "$H/comum/segredo-no-commit.py" "$(w src/a.ts '"const k = \"<SUA_CHAVE_AQUI>\""')"
caso "codigo normal passa"      0 "$H/comum/segredo-no-commit.py" "$(w src/frete/calculo.ts '"export function frete(p){ return p*2 }"')"
caso ".env ignorado"            0 "$H/comum/segredo-no-commit.py" "$(w .env '"AWS=AKIAIOSFODNN7EXAMPLE"')"

echo "== causa-antes-do-plano =="
rm -f "$OC/01-CAUSA-RAIZ.md"
caso "sem causa raiz avisa"     0 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
escreve_causa false
caso "causa nao comprovada"     0 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
escreve_causa true
caso "causa comprovada passa"   0 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
caso "fora de sprint passa"     0 "$H/runx/causa-antes-do-plano.py" "$(w src/frete/calculo.ts '"x"')"

echo "== causa-antes-do-plano em modo bloqueio =="
mkdir -p "$W/.expx"; echo '{"hooks":{"causa-antes-do-plano":"bloqueio"}}' > "$W/.expx/hooks.json"
escreve_causa false
caso "bloqueio barra mesmo"     2 "$H/runx/causa-antes-do-plano.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md '"x"')"
rm -f "$W/.expx/hooks.json"
escreve_causa true

echo "== regressao-antes-do-fix =="
escreve_tasks "null"
caso "producao sem regressao"   0 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.ts '"fix"')"
caso "teste sempre passa"       0 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.test.ts '"teste"')"
caso "markdown passa"           0 "$H/runx/regressao-antes-do-fix.py" "$(w README.md '"doc"')"
escreve_tasks "Pedido de 60kg cobra 120 e hoje cobra 90"
caso "com regressao passa"      0 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.ts '"fix"')"
echo '{"hooks":{"regressao-antes-do-fix":"bloqueio"}}' > "$W/.expx/hooks.json" 2>/dev/null || mkdir -p "$W/.expx" && echo '{"hooks":{"regressao-antes-do-fix":"bloqueio"}}' > "$W/.expx/hooks.json"
escreve_tasks "null"
caso "bloqueio barra producao"  2 "$H/runx/regressao-antes-do-fix.py" "$(w src/frete/calculo.ts '"fix"')"
rm -f "$W/.expx/hooks.json"; escreve_tasks "Pedido de 60kg cobra 120"

echo "== task-so-fecha-verde =="
T="docs/manutencao/OC-2026-0142-calculo-frete/sprint-01/tasks.md"
mk() { python3 - "$1" "$2" "$3" <<'PY'
import json,sys
st,su,ti=sys.argv[1],sys.argv[2],sys.argv[3]
c=f"""---
kind: tasks
trabalho_id: OC-2026-0142
tasks:
  - id: T-01.01
    status: {st}
    teste_integracao: {ti}
    teste_funcional: Dado 60kg retorna 120
    suite: {su}
---
"""
print(json.dumps({"tool_name":"Write","tool_input":{"file_path":sys.argv[4] if len(sys.argv)>4 else "","content":c}}))
PY
}
J=$(mk concluida verde "Chama endpoint" ); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "concluida verde passa"    0 "$H/runx/task-so-fecha-verde.py" "$J"
J=$(mk concluida vermelha "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "concluida vermelha avisa" 0 "$H/runx/task-so-fecha-verde.py" "$J"
J=$(mk concluida verde "null"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "sem teste_integracao"     0 "$H/runx/task-so-fecha-verde.py" "$J"
J=$(mk em_andamento nao_executada "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "em_andamento passa"       0 "$H/runx/task-so-fecha-verde.py" "$J"
mkdir -p "$W/.expx"; echo '{"hooks":{"task-so-fecha-verde":"bloqueio"}}' > "$W/.expx/hooks.json"
J=$(mk concluida vermelha "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "bloqueio barra vermelha"  2 "$H/runx/task-so-fecha-verde.py" "$J"
# Regra 9 nova: o E3 roda o subconjunto afetado e grava `suite: parcial`; a suite
# inteira e exigida uma vez no E4. Em modo BLOQUEIO — onde vermelha barra — parcial
# tem que passar, senao o hook barraria toda conclusao de task.
J=$(mk concluida parcial "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "bloqueio aceita parcial"  0 "$H/runx/task-so-fecha-verde.py" "$J"
J=$(mk concluida nao_executada "Chama endpoint"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "bloqueio barra nao_executada" 2 "$H/runx/task-so-fecha-verde.py" "$J"
# parcial nao dispensa os dois testes: a regra 4 continua valendo.
J=$(mk concluida parcial "null"); J=${J/\"file_path\": \"\"/\"file_path\": \"$W/$T\"}
caso "parcial sem teste barra"  2 "$H/runx/task-so-fecha-verde.py" "$J"
rm -f "$W/.expx/hooks.json"

echo "== task-reivindicada =="
# trabalho_id() le 01-CAUSA-RAIZ.md/tasks.md, ja gravados nesta fixture pelas
# secoes anteriores (escreve_causa/escreve_tasks) com trabalho_id: OC-2026-0142
# explicito — e por isso, nao pelo nome da pasta, que o rastro tem esse nome.
RASTRO="$W/docs/eventos/OC-2026-0142.jsonl"
mkdir -p "$(dirname "$RASTRO")"
mk_em_andamento() { # mk_em_andamento <sessao no json, para o campo tool_input.session_id, ou omita>
  python3 - "$1" <<'PY'
import json, sys
sid = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] != "-" else None
c = """---
kind: tasks
trabalho_id: OC-2026-0142
tasks:
  - id: T-01.01
    status: em_andamento
    teste_integracao: Chama endpoint
    teste_funcional: Dado 60kg retorna 120
    suite: nao_executada
---
"""
entrada = {"file_path": "PLACEHOLDER", "content": c}
evento = {"tool_name": "Write", "tool_input": entrada}
if sid:
    evento["session_id"] = sid
print(json.dumps(evento))
PY
}
grava_evento() { # grava_evento <evento> <sessao|->
  python3 -c "
import json, sys
sys.path.insert(0, '$H/comum')
import expx_rastro as R
kw = {}
if sys.argv[2] != '-':
    kw['sessao_id'] = sys.argv[2]
R.grava(sys.argv[1], trabalho='OC-2026-0142', task='T-01.01', fase='e3', raiz='$W', **kw)
" "$1" "$2"
}
: > "$RASTRO"
J=$(mk_em_andamento -); J=${J/\"file_path\": \"PLACEHOLDER\"/\"file_path\": \"$W/$T\"}
caso "sem rastro nunca avisa"          0 "$H/runx/task-reivindicada.py" "$J"

: > "$RASTRO"; grava_evento task_iniciada "opencode@abc"
J=$(mk_em_andamento -); J=${J/\"file_path\": \"PLACEHOLDER\"/\"file_path\": \"$W/$T\"}
caso "reivindicada por outra sessao avisa" 0 "$H/runx/task-reivindicada.py" "$J"

: > "$RASTRO"; grava_evento task_iniciada "opencode@abc"
J=$(mk_em_andamento "opencode@abc"); J=${J/\"file_path\": \"PLACEHOLDER\"/\"file_path\": \"$W/$T\"}
caso "mesma sessao nao avisa"          0 "$H/runx/task-reivindicada.py" "$J"

: > "$RASTRO"; grava_evento task_iniciada "opencode@abc"; grava_evento task_concluida "opencode@abc"
J=$(mk_em_andamento "claude-code@xyz"); J=${J/\"file_path\": \"PLACEHOLDER\"/\"file_path\": \"$W/$T\"}
caso "fechada por task_concluida nao avisa" 0 "$H/runx/task-reivindicada.py" "$J"

: > "$RASTRO"
python3 -c "
import json
linha = {'ts':'2026-08-29T00:00:00Z','expx_eventos':1,'trabalho_id':'OC-2026-0142','ferramenta':'runx','origem':'hook','evento':'task_iniciada','fase':'e3','task':'T-01.01','agente':'principal','resultado':'ok','detalhe':None,'arquivos':[]}
open('$RASTRO','a').write(json.dumps(linha)+'\n')
"
J=$(mk_em_andamento "claude-code@xyz"); J=${J/\"file_path\": \"PLACEHOLDER\"/\"file_path\": \"$W/$T\"}
caso "rastro sem sessao (legado) nunca avisa" 0 "$H/runx/task-reivindicada.py" "$J"

: > "$RASTRO"; grava_evento task_iniciada "opencode@abc"
mkdir -p "$W/.expx"; echo '{"hooks":{"task-reivindicada":"bloqueio"}}' > "$W/.expx/hooks.json"
J=$(mk_em_andamento -); J=${J/\"file_path\": \"PLACEHOLDER\"/\"file_path\": \"$W/$T\"}
caso "bloqueio barra reivindicada"     2 "$H/runx/task-reivindicada.py" "$J"
rm -f "$W/.expx/hooks.json"
: > "$RASTRO"

echo "== escopo-da-ocorrencia =="
escreve_tasks "Pedido de 60kg cobra 120"
caso "arquivo no escopo passa"  0 "$H/runx/escopo-da-ocorrencia.py" "$(w src/frete/calculo.ts '"x"')"
caso "teste no escopo passa"    0 "$H/runx/escopo-da-ocorrencia.py" "$(w src/frete/calculo.test.ts '"x"')"
caso "fora do escopo avisa"     0 "$H/runx/escopo-da-ocorrencia.py" "$(w src/pedido/outro.ts '"refactor de brinde"')"
caso "docs/manutencao livre"    0 "$H/runx/escopo-da-ocorrencia.py" "$(w docs/manutencao/OC-2026-0142-calculo-frete/QA.md '"x"')"
mkdir -p "$W/.expx"; echo '{"hooks":{"escopo-da-ocorrencia":"bloqueio"}}' > "$W/.expx/hooks.json"
caso "bloqueio barra fora"      2 "$H/runx/escopo-da-ocorrencia.py" "$(w src/pedido/outro.ts '"x"')"
rm -f "$W/.expx/hooks.json"

echo "== uma-ocorrencia-por-arvore =="
OC2="$W/docs/manutencao/OC-2026-0200-outra-ocorrencia"
mkdir -p "$OC2"
cat > "$OC2/00-OCORRENCIA.md" <<'EOF'
---
expx_schema: 1
expx_tool: runx
kind: ocorrencia
trabalho_id: OC-2026-0200
titulo: Outra ocorrencia aberta
tipo_ocorrencia: bug
recebido_em: 2026-08-29
tem_reproducao: true
modulo_afetado: []
worktree: null
---
EOF
caso "outra ocorrencia aberta avisa" 0 "$H/runx/uma-ocorrencia-por-arvore.py" \
  "$(w docs/manutencao/OC-2026-0300-terceira/00-OCORRENCIA.md '"---\nkind: ocorrencia\ntrabalho_id: OC-2026-0300\n---\n"')"
caso "escrever na propria ocorrencia passa" 0 "$H/runx/uma-ocorrencia-por-arvore.py" \
  "$(w docs/manutencao/OC-2026-0200-outra-ocorrencia/00-OCORRENCIA.md '"---\nkind: ocorrencia\ntrabalho_id: OC-2026-0200\n---\n"')"
cat > "$OC2/ORQUESTRADOR.md" <<'EOF'
---
expx_schema: 1
expx_tool: runx
kind: orquestrador
trabalho_id: OC-2026-0200
estagio: e5
status: concluido
concluido_em: 2026-08-30
sprints: [sprint-01]
caminho_critico: [F-01.1]
---
EOF
caso "ocorrencia encerrada nao conta" 0 "$H/runx/uma-ocorrencia-por-arvore.py" \
  "$(w docs/manutencao/OC-2026-0300-terceira/00-OCORRENCIA.md '"---\nkind: ocorrencia\ntrabalho_id: OC-2026-0300\n---\n"')"
sed -i.bak 's/^status: concluido$/status: em_andamento/; s/^concluido_em: .*/concluido_em: null/' "$OC2/ORQUESTRADOR.md"; rm -f "$OC2/ORQUESTRADOR.md.bak"
mkdir -p "$W/.expx"; echo '{"hooks":{"uma-ocorrencia-por-arvore":"bloqueio"}}' > "$W/.expx/hooks.json"
caso "bloqueio barra outra aberta"    2 "$H/runx/uma-ocorrencia-por-arvore.py" \
  "$(w docs/manutencao/OC-2026-0300-terceira/00-OCORRENCIA.md '"---\nkind: ocorrencia\ntrabalho_id: OC-2026-0300\n---\n"')"
rm -f "$W/.expx/hooks.json"
rm -rf "$OC2"

echo "== sem-jargao-no-uso (PostToolUse) =="
U="docs/relatorios/2026-08-29-OC-2026-0142-calculo-frete/uso.md"
p() { printf '{"tool_name":"Write","tool_input":{"file_path":"%s"}}' "$W/$U"; }
cat > "$W/$U" <<'EOF'
---
kind: relatorio_uso
trabalho_id: OC-2026-0142
---
# O que mudou
O valor do frete para encomendas acima de 50 quilos estava sendo cobrado a menos.
Agora o valor cobrado confere com a tabela combinada. Nao e preciso fazer nada.
EOF
caso "uso limpo passa"          0 "$H/runx/sem-jargao-no-uso.py" "$(p)"
cat > "$W/$U" <<'EOF'
---
kind: relatorio_uso
---
# O que mudou
Corrigimos a funcao calcularFrete() em src/frete/calculo.ts, que fazia um SELECT
na tabela de faixas com arredondamento errado.
EOF
# Em modo aviso o hook registra e NAO interrompe (exit 0); so em bloqueio ele
# devolve o texto ao modelo para reescrita (exit 2).
caso "uso com jargao: aviso nao trava" 0 "$H/runx/sem-jargao-no-uso.py" "$(p)"
mkdir -p "$W/.expx"; echo '{"hooks":{"sem-jargao-no-uso":"bloqueio"}}' > "$W/.expx/hooks.json"
caso "uso com jargao: bloqueio devolve" 2 "$H/runx/sem-jargao-no-uso.py" "$(p)"
rm -f "$W/.expx/hooks.json"
mkdir -p "$W/.expx"; echo '{"hooks":{"sem-jargao-no-uso":"desligado"}}' > "$W/.expx/hooks.json"
caso "desligado passa"          0 "$H/runx/sem-jargao-no-uso.py" "$(p)"
rm -f "$W/.expx/hooks.json"

echo "== rastro =="
caso "rastro-arquivo grava"     0 "$H/comum/rastro-arquivo.py" "$(w src/frete/calculo.ts '"x"')"
caso "rastro-suite verde"       0 "$H/comum/rastro-suite.py" '{"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"exit_code":0}}'
caso "rastro-suite vermelha"    0 "$H/comum/rastro-suite.py" '{"tool_name":"Bash","tool_input":{"command":"npx vitest run"},"tool_response":{"exit_code":1}}'
caso "comando comum ignorado"   0 "$H/comum/rastro-suite.py" '{"tool_name":"Bash","tool_input":{"command":"ls -la"},"tool_response":{"exit_code":0}}'
script_py "rastro-suite grava HEAD e sujos_fora_escopo" '
import subprocess, json
subprocess.run(["python3", "'"$H"'/comum/rastro-suite.py"],
                input=json.dumps({"tool_name":"Bash","tool_input":{"command":"npm test"},"tool_response":{"exit_code":0}}),
                text=True, cwd="'"$W"'")
linhas = open("'"$W"'/docs/eventos/OC-2026-0142.jsonl").readlines()
d = json.loads(linhas[-1])
print("@" in d["detalhe"] and "sujos_fora_escopo=" in d["detalhe"])
'

echo "== identidade de sessao (sessoes paralelas) =="

script_py "sessao-por-env" '
import os
for k in ("EXPX_SESSAO", "EXPX_HARNESS", "CLAUDECODE", "CLAUDE_CODE_SESSION_ID"):
    os.environ.pop(k, None)
os.environ["EXPX_SESSAO"] = "opencode@abc"
print(R.sessao() == "opencode@abc")
'

script_py "sessao-por-payload" '
import os
for k in ("EXPX_SESSAO", "CLAUDECODE", "CLAUDE_CODE_SESSION_ID"):
    os.environ.pop(k, None)
os.environ["EXPX_HARNESS"] = "mimocode"
print(R.sessao({"session_id": "xyz"}) == "mimocode@xyz")
'

script_py "sessao-por-ancestral" '
import os
from unittest import mock
for k in ("EXPX_SESSAO", "EXPX_HARNESS", "CLAUDECODE", "CLAUDE_CODE_SESSION_ID"):
    os.environ.pop(k, None)
with mock.patch.object(R, "_ancestral_harness_pid", return_value=(None, None)):
    print(R.sessao() == "desconhecido@sem-id")
'

script_py "extras-depois-das-doze" '
import os, json
os.environ["EXPX_SESSAO"] = "claude-code@teste"
os.environ["EXPX_HARNESS"] = "claude-code"
R.grava("arquivo_alterado", trabalho="OC-TESTE-EXTRAS", arquivos=["a.ts"], raiz="'"$W"'")
linha = open("'"$W"'/docs/eventos/OC-TESTE-EXTRAS.jsonl").readlines()[-1]
d = json.loads(linha)
chaves = list(d.keys())
doze = chaves[:12] == ["ts","expx_eventos","trabalho_id","ferramenta","origem","evento",
                        "fase","task","agente","resultado","detalhe","arquivos"]
extras = chaves[12:14] == ["sessao", "harness"]
print(doze and extras and d["sessao"] == "claude-code@teste" and d["harness"] == "claude-code")
'

echo "== arvore-limpa-antes-da-suite =="
# Precisa de escopo declarado (causa raiz com arquivos_impactados) e de um
# arquivo de verdade sujo no git para $W, que ja e repositorio real. Limpeza
# cirurgica dos arquivos desta secao apenas — nunca `git clean -fdx`, que
# apagaria docs/manutencao/ inteiro e quebraria as secoes seguintes do script.
escreve_causa true; escreve_tasks "Pedido de 60kg cobra 120"
bash_ev() { printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "$1"; }
limpa_sujeira() { rm -rf "$W/src/pedido" "$W/tests" "$W/src/frete/calculo.ts"; }
limpa_sujeira
touch "$W/src/frete/calculo.ts"  # no escopo (arquivos_impactados)
caso "sujo no escopo nao avisa"   0 "$H/runx/arvore-limpa-antes-da-suite.py" "$(bash_ev 'npm test')"
limpa_sujeira
mkdir -p "$W/src/pedido"; touch "$W/src/pedido/fora.ts"  # fora do escopo
caso "sujo fora do escopo avisa" 0 "$H/runx/arvore-limpa-antes-da-suite.py" "$(bash_ev 'npm test')"
limpa_sujeira
mkdir -p "$W/tests"; touch "$W/tests/frete_test.py"  # teste, sempre livre
caso "sujo de teste nao avisa"    0 "$H/runx/arvore-limpa-antes-da-suite.py" "$(bash_ev 'npm test')"
limpa_sujeira
caso "comando comum nao dispara"  0 "$H/runx/arvore-limpa-antes-da-suite.py" "$(bash_ev 'ls -la')"
mkdir -p "$W/src/pedido"; touch "$W/src/pedido/fora.ts"
mkdir -p "$W/.expx"; echo '{"hooks":{"arvore-limpa-antes-da-suite":"bloqueio"}}' > "$W/.expx/hooks.json"
caso "bloqueio barra sujo fora"   2 "$H/runx/arvore-limpa-antes-da-suite.py" "$(bash_ev 'npm test')"
rm -f "$W/.expx/hooks.json"
limpa_sujeira
SEMGIT="$(mktemp -d)"
saida=$(printf '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | (cd "$SEMGIT" && python3 "$H/runx/arvore-limpa-antes-da-suite.py") 2>&1); real=$?
if [ "$real" -eq 0 ]; then ok=$((ok+1)); printf '  ok   %-46s exit=%s\n' "sem git nunca avisa" "$real"
else falhou=$((falhou+1)); printf '  FALHA %-45s esperado=0 real=%s\n     %s\n' "sem git nunca avisa" "$real" "$saida"; fi
rm -rf "$SEMGIT"

echo "== raiz_repo em worktree =="
# .git dentro de um worktree e ARQUIVO (gitdir: <principal>/.git/worktrees/<nome>),
# nao diretorio. raiz_repo() hoje so testa os.path.isdir(".git") e, chamada de um
# subdiretorio do worktree, cai no fallback (devolve o proprio subdiretorio).
caso_py "raiz-em-worktree" "$WT/src" "$WT" "R.raiz_repo()"

echo "== robustez: entrada invalida nunca trava =="
for hk in comum/rastro-arquivo comum/rastro-suite runx/causa-antes-do-plano \
          runx/regressao-antes-do-fix runx/task-so-fecha-verde \
          runx/escopo-da-ocorrencia runx/sem-jargao-no-uso; do
  caso "$(basename $hk) stdin vazio"  0 "$H/$hk.py" ''
  caso "$(basename $hk) json quebrado" 0 "$H/$hk.py" '{nao e json'
done

echo "== despachante: um processo, mesma semantica =="
DESP="$H/comum/despachante.py"
PRE7="comum/segredo-no-commit runx/causa-antes-do-plano runx/regressao-antes-do-fix runx/task-so-fecha-verde runx/escopo-da-ocorrencia runx/uma-ocorrencia-por-arvore runx/task-reivindicada"
dcaso(){ local esp="$1" desc="$2" ev="$3" c
  printf '%s' "$ev" | (cd "$W" && python3 "$DESP" $PRE7) >/dev/null 2>&1; c=$?
  if [ "$c" -eq "$esp" ]; then ok=$((ok+1)); printf '  ok   %-46s exit=%s\n' "$desc" "$c"
  else falhou=$((falhou+1)); printf '  FALHA %-45s esperado=%s real=%s\n' "$desc" "$esp" "$c"; fi; }
escreve_causa true; escreve_tasks "Pedido de 60kg cobra 120"
dcaso 0 "escrita no escopo passa"      "$(w src/frete/calculo.ts '"x"')"
dcaso 2 "segredo barra pelo despachante" "$(w src/frete/calculo.ts '"ghp_A1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvWxYz"')"
dcaso 0 "fora do escopo so avisa"      "$(w src/pedido/outro.ts '"x"')"
mkdir -p "$W/.expx"; echo '{"hooks":{"escopo-da-ocorrencia":"bloqueio"}}' > "$W/.expx/hooks.json"
dcaso 2 "modo bloqueio propaga"        "$(w src/pedido/outro.ts '"x"')"
rm -f "$W/.expx/hooks.json"
dcaso 0 "stdin vazio"                  ''
dcaso 0 "json quebrado"                '{quebrado'

echo "== despachante: grupo PreToolUse/Bash com o hook novo =="
dcaso_bash(){ local esp="$1" desc="$2" ev="$3" c
  printf '%s' "$ev" | (cd "$W" && python3 "$DESP" runx/arvore-limpa-antes-da-suite) >/dev/null 2>&1; c=$?
  if [ "$c" -eq "$esp" ]; then ok=$((ok+1)); printf '  ok   %-46s exit=%s\n' "$desc" "$c"
  else falhou=$((falhou+1)); printf '  FALHA %-45s esperado=%s real=%s\n' "$desc" "$esp" "$c"; fi; }
dcaso_bash 0 "comando de suite via despachante passa" '{"tool_name":"Bash","tool_input":{"command":"npm test"}}'

echo "== hooks.json e hooks.exemplo.json validos, doctor lista nove hooks =="
script_py "hooks.json e json valido" '
import json
print(bool(json.load(open("'"$H"'/hooks.json"))))
'
script_py "hooks.exemplo.json e json valido" '
import json
print(bool(json.load(open("'"$H"'/hooks.exemplo.json"))))
'
script_py "hooks.json tem o grupo PreToolUse/Bash" '
import json
d = json.load(open("'"$H"'/hooks.json"))
print(any(g.get("matcher") == "Bash" for g in d["hooks"]["PreToolUse"]))
'
script_py "doctor.py lista nove hooks" '
import subprocess, re
r = subprocess.run(["python3", "'"$H"'/comum/doctor.py"], capture_output=True, text=True, cwd="'"$W"'")
nomes = {"segredo-no-commit","causa-antes-do-plano","regressao-antes-do-fix","task-so-fecha-verde","escopo-da-ocorrencia","sem-jargao-no-uso","uma-ocorrencia-por-arvore","task-reivindicada","arvore-limpa-antes-da-suite"}
# so a linha da TABELA (nome seguido de espacos e depois "seguranca"/"metodo")
achados = {m.group(1) for l in r.stdout.splitlines()
           if (m := re.match(r"\s*([a-z-]+)\s+(seguranca|metodo)\s", l))}
print(achados == nomes)
'

echo
echo "== rastro gravado =="
if [ -f "$W/docs/eventos/OC-2026-0142.jsonl" ]; then
  python3 - "$W/docs/eventos/OC-2026-0142.jsonl" <<'PY'
import json,sys,collections
linhas=[json.loads(l) for l in open(sys.argv[1]) if l.strip()]
print(f"  {len(linhas)} eventos:", dict(collections.Counter(e["evento"] for e in linhas)))
# O contrato exige que as 12 chaves ESTEJAM na linha, nao que sejam as unicas:
# chaves extras declaradas (`hook` na mergex e na legadox, `faixa` na legadox)
# sao legitimas. Um `set(e)!=chaves` reprovaria toda linha dessas duas skills.
chaves={"ts","expx_eventos","trabalho_id","ferramenta","origem","evento","fase","task","agente","resultado","detalhe","arquivos"}
extras_ok={"hook","faixa"}
ruins=[e for e in linhas if not chaves <= set(e)]
desconhecidas=sorted({k for e in linhas for k in set(e)-chaves-extras_ok})
print("  todas as linhas com as 12 chaves do contrato:", not ruins)
if desconhecidas:
    print("  AVISO chaves fora do contrato:", ", ".join(desconhecidas))
print("  exemplo:", json.dumps(linhas[0], ensure_ascii=False)[:150])
PY
else
  echo "  NENHUM evento gravado — o rastro nao funcionou"; falhou=$((falhou+1))
fi

echo
echo "  $ok ok, $falhou falhas"
[ "$falhou" -eq 0 ]
