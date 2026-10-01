---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-05
atualizado_em: 2026-10-01
titulo: "Direitos do titular: admin e visitante"
status: concluido
criterio_saida: "a suite inteira passa com 0 failed e o admin busca, exporta e apaga os dados de um titular e o visitante apaga so a propria conversa"
fases: ["F-05.1", "F-05.2"]
riscos: ["o identificador completo do visitante nao pode aparecer na tela, na URL nem no nome do arquivo (PR-78, PR-90): a busca por prefixo resolve a um titular unico", "DELETE publico sem sessao precisa de Origin da plataforma e limite de uso (PR-90)"]
---

# Sprint 05 — Direitos do titular: admin e visitante

## Objetivo

Entrega o servico do titular (busca, exportacao e exclusao), a rota de exportacao do admin e o apagar da propria conversa pelo visitante com a API publica e o botao no chat.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Titular pelo admin | nenhuma |
| F-05.2 | Visitante apaga a propria conversa | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

a suite inteira passa com 0 failed e o admin busca, exporta e apaga os dados de um titular e o visitante apaga so a propria conversa.

## Riscos conhecidos

- o identificador completo do visitante nao pode aparecer na tela, na URL nem no nome do arquivo (PR-78, PR-90): a busca por prefixo resolve a um titular unico
- DELETE publico sem sessao precisa de Origin da plataforma e limite de uso (PR-90)
