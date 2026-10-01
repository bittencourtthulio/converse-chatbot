---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-03
atualizado_em: 2026-10-01
titulo: "Upload com teto em stream e extração isolada"
status: pendente
criterio_saida: "o corpo de upload é limitado em stream com 413 para chunked e a extração de PDF, DOCX e HTML roda num processo encerrável, ou o motivo da inviabilidade está registrado"
fases: ["F-03.1", "F-03.2"]
riscos: ["o processo filho com tsx pode não funcionar sob o build do Next ou no contêiner (PEND-27)", "o teto de 10 arquivos mantém o pior caso de memória em 251 MB no padrão (PR-106)"]
---

# Sprint 03 — Upload com teto em stream e extração isolada

## Objetivo

O corpo de upload é limitado em stream com 413 para chunked e a extração de PDF, DOCX e HTML roda num processo encerrável, ou o motivo da inviabilidade está registrado.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Teto do corpo em stream | nenhuma |
| F-03.2 | Extração isolada e limite de páginas | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

O corpo de upload é limitado em stream com 413 para chunked e a extração de PDF, DOCX e HTML roda num processo encerrável, ou o motivo da inviabilidade está registrado.

## Riscos conhecidos

- o processo filho com tsx pode não funcionar sob o build do Next ou no contêiner (PEND-27)
- o teto de 10 arquivos mantém o pior caso de memória em 251 MB no padrão (PR-106)
