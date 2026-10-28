# legadox — biblioteca comum dos hooks.
# Sourced por todos os hooks. Nao executa nada sozinho.
#
# Contrato expx-eventos v1, regras que este arquivo materializa:
#   1. Rapido       — nada de rede, nada de suite, nada de git log pesado
#   3. Falha aberta — hook de metodo que quebra sai 0 e deixa passar
#   6. Sem estado   — toda decisao sai de arquivo que ja existe
#   7. Sempre grava no rastro
#
# Convencao de saida dos hooks que usam esta lib:
#   permitir            exit 0, silencioso
#   avisar   (modo aviso)    exit 0 + stderr, evento regra_violada
#   bloquear (modo bloqueio) exit 2 + stderr, evento acao_bloqueada

set -uo pipefail

# ---------------------------------------------------------------- raiz e stdin

# Raiz do projeto: o harness exporta CLAUDE_PROJECT_DIR. Sem ele, sobe ate achar .git.
legadox_raiz() {
  if [ -n "${CLAUDE_PROJECT_DIR:-}" ] && [ -d "$CLAUDE_PROJECT_DIR" ]; then
    printf '%s\n' "$CLAUDE_PROJECT_DIR"; return 0
  fi
  local d; d="$(pwd)"
  while [ "$d" != "/" ]; do
    [ -d "$d/.git" ] && { printf '%s\n' "$d"; return 0; }
    d="$(dirname "$d")"
  done
  pwd
}

RAIZ="$(legadox_raiz)"
LEGADO="$RAIZ/docs/legado"
EXPX="$RAIZ/.expx"

# O evento JSON chega no stdin, e stdin nao rebobina.
#
# A leitura acontece AQUI, no corpo da lib, uma unica vez, no shell principal.
# Ler sob demanda dentro de uma funcao nao funciona: as funcoes sao quase sempre
# chamadas dentro de $(...), que roda em subshell — o valor lido morreria com o
# subshell e a proxima chamada encontraria stdin ja drenado, devolvendo vazio.
EVENTO_JSON=""
if [ ! -t 0 ]; then EVENTO_JSON="$(cat 2>/dev/null || true)"; fi
[ -z "$EVENTO_JSON" ] && EVENTO_JSON='{}'

legadox_ler_stdin() { return 0; }   # mantida por compatibilidade; leitura ja feita

TEM_JQ=0
command -v jq >/dev/null 2>&1 && TEM_JQ=1

# Extrai campo do evento. Com jq quando ha; senao um grep que cobre string simples.
# Regra 3: sem jq o hook degrada para permissivo, nunca para bloqueio por engano.
legadox_campo() {
  local caminho="$1" saida=""
  legadox_ler_stdin
  if [ "$TEM_JQ" -eq 1 ]; then
    saida="$(printf '%s' "$EVENTO_JSON" | jq -r "$caminho // empty" 2>/dev/null || true)"
  fi
  printf '%s\n' "$saida"
}

legadox_ferramenta() { legadox_campo '.tool_name'; }

# Caminho do arquivo alvo, relativo a raiz. Cobre Write/Edit/MultiEdit/NotebookEdit.
#
# Resolvido uma unica vez no shell principal (mesmo motivo do stdin) e sem jq: o
# caminho e um campo simples e um `case` de bash o extrai por uma fracao do custo de
# subir um processo. jq fica de reserva para o caso raro em que o campo tem escape.
legadox_extrair_caminho() {
  local j="$EVENTO_JSON" f="" resto=""
  case "$j" in
    *'"file_path"'*)     resto="${j#*\"file_path\"}" ;;
    *'"notebook_path"'*) resto="${j#*\"notebook_path\"}" ;;
    *) return 0 ;;
  esac

  # Entre a chave e o valor pode haver espaco e quebra de linha (JSON identado).
  # Assumir `":"` colado faz o parser devolver lixo em vez de vazio — e lixo aqui
  # e pior que falha, porque o hook segue adiante com um caminho invalido.
  resto="${resto#"${resto%%[!  ]*}"}"     # espacos antes dos dois-pontos
  case "$resto" in :*) resto="${resto#:}" ;; *) f="" ;; esac
  resto="${resto#"${resto%%[!  ]*}"}"     # espacos depois dos dois-pontos
  case "$resto" in
    \"*) f="${resto#\"}"; f="${f%%\"*}" ;;
    *)   f="" ;;
  esac

  # Escape no caminho, ou qualquer coisa que o parser simples nao entendeu:
  # cai para o jq, que trata direito.
  case "$f" in
    ''|*\\*) f="$(legadox_campo '.tool_input.file_path')"
             [ -z "$f" ] && f="$(legadox_campo '.tool_input.notebook_path')" ;;
  esac
  [ -z "$f" ] && return 0
  case "$f" in "$RAIZ"/*) f="${f#"$RAIZ"/}" ;; esac
  printf '%s\n' "$f"
}

ARQUIVO_ALVO="$(legadox_extrair_caminho)"
legadox_arquivo_alvo() { printf '%s\n' "$ARQUIVO_ALVO"; }

# ------------------------------------------------------------ trabalho e raio

# O trabalho corrente vem do lock que sprintx/runx escrevem. Sem lock, sem trabalho:
# os hooks de metodo saem permitindo, porque nao ha faixa contra a qual julgar.
legadox_trabalho_id() {
  local lock="$EXPX/trabalho-atual.json"
  [ -f "$lock" ] || return 0
  if [ "$TEM_JQ" -eq 1 ]; then
    jq -r '.trabalho_id // empty' "$lock" 2>/dev/null || true
  else
    sed -n 's/.*"trabalho_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$lock" 2>/dev/null | head -1
  fi
}

legadox_task_atual() {
  local lock="$EXPX/trabalho-atual.json"
  [ -f "$lock" ] || return 0
  if [ "$TEM_JQ" -eq 1 ]; then
    jq -r '.task // empty' "$lock" 2>/dev/null || true
  else
    sed -n 's/.*"task"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$lock" 2>/dev/null | head -1
  fi
}

legadox_arquivo_raio() {
  local id; id="$(legadox_trabalho_id)"
  [ -z "$id" ] && return 0
  local f="$LEGADO/raio/$id.md"
  [ -f "$f" ] && printf '%s\n' "$f"
}

# A faixa sai do arquivo do raio: linha "faixa: ALTO" ou "**Faixa:** ALTO".
# Nao infere, nao adivinha. Sem arquivo de raio, devolve vazio.
#
# Uma passada de awk em vez de grep|grep|head|tr|sed: a faixa e consultada por todos
# os hooks, em toda escrita, e cinco processos por consulta apareciam no relogio.
legadox_faixa() {
  local f; f="$(legadox_arquivo_raio)"
  [ -z "$f" ] && return 0
  # IGNORECASE e extensao do gawk: o awk do macOS a ignora silenciosamente, o que
  # transformaria a leitura da faixa em vazio — e faixa vazia desliga todos os
  # hooks de metodo sem avisar. A comparacao e feita em minusculas, a mao, que e
  # portavel entre BSD awk e gawk.
  awk '
    {
      linha = tolower($0)
      gsub(/é/, "e", linha)
      if (match(linha, /(faixa|raio)[^a-z0-9]{0,12}(baixo|medio|alto)/)) {
        s = substr(linha, RSTART, RLENGTH)
        if (match(s, /(baixo|medio|alto)/)) {
          print toupper(substr(s, RSTART, RLENGTH)); exit
        }
      }
    }' "$f" 2>/dev/null
}

# A faixa e imutavel durante a execucao de um hook. Resolvida uma vez, no shell
# principal, para que as varias consultas de um mesmo hook nao repitam a leitura.
FAIXA_CACHE="$(legadox_faixa)"
legadox_faixa() { printf '%s\n' "$FAIXA_CACHE"; }

# Regra de ouro da adocao: nenhum hook de metodo atua em BAIXO.
# Sem faixa conhecida tambem nao atua — hook nao inventa risco.
legadox_faixa_exige_rigor() {
  case "$(legadox_faixa)" in MEDIO|ALTO) return 0 ;; *) return 1 ;; esac
}

legadox_modo_legado_ativo() { [ -f "$LEGADO/PERFIL.md" ]; }

# Saida rapida: o teste mais barato que existe, feito antes de qualquer jq, git ou
# find. Sem PERFIL.md nao ha modo legado, e a esmagadora maioria das chamadas de
# ferramenta acontece em projeto sem modo legado — essas precisam custar quase nada.
#
# Regra 1 do contrato: o hook roda em toda chamada de ferramenta; acima de 200 ms o
# dev sente. Como sao varios hooks em sequencia por escrita, o orcamento real de
# cada um e uma fracao disso.
legadox_saida_rapida() { [ -f "$LEGADO/PERFIL.md" ] || exit 0; }

# ---------------------------------------------------------------------- modo

# Modo por hook, de .expx/hooks.json: {"legadox": {"orcamento-de-mudanca": "aviso"}}
# Ausente => o padrao que o proprio hook declara ao chamar.
legadox_modo() {
  local hook="$1" padrao="$2" cfg="$EXPX/hooks.json" m=""
  if [ -f "$cfg" ] && [ "$TEM_JQ" -eq 1 ]; then
    m="$(jq -r --arg h "$hook" '.legadox[$h] // empty' "$cfg" 2>/dev/null || true)"
  fi
  case "$m" in aviso|bloqueio|desligado) printf '%s\n' "$m" ;; *) printf '%s\n' "$padrao" ;; esac
}

# ---------------------------------------------------------------------- rastro

legadox_ts() { date -u +%Y-%m-%dT%H:%M:%SZ; }

# Uma linha JSON por evento, append-only, em docs/eventos/<trabalho_id>.jsonl.
# Rotaciona acima de 5 MB, como manda o contrato.
# Falha aqui nunca derruba o hook: o rastro e observabilidade, nao controle.
legadox_rastro() {
  local evento="$1" resultado="$2" detalhe="$3" hook="$4" arquivos="${5:-}"
  {
    local id; id="$(legadox_trabalho_id)"; [ -z "$id" ] && id="sem-trabalho"
    local dir="$RAIZ/docs/eventos"
    mkdir -p "$dir" 2>/dev/null || return 0
    local arq="$dir/$id.jsonl"

    if [ -f "$arq" ]; then
      local tam; tam=$(wc -c <"$arq" 2>/dev/null | tr -d ' ')
      if [ -n "$tam" ] && [ "$tam" -gt 5242880 ] 2>/dev/null; then
        local n=1; while [ -f "$dir/$id.$n.jsonl" ]; do n=$((n+1)); done
        mv "$arq" "$dir/$id.$n.jsonl" 2>/dev/null || true
      fi
    fi

    local faixa; faixa="$(legadox_faixa)"; [ -z "$faixa" ] && faixa="null"
    local task; task="$(legadox_task_atual)"
    local lista="[]"
    if [ -n "$arquivos" ]; then
      if [ "$TEM_JQ" -eq 1 ]; then
        lista="$(printf '%s' "$arquivos" | jq -R -s 'split("\n") | map(select(length>0))' 2>/dev/null || echo '[]')"
      fi
    fi

    if [ "$TEM_JQ" -eq 1 ]; then
      jq -c -n \
        --arg ts "$(legadox_ts)" --arg id "$id" --arg ev "$evento" \
        --arg res "$resultado" --arg det "$detalhe" --arg hk "$hook" \
        --arg fx "$faixa" --arg tk "$task" --argjson arqs "$lista" \
        '{ts:$ts, expx_eventos:1, trabalho_id:$id, ferramenta:"legadox", origem:"hook",
          evento:$ev, fase:null, task:(if $tk=="" then null else $tk end), agente:"principal",
          resultado:$res, detalhe:$det, arquivos:$arqs,
          hook:$hk, faixa:(if $fx=="null" then null else $fx end)}' >>"$arq" 2>/dev/null || true
    fi
  } 2>/dev/null || true
  return 0
}

# ------------------------------------------------------------------- veredito

# Aplica o modo. Chamado no fim de todo hook que decidiu barrar.
# aviso    -> stderr + exit 0  (o modelo le, o trabalho segue)
# bloqueio -> stderr + exit 2  (PreToolUse barra; stderr volta como motivo)
legadox_decidir() {
  local hook="$1" padrao="$2" mensagem="$3" arquivos="${4:-}"
  local modo; modo="$(legadox_modo "$hook" "$padrao")"

  [ "$modo" = "desligado" ] && return 0

  # O rastro leva so a primeira linha da mensagem. A mensagem inteira e instrucao
  # para o modelo, nao dado para o painel — gravar os paragrafos todos incharia o
  # arquivo e empurraria a rotacao de 5 MB sem acrescentar informacao nenhuma.
  local resumo="${mensagem%%$'\n'*}"

  if [ "$modo" = "bloqueio" ]; then
    legadox_rastro "acao_bloqueada" "bloqueado" "$resumo" "$hook" "$arquivos"
    legadox_falar "$hook" "$mensagem" "bloqueio"
    exit 2
  fi

  legadox_rastro "regra_violada" "aviso" "$resumo" "$hook" "$arquivos"
  legadox_falar "$hook" "$mensagem" "aviso"
  exit 0
}

# Como a mensagem chega ao modelo depende do EVENTO, nao da vontade do hook:
#
#   PreToolUse   stderr + exit 2 bloqueia, e o stderr volta como o motivo.
#                Em aviso, stderr tambem e lido.
#   PostToolUse  exit 2 NAO bloqueia e o stderr NAO volta ao modelo. O unico canal
#                e JSON no stdout com hookSpecificOutput.additionalContext.
#                Escrever em stderr aqui e falha silenciosa — o aviso simplesmente
#                nao chega, e o hook parece funcionar.
#
# Por isso a escolha do canal e feita aqui, uma vez, e nao espalhada pelos hooks.
legadox_falar() {
  local hook="$1" mensagem="$2" tipo="$3"
  local evento; evento="$(legadox_campo '.hook_event_name')"
  local texto

  if [ "$tipo" = "aviso" ]; then
    texto="[legadox · aviso · $hook — a acao NAO foi bloqueada]
$mensagem"
  else
    texto="$mensagem"
  fi

  if [ "$evento" = "PostToolUse" ]; then
    if [ "$TEM_JQ" -eq 1 ]; then
      jq -c -n --arg t "$texto" \
        '{hookSpecificOutput:{hookEventName:"PostToolUse", additionalContext:$t}}' 2>/dev/null \
        || printf '%s\n' "$texto" >&2
    else
      # Sem jq nao da para montar o JSON com seguranca. stderr nao chega ao modelo
      # no PostToolUse, mas ainda aparece no transcript para o humano.
      printf '%s\n' "$texto" >&2
    fi
    return 0
  fi

  printf '%s\n' "$texto" >&2
}

# Saida limpa: silenciosa, como manda a regra 2.
legadox_permitir() { exit 0; }

# Guarda comum a todo hook de metodo. Retorna 1 quando o hook nao deve atuar.
legadox_deve_atuar() {
  legadox_modo_legado_ativo || return 1
  legadox_faixa_exige_rigor || return 1
  return 0
}
