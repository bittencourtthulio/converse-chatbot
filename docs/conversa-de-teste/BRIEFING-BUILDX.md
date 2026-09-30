---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-03 Conversa de teste com o agente

## Problema

O usuário conversa com um agente no painel e vê a resposta do modelo chegando em tempo real, com mensagem clara quando o provedor falha.

## Escopo

1. Modelo de dados reutilizável pelos canais futuros: `Conversa` (id opaco, `agenteId` com exclusão em cascata, `canal` entre `painel|widget|telegram`, `identificadorExterno` opcional, `titulo` opcional, `criadoPorId` opcional, `criadoEm`, `atualizadoEm`) e `Mensagem` (id, `conversaId` em cascata, `papel` `user|assistant`, `conteudo`, `modelo`, `tokensEntrada`, `tokensSaida`, `fontes` texto JSON opcional para a FT-05, `criadoEm`). Índices por `conversaId, criadoEm` e `agenteId, atualizadoEm`. Migration só acrescenta; `limparBanco` atualizado.
2. Serviços `src/servicos/conversas.ts` (criar, obter, listar por agente e canal, anexar mensagem, apagar) e `src/servicos/chat.ts` com `responderMensagem({agenteId, conversaId?, canal, identificadorExterno?, mensagem, sinal})`, um `AsyncGenerator` de eventos tipados (`trecho`, `fim`, erro como `ErroDeAplicacao`). Mensagem validada por zod (1 a 4000 caracteres, sem só espaços); prompt de sistema = instruções do agente + linha fixa de conduta, com ponto de extensão para a FT-05; histórico das últimas 20 mensagens dentro de um orçamento de caracteres; mensagem do usuário persistida antes do provedor, resposta do assistente ao fim do stream; `maxTokens` padrão 1024 por `MAX_TOKENS_RESPOSTA`; cancelamento propagado; sem chave, erro claro com código próprio. Duas saídas de mensagem de erro: `mensagemParaOperador` (detalhada) e `mensagemParaVisitante` (genérica); nenhuma vaza corpo do provedor, chave ou pilha; log de erro com correlação e sem conteúdo.
3. Handler de streaming `src/app/api/agentes/[id]/conversar/route.ts` (POST, sessão no servidor, `text/event-stream` com `trecho`, `fim`, `erro`, `Cache-Control: no-store`, `X-Accel-Buffering: no`, cancelamento aborta o provedor).
4. Aba "Testar" em `abas-do-agente.ts` e subrota `agentes/[id]/testar`: interface de chat (bolhas, mensagem inicial, Enter/Shift+Enter, Parar, indicador de digitação, rolagem, Nova conversa, contador de caracteres, renderização segura sem `dangerouslySetInnerHTML`, erros como `Alerta`, estados vazio/carregando/erro, acessível, 375px, tokens, dois temas). Único lugar com `fetch` é o componente cliente; leitura de SSE do navegador em módulo testável.
5. Conversa do painel persiste: recarregar retoma a última conversa do usuário com o agente (canal `painel`); "Nova conversa" começa outra.
6. Convenções: converter as lacunas de handler em `src/app/api` e de uso de stream em `docs/stack/`.
7. Verificação visual nos dois temas e a 375px, se houver ferramentas de navegador.

## Não-objetivos

Base de conhecimento (FT-04, FT-08); respostas com fontes e "não sei" (FT-05); chat embutido e limites públicos (FT-06); Telegram (FT-07); histórico, listagem e apagamento pela interface (FT-09); retenção e auditoria (FT-10); log estruturado global e saúde (FT-11).

## Critérios de aceite de negócio cobertos

- Crio um agente, escolho o modelo do OpenRouter e converso com ele no painel.

## Premissas aplicáveis

PR-22 (realiza); PR-06, PR-12, PR-13, PR-14, PR-15, PR-21, PR-23, PR-26, PR-28, PR-38, PR-40 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
