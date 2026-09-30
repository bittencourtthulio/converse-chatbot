---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-03
trabalho_id: conversa-de-teste
status: entregue
sprints: 7
tasks: 17
testes_suite: 573
data: 2026-09-30
---

# Relatório da FT-03 — Conversa de teste com o agente

Branch `feat/conversa-de-teste`, a partir de `feat/agentes-e-openrouter` (PRs empilhados). PR local: descrição em `docs/entregas/conversa-de-teste/PR.md`, pacote de QA em `docs/entregas/conversa-de-teste/QA-PACOTE.md`.

## O que foi entregue

- Tabelas `conversas` e `mensagens` (migration só acrescenta; cascata do agente e da conversa provada), reutilizáveis pelos canais das FT-06, FT-07 e FT-09.
- Serviços `src/servicos/conversas.ts` (criar, obter com posse, listar, anexar mensagem, apagar, retomar a última do painel) e `src/servicos/chat.ts` (`responderMensagem`, um `AsyncGenerator` de eventos `inicio`, `trecho` e `fim`; erro como `ErroDeAplicacao`), com o prompt em `src/servicos/chat-prompt.ts` (ponto de extensão `materialDeConsulta` para a FT-05) e as duas saídas de erro em `src/servicos/chat-erros.ts` (`mensagemParaOperador`, `mensagemParaVisitante`).
- `POST /api/agentes/[id]/conversar`: primeiro handler em `src/app/api`, SSE com `trecho`, `fim` e `erro`, sessão no servidor, cancelamento que aborta o provedor.
- Aba "Testar" no agente: bolhas, mensagem inicial, Enter e Shift+Enter, Parar, Nova conversa, indicador de digitação, texto do modelo renderizado sem HTML cru, erros como Alerta, conversa retomada ao recarregar.
- `MAX_TOKENS_RESPOSTA` (padrão 1024) em `src/lib/ambiente.ts` e no `.env.example`.
- Convenções e lacunas atualizadas (lacuna 7 resolvida).

## Como demonstrar

`npm run setup`, `npm run dev`, entrar com `admin@exemplo.local` / `demo1234` (contas fictícias), seguir `docs/entregas/conversa-de-teste/QA-PACOTE.md`. Sem gastar crédito, apontar `OPENROUTER_BASE_URL` para o servidor simulado (`tests/apoio/openrouter-falso.ts`).

## Verificação

573 testes na suíte inteira (175 novos); `npx tsc --noEmit`, lint, build e `npm audit --audit-level=high` (0) verdes. Verificação visual em `docs/conversa-de-teste/VERIFICACAO-VISUAL.md`: temas claro e escuro vistos no navegador; 375 px não foi possível.

## Desvios do plano

- Arquivos não previstos, declarados nas tasks e no `ENTREGA.md`: `tests/apoio/chat.ts`, `retomarDoPainel` (`conversas.ts`), `chaveDoOpenrouterConfigurada` (`integracoes.ts`), a ação `recusada` do reducer, os ícones `enviar` e `parar`.
- O critério "nenhum `dangerouslySetInnerHTML` em `src/`" admite o script constante do tema em `src/app/layout.tsx`, que já existia.
- Não há `proxy.ts` no template: não houve matcher de sessão a ajustar; a guarda é do handler.
- Vários testes foram escritos junto da implementação e não antes dela (T-02.02, T-02.03, T-03.02, T-05.02, T-05.03): para a T-03.02 a prova de que o teste reprova implementação errada foi uma mutação do cancelamento.

## Premissas e pendências

Novas: PR-41 (regras do turno), PR-42 (duas saídas de erro e correlação), PR-43 (protocolo do stream), PR-44 (conversa do painel). Sem pendência nova; a PEND-07 (verificação em celular real) ganhou a aba Testar.
