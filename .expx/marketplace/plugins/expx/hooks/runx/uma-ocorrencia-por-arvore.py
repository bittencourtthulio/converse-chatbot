#!/usr/bin/env python3
"""Uma ocorrencia aberta por arvore de trabalho — regra 16 do SKILL.md.

`PreToolUse` em Write|Edit sobre `docs/manutencao/<X>/00-OCORRENCIA.md`. Avisa
quando existe OUTRA pasta de ocorrencia na mesma raiz, aberta (sem
`status: concluido` nem `concluido_em` preenchido).

Com git, o Passo 0.b do E1 (`references/01-investigacao.md`) resolve a colisao
abrindo um worktree proprio: cada ocorrencia passa a viver em raiz distinta, e
este hook nunca dispara entre elas. Sem git, ou com "sem worktree" pedido
explicitamente, as duas convivem na mesma arvore e o aviso e o que sobra.

Nasce em AVISO. Falha ABERTA.
"""

import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "comum"))
import expx_rastro as R  # noqa: E402

NOME = "uma-ocorrencia-por-arvore"

# `docs/manutencao/<OC-ID>-<slug>/00-OCORRENCIA.md` — so o arquivo do topo da
# pasta, nao qualquer arquivo dentro dela.
ALVO = re.compile(r"(?:^|/)docs/manutencao/([^/]+)/00-OCORRENCIA\.md$")


def _encerrada(pasta):
    """A pasta de ocorrencia esta encerrada?

    Prefere o ORQUESTRADOR (existe do E2 em diante); antes disso, so o
    `00-OCORRENCIA.md` existe e uma ocorrencia recem-aberta nunca esta
    encerrada.
    """
    marca = os.path.join(pasta, "ORQUESTRADOR.md")
    if not os.path.isfile(marca):
        return False
    fm = R.frontmatter(marca)
    return fm.get("status") == "concluido" or fm.get("concluido_em") not in (None, "")


def _outras_abertas(raiz, esta):
    """Ids das pastas de ocorrencia abertas na raiz, exceto `esta`."""
    base = os.path.join(raiz, "docs", "manutencao")
    if not os.path.isdir(base):
        return []
    abertas = []
    try:
        entradas = sorted(os.listdir(base))
    except OSError:
        return []
    for nome in entradas:
        if nome == esta:
            continue
        pasta = os.path.join(base, nome)
        if not os.path.isdir(pasta):
            continue
        if not os.path.isfile(os.path.join(pasta, "00-OCORRENCIA.md")):
            continue
        if not _encerrada(pasta):
            abertas.append(nome)
    return abertas


def main():
    evento = R.ler_evento()
    caminho = R.caminho_da_ferramenta(evento)
    if not caminho:
        sys.exit(0)

    m = ALVO.search(caminho.replace(os.sep, "/"))
    if not m:
        sys.exit(0)

    esta = m.group(1)
    raiz = R.raiz_repo()
    outras = _outras_abertas(raiz, esta)
    if not outras:
        sys.exit(0)

    trabalho = R.trabalho_id(os.path.join(raiz, "docs", "manutencao", esta))
    R.barra_ou_avisa(
        NOME,
        f"Ja existe outra ocorrencia aberta nesta arvore: `{outras[0]}`"
        + (f" (e mais {len(outras) - 1})" if len(outras) > 1 else "") + ".\n"
        "Regra 16: uma ocorrencia aberta por arvore de trabalho. Com git, abra "
        "esta num worktree proprio (Passo 0.b do E1, `references/01-investigacao.md`). "
        "Sem git, encerre ou pause a outra antes de continuar nesta.",
        trabalho=trabalho, fase="e1", arquivos=[caminho], raiz=raiz,
    )


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception:  # hook de metodo falha ABERTA
        sys.exit(0)
