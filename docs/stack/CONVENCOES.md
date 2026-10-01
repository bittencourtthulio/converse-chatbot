---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: 2026-09-30
commit-referencia: 40164c4
projeto-legado: nao
origem-do-documento: buildx-b4-ft-01
---

# Convenções técnicas — plataforma-chatbot-ia

> **Convertido na FT-01 pelo `stackx-detectar` sobre o código real.** Cada regra que
> o B2 deixou como `decidido_pelo_buildx` foi conferida: a que o código prova virou
> evidência (arquivo:linha); a que o código contradiz virou achado (ver "Achados da
> conversão"); a que ainda não tem código para prová-la continua marcada
> `decidido_pelo_buildx` e nomeia a feature que a realiza. Na dúvida o código
> ganhou, exceto onde a convenção realiza premissa de segurança. Confirmações que a
> etapa de atualização pediria ao usuário foram respondidas pelo buildx em modo
> autônomo e estão registradas na tabela de decisões.

## 1. Identidade técnica

| Item | Valor | Evidência |
| ---- | ----- | --------- |
| Linguagem e versão | TypeScript 5.9.3 (versão exata), modo estrito | `package.json:39`, `tsconfig.json` (`"strict": true`) |
| Runtime e versão | Node.js 22 (o CI roda 22; o README pede 22 ou superior) | `.github/workflows/ci.yml:20`, `README.md` |
| Gerenciador de pacotes | npm 10, lockfile v3 versionado | `package-lock.json:4` |
| Framework principal e versão | Next.js 16.3.8 (subiu de 16.3.3 na FT-04, pela auditoria), App Router, React 19.2.8 | `package.json:27` |
| Banco | SQLite em arquivo, Prisma 7.10.0, adaptador better-sqlite3 (12.11.1 no lock) | `package.json:21-22`, `package-lock.json:3895` |
| Validação de esquema | zod 4.5.4 | `package.json:29` |

**Evidência:** `package.json`

---

## 2. Comandos que funcionam de verdade

Todos executados numa cópia limpa do commit de referência (T-05.02) e verdes.

| Alvo | Comando | Evidência |
| ---- | ------- | --------- |
| Suíte inteira | `npm test` (o teste de rotas exige `npm run build` antes) | `package.json:11`, `.github/workflows/ci.yml:38-39` |
| Um teste só | `npx vitest run tests/perfil.test.ts` | `vitest.config.ts:7` |
| Com cobertura | — (LACUNA) | sem provedor de cobertura instalado |
| Lint | `npm run lint` | `package.json:10` |
| Formatador (verificar) | — (LACUNA) | sem formatador configurado; o ESLint é o único portão |
| Formatador (aplicar) | — (LACUNA) | idem |
| Type check | `npx tsc --noEmit` | `.github/workflows/ci.yml:33` |
| Build | `npm run build` (exige `DATABASE_URL` e `JWT_SECRET` no ambiente) | `package.json:8`, `.github/workflows/ci.yml:11-14` |
| Subir ambiente local | `npm run setup` e `npm run dev` | `package.json:7,15`, `README.md` |
| Verificar dependências | `npm audit --audit-level=high` | `.github/workflows/ci.yml:41-42` |
| Pipeline | lint, tipos, build, testes e auditoria a cada push e PR | `.github/workflows/ci.yml:1-42` |

**Evidência:** `package.json`, `.github/workflows/ci.yml`

---

## 3. Testes

| Item | Convenção | Evidência |
| ---- | --------- | --------- |
| Onde o arquivo mora | `tests/` na raiz | `vitest.config.ts:7` |
| Nome do arquivo | `<assunto>.test.ts`, em português; componentes usam `.test.tsx` | `tests/perfil.test.ts`, `tests/componentes.test.tsx`, `vitest.config.ts:7` |
| Nome do caso de teste | frase em português dizendo o comportamento | `tests/autenticacao.test.ts:32` (`it('recusa senha errada', ...)`) |
| Runner e versão | Vitest 4.1.11 | `package.json:40` |
| Biblioteca de asserção | `expect` do Vitest | `tests/perfil.test.ts` |
| Montagem de dado | funções auxiliares em `tests/ajuda.ts` (`criarUsuario`, `criarAdmin`, `limparBanco`) | `tests/ajuda.ts:10,36,39` |
| Marcação de teste lento | sem marcação por teste: `testTimeout` de 30 s e `hookTimeout` de 180 s para todos; o teste de rotas sobe o servidor de produção | `vitest.config.ts:9-10`, `tests/rotas.test.ts:59` |
| Script de navegador (FT-06) | `happy-dom` 20.14.5 por arquivo (`// @vitest-environment happy-dom`), sem mudar o ambiente `node` global; o apoio roda o `widget.js` de verdade com `fetch` simulado e sem rede (`disableIframePageLoading` e `disableJavaScriptFileLoading`); a interação de componente React continua em módulo puro | `tests/apoio/dom.ts`, `tests/widget-montagem.test.ts`, `tests/ambiente-dom.test.ts` |
| Paralelismo do runner | `fileParallelism: false` | `vitest.config.ts:14` |
| Testes sobre arquivos de projeto | `tests/projeto.test.ts` confere scripts, exemplo de ambiente, CI e README | `tests/projeto.test.ts` |

**Teste exemplar:** `tests/usuarios.test.ts` (serviço com banco), `tests/limite-de-uso.test.ts` (unidade com relógio injetado).

**O que se mocka e o que fica real**

| Eixo | Tratamento | Evidência |
| ---- | ---------- | --------- |
| HTTP de saída (OpenRouter, Telegram, YouTube) | servidor HTTP local de teste em porta livre, URL base por variável de ambiente (`OPENROUTER_BASE_URL`), nunca a rede real; o servidor de produção do teste de rotas também recebe a URL do servidor simulado | `tests/apoio/openrouter-falso.ts:90`, `src/lib/ambiente.ts:50`, `tests/openrouter.test.ts:22`, `tests/rotas.test.ts` (variável `falso`); o Telegram (FT-07) segue o mesmo padrão: `tests/apoio/telegram-falso.ts:91` sobe o servidor simulado e `TELEGRAM_API_BASE` (`src/lib/ambiente.ts:99`) aponta para ele; o YouTube segue `decidido_pelo_buildx` (FT-08) |
| HTTP de entrada | o servidor de produção sobe no teste de rotas; desde a FT-04 há um apoio único para subir `next start` numa porta, herdando banco e `STORAGE_DIR` do teste, com upload multipart real por `FormData`; desde a FT-07, `subirServidor` aceita `capturarLogs` e devolve `logs()`, para o teste varrer o log do servidor de produção atrás de token, segredo e texto de conversa (`tests/apoio/servidor.ts:31`) | `tests/rotas.test.ts:59`, `tests/apoio/servidor.ts:15` |
| Relógio | injetado por parâmetro: `criarLimitador(relogio)`; o limite de login recebe o limitador | `src/lib/limite-de-uso.ts:46`, `src/servicos/autenticacao.ts:36-40`, `tests/limite-de-login.test.ts` |
| Sistema de arquivos | um diretório temporário por arquivo de teste, criado e apontado por `STORAGE_DIR` no setup e apagado ao fim; o armazenamento recebe a raiz por parâmetro e os testes o criam com `armazenamentoDeTeste()` | `tests/setup.ts:23-24`, `tests/setup.ts:40`, `src/lib/armazenamento.ts:30`, `tests/apoio/fontes.ts:8` |
| Serviço externo | nenhum real: o OpenRouter é simulado, e o teste de conversa cancela e estoura prazo contra o servidor simulado; os testes do turno reutilizam o falso por `tests/apoio/chat.ts:12` (`cenarioDeChat`) e o teste de rota o sobe junto de `next start` | `tests/openrouter-conversar.test.ts`, `tests/apoio/openrouter-falso.ts:90`, `tests/chat.test.ts`, `tests/conversar-rota.test.ts` |

**Regra de TDD:** teste antes da implementação, sempre. Uma task só termina com
teste de integração e teste funcional passando.

---

## 4. Banco de dados em teste

| Item | Valor | Evidência |
| ---- | ----- | --------- |
| Engine e versão exata | SQLite via better-sqlite3 12.11.1 | `package-lock.json:3895` |
| ORM / camada de acesso | Prisma 7.10.0; SQL cru só para FTS5: a tabela virtual `trechos_fts` nasce em migration escrita à mão e a consulta é `prisma.$queryRaw` parametrizado (FT-05, PR-30) | `prisma/schema.prisma:13`, `package.json:22`, `prisma/migrations/20260930190000_busca_fts5/migration.sql:10`, `src/servicos/recuperacao.ts:76` |
| **Isolamento entre testes** | um arquivo SQLite (`prisma/test.db`) por arquivo de teste, criado por `prisma migrate deploy` e apagado ao fim | `tests/setup.ts:9,18-29,31-34` |
| Combinação isolamento × paralelismo | arquivo único, `fileParallelism: false`, cada teste limpa o que criou | `vitest.config.ts:12-14`, `tests/ajuda.ts:39` |
| Semeadura de dado de teste | funções em `tests/ajuda.ts`; a seed de demonstração só roda em teste dentro de `tests/seed.test.ts`, contra o banco de teste | `tests/ajuda.ts`, `tests/seed.test.ts` |
| Onde vivem as migrações | `prisma/migrations/` | `prisma.config.ts:9` |
| Comando de rodar migração | `npm run db:migrate` (`prisma migrate deploy`) | `package.json:13` |
| Comando de reverter migração | — (LACUNA): o Prisma não gera reversão; toda migração destrutiva precisa de backup antes (PR-20) | `decidido_pelo_buildx` |
| Migrações têm reversão declarada? | não. Regra: migração só acrescenta (coluna nova, tabela nova); `DROP TABLE` e `DROP COLUMN` só com a marca `-- destrutiva-autorizada` na própria migration, e um teste lê o SQL de todas as migrations | `tests/migracoes.test.ts:14`; as migrations só criam tabela, índice, tabela virtual e gatilho (`prisma/migrations/20260830193658_esquema_inicial` a `20260930190000_busca_fts5`) |
| Tabela virtual FTS5 | SQL cru dentro de uma migration escrita à mão (o Prisma não a modela): tabela de conteúdo externo sobre `trechos`, tokenizer `unicode61 remove_diacritics 2`, três gatilhos (insert, delete, update do texto) e `rebuild` inicial; só `migrate deploy` a aplica, e `db push` a apagaria; o `rowid` implícito liga índice e conteúdo, então `reconstruirIndiceDeTrechos` é o remédio se um `VACUUM` ou uma restauração o renumerar (PR-50) | `prisma/migrations/20260930190000_busca_fts5/migration.sql:10`, `prisma/migrations/20260930190000_busca_fts5/migration.sql:19`, `src/servicos/recuperacao.ts:126`, `tests/indice-fts5.test.ts`, `tests/indice-fts5-cascata.test.ts` |
| Regra do `setup` | usa `migrate deploy`, não `db push` (o `db push` apaga tabelas virtuais FTS5) | `package.json:15`, `tests/projeto.test.ts` |

**Evidência:** `tests/setup.ts`, `vitest.config.ts`

---

## 5. Estrutura e camadas

| Camada (nome no repositório) | Pasta | Pode importar de | Não importa de |
| ---------------------------- | ----- | ---------------- | -------------- |
| apresentação | `src/app`, `src/componentes`, `src/estilos` | `src/servicos`, `src/lib` | `src/lib/prisma` e `src/gerado` |
| aplicação | `src/servicos` | `src/lib` | `src/app`, `src/componentes`, `next/*` |
| dados e infraestrutura | `src/lib` (`prisma`, sessão, ambiente, limite de uso, requisição) | bibliotecas | `src/servicos`, `src/app`, `src/componentes` |

**Força da evidência de dependência:** verificada por lint. A regra
`no-restricted-imports` está em `eslint.config.mjs:8-60` (três blocos, um por
camada) e o teste `tests/camadas.test.ts` prova as direções proibidas e as permitidas
com o ESLint real. `src/lib` não usa mais `next/headers` para sessão: o antigo
`sessao-servidor` mora agora em `src/app/sessao-servidor.ts`. `src/lib/requisicao.ts:1`
importa `next/headers` (só `headers()`), o que a regra permite para `src/lib`.

**Onde entra código novo**

| Tipo | Pasta | Arquivo exemplar |
| ---- | ----- | ---------------- |
| Caso de uso | `src/servicos/<assunto>.ts` | `src/servicos/usuarios.ts:52` |
| Adaptador de serviço externo | `src/lib/<provedor>.ts`: um ponto só que fala com o provedor, erro do provedor vira `ErroDeAplicacao` sem repassar o corpo, URL base por `src/lib/ambiente.ts` | `src/lib/openrouter.ts:49` (`chamarProvedor`), `src/lib/erros.ts:45` (`erroDoProvedor`), `src/lib/sse.ts:15` |
| Segredo em repouso | `src/lib/cripto.ts` (AES-256-GCM, formato `v1:`), chave lida só ao cifrar ou decifrar; o serviço só devolve máscara | `src/lib/cripto.ts:44`, `src/servicos/integracoes.ts:69`, `tests/rotas.test.ts` (bloco Integrações) |
| Módulo de infraestrutura reutilizável | `src/lib/<nome>.ts` | `src/lib/limite-de-uso.ts` |
| Handler HTTP | `src/app/api/<recurso>/route.ts`, fino: sessão por `usuarioAtual()` (401 em JSON, sem redirecionar), corpo, e a tradução do serviço para HTTP; `export const dynamic = 'force-dynamic'`; erro antes de gravar vira JSON com o status do `ErroDeAplicacao`. Salvar, testar e remover a chave e as ações de agente seguem como ações de servidor em `src/app/acoes.ts`, sem rota de API | `src/app/api/agentes/[id]/conversar/route.ts:10,30`, `src/app/sessao-servidor.ts:10`, `tests/conversar-rota.test.ts` |
| Resposta em stream (SSE) | o serviço devolve um `AsyncGenerator` de eventos tipados e não conhece HTTP; a rota o converte com `fluxoDeEventos` (`event:` + `data:` em JSON, cancelar a leitura aborta o gerador; o canal público passa um `mapearErro` para o erro sair sempre como a frase única do visitante, `src/app/eventos-sse.ts:15`) e cabeçalhos `text/event-stream`, `Cache-Control: no-store` e `X-Accel-Buffering: no`; o navegador lê com `lerEventos`, em módulo puro, sem `fetch`; o `fetch` mora só em componente cliente de `src/componentes` (`'use client'`: o de conversa e, desde a FT-04, os da aba Conhecimento) | `src/servicos/chat.ts:82`, `src/app/eventos-sse.ts:10`, `src/app/eventos-sse.ts:38`, `src/componentes/leitor-de-sse.ts:62`, `src/componentes/ChatDeTeste.tsx`, `tests/eventos-sse.test.ts`, `tests/leitor-de-sse.test.ts` |
| Texto de origem não confiável na tela | analisador puro para uma árvore mínima (parágrafo, lista, código, negrito, link http/https) e componente que a vira em elementos React; nunca `dangerouslySetInnerHTML` (o único uso é o script constante do tema em `src/app/layout.tsx`) | `src/componentes/texto-seguro.ts:59`, `src/componentes/TextoDoModelo.tsx`, `tests/texto-seguro.test.tsx` |
| Lógica de tela sem navegador | estado como reducer puro e regras de teclado em módulo próprio; o componente só liga ao DOM e à rede (o ambiente de teste é `node`, sem jsdom) | `src/componentes/estado-da-conversa.ts:68`, `tests/estado-da-conversa.test.ts` |
| Ação de formulário | `src/app/acoes.ts` (um arquivo para o sistema) | `src/app/acoes.ts:35` |
| Guarda de sessão e papel | `src/app/sessao-servidor.ts` | `src/app/sessao-servidor.ts` |
| Componente de interface | `src/componentes/<Nome>.tsx`, PascalCase | `src/componentes/Formulario.tsx` |
| Busca textual (FTS5) | `src/servicos/recuperacao.ts` (`buscarTrechos`, `buscarNaBase`, `reconstruirIndiceDeTrechos`) com as funções puras de termos e expressão `MATCH` em `src/servicos/recuperacao-termos.ts`; a expressão só leva termos limpos entre aspas e vai como parâmetro de `prisma.$queryRaw`; só fonte `pronto` do agente; BM25; teto de 6 trechos (PR-51) | `src/servicos/recuperacao.ts:76`, `src/servicos/recuperacao-termos.ts:66`, `tests/recuperacao.test.ts` |
| Prompt com material de terceiros | o conteúdo da base entra na mensagem de sistema como dado, num bloco com marcador aleatório por requisição e higienizado; o teste captura a requisição no OpenRouter falso e prova a estrutura (o comportamento do modelo real não é testável) (PR-52) | `src/servicos/chat-prompt.ts:102`, `src/servicos/chat.ts:106`, `tests/chat-fundamentado.test.ts` |
| Item de menu | lista única em `src/componentes/itens-de-menu.ts` | `src/componentes/itens-de-menu.ts:37` |
| Aba da página de um agente | lista única em `src/componentes/abas-do-agente.ts`; a subrota mora em `src/app/(sistema)/agentes/[id]/<caminho>` | `src/componentes/abas-do-agente.ts:12` |
| Cor, sombra, raio, fonte | tokens em `src/estilos/tokens.css`; nenhum valor literal fora dele | `tests/tokens.test.ts` |
| Tarefa em segundo plano | `src/servicos/<assunto>-fila.ts`: estado no banco, reivindicação atômica por `updateMany` condicional, concorrência injetável, `processarPendentes()` aguardável para teste, relógio e armazenamento injetáveis, singleton em `globalThis`; iniciada por `src/instrumentation.ts` (só runtime Node, import dinâmico, sem esperar o processamento); `acordar()` só age depois de `iniciar()`, por isso o teste de serviço controla a fila | `src/servicos/fontes-fila.ts:53`, `src/servicos/fontes-fila.ts:214`, `src/instrumentation.ts:6`, `tests/fontes-fila-execucao.test.ts` |
| Armazenamento de arquivos | `src/lib/armazenamento.ts`: `criarArmazenamento(raiz)` grava em `<raiz>/fontes/<agenteId>/<fonteId>/original`; só ids gerados pelo servidor entram no caminho (alfabeto fechado) e o caminho final é conferido dentro da raiz; sem import com alias `@/` (a seed o usa); a raiz do ambiente vem de `ambiente.storageDir`, e o `path.resolve` de tempo de execução leva `turbopackIgnore` para o build não rastrear o projeto inteiro | `src/lib/armazenamento.ts:9`, `src/lib/armazenamento.ts:10`, `src/lib/armazenamento.ts:30`, `src/lib/ambiente.ts:88`, `src/lib/ambiente.ts:92` |
| Extração de texto de arquivo | adaptador por formato em `src/lib/extracao/`, atrás de uma fachada `extrairTexto` que limita texto e prazo e converte qualquer exceção de biblioteca em `ErroDeAplicacao` sem repassar a mensagem dela; conferência do conteúdo real em `validarConteudo`; o ZIP do DOCX é lido à mão e descompactado com teto | `src/lib/extracao/index.ts:51`, `src/lib/extracao/index.ts:45`, `src/lib/extracao/zip.ts:31` |
| Upload multipart | handler fino: sessão, tipo de conteúdo (415), teto por `Content-Length` antes de ler o corpo (413) e conferência do tamanho real depois; um resultado por arquivo vem do serviço; no navegador, um `XMLHttpRequest` por arquivo dá progresso | `src/app/api/agentes/[id]/fontes/route.ts:26`, `src/app/api/agentes/[id]/fontes/route.ts:35`, `src/app/api/agentes/[id]/fontes/route.ts:44`, `src/componentes/enviar-arquivo.ts:34` |
| Opção de adicionar fonte | lista única em `src/componentes/opcoes-de-fonte.ts` e o painel de cada opção em `PAINEIS` de `AdicionarFontes`; a FT-08 acrescenta vídeo nos dois | `src/componentes/opcoes-de-fonte.ts:13`, `src/componentes/AdicionarFontes.tsx:17` |
| Rota pública, sem sessão (FT-06) | `src/app/api/publico/agentes/[id]/<recurso>/route.ts`, fina: nenhuma sessão nem cookie lido; o serviço decide (404 igual para agente inexistente e inativo, 422, 429 com `Retry-After`); todo erro vai ao visitante por `erroParaVisitante` (frase única, sem código do provedor nem pilha); `Cache-Control: no-store`; `POST` recusa `Origin` de navegador que não seja a da plataforma; `config` leva CORS pela lista de domínios e `Vary: Origin`; o IP vem de `ipDoCliente` | `src/app/api/publico/agentes/[id]/conversar/route.ts:35`, `src/app/api/publico/agentes/[id]/config/route.ts:12`, `src/servicos/chat-publico.ts:115`, `src/servicos/chat-publico.ts:84`, `tests/publico-conversar-rota.test.ts`, `tests/publico-config-rota.test.ts` |
| Limites do chat público (FT-06, PR-57) | `src/servicos/chat-publico-limites.ts`: IP e agente (10/min) e IP (30/min) por `criarLimitador` com relógio injetável, 60 mensagens por conversa e teto diário por agente contado no banco (mensagens `user` do canal `widget` desde a meia-noite do servidor); `ErroDeLimite` leva `retryAfterSegundos`; sem `TRUST_PROXY=1` todos os visitantes dividem o IP `desconhecido` | `src/servicos/chat-publico-limites.ts:32`, `src/servicos/chat-publico-limites.ts:75`, `tests/chat-publico-limites.test.ts` |
| Cabeçalho por rota e `proxy.ts` (FT-06, PR-59) | `src/proxy.ts` (Next 16, runtime Node) roda só em `/embed/:path*`, consulta o serviço e define `Content-Security-Policy: frame-ancestors` conforme a lista do agente (vazia: `*`; inativo, inexistente ou falha: `'self'`); o `X-Frame-Options: DENY` sai só de `/embed` por expressão regular no `next.config.ts`; provado contra o servidor de produção | `src/proxy.ts:12`, `src/proxy.ts:28`, `next.config.ts:18`, `next.config.ts:25`, `src/lib/dominios-permitidos.ts:109`, `tests/embed-cabecalhos.test.ts` |
| Script de terceiros (FT-06, PR-60) | `src/widget/widget.js`: JavaScript puro (ES2017), IIFE, sem dependência, lido na construção pela rota estática `/widget.js`; monta em Shadow DOM, silencioso se o agente está inativo, idempotente, sem global além de `window.Converse`, `postMessage` só de `event.origin` da plataforma e `event.source` do próprio iframe. **Exceção declarada à regra de cor literal:** o script roda em site de terceiro e não lê os tokens, então as cores neutras dele são literais do próprio arquivo, que `tests/tokens.test.ts` (só `.ts`, `.tsx` e `.css`) não varre | `src/widget/widget.js:233`, `src/app/widget.js/route.ts:12`, `tests/widget-montagem.test.ts`, `tests/widget-interacao.test.ts`, `tests/widget-rota.test.ts` |
| Cor escolhida pelo usuário (FT-06, PR-61) | a cor do agente é dado, não token: entra por variável de CSS em tempo de execução e o texto sobre ela (`--fg-em-cor-clara` ou `--fg-em-cor-escura`) é o de maior contraste por luminância (WCAG); `src/lib/cor.ts` usa trios RGB, nunca hex literal | `src/lib/cor.ts`, `src/componentes/embed-logica.ts:64`, `tests/cor.test.ts` |
| Segredo na URL do provedor (FT-07, PR-64) | quando o provedor põe o segredo no caminho da URL (o token do Telegram em `/bot<token>/<método>`), o adaptador nunca repassa mensagem de exceção, `cause`, pilha nem a descrição do provedor: todo erro nasce de texto fixo em português mais o status (`erroDoTelegram`), `chamar` descarta o erro original, e `redigirToken` troca o token e qualquer `bot<dígitos>:<segredo>` por `bot<oculto>` para o texto que ainda precisar ser mantido; o teste varre erro, pilha, causa e console em seis métodos por oito falhas | `src/lib/telegram.ts:107`, `src/lib/telegram.ts:44`, `src/lib/telegram.ts:23`, `tests/telegram-token-nao-vaza.test.ts:65` |
| Envio ao provedor com divisão e espera (FT-07, PR-64) | texto acima de 4096 caracteres é dividido em pedaços (linha em branco, quebra de linha, espaço, corte seco sem partir par substituto), enviado em ordem, sem `parse_mode`; o 429 com `retry_after` de até 30 s é esperado e repetido uma única vez, com a espera injetável para o teste | `src/lib/telegram.ts:222`, `src/lib/telegram.ts:241` |
| Webhook de terceiro (FT-07, PR-66) | `src/app/api/telegram/[agenteId]/webhook/route.ts`, fino: sem sessão, quem autentica é o cabeçalho `X-Telegram-Bot-Api-Secret-Token` comparado em tempo constante (`timingSafeEqual` sobre o SHA-256) com o hash gravado; segredo ausente, errado e canal inexistente dão o mesmo 401 sem corpo (a comparação roda também contra um hash fixo quando o canal não existe); só depois da autenticação vêm o limite de 64 KB, o canal pausado (200 sem atender), o JSON ou formato ilegível (200 mudo, para o Telegram não reenviar lixo) e o dedupe por `update_id` (insert primeiro, violação de unicidade é reenvio); o serviço devolve o atendimento e a rota o roda em `after()`, depois do 200 | `src/servicos/telegram-webhook.ts:156`, `src/servicos/telegram-webhook.ts:29`, `src/servicos/telegram-webhook.ts:38`, `src/servicos/telegram-webhook.ts:95`, `src/app/api/telegram/[agenteId]/webhook/route.ts:21`, `tests/telegram-webhook-rota.test.ts:89` |
| Canal por agente e segredo do webhook (FT-07, PR-63, PR-65) | `src/servicos/canal-telegram.ts`: `conectar` valida o formato do token, exige `APP_URL` HTTPS antes de falar com o Telegram (`origemDoWebhook`; a exceção `TELEGRAM_PERMITIR_URL_NAO_HTTPS=1` vale só fora de produção), confere o bot (`getMe`), cifra o token antes de registrar o webhook, gera 32 bytes como segredo (só o SHA-256 é gravado) e só então grava; reconectar gira o segredo; `aoAlterarCanal` é o ponto de extensão da auditoria (FT-10), com `{acao, agenteId, usuarioId}` e nunca token, segredo ou conteúdo | `src/servicos/canal-telegram.ts:167`, `src/servicos/canal-telegram.ts:83`, `src/servicos/canal-telegram.ts:29` |
| Atendimento depois da resposta (FT-07, PR-67, PR-68) | `src/servicos/telegram-atendimento.ts`: roda fora da requisição, então nenhum erro sobe (vira o último erro do canal, mensagem segura, sem token); só chat privado; comandos `/start`, `/novo` e `/reiniciar`; resposta em texto puro, com "digitando" renovado e a linha "Fontes:" só com os títulos citados; falha do provedor vira `mensagemParaVisitante`; limites por chat, por conversa e teto diário do canal respondem com frase amigável | `src/servicos/telegram-atendimento.ts:104`, `src/servicos/telegram-atendimento.ts:192`, `src/servicos/telegram-limites.ts:22`, `src/servicos/telegram-limites.ts:36` |
| Exclusão mútua por chave (FT-07, PR-68) | `src/lib/exclusao-mutua.ts`: fila de promessas por chave em memória (um chat é atendido em ordem, chats diferentes não se esperam; erro de uma tarefa não trava a próxima; a chave some quando a fila esvazia); vale por processo (PR-05) | `src/lib/exclusao-mutua.ts:13` |
| Canal novo na aba Canais (FT-07, PR-69) | lista única em `src/componentes/canais.ts` (id, título, resumo) e o cartão correspondente na página; a lógica do cartão (selo, aviso de `APP_URL`, link do bot) em módulo puro sem serviço de valor | `src/componentes/canais.ts:13`, `src/componentes/canais-logica.ts:72`, `src/componentes/CartaoTelegram.tsx:189` |

**Evidência:** `eslint.config.mjs`, `tests/camadas.test.ts`, estrutura de `src/`.

---

## 6. Padrões de código com consequência

### Sinalização de erro
Exceção tipada `ErroDeAplicacao` (status, código, mensagem segura), lançada pelas
funções de `src/lib/erros.ts` (inclusive `limiteExcedido`, 429). A ação converte em
mensagem para a tela; rastro de pilha nunca chega ao usuário (L17); erro inesperado
vira frase genérica e a tela de erro do sistema mostra só o código de correlação
(`digest`). O identificador de correlação próprio (PR-21) ainda não existe.
Falha do provedor de IA: `erroDoProvedor` (status 502, ou 504 no tempo esgotado; códigos `provedor_*`; mensagem em português sem o corpo do provedor). Ação que lida com segredo usa `mensagemSemSegredo`, que registra só o nome do erro inesperado.
**Evidência:** `src/lib/erros.ts:4`, `src/lib/erros.ts:45`, `src/app/acoes.ts:29-33`, `src/app/acoes.ts:46`, `src/app/(sistema)/error.tsx`

### Consulta SQL com texto do usuário
O texto do usuário nunca é concatenado em SQL (PR-13, PR-30). SQL cru só existe para FTS5 (migration e `prisma.$queryRaw` com template tagueado); a pergunta vira termos limpos (letras e dígitos) e só a expressão `MATCH` montada com eles e o `agenteId` vão como parâmetros. `$queryRawUnsafe` e `$executeRawUnsafe` não são usados no código de `src/` (um teste confere o módulo de recuperação, e a pergunta hostil é exercitada contra o FTS5 real).
**Evidência:** `src/servicos/recuperacao.ts:76`, `src/servicos/recuperacao-termos.ts:66`, `tests/recuperacao.test.ts`, `tests/recuperacao-termos.test.ts`

### Validação de entrada
zod, na camada de aplicação (`src/servicos`). A ação repassa a entrada bruta ao
serviço, que a valida. Exceção declarada: `exigirLimiteDeLogin` só normaliza o
e-mail para compor a chave do limite e não valida formato (a validação é de `entrar`).
**Evidência:** `src/servicos/usuarios.ts:8-27`, `src/servicos/autenticacao.ts:9-20`

### Log
`decidido_pelo_buildx` (PR-21), implementado na FT-11. Hoje existem o
`console.error` do erro inesperado em `src/app/acoes.ts:31` e, no turno de conversa, uma linha JSON com `evento`, `correlacao`, `codigo`, `agenteId` e `conversaId` (PR-42), gravada só para falha do provedor e erro inesperado (`src/servicos/chat.ts`, função `registrarErro`; `tests/chat-falhas.test.ts`). Nunca vai para o log:
senha, token, chave de API, corpo de mensagem de visitante, e-mail completo.

### Configuração e segredo
Variável de ambiente da aplicação lida em `src/lib/ambiente.ts`; obrigatória ausente
falha no start (L20); opcional tem padrão (`APP_NAME`, `TRUST_PROXY`, `OPENROUTER_BASE_URL`, `APP_URL`, `MAX_TOKENS_RESPOSTA`, esta em `src/lib/ambiente.ts:81`, e, desde a FT-04, `STORAGE_DIR` em `src/lib/ambiente.ts:88` e `MAX_UPLOAD_MB` em `src/lib/ambiente.ts:95`; desde a FT-06, `APP_URL` também tem a leitura `appUrlPublica`, sem padrão e recusando o que não é URL http(s), em `src/lib/ambiente.ts:66`, para o trecho da aba Publicar cair na origem da requisição quando ela falta); desde a FT-07, `TELEGRAM_API_BASE` (padrão `https://api.telegram.org`, `src/lib/ambiente.ts:99`) e `TELEGRAM_PERMITIR_URL_NAO_HTTPS` (desligada por padrão e sempre ignorada em produção, `src/lib/ambiente.ts:107`); `ENCRYPTION_KEY` é lida por getter e só validada quando um segredo é cifrado ou decifrado (`src/lib/ambiente.ts:45`, `src/lib/cripto.ts:29`). Exceções
declaradas: `DATABASE_URL` é lida também por `src/lib/prisma.ts:7`, `prisma/seed.ts:5` e
`prisma.config.ts` (o Prisma constrói a conexão fora do resto da aplicação), e
`NODE_ENV` pela seed (`prisma/seed.ts:28`). Segredo só em variável de ambiente,
nunca em código, artefato ou commit; o exemplo de ambiente é versionado sem valor real.
**Evidência:** `src/lib/ambiente.ts:25-43`, `tests/ambiente.test.ts`, `tests/projeto.test.ts`

### Limite de uso
Todo endpoint público e o login passam por `verificarLimite` de `src/lib/limite-de-uso.ts`
(janela deslizante em memória, relógio injetável). O login usa 5 por minuto por IP e
e-mail e 20 por minuto por IP; o IP vem de `src/lib/requisicao.ts` e só respeita
`X-Forwarded-For` com `TRUST_PROXY=1`.
O chat público (FT-06) soma ao login: por IP e agente 10 por minuto, por IP 30 por minuto, 60 mensagens por conversa e o teto diário por agente no banco, todos em `src/servicos/chat-publico-limites.ts` (linha da tabela acima). O Telegram (FT-07) soma 10 mensagens por minuto por chat (`src/servicos/telegram-limites.ts:22`), as 60 por conversa e o teto diário do canal, contado no banco com `exigirTetoDiario` parametrizado por canal (`src/servicos/chat-publico-limites.ts:75`); por IP não se aplica, porque o tráfego vem do Telegram. O limite em memória vale por processo (PR-05).
**Evidência:** `src/lib/limite-de-uso.ts:46`, `src/servicos/autenticacao.ts:31-52`, `src/app/acoes.ts:39-41`, `src/servicos/chat-publico-limites.ts:32`

### Cabeçalhos de segurança
Toda resposta leva `nosniff`, `Referrer-Policy` e `Permissions-Policy` restritiva
(`next.config.ts:4`); o `X-Frame-Options: DENY` vale para tudo menos `/embed`
(`next.config.ts:18`, `next.config.ts:25`), onde o `src/proxy.ts` define o
`frame-ancestors` do agente (FT-06, PR-59). Só o `frame-ancestors` é definido: a
política de conteúdo completa segue fora do escopo (PR-37).
**Evidência:** `next.config.ts:4-25`, `src/proxy.ts:12`, `tests/rotas.test.ts` (bloco "cabeçalhos de segurança"), `tests/embed-cabecalhos.test.ts`

### Interface
Layout de SaaS sobre tokens semânticos, tema claro e escuro (escolha salva ou
preferência do sistema, resolvido antes da pintura), gaveta abaixo de 768px, alvos de
44px, contraste 4,5:1. Toda tela que busca dado tem estados vazio, carregando e erro;
a guarda de admin fica em `layout.tsx` acima do `loading.tsx` para o redirecionamento
ser um 307 verdadeiro.
**Evidência:** `src/estilos/tokens.css`, `tests/tokens.test.ts`, `src/app/layout.tsx`, `src/app/(sistema)/configuracoes/usuarios/layout.tsx`

### Nomeação

| Elemento | Forma | Evidência |
| -------- | ----- | --------- |
| Arquivo de módulo | minúsculo com hífen em `servicos`, `lib` e para módulos que não são componente | `src/lib/limite-de-uso.ts`, `src/componentes/itens-de-menu.ts`, `src/servicos/usuarios.ts` |
| Arquivo de componente | PascalCase em `componentes` | `src/componentes/Formulario.tsx` |
| Classe / tipo | PascalCase, em português | `src/lib/erros.ts:4` (`ErroDeAplicacao`) |
| Função / método | camelCase, em português | `src/servicos/usuarios.ts:60` (`criar`), `src/lib/limite-de-uso.ts` (`verificarLimite`) |
| Variável de ambiente | MAIÚSCULAS com sublinhado; em inglês onde é padrão (`DATABASE_URL`, `TRUST_PROXY`) e em português nas próprias (`JWT_TTL_SEGUNDOS`); `APP_NAME` é exceção declarada | `.env.example`, `src/lib/ambiente.ts:34` |
| Tabela e campo do banco | modelo Prisma em português (`Usuario`), campo em camelCase | `prisma/schema.prisma:13` |
| Classe de CSS | português, minúsculo com hífen | `src/estilos/global.css` |

---

## Achados da conversão

| # | Regra do B2 | O que o código mostrou | Decisão |
| - | ----------- | ---------------------- | ------- |
| 1 | `src/lib` não importa `src/servicos` nem `next/*` | `src/lib/sessao-servidor.ts` violava (importava serviços e `next/navigation`) | o código foi corrigido (movido para `src/app`), a regra ficou; convenção de estrutura |
| 2 | Ação de formulário em `src/app/<rota>/acoes.ts` | existe um `src/app/acoes.ts` único | o código ganhou: regra reescrita |
| 3 | Variável de ambiente lida só em `src/lib/ambiente.ts` | `DATABASE_URL` e `NODE_ENV` são lidas em `src/lib/prisma.ts`, `prisma/seed.ts` e `prisma.config.ts` | o código ganhou: exceções declaradas |
| 4 | `setup` com `db push` (template) | corrigido na FT-01 para `migrate deploy` | código alinhado à convenção |
| 5 | Nome de arquivo: minúsculo com hífen em `servicos`/`lib`, PascalCase em `componentes` | `src/componentes/itens-de-menu.ts` e `iniciais.ts` não são componentes | regra refinada: PascalCase só para componente |
| 6 | Runtime "Node 22 ou superior (engine herdada do Next)" | `package.json` não declara `engines` | evidência passa a ser o CI e o README; sem `engines` (lacuna baixa) |
| 7 | Nome de teste `.test.ts` | há um `.test.tsx` (render de componentes) | regra estendida |

## Conflitos em aberto

Nenhum.

## Decisões registradas

| Data | Quem decidiu | Ponto | Decisão | Dialeto abandonado |
| ---- | ------------ | ----- | ------- | ------------------ |
| 2026-09-30 | buildx (modo autonomo) | Busca textual | FTS5 do SQLite, por SQL cru dentro de migração | banco vetorial |
| 2026-09-30 | buildx (modo autonomo) | Segundo plano | processo único, sem fila externa | Redis e BullMQ |
| 2026-09-30 | buildx (modo autonomo) | Dependências | `overrides` fixando `mysql2`, `fast-uri` e `brace-expansion` corrigidos (`package.json`, seção `overrides`), porque o template acusava 3 vulnerabilidades `high` transitivas do Prisma | template sem overrides |
| 2026-09-30 | buildx (modo autonomo) | Conversão FT-01 | achados 1 a 7 acima, decididos pelo critério "o código ganha, exceto convenção que realiza premissa de segurança" | regras do B2 contraditas pelo código |
| 2026-09-30 | buildx (modo autonomo) | Direção das camadas | imposta por lint e por teste; código ajustado, regra mantida | violação tolerada |

## Histórico de atualização

| Data | Commit | O que mudou |
| ---- | ------ | ----------- |
| 2026-09-30 | pendente | criação pelo B2 do buildx |
| 2026-09-30 | d344de3 | conversão da FT-01: `decidido_pelo_buildx` virou evidência ou achado; regra de lint das camadas, limite de uso, cabeçalhos, tokens e CI incluídos |
| 2026-09-30 | 0e0fda1 | FT-02: regras de HTTP de saída simulado, adaptador em `src/lib`, segredo cifrado e migração aditiva verificada passam a ter evidência; lacunas 5 (parte HTTP) e 9 resolvidas |
| 2026-09-30 | 2e17786 | FT-03: primeiro handler em `src/app/api` e primeiro uso de stream (lacuna 7 resolvida); leitura de SSE do navegador, texto seguro e reducer de tela; `MAX_TOKENS_RESPOSTA`; log do turno de conversa |
| 2026-09-30 | 6a6892a | FT-04: primeiro uso de `src/instrumentation.ts`, de `STORAGE_DIR` e de tarefa em segundo plano (lacunas 5 e 8 resolvidas); adaptador de extração, armazenamento e upload multipart viram regras; `MAX_UPLOAD_MB`; Next 16.3.8 |
| 2026-09-30 | 40164c4 | FT-05: primeiro SQL cru (FTS5 por migration escrita à mão, consulta `$queryRaw` parametrizada) e a regra de texto do usuário nunca concatenado em SQL; prompt com material de terceiros; evento SSE `fontes` |
| 2026-09-30 | 7b06f2d | FT-06: primeiro handler público sem sessão (lacuna resolvida), primeiro CSP dinâmico e primeiro `proxy.ts`; script de terceiros com exceção declarada à cor literal; cor do usuário com contraste; limites do chat público; `happy-dom` para teste de script; `APP_URL` com `appUrlPublica` |
| 2026-09-30 | FT-07 | FT-07: primeiro webhook de terceiro autenticado por segredo, primeiro uso de `after()`, segredo na URL do provedor com redação em ponto único, exclusão mútua por chave, simulado do Telegram (`TELEGRAM_API_BASE`) e `TELEGRAM_PERMITIR_URL_NAO_HTTPS` |
---

<!-- Lacunas: docs/stack/LACUNAS.md -->
<!-- Nenhum segredo, credencial, host real, nome de cliente ou dado pessoal neste arquivo. -->
