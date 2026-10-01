---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-03
atualizado_em: 2026-10-01
titulo: "Borda HTTP: acao sair, troca de senha e renovacao no proxy"
status: nao_iniciado
criterio_saida: "sair revoga e apaga o cookie, salvarSenha grava o cookie real e o proxy reemite o cookie depois da metade da vida sem tocar nas rotas excluidas"
fases: ["F-03.1", "F-03.2"]
riscos: ["NAO DOCUMENTADO o Set-Cookie do proxy numa Server Action que apaga o cookie: o proxy nao renova acao e o teste de ponta a ponta prova o logout (base/00-LACUNAS.md)", "o matcher nao pode voltar a incluir os uploads (src/proxy.ts)"]
---

# Sprint 03 — Borda HTTP: acao sair, troca de senha e renovacao no proxy

## Objetivo

Sair revoga e apaga o cookie, salvarSenha grava o cookie real e o proxy reemite o cookie depois da metade da vida sem tocar nas rotas excluidas.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Acoes de servidor | nenhuma |
| F-03.2 | Renovacao no proxy | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Sair revoga e apaga o cookie, salvarSenha grava o cookie real e o proxy reemite o cookie depois da metade da vida sem tocar nas rotas excluidas.

## Riscos conhecidos

- NAO DOCUMENTADO o Set-Cookie do proxy numa Server Action que apaga o cookie: o proxy nao renova acao e o teste de ponta a ponta prova o logout (base/00-LACUNAS.md)
- o matcher nao pode voltar a incluir os uploads (src/proxy.ts)
