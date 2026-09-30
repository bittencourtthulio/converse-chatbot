#!/usr/bin/env python3
"""Avisa quando uma sessao marca `em_andamento` task aberta por outra sessao.

`PreToolUse` em Write|Edit sobre `tasks.md`, mesmo alvo do `task-so-fecha-verde`
— reusa `conteudo_proposto()` e `bloco_yaml()` de la (import, nao copia) para
descobrir quais tasks a escrita PROPOSTA leva a `em_andamento`.

Para cada uma, olha o rastro de tras para frente: o primeiro evento com aquele
`task` decide. `task_iniciada` de OUTRA sessao sem `task_concluida`/
`task_bloqueada` dela depois = reivindicada. Linha sem `sessao` (rastro
anterior a esta feature) conta como a mesma sessao — nunca avisa por falta de
dado (regras 7 e 13 do SKILL.md, "Sessoes paralelas").

Nasce em AVISO. Falha ABERTA.
"""

import importlib.util
import json
import os
import sys

_AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_AQUI, "..", "comum"))
import expx_rastro as R  # noqa: E402

# Importa o modulo irmao pelo caminho, sem duplicar `conteudo_proposto` nem
# `bloco_yaml` — o mesmo padrao que o despachante usa para carregar hooks.
_spec = importlib.util.spec_from_file_location(
    "runx_task_so_fecha_verde", os.path.join(_AQUI, "task-so-fecha-verde.py")
)
_tsfv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_tsfv)

NOME = "task-reivindicada"
ALVO = _tsfv.ALVO


def _sessao_dona(caminho_rastro, task_id):
    """Sessao que tem a task aberta agora, ou None se ninguem tem.

    Le o arquivo de tras para frente: o evento mais recente com aquele `task`
    entre `task_iniciada`, `task_concluida` e `task_bloqueada` decide.
    """
    if not os.path.isfile(caminho_rastro):
        return None
    try:
        with open(caminho_rastro, "r", encoding="utf-8") as fh:
            linhas = fh.readlines()
    except OSError:
        return None

    for linha in reversed(linhas):
        linha = linha.strip()
        if not linha:
            continue
        try:
            e = json.loads(linha)
        except json.JSONDecodeError:
            continue
        if e.get("task") != task_id:
            continue
        evento = e.get("evento")
        if evento == "task_iniciada":
            return e.get("sessao")  # None quando o rastro e anterior a esta feature
        if evento in ("task_concluida", "task_bloqueada"):
            return None
        # outro evento com o mesmo task (ex.: suite_executada) nao decide;
        # continua procurando mais para tras
    return None


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho:
        sys.exit(0)

    m = ALVO.search(caminho.replace(os.sep, "/"))
    if not m:
        sys.exit(0)

    raiz = R.raiz_repo()
    texto = _tsfv.conteudo_proposto(evento, os.path.join(raiz, caminho))
    if not texto:
        sys.exit(0)

    fm = R._parse(_tsfv.bloco_yaml(texto))
    tasks = [t for t in R.lista(fm.get("tasks")) if isinstance(t, dict)]
    if not tasks:
        sys.exit(0)

    trabalho = R.trabalho_id(os.path.join(raiz, "docs", "manutencao", m.group(1)))
    caminho_rastro = os.path.join(raiz, "docs", "eventos", f"{trabalho}.jsonl")
    minha_sessao = R.sessao(evento)

    for t in tasks:
        if t.get("status") != "em_andamento":
            continue
        tid = R.texto(t.get("id"))
        if not tid:
            continue
        dona = _sessao_dona(caminho_rastro, tid)
        if dona and dona != minha_sessao:
            R.barra_ou_avisa(
                NOME,
                f"`{tid}` ja esta reivindicada pela sessao `{dona}` (evento "
                "`task_iniciada` sem fechamento posterior).\n"
                "Regra 16/'Sessoes paralelas': pule para a proxima task "
                "paralelizavel com dependencias satisfeitas, ou registre um "
                "bloqueio em BLOQUEIOS.md se nao houver nenhuma.",
                trabalho=trabalho, fase="e3", task=tid, arquivos=[caminho], raiz=raiz,
            )
            return  # o primeiro conflito ja decide; barra_ou_avisa encerra em bloqueio

    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
