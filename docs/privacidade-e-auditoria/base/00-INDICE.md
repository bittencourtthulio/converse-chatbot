---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
atualizado_em: 2026-10-01
areas:
  - arquivo: schema-e-migracoes.md
    titulo: Esquema do banco e migrations
    lacunas: 1
  - arquivo: usuarios-e-sessao.md
    titulo: Usuarios, autenticacao e sessao
    lacunas: 0
  - arquivo: integracoes-e-agentes.md
    titulo: Chave do OpenRouter, modelo de transcricao e exclusao de agente
    lacunas: 0
  - arquivo: canais-e-conversas.md
    titulo: Canais, conversas e pontos de extensao da auditoria
    lacunas: 1
  - arquivo: segundo-plano-e-ambiente.md
    titulo: Tarefa em segundo plano e ambiente
    lacunas: 1
  - arquivo: telas-menu-e-publico.md
    titulo: Telas de Configuracoes, menu e chat publico
    lacunas: 1
  - arquivo: testes-e-ci.md
    titulo: Testes, apoio e CI
    lacunas: 0
---

# Índice da base — privacidade-e-auditoria

| Arquivo | Área | Resumo |
|---|---|---|
| `schema-e-migracoes.md` | Esquema e migrations | `Agente.criadoPorId` obrigatório com FK restritiva; regra de migration só-acrescenta |
| `usuarios-e-sessao.md` | Usuários e sessão | serviço de usuários, guarda do último admin, sessão some com o usuário |
| `integracoes-e-agentes.md` | Chave e agente | pontos de gravação da chave e da exclusão de agente |
| `canais-e-conversas.md` | Canais e conversas | ouvintes `aoAlterarCanal` e `aoApagarConversa`, identificadores por canal |
| `segundo-plano-e-ambiente.md` | Segundo plano | `instrumentation.ts`, fila, purga do Telegram, `ambiente.ts` |
| `telas-menu-e-publico.md` | Telas e API pública | menu, guarda de admin, embed, aviso de privacidade |
| `testes-e-ci.md` | Testes | apoio, comandos, testes que contam menu e ambiente |
