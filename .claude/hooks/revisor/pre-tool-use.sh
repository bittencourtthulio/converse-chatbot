#!/usr/bin/env bash
# pre-tool-use.sh (revisor) — read-only de verdade: nega qualquer mutação do repositório.
# Permite inspeção e os verificadores (lint, tsc, vitest, build).
set -uo pipefail
input="$(cat)"
tool="$(printf '%s' "$input" | jq -r '.tool_name // empty')"
case "$tool" in
  Edit|Write|MultiEdit|NotebookEdit)
    echo "[revisor] read-only: '$tool' não é permitido. Reporte o achado, não edite." >&2; exit 2 ;;
esac
if [ "$tool" = "Bash" ]; then
  cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
  case "$cmd" in
    *"git commit"*|*"git push"*|*"git add"*|*"git checkout"*|*"git reset"*|*"git stash"*|*"git rebase"*|*"git merge"*|*"git clean"*|*"git restore"*|*"git rm"*|*"git mv"*)
      echo "[revisor] git que escreve bloqueado: $cmd. Só inspeção (git diff/log/status/show)." >&2; exit 2 ;;
    *" rm "*|*"rm -"*|*" mv "*|*" cp "*|*"mkdir "*|*"touch "*|*"chmod "*|*" > "*|*" >> "*|*"tee "*|*"sed -i"*|*"perl -i"*)
      echo "[revisor] comando mutável bloqueado: $cmd." >&2; exit 2 ;;
    *"npm install"*|*"npm i "*|*"npm ci"*|*"npm update"*|*"npm audit fix"*|*"prisma migrate"*|*"db push"*|*"db:migrate"*|*"db:seed"*|*"npm run setup"*|*"npm run restore"*|*"npm run backup"*|*"npm run admin:criar"*)
      echo "[revisor] instalação, migração e restauração mudam o repositório ou os dados: bloqueado ($cmd)." >&2; exit 2 ;;
  esac
  if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]/])\.env([[:space:]"'"'"']|$)'; then
    echo "[revisor] o arquivo de segredos não se lê. Use .env.example." >&2; exit 2
  fi
fi
exit 0
