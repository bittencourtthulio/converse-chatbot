---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-02
atualizado_em: 2026-10-01
titulo: "Vídeo com trecho sem fala"
status: concluido
criterio_saida: "um trecho sem fala vira [sem fala] e a fonte de vídeo só falha sem nenhuma fala, provado de ponta a ponta com ffmpeg real"
fases: ["F-02.1", "F-02.2"]
riscos: ["o modelo real pode devolver texto para o silêncio, o que passa como fala (PR-105)", "o ffmpeg precisa existir na máquina de teste"]
---

# Sprint 02 — Vídeo com trecho sem fala

## Objetivo

Um trecho sem fala vira [sem fala] e a fonte de vídeo só falha sem nenhuma fala, provado de ponta a ponta com ffmpeg real.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Núcleo da transcrição sem fala | nenhuma |
| F-02.2 | Fila e vídeo mudo ponta a ponta | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Um trecho sem fala vira [sem fala] e a fonte de vídeo só falha sem nenhuma fala, provado de ponta a ponta com ffmpeg real.

## Riscos conhecidos

- o modelo real pode devolver texto para o silêncio, o que passa como fala (PR-105)
- o ffmpeg precisa existir na máquina de teste
