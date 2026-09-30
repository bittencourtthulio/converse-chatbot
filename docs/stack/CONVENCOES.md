---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: 2026-09-30
commit-referencia: pendente
projeto-legado: nao
origem-do-documento: buildx-b2
---

# Convenções técnicas — plataforma-chatbot-ia

> **Documento prescritivo do B2.** O projeto acabou de nascer e não há código de
> domínio para provar convenção. Cada regra traz a origem: `decidido_pelo_buildx`
> (decisão, sem evidência) ou uma evidência real (arquivo executado que passou).
> Na primeira feature entregue, o `stackx-detectar` converte cada `decidido_pelo_buildx`
> em evidência ou em achado.

## 1. Identidade técnica

| Item | Valor | Origem |
| ---- | ----- | ------ |
| Linguagem e versão | TypeScript 5.9.3 (faixa exata), modo estrito | `package.json`, `tsconfig.json` |
| Runtime e versão | Node.js 22 ou superior | `package.json` (engine herdada do Next 16) |
| Gerenciador de pacotes | npm 10, lock versionado | `package-lock.json` |
| Framework principal e versão | Next.js 16.3.3, App Router, React 19.2.8 | `package.json` |
| Banco | SQLite em arquivo, Prisma 7.10.0 com adaptador better-sqlite3 | `package.json`, `prisma/schema.prisma` |
| Validação de esquema | zod 4.5.4 | `package.json` |

**Evidência:** `package.json`

---

## 2. Comandos que funcionam de verdade

Todos executados no B2 e verdes.

| Alvo | Comando | Origem |
| ---- | ------- | ------ |
| Suíte inteira | `npm test` | executado no B2: 61 testes passaram |
| Um teste só | `npx vitest run tests/perfil.test.ts` | `vitest.config.ts` (include `tests/**/*.test.ts`) |
| Com cobertura | — (LACUNA) | sem provedor de cobertura instalado |
| Lint | `npm run lint` | executado no B2 |
| Formatador (verificar) | — (LACUNA) | sem formatador configurado; o ESLint é o único portão |
| Formatador (aplicar) | — (LACUNA) | idem |
| Type check | `npx tsc --noEmit` | executado no B2 |
| Build | `npm run build` (exige `DATABASE_URL` e `JWT_SECRET` no ambiente) | executado no B2 |
| Subir ambiente local | `npm run setup` e `npm run dev` | `package.json` |
| Verificar dependências | `npm audit --audit-level=high` | executado no B2: 0 vulnerabilidades |

**Evidência:** `package.json`

---

## 3. Testes

| Item | Convenção | Origem |
| ---- | --------- | ------ |
| Onde o arquivo mora | `tests/` na raiz | `vitest.config.ts` |
| Nome do arquivo | `<assunto>.test.ts`, em português | `tests/perfil.test.ts` |
| Nome do caso de teste | frase em português dizendo o comportamento (`it('recusa senha atual errada')`) | `decidido_pelo_buildx` |
| Runner e versão | Vitest 4.1.11 | `package.json` |
| Biblioteca de asserção | `expect` do Vitest | `tests/perfil.test.ts` |
| Montagem de dado | funções auxiliares em `tests/ajuda.ts` | `tests/ajuda.ts` |
| Marcação de teste lento | rotas sobem o servidor de produção em `tests/rotas.test.ts`, com `testTimeout` de 30 s | `vitest.config.ts` |
| Paralelismo do runner | `fileParallelism: false` | `vitest.config.ts` |

**Teste exemplar:** `tests/usuarios.test.ts`.

**O que se mocka e o que fica real**

| Eixo | Tratamento | Origem |
| ---- | ---------- | ------ |
| HTTP de saída (OpenRouter, Telegram, YouTube) | servidor HTTP local de teste que imita a API; a URL base vem de variável de ambiente; nunca a rede real | `decidido_pelo_buildx` (PR-26) |
| HTTP de entrada | o servidor de produção sobe em `tests/rotas.test.ts` | `tests/rotas.test.ts` |
| Relógio | injetado por parâmetro nos serviços que dependem de tempo (expurgo, limite de uso) | `decidido_pelo_buildx` |
| Sistema de arquivos | diretório temporário por teste, apontado por `STORAGE_DIR` | `decidido_pelo_buildx` |
| Serviço externo | nenhum real | `decidido_pelo_buildx` |

**Regra de TDD:** teste antes da implementação, sempre. Uma task só termina com
teste de integração e teste funcional passando.

---

## 4. Banco de dados em teste

| Item | Valor | Origem |
| ---- | ----- | ------ |
| Engine e versão exata | SQLite via better-sqlite3 (versão do lock) | `package-lock.json` |
| ORM / camada de acesso | Prisma 7.10.0; SQL cru só para FTS5 | `prisma/schema.prisma` |
| **Isolamento entre testes** | um arquivo SQLite por arquivo de teste, criado por `prisma migrate deploy` e apagado ao fim | `tests/setup.ts` |
| Combinação isolamento × paralelismo | arquivo único, `fileParallelism: false`, cada teste limpa o que criou | `vitest.config.ts` |
| Semeadura de dado de teste | funções em `tests/ajuda.ts`; a seed de demonstração não roda em teste | `tests/ajuda.ts` |
| Onde vivem as migrações | `prisma/migrations/` | `prisma/migrations` |
| Comando de rodar migração | `npm run db:migrate` (`prisma migrate deploy`) | `package.json` |
| Comando de reverter migração | — (LACUNA): o Prisma não gera reversão; toda migração destrutiva precisa de backup antes (PR-20) | `decidido_pelo_buildx` |
| Migrações têm reversão declarada? | não. Regra: migração só acrescenta (coluna nova, tabela nova); remoção exige duas migrações separadas por uma entrega | `decidido_pelo_buildx` |
| Regra do `setup` | `db push` não é usado a partir da FT-02: ele apaga as tabelas virtuais FTS5. O `setup` passa a usar `migrate deploy` | `decidido_pelo_buildx` |

**Evidência:** `tests/setup.ts`, `vitest.config.ts`

---

## 5. Estrutura e camadas

| Camada (nome no repositório) | Pasta | Pode importar de | Não importa de |
| ---------------------------- | ----- | ---------------- | -------------- |
| apresentação | `src/app`, `src/componentes`, `src/estilos` | `src/servicos`, `src/lib` (só tipos e sessão) | `src/lib/prisma` diretamente |
| aplicação | `src/servicos` | `src/lib` | `src/app`, `src/componentes`, `next/*` (exceto tipos) |
| dados e infraestrutura | `src/lib` (`prisma`, cripto, log, provedores externos) | bibliotecas | `src/app`, `src/servicos` |

**Força da evidência de dependência:** `decidido_pelo_buildx`. Nenhuma regra de
lint impõe a direção ainda. A FT-01 acrescenta uma regra de ESLint (`no-restricted-imports`)
para tornar a direção verificável.

**Onde entra código novo**

| Tipo | Pasta | Arquivo exemplar |
| ---- | ----- | ---------------- |
| Caso de uso | `src/servicos/<assunto>.ts` | `src/servicos/usuarios.ts` |
| Adaptador de serviço externo | `src/lib/<provedor>.ts` | `decidido_pelo_buildx` (ainda não existe) |
| Handler HTTP | `src/app/api/<recurso>/route.ts`, fino: valida, chama o serviço, responde | `decidido_pelo_buildx` |
| Ação de formulário | `src/app/<rota>/acoes.ts` | `src/app/acoes.ts` |
| Componente de interface | `src/componentes/<Nome>.tsx` | `src/componentes/Formulario.tsx` |
| Tarefa em segundo plano | `src/servicos/<assunto>-fila.ts`, iniciada por `src/instrumentation.ts` | `decidido_pelo_buildx` |

**Evidência:** estrutura de `src/`.

---

## 6. Padrões de código com consequência

### Sinalização de erro
Exceção tipada `ErroDeAplicacao` (status, código, mensagem segura), lançada pelas
funções de `src/lib/erros.ts`. Handler e ação convertem em resposta; rastro de pilha
nunca chega ao usuário (L17); o erro inesperado devolve um identificador de correlação.
**Evidência:** `src/lib/erros.ts`

### Validação de entrada
zod, na camada de aplicação (`src/servicos`). O handler HTTP e a ação repassam a
entrada bruta ao serviço, que a valida. Nenhum handler valida por conta própria.
**Evidência:** `src/servicos/usuarios.ts`

### Log
Log estruturado em JSON, uma linha por evento, com `nivel`, `msg`, `correlacao`.
`decidido_pelo_buildx` (PR-21), implementado na FT-11.
**Nunca vai para o log:** senha, token, chave de API, corpo de mensagem de visitante,
e-mail completo (mascarado). Redação centralizada no módulo de log.

### Configuração e segredo
Variável de ambiente lida em um ponto só, `src/lib/ambiente.ts`; obrigatória ausente
falha no start (L20). Segredo só em variável de ambiente, nunca em código, artefato
ou commit; `.env.example` versionado sem valor real.
**Evidência:** `src/lib/ambiente.ts`

### Nomeação

| Elemento | Forma | Origem |
| -------- | ----- | ------ |
| Arquivo | minúsculo com hífen em `servicos` e `lib`; PascalCase em `componentes` | `src/servicos/usuarios.ts`, `src/componentes/Formulario.tsx` |
| Classe / tipo | PascalCase, em português | `ErroDeAplicacao` |
| Função / método | camelCase, em português (`criarUsuario`) | `src/servicos/usuarios.ts` |
| Variável de ambiente | MAIÚSCULAS com sublinhado, em inglês onde já é padrão (`DATABASE_URL`) e em português nas próprias (`APP_NAME` é exceção declarada) | `.env.example` |
| Tabela e campo do banco | modelo Prisma em português (`Usuario`), campo em camelCase | `prisma/schema.prisma` |

---

## Conflitos em aberto

Nenhum.

## Decisões registradas

| Data | Quem decidiu | Ponto | Decisão | Dialeto abandonado |
| ---- | ------------ | ----- | ------- | ------------------ |
| 2026-09-30 | buildx (modo autonomo) | Busca textual | FTS5 do SQLite, por SQL cru dentro de migração | banco vetorial |
| 2026-09-30 | buildx (modo autonomo) | Segundo plano | processo único, sem fila externa | Redis e BullMQ |
| 2026-09-30 | buildx (modo autonomo) | Dependências | `overrides` fixando `mysql2`, `fast-uri` e `brace-expansion` corrigidos, porque o template acusava 3 vulnerabilidades `high` transitivas do Prisma | template sem overrides |

## Histórico de atualização

| Data | Commit | O que mudou |
| ---- | ------ | ----------- |
| 2026-09-30 | pendente | criação pelo B2 do buildx |

---

<!-- Lacunas: docs/stack/LACUNAS.md -->
<!-- Nenhum segredo, credencial, host real, nome de cliente ou dado pessoal neste arquivo. -->
