"""Rastro de eventos expx — contrato expx-eventos v1.

Uma linha JSON por evento em docs/eventos/<trabalho_id>.jsonl.
Append-only. Ninguém edita à mão. Rotaciona acima de 5 MB.

Importado pelos hooks do stackx. Não roda sozinho.
"""
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

LIMITE_ROTACAO = 5 * 1024 * 1024
CHAVES = (
    "ts", "expx_eventos", "trabalho_id", "ferramenta", "origem", "evento",
    "fase", "task", "agente", "resultado", "detalhe", "arquivos",
)


def _raiz(inicio=None):
    """Raiz do repositório: a pasta com .git subindo a partir de inicio."""
    atual = Path(inicio or os.getcwd()).resolve()
    for pasta in (atual, *atual.parents):
        if (pasta / ".git").exists():
            return pasta
    return atual


def _trabalho_id(raiz):
    """Id do trabalho em curso, ou 'sem-trabalho'.

    Sem estado próprio (regra 6): lê do ambiente ou do lock que as outras
    skills já mantêm.
    """
    do_ambiente = os.environ.get("EXPX_TRABALHO_ID")
    if do_ambiente:
        return re.sub(r"[^A-Za-z0-9._-]", "-", do_ambiente)[:64]
    # O nome do arquivo e `expx-lock.json` — e o que o CLI grava (src/nucleo/
    # lock.ts). Ler `lock.json` cai no except e devolve "sem-trabalho" para
    # sempre, em silencio, porque a falha aqui e aberta por desenho.
    for nome in ("expx-lock.json", "lock.json"):
        try:
            dados = json.loads((raiz / ".expx" / nome).read_text(encoding="utf-8"))
            valor = dados.get("trabalho_id")
            if valor:
                return re.sub(r"[^A-Za-z0-9._-]", "-", str(valor))[:64]
        except Exception:
            continue
    return "sem-trabalho"


def modo(raiz, nome_hook, padrao="aviso"):
    """Modo do hook: 'aviso' ou 'bloqueio'. Vive em .expx/hooks.json."""
    try:
        dados = json.loads((raiz / ".expx" / "hooks.json").read_text(encoding="utf-8"))
        valor = dados.get("hooks", dados).get(nome_hook)
        if isinstance(valor, dict):
            valor = valor.get("modo")
        if valor in ("aviso", "bloqueio", "desligado"):
            return valor
    except Exception:
        pass
    return padrao


def registrar(evento, resultado, detalhe, arquivos=None, agente=None,
              fase=None, task=None, raiz=None):
    """Grava uma linha no rastro. Nunca levanta exceção: rastro não trava trabalho."""
    try:
        base = _raiz(raiz)
        linha = {
            "ts": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "expx_eventos": 1,
            "trabalho_id": _trabalho_id(base),
            "ferramenta": "stackx",
            "origem": "hook",
            "evento": evento,
            "fase": fase,
            "task": task,
            # Sem subagente o valor e "principal", nunca null: o contrato trata
            # "foi o modelo principal" como informacao, nao como ausencia.
            "agente": agente or "principal",
            "resultado": resultado,
            "detalhe": detalhe,
            "arquivos": arquivos or [],
        }
        destino = base / "docs" / "eventos" / f"{linha['trabalho_id']}.jsonl"
        destino.parent.mkdir(parents=True, exist_ok=True)
        if destino.exists() and destino.stat().st_size > LIMITE_ROTACAO:
            destino.replace(destino.with_suffix(".1.jsonl"))
        with destino.open("a", encoding="utf-8") as saida:
            saida.write(json.dumps({c: linha[c] for c in CHAVES}, ensure_ascii=False) + "\n")
    except Exception:
        pass
