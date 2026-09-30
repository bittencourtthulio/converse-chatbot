---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: 2026-09-30
commit-referencia: d344de3
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
| Framework principal e versão | Next.js 16.3.3, App Router, React 19.2.8 | `package.json:26-27` |
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
| HTTP de saída (OpenRouter, Telegram, YouTube) | servidor HTTP local de teste, URL base por variável de ambiente, nunca a rede real. Ainda não há chamada externa | `decidido_pelo_buildx` (PR-26); passa a valer na FT-02 |
| HTTP de entrada | o servidor de produção sobe no teste de rotas | `tests/rotas.test.ts:59` |
| Relógio | injetado por parâmetro: `criarLimitador(relogio)`; o limite de login recebe o limitador | `src/lib/limite-de-uso.ts:46`, `src/servicos/autenticacao.ts:36-40`, `tests/limite-de-login.test.ts` |
| Sistema de arquivos | diretório temporário por teste, apontado por `STORAGE_DIR`. Ainda não há armazenamento | `decidido_pelo_buildx`; passa a valer na FT-04 |
| Serviço externo | nenhum real (nenhum existe ainda) | `decidido_pelo_buildx` (PR-26) |

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
| Migrações têm reversão declarada? | não. Regra: migração só acrescenta (coluna nova, tabela nova); remoção exige duas migrações separadas por uma entrega | `decidido_pelo_buildx`; há uma só migração (`prisma/migrations/20260830193658_esquema_inicial`) e nada a contradiz |
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
| Adaptador de serviço externo | `src/lib/<provedor>.ts` | `decidido_pelo_buildx` (ainda não existe; FT-02) |
| Módulo de infraestrutura reutilizável | `src/lib/<nome>.ts` | `src/lib/limite-de-uso.ts` |
| Handler HTTP | `src/app/api/<recurso>/route.ts`, fino: valida no serviço, responde | `decidido_pelo_buildx` (ainda não existe; FT-06) |
| Ação de formulário | `src/app/acoes.ts` (um arquivo para o sistema) | `src/app/acoes.ts:35` |
| Guarda de sessão e papel | `src/app/sessao-servidor.ts` | `src/app/sessao-servidor.ts` |
| Componente de interface | `src/componentes/<Nome>.tsx`, PascalCase | `src/componentes/Formulario.tsx` |
| Item de menu | lista única em `src/componentes/itens-de-menu.ts` | `src/componentes/itens-de-menu.ts:35` |
| Cor, sombra, raio, fonte | tokens em `src/estilos/tokens.css`; nenhum valor literal fora dele | `tests/tokens.test.ts` |
| Tarefa em segundo plano | `src/servicos/<assunto>-fila.ts`, iniciada por `src/instrumentation.ts` | `decidido_pelo_buildx` (ainda não existe; FT-04) |

**Evidência:** `eslint.config.mjs`, `tests/camadas.test.ts`, estrutura de `src/`.

---

## 6. Padrões de código com consequência

### Sinalização de erro
Exceção tipada `ErroDeAplicacao` (status, código, mensagem segura), lançada pelas
funções de `src/lib/erros.ts` (inclusive `limiteExcedido`, 429). A ação converte em
mensagem para a tela; rastro de pilha nunca chega ao usuário (L17); erro inesperado
vira frase genérica e a tela de erro do sistema mostra só o código de correlação
(`digest`). O identificador de correlação próprio (PR-21) ainda não existe.
**Evidência:** `src/lib/erros.ts:4`, `src/app/acoes.ts:29-33`, `src/app/(sistema)/error.tsx`

### Validação de entrada
zod, na camada de aplicação (`src/servicos`). A ação repassa a entrada bruta ao
serviço, que a valida. Exceção declarada: `exigirLimiteDeLogin` só normaliza o
e-mail para compor a chave do limite e não valida formato (a validação é de `entrar`).
**Evidência:** `src/servicos/usuarios.ts:8-27`, `src/servicos/autenticacao.ts:9-20`

### Log
`decidido_pelo_buildx` (PR-21), implementado na FT-11. Hoje só existe
`console.error` do erro inesperado em `src/app/acoes.ts:31`. Nunca vai para o log:
senha, token, chave de API, corpo de mensagem de visitante, e-mail completo.

### Configuração e segredo
Variável de ambiente da aplicação lida em `src/lib/ambiente.ts`; obrigatória ausente
falha no start (L20); opcional tem padrão (`APP_NAME`, `TRUST_PROXY`). Exceções
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

---

<!-- Lacunas: docs/stack/LACUNAS.md -->
<!-- Nenhum segredo, credencial, host real, nome de cliente ou dado pessoal neste arquivo. -->
