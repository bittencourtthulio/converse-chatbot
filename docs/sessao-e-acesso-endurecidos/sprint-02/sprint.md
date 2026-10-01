---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-02
atualizado_em: 2026-10-01
titulo: "Nucleo da sessao: token, revogacao, versao, renovacao e expurgo"
status: nao_iniciado
criterio_saida: "token com jti, versao e inicio, sair revogavel no servico, troca de senha por versao, renovacao com limite absoluto e expurgo das revogacoes, tudo provado por teste de servico com relogio injetado"
fases: ["F-02.1", "F-02.2", "F-02.3"]
riscos: ["migration so acrescenta: a coluna sessoesValidasDesde nao pode ser removida (tests/migracoes.test.ts)", "mudar assinarSessao e usuarioDaSessao toca 40 arquivos de teste que usam criarUsuario: manter o contrato antigo de duas posicoes"]
---

# Sprint 02 — Nucleo da sessao: token, revogacao, versao, renovacao e expurgo

## Objetivo

Token com jti, versao e inicio, sair revogavel no servico, troca de senha por versao, renovacao com limite absoluto e expurgo das revogacoes, tudo provado por teste de servico com relogio injetado.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Esquema e configuracao | nenhuma |
| F-02.2 | Token, cookie e validacao | nenhuma |
| F-02.3 | Versao, renovacao e expurgo | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Token com jti, versao e inicio, sair revogavel no servico, troca de senha por versao, renovacao com limite absoluto e expurgo das revogacoes, tudo provado por teste de servico com relogio injetado.

## Riscos conhecidos

- migration so acrescenta: a coluna sessoesValidasDesde nao pode ser removida (tests/migracoes.test.ts)
- mudar assinarSessao e usuarioDaSessao toca 40 arquivos de teste que usam criarUsuario: manter o contrato antigo de duas posicoes
