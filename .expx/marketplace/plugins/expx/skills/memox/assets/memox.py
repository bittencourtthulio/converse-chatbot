#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""memox — a memoria do metodo Expx.

Indice invertido sobre os artefatos das skills do ecossistema. Sem rede, sem
modelo, sem dependencia externa: apenas a biblioteca padrao do Python 3.

Uso:
    memox.py indexar [--raiz DIR]
    memox.py estado  [--raiz DIR]
    memox.py arquivo <caminho> [--raiz DIR] [--formato texto|json]
    memox.py modulo  <nome>    [--raiz DIR] [--formato texto|json]
    memox.py buscar  <termo>   [--raiz DIR] [--formato texto|json]
    memox.py trabalho <id>     [--raiz DIR] [--formato texto|json]

Regras que este codigo implementa (ver SKILL.md):
  1. toda entrada aponta para um artefato real, com caminho e data;
  2. o indice e derivado e descartavel;
  3. nao indexa transcript, nao chama modelo;
  4. nao inventa relacao: regressao exige evidencia causal;
  5. silencio quando nao ha nada relevante;
  6. respeita os limites de ruido;
  7. nunca emite segredo: redige e marca o artefato como contaminado;
  8. o indice e ignorado pelo versionador;
  9. nunca edita artefato;
 10. consulta local e instantanea.
"""

import json
import os
import re
import sys
import time

VERSAO_INDICE = 1

# ---------------------------------------------------------------------------
# configuracao
# ---------------------------------------------------------------------------

CONFIG_PADRAO = {
    "max_entradas_recentes": 3,
    "teto_entradas": 8,
    "sempre_incluir": ["regressao", "reprovacao_qa", "zona_de_risco"],
    "fontes": {
        "relatorios": "docs/relatorios",
        "manutencao": "docs/manutencao",
        "entregas": "docs/entregas",
        "legado": "docs/legado",
        "features": "docs",
    },
    "ignorar": [".git", "node_modules", ".expx", "dist", "build", "vendor"],
}


def raiz_projeto(inicio=None):
    """Raiz do repositorio Git mais proxima; sem .git, o diretorio atual."""
    atual = os.path.abspath(inicio or os.getcwd())
    while True:
        if os.path.isdir(os.path.join(atual, ".git")):
            return atual
        pai = os.path.dirname(atual)
        if pai == atual:
            return os.path.abspath(inicio or os.getcwd())
        atual = pai


def dir_memoria(raiz):
    return os.path.join(raiz, ".expx", "memoria")


def carregar_config(raiz):
    cfg = json.loads(json.dumps(CONFIG_PADRAO))
    caminho = os.path.join(dir_memoria(raiz), "config.json")
    if os.path.isfile(caminho):
        try:
            with open(caminho, encoding="utf-8") as fh:
                usuario = json.load(fh)
            for chave, valor in usuario.items():
                if isinstance(valor, dict) and isinstance(cfg.get(chave), dict):
                    cfg[chave].update(valor)
                else:
                    cfg[chave] = valor
        except (ValueError, OSError):
            pass  # config invalida nao derruba a consulta: falha aberta
    return cfg


# ---------------------------------------------------------------------------
# frontmatter — parser YAML minimo, restrito ao subconjunto do expx-schema v1
# ---------------------------------------------------------------------------

def _escalar(bruto):
    txt = bruto.strip()
    if txt.startswith(("'", '"')) and len(txt) >= 2 and txt[-1] == txt[0]:
        return txt[1:-1]
    if txt in ("null", "~", ""):
        return None
    if txt == "true":
        return True
    if txt == "false":
        return False
    if txt.startswith("[") and txt.endswith("]"):
        corpo = txt[1:-1].strip()
        if not corpo:
            return []
        return [_escalar(p) for p in _dividir_lista(corpo)]
    if re.fullmatch(r"-?\d+", txt):
        return int(txt)
    return txt


def _dividir_lista(corpo):
    """Divide por virgula respeitando aspas e colchetes aninhados."""
    partes, atual, prof, aspas = [], [], 0, None
    for ch in corpo:
        if aspas:
            atual.append(ch)
            if ch == aspas:
                aspas = None
            continue
        if ch in "'\"":
            aspas = ch
            atual.append(ch)
        elif ch == "[":
            prof += 1
            atual.append(ch)
        elif ch == "]":
            prof -= 1
            atual.append(ch)
        elif ch == "," and prof == 0:
            partes.append("".join(atual))
            atual = []
        else:
            atual.append(ch)
    if atual:
        partes.append("".join(atual))
    return [p for p in (x.strip() for x in partes) if p]


def _indent(linha):
    return len(linha) - len(linha.lstrip(" "))


def _parse_bloco(linhas, i, base):
    """Le um mapa YAML a partir de linhas[i] com indentacao `base`."""
    mapa = {}
    while i < len(linhas):
        linha = linhas[i]
        if not linha.strip() or linha.lstrip().startswith("#"):
            i += 1
            continue
        ind = _indent(linha)
        if ind < base:
            break
        if linha.lstrip().startswith("- "):
            break
        m = re.match(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$", linha)
        if not m:
            i += 1
            continue
        chave, resto = m.group(1), m.group(2).strip()
        if resto:
            mapa[chave] = _escalar(resto)
            i += 1
            continue
        # valor em bloco: lista de itens ou mapa aninhado
        j = i + 1
        while j < len(linhas) and (not linhas[j].strip() or linhas[j].lstrip().startswith("#")):
            j += 1
        if j >= len(linhas) or _indent(linhas[j]) <= ind:
            mapa[chave] = None
            i = j
            continue
        if linhas[j].lstrip().startswith("- "):
            itens, i = _parse_lista(linhas, j, _indent(linhas[j]))
            mapa[chave] = itens
        else:
            sub, i = _parse_bloco(linhas, j, _indent(linhas[j]))
            mapa[chave] = sub
    return mapa, i


def _parse_lista(linhas, i, base):
    itens = []
    while i < len(linhas):
        linha = linhas[i]
        if not linha.strip() or linha.lstrip().startswith("#"):
            i += 1
            continue
        ind = _indent(linha)
        if ind < base or not linha.lstrip().startswith("- "):
            break
        conteudo = linha.lstrip()[2:].strip()
        if re.match(r"^[A-Za-z_][A-Za-z0-9_]*\s*:", conteudo):
            # item-mapa: reconstroi com a primeira chave na indentacao do bloco
            filhas = [" " * (base + 2) + conteudo]
            j = i + 1
            while j < len(linhas):
                if not linhas[j].strip():
                    j += 1
                    continue
                if _indent(linhas[j]) <= base:
                    break
                filhas.append(linhas[j])
                j += 1
            item, _ = _parse_bloco(filhas, 0, base + 2)
            itens.append(item)
            i = j
        else:
            itens.append(_escalar(conteudo))
            i += 1
    return itens, i


def ler_frontmatter(texto):
    """Devolve (mapa, corpo). Sem frontmatter valido, ({}, texto inteiro).

    O mapa pode trazer a chave privada `_defeito` descrevendo dano de parse:
    o artefato entra no indice com o que deu para ler, mas e reportado em
    `fora_do_indice` para que o problema seja visivel em vez de silencioso.
    """
    if not texto.startswith("---"):
        return {}, texto
    linhas = texto.split("\n")
    if linhas[0].strip() != "---":
        return {}, texto
    fim = None
    for idx in range(1, len(linhas)):
        if linhas[idx].strip() == "---":
            fim = idx
            break
    if fim is None:
        return {}, texto
    bloco = linhas[1:fim]
    try:
        mapa, _ = _parse_bloco(bloco, 0, 0)
    except Exception:
        return {"_defeito": "frontmatter ilegivel"}, "\n".join(linhas[fim + 1:])

    # aspas nao fechadas e lista nao fechada nao quebram o parser, mas
    # produzem valor errado em silencio. Detecta e reporta.
    defeitos = []
    for linha in bloco:
        limpa = linha.strip()
        if not limpa or limpa.startswith("#"):
            continue
        valor = limpa.split(":", 1)[1].strip() if ":" in limpa else limpa
        if valor.count('"') % 2 or valor.count("'") % 2:
            defeitos.append("aspas nao fechadas")
        if valor.count("[") != valor.count("]"):
            defeitos.append("lista nao fechada")
    if defeitos:
        mapa["_defeito"] = "; ".join(sorted(set(defeitos)))
    return mapa, "\n".join(linhas[fim + 1:])


# ---------------------------------------------------------------------------
# regra 7 — segredos
# ---------------------------------------------------------------------------

PADROES_SEGREDO = [
    (re.compile(r"\b(sk-[A-Za-z0-9]{16,}|sk-ant-[A-Za-z0-9\-_]{16,})\b"), "chave_api"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "chave_aws"),
    (re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"), "token_github"),
    (re.compile(r"\bxox[baprs]-[A-Za-z0-9\-]{10,}\b"), "token_slack"),
    (re.compile(r"\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b"), "jwt"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "chave_privada"),
    (re.compile(r"(?i)\b(?:senha|password|passwd|secret|api[_-]?key|token)\b\s*[:=]\s*['\"]?[^\s'\"]{8,}"), "credencial"),
    (re.compile(r"\b[a-z]+://[^\s:@/]+:[^\s:@/]+@[^\s/]+"), "url_com_credencial"),
    (re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b"), "cpf"),
]

MARCA_REDIGIDO = "[redigido pelo memox]"


def redigir(texto):
    """Devolve (texto_redigido, [tipos]). Regra 7: omite o trecho, guarda o caminho."""
    if not texto:
        return texto, []
    achados, saida = [], texto
    for padrao, tipo in PADROES_SEGREDO:
        if padrao.search(saida):
            achados.append(tipo)
            saida = padrao.sub(MARCA_REDIGIDO, saida)
    return saida, sorted(set(achados))


# ---------------------------------------------------------------------------
# leitura dos artefatos
# ---------------------------------------------------------------------------

def _rel(raiz, caminho):
    return os.path.relpath(caminho, raiz).replace(os.sep, "/")


def _listar(diretorio, nome_alvo, profundidade=3):
    """Procura arquivos com um nome dado ate `profundidade` niveis."""
    achados = []
    if not os.path.isdir(diretorio):
        return achados
    base_nivel = diretorio.rstrip(os.sep).count(os.sep)
    for atual, dirs, arqs in os.walk(diretorio):
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in CONFIG_PADRAO["ignorar"]]
        if atual.count(os.sep) - base_nivel > profundidade:
            dirs[:] = []
            continue
        for arq in arqs:
            if arq == nome_alvo:
                achados.append(os.path.join(atual, arq))
    return sorted(achados)


def _texto(caminho):
    try:
        with open(caminho, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""


def _lista(valor):
    if valor is None:
        return []
    if isinstance(valor, list):
        return [str(v).strip() for v in valor if v is not None and str(v).strip()]
    txt = str(valor).strip()
    return [txt] if txt else []


def _uma_linha(texto, limite=200):
    """Primeira frase util da prosa, ja redigida e sem markdown de titulo."""
    for linha in (texto or "").split("\n"):
        limpa = linha.strip()
        if not limpa or limpa.startswith(("#", "---", "|", ">", "```", "<!--", "- [", "* [")):
            continue
        limpa = re.sub(r"^[-*+]\s+", "", limpa)
        limpa = re.sub(r"[*_`]", "", limpa)
        if len(limpa) < 12:
            continue
        return limpa[:limite]
    return ""


def _secao(texto, titulos):
    """Corpo da primeira secao markdown cujo titulo casa com algum dos termos."""
    linhas = (texto or "").split("\n")
    coletando, nivel, buffer = False, 0, []
    for linha in linhas:
        m = re.match(r"^(#{1,6})\s+(.*)$", linha)
        if m:
            if coletando and len(m.group(1)) <= nivel:
                break
            titulo = m.group(2).lower()
            if not coletando and any(t in titulo for t in titulos):
                coletando, nivel = True, len(m.group(1))
                continue
        if coletando:
            buffer.append(linha)
    return "\n".join(buffer).strip()


# ---------------------------------------------------------------------------
# coleta por fonte
# ---------------------------------------------------------------------------

def coletar(raiz, cfg):
    """Le todos os artefatos e devolve (trabalhos, divida, contaminados, avisos)."""
    fontes = cfg["fontes"]
    trabalhos = {}          # trabalho_id -> registro
    contaminados = {}       # caminho -> [tipos]
    avisos = []             # artefatos que nao entraram, e por que

    def marcar(caminho_rel, tipos):
        if tipos:
            contaminados.setdefault(caminho_rel, [])
            for t in tipos:
                if t not in contaminados[caminho_rel]:
                    contaminados[caminho_rel].append(t)

    def conferir(fm, caminho_rel, exige_frontmatter=True):
        """Reporta artefato ilegivel ou meio-lido. Nunca interrompe a coleta."""
        if not fm:
            if exige_frontmatter:
                avisos.append({"artefato": caminho_rel,
                               "motivo": "sem frontmatter expx-schema v1"})
            return
        defeito = fm.pop("_defeito", None)
        if defeito:
            avisos.append({"artefato": caminho_rel,
                           "motivo": "frontmatter mal formado (%s): campos podem "
                                     "ter entrado incompletos" % defeito})

    def registro(tid, caminho_rel):
        if not tid:
            return None
        if tid not in trabalhos:
            trabalhos[tid] = {
                "trabalho_id": tid,
                "titulo": None,
                "tipo": None,
                "tipo_trabalho": None,
                "ferramenta": None,
                "data": None,
                "modulos": [],
                "arquivos_alterados": [],
                "arquivos_impactados": [],
                "causa": None,
                "modo": None,
                "comprovada": None,
                "risco_residual": None,
                "decisoes": [],
                "lacunas": [],
                "qa": None,
                "entrega": None,
                "resumo": None,
                "fontes": [],
            }
        reg = trabalhos[tid]
        if caminho_rel not in reg["fontes"]:
            reg["fontes"].append(caminho_rel)
        return reg

    # --- docs/relatorios/*/tecnico.md ---------------------------------------
    dir_rel = os.path.join(raiz, fontes["relatorios"])
    for caminho in _listar(dir_rel, "tecnico.md"):
        rel = _rel(raiz, caminho)
        bruto = _texto(caminho)
        texto, tipos = redigir(bruto)
        marcar(rel, tipos)
        fm, corpo = ler_frontmatter(texto)
        conferir(fm, rel)
        tid = fm.get("trabalho_id") or os.path.basename(os.path.dirname(caminho))
        reg = registro(str(tid), rel)
        if reg is None:
            continue
        reg["titulo"] = reg["titulo"] or fm.get("titulo")
        reg["tipo"] = reg["tipo"] or fm.get("tipo_ocorrencia")
        reg["ferramenta"] = reg["ferramenta"] or fm.get("expx_tool")
        reg["data"] = reg["data"] or fm.get("fechado_em")
        reg["modulos"] = sorted(set(reg["modulos"]) | set(_lista(fm.get("modulo_afetado"))))
        reg["arquivos_alterados"] = sorted(
            set(reg["arquivos_alterados"]) | set(_lista(fm.get("arquivos_alterados")))
        )
        causa = _secao(corpo, ["causa", "diagn"]) or corpo
        reg["causa"] = reg["causa"] or _uma_linha(causa)
        risco = _secao(corpo, ["risco residual", "risco"])
        if risco:
            reg["risco_residual"] = _uma_linha(risco)
        reg["resumo"] = reg["resumo"] or _uma_linha(corpo)

    # --- docs/relatorios/INDICE.md — a linha do tempo -----------------------
    caminho_indice = os.path.join(dir_rel, "INDICE.md")
    linha_do_tempo = []
    if os.path.isfile(caminho_indice):
        rel = _rel(raiz, caminho_indice)
        texto, tipos = redigir(_texto(caminho_indice))
        marcar(rel, tipos)
        fm, _ = ler_frontmatter(texto)
        conferir(fm, rel, exige_frontmatter=False)
        for entrada in (fm.get("entradas") or []):
            if not isinstance(entrada, dict):
                continue
            tid = entrada.get("oc_id") or entrada.get("trabalho_id")
            linha_do_tempo.append({
                "trabalho_id": tid,
                "data": entrada.get("data"),
                "tipo": entrada.get("tipo"),
                "modulo": entrada.get("modulo"),
                "resumo": entrada.get("resumo"),
                "pasta": entrada.get("pasta"),
                "origem": rel,
            })
            reg = registro(str(tid) if tid else None, rel)
            if reg:
                reg["data"] = reg["data"] or entrada.get("data")
                reg["tipo"] = reg["tipo"] or entrada.get("tipo")
                reg["resumo"] = reg["resumo"] or entrada.get("resumo")
                if entrada.get("modulo"):
                    reg["modulos"] = sorted(set(reg["modulos"]) | {str(entrada["modulo"])})

    # --- docs/manutencao/*/01-CAUSA-RAIZ.md ---------------------------------
    dir_man = os.path.join(raiz, fontes["manutencao"])
    for caminho in _listar(dir_man, "01-CAUSA-RAIZ.md"):
        rel = _rel(raiz, caminho)
        texto, tipos = redigir(_texto(caminho))
        marcar(rel, tipos)
        fm, corpo = ler_frontmatter(texto)
        conferir(fm, rel)
        tid = fm.get("trabalho_id") or os.path.basename(os.path.dirname(caminho))
        reg = registro(str(tid), rel)
        if reg is None:
            continue
        reg["modo"] = fm.get("modo")
        reg["comprovada"] = fm.get("comprovada")
        reg["ferramenta"] = reg["ferramenta"] or fm.get("expx_tool") or "runx"
        reg["arquivos_impactados"] = sorted(
            set(reg["arquivos_impactados"]) | set(_lista(fm.get("arquivos_impactados")))
        )
        if not reg["causa"]:
            reg["causa"] = _uma_linha(_secao(corpo, ["causa"]) or corpo)
        for dec in (fm.get("decisoes") or []):
            if isinstance(dec, dict):
                reg["decisoes"].append({
                    "id": dec.get("id"),
                    "decisao": dec.get("decisao"),
                    "alternativa_descartada": dec.get("alternativa_descartada"),
                    "motivo": dec.get("motivo"),
                    "status": dec.get("status", "fechada"),
                    "origem": rel,
                })

    # --- 00-DECISOES.md (features e manutencao) -----------------------------
    for base in {os.path.join(raiz, fontes["features"]), dir_man}:
        for caminho in _listar(base, "00-DECISOES.md"):
            rel = _rel(raiz, caminho)
            texto, tipos = redigir(_texto(caminho))
            marcar(rel, tipos)
            fm, _ = ler_frontmatter(texto)
            conferir(fm, rel)
            tid = fm.get("trabalho_id") or os.path.basename(os.path.dirname(caminho))
            reg = registro(str(tid), rel)
            if reg is None:
                continue
            reg["ferramenta"] = reg["ferramenta"] or fm.get("expx_tool")
            reg["tipo_trabalho"] = reg["tipo_trabalho"] or "feature"
            for dec in (fm.get("decisoes") or []):
                if isinstance(dec, dict):
                    reg["decisoes"].append({
                        "id": dec.get("id"),
                        "decisao": dec.get("decisao"),
                        "alternativa_descartada": dec.get("alternativa_descartada"),
                        "motivo": dec.get("motivo"),
                        "status": dec.get("status", "fechada"),
                        "origem": rel,
                    })

    # --- ORQUESTRADOR.md — titulo, tipo e datas do trabalho -----------------
    for base in {os.path.join(raiz, fontes["features"]), dir_man}:
        for caminho in _listar(base, "ORQUESTRADOR.md"):
            rel = _rel(raiz, caminho)
            texto, tipos = redigir(_texto(caminho))
            marcar(rel, tipos)
            fm, _ = ler_frontmatter(texto)
            conferir(fm, rel)
            tid = fm.get("trabalho_id")
            if not tid:
                continue
            reg = registro(str(tid), rel)
            reg["titulo"] = reg["titulo"] or fm.get("titulo")
            reg["tipo"] = reg["tipo"] or fm.get("tipo_ocorrencia")
            reg["tipo_trabalho"] = reg["tipo_trabalho"] or fm.get("tipo_trabalho")
            reg["ferramenta"] = reg["ferramenta"] or fm.get("expx_tool")
            reg["data"] = reg["data"] or fm.get("concluido_em") or fm.get("atualizado_em")

    # --- FECHAMENTO.md — o lado Build do relatorio tecnico -------------------
    #
    # O `fechamento` da sprintx cumpre o mesmo papel do `relatorio_tecnico` da
    # runx: e o registro do que a feature entregou. Sem ler este kind, feature
    # nova fecha e continua invisivel para quem pergunta "quem ja mexeu neste
    # arquivo" — a propria sprintx promete o contrario no seu 00-schema.md.
    #
    # Profundidade 4: o layout novo e docs/sprintx/features/<slug>/FECHAMENTO.md.
    for base in {os.path.join(raiz, fontes["features"]), dir_man}:
        for caminho in _listar(base, "FECHAMENTO.md", profundidade=4):
            rel = _rel(raiz, caminho)
            texto, tipos = redigir(_texto(caminho))
            marcar(rel, tipos)
            fm, corpo = ler_frontmatter(texto)
            conferir(fm, rel)
            tid = fm.get("trabalho_id") or os.path.basename(os.path.dirname(caminho))
            reg = registro(str(tid), rel)
            if reg is None:
                continue
            reg["titulo"] = reg["titulo"] or fm.get("titulo")
            reg["tipo_trabalho"] = reg["tipo_trabalho"] or fm.get("tipo_trabalho")
            reg["ferramenta"] = reg["ferramenta"] or fm.get("expx_tool")
            reg["data"] = reg["data"] or fm.get("fechado_em")
            reg["modulos"] = sorted(set(reg["modulos"]) | set(_lista(fm.get("modulo_afetado"))))
            reg["arquivos_alterados"] = sorted(
                set(reg["arquivos_alterados"]) | set(_lista(fm.get("arquivos_alterados")))
            )
            # `risco_residual` do fechamento e sempre uma frase, nunca null
            # (regra dura do kind): quando nada ficou, a skill escreve a frase
            # que diz isso. Por isso entra direto, sem tratar ausencia.
            if fm.get("risco_residual"):
                reg["risco_residual"] = _uma_linha(str(fm["risco_residual"]))
            if fm.get("decisao_principal"):
                reg["decisoes"].append({
                    "id": "D-principal",
                    "decisao": _uma_linha(str(fm["decisao_principal"])),
                    "alternativa_descartada": None,
                    "motivo": None,
                    "status": "fechada",
                    "origem": rel,
                })
            reg["resumo"] = reg["resumo"] or _uma_linha(
                str(fm.get("resumo") or "") or corpo
            )

    # --- base/00-LACUNAS.md -------------------------------------------------
    for base in {os.path.join(raiz, fontes["features"]), dir_man}:
        for caminho in _listar(base, "00-LACUNAS.md", profundidade=4):
            rel = _rel(raiz, caminho)
            texto, tipos = redigir(_texto(caminho))
            marcar(rel, tipos)
            pasta_trabalho = os.path.dirname(os.path.dirname(caminho))
            tid = os.path.basename(pasta_trabalho)
            fm, corpo = ler_frontmatter(texto)
            conferir(fm, rel, exige_frontmatter=False)
            tid = fm.get("trabalho_id") or tid
            reg = registro(str(tid), rel)
            if reg is None:
                continue
            for linha in corpo.split("\n"):
                limpa = re.sub(r"^[-*+]\s+", "", linha.strip())
                if limpa and not limpa.startswith(("#", "|", "---", "```")) and len(limpa) > 12:
                    reg["lacunas"].append({"lacuna": limpa[:200], "origem": rel})

    # --- docs/manutencao/*/QA.md -------------------------------------------
    for caminho in _listar(dir_man, "QA.md"):
        rel = _rel(raiz, caminho)
        texto, tipos = redigir(_texto(caminho))
        marcar(rel, tipos)
        fm, corpo = ler_frontmatter(texto)
        conferir(fm, rel)
        tid = fm.get("trabalho_id") or os.path.basename(os.path.dirname(caminho))
        reg = registro(str(tid), rel)
        if reg is None:
            continue
        veredito = fm.get("veredito")
        if not veredito:
            m = re.search(r"VEREDITO:\s*(APROVADO|REPROVADO)", corpo, re.I)
            veredito = m.group(1).lower() if m else None
        achados = []
        for ach in (fm.get("achados") or []):
            if isinstance(ach, dict):
                achados.append({
                    "severidade": ach.get("severidade"),
                    "arquivo": ach.get("arquivo"),
                    "problema": ach.get("problema"),
                })
        reg["qa"] = {
            "veredito": veredito,
            "executado_em": fm.get("executado_em"),
            "achados": achados,
            "origem": rel,
        }

    # --- docs/entregas/*/ENTREGA.md ----------------------------------------
    dir_ent = os.path.join(raiz, fontes["entregas"])
    for caminho in _listar(dir_ent, "ENTREGA.md"):
        rel = _rel(raiz, caminho)
        texto, tipos = redigir(_texto(caminho))
        marcar(rel, tipos)
        fm, _ = ler_frontmatter(texto)
        conferir(fm, rel)
        tid = fm.get("trabalho_id") or os.path.basename(os.path.dirname(caminho))
        reg = registro(str(tid), rel)
        if reg is None:
            continue
        faixas = {}
        for item in (fm.get("faixa_atencao") or []):
            if isinstance(item, dict) and item.get("arquivo"):
                faixas[str(item["arquivo"])] = item.get("faixa")
        reg["entrega"] = {
            "branch": fm.get("branch"),
            "commits": _lista(fm.get("commits")),
            "faixa_atencao": faixas,
            "faixa": fm.get("faixa"),
            "origem": rel,
        }
        reg["data"] = reg["data"] or fm.get("entregue_em")

    # --- docs/legado/DIVIDA.md ---------------------------------------------
    divida = {}
    caminho_div = os.path.join(raiz, fontes["legado"], "DIVIDA.md")
    if os.path.isfile(caminho_div):
        rel = _rel(raiz, caminho_div)
        texto, tipos = redigir(_texto(caminho_div))
        marcar(rel, tipos)
        fm, corpo = ler_frontmatter(texto)
        conferir(fm, rel, exige_frontmatter=False)
        for item in (fm.get("dividas") or fm.get("divida") or []):
            if isinstance(item, dict) and item.get("arquivo"):
                divida[str(item["arquivo"])] = {
                    "descricao": item.get("descricao") or item.get("divida"),
                    "risco": item.get("risco"),
                    "origem": rel,
                }
        # tabela em prosa: | arquivo | descricao | risco |
        for linha in corpo.split("\n"):
            if linha.count("|") >= 3 and not re.search(r"^\s*\|[\s:|-]+\|\s*$", linha):
                celulas = [c.strip() for c in linha.strip().strip("|").split("|")]
                if len(celulas) >= 2 and "/" in celulas[0] and celulas[0] not in divida:
                    divida[celulas[0]] = {
                        "descricao": celulas[1],
                        "risco": celulas[2] if len(celulas) > 2 else None,
                        "origem": rel,
                    }

    # --- docs/legado/PERFIL.md — zonas de risco ----------------------------
    zonas = {}
    caminho_perfil = os.path.join(raiz, fontes["legado"], "PERFIL.md")
    if os.path.isfile(caminho_perfil):
        rel = _rel(raiz, caminho_perfil)
        texto, tipos = redigir(_texto(caminho_perfil))
        marcar(rel, tipos)
        fm, corpo = ler_frontmatter(texto)
        conferir(fm, rel, exige_frontmatter=False)
        for item in (fm.get("zonas_de_risco") or fm.get("zona_de_risco") or []):
            if isinstance(item, dict):
                alvo = item.get("arquivo") or item.get("modulo") or item.get("caminho")
                if alvo:
                    zonas[str(alvo)] = {"motivo": item.get("motivo"), "origem": rel}
            elif item:
                zonas[str(item)] = {"motivo": None, "origem": rel}
        if not zonas:
            secao = _secao(corpo, ["zona de risco", "zonas de risco"])
            for linha in secao.split("\n"):
                limpa = re.sub(r"^[-*+]\s+", "", linha.strip())
                alvo = limpa.split()[0].strip("`") if limpa else ""
                if alvo and ("/" in alvo or alvo.isidentifier()):
                    zonas[alvo] = {"motivo": limpa[:160], "origem": rel}

    return trabalhos, divida, zonas, linha_do_tempo, contaminados, avisos


# ---------------------------------------------------------------------------
# sinais derivados
# ---------------------------------------------------------------------------

def _data_ord(valor):
    return valor if isinstance(valor, str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", valor) else ""


def detectar_regressoes(trabalhos):
    """Regra 4: regressao exige evidencia causal, nunca coincidencia de arquivo.

    Um trabalho POSTERIOR B e regressao de A quando a causa raiz de B aponta
    (arquivos_impactados) para um arquivo que A ALTEROU (arquivos_alterados),
    e a data de A e estritamente anterior a de B. Sem as duas datas, ou sem
    causa raiz em B, o vinculo e registrado como coincidencia de arquivo.
    """
    regressoes, coincidencias = [], []
    lista = list(trabalhos.values())
    for b in lista:
        impactados = set(b.get("arquivos_impactados") or [])
        if not impactados:
            continue
        data_b = _data_ord(b.get("data"))
        tem_causa = bool(b.get("modo") == "causa_raiz")
        for a in lista:
            if a["trabalho_id"] == b["trabalho_id"]:
                continue
            alterados = set(a.get("arquivos_alterados") or [])
            comuns = sorted(impactados & alterados)
            if not comuns:
                continue
            data_a = _data_ord(a.get("data"))
            anterior = bool(data_a and data_b and data_a < data_b)
            comprovada = b.get("comprovada") is True
            if anterior and tem_causa and comprovada:
                regressoes.append({
                    "arquivos": comuns,
                    "trabalho_anterior": a["trabalho_id"],
                    "data_anterior": a.get("data"),
                    "trabalho_posterior": b["trabalho_id"],
                    "data_posterior": b.get("data"),
                    "evidencia": (
                        "causa raiz comprovada de %s aponta para arquivo alterado por %s"
                        % (b["trabalho_id"], a["trabalho_id"])
                    ),
                    "origem_causa": next(
                        (f for f in b.get("fontes", []) if f.endswith("01-CAUSA-RAIZ.md")), None
                    ),
                    "origem_alteracao": next(
                        (f for f in a.get("fontes", []) if f.endswith("tecnico.md")), None
                    ),
                })
            else:
                motivo = []
                if not anterior:
                    motivo.append("ordem cronologica nao estabelecida")
                if not tem_causa:
                    motivo.append("trabalho posterior sem causa raiz (modo analise de impacto)")
                elif not comprovada:
                    motivo.append("causa raiz nao comprovada")
                coincidencias.append({
                    "arquivos": comuns,
                    "trabalhos": sorted([a["trabalho_id"], b["trabalho_id"]]),
                    "motivo": "; ".join(motivo) or "evidencia causal ausente",
                })
    # deduplica coincidencias simetricas
    vistas, unicas = set(), []
    for c in coincidencias:
        chave = (tuple(c["trabalhos"]), tuple(c["arquivos"]))
        if chave not in vistas:
            vistas.add(chave)
            unicas.append(c)
    return regressoes, unicas


def construir_indice(raiz, cfg):
    inicio = time.time()
    trabalhos, divida, zonas, linha_do_tempo, contaminados, avisos = coletar(raiz, cfg)
    regressoes, coincidencias = detectar_regressoes(trabalhos)

    por_arquivo, por_modulo, por_decisao, por_termo = {}, {}, {}, {}

    def entrada_de(reg, arquivo, papel):
        return {
            "trabalho_id": reg["trabalho_id"],
            "titulo": reg.get("titulo"),
            "data": reg.get("data"),
            "tipo": reg.get("tipo") or reg.get("tipo_trabalho"),
            "ferramenta": reg.get("ferramenta"),
            "causa": reg.get("causa") or reg.get("resumo"),
            "papel": papel,
            "artefato": next(
                (f for f in reg.get("fontes", []) if f.endswith("tecnico.md")),
                (reg.get("fontes") or [None])[0],
            ),
        }

    for reg in trabalhos.values():
        alvos = [(a, "alterado") for a in reg.get("arquivos_alterados") or []]
        alvos += [(a, "impactado") for a in reg.get("arquivos_impactados") or []]
        vistos = set()
        for arquivo, papel in alvos:
            if (arquivo, reg["trabalho_id"]) in vistos:
                continue
            vistos.add((arquivo, reg["trabalho_id"]))
            por_arquivo.setdefault(arquivo, []).append(entrada_de(reg, arquivo, papel))
        for modulo in reg.get("modulos") or []:
            por_modulo.setdefault(modulo, []).append(entrada_de(reg, None, "modulo"))
            for dec in reg.get("decisoes") or []:
                por_decisao.setdefault(modulo, []).append(dict(dec, trabalho_id=reg["trabalho_id"]))
        campos = " ".join(str(x) for x in [
            reg.get("titulo"), reg.get("causa"), reg.get("resumo"),
            " ".join(str(d.get("decisao") or "") for d in reg.get("decisoes") or []),
        ] if x)
        for termo in set(re.findall(r"[0-9a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ_\-]{3,}", campos.lower())):
            por_termo.setdefault(termo, [])
            if reg["trabalho_id"] not in por_termo[termo]:
                por_termo[termo].append(reg["trabalho_id"])

    # sinais por arquivo
    sinais_arquivo = {}
    arquivos_regressivos = {}
    for r in regressoes:
        for arq in r["arquivos"]:
            arquivos_regressivos.setdefault(arq, []).append(r)

    for arquivo, entradas in por_arquivo.items():
        datas = sorted([e["data"] for e in entradas if _data_ord(e.get("data"))], reverse=True)
        reprovacoes = []
        for reg in trabalhos.values():
            qa = reg.get("qa") or {}
            if qa.get("veredito") == "reprovado":
                tocou = arquivo in set(reg.get("arquivos_alterados") or []) | set(
                    reg.get("arquivos_impactados") or [])
                citado = any(a.get("arquivo") == arquivo for a in qa.get("achados") or [])
                if tocou or citado:
                    reprovacoes.append({
                        "trabalho_id": reg["trabalho_id"],
                        "executado_em": qa.get("executado_em"),
                        "origem": qa.get("origem"),
                    })
        zona = zonas.get(arquivo)
        if not zona:
            for alvo, dados in zonas.items():
                if alvo and (arquivo.startswith(alvo.rstrip("/") + "/") or alvo in arquivo):
                    zona = dados
                    break
        faixas = {}
        for reg in trabalhos.values():
            entrega = reg.get("entrega") or {}
            faixa = (entrega.get("faixa_atencao") or {}).get(arquivo) or (
                entrega.get("faixa") if arquivo in set(reg.get("arquivos_alterados") or []) else None)
            if faixa:
                faixas[faixa] = faixas.get(faixa, 0) + 1
        sinais_arquivo[arquivo] = {
            "trabalhos": len(entradas),
            "ultimo_trabalho_em": datas[0] if datas else None,
            "reprovacoes_qa": len(reprovacoes),
            "detalhe_reprovacoes": reprovacoes,
            "regressoes": arquivos_regressivos.get(arquivo, []),
            "zona_de_risco": zona,
            "divida": divida.get(arquivo),
            "faixa_atencao_frequente": max(faixas, key=faixas.get) if faixas else None,
        }

    sinais_modulo = {}
    for modulo, entradas in por_modulo.items():
        arquivos_do_modulo = [
            a for a, s in sinais_arquivo.items()
            if any(e["trabalho_id"] in {x["trabalho_id"] for x in entradas} for e in por_arquivo[a])
        ]
        datas = sorted([e["data"] for e in entradas if _data_ord(e.get("data"))], reverse=True)
        regs_modulo, vistas_reg = [], set()
        for a in arquivos_do_modulo:
            for r in sinais_arquivo[a]["regressoes"]:
                chave = (r["trabalho_anterior"], r["trabalho_posterior"], tuple(r["arquivos"]))
                if chave not in vistas_reg:
                    vistas_reg.add(chave)
                    regs_modulo.append(r)
        sinais_modulo[modulo] = {
            "trabalhos": len({e["trabalho_id"] for e in entradas}),
            "ultimo_trabalho_em": datas[0] if datas else None,
            "reprovacoes_qa": sum(sinais_arquivo[a]["reprovacoes_qa"] for a in arquivos_do_modulo),
            "regressoes": regs_modulo,
            "arquivos": sorted(arquivos_do_modulo),
        }

    indice = {
        "versao": VERSAO_INDICE,
        "gerado_em": time.strftime("%Y-%m-%d"),
        "gerado_em_epoch": int(time.time()),
        "duracao_ms": int((time.time() - inicio) * 1000),
        "raiz": ".",
        "totais": {
            "trabalhos": len(trabalhos),
            "arquivos": len(por_arquivo),
            "modulos": len(por_modulo),
            "regressoes": len(regressoes),
            "coincidencias": len(coincidencias),
            "artefatos_contaminados": len(contaminados),
        },
        "trabalhos": trabalhos,
        "por_arquivo": por_arquivo,
        "por_modulo": por_modulo,
        "por_decisao": por_decisao,
        "por_termo": por_termo,
        "sinais": {"arquivo": sinais_arquivo, "modulo": sinais_modulo},
        "regressoes": regressoes,
        "coincidencias_arquivo": coincidencias,
        "linha_do_tempo": linha_do_tempo,
        "artefatos_contaminados": contaminados,
        "fora_do_indice": avisos,
        "config": cfg,
    }
    return indice


def gravar_indice(raiz, indice):
    destino = dir_memoria(raiz)
    os.makedirs(destino, exist_ok=True)
    caminho = os.path.join(destino, "indice.json")
    tmp = caminho + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(indice, fh, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, caminho)
    with open(os.path.join(destino, "ultima-indexacao"), "w", encoding="utf-8") as fh:
        fh.write("%d\n" % int(time.time()))
    cfg_path = os.path.join(destino, "config.json")
    if not os.path.isfile(cfg_path):
        with open(cfg_path, "w", encoding="utf-8") as fh:
            json.dump(CONFIG_PADRAO, fh, ensure_ascii=False, indent=2)
    _garantir_gitignore(raiz)
    return caminho


def _garantir_gitignore(raiz):
    """Regra 8: o indice e ignorado pelo versionador."""
    gi = os.path.join(raiz, ".gitignore")
    linha = ".expx/memoria/"
    try:
        atual = _texto(gi) if os.path.isfile(gi) else ""
        if linha not in atual:
            with open(gi, "a", encoding="utf-8") as fh:
                if atual and not atual.endswith("\n"):
                    fh.write("\n")
                fh.write("# indice derivado do memox: reconstruivel, nao versionado\n")
                fh.write(linha + "\n")
    except OSError:
        pass


ALVOS_REINDEX = ("tecnico.md", "INDICE.md", "01-CAUSA-RAIZ.md", "00-DECISOES.md",
                 "QA.md", "ENTREGA.md", "DIVIDA.md", "PERFIL.md", "00-LACUNAS.md",
                 "ORQUESTRADOR.md")


def precisa_reindexar(raiz, cfg):
    """True quando existe artefato mais novo que a ultima reconstrucao.

    Etapa 5: nao ha atualizacao incremental. Isto so decide SE reconstroi,
    e a reconstrucao e sempre do zero.
    """
    marca = os.path.join(dir_memoria(raiz), "ultima-indexacao")
    if not os.path.isfile(os.path.join(dir_memoria(raiz), "indice.json")):
        return True
    try:
        with open(marca, encoding="utf-8") as fh:
            ultima = int(fh.read().strip())
    except (OSError, ValueError):
        return True
    for chave in ("relatorios", "manutencao", "entregas", "legado", "features"):
        base = os.path.join(raiz, cfg["fontes"][chave])
        if not os.path.isdir(base):
            continue
        base_nivel = base.rstrip(os.sep).count(os.sep)
        for atual, dirs, arqs in os.walk(base):
            dirs[:] = [d for d in dirs
                       if not d.startswith(".") and d not in cfg.get("ignorar", [])]
            if atual.count(os.sep) - base_nivel > 4:
                dirs[:] = []
                continue
            for arq in arqs:
                if arq in ALVOS_REINDEX:
                    try:
                        if os.path.getmtime(os.path.join(atual, arq)) > ultima:
                            return True
                    except OSError:
                        continue
    return False


def carregar_indice(raiz):
    caminho = os.path.join(dir_memoria(raiz), "indice.json")
    if not os.path.isfile(caminho):
        return None
    try:
        with open(caminho, encoding="utf-8") as fh:
            return json.load(fh)
    except (ValueError, OSError):
        return None


# ---------------------------------------------------------------------------
# consulta — regra 6, controle de ruido
# ---------------------------------------------------------------------------

def _relevante(entrada, sinais):
    """Entrada que fura o limite de recencia: regressao, QA reprovado ou zona de risco."""
    motivos = []
    regs = (sinais or {}).get("regressoes")
    for r in (regs if isinstance(regs, list) else []):
        if entrada["trabalho_id"] in (r.get("trabalho_anterior"), r.get("trabalho_posterior")):
            motivos.append("regressao")
            break
    for rep in (sinais or {}).get("detalhe_reprovacoes") or []:
        if rep.get("trabalho_id") == entrada["trabalho_id"]:
            motivos.append("reprovacao_qa")
            break
    if (sinais or {}).get("zona_de_risco"):
        motivos.append("zona_de_risco")
    return motivos


def selecionar(entradas, sinais, cfg):
    """Aplica o controle de ruido. Devolve (selecionadas, total, estourou_teto)."""
    ordenadas = sorted(entradas, key=lambda e: (_data_ord(e.get("data")), e["trabalho_id"]), reverse=True)
    max_rec = int(cfg.get("max_entradas_recentes", 3))
    teto = int(cfg.get("teto_entradas", 8))

    escolhidas, motivos = [], {}
    for e in ordenadas[:max_rec]:
        escolhidas.append(e)
        motivos[e["trabalho_id"]] = ["recente"]
    for e in ordenadas:
        if e["trabalho_id"] in motivos:
            continue
        m = _relevante(e, sinais)
        # zona de risco sozinha nao promove entrada antiga: e sinal do arquivo, nao da entrada
        m = [x for x in m if x != "zona_de_risco"]
        if m:
            escolhidas.append(e)
            motivos[e["trabalho_id"]] = m
    escolhidas.sort(key=lambda e: (_data_ord(e.get("data")), e["trabalho_id"]), reverse=True)
    return escolhidas, len(ordenadas), len(escolhidas) > teto, motivos


# ---------------------------------------------------------------------------
# formatacao
# ---------------------------------------------------------------------------

def _linha_entrada(e, motivos):
    marca = ""
    tags = [m for m in motivos.get(e["trabalho_id"], []) if m != "recente"]
    if tags:
        marca = "  [%s]" % ", ".join(tags)
    partes = ["- %s" % (e.get("data") or "sem data")]
    partes.append(e["trabalho_id"])
    if e.get("tipo"):
        partes.append("(%s)" % e["tipo"])
    causa = e.get("causa") or e.get("titulo") or ""
    linha = " ".join(partes)
    if causa:
        linha += " — %s" % causa
    linha += marca
    if e.get("artefato"):
        linha += "\n  ver: %s" % e["artefato"]
    return linha


def consultar_arquivo(indice, caminho, cfg):
    entradas = indice["por_arquivo"].get(caminho)
    if not entradas:
        # tolera caminho parcial: casa por sufixo
        casados = [k for k in indice["por_arquivo"] if k.endswith(caminho) or caminho in k]
        if len(casados) == 1:
            caminho, entradas = casados[0], indice["por_arquivo"][casados[0]]
        elif len(casados) > 1:
            return {"tipo": "ambiguo", "candidatos": sorted(casados)[:20], "alvo": caminho}
    if not entradas:
        return {"tipo": "vazio", "alvo": caminho}
    sinais = indice["sinais"]["arquivo"].get(caminho, {})
    escolhidas, total, estourou, motivos = selecionar(entradas, sinais, cfg)
    return {
        "tipo": "arquivo", "alvo": caminho, "total": total, "estourou": estourou,
        "entradas": escolhidas, "motivos": motivos, "sinais": sinais,
    }


def consultar_modulo(indice, modulo, cfg):
    entradas = indice["por_modulo"].get(modulo)
    if not entradas:
        casados = [k for k in indice["por_modulo"] if modulo.lower() in k.lower()]
        if len(casados) == 1:
            modulo, entradas = casados[0], indice["por_modulo"][casados[0]]
        elif len(casados) > 1:
            return {"tipo": "ambiguo", "candidatos": sorted(casados)[:20], "alvo": modulo}
    if not entradas:
        return {"tipo": "vazio", "alvo": modulo}
    sinais = indice["sinais"]["modulo"].get(modulo, {})
    unicas = {}
    for e in entradas:
        unicas.setdefault(e["trabalho_id"], e)
    escolhidas, total, estourou, motivos = selecionar(list(unicas.values()), sinais, cfg)
    return {
        "tipo": "modulo", "alvo": modulo, "total": total, "estourou": estourou,
        "entradas": escolhidas, "motivos": motivos, "sinais": sinais,
        "decisoes": indice["por_decisao"].get(modulo, []),
    }


def consultar_termo(indice, termo, cfg):
    alvo = termo.lower().strip()
    ids = set()
    for chave, lista in indice["por_termo"].items():
        if alvo in chave:
            ids.update(lista)
    if not ids:
        return {"tipo": "vazio", "alvo": termo}
    entradas = []
    for tid in ids:
        reg = indice["trabalhos"].get(tid)
        if not reg:
            continue
        entradas.append({
            "trabalho_id": tid, "titulo": reg.get("titulo"), "data": reg.get("data"),
            "tipo": reg.get("tipo") or reg.get("tipo_trabalho"),
            "causa": reg.get("causa") or reg.get("resumo"),
            "artefato": next((f for f in reg.get("fontes", []) if f.endswith("tecnico.md")),
                             (reg.get("fontes") or [None])[0]),
        })
    escolhidas, total, estourou, motivos = selecionar(entradas, {}, cfg)
    return {"tipo": "termo", "alvo": termo, "total": total, "estourou": estourou,
            "entradas": escolhidas, "motivos": motivos, "sinais": {}}


def consultar_trabalho(indice, tid):
    reg = indice["trabalhos"].get(tid)
    if not reg:
        casados = [k for k in indice["trabalhos"] if tid.lower() in k.lower()]
        if len(casados) == 1:
            reg = indice["trabalhos"][casados[0]]
        elif len(casados) > 1:
            return {"tipo": "ambiguo", "candidatos": sorted(casados)[:20], "alvo": tid}
    if not reg:
        return {"tipo": "vazio", "alvo": tid}
    return {"tipo": "trabalho", "alvo": reg["trabalho_id"], "registro": reg}


def formatar(resultado, indice, cabecalho=True):
    """Texto para humano. Silencio total (string vazia) quando nao ha nada — regra 5."""
    t = resultado["tipo"]
    if t == "vazio":
        return ""
    if t == "ambiguo":
        linhas = ["memox — '%s' casa com mais de um alvo:" % resultado["alvo"]]
        linhas += ["  %s" % c for c in resultado["candidatos"]]
        return "\n".join(linhas)
    if t == "trabalho":
        reg = resultado["registro"]
        linhas = ["memox — trabalho %s" % reg["trabalho_id"]]
        if reg.get("titulo"):
            linhas.append("  titulo: %s" % reg["titulo"])
        for rotulo, chave in [("data", "data"), ("tipo", "tipo"), ("ferramenta", "ferramenta")]:
            if reg.get(chave):
                linhas.append("  %s: %s" % (rotulo, reg[chave]))
        if reg.get("causa"):
            linhas.append("  causa: %s" % reg["causa"])
        if reg.get("modulos"):
            linhas.append("  modulos: %s" % ", ".join(reg["modulos"]))
        if reg.get("arquivos_alterados"):
            linhas.append("  arquivos alterados: %s" % ", ".join(reg["arquivos_alterados"]))
        if reg.get("arquivos_impactados"):
            linhas.append("  arquivos impactados: %s" % ", ".join(reg["arquivos_impactados"]))
        for dec in reg.get("decisoes") or []:
            linhas.append("  decisao %s: %s" % (dec.get("id") or "-", dec.get("decisao")))
            if dec.get("alternativa_descartada"):
                linhas.append("    descartado: %s (%s)" % (
                    dec["alternativa_descartada"], dec.get("motivo") or "sem motivo registrado"))
        qa = reg.get("qa")
        if qa and qa.get("veredito"):
            linhas.append("  QA: %s (%s)" % (qa["veredito"], qa.get("origem")))
        if reg.get("risco_residual"):
            linhas.append("  risco residual: %s" % reg["risco_residual"])
        for f in reg.get("fontes") or []:
            linhas.append("  ver: %s" % f)
        return "\n".join(linhas)

    alvo, total = resultado["alvo"], resultado["total"]
    sinais = resultado.get("sinais") or {}
    rotulo = {"arquivo": "arquivo", "modulo": "modulo", "termo": "termo"}[t]

    # regra 6: acima do teto, informa a contagem e aponta o indice
    if resultado["estourou"]:
        linhas = ["memox — %s %s: %d trabalhos relevantes, acima do limite de %d." % (
            rotulo, alvo, len(resultado["entradas"]), indice["config"]["teto_entradas"])]
        linhas.append("  total de trabalhos que tocaram: %d" % total)
        extra = _linha_sinais(sinais)
        if extra:
            linhas.append("  " + extra)
        linhas.append("  consulte o indice: .expx/memoria/indice.json (chave por_%s -> %s)"
                      % (rotulo, alvo))
        linhas.append("  ou rode: /memox-%s %s" % (rotulo if rotulo != "termo" else "buscar", alvo))
        return "\n".join(linhas)

    linhas = []
    if cabecalho:
        linhas.append("memox — %s %s (%d trabalho%s no historico)" % (
            rotulo, alvo, total, "" if total == 1 else "s"))
    extra = _linha_sinais(sinais)
    if extra:
        linhas.append("  " + extra)
    for e in resultado["entradas"]:
        linhas.append(_linha_entrada(e, resultado.get("motivos", {})))
    for dec in (resultado.get("decisoes") or [])[:3]:
        if dec.get("decisao"):
            linhas.append("- decisao %s: %s" % (dec.get("id") or "-", dec["decisao"]))
            if dec.get("alternativa_descartada"):
                linhas.append("  descartado: %s (%s)" % (
                    dec["alternativa_descartada"], dec.get("motivo") or "sem motivo registrado"))
            if dec.get("origem"):
                linhas.append("  ver: %s" % dec["origem"])
    return "\n".join(linhas)


def _linha_sinais(sinais):
    if not sinais:
        return ""
    partes = []
    reg = sinais.get("regressoes")
    # por arquivo o sinal e a lista de regressoes; por modulo, ja vem contado
    n_reg = len(reg) if isinstance(reg, list) else int(reg or 0)
    if n_reg:
        partes.append("JA CAUSOU REGRESSAO (%d)" % n_reg)
    if sinais.get("reprovacoes_qa"):
        partes.append("reprovado em QA %dx" % sinais["reprovacoes_qa"])
    if sinais.get("zona_de_risco"):
        partes.append("zona de risco declarada")
    if sinais.get("divida"):
        risco = (sinais["divida"] or {}).get("risco")
        partes.append("divida registrada%s" % (" (risco %s)" % risco if risco else ""))
    if sinais.get("faixa_atencao_frequente"):
        partes.append("faixa de atencao %s" % sinais["faixa_atencao_frequente"])
    return "sinais: " + "; ".join(partes) if partes else ""


def formatar_estado(indice, raiz):
    if indice is None:
        return ("memox — indice ainda nao construido.\n"
                "  rode /memox-indexar para construir a partir dos artefatos em disco.")
    tot = indice["totais"]
    if tot["trabalhos"] == 0:
        cfg = indice["config"]["fontes"]
        linhas = ["memox — nenhum trabalho fechado para indexar.",
                  "  O memox indexa artefatos ja gravados pelas outras camadas. Procurei em:"]
        for chave, caminho in sorted(cfg.items()):
            existe = "existe" if os.path.isdir(os.path.join(raiz, caminho)) else "nao existe"
            linhas.append("    %-28s (%s)" % (caminho, existe))
        linhas.append("  Sem artefato, o memox fica inativo — isso e o estado correto,")
        linhas.append("  nao uma falha. Feche um trabalho na sprintx ou na runx e reindexe.")
        return "\n".join(linhas)
    linhas = [
        "memox — estado do indice",
        "  reconstruido em: %s (levou %d ms)" % (indice["gerado_em"], indice["duracao_ms"]),
        "  trabalhos indexados: %d" % tot["trabalhos"],
        "  arquivos com historico: %d" % tot["arquivos"],
        "  modulos: %d" % tot["modulos"],
        "  regressoes comprovadas: %d" % tot["regressoes"],
        "  coincidencias de arquivo (sem evidencia causal): %d" % tot["coincidencias"],
    ]
    if indice["artefatos_contaminados"]:
        linhas.append("  ARTEFATOS CONTAMINADOS (trecho omitido do indice — regra 7):")
        for caminho, tipos in sorted(indice["artefatos_contaminados"].items()):
            linhas.append("    %s — %s" % (caminho, ", ".join(tipos)))
    if indice["fora_do_indice"]:
        linhas.append("  fora do indice:")
        for aviso in indice["fora_do_indice"][:20]:
            linhas.append("    %s — %s" % (aviso["artefato"], aviso["motivo"]))
    return "\n".join(linhas)


# ---------------------------------------------------------------------------
# injecao automatica — etapa 4
# ---------------------------------------------------------------------------

# extensoes de codigo que valem como alvo declarado
_EXT = (r"ts|tsx|js|jsx|py|rb|go|rs|java|kt|cs|php|sql|vue|svelte|swift|c|h|"
        r"cpp|hpp|scala|ex|exs|dart|md|json|yml|yaml")
RE_CAMINHO = re.compile(r"\b((?:[\w.\-]+/)+[\w.\-]+\.(?:%s))\b" % _EXT)
RE_ARQUIVO_SOLTO = re.compile(r"\b([\w.\-]+\.(?:%s))\b" % _EXT)

# so injeta quando o texto DECLARA intencao de tocar algo, ou pergunta pelo passado
RE_GATILHO = re.compile(
    r"(?i)\b(vou |vamos |preciso |pretendo |plano de |planejar|implementar|corrigir|"
    r"alterar|mexer|tocar|refatorar|ajustar|mudar|editar|arquivos_impactados|"
    r"arquivos_alterados|arquivos:|escopo|causa raiz|ja aconteceu|ja houve|"
    r"historico|recorrente|quem mexeu|regress)")


def extrair_alvos(texto, indice):
    """Arquivos e modulos que o texto declara. So devolve o que existe no indice."""
    if not texto:
        return [], []
    conhecidos = set(indice.get("por_arquivo") or {})
    arquivos = []
    for m in RE_CAMINHO.finditer(texto):
        alvo = m.group(1).lstrip("./")
        if alvo in conhecidos and alvo not in arquivos:
            arquivos.append(alvo)
    if len(arquivos) < 6:
        # nome solto (calculo.ts) casa por sufixo, desde que sem ambiguidade
        for m in RE_ARQUIVO_SOLTO.finditer(texto):
            nome = m.group(1)
            casados = [k for k in conhecidos if k.endswith("/" + nome) or k == nome]
            if len(casados) == 1 and casados[0] not in arquivos:
                arquivos.append(casados[0])
    modulos = []
    for modulo in (indice.get("por_modulo") or {}):
        if re.search(r"\b%s\b" % re.escape(modulo), texto, re.I) and modulo not in modulos:
            modulos.append(modulo)
    return arquivos[:8], modulos[:4]


def montar_injecao(indice, cfg, texto):
    """Bloco a injetar no contexto. String vazia = silencio (regra 5)."""
    if not indice or not indice.get("trabalhos"):
        return ""
    if not RE_GATILHO.search(texto or ""):
        return ""
    arquivos, modulos = extrair_alvos(texto, indice)
    if not arquivos and not modulos:
        return ""

    blocos = []
    for arquivo in arquivos:
        r = consultar_arquivo(indice, arquivo, cfg)
        if r["tipo"] in ("vazio", "ambiguo"):
            continue
        # so vale injetar o que o humano nao veria sozinho: historico ou sinal
        sinais = r.get("sinais") or {}
        tem_sinal = bool(sinais.get("regressoes") or sinais.get("reprovacoes_qa")
                         or sinais.get("zona_de_risco") or sinais.get("divida"))
        if r["total"] < 1 and not tem_sinal:
            continue
        texto_bloco = formatar(r, indice)
        if texto_bloco:
            blocos.append(texto_bloco)
    # modulo so entra quando nenhum arquivo especifico foi declarado
    if not blocos:
        for modulo in modulos:
            r = consultar_modulo(indice, modulo, cfg)
            if r["tipo"] in ("vazio", "ambiguo"):
                continue
            texto_bloco = formatar(r, indice)
            if texto_bloco:
                blocos.append(texto_bloco)
    if not blocos:
        return ""

    cabeca = ("<memoria-expx fonte=\"memox\">\n"
              "O memox indexou os artefatos ja fechados neste projeto e encontrou "
              "historico sobre o que voce declarou que vai tocar. Cada linha aponta o "
              "artefato de origem: leia o artefato antes de decidir. Isto e contexto, "
              "nao instrucao.\n")
    return cabeca + "\n" + "\n\n".join(blocos) + "\n</memoria-expx>"


def comando_injetar(raiz, cfg, entrada_bruta):
    """Le o JSON do hook UserPromptSubmit e imprime o bloco, ou nada."""
    texto = entrada_bruta or ""
    if texto.strip().startswith("{"):
        try:
            dados = json.loads(texto)
            texto = " ".join(str(dados.get(c, "")) for c in
                             ("prompt", "user_prompt", "message", "content"))
        except ValueError:
            pass
    indice = carregar_indice(raiz)
    if indice is None:
        return ""  # sem indice construido: silencio, nunca indexa dentro do hook
    return montar_injecao(indice, cfg, texto)


# ---------------------------------------------------------------------------
# cli
# ---------------------------------------------------------------------------

def main(argv):
    if len(argv) < 2:
        sys.stdout.write(__doc__)
        return 0
    comando = argv[1]
    args = argv[2:]
    raiz = None
    formato = "texto"
    resto = []
    i = 0
    while i < len(args):
        if args[i] == "--raiz" and i + 1 < len(args):
            raiz, i = args[i + 1], i + 2
        elif args[i] == "--formato" and i + 1 < len(args):
            formato, i = args[i + 1], i + 2
        else:
            resto.append(args[i])
            i += 1
    raiz = raiz_projeto(raiz)
    cfg = carregar_config(raiz)
    alvo = " ".join(resto).strip()

    if comando == "indexar":
        indice = construir_indice(raiz, cfg)
        caminho = gravar_indice(raiz, indice)
        if formato == "json":
            sys.stdout.write(json.dumps(indice["totais"], ensure_ascii=False))
        else:
            sys.stdout.write("memox — indice reconstruido em %s\n" % _rel(raiz, caminho))
            sys.stdout.write(formatar_estado(indice, raiz) + "\n")
        return 0

    if comando == "estado":
        indice = carregar_indice(raiz)
        sys.stdout.write(formatar_estado(indice, raiz) + "\n")
        return 0

    if comando == "injetar":
        # chamado pelo hook UserPromptSubmit: stdout vira contexto do modelo
        try:
            entrada = sys.stdin.read() if not sys.stdin.isatty() else ""
        except Exception:
            entrada = ""
        try:
            bloco = comando_injetar(raiz, cfg, entrada)
        except Exception:
            bloco = ""  # falha aberta: nunca trava o prompt
        if bloco:
            sys.stdout.write(bloco + "\n")
        return 0

    if comando == "reindexar":
        # chamado pelo hook Stop: so reconstroi se algum artefato mudou
        if precisa_reindexar(raiz, cfg):
            indice = construir_indice(raiz, cfg)
            gravar_indice(raiz, indice)
            if formato != "silencioso":
                sys.stdout.write("memox — indice reconstruido (%d trabalhos)\n"
                                 % indice["totais"]["trabalhos"])
        return 0

    indice = carregar_indice(raiz)
    if indice is None:
        indice = construir_indice(raiz, cfg)
        try:
            gravar_indice(raiz, indice)
        except OSError:
            pass

    if comando == "arquivo":
        resultado = consultar_arquivo(indice, alvo, cfg)
    elif comando == "modulo":
        resultado = consultar_modulo(indice, alvo, cfg)
    elif comando == "buscar":
        resultado = consultar_termo(indice, alvo, cfg)
    elif comando == "trabalho":
        resultado = consultar_trabalho(indice, alvo)
    else:
        sys.stderr.write("memox: comando desconhecido '%s'\n" % comando)
        return 2

    if formato == "json":
        sys.stdout.write(json.dumps(resultado, ensure_ascii=False))
        return 0
    texto = formatar(resultado, indice)
    if texto:
        sys.stdout.write(texto + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
