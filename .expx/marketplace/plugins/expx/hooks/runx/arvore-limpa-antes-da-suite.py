#!/usr/bin/env python3
"""Avisa antes de rodar a suite se a arvore tem trabalho de outra sessao.

`PreToolUse` em `Bash`, so quando o comando parece execucao de suite (mesmo
regex de `comum/rastro-suite.py`). Confere duas coisas antes de deixar a
suite rodar (regra 16, "Sessoes paralelas" do SKILL.md):

1. `git status --porcelain` — arquivo sujo fora do escopo autorizado (a mesma
   lista de `runx/escopo-da-ocorrencia.py::autorizados()`, reusada por import,
   nao copiada) e' sinal de trabalho de outra ocorrencia ou de outra sessao.
2. o rastro — task `em_andamento` reivindicada por outra sessao (mesmo
   criterio de `runx/task-reivindicada.py`).

So avisa; nunca impede o comando de rodar de verdade (quem decide isso e o
harness). O aviso serve para quem esta prestes a interpretar o resultado da
suite saber que a arvore nao estava limpa.

Nasce em AVISO. Falha ABERTA. Sem `git`, ou fora de um repositorio, sai 0
em silencio — nao ha o que comparar.
"""

import importlib.util
import json
import os
import re
import subprocess
import sys

_AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_AQUI, "..", "comum"))
import expx_rastro as R  # noqa: E402

NOME = "arvore-limpa-antes-da-suite"

# Mesmo regex de rastro-suite.py. Duplicado deliberadamente (nao importado):
# rastro-suite.py nao expoe SUITE como algo pensado para reuso, e um hook de
# PreToolUse nao deve depender de um de PostToolUse carregar primeiro.
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

_spec = importlib.util.spec_from_file_location(
    "runx_escopo_da_ocorrencia", os.path.join(_AQUI, "escopo-da-ocorrencia.py")
)
_escopo = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_escopo)


def _git_status(raiz):
    """Lista (status, caminho) de `git status --porcelain`, ou [] sem git."""
    try:
        r = subprocess.run(
            ["git", "status", "--porcelain", "--untracked-files=all"],
            cwd=raiz, capture_output=True, text=True, timeout=2,
        )
    except Exception:
        return []
    if r.returncode != 0:
        return []
    linhas = []
    for linha in r.stdout.splitlines():
        if len(linha) < 4:
            continue
        status, caminho = linha[:2].strip(), linha[3:]
        # `git status --porcelain` usa "old -> new" no rename; o novo caminho
        # e o que importa para checar escopo.
        if " -> " in caminho:
            caminho = caminho.split(" -> ", 1)[1]
        linhas.append((status, caminho))
    return linhas


def _sujos_fora_do_escopo(raiz, pasta):
    permitidos, _ = _escopo.autorizados(pasta)
    fora = []
    for status, caminho in _git_status(raiz):
        n = _escopo.normaliza(caminho)
        if not n or _escopo.LIVRE.search(n) or _escopo.TESTE.search(n):
            continue
        combina = n in permitidos or any(
            "/" in p and (n.endswith("/" + p) or p.endswith("/" + n)) for p in permitidos
        )
        if not combina:
            fora.append(n)
    return fora


def _task_em_andamento_de_outra_sessao(raiz, pasta, trabalho):
    """(task, sessao) da primeira task em_andamento reivindicada por outra
    sessao, ou (None, None). Le so tasks.md das sprints; mesmo criterio de
    `task-reivindicada.py`, sem copiar a funcao (import indireto seria
    circular com o hook de PreToolUse em tasks.md; a checagem aqui e' mais
    simples: so olha o que esta em_andamento AGORA nos arquivos).
    """
    caminho_rastro = os.path.join(raiz, "docs", "eventos", f"{trabalho}.jsonl")
    if not os.path.isfile(caminho_rastro):
        return None, None
    try:
        with open(caminho_rastro, "r", encoding="utf-8") as fh:
            linhas = fh.readlines()
    except OSError:
        return None, None

    try:
        sprints = sorted(
            d for d in os.listdir(pasta)
            if d.startswith("sprint-") and os.path.isdir(os.path.join(pasta, d))
        )
    except OSError:
        sprints = []

    minha_sessao = R.sessao()
    for sprint in sprints:
        fm = R.frontmatter(os.path.join(pasta, sprint, "tasks.md"))
        for t in R.lista(fm.get("tasks")):
            if not isinstance(t, dict) or t.get("status") != "em_andamento":
                continue
            tid = R.texto(t.get("id"))
            if not tid:
                continue
            dona = None
            for linha in reversed(linhas):
                linha = linha.strip()
                if not linha:
                    continue
                try:
                    e = json.loads(linha)
                except json.JSONDecodeError:
                    continue
                if e.get("task") != tid:
                    continue
                if e.get("evento") == "task_iniciada":
                    dona = e.get("sessao")
                break
            if dona and dona != minha_sessao:
                return tid, dona
    return None, None


def main():
    evento = R.ler_evento()
    comando = (evento.get("tool_input") or {}).get("command") or ""
    if not SUITE.search(comando):
        sys.exit(0)

    raiz = R.raiz_repo()
    pasta = R.pasta_ocorrencia(raiz)
    if not pasta:
        sys.exit(0)

    sujos = _sujos_fora_do_escopo(raiz, pasta)
    trabalho = R.trabalho_id(pasta)
    tid, dona = _task_em_andamento_de_outra_sessao(raiz, pasta, trabalho)

    if not sujos and not dona:
        sys.exit(0)

    partes = []
    if sujos:
        partes.append(f"arquivo(s) sujo(s) fora do escopo: {', '.join(sujos)}")
    if dona:
        partes.append(f"`{tid}` em andamento pela sessao `{dona}`")

    R.barra_ou_avisa(
        NOME,
        "Rodando suite com a arvore possivelmente contaminada por outra ocorrencia "
        "ou sessao — " + "; ".join(partes) + ".\n"
        "O resultado desta execucao pode nao refletir so o trabalho desta ocorrencia "
        "('Sessoes paralelas' do SKILL.md).",
        trabalho=trabalho, arquivos=sujos, raiz=raiz,
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
