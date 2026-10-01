---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-01
atualizado_em: 2026-10-01
titulo: "Capacidade de testar: rede bloqueada e apoios"
status: concluido
criterio_saida: "a trava de rede protege toda a suíte, o teste do embed é estável e os apoios de áudio com trecho mudo, PDF grande e corpo chunked existem e são testados"
fases: ["F-01.1", "F-01.2"]
riscos: ["a trava de rede pode revelar teste que toca a rede real sem querer", "o laço de 30 execuções do embed depende do servidor de produção construído (npm run build)"]
---

# Sprint 01 — Capacidade de testar: rede bloqueada e apoios

## Objetivo

A trava de rede protege toda a suíte, o teste do embed é estável e os apoios de áudio com trecho mudo, PDF grande e corpo chunked existem e são testados.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Rede bloqueada e teste estável | nenhuma |
| F-01.2 | Apoios de mídia e de upload | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A trava de rede protege toda a suíte, o teste do embed é estável e os apoios de áudio com trecho mudo, PDF grande e corpo chunked existem e são testados.

## Riscos conhecidos

- a trava de rede pode revelar teste que toca a rede real sem querer
- o laço de 30 execuções do embed depende do servidor de produção construído (npm run build)
