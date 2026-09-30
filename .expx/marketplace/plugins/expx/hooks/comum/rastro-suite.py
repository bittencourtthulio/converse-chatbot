#!/usr/bin/env python3
"""Grava `suite_executada` no rastro. `PostToolUse` em Bash.

So reage a comando que parece execucao de suite. O resultado (verde/vermelha)
sai do codigo de saida relatado pela ferramenta, nao de leitura da saida:
formato de saida varia por runner, codigo de saida nao.

`detalhe` traz tambem o HEAD curto e a contagem de arquivos sujos fora do
escopo autorizado (D-13, "Sessoes paralelas") — o que torna uma execucao
auditavel depois: um vermelho por contaminacao de outra sessao fica
distinguivel de um vermelho de verdade.
"""

import importlib.util
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import expx_rastro as R  # noqa: E402

_spec = importlib.util.spec_from_file_location(
    "runx_escopo_da_ocorrencia",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "runx", "escopo-da-ocorrencia.py"),
)
_escopo = importlib.util.module_from_spec(_spec)
try:
    _spec.loader.exec_module(_escopo)
except Exception:
    _escopo = None  # sem o hook irmao, detalhe fica sem a contagem de sujos


def _head_curto(raiz):
    try:
        r = subprocess.run(["git", "rev-parse", "--short", "HEAD"],
                            cwd=raiz, capture_output=True, text=True, timeout=2)
        return r.stdout.strip() if r.returncode == 0 else "-"
    except Exception:
        return "-"


def _sujos_fora_escopo(raiz, pasta):
    if _escopo is None or not pasta:
        return None
    try:
        r = subprocess.run(["git", "status", "--porcelain", "--untracked-files=all"],
                            cwd=raiz, capture_output=True, text=True, timeout=2)
        if r.returncode != 0:
            return None
        permitidos, _ = _escopo.autorizados(pasta)
        n_fora = 0
        for linha in r.stdout.splitlines():
            if len(linha) < 4:
                continue
            caminho = linha[3:].split(" -> ", 1)[-1]
            n = _escopo.normaliza(caminho)
            if not n or _escopo.LIVRE.search(n) or _escopo.TESTE.search(n):
                continue
            combina = n in permitidos or any(
                "/" in p and (n.endswith("/" + p) or p.endswith("/" + n)) for p in permitidos
            )
            if not combina:
                n_fora += 1
        return n_fora
    except Exception:
        return None

# Runners comuns. Casa o comando de teste do projeto, seja pelo gerenciador de
# pacotes, pelo Makefile ou pelo binario direto.
SUITE = re.compile(
    r"\b("
    r"(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?test|"
    r"(?:npx|pnpm\s+dlx|bunx)\s+(?:jest|vitest|mocha|ava|playwright|cypress)|"
    r"jest|vitest|mocha|playwright\s+test|cypress\s+run|"
    r"pytest|tox|nose2|python\s+-m\s+(?:pytest|unittest)|"
    r"go\s+test|cargo\s+test|"
    r"(?:bundle\s+exec\s+)?rspec|rake\s+test|"
    r"(?:php\s+)?(?:vendor/bin/)?phpunit|pest|"
    r"(?:\./)?(?:gradlew|mvnw)\s+(?:.*\s)?test|mvn\s+(?:.*\s)?test|"
    r"dotnet\s+test|"
    r"make\s+(?:test|check)"
    r")\b",
    re.IGNORECASE,
)


def main():
    evento = R.ler_evento()
    comando = (evento.get("tool_input") or {}).get("command") or ""
    if not SUITE.search(comando):
        sys.exit(0)

    pasta = R.pasta_ocorrencia()
    if not pasta:
        sys.exit(0)

    resposta = evento.get("tool_response")
    codigo = None
    if isinstance(resposta, dict):
        for chave in ("exit_code", "exitCode", "returncode", "code"):
            if isinstance(resposta.get(chave), int):
                codigo = resposta[chave]
                break
        if codigo is None and resposta.get("interrupted"):
            codigo = -1

    if codigo is None:
        estado, resultado = "nao_determinado", "desconhecido"
    elif codigo == 0:
        estado, resultado = "verde", "ok"
    else:
        estado, resultado = "vermelha", "falhou"

    orq = R.frontmatter(os.path.join(pasta, "ORQUESTRADOR.md"))
    raiz = R.raiz_repo()
    sha = _head_curto(raiz)
    n_fora = _sujos_fora_escopo(raiz, pasta)
    sufixo_sujos = f" sujos_fora_escopo={n_fora}" if n_fora is not None else ""
    R.grava(
        "suite_executada",
        trabalho=R.trabalho_id(pasta),
        fase=orq.get("estagio"),
        resultado=resultado,
        detalhe=f"suite {estado} @{sha}{sufixo_sujos}: {comando.strip()[:160]}",
        raiz=raiz,
    )
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
