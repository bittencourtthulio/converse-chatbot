#!/usr/bin/env python3
"""aderencia · PostToolUse em ferramentas de escrita

A Etapa 4 rodando continuamente, em vez de só na auditoria. Verifica o arquivo
recém-escrito contra docs/stack/CONVENCOES.md.

Duas regras que não podem ser esquecidas:

1. Ponto marcado PROPOSTA no CONVENCOES.md NUNCA gera violação. No máximo um
   aviso, e o rastro registra separadamente. Convenção sem evidência no código
   não governa — se governasse, o stackx viraria máquina de impor padrão
   inventado.

2. Não roda em arquivo antigo dentro de área tocada quando docs/legado/PERFIL.md
   existir. Ali manda o padrão local. Sem isso, os hooks das duas skills brigam e
   a IA moderniza legado achando que obedece convenção.

Nasce em modo aviso e provavelmente fica nele por bastante tempo: a heurística de
"local esperado do arquivo de teste" erra com facilidade em repositório real.

Princípio de leitura: só verifica o que consegue extrair do CONVENCOES.md de
forma literal. Ponto que não dá para ler com certeza é ponto sobre o qual este
hook cala. Falso positivo mata a adoção de todos os hooks juntos.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _rastro import _raiz, modo, registrar  # noqa: E402

FERRAMENTAS = {"Write", "Edit", "MultiEdit", "NotebookEdit", "write", "edit", "patch"}

MARCA_PROPOSTA = "**PROPOSTA**"
MARCA_CONFLITO = "**CONFLITO EM ABERTO**"

SUFIXOS_TESTE = (
    ".test.", ".spec.", "_test.", "_spec.", "Test.", "Spec.",
)

# Artefato de build nao e codigo-fonte: verificar isso e falso positivo garantido.
# Medido em repositorio real: sem esta exclusao, 574 de 795 avisos eram .map, .js
# compilado e .d.ts gerados a partir de fontes que ja estavam corretas.
PASTAS_GERADAS = {
    "node_modules", "dist", "build", "out", "coverage", "vendor", "target",
    ".next", ".nuxt", ".svelte-kit", "__pycache__", ".venv", "venv",
}
SUFIXOS_GERADOS = (".map", ".d.ts", ".min.js", ".min.css")


def e_gerado(rel):
    """Arquivo e artefato de build?"""
    partes = Path(rel).parts
    if any(p in PASTAS_GERADAS for p in partes):
        return True
    nome = Path(rel).name
    return any(nome.endswith(s) for s in SUFIXOS_GERADOS)


def secoes(texto):
    """Divide o CONVENCOES.md em seções de título '## n. Nome'."""
    partes = re.split(r"^##\s+", texto, flags=re.M)
    saida = {}
    for parte in partes[1:]:
        titulo, _, corpo = parte.partition("\n")
        saida[titulo.strip().lower()] = corpo
    return saida


def secao_testes(mapa):
    """A seção de testes do CONVENCOES.md.

    Casamento por substring nao serve: "4. Banco de dados em teste" tambem
    contem "teste". Prefere-se o titulo cujo nome, sem a numeracao, e
    exatamente "testes" — e so entao um casamento mais frouxo.
    """
    for titulo, corpo in mapa.items():
        nu = re.sub(r"^\d+\.\s*", "", titulo).strip()
        if nu in ("testes", "teste"):
            return corpo
    for titulo, corpo in mapa.items():
        nu = re.sub(r"^\d+\.\s*", "", titulo).strip()
        if nu.startswith("teste") and "banco" not in nu:
            return corpo
    return ""


def governa(corpo):
    """A seção governa? PROPOSTA e CONFLITO EM ABERTO não governam (regra 3)."""
    if not corpo.strip():
        return False, "secao ausente"
    if MARCA_PROPOSTA in corpo:
        return False, "PROPOSTA"
    if MARCA_CONFLITO in corpo:
        return False, "CONFLITO EM ABERTO"
    if "Evidência:" not in corpo and "Evidencia:" not in corpo:
        return False, "sem evidencia"
    return True, ""


def e_teste(caminho):
    return any(s in Path(caminho).name for s in SUFIXOS_TESTE) or \
        Path(caminho).name.startswith("test_")


def arquivo_novo(raiz, rel):
    """Arquivo é novo (não rastreado) ou já existia no versionador?"""
    try:
        r = subprocess.run(
            ["git", "ls-files", "--error-unmatch", rel],
            cwd=raiz, capture_output=True, timeout=3,
        )
        return r.returncode != 0
    except Exception:
        return False  # na dúvida, trata como existente: mais conservador


def area_tocada_do_legado(raiz, rel):
    """Arquivo está em área tocada descrita no PERFIL.md do legadox?"""
    perfil = raiz / "docs" / "legado" / "PERFIL.md"
    if not perfil.exists():
        return False
    try:
        texto = perfil.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return False
    # caminhos citados no PERFIL.md, em crase ou soltos
    for bruto in re.findall(r"`([^`\n]+)`", texto):
        alvo = bruto.strip().rstrip("/*").lstrip("./")
        if not alvo or "/" not in alvo and "." not in alvo:
            continue
        if rel == alvo or rel.startswith(alvo.rstrip("/") + "/"):
            return True
    return False


def nome_de_teste_esperado(corpo_testes):
    """Padrão de nome de arquivo de teste declarado, se legível literalmente."""
    for linha in corpo_testes.splitlines():
        if "nome do arquivo" in linha.lower():
            achados = re.findall(r"`([^`]*\*[^`]*)`|\b(\*\.[\w.]+|\w*_test\.\w+|test_\*\.\w+)", linha)
            planos = [a or b for a, b in achados]
            if planos:
                return planos[0]
    return None


def casa_padrao(nome, padrao):
    """O nome do arquivo casa com o padrão declarado? Só formas inequívocas.

    Devolve None sempre que a comparacao nao for segura — e o chamador cala.
    """
    p = padrao.strip()
    # Extensao final diferente: `*.test.ts` nao condena `Componente.test.tsx`.
    # Uma convencao escrita para uma extensao nao governa outra; isso e lacuna,
    # nao violacao. Compara-se so a ULTIMA extensao (a linguagem) — a cadeia
    # inteira incluiria `.spec` vs `.test`, que e exatamente o que se quer pegar.
    ext_padrao = Path(p.replace("*", "x")).suffix
    ext_nome = Path(nome).suffix
    if ext_padrao and ext_nome and ext_padrao != ext_nome:
        return None
    if p.startswith("*") and p.count("*") == 1:
        return nome.endswith(p[1:])
    if p.endswith("*") and p.count("*") == 1:
        return nome.startswith(p[:-1])
    if p.count("*") == 1:
        pre, _, pos = p.partition("*")
        return nome.startswith(pre) and nome.endswith(pos)
    return None  # padrão que não sei ler com certeza: calo


def main():
    try:
        evento = json.load(sys.stdin)
    except Exception:
        return 0

    ferramenta = evento.get("tool_name") or evento.get("tool") or ""
    if ferramenta not in FERRAMENTAS:
        return 0

    entrada = evento.get("tool_input") or {}
    bruto = entrada.get("file_path") or entrada.get("path") or entrada.get("filePath")
    if not bruto:
        return 0

    raiz = _raiz()
    m = modo(raiz, "aderencia")
    if m == "desligado":
        return 0

    try:
        rel = str(Path(bruto).resolve().relative_to(raiz))
    except Exception:
        return 0

    if e_gerado(rel):
        return 0  # artefato de build: nao e codigo-fonte, nao se verifica

    convencoes = raiz / "docs" / "stack" / "CONVENCOES.md"
    if not convencoes.exists():
        return 0  # sem CONVENCOES.md o hook fica inativo, não chuta

    # --- Exclusão obrigatória: legado manda na área tocada ---
    if (raiz / "docs" / "legado" / "PERFIL.md").exists():
        if not arquivo_novo(raiz, rel) or area_tocada_do_legado(raiz, rel):
            registrar(
                evento="arquivo_alterado", resultado="ok",
                detalhe="fora do alcance: precedencia do PERFIL.md (legadox)",
                arquivos=[rel], raiz=raiz,
            )
            return 0

    try:
        texto = convencoes.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return 0
    mapa = secoes(texto)

    violacoes = []   # governam: viram aviso ao modelo
    propostas = []   # não governam: só rastro

    # --- 1. Nome do arquivo de teste ---
    corpo_testes = secao_testes(mapa)
    if e_teste(rel):
        vale, motivo = governa(corpo_testes)
        padrao = nome_de_teste_esperado(corpo_testes)
        if padrao:
            resultado = casa_padrao(Path(rel).name, padrao)
            if resultado is False:
                alvo = violacoes if vale else propostas
                alvo.append((
                    "nome de arquivo de teste",
                    f"`{Path(rel).name}` nao casa com o padrao `{padrao}` (CONVENCOES.md §Testes)"
                    + ("" if vale else f" — ponto marcado {motivo}, nao governa"),
                ))

    # --- 2. Segredo aparente (vale sempre, independe de convenção) ---
    try:
        conteudo = (raiz / rel).read_text(encoding="utf-8", errors="replace")
        for n, linha in enumerate(conteudo.splitlines()[:400], 1):
            if re.search(r"(SECRET|PASSWORD|API_KEY|TOKEN|PRIVATE_KEY)\s*[:=]\s*['\"][^'\"]{8,}", linha):
                if "process.env" in linha or "os.environ" in linha or "getenv" in linha:
                    continue
                violacoes.append((
                    "segredo aparente",
                    f"{rel}:{n} parece conter credencial literal. Leia de configuracao, nunca do codigo.",
                ))
                break
    except Exception:
        pass

    for nome, detalhe in propostas:
        registrar(
            evento="regra_violada", resultado="proposta",
            detalhe=f"{nome}: {detalhe}", arquivos=[rel], raiz=raiz,
        )

    if not violacoes:
        registrar(evento="arquivo_alterado", resultado="ok",
                  detalhe="aderente ao que foi verificavel", arquivos=[rel], raiz=raiz)
        return 0

    for nome, detalhe in violacoes:
        registrar(
            evento="acao_bloqueada" if m == "bloqueio" else "regra_violada",
            resultado="bloqueio" if m == "bloqueio" else "aviso",
            detalhe=f"{nome}: {detalhe}", arquivos=[rel], raiz=raiz,
        )

    corpo = "\n".join(f"- {n}: {d}" for n, d in violacoes)
    print(f"stackx/aderencia — {rel}\n{corpo}\nConsulte docs/stack/CONVENCOES.md.",
          file=sys.stderr)

    # PostToolUse roda DEPOIS do sucesso: exit 2 nao desfaz a escrita, serve para
    # o modelo ver o aviso e corrigir. Nos dois modos o codigo e o mesmo; o que
    # muda e o registro no rastro (regra_violada x acao_bloqueada), que e o que o
    # painel usa para decidir a promocao.
    return 2


if __name__ == "__main__":
    sys.exit(main())
