---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-06
trabalho_id: chat-embutido
status: entregue
sprints: 7
tasks: 28
testes_suite: 1481
data: 2026-09-30
---

# Relatório da FT-06 — Chat embutido por script

Branch `feat/chat-embutido`, a partir de `feat/respostas-com-conhecimento` (PRs empilhados). PR local: descrição em `docs/entregas/chat-embutido/PR.md`, pacote de QA em `docs/entregas/chat-embutido/QA-PACOTE.md`.

## O que foi entregue

- Tabela 1:1 `configuracao_do_chat` (migration `20260930210000_configuracao_do_chat`, só acrescenta) e `src/servicos/chat-publico-config.ts`: ativo (padrão desligado), título, cor `#rrggbb`, posição, avatar predefinido, aviso de privacidade (texto e link), domínios, limite diário, até 3 sugestões; `configuracaoPublica` (só campos visuais), `configuracaoDaPrevia`, `dominiosDoEmbed`.
- API pública em `src/app/api/publico/agentes/[id]/`: `GET config` e `OPTIONS` (404 idêntico para inativo e inexistente, CORS pela lista), `POST conversar` (SSE sem sessão, erro sempre pela frase única do visitante, 429 com `Retry-After`, posse da conversa, `Origin` de navegador conferida) e `GET conversa` (últimas 50 mensagens do próprio visitante, por `X-Visitante-Id`).
- Limites (PR-16, PR-57): 10 por minuto por IP e agente, 30 por minuto por IP, 60 por conversa e teto diário por agente contado no banco.
- `src/widget/widget.js` servido por `/widget.js` (rota estática): Shadow DOM, iframe preguiçoso, Esc, foco, tela cheia abaixo de 480 px, `postMessage` com `event.origin` e `event.source` estritos, idempotente, silencioso se inativo, só `window.Converse`.
- Página `/embed/[id]` (fora do `(sistema)`), `src/proxy.ts` com `frame-ancestors` dinâmico por agente e `X-Frame-Options: DENY` só fora de `/embed` (provado contra o servidor de produção), chat compacto com visitante em `localStorage` (try/catch), retomada, fontes como chips, cor com texto por luminância.
- Aba Publicar: formulário, prévia ao vivo (chat de verdade, modo prévia pelo endpoint do painel), código para incorporar com Copiar e reserva, avisos; `APP_URL` com `appUrlPublica`; seed com o chat publicado.
- Verificação no Chrome, num site de outra origem (`docs/chat-embutido/VERIFICACAO-VISUAL.md`).

## Como demonstrar

`npm run setup`, `npm run build`, `npm run start`; logar com o admin de demonstração, cadastrar a chave de teste (OpenRouter simulado: `npx tsx tests/apoio/servir-falso.ts`), abrir Agentes, o agente de exemplo, aba Publicar; para o site de outra origem, `npx tsx tests/apoio/servir-site-de-teste.ts 4321 http://localhost:3000 agente-de-exemplo`. Roteiro em `docs/entregas/chat-embutido/QA-PACOTE.md`.

## Verificação

1481 testes na suíte inteira (416 novos); `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Os testes de rota exigem `npm run build` antes.

## O que a próxima feature precisa saber

- **Conversas do canal `widget` (FT-09).** `Conversa.canal = 'widget'`, `Conversa.identificadorExterno` = o `visitanteId` (16 a 64 caracteres `[A-Za-z0-9_-]`, gerado no navegador do visitante, opaco e sem identidade), `criadoPorId` nulo, `titulo` os 60 primeiros caracteres da primeira mensagem; mensagens em `Mensagem` (`papel` `user` ou `assistant`, `fontes` com o JSON completo, inclusive `trechoTexto`, que o público não vê). As conversas da prévia da aba Publicar são do canal `painel` (usuário logado), não `widget`. `listar({ agenteId, canal: 'widget', identificadorExterno })` de `src/servicos/conversas.ts` já filtra por visitante.
- **O que o teto diário conta.** Mensagens `user` de conversas `canal = 'widget'` do agente, criadas desde a meia-noite do fuso do servidor, comparadas com `ConfiguracaoDoChat.limiteDiario` (padrão 500); conta tentativas, inclusive as que falharam no provedor (`src/servicos/chat-publico-limites.ts`, `exigirTetoDiario`). O de 60 por conversa e os por minuto estão no mesmo arquivo; os por minuto são em memória.
- **Aviso de privacidade (FT-10, PR-18).** Em `configuracao_do_chat.avisoDePrivacidade` (texto até 300) e `avisoDePrivacidadeUrl` (http ou https, opcional), lidos por `configuracaoPublica(agenteId).avisoDePrivacidade` (`{ texto, url } | null`) e mostrados no rodapé do chat (`src/componentes/ChatEmbutido.tsx`). Retenção, exclusão de conversa de visitante e o link para a política da empresa são da FT-10; o `visitanteId` no `localStorage` do visitante é o dado pessoal a apagar.
- Módulos novos: `src/servicos/chat-publico-config.ts`, `src/servicos/chat-publico.ts` (`conversarComoVisitante`, `retomarConversaDoVisitante`, `erroParaVisitante`), `src/servicos/chat-publico-limites.ts`, `src/lib/dominios-permitidos.ts`, `src/lib/cor.ts`, `src/proxy.ts`, `src/widget/widget.js`, `src/app/api/publico/`, `src/app/embed/[id]`, `src/app/widget.js/route.ts`, `src/componentes/ChatEmbutido.tsx` e companheiros, `tests/apoio/dom.ts`, `tests/apoio/publico.ts`, `tests/apoio/servir-site-de-teste.ts`.
- Variáveis: `APP_URL` passa a ter a leitura `ambiente.appUrlPublica` (sem padrão; vazia no `.env.example`); nenhuma variável nova. Dependência nova: `happy-dom` 20.14.5 (devDependência).
- FT-07 (Telegram) herda `chat-publico-limites.ts` (`exigirLimiteDeIp` aceita outro balde) e o padrão de erro para o visitante (`erroParaVisitante`); FT-11: o `proxy.ts` usa o banco e o `/widget.js` é gerado na construção, então o contêiner precisa de `npm run build` com o `src/widget/widget.js` presente.

## Desvios do plano

- Sem desvio de escopo. Arquivos além da lista das tasks foram declarados nelas no momento em que surgiram: `tests/projeto.test.ts` (T-01.04), `chat-publico.ts` (T-03.02), `AvatarDoChat.tsx`, `embed-logica.ts` e seu teste (T-04.02), `not-found.tsx` na T-04.04 (o `loading.tsx` previsto foi descartado: com ele a página indisponível sairia 200), `chat-publico-config.ts` e `global.css` (T-04.04), `tests/apoio/dom.ts` (T-05.02), `publicar-logica.ts` movido para a T-06.01 (o formulário o importa), `PainelDePublicacao.tsx`, `embed-mensagens.ts`, `ChatEmbutido.tsx` (T-06.02), `tests/rotas.test.ts` (T-06.04) e `global.css` (T-07.02, achado da verificação). A ordem T-07.01 e T-07.02 foi trocada (o teste de navegador podia mudar os números de linha das convenções).
- Em várias tasks o teste e o código foram escritos no mesmo passo em vez de em vermelho primeiro (T-02.03, T-02.04, T-03.02, T-03.03, T-04.01, T-04.03, T-05.01, T-05.02, T-06.01 a T-06.03, T-07.01): a prova de vermelho foi feita escondendo a implementação antes da primeira execução do teste; nas rotas e na página, rodando o teste contra a construção antiga. A T-06.01 e a T-07.01 escreveram código e documentação antes do teste.
- Os testes de rota usam o `.next` que existir: os `verde` das tasks T-05.x a T-06.03 foram com a construção da época; a rodada final, depois de `npm run build`, validou tudo (achado: `tests/rotas.test.ts` esperava três abas). Registrado como lacuna 17.
- Falhas de teste achadas e corrigidas no caminho (não são desvio): contraste garantido de 4,5 só com texto preto puro (o token `--fg-em-cor-clara` é `#000000`); `413` do corpo grande não chegava ao visitante; a prova de origem do `postMessage` aceitava `source` nulo com `contentWindow` nulo.

## Premissas e pendências

Novas: PR-55 (configuração do chat), PR-56 (API pública), PR-57 (limites e teto diário), PR-58 (domínios, CORS e `frame-ancestors`), PR-59 (cabeçalhos do iframe por `proxy.ts`), PR-60 (`widget.js` e protocolo), PR-61 (página do iframe), PR-62 (código para incorporar e `APP_URL`). PR-08, PR-16 e PR-17 passam a realizadas. A PEND-07 (verificação em celular real) ganhou o widget a 375 px, o tema claro do chat e da aba Publicar e o botão Copiar. Sem pendência nova. Limites conhecidos em `docs/stack/LACUNAS.md` (14 a 17).
