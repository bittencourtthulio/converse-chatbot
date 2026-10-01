---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
branch: feat/chat-embutido
branch_base: feat/respostas-com-conhecimento
atualizado_em: 2026-09-30
---

# FT-06 — Chat embutido por script (projeto plataforma-chatbot-ia)

O usuário copia um script de uma linha na aba **Publicar** do agente, cola em um site e um visitante anônimo conversa com o agente por um botão flutuante, só nos domínios permitidos e dentro dos limites de uso. Entram a configuração do chat por agente, a API pública sem sessão (configuração, conversa em stream e retomada), os limites de uso com teto diário, o script `widget.js` em Shadow DOM, a página do iframe com `frame-ancestors` por agente (`proxy.ts`), a aba Publicar com prévia ao vivo e a seed com o chat publicado.

Este PR está empilhado sobre `feat/respostas-com-conhecimento` (FT-05). Sem remoto configurado: nenhum push nem PR foi feito; esta descrição é o PR.

## Arquivos alterados

```
./
  M .env.example
  M README.md
  M next.config.ts
  M package-lock.json
  M package.json
docs/chat-embutido/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/chat-embutido/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A api-publica-e-limites.md
  A configuracao-e-painel.md
  A embed-e-csp.md
  A widget-e-script.md
docs/chat-embutido/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/chat-embutido/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/chat-embutido/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/chat-embutido/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/chat-embutido/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/chat-embutido/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/chat-embutido/sprint-07/
  A fases.md
  A sprint.md
  A tasks.md
docs/entregas/chat-embutido/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/
  M schema.prisma
  M seed.ts
prisma/migrations/20260930210000_configuracao_do_chat/
  A migration.sql
src/
  A proxy.ts
src/app/
  M acoes.ts
  M eventos-sse.ts
src/app/(sistema)/agentes/[id]/publicar/
  A loading.tsx
  A page.tsx
src/app/api/publico/
  A resposta.ts
src/app/api/publico/agentes/[id]/config/
  A route.ts
src/app/api/publico/agentes/[id]/conversa/
  A route.ts
src/app/api/publico/agentes/[id]/conversar/
  A route.ts
src/app/embed/[id]/
  A not-found.tsx
  A page.tsx
src/app/widget.js/
  A route.ts
src/componentes/
  A AvatarDoChat.tsx
  A ChatEmbutido.tsx
  A CodigoParaIncorporar.tsx
  A FormularioDoChat.tsx
  A PainelDePublicacao.tsx
  A PreviaDoChat.tsx
  M abas-do-agente.ts
  A embed-logica.ts
  A embed-mensagens.ts
  A publicar-logica.ts
src/estilos/
  M global.css
  M tokens.css
src/lib/
  M ambiente.ts
  A cor.ts
  A dominios-permitidos.ts
src/servicos/
  A chat-publico-config.ts
  A chat-publico-limites.ts
  A chat-publico.ts
src/widget/
  A widget.js
tests/
  M abas-do-agente.test.tsx
  M ajuda.ts
  A ambiente-dom.test.ts
  M ambiente.test.ts
  A chat-embutido-ui.test.tsx
  A chat-publico-config-publica.test.ts
  A chat-publico-config.test.ts
  A chat-publico-limites.test.ts
  A chat-publico.test.ts
  A configuracao-do-chat-modelo.test.ts
  A cor.test.ts
  A dominios-permitidos.test.ts
  A embed-cabecalhos.test.ts
  A embed-logica.test.ts
  A embed-mensagens.test.ts
  A embed-pagina.test.ts
  M eventos-sse.test.ts
  M projeto.test.ts
  A publicar-acao.test.ts
  A publicar-logica.test.ts
  A publicar-rota.test.ts
  A publicar-ui.test.tsx
  A publico-config-rota.test.ts
  A publico-conversa-rota.test.ts
  A publico-conversar-rota.test.ts
  M rotas.test.ts
  M seed.test.ts
  A widget-interacao.test.ts
  A widget-montagem.test.ts
  A widget-rota.test.ts
tests/apoio/
  A dom.ts
  A publico.ts
  A servir-site-de-teste.ts
```

Total: 117 arquivos.

## Origem

Feature FT-06 (`chat-embutido`) do mapa do projeto `plataforma-chatbot-ia`, que realiza as premissas PR-08, PR-16 e PR-17 (e a parte do PR-18 do aviso de privacidade no chat). Planejamento e decisões em `docs/chat-embutido/` (decisões `D-00` a `D-19`, premissas novas PR-55 a PR-62).

## Análise de impacto

Acrescenta uma migration só de `CREATE TABLE` (`configuracao_do_chat`, 1:1 com o agente), as primeiras rotas públicas sem sessão do sistema, o primeiro `proxy.ts` e um `Content-Security-Policy: frame-ancestors` dinâmico por agente, e a rota estática `/widget.js`. O `X-Frame-Options: DENY` continua em todo o sistema, menos em `/embed`. Nenhum agente aparece ao público até o usuário publicar (padrão desligado); o agente de exemplo da seed já vem publicado. `APP_URL` passa a vir vazia no exemplo de ambiente (vazia, o trecho da aba Publicar usa a origem da requisição). Dependência nova só de desenvolvimento: `happy-dom` 20.14.5 (auditoria em 0). Comportamento do chat de teste do painel inalterado.

Detalhe: [00-DECISOES.md](../../chat-embutido/00-DECISOES.md)

## O que foi testado

- Dados, domínios e cor: migration e modelo, normalização e casamento de domínios (45 casos), contraste WCAG com texto por luminância e tokens.
- Serviços: configuração com validação, visão pública sem instruções nem modelo, limites (10 e 30 por minuto, 60 por conversa, teto diário no banco), turno do visitante (posse da conversa, 404 igual, erro genérico, fontes reduzidas, retomada de 50 mensagens).
- Rotas contra o servidor de produção: configuração e CORS pela lista, stream sem sessão, erros, `Retry-After`, `Origin`, `frame-ancestors` por agente (lista vazia, com domínios, inativo, inexistente) e `X-Frame-Options` no resto, página do iframe sem dado interno, `/widget.js` com os cabeçalhos do PR-60, aba Publicar.
- Script em `happy-dom`: montagem em Shadow DOM, silêncio sem chat, idempotência, abrir e fechar, Esc, foco e `postMessage` com `event.origin` e `event.source` estritos.
- Verificação no Chrome, num site de outra origem, com o OpenRouter simulado: botão, stream, Esc, retomada, limite, `data-position` e `data-color`, bloqueio por domínio (`docs/chat-embutido/VERIFICACAO-VISUAL.md`).
- Suíte: 1481 testes verdes, 416 novos (a FT-05 deixou 1065) — `npm run build` e depois `npm test`; `npx tsc --noEmit`, `npm run lint` e `npm audit --audit-level=high` (0) verdes.

## Roteiro de teste manual

17 casos, em linguagem de tela, com as contas de demonstração e o site de teste em outra porta: [QA-PACOTE.md](QA-PACOTE.md).

## Onde eu quero seu olho

Classificação completa em [ATENCAO.md](ATENCAO.md): 19 arquivos para ler linha a linha, 21 para conferir a intenção, 77 dispensáveis.

- `next.config.ts`
- `prisma/migrations/20260930210000_configuracao_do_chat/migration.sql`
- `prisma/schema.prisma`
- `src/app/acoes.ts`
- `src/app/api/publico/agentes/[id]/config/route.ts`
- `src/app/api/publico/agentes/[id]/conversa/route.ts`
- `src/app/api/publico/agentes/[id]/conversar/route.ts`
- `src/app/api/publico/resposta.ts`
- `src/app/embed/[id]/not-found.tsx`
- `src/app/embed/[id]/page.tsx`
- `src/app/eventos-sse.ts`
- `src/app/widget.js/route.ts`
- `src/componentes/embed-mensagens.ts`
- `src/lib/dominios-permitidos.ts`
- `src/proxy.ts`
- `src/servicos/chat-publico-config.ts`
- `src/servicos/chat-publico-limites.ts`
- `src/servicos/chat-publico.ts`
- `src/widget/widget.js`

O que a leitura não substitui: o widget a 375 px, em site com HTTPS e com CSP própria (PEND-07), e o comportamento do modelo real diante do prompt. O `proxy.ts` consulta o banco a cada carregamento do iframe e o limite por minuto é em memória; sem `TRUST_PROXY=1` os visitantes dividem um IP só (a aba Publicar avisa).

## Fora de escopo

Telegram (FT-07), vídeo (FT-08), histórico e leitura das conversas dos visitantes (FT-09), retenção, exclusão e auditoria (FT-10), backup e saúde (FT-11), upload de avatar, transferência para humano e domínio próprio para o widget.
