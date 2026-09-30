# Etapa 1 — Detecção

Você vai varrer o repositório e sair com um inventário de evidência. Não escreva
o CONVENCOES.md aqui: esta etapa só coleta. Escrever é a Etapa 2.

## Delegue ao agente `cartografo`

Esta etapa **roda no agente `cartografo`**, não no contexto principal.

A detecção lê muito — manifestos, configuração, todos os testes existentes,
migrações, estrutura, histórico. Em contexto próprio, isso não consome o contexto
de quem depois vai planejar. O agente devolve o inventário; quem o chamou escreve
o arquivo.

```
Agent(subagent_type="cartografo",
      prompt="Rode a Etapa 1 do stackx neste repositório. Devolva o inventário
              FATO / EVIDÊNCIA / FORÇA no formato de 01-deteccao.md.")
```

O agente tem leitura, busca e histórico do versionador, e **não escreve fora de
`docs/stack/`** — na prática, não escreve arquivo nenhum nesta etapa.

O resto deste arquivo é a especificação que o `cartografo` segue. Leia-o também
quando for consumir o inventário: é ele que define o que cada campo significa.

> Sem o agente disponível (harness que não os suporte), execute o roteiro abaixo
> no contexto principal. O resultado é o mesmo; o custo de contexto, não.

## Pré-requisitos verificáveis

Antes de começar, confirme e anote:

```bash
# 1. Estou na raiz de um repositório?
ls -a | grep -E '^\.git$' && echo "git: sim" || echo "git: NÃO"

# 2. Já existe CONVENCOES.md? (então isto é atualização, Etapa 5)
test -f docs/stack/CONVENCOES.md && echo "JÁ EXISTE — vá para a Etapa 5"

# 3. É projeto legado?
test -f docs/legado/PERFIL.md && echo "LEGADO — regra de precedência ativa"
```

Se não houver `.git`, siga assim mesmo, mas registre em LACUNAS que a análise de
histórico (qual dialeto é mais recente) não foi possível — isso rebaixa qualquer
conflito para "conflito sem datação", e a pergunta ao usuário fica obrigatória
sem sugestão de ordem.

Se `docs/legado/PERFIL.md` existir, tudo que você descobrir vale como convenção
**para código novo em arquivo novo**. Anote isso no cabeçalho do inventário.

## Regra que vale para a varredura inteira

Você está procurando **o que o repositório faz**, não o que seria bom que ele
fizesse. Toda anotação do inventário tem três campos obrigatórios:

```
FATO      : o que foi observado
EVIDÊNCIA : caminho:linha (um ou mais)
FORÇA     : UNÂNIME | MAJORITÁRIO n/m | CONFLITO | ÚNICO CASO | AUSENTE
```

Sem `EVIDÊNCIA`, o fato não entra no inventário — vira lacuna.

`FORÇA` decide o destino na Etapa 2:

| Força | Destino |
| ----- | ------- |
| UNÂNIME | convenção |
| MAJORITÁRIO com minoria trivial (< 10% e sem sinal de recência) | convenção, com nota da exceção |
| MAJORITÁRIO com minoria relevante | **CONFLITO** → Etapa 3, pergunta |
| CONFLITO | **CONFLITO** → Etapa 3, pergunta |
| ÚNICO CASO | convenção fraca — declare "um único exemplo" na evidência |
| AUSENTE | LACUNA → Etapa 3, e no máximo PROPOSTA |

## Ordem de leitura das fontes

A ordem importa: cada fonte estreita o espaço de busca da seguinte.

### 1. Manifestos de dependência e locks

Procure, na raiz e em subpastas de workspace/monorepo:

```bash
find . -maxdepth 3 \
  \( -path ./node_modules -o -path ./.git -o -path ./vendor -o -path ./target \
     -o -path ./dist -o -path ./build -o -path './.venv' \) -prune -o \
  -type f \( \
    -name 'package.json' -o -name 'pnpm-workspace.yaml' -o -name 'deno.json' \
    -o -name 'pyproject.toml' -o -name 'setup.cfg' -o -name 'requirements*.txt' \
    -o -name 'Gemfile' -o -name 'composer.json' -o -name 'go.mod' \
    -o -name 'Cargo.toml' -o -name 'pom.xml' -o -name 'build.gradle*' \
    -o -name '*.csproj' -o -name 'mix.exs' -o -name 'pubspec.yaml' \
  \) -print
```

E os locks correspondentes (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`,
`bun.lockb`, `poetry.lock`, `uv.lock`, `Gemfile.lock`, `composer.lock`,
`go.sum`, `Cargo.lock`).

Extraia:

- **Linguagem e versão exigida.** Campo `engines`, `requires-python`,
  `go 1.x`, `rust-version`, `<java.version>`, `elixir`. Se houver
  `.nvmrc`/`.node-version`/`.python-version`/`.tool-versions`/`.mise.toml`,
  esses **vencem** o manifesto — são o que a máquina realmente usa.
- **Gerenciador de pacotes.** Decida pelo lock presente, não pelo README. Campo
  `packageManager` no `package.json` vence tudo. Dois locks diferentes na mesma
  pasta é CONFLITO, e um dos mais caros — registre.
- **Framework principal e versão.** A dependência de produção que estrutura a
  aplicação (não a maior, a que define o formato do código).
- **Runner de teste, ORM/driver de banco, lint, formatador, type checker.** Só
  o que está declarado como dependência. Nada inferido.
- **Scripts declarados.** `scripts` do `package.json`, `[tool.poetry.scripts]`,
  alvos de `Makefile`/`Taskfile.yml`/`justfile`, `mix.exs` aliases,
  `Cargo` aliases em `.cargo/config.toml`.

> Registre a versão **exata resolvida no lock**, não a faixa do manifesto. Os
> cartuchos dependem de versão exata para valer alguma coisa. `^15.2` no
> manifesto e `15.7.1` no lock: escreva `15.7.1 (faixa ^15.2)`.

### 2. Configuração de runner, lint, formatador, type checker e build

```bash
ls -a | grep -Ei '^\.?(jest|vitest|playwright|cypress|karma|mocharc|pytest|tox|nox|phpunit|rspec|eslint|biome|oxlint|prettier|editorconfig|ruff|flake8|black|isort|mypy|pyright|rubocop|golangci|clippy|swiftlint|tsconfig|jsconfig|babel|vite|webpack|rollup|esbuild|turbo|nx|dockerfile|docker-compose|compose)'
find . -maxdepth 2 -name 'tsconfig*.json' -o -maxdepth 2 -name '*.config.*' | grep -v node_modules
```

O que interessa em cada um:

- **Runner**: `testMatch`/`testRegex`/`include`/`testpaths`/`spec_dir` — é daqui
  que sai a resposta "onde o teste mora e como se chama", e ela vale mais que a
  sua leitura dos arquivos, porque é a regra que a máquina aplica. Também:
  `setupFiles`/`setupFilesAfterEnv`/`conftest.py`/`spec_helper.rb`/`globalSetup`
  — o setup global é onde mora o isolamento de banco e o congelamento de relógio.
  E: `maxWorkers`/`--parallel`/`-n auto`/`workers` — paralelismo, que o cartucho
  de teste instável precisa saber.
- **Lint/formatador**: as regras **ligadas explicitamente** são convenção
  declarada e valem tanto quanto código. Uma regra de fronteira de import
  (`import/no-restricted-paths`, `boundaries/*`, `ruff` `TID251`,
  `depguard`, ArchUnit) é a melhor evidência possível de "quem pode chamar quem" —
  procure por ela antes de tentar deduzir camadas dos imports.
- **Type checker**: `strict`, `paths` (aliases de import — isso muda como se
  escreve todo import novo), `exclude`.
- **Build**: entrada, saída, alvo.

### 3. Os testes que já existem — a fonte mais rica

Esta é a parte que separa uma varredura útil de uma listagem inútil. **Não liste
os testes: extraia o padrão deles.**

Primeiro, localize e conte:

```bash
# ajuste as extensões à linguagem detectada na fonte 1
find . \( -path ./node_modules -o -path ./.git -o -path ./vendor -o -path ./dist \) -prune -o \
  -type f \( -name '*test*' -o -name '*spec*' -o -name '*_test.*' -o -name 'test_*' \) -print \
  | grep -vE 'node_modules|/dist/|/build/' | sort
```

Agora responda cada pergunta abaixo **contando arquivos**, não olhando um só.

**a) Onde o teste mora — ao lado do código ou em pasta própria?**

```bash
# quantos testes têm um irmão de mesmo nome sem o sufixo de teste (co-localizado)
# vs. quantos vivem sob tests/ spec/ __tests__/ test/
```
Conte os dois grupos. Se os dois números forem relevantes, é CONFLITO — e é o
conflito mais comum que existe. Não decida.

**b) Como se nomeia o arquivo?**
`x.test.ts` × `x.spec.ts` × `test_x.py` × `x_test.go` × `XTest.java`. Conte cada
forma. Cruze com a config do runner: uma forma que a config **não** casa é teste
morto — reporte separadamente, é achado valioso.

**c) Como se nomeia o caso de teste?**
Extraia os títulos e olhe a forma, não o conteúdo:

```bash
grep -rhoE "(it|test|describe|context)\(\s*['\"\`][^'\"\`]{0,90}" --include='*test*' --include='*spec*' . \
  | grep -v node_modules | sed -E "s/.*['\"\`]//" | sort | uniq -c | sort -rn | head -40
```
Procure o padrão: começa com "should"? verbo no infinitivo? frase em português?
`deve …`? snake_case descritivo (`test_creates_user_when_email_is_unique`)?
Given/When/Then? Registre a forma dominante **com três exemplos reais citados**.

**d) Estrutura típica de um teste.**
Abra de 3 a 5 testes de módulos diferentes, preferindo os mais recentes
(veja a fonte 8). Anote: há `describe`/`context` aninhado? Arrange-Act-Assert
separado por linha em branco? Um assert por caso ou vários? Setup em
`beforeEach` ou dentro do caso? Cite **um teste inteiro como exemplar** — o
CONVENCOES.md vai apontar para ele, e as outras skills vão copiar a forma dele.

**e) Factory, fixture literal, builder, ou nada disso.**

```bash
grep -rlE "factory|Factory|fixture|@pytest\.fixture|FactoryBot|faker|Faker|build\(|make\(|create\(" \
  --include='*test*' --include='*spec*' . | grep -v node_modules | head
```
Procure também um diretório dedicado (`test/factories`, `spec/factories`,
`tests/fixtures`, `conftest.py`, `*.fixtures.*`). Se existir factory mas metade
dos testes montar objeto literal na mão, isso é CONFLITO.

**f) O que se mocka e o que se deixa real.**
Cheque cada eixo separadamente, porque a resposta costuma ser diferente por eixo:

| Eixo | Procure por |
| ---- | ----------- |
| HTTP de saída | `nock`, `msw`, `responses`, `vcr`, `webmock`, `httpretty`, `WireMock`, `respx` |
| HTTP de entrada | `supertest`, `TestClient`, `request_spec`, `MockMvc`, `httptest` |
| Relógio | `useFakeTimers`, `freeze_time`, `timecop`, `Clock` injetado, `sinon.useFakeTimers` |
| Sistema de arquivos | `memfs`, `tmpdir`, `tmp_path`, `mock_fs` |
| Fila / mensageria | driver `sync`/`inline`, fake in-memory, container |
| Serviço externo | stub próprio, container (`testcontainers`), sandbox real |

Ausência também é fato: se ninguém mocka relógio e há teste dependente de data,
isso vira achado para o cartucho de teste instável.

**g) Como se marca teste lento ou de integração.**
Tag (`@pytest.mark.slow`, `describe.concurrent`, `tags: ['integration']`),
sufixo de arquivo (`*.integration.test.ts`), pasta separada, ou projeto/suite
separado na config do runner. Cruze com o CI (fonte 6): se o CI roda duas
invocações diferentes do runner, a separação é real e a evidência é o workflow.

### 4. Migrações e schema de banco

```bash
find . -type d \( -name 'migrations' -o -name 'migrate' -o -name 'db' \
  -o -name 'priv' -o -name 'alembic' \) -not -path '*/node_modules/*' | head
find . -type f \( -name 'schema.prisma' -o -name 'schema.rb' -o -name 'structure.sql' \
  -o -name 'schema.sql' -o -name 'alembic.ini' -o -name '*.dbml' \) -not -path '*/node_modules/*'
```

Extraia:

- **Engine e versão.** A versão vem de `docker-compose.yml`
  (`image: postgres:16.4`), do CI (`services:`), ou do provisionamento. **Não
  aceite "postgres" sem número** — o cartucho de migração é inútil sem a versão.
  Se só houver `postgres` sem tag, registre como lacuna de versão.
- **ORM / camada de acesso** e sua versão exata do lock.
- **Onde vivem as migrações**, o formato do nome (timestamp? sequencial?), e se
  há reversão declarada (`down`, `downgrade`, método `change` reversível). Um
  histórico onde metade das migrações não tem `down` é achado relevante para o
  cartucho de migração.
- **Comando de rodar e reverter migração** — do manifesto/scripts, nunca inventado.

**Como o banco é isolado entre testes** — esta é a pergunta mais cara de errar,
e a resposta quase nunca está num só lugar. Procure no setup global do runner
(fonte 2) e nos helpers de teste:

| Estratégia | Sinal no código |
| ---------- | --------------- |
| Transação com rollback | `BEGIN`/`ROLLBACK` em `beforeEach`/`afterEach`, `use_transactional_fixtures`, `pytest-django` `db`, `$transaction` envolvendo o caso |
| Truncate | `TRUNCATE ... RESTART IDENTITY CASCADE`, `DatabaseCleaner` com `:truncation`, `deleteMany()` em loop de tabelas |
| Banco por worker | nome do banco derivado de `JEST_WORKER_ID`, `PYTEST_XDIST_WORKER`, `TEST_ENV_NUMBER` |
| Container efêmero | `testcontainers`, `docker compose up` no globalSetup |
| Em memória | `sqlite::memory:`, `:memory:`, fake repository |
| Nenhuma | nada disso, e os testes tocam banco → **achado grave**, vira lacuna com impacto alto |

Cruze com o paralelismo (fonte 2): transação com rollback + paralelismo por
processo funciona; truncate + paralelismo sem banco por worker é fonte garantida
de teste instável. Anote a combinação encontrada, ela alimenta o cartucho 3.

**Como se semeia dado de teste**: seed global (`seeds/`, `db/seeds.rb`), factory
por caso, fixture carregada, ou nada.

### 5. Scripts declarados nos manifestos

Já lidos na fonte 1 — agora **classifique** cada um nos alvos que o CONVENCOES.md
exige:

| Alvo | Como reconhecer |
| ---- | --------------- |
| suíte inteira | script que invoca o runner sem filtro |
| um teste só | forma de passar caminho/filtro ao runner — derive da invocação do script, não do nome do runner |
| com cobertura | `--coverage`, `--cov`, `-cover`, `simplecov` |
| lint | invoca o linter detectado |
| formatador | `--check` × `--write` — registre os dois se existirem |
| type check | `tsc --noEmit`, `mypy`, `pyright` |
| build | invoca o bundler/compilador |
| subir ambiente local | `dev`, `start`, `docker compose up`, `Procfile` |

**Regra 5 (inviolável) aplicada aqui**: se um alvo não tem script, não tem linha
de CI e não tem alvo de Makefile, ele **não vai** para o CONVENCOES.md como
comando. Vai para LACUNAS. Não escreva o comando "padrão" do framework.

Se o script existir mas você quiser confirmar que funciona, prefira rodar o mais
barato e não-destrutivo (type check, lint `--check`). **Nunca** rode migração,
seed, build de produção, deploy ou qualquer script que escreva em banco durante a
detecção.

### 6. Integração contínua

```bash
ls .github/workflows/ .gitlab-ci.yml .circleci/ Jenkinsfile azure-pipelines.yml 2>/dev/null
```

O CI é a **fonte mais confiável de comando que funciona de verdade**: é o que
roda numa máquina limpa. Extraia, na ordem exata do workflow: setup de versão
(`actions/setup-node` com `node-version` é evidência de versão melhor que o
manifesto), instalação, e cada comando de verificação. Anote os `services:` —
é aí que costuma estar a versão da engine de banco. Anote também o que roda em
PR × o que roda em main: um comando que só roda em main é um portão mais fraco.

Conflito entre script do manifesto e comando do CI: o **CI vence** para "comando
que funciona", e a divergência em si é um achado a registrar.

### 7. Arquivos de ambiente de exemplo

```bash
ls -a | grep -Ei '\.env(\.|$)|env\.example|\.envrc'
```

Leia **só as chaves**, nunca os valores. **Regra 10 (inviolável): nenhum valor de
`.env` entra em lugar nenhum**, mesmo que pareça inócuo, mesmo de `.env.example`.
Extraia: convenção de nomeação das variáveis (prefixo? `SCREAMING_SNAKE`?
agrupamento por serviço?), quais são obrigatórias, e como o código as lê —
acesso direto ao ambiente espalhado, ou um módulo de config centralizado com
validação de esquema? A segunda forma é convenção forte; procure por ela:

```bash
grep -rlE "process\.env|os\.environ|ENV\[|getenv|Deno\.env" --include='*.*' src app lib 2>/dev/null \
  | grep -v node_modules | head -20
```
Se todos os acessos estiverem em um ou dois arquivos, a convenção é "config
centralizada, ninguém lê ambiente direto" — e isso é uma das regras mais úteis
que o CONVENCOES.md pode carregar.

### 8. O próprio código — estrutura, imports, camadas

Primeiro o mapa:

```bash
find . -maxdepth 3 -type d \
  \( -path ./node_modules -o -path ./.git -o -path ./dist -o -path ./build \
     -o -path ./vendor -o -path './.venv' \) -prune -o -type d -print | sort
# densidade: onde o código realmente vive
find src app lib -type f 2>/dev/null | grep -v node_modules | sed -E 's|/[^/]+$||' | sort | uniq -c | sort -rn | head -25
```

**Nomeie as camadas pelo que elas são no repositório**, não pelo vocabulário de
arquitetura que você conhece. Se as pastas são `handlers/`, `services/`,
`repositories/`, escreva esses nomes — não traduza para "controller, use case,
gateway".

**Quem pode chamar quem.** Ordem de confiança da evidência:

1. Regra de lint de fronteira (fonte 2) — é a resposta declarada, use-a.
2. Se não houver regra, meça os imports reais:

```bash
# para cada camada, o que ela importa das outras
grep -rhoE "from ['\"][^'\"]+['\"]|require\(['\"][^'\"]+['\"]\)|^import [a-z0-9_.]+" src/<camada> \
  | sort | uniq -c | sort -rn | head -30
```
Uma direção com zero ocorrência entre duas camadas que se tocam é evidência de
dependência proibida — **mas declare a força**: "nenhum dos 41 arquivos de
`domain/` importa de `infra/`" é forte; "nenhum dos 2 importa" não é.
Uma direção com pouquíssimas ocorrências contra muitas na direção oposta é
**violação existente**, não convenção — registre como achado, não como regra.

**Onde entra código novo de cada tipo.** Para cada tipo (caso de uso, adaptador,
controlador, componente de interface, job), aponte a pasta e **um arquivo
exemplar recente**. O exemplar é o que as outras skills vão imitar.

**Padrões de código com consequência** — cheque cada um contando ocorrências:

| Ponto | Procure |
| ----- | ------- |
| Sinalização de erro | `throw`/`raise` × retorno tipado (`Result`, `Either`, `(val, err)`) × objeto `{ ok, error }`. Conte os três. Classes de erro próprias? Há uma base comum? Onde o erro vira resposta HTTP — handler central ou try/catch espalhado? |
| Validação de entrada | biblioteca de esquema (zod, pydantic, joi, dry-validation, class-validator) × validação manual. **Em que camada** — na borda (controller/handler) ou no domínio? Conte onde os esquemas são declarados. |
| Log | biblioteca (pino, winston, structlog, logrus) × `console`/`print`. Estruturado com campos ou string? Há correlação de requisição? **O que nunca vai para o log**: procure máscara/redaction na config do logger, e liste os campos redigidos. Se não houver redaction, isso é lacuna com impacto de segurança. |
| Configuração e segredo | ver fonte 7. Segredo vem de ambiente, de cofre, ou de arquivo? |
| Nomeação | conte a forma real dos nomes de arquivo (`kebab-case` × `snake_case` × `PascalCase`), de classe, de função, e de variável de ambiente. Uma contagem por pasta, porque frequentemente difere entre camadas — e diferença por camada é convenção, não conflito, se for consistente dentro de cada uma. |

### 9. Histórico do versionador — qual dialeto é o mais recente

Faça isto **depois** de ter os candidatos, e faça para **cada conflito
encontrado**. É o insumo que torna a pergunta da Etapa 3 útil.

```bash
# data do último toque em cada arquivo de um grupo
for f in <arquivos do dialeto A>; do
  echo "$(git log -1 --format=%ad --date=short -- "$f")  $f"
done | sort

# quando cada dialeto nasceu (primeiro arquivo criado com aquele padrão)
git log --diff-filter=A --format='%ad %H' --date=short -- '<glob do dialeto>' | tail -1

# o dialeto A ainda recebe arquivo novo? (últimos 6 meses)
git log --diff-filter=A --since='6 months ago' --name-only --format='' -- '<glob>' | sort -u | head
```

Para cada dialeto registre: **quantos arquivos**, **onde vivem**, **nascido em**,
**último arquivo novo em**, **último toque em**. É exatamente isso que a Etapa 3
apresenta ao usuário.

> Um dialeto majoritário que não recebe arquivo novo há um ano, contra um
> minoritário que concentra os arquivos dos últimos três meses, é o caso clássico
> em que o majoritário é o legado. **Você ainda assim não decide** — mas
> apresenta os dois com essas datas, que é o que permite ao usuário decidir em
> cinco segundos.

Sem `.git`, use `stat`/mtime como aproximação **declarada como fraca**, ou pule.

## Formato exato da saída desta etapa

Um inventário em memória (ou em nota de trabalho), organizado nas seis seções que
a Etapa 2 vai consumir, cada fato no formato FATO/EVIDÊNCIA/FORÇA:

```
## IDENTIDADE
FATO      : TypeScript 5.6.3, Node 20.11 (.nvmrc), pnpm 9.12.0 (packageManager)
EVIDÊNCIA : package.json:4, .nvmrc:1, pnpm-lock.yaml:1
FORÇA     : UNÂNIME

## COMANDOS
FATO      : suíte inteira = `pnpm test`
EVIDÊNCIA : package.json:11, .github/workflows/ci.yml:31
FORÇA     : UNÂNIME
FATO      : build local não tem script declarado
EVIDÊNCIA : —
FORÇA     : AUSENTE            → LACUNA

## TESTES
## BANCO EM TESTE
## ESTRUTURA E CAMADAS
## PADRÕES DE CÓDIGO

## CONFLITOS ENCONTRADOS
CONFLITO  : local do arquivo de teste
  dialeto A: co-localizado, 34 arquivos, src/**, nascido 2022-03, último novo 2024-01, último toque 2024-06
  dialeto B: tests/ espelhado, 9 arquivos, tests/**, nascido 2025-02, último novo 2025-08, último toque 2025-08

## LACUNAS ENCONTRADAS
LACUNA    : comando de build
IMPACTO   : task que exige build não sabe o que rodar
```

## Critério de saída

A Etapa 1 termina quando **todas** valem:

- [ ] As 8 fontes foram visitadas, ou a ausência de cada uma foi registrada.
- [ ] Todo fato do inventário tem `EVIDÊNCIA` com caminho **e** linha, ou está
      marcado `AUSENTE`.
- [ ] Nenhuma versão foi escrita como faixa quando o lock tinha a exata.
- [ ] Todo comando anotado veio de manifesto, script, Makefile ou CI — nenhum
      inferido do nome do framework.
- [ ] Cada conflito tem contagem, localização e as três datas do histórico.
- [ ] Nenhum valor de variável de ambiente, credencial ou dado de cliente foi
      copiado para o inventário.

## Quando o critério não é atendido

| Situação | O que fazer |
| -------- | ----------- |
| Repositório vazio ou só com README | Pare. Não gere CONVENCOES.md. Diga que não há evidência e ofereça registrar as decisões iniciais como PROPOSTA num arquivo de partida. |
| Nenhum teste no repositório | Não invente a seção de testes. Ela sai **inteira** como PROPOSTA no CONVENCOES.md e como LACUNA de impacto alto. Ver `03-conflito-e-lacuna.md`. |
| Monorepo com pacotes de stacks diferentes | Não force uma convenção única. Gere uma seção de identidade/comandos/testes **por pacote**, e uma seção "comum a todos" só com o que for de fato comum. Se os pacotes divergirem no essencial, isso é estrutura, não conflito — não pergunte, documente os dois. |
| Fonte ilegível (lock binário, config gerada) | Registre como não lida e siga. Não adivinhe o conteúdo. |
| Contagens empatadas ou quase (45% × 55%) | É CONFLITO. Nunca resolva por maioria apertada. |
| Sem `.git` | Conflitos ficam sem datação; a pergunta da Etapa 3 vai sem sugestão de ordem. Registre a limitação no CONVENCOES.md. |

Concluída a detecção, siga para `02-convencoes.md`.
