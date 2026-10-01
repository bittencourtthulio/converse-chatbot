---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-04
atualizado_em: 2026-10-01
titulo: "Limites e guardas em profundidade"
status: nao_iniciado
criterio_saida: "o limite de login esta provado na acao, o GET publico da conversa tem limite, auditoria.listar e a pagina de conversa se defendem e um teste de arquitetura enumera telas e rotas"
fases: ["F-04.1", "F-04.2"]
riscos: ["o limite do GET compartilha a chave chat:ip-agente do POST: testes existentes de rota publica podem passar a bater no limite", "mudar a assinatura de auditoria.listar toca a pagina e tres arquivos de teste"]
---

# Sprint 04 — Limites e guardas em profundidade

## Objetivo

O limite de login esta provado na acao, o GET publico da conversa tem limite, auditoria.listar e a pagina de conversa se defendem e um teste de arquitetura enumera telas e rotas.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Limites de uso | nenhuma |
| F-04.2 | Guardas | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

O limite de login esta provado na acao, o GET publico da conversa tem limite, auditoria.listar e a pagina de conversa se defendem e um teste de arquitetura enumera telas e rotas.

## Riscos conhecidos

- o limite do GET compartilha a chave chat:ip-agente do POST: testes existentes de rota publica podem passar a bater no limite
- mudar a assinatura de auditoria.listar toca a pagina e tres arquivos de teste
