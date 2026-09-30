---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: 2026-09-30
commit-referencia: 6a6892a
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
| Paralelismo do runner | `fileParallelism: false` | `vitest.config.ts:14` |
| Testes sobre arquivos de projeto | `tests/projeto.test.ts` confere scripts, exemplo de ambiente, CI e README | `tests/projeto.test.ts` |

**Teste exemplar:** `tests/usuarios.test.ts` (serviço com banco), `tests/limite-de-uso.test.ts` (unidade com relógio injetado).

**O que se mocka e o que fica real**

| Eixo | Tratamento | Evidência |
| ---- | ---------- | --------- |
| HTTP de saída (OpenRouter, Telegram, YouTube) | servidor HTTP local de teste em porta livre, URL base por variável de ambiente (`OPENROUTER_BASE_URL`), nunca a rede real; o servidor de produção do teste de rotas também recebe a URL do servidor simulado | `tests/apoio/openrouter-falso.ts:90`, `src/lib/ambiente.ts:50`, `tests/openrouter.test.ts:22`, `tests/rotas.test.ts` (variável `falso`); Telegram e YouTube seguem `decidido_pelo_buildx` (FT-07, FT-08) |
| HTTP de entrada | o servidor de produção sobe no teste de rotas; desde a FT-04 há um apoio único para subir `next start` numa porta, herdando banco e `STORAGE_DIR` do teste, com upload multipart real por `FormData` | `tests/rotas.test.ts:59`, `tests/apoio/servidor.ts:15` |
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
| ORM / camada de acesso | Prisma 7.10.0; SQL cru só para FTS5 (ainda não existe) | `prisma/schema.prisma:13`, `package.json:22` |
| **Isolamento entre testes** | um arquivo SQLite (`prisma/test.db`) por arquivo de teste, criado por `prisma migrate deploy` e apagado ao fim | `tests/setup.ts:9,18-29,31-34` |
| Combinação isolamento × paralelismo | arquivo único, `fileParallelism: false`, cada teste limpa o que criou | `vitest.config.ts:12-14`, `tests/ajuda.ts:39` |
| Semeadura de dado de teste | funções em `tests/ajuda.ts`; a seed de demonstração só roda em teste dentro de `tests/seed.test.ts`, contra o banco de teste | `tests/ajuda.ts`, `tests/seed.test.ts` |
| Onde vivem as migrações | `prisma/migrations/` | `prisma.config.ts:9` |
| Comando de rodar migração | `npm run db:migrate` (`prisma migrate deploy`) | `package.json:13` |
| Comando de reverter migração | — (LACUNA): o Prisma não gera reversão; toda migração destrutiva precisa de backup antes (PR-20) | `decidido_pelo_buildx` |
| Migrações têm reversão declarada? | não. Regra: migração só acrescenta (coluna nova, tabela nova); `DROP TABLE` e `DROP COLUMN` só com a marca `-- destrutiva-autorizada` na própria migration, e um teste lê o SQL de todas as migrations | `tests/migracoes.test.ts:14`; as três migrations (`prisma/migrations/20260830193658_esquema_inicial`, `20260930145651_configuracao_do_workspace`, `20260930150122_agentes`) só criam tabela |
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
| Resposta em stream (SSE) | o serviço devolve um `AsyncGenerator` de eventos tipados e não conhece HTTP; a rota o converte com `fluxoDeEventos` (`event:` + `data:` em JSON, cancelar a leitura aborta o gerador) e cabeçalhos `text/event-stream`, `Cache-Control: no-store` e `X-Accel-Buffering: no`; o navegador lê com `lerEventos`, em módulo puro, sem `fetch`; o `fetch` mora só em componente cliente de `src/componentes` (`'use client'`: o de conversa e, desde a FT-04, os da aba Conhecimento) | `src/servicos/chat.ts:82`, `src/app/eventos-sse.ts:10,29`, `src/componentes/leitor-de-sse.ts:62`, `src/componentes/ChatDeTeste.tsx`, `tests/eventos-sse.test.ts`, `tests/leitor-de-sse.test.ts` |
| Texto de origem não confiável na tela | analisador puro para uma árvore mínima (parágrafo, lista, código, negrito, link http/https) e componente que a vira em elementos React; nunca `dangerouslySetInnerHTML` (o único uso é o script constante do tema em `src/app/layout.tsx`) | `src/componentes/texto-seguro.ts:59`, `src/componentes/TextoDoModelo.tsx`, `tests/texto-seguro.test.tsx` |
| Lógica de tela sem navegador | estado como reducer puro e regras de teclado em módulo próprio; o componente só liga ao DOM e à rede (o ambiente de teste é `node`, sem jsdom) | `src/componentes/estado-da-conversa.ts:68`, `tests/estado-da-conversa.test.ts` |
| Ação de formulário | `src/app/acoes.ts` (um arquivo para o sistema) | `src/app/acoes.ts:35` |
| Guarda de sessão e papel | `src/app/sessao-servidor.ts` | `src/app/sessao-servidor.ts` |
| Componente de interface | `src/componentes/<Nome>.tsx`, PascalCase | `src/componentes/Formulario.tsx` |
| Item de menu | lista única em `src/componentes/itens-de-menu.ts` | `src/componentes/itens-de-menu.ts:37` |
| Aba da página de um agente | lista única em `src/componentes/abas-do-agente.ts`; a subrota mora em `src/app/(sistema)/agentes/[id]/<caminho>` | `src/componentes/abas-do-agente.ts:12` |
| Cor, sombra, raio, fonte | tokens em `src/estilos/tokens.css`; nenhum valor literal fora dele | `tests/tokens.test.ts` |
| Tarefa em segundo plano | `src/servicos/<assunto>-fila.ts`: estado no banco, reivindicação atômica por `updateMany` condicional, concorrência injetável, `processarPendentes()` aguardável para teste, relógio e armazenamento injetáveis, singleton em `globalThis`; iniciada por `src/instrumentation.ts` (só runtime Node, import dinâmico, sem esperar o processamento); `acordar()` só age depois de `iniciar()`, por isso o teste de serviço controla a fila | `src/servicos/fontes-fila.ts:53`, `src/servicos/fontes-fila.ts:214`, `src/instrumentation.ts:6`, `tests/fontes-fila-execucao.test.ts` |
| Armazenamento de arquivos | `src/lib/armazenamento.ts`: `criarArmazenamento(raiz)` grava em `<raiz>/fontes/<agenteId>/<fonteId>/original`; só ids gerados pelo servidor entram no caminho (alfabeto fechado) e o caminho final é conferido dentro da raiz; sem import com alias `@/` (a seed o usa); a raiz do ambiente vem de `ambiente.storageDir`, e o `path.resolve` de tempo de execução leva `turbopackIgnore` para o build não rastrear o projeto inteiro | `src/lib/armazenamento.ts:9`, `src/lib/armazenamento.ts:10`, `src/lib/armazenamento.ts:30`, `src/lib/ambiente.ts:69`, `src/lib/ambiente.ts:73` |
| Extração de texto de arquivo | adaptador por formato em `src/lib/extracao/`, atrás de uma fachada `extrairTexto` que limita texto e prazo e converte qualquer exceção de biblioteca em `ErroDeAplicacao` sem repassar a mensagem dela; conferência do conteúdo real em `validarConteudo`; o ZIP do DOCX é lido à mão e descompactado com teto | `src/lib/extracao/index.ts:51`, `src/lib/extracao/index.ts:45`, `src/lib/extracao/zip.ts:31` |
| Upload multipart | handler fino: sessão, tipo de conteúdo (415), teto por `Content-Length` antes de ler o corpo (413) e conferência do tamanho real depois; um resultado por arquivo vem do serviço; no navegador, um `XMLHttpRequest` por arquivo dá progresso | `src/app/api/agentes/[id]/fontes/route.ts:26`, `src/app/api/agentes/[id]/fontes/route.ts:35`, `src/app/api/agentes/[id]/fontes/route.ts:44`, `src/componentes/enviar-arquivo.ts:34` |
| Opção de adicionar fonte | lista única em `src/componentes/opcoes-de-fonte.ts` e o painel de cada opção em `PAINEIS` de `AdicionarFontes`; a FT-08 acrescenta vídeo nos dois | `src/componentes/opcoes-de-fonte.ts:13`, `src/componentes/AdicionarFontes.tsx:17` |

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
falha no start (L20); opcional tem padrão (`APP_NAME`, `TRUST_PROXY`, `OPENROUTER_BASE_URL`, `APP_URL`, `MAX_TOKENS_RESPOSTA`, esta em `src/lib/ambiente.ts:60`, e, desde a FT-04, `STORAGE_DIR` em `src/lib/ambiente.ts:69` e `MAX_UPLOAD_MB` em `src/lib/ambiente.ts:76`); `ENCRYPTION_KEY` é lida por getter e só validada quando um segredo é cifrado ou decifrado (`src/lib/ambiente.ts:45`, `src/lib/cripto.ts:29`). Exceções
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
**Evidência:** `src/lib/limite-de-uso.ts:46`, `src/servicos/autenticacao.ts:31-52`, `src/app/acoes.ts:39-41`

### Cabeçalhos de segurança
Toda resposta leva `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY` e
`Permissions-Policy` restritiva; a FT-06 sobrescreve o `X-Frame-Options` na rota do chat.
**Evidência:** `next.config.ts:5-18`, `tests/rotas.test.ts` (bloco "cabeçalhos de segurança")

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
---

<!-- Lacunas: docs/stack/LACUNAS.md -->
<!-- Nenhum segredo, credencial, host real, nome de cliente ou dado pessoal neste arquivo. -->
