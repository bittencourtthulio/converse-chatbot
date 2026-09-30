#!/usr/bin/env bash
# Biblioteca comum dos hooks da mergex.
#
# Contrato: expx-eventos v1. Regras que este arquivo materializa:
#   - rápido (sem rede, sem interpretador pesado, saída antecipada)
#   - silencioso quando passa
#   - falha aberta no método, fechada na segurança
#   - sem estado próprio: toda decisão sai de arquivo já existente
#   - sempre grava no rastro, inclusive quando permite

set -uo pipefail   # sem -e: hook de método não pode morrer no meio e travar o terminal

# --------------------------------------------------------------------------
# Raiz do projeto
# --------------------------------------------------------------------------
# O harness entrega o diretório de trabalho no evento; o fallback é o cwd.
# Sobe até achar .git, como o resto da skill faz para ancorar docs/entregas/.
expx_raiz() {
  local dir="${1:-$PWD}"
  while [ "$dir" != "/" ]; do
    if [ -d "$dir/.git" ]; then printf '%s\n' "$dir"; return 0; fi
    dir="$(dirname "$dir")"
  done
  printf '%s\n' "${1:-$PWD}"
}

# --------------------------------------------------------------------------
# Modo do hook — .expx/hooks.json
# --------------------------------------------------------------------------
# aviso | bloqueio | desligado
# Arquivo ausente ou ilegível => o padrão que o chamador declara.
# Segurança nunca é rebaixada por ausência de arquivo: só o "desligado"
# explícito desliga.
expx_modo() {
  local nome="$1" padrao="$2" raiz="$3"
  local arq="$raiz/.expx/hooks.json"
  [ -r "$arq" ] || { printf '%s\n' "$padrao"; return 0; }
  local m
  # Formato do ecossistema: {"expx_hooks":1,"hooks":{"<nome>":{"modo":"aviso"}}}
  # A forma antiga (.modos["<nome>"]) continua aceita para não quebrar quem já
  # tinha escrito o arquivo à mão.
  m="$(jq -r --arg n "$nome" '.hooks[$n].modo // .modos[$n] // empty' "$arq" 2>/dev/null)" || m=""
  case "$m" in
    aviso|bloqueio|desligado) printf '%s\n' "$m" ;;
    *) printf '%s\n' "$padrao" ;;
  esac
}

# --------------------------------------------------------------------------
# Rastro — docs/eventos/<trabalho_id>.jsonl
# --------------------------------------------------------------------------
# Uma linha JSON por evento, append-only. Chave nunca omitida: use null.
# Rotação acima de 5 MB, como manda o contrato.
expx_trabalho_id() {
  local raiz="$1"
  # O trabalho corrente é o ENTREGA.md mais recentemente modificado.
  # Sem estado próprio: a informação já está no artefato da entrega.
  local mais_novo
  mais_novo="$(ls -t "$raiz"/docs/entregas/*/ENTREGA.md 2>/dev/null | head -1)" || true
  if [ -n "${mais_novo:-}" ]; then
    basename "$(dirname "$mais_novo")"
  else
    printf 'sem-trabalho\n'
  fi
}

expx_rastro() {
  # expx_rastro <raiz> <evento> <resultado> <detalhe> <hook> [arquivos_json]
  local raiz="$1" evento="$2" resultado="$3" detalhe="$4" hook="$5"
  local arquivos="${6:-[]}"

  local id dir arq
  id="$(expx_trabalho_id "$raiz")"
  dir="$raiz/docs/eventos"
  arq="$dir/$id.jsonl"

  mkdir -p "$dir" 2>/dev/null || return 0   # rastro nunca derruba o hook

  # O rastro é ignorado pelo versionador por padrão (contrato expx-eventos).
  # Isto não é conveniência: sem o ignore, o próprio rastro suja a árvore e o
  # branch-limpa passa a barrar toda troca de branch. O ignore mora dentro de
  # docs/eventos/ para não tocar o .gitignore do projeto, que é do time.
  if [ ! -f "$dir/.gitignore" ]; then
    printf '# Rastro de eventos expx: local da maquina, nao versionado.\n*\n' \
      > "$dir/.gitignore" 2>/dev/null || true
  fi

  # Rotação: acima de 5 MB vira <id>.1.jsonl e um novo começa.
  if [ -f "$arq" ]; then
    local tam
    tam="$(wc -c < "$arq" 2>/dev/null | tr -d ' ')" || tam=0
    if [ "${tam:-0}" -gt 5242880 ]; then
      mv "$arq" "$dir/$id.1.jsonl" 2>/dev/null || true
    fi
  fi

  jq -cn \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg id "$id" \
    --arg ev "$evento" \
    --arg res "$resultado" \
    --arg det "$detalhe" \
    --arg hook "$hook" \
    --argjson arqs "$arquivos" \
    '{ts:$ts, expx_eventos:1, trabalho_id:$id, ferramenta:"mergex",
      origem:"hook", evento:$ev, fase:null, task:null, agente:"principal",
      resultado:$res, detalhe:$det, arquivos:$arqs,
      hook:$hook}' \
    >> "$arq" 2>/dev/null || true
}

# --------------------------------------------------------------------------
# Desfecho
# --------------------------------------------------------------------------
# Modo bloqueio: exit 2 + motivo no stderr (o modelo lê o stderr).
# Modo aviso: registra e deixa passar.
# A mensagem é acionável: diz o que fazer, não só o que está errado.
expx_barra() {
  local modo="$1" raiz="$2" hook="$3" motivo="$4" saida="$5"
  if [ "$modo" = "bloqueio" ]; then
    expx_rastro "$raiz" "acao_bloqueada" "bloqueado" "$motivo" "$hook"
    printf '%s\n' "$saida" >&2
    exit 2
  else
    expx_rastro "$raiz" "regra_violada" "aviso" "$motivo" "$hook"
    # Dois canais, porque os dois harnesses leem lugares diferentes:
    #   Claude Code — stderr, que o transcript mostra
    #   OpenCode    — stdout em JSON, que a ponte anexa ao resultado da
    #                 ferramenta (o `before` do OpenCode não tem "permite mas
    #                 avisa"; sem isto o aviso se perderia lá).
    printf '%s\n' "$saida" >&2
    jq -cn --arg ctx "$saida" \
      '{hookSpecificOutput:{hookEventName:"PreToolUse", additionalContext:$ctx}}' \
      2>/dev/null || true
    exit 0
  fi
}

# Passagem limpa.
#
# O contrato manda "sempre grava no rastro, inclusive quando permite" (regra 7),
# mas o vocabulário de `evento` não tem um termo para "avaliou e deixou passar".
# Inventar um enum aqui poluiria a leitura do painel, que trata `evento` como
# lista fechada. Enquanto o contrato não nomear esse evento, a passagem é
# silenciosa: o painel só precisa de `regra_violada` e `acao_bloqueada` para
# montar a lista que guia a promoção de aviso para bloqueio.
#
# LACUNA REGISTRADA para o dono do contrato — ver hooks/README.md.
expx_permite() {
  exit 0
}
