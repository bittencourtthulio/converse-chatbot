---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-03
titulo: "Validacao e extracao"
status: nao_iniciado
criterio_saida: "tests/extracao*.test.ts passam, a suite esta verde e src/lib/extracao/ nao importa next/* nem src/servicos."
fases: ["F-03.1", "F-03.2", "F-03.3"]
riscos: ["excecoes das bibliotecas nao documentadas (base/00-LACUNAS.md, lacunas 1 e 2)", "zip bomb com cabecalho mentiroso (base/extracao-bibliotecas.md)"]
atualizado_em: 2026-09-30
---

# Sprint 03 — Validacao e extracao

## Objetivo

Conferir o conteudo real dos arquivos e extrair texto dos nove formatos por adaptadores em src/lib/extracao/.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Regras de arquivo | nenhuma |
| F-03.2 | Adaptadores | nenhuma |
| F-03.3 | Fachada | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/extracao*.test.ts passam, a suite esta verde e src/lib/extracao/ nao importa next/* nem src/servicos.

## Riscos conhecidos

- excecoes das bibliotecas nao documentadas (base/00-LACUNAS.md, lacunas 1 e 2)
- zip bomb com cabecalho mentiroso (base/extracao-bibliotecas.md)
