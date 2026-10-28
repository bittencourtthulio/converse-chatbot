#!/usr/bin/env bash
# comum.sh — funções compartilhadas pelos hooks dos agentes de domínio (usa jq).
# Uso: source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/comum.sh"

RAIZ="${CLAUDE_PROJECT_DIR:-$PWD}"

# Caminho do arquivo do tool_input, relativo à raiz do projeto ("" se não houver).
caminho_relativo() {
  local p
  p="$(printf '%s' "$1" | jq -r '.tool_input.file_path // empty')"
  [ -z "$p" ] && return 0
  printf '%s' "${p#"$RAIZ"/}"
}

# Bloqueia (exit 2) o que nenhum especialista pode fazer: entrega, segredo e comandos
# destrutivos de banco. Entrega e git são do orquestrador, sob pedido explícito.
guard_comum() {
  local cmd="$1"
  case "$cmd" in
    *"git push"*|*"git commit"*|*"npm publish"*|*"vercel "*|*"docker push"*|*"gh pr "*)
      echo "[guard] '$cmd' é entrega: fica com o orquestrador, sob pedido explícito do usuário." >&2; exit 2 ;;
    *"prisma db push"*|*"migrate reset"*|*"migrate dev"*)
      echo "[guard] '$cmd' bloqueado: db push apaga a tabela virtual FTS5 e migrate dev/reset não foi verificado com ela. Use 'npm run db:migrate' (migrate deploy)." >&2; exit 2 ;;
    *"rm -rf"*|*"git reset --hard"*|*"git clean"*|*"git checkout --"*)
      echo "[guard] comando destrutivo bloqueado: $cmd" >&2; exit 2 ;;
  esac
  if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]/])\.env([[:space:]"'"'"']|$)'; then
    echo "[guard] o arquivo de segredos reais não se lê nem se grava por comando. Use .env.example." >&2; exit 2
  fi
}

# Caminhos que ninguém edita, de qualquer domínio.
negar_comum() {
  case "$1" in
    src/gerado/*) echo "[scope] src/gerado/ é saída do 'prisma generate' (ignorada no git). Mude prisma/schema.prisma (agente dados) e gere de novo." >&2; exit 2 ;;
    .env|.env.local|.env.*.local) echo "[scope] $1 guarda segredos: não edite. O modelo é .env.example (agente infra)." >&2; exit 2 ;;
  esac
}

# Liberado a todos: testes (TDD é regra do projeto) e áreas temporárias fora do repo.
liberado_a_todos() {
  case "$1" in
    tests/*|/tmp/*|/private/tmp/*|/private/var/folders/*) return 0 ;;
  esac
  return 1
}

# PostToolUse: roda o teste que casa com o arquivo editado (tests/<nome>.test.ts[x]).
# Testes de rota exigem 'npm run build' antes; ficam para o gate de saída e o revisor.
testar_relacionado() {
  local rel="$1" base alvo=""
  case "$rel" in
    tests/*.test.ts|tests/*.test.tsx) alvo="$rel" ;;
    src/*.ts|src/*.tsx)
      base="$(basename "${rel%.*}")"
      for ext in ts tsx; do [ -f "$RAIZ/tests/$base.test.$ext" ] && alvo="tests/$base.test.$ext"; done ;;
  esac
  [ -z "$alvo" ] && return 0
  case "$alvo" in *rota*|*rotas*) return 0 ;; esac
  local saida
  if ! saida="$(cd "$RAIZ" && npx vitest run "$alvo" 2>&1)"; then
    printf '%s\n' "$saida" | tail -n 40 >&2
    echo "[post-edit] $alvo falhou. Corrija a causa antes de seguir." >&2
    exit 2
  fi
}

# Stop: não entra em laço se o hook já bloqueou uma vez nesta rodada.
sair_se_repetido() {
  [ "$(printf '%s' "$1" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0
}

# Stop: roda "nome|comando" em sequência; a primeira falha bloqueia com a saída real.
rodar_gate() {
  local dominio="$1"; shift
  local item nome cmd saida
  for item in "$@"; do
    nome="${item%%|*}"; cmd="${item#*|}"
    if ! saida="$(cd "$RAIZ" && eval "$cmd" 2>&1)"; then
      printf '%s\n' "$saida" | tail -n 60 >&2
      echo "[stop] gate '$nome' do domínio $dominio falhou — não conclua com vermelho." >&2
      exit 2
    fi
  done
}
