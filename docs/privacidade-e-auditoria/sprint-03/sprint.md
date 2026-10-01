---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-03
atualizado_em: 2026-10-01
titulo: "Exclusao de usuario, retencao e aviso padrao"
status: nao_iniciado
criterio_saida: "a suite inteira passa com 0 failed e o admin exclui usuario, define retencao e aviso padrao pelos servicos e pela tela de usuarios"
fases: ["F-03.1", "F-03.2"]
riscos: ["Agente.criadoPorId e obrigatorio com FK restritiva: a transferencia ao admin precisa ocorrer na mesma transacao do delete (base/schema-e-migracoes.md, D-06)", "o aviso padrao muda o que o chat embutido mostra: fallback so quando o agente nao tem texto (PR-91)"]
---

# Sprint 03 — Exclusao de usuario, retencao e aviso padrao

## Objetivo

Entrega a exclusao definitiva de usuario com a tela, o servico de retencao e aviso padrao do workspace e o uso do aviso padrao no chat embutido e no /start do Telegram.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Exclusao definitiva de usuario | nenhuma |
| F-03.2 | Retencao e aviso padrao | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

a suite inteira passa com 0 failed e o admin exclui usuario, define retencao e aviso padrao pelos servicos e pela tela de usuarios.

## Riscos conhecidos

- Agente.criadoPorId e obrigatorio com FK restritiva: a transferencia ao admin precisa ocorrer na mesma transacao do delete (base/schema-e-migracoes.md, D-06)
- o aviso padrao muda o que o chat embutido mostra: fallback so quando o agente nao tem texto (PR-91)
