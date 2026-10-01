---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-07
atualizado_em: 2026-10-01
titulo: "Conteiner, desligamento limpo e primeiro administrador"
status: em_andamento
criterio_saida: "A imagem constroi, o conteiner sobe com volume, responde /api/saude, tem ffmpeg, persiste dados apos down e up, faz backup e restauracao por dentro e desliga limpo no SIGTERM"
fases: ["F-07.1", "F-07.2"]
riscos: ["o build da imagem depende da rede e do Docker da maquina", "better-sqlite3 e nativo: a imagem precisa instalar na mesma arquitetura em que roda", "o Next trata SIGTERM sozinho se NEXT_MANUAL_SIG_HANDLE nao estiver definido"]
---

# Sprint 07 — Conteiner, desligamento limpo e primeiro administrador

## Objetivo

Entrega o desligamento limpo, o comando do primeiro administrador, o Dockerfile, o compose, o dockerignore, o job de CI e a verificacao real do conteiner.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-07.1 | Desligamento limpo e administrador inicial | nenhuma |
| F-07.2 | Imagem, compose e CI | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A imagem constroi, o conteiner sobe com volume, responde /api/saude, tem ffmpeg, persiste dados apos down e up, faz backup e restauracao por dentro e desliga limpo no SIGTERM.

## Riscos conhecidos

- o build da imagem depende da rede e do Docker da maquina
- better-sqlite3 e nativo: a imagem precisa instalar na mesma arquitetura em que roda
- o Next trata SIGTERM sozinho se NEXT_MANUAL_SIG_HANDLE nao estiver definido
