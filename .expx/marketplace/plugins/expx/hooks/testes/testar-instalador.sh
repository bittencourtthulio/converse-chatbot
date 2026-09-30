#!/usr/bin/env bash
# Fixa o que install.sh --dry-run precisa listar para os tres harnesses antes
# de o instalador saber fazer isso: a ponte JS em .opencode/plugins/ e em
# .mimocode/hooks/, a flag --mimocode, e que --sem-hooks a omite.
#
# Por construcao, toda asercao aqui comeca em FALHA: nenhuma delas e' verdade
# no install.sh de hoje.
set -uo pipefail

R="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
INSTALL="$R/install.sh"

ok=0; falhou=0
afirma() { # afirma <nome> <descricao> <predicado...> ; exit 0 do predicado = passa
  local nome="$1" desc="$2"
  if "${@:3}" >/tmp/_testar_instalador_saida.$$ 2>&1; then
    ok=$((ok+1)); printf '  ok    %-32s %s\n' "$nome" "$desc"
  else
    falhou=$((falhou+1)); printf '  FALHA %-32s %s\n' "$nome" "$desc"
  fi
  rm -f /tmp/_testar_instalador_saida.$$
}

W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
cd "$W"

# --- dry-run-cita-ponte-opencode ---------------------------------------------
saida_padrao=$(bash "$INSTALL" --dry-run 2>&1)
afirma dry-run-cita-ponte-opencode \
  "install.sh --dry-run cita .opencode/plugins/runx-ponte.js" \
  bash -c 'printf "%s" "$1" | grep -q "\.opencode/plugins/runx-ponte\.js"' _ "$saida_padrao"

# --- dry-run-cita-ponte-mimocode ----------------------------------------------
saida_mimocode=$(bash "$INSTALL" --mimocode --dry-run 2>&1)
afirma dry-run-cita-ponte-mimocode \
  "install.sh --mimocode --dry-run cita .mimocode/hooks/runx-ponte.js" \
  bash -c 'printf "%s" "$1" | grep -q "\.mimocode/hooks/runx-ponte\.js"' _ "$saida_mimocode"

# --- flag-mimocode-aceita -----------------------------------------------------
afirma flag-mimocode-aceita \
  "install.sh --mimocode --dry-run sai com codigo 0 (a flag existe)" \
  bash -c 'bash "$1" --mimocode --dry-run >/dev/null 2>&1' _ "$INSTALL"

# --- sem-hooks-omite-ponte ----------------------------------------------------
saida_sem_hooks=$(bash "$INSTALL" --sem-hooks --dry-run 2>&1)
afirma sem-hooks-omite-ponte \
  "install.sh --sem-hooks --dry-run nao cita runx-ponte.js" \
  bash -c '! printf "%s" "$1" | grep -q "runx-ponte\.js"' _ "$saida_sem_hooks"

printf '\n  %s ok, %s falhas\n' "$ok" "$falhou"
[ "$falhou" -eq 0 ]
