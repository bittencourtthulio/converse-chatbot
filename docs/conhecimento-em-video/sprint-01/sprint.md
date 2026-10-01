---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-01
atualizado_em: 2026-09-30
titulo: "Capacidade de testar: dados, ambiente, simulados e ffmpeg"
status: concluido
criterio_saida: "A suite inteira esta verde com a migration nova, as variaveis de ambiente lidas, os simulados de OpenRouter com audio e de YouTube testados e o apoio de ffmpeg no CI."
fases: ["F-01.1", "F-01.2"]
riscos: ["migration tem de so acrescentar (tests/migracoes.test.ts)", "o simulado do OpenRouter nao pode quebrar os testes existentes (base/upload-testes-e-ci.md)", "o formato real do YouTube e NAO DOCUMENTADO e a fixture o imita por suposicao (base/youtube-legendas.md)"]
---

# Sprint 01 — Capacidade de testar: dados, ambiente, simulados e ffmpeg

## Objetivo

A suite inteira esta verde com a migration nova, as variaveis de ambiente lidas, os simulados de OpenRouter com audio e de YouTube testados e o apoio de ffmpeg no CI.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Dados e ambiente | nenhuma |
| F-01.2 | Simulados e apoio de teste | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite inteira esta verde com a migration nova, as variaveis de ambiente lidas, os simulados de OpenRouter com audio e de YouTube testados e o apoio de ffmpeg no CI.

## Riscos conhecidos

- migration tem de so acrescentar (tests/migracoes.test.ts)
- o simulado do OpenRouter nao pode quebrar os testes existentes (base/upload-testes-e-ci.md)
- o formato real do YouTube e NAO DOCUMENTADO e a fixture o imita por suposicao (base/youtube-legendas.md)
