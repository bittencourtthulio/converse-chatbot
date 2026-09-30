#!/usr/bin/env bash
# Confere que as duas arvores de skill nao divergiram.
#
# DR-44: `.claude/skills/runx/` e `.opencode/skills/runx/` sao copia byte a byte,
# e o install.sh distribui as duas. Uma mudanca aplicada so em uma faz a skill se
# comportar diferente nos dois harnesses — e nada avisa. Ate aqui a conferencia
# era um `diff -rq` que alguem precisava lembrar de rodar.
set -uo pipefail

R="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

ok=0; falhou=0
par() { # par <nome> <origem> <espelho>
  local nome="$1" a="$R/$2" b="$R/$3" saida
  if [ ! -d "$a" ] || [ ! -d "$b" ]; then
    falhou=$((falhou+1)); printf '  FALHA %-22s arvore ausente: %s ou %s\n' "$nome" "$2" "$3"
    return
  fi
  saida=$(diff -rq "$a" "$b" 2>&1)
  if [ -z "$saida" ]; then
    ok=$((ok+1)); printf '  ok    %-22s %s == %s\n' "$nome" "$2" "$3"
  else
    falhou=$((falhou+1))
    printf '  FALHA %-22s divergencia entre %s e %s:\n' "$nome" "$2" "$3"
    printf '%s\n' "$saida" | sed 's/^/          /'
  fi
}

echo "== espelhamento .claude <-> .opencode =="
par skills   ".claude/skills/runx"  ".opencode/skills/runx"
par commands ".claude/commands"     ".opencode/command"

printf '\n  %s ok, %s falhas\n' "$ok" "$falhou"
[ "$falhou" -eq 0 ]
