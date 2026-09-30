#!/usr/bin/env bash
# designx-audit.sh — Hook PostToolUse para auditoria continua de design
# Evento: PostToolUse em Write/Edit
# Modo padrao: AVISO
# Verifica: tokens hardcoded, componentes nao padronizados
set -euo pipefail

MODO="${DESIGNX_AUDIT_MODO:-aviso}"
DS_PATH="docs/design-system/DESIGN-SYSTEM.md"

# Se DS nao existe, nao audita
if [ ! -f "$DS_PATH" ]; then
  exit 0
fi

# Extrai o arquivo alterado do evento (via stdin JSON)
ARQUIVO=""
if [ ! -t 0 ]; then
  ARQUIVO=$(cat | jq -r '.filePath // .input.args.filePath // ""' 2>/dev/null || true)
fi

# Se nao conseguiu extrair arquivo, sai
if [ -z "$ARQUIVO" ]; then
  exit 0
fi

# Filtra: so arquivos de UI
case "$ARQUIVO" in
  *.tsx|*.jsx|*.css|*.scss) ;;
  *) exit 0 ;;
esac

# Verificacao 1: hex hardcoded
HEX_VIOLATIONS=""
if command -v grep &>/dev/null; then
  HEX_VIOLATIONS=$(grep -nE "#[0-9a-fA-F]{6}\b" "$ARQUIVO" 2>/dev/null | head -5 || true)
fi

# Verificacao 2: sem import de token
TOKEN_VIOLATIONS=""
if command -v grep &>/dev/null; then
  if grep -q "className" "$ARQUIVO" 2>/dev/null; then
    if grep -nE "bg-\[#|text-\[#|border-\[#" "$ARQUIVO" 2>/dev/null | head -3 | grep -q .; then
      TOKEN_VIOLATIONS="cores hardcoded detectadas"
    fi
  fi
fi

VIOLACOES=""
if [ -n "$HEX_VIOLATIONS" ]; then
  VIOLACOES="${VIOLACOES}hex hardcoded: ${HEX_VIOLATIONS}; "
fi
if [ -n "$TOKEN_VIOLATIONS" ]; then
  VIOLACOES="${VIOLACOES}${TOKEN_VIOLATIONS}; "
fi

# Sem violacoes
if [ -z "$VIOLACOES" ]; then
  exit 0
fi

# Registrar no rastro
RASTRO="docs/eventos/designx.jsonl"
mkdir -p "$(dirname "$RASTRO")"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "{\"ts\":\"${TIMESTAMP}\",\"expx_eventos\":1,\"trabalho_id\":\"designx\",\"ferramenta\":\"designx\",\"origem\":\"hook\",\"evento\":\"design_violacao_detectada\",\"fase\":\"audit\",\"task\":null,\"agente\":\"principal\",\"resultado\":\"aviso\",\"detalhe\":\"${VIOLACOES}\",\"arquivos\":[\"${ARQUIVO}\"]}" >> "$RASTRO"

# Se modo e aviso, so registra
if [ "$MODO" = "aviso" ]; then
  echo "[designx/hooks — aviso, a acao NAO foi bloqueada] Violasao de design detectada em ${ARQUIVO}: ${VIOLACOES}" >&2
  exit 0
fi

# Modo bloqueio
echo "designx: Violasao de design em ${ARQUIVO}. ${VIOLACOES}" >&2
exit 2
