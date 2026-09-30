---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-05
titulo: "Handlers HTTP e ponta a ponta"
status: concluido
criterio_saida: "tests/fontes-rota*.test.ts passam com next start, npm run build termina com 0 e a suite esta verde."
fases: ["F-05.1", "F-05.2"]
riscos: ["unpdf ou mammoth quebrarem no bundler do Next 16 (base/00-LACUNAS.md, lacuna 3): serverExternalPackages", "corpo grande carregado em memoria por formData() (lacuna 4)"]
atualizado_em: 2026-09-30
---

# Sprint 05 — Handlers HTTP e ponta a ponta

## Objetivo

Cinco rotas finas sobre o servico e a prova pelo servidor de producao com upload multipart real dos nove formatos.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Rotas | nenhuma |
| F-05.2 | Ponta a ponta | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/fontes-rota*.test.ts passam com next start, npm run build termina com 0 e a suite esta verde.

## Riscos conhecidos

- unpdf ou mammoth quebrarem no bundler do Next 16 (base/00-LACUNAS.md, lacuna 3): serverExternalPackages
- corpo grande carregado em memoria por formData() (lacuna 4)
