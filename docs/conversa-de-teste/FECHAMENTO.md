---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
titulo: Conversa de teste com o agente
tipo_trabalho: feature
fechado_em: 2026-09-30
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", "README.md", "docs/conversa-de-teste/00-AUDITORIA.md", "docs/conversa-de-teste/00-BLOQUEIOS.md", "docs/conversa-de-teste/00-DECISOES.md", "docs/conversa-de-teste/BRIEFING-BUILDX.md", "docs/conversa-de-teste/FECHAMENTO.md", "docs/conversa-de-teste/ORQUESTRADOR.md", "docs/conversa-de-teste/RELATORIO-FEATURE.md", "docs/conversa-de-teste/VERIFICACAO-VISUAL.md", "docs/conversa-de-teste/base/00-INDICE.md", "docs/conversa-de-teste/base/00-LACUNAS.md", "docs/conversa-de-teste/base/banco-e-testes.md", "docs/conversa-de-teste/base/interface-do-agente.md", "docs/conversa-de-teste/base/servicos-handlers-e-sessao.md", "docs/conversa-de-teste/base/streaming-e-openrouter.md", "docs/conversa-de-teste/sprint-01/tasks.md", "docs/conversa-de-teste/sprint-02/tasks.md", "docs/conversa-de-teste/sprint-03/tasks.md", "docs/conversa-de-teste/sprint-04/tasks.md", "docs/conversa-de-teste/sprint-05/tasks.md", "docs/conversa-de-teste/sprint-06/tasks.md", "docs/conversa-de-teste/sprint-07/tasks.md", "docs/entregas/conversa-de-teste/ATENCAO.md", "docs/entregas/conversa-de-teste/ENTREGA.md", "docs/entregas/conversa-de-teste/PR.md", "docs/entregas/conversa-de-teste/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20260930170000_conversas/migration.sql", "prisma/schema.prisma", "src/app/(sistema)/agentes/[id]/page.tsx", "src/app/(sistema)/agentes/[id]/testar/loading.tsx", "src/app/(sistema)/agentes/[id]/testar/page.tsx", "src/app/api/agentes/[id]/conversar/route.ts", "src/app/eventos-sse.ts", "src/componentes/ChatDeTeste.tsx", "src/componentes/Icones.tsx", "src/componentes/TextoDoModelo.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/estado-da-conversa.ts", "src/componentes/itens-de-menu.ts", "src/componentes/leitor-de-sse.ts", "src/componentes/texto-seguro.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/servicos/chat-erros.ts", "src/servicos/chat-prompt.ts", "src/servicos/chat.ts", "src/servicos/conversas.ts", "src/servicos/integracoes.ts", "tests/abas-do-agente.test.tsx", "tests/ajuda.ts", "tests/ambiente.test.ts", "tests/apoio/chat.ts", "tests/apoio/servir-falso.ts", "tests/chat-de-teste.test.tsx", "tests/chat-erros.test.ts", "tests/chat-falhas.test.ts", "tests/chat-prompt.test.ts", "tests/chat.test.ts", "tests/conversar-rota.test.ts", "tests/conversas-modelo.test.ts", "tests/conversas.test.ts", "tests/estado-da-conversa.test.ts", "tests/eventos-sse.test.ts", "tests/integracoes.test.ts", "tests/leitor-de-sse.test.ts", "tests/projeto.test.ts", "tests/rotas.test.ts", "tests/texto-seguro.test.tsx"]
palavras_chave: [conversa, chat, streaming, sse, openrouter, mensagens, erro, painel]
resumo: O usuário conversa com um agente na aba Testar do painel, vê a resposta chegando trecho a trecho e recebe mensagem clara quando o provedor falha.
decisao_principal: "D-04 e D-11: responderMensagem devolve um AsyncGenerator de eventos e a rota o traduz para SSE; erro do provedor tem duas saídas de mensagem (operador detalhada, visitante genérica) e a resposta interrompida não é gravada"
risco_residual: A conversa só foi provada contra o OpenRouter simulado; 375 px não foi visto no navegador; os tokens de entrada e saída ficam vazios porque o adaptador não devolve o uso; resposta cortada por cancelamento some ao recarregar.
testes_adicionados: 175
---

# Fechamento — conversa-de-teste

## O que foi entregue

Aba Testar no agente com conversa em tempo real (SSE), tabelas de conversa e mensagem, serviço do turno (`responderMensagem`), duas saídas de mensagem de erro e o primeiro handler em `src/app/api`.

## Decisão principal

D-04 e D-11: o serviço não conhece HTTP (devolve eventos tipados) e a rota só traduz; erro antes de gravar é JSON com status, erro depois é o evento `erro`.

## Risco residual

Só foi provado contra o servidor simulado; a 375 px não foi vista; tokens vazios; parcial descartada (PR-41).

## Onde isto mexeu

Apresentação (`src/app`, `src/componentes`, `src/estilos`), aplicação (`src/servicos/conversas.ts`, `chat.ts`, `chat-prompt.ts`, `chat-erros.ts`, `integracoes.ts`), infraestrutura (`src/lib/ambiente.ts`), banco (uma migration aditiva), testes e documentação.
