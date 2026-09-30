#!/usr/bin/env bash
# Harness em node para a ponte JS (runx-ponte.js) que traduz eventos do
# OpenCode/MimoCode para o payload que o despachante Python ja entende.
#
# Cada caso grava um pedido em JSON, chama um driver node (roda-caso.mjs) que
# carrega a ponte, invoca o hook pedido e grava o resultado (o `output`
# mutado, mais ok/erro) num arquivo JSON. O despachante real e substituido
# por um script Python falso que grava o que recebeu, para comparacao campo a
# campo — tambem por um comparador Python, nunca por grep de string JSON.
#
# A ponte ainda nao existe: por construcao, toda asercao aqui comeca em FALHA.
set -uo pipefail

H="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PONTE="$H/ponte/runx-ponte.js"
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT

ok=0; falhou=0
afirma() { # afirma <nome> <descricao> <predicado...> ; exit 0 do predicado = passa
  local nome="$1" desc="$2"
  if "${@:3}" >"$W/_afirma_saida.txt" 2>&1; then
    ok=$((ok+1)); printf '  ok    %-32s %s\n' "$nome" "$desc"
  else
    falhou=$((falhou+1)); printf '  FALHA %-32s %s\n     %s\n' "$nome" "$desc" \
      "$(head -c 300 "$W/_afirma_saida.txt" | tr '\n' ' ')"
  fi
}

if ! command -v node >/dev/null 2>&1; then
  falhou=$((falhou+1))
  printf '  FALHA %-32s %s\n' "node-ausente" "node nao esta no PATH; nao ha como testar a ponte"
  printf '\n  %s ok, %s falhas\n' "$ok" "$falhou"
  exit 1
fi

if [ ! -f "$PONTE" ]; then
  falhou=$((falhou+1))
  printf '  FALHA %-32s %s\n' "ponte-nao-existe" ".claude/hooks/ponte/runx-ponte.js nao existe"
  printf '\n  %s ok, %s falhas\n' "$ok" "$falhou"
  exit 1
fi

# Despachante falso: grava o stdin recebido em <RUNX_FAKE_W>/recebido.json e o
# argv em <RUNX_FAKE_W>/argv.json; escreve RUNX_FAKE_STDERR no stderr e sai com
# RUNX_FAKE_EXIT (default 0).
FAKE="$W/despachante-falso.py"
cat > "$FAKE" <<'PY'
import json, os, sys
w = os.environ["RUNX_FAKE_W"]
with open(os.path.join(w, "recebido.json"), "w") as f:
    f.write(sys.stdin.read())
with open(os.path.join(w, "argv.json"), "w") as f:
    json.dump(sys.argv[1:], f)
stderr = os.environ.get("RUNX_FAKE_STDERR", "")
if stderr:
    sys.stderr.write(stderr)
sys.exit(int(os.environ.get("RUNX_FAKE_EXIT", "0")))
PY

# Driver node: le um pedido em JSON {pontePath, cwd, hook, input, output},
# chama a ponte e grava o resultado em JSON: {ok, erro?, output}.
DRIVER="$W/roda-caso.js"
cat > "$DRIVER" <<'JS'
const fs = require("fs");
const [, , pedidoPath, resultadoPath] = process.argv;
const pedido = JSON.parse(fs.readFileSync(pedidoPath, "utf8"));

(async () => {
  let resultado;
  try {
    const mod = require(pedido.pontePath);
    const factory = mod.RunxPonte || mod.default || mod;
    const hooks = await factory({ directory: pedido.cwd, worktree: pedido.cwd, project: {}, client: {}, $: null });
    const fn = hooks[pedido.hook];
    if (!fn) {
      resultado = { ok: false, erro: "hook ausente: " + pedido.hook, output: pedido.output };
    } else {
      await fn(pedido.input, pedido.output);
      resultado = { ok: true, output: pedido.output };
    }
  } catch (e) {
    resultado = { ok: false, erro: String((e && e.message) || e), output: pedido.output };
  }
  fs.writeFileSync(resultadoPath, JSON.stringify(resultado));
})();
JS

# Comparador Python: confere um conjunto de (caminho, valor-esperado) contra
# um arquivo JSON. Caminho e uma sequencia de chaves separadas por "/".
# Uso: confere <arquivo.json> <caminho1>=<esperado1> [<caminho2>=<esperado2> ...]
confere() {
  python3 - "$@" <<'PY'
import json, sys
arq = sys.argv[1]
try:
    with open(arq) as f:
        d = json.load(f)
except Exception as e:
    print(f"nao abriu {arq}: {e}"); sys.exit(1)
for par in sys.argv[2:]:
    caminho, esperado = par.split("=", 1)
    v = d
    for chave in caminho.split("/"):
        if isinstance(v, list):
            v = v[int(chave)]
        else:
            v = v.get(chave) if isinstance(v, dict) else None
    got = json.dumps(v) if not isinstance(v, str) else v
    if got != esperado:
        print(f"{caminho}: esperado {esperado!r}, achado {got!r}")
        sys.exit(1)
sys.exit(0)
PY
}

contem() { # contem <arquivo-json> <caminho> <substring>
  python3 - "$@" <<'PY'
import json, sys
arq, caminho, sub = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    d = json.load(open(arq))
except Exception as e:
    print(f"nao abriu {arq}: {e}"); sys.exit(1)
v = d
for chave in caminho.split("/"):
    v = v.get(chave) if isinstance(v, dict) else None
sys.exit(0 if isinstance(v, str) and sub in v else 1)
PY
}

nao_existe() { [ ! -f "$1" ]; }

j() { printf '%s' "$1" > "$2"; } # j <json-inline> <arquivo-destino>

# roda <hook> <input-json-inline> <output-json-inline> — grava pedido em
# $W/pedido.json e resultado em $W/resultado.json; usa sempre o despachante
# falso (RUNX_PONTE_DESPACHANTE=$FAKE), gravando o recebido em
# $W/recebido.json e $W/argv.json (limpos antes de cada chamada). Variaveis
# RUNX_FAKE_EXIT/RUNX_FAKE_STDERR, se ja exportadas no shell, valem para a
# chamada.
roda() {
  local hook="$1" inputJson="$2" outputJson="$3"
  rm -f "$W/recebido.json" "$W/argv.json"
  j "$inputJson" "$W/_in.json"; j "$outputJson" "$W/_out.json"
  python3 -c "
import json, sys
pedido = {'pontePath': sys.argv[1], 'cwd': sys.argv[2], 'hook': sys.argv[3],
          'input': json.load(open(sys.argv[4])), 'output': json.load(open(sys.argv[5]))}
json.dump(pedido, open(sys.argv[6], 'w'))
" "$PONTE" "$W" "$hook" "$W/_in.json" "$W/_out.json" "$W/pedido.json"
  RUNX_PONTE_DESPACHANTE="$FAKE" RUNX_FAKE_W="$W" \
    node "$DRIVER" "$W/pedido.json" "$W/resultado.json" 2>"$W/stderr-node.txt"
}

# roda_com_cwd <hook> <cwd> <input-json-inline> <output-json-inline> — como
# `roda`, mas com um cwd/worktree diferente de $W (para os casos de shell.env
# que precisam do caminho conter /.opencode/ ou /.mimocode/).
roda_com_cwd() {
  local hook="$1" cwd="$2" inputJson="$3" outputJson="$4"
  j "$inputJson" "$W/_in.json"; j "$outputJson" "$W/_out.json"
  python3 -c "
import json, sys
pedido = {'pontePath': sys.argv[1], 'cwd': sys.argv[2], 'hook': sys.argv[3],
          'input': json.load(open(sys.argv[4])), 'output': json.load(open(sys.argv[5]))}
json.dump(pedido, open(sys.argv[6], 'w'))
" "$PONTE" "$cwd" "$hook" "$W/_in.json" "$W/_out.json" "$W/pedido.json"
  node "$DRIVER" "$W/pedido.json" "$W/resultado.json" 2>"$W/stderr-node.txt"
}

# ============================================================================
# CASOS
# ============================================================================

echo "== traducao do payload =="

roda "tool.execute.before" \
  '{"tool":"write","sessionID":"S1","callID":"C1"}' \
  '{"args":{"filePath":"src/a.ts","content":"x"}}'
afirma before-write-traduz \
  "before de write vira PreToolUse/Write com file_path e session_id" \
  confere "$W/recebido.json" 'tool_name=Write' 'tool_input/file_path=src/a.ts' 'session_id=S1'

roda "tool.execute.before" \
  '{"tool":"edit","sessionID":"S1","callID":"C2"}' \
  '{"args":{"filePath":"src/a.ts","oldString":"a","newString":"b","replaceAll":true}}'
afirma before-edit-traduz \
  "before de edit traduz oldString/newString/replaceAll para snake_case" \
  confere "$W/recebido.json" 'tool_input/old_string=a' 'tool_input/new_string=b' 'tool_input/replace_all=true'

roda "tool.execute.before" \
  '{"tool":"bash","sessionID":"S1","callID":"C3"}' \
  '{"args":{"command":"npm test"}}'
afirma before-bash-traduz \
  "before de bash vira PreToolUse/Bash com o comando" \
  confere "$W/recebido.json" 'tool_name=Bash' 'tool_input/command=npm test'

roda "tool.execute.before" \
  '{"tool":"read","sessionID":"S1","callID":"C4"}' \
  '{"args":{"filePath":"src/a.ts"}}'
afirma before-ignora-outras \
  "before de uma ferramenta nao mapeada nao chama o despachante" \
  nao_existe "$W/recebido.json"

echo "== bloqueio e aviso =="

export RUNX_FAKE_EXIT=2 RUNX_FAKE_STDERR="bloqueado pelo hook"
roda "tool.execute.before" \
  '{"tool":"write","sessionID":"S1","callID":"C5"}' \
  '{"args":{"filePath":"src/a.ts","content":"x"}}'
unset RUNX_FAKE_EXIT RUNX_FAKE_STDERR
afirma before-exit-2-bloqueia \
  "exit 2 do despachante rejeita a promessa e seta output.cancel" \
  confere "$W/resultado.json" 'ok=false' 'output/cancel=true'

export RUNX_FAKE_EXIT=0 RUNX_FAKE_STDERR="aviso: fora do escopo"
roda "tool.execute.before" \
  '{"tool":"write","sessionID":"S1","callID":"C6"}' \
  '{"args":{"filePath":"src/a.ts","content":"x"}}'
unset RUNX_FAKE_EXIT RUNX_FAKE_STDERR
cp "$W/resultado.json" "$W/resultado-before-c6.json"
roda "tool.execute.after" \
  '{"tool":"write","sessionID":"S1","callID":"C6","args":{"filePath":"src/a.ts","content":"x"}}' \
  '{"title":"t","output":"saida original","metadata":{}}'
before_e_after_ok() {
  confere "$W/resultado-before-c6.json" ok=true && contem "$W/resultado.json" output/output "fora do escopo"
}
afirma before-aviso-vai-no-after \
  "aviso do before (exit 0 com stderr) e anexado a output.output do after do mesmo callID" \
  before_e_after_ok

roda "tool.execute.after" \
  '{"tool":"bash","sessionID":"S1","callID":"C7","args":{"command":"npm test"}}' \
  '{"title":"t","output":"...","metadata":{"exit":1}}'
afirma after-bash-exit-code \
  "after de bash com metadata.exit vira tool_response.exit_code" \
  confere "$W/recebido.json" 'tool_response/exit_code=1'

echo "== identidade de sessao via shell.env =="

mkdir -p "$W/proj-oc/.opencode/plugins" "$W/proj-mc/.mimocode/hooks"
cp "$PONTE" "$W/proj-oc/.opencode/plugins/runx-ponte.js"
cp "$PONTE" "$W/proj-mc/.mimocode/hooks/runx-ponte.js"

python3 -c "
import json, sys
pedido = {'pontePath': sys.argv[1], 'cwd': sys.argv[2], 'hook': 'shell.env',
          'input': {'cwd': sys.argv[2], 'sessionID': 'abc'}, 'output': {'env': {}}}
json.dump(pedido, open(sys.argv[3], 'w'))
" "$W/proj-oc/.opencode/plugins/runx-ponte.js" "$W/proj-oc" "$W/pedido.json"
node "$DRIVER" "$W/pedido.json" "$W/resultado.json" 2>"$W/stderr-node.txt"
afirma shell-env-opencode \
  "ponte carregada de .opencode/ exporta EXPX_HARNESS=opencode e EXPX_SESSAO=opencode@abc" \
  confere "$W/resultado.json" 'output/env/EXPX_HARNESS=opencode' 'output/env/EXPX_SESSAO=opencode@abc'

python3 -c "
import json, sys
pedido = {'pontePath': sys.argv[1], 'cwd': sys.argv[2], 'hook': 'shell.env',
          'input': {'cwd': sys.argv[2], 'sessionID': 'abc'}, 'output': {'env': {}}}
json.dump(pedido, open(sys.argv[3], 'w'))
" "$W/proj-mc/.mimocode/hooks/runx-ponte.js" "$W/proj-mc" "$W/pedido.json"
node "$DRIVER" "$W/pedido.json" "$W/resultado.json" 2>"$W/stderr-node.txt"
afirma shell-env-mimocode \
  "ponte carregada de .mimocode/ exporta EXPX_HARNESS=mimocode" \
  confere "$W/resultado.json" 'output/env/EXPX_HARNESS=mimocode'

echo "== robustez =="

python3 -c "
import json, sys
pedido = {'pontePath': sys.argv[1], 'cwd': sys.argv[2], 'hook': 'tool.execute.before',
          'input': {'tool':'write','sessionID':'S1','callID':'C9'},
          'output': {'args': {'filePath':'a.ts','content':'x'}}}
json.dump(pedido, open(sys.argv[3], 'w'))
" "$PONTE" "$W" "$W/pedido.json"
RUNX_PONTE_DESPACHANTE="$W/nao-existe.py" node "$DRIVER" "$W/pedido.json" "$W/resultado.json" 2>"$W/stderr-node.txt"
afirma despachante-ausente-nao-quebra \
  "sem despachante encontravel, before resolve sem lancar (falha aberta)" \
  confere "$W/resultado.json" 'ok=true'

printf '\n  %s ok, %s falhas\n' "$ok" "$falhou"
[ "$falhou" -eq 0 ]
