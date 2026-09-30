#!/usr/bin/env python3
"""sem-convencoes · SessionStart

Se docs/stack/CONVENCOES.md não existe e o projeto tem código, injeta UMA linha
no contexto sugerindo a detecção. Não bloqueia nada, nunca.

SessionStart põe o stdout de texto simples direto no contexto do modelo — é o
lugar barato de dar esse empurrão. Uma linha, sem sermão.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _rastro import _raiz, modo, registrar  # noqa: E402

# Extensões que contam como "o projeto tem código".
CODIGO = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".rb", ".go", ".rs",
    ".java", ".kt", ".cs", ".php", ".ex", ".exs", ".swift", ".dart", ".scala",
}
IGNORAR = {
    "node_modules", ".git", "dist", "build", "vendor", "target", ".venv",
    "venv", "__pycache__", ".next", ".nuxt", "coverage", ".claude", ".opencode",
}
MINIMO = 5


def tem_codigo(raiz):
    """Conta arquivos de código, parando cedo. Rápido é requisito (regra 1)."""
    achados = 0
    pilha = [raiz]
    visitados = 0
    while pilha and visitados < 400:
        pasta = pilha.pop()
        visitados += 1
        try:
            for item in pasta.iterdir():
                if item.name.startswith(".") and item.name not in (".",):
                    if item.name in IGNORAR or item.is_dir():
                        continue
                if item.is_dir():
                    if item.name not in IGNORAR:
                        pilha.append(item)
                elif item.suffix in CODIGO:
                    achados += 1
                    if achados >= MINIMO:
                        return True
        except (PermissionError, OSError):
            continue
    return achados >= MINIMO


def main():
    try:
        sys.stdin.read()  # o evento chega em JSON; este hook não precisa dele
    except Exception:
        pass

    raiz = _raiz()
    if modo(raiz, "sem-convencoes") == "desligado":
        return 0

    if (raiz / "docs" / "stack" / "CONVENCOES.md").exists():
        return 0
    if not tem_codigo(raiz):
        return 0

    print(
        "As convenções técnicas deste repositório não foram detectadas "
        "(docs/stack/CONVENCOES.md não existe). Rode /stackx-detectar para "
        "gerá-las a partir de evidência real do código."
    )
    registrar(
        evento="regra_violada",
        resultado="aviso",
        detalhe="CONVENCOES.md ausente em projeto com código",
        arquivos=["docs/stack/CONVENCOES.md"],
        raiz=raiz,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
