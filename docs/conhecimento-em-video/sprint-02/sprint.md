---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-02
atualizado_em: 2026-09-30
titulo: "Pipeline de audio e transcricao pelo OpenRouter"
status: concluido
criterio_saida: "A suite inteira esta verde com midia.ts sondando, extraindo e dividindo audio, as assinaturas de midia conferidas e transcreverAudio testado contra o simulado."
fases: ["F-02.1", "F-02.2"]
riscos: ["ffmpeg ausente no ambiente de quem roda o teste (os testes usam skipIf, o CI exige) (base/midia-ffmpeg.md)", "prazo da transcricao maior que o da conversa (base/openrouter-audio.md)"]
---

# Sprint 02 — Pipeline de audio e transcricao pelo OpenRouter

## Objetivo

A suite inteira esta verde com midia.ts sondando, extraindo e dividindo audio, as assinaturas de midia conferidas e transcreverAudio testado contra o simulado.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Midia com ffmpeg | nenhuma |
| F-02.2 | Formatos e transcricao | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suite inteira esta verde com midia.ts sondando, extraindo e dividindo audio, as assinaturas de midia conferidas e transcreverAudio testado contra o simulado.

## Riscos conhecidos

- ffmpeg ausente no ambiente de quem roda o teste (os testes usam skipIf, o CI exige) (base/midia-ffmpeg.md)
- prazo da transcricao maior que o da conversa (base/openrouter-audio.md)
