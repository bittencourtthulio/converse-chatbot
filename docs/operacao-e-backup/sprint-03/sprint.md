---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-03
atualizado_em: 2026-10-01
titulo: "Ambiente validado no start e saude"
status: concluido
criterio_saida: "O start de producao sem as variaveis obrigatorias falha com os nomes, GET /api/saude responde 200 ou 503 sem detalhe e obterSistema devolve o detalhe so ao admin"
fases: ["F-03.1", "F-03.2"]
riscos: ["o Next pode engolir o erro de register() em next start (lacuna da base): provado por teste que sobe o servidor", "a sonda de ffmpeg dispara processos: o cache de 60 segundos e provado por teste"]
---

# Sprint 03 — Ambiente validado no start e saude

## Objetivo

Valida a configuracao no start (L20), entrega o endpoint de saude minimo e o servico que alimenta a tela Sistema.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Ambiente validado no start | nenhuma |
| F-03.2 | Saude e dados do sistema | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

O start de producao sem as variaveis obrigatorias falha com os nomes, GET /api/saude responde 200 ou 503 sem detalhe e obterSistema devolve o detalhe so ao admin.

## Riscos conhecidos

- o Next pode engolir o erro de register() em next start (lacuna da base): provado por teste que sobe o servidor
- a sonda de ffmpeg dispara processos: o cache de 60 segundos e provado por teste
