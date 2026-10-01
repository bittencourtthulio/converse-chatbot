---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-01
atualizado_em: 2026-09-30
tasks:
  - id: T-01.01
    titulo: "Migration e modelos do canal Telegram"
    fase: F-01.1
    status: concluida
    objetivo: "Criar as tabelas canais_telegram e atualizacoes_telegram por migration aditiva, os modelos Prisma e a limpeza no limparBanco."
    arquivos:
      cria: ["prisma/migrations/20260930220000_canal_telegram/migration.sql", "tests/canal-telegram-modelo.test.ts", "docs/canal-telegram/sprint-01/sprint.md", "docs/canal-telegram/sprint-01/fases.md", "docs/canal-telegram/sprint-01/tasks.md"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
    teste_integracao: "Com o banco migrado do zero por migrate deploy, um canal e criado so com os campos obrigatorios, as atualizacoes somem em cascata com o canal e o canal some em cascata com o agente."
    teste_funcional: "Criar um canal devolve ativo true, limiteDiario 500 e ultimoErro nulo, e inserir duas vezes o mesmo par canalId e updateId viola a unicidade e o mesmo botId em dois agentes tambem."
    criterio_aceite: "tests/canal-telegram-modelo.test.ts e tests/migracoes.test.ts passam e a migration nao contem DROP."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-01.02
    titulo: "Variaveis de ambiente do Telegram"
    fase: F-01.1
    status: concluida
    objetivo: "Acrescentar ambiente.telegramApiBase e ambiente.telegramPermitirUrlNaoHttps (ignorada em producao) e documentar no .env.example."
    arquivos:
      cria: []
      altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere que o .env.example documenta as duas variaveis e o teste de ambiente le as variaveis do processo."
    teste_funcional: "Sem TELEGRAM_API_BASE o valor e https://api.telegram.org, com barra final ela e removida, e TELEGRAM_PERMITIR_URL_NAO_HTTPS=1 liga a permissao fora de producao e a desliga com NODE_ENV production."
    criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-01.03
    titulo: "Servidor simulado do Telegram"
    fase: F-01.2
    status: pendente
    objetivo: "Escrever tests/apoio/telegram-falso.ts com os seis metodos, registro de requisicoes, token invalido com 401, falhas e latencia configuraveis e funcao para disparar update ao webhook."
    arquivos:
      cria: ["tests/apoio/telegram-falso.ts", "tests/telegram-falso.test.ts"]
      altera: []
    teste_integracao: "O simulado sobe em porta livre, responde aos seis metodos para o token valido, registra cada requisicao com metodo, caminho e corpo JSON e fecha sem deixar a porta aberta."
    teste_funcional: "getMe com token valido devolve ok true com o bot configurado, com token desconhecido devolve 401 com ok false, setWebhook registra o secret_token e dispararUpdate envia o cabecalho X-Telegram-Bot-Api-Secret-Token ao endereco dado."
    criterio_aceite: "tests/telegram-falso.test.ts passa e o simulado nao importa nada de src."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-01.01
titulo: "Migration e modelos do canal Telegram"
objetivo: "Criar as tabelas canais_telegram e atualizacoes_telegram por migration aditiva, os modelos Prisma e a limpeza no limparBanco."
arquivos:
  cria: ["prisma/migrations/20260930220000_canal_telegram/migration.sql", "tests/canal-telegram-modelo.test.ts", "docs/canal-telegram/sprint-01/sprint.md", "docs/canal-telegram/sprint-01/fases.md", "docs/canal-telegram/sprint-01/tasks.md"]
  altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
teste_integracao: "Com o banco migrado do zero por migrate deploy, um canal e criado so com os campos obrigatorios, as atualizacoes somem em cascata com o canal e o canal some em cascata com o agente."
teste_funcional: "Criar um canal devolve ativo true, limiteDiario 500 e ultimoErro nulo, e inserir duas vezes o mesmo par canalId e updateId viola a unicidade e o mesmo botId em dois agentes tambem."
criterio_aceite: "tests/canal-telegram-modelo.test.ts e tests/migracoes.test.ts passam e a migration nao contem DROP."
depende_de: []
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/canal-telegram-modelo.test.ts e tests/migracoes.test.ts, 18 passed
```

---

```yaml
id: T-01.02
titulo: "Variaveis de ambiente do Telegram"
objetivo: "Acrescentar ambiente.telegramApiBase e ambiente.telegramPermitirUrlNaoHttps (ignorada em producao) e documentar no .env.example."
arquivos:
  cria: []
  altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts"]
teste_integracao: "tests/projeto.test.ts confere que o .env.example documenta as duas variaveis e o teste de ambiente le as variaveis do processo."
teste_funcional: "Sem TELEGRAM_API_BASE o valor e https://api.telegram.org, com barra final ela e removida, e TELEGRAM_PERMITIR_URL_NAO_HTTPS=1 liga a permissao fora de producao e a desliga com NODE_ENV production."
criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam."
depende_de: ["T-01.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/ambiente.test.ts e tests/projeto.test.ts, 75 passed
```

---

```yaml
id: T-01.03
titulo: "Servidor simulado do Telegram"
objetivo: "Escrever tests/apoio/telegram-falso.ts com os seis metodos, registro de requisicoes, token invalido com 401, falhas e latencia configuraveis e funcao para disparar update ao webhook."
arquivos:
  cria: ["tests/apoio/telegram-falso.ts", "tests/telegram-falso.test.ts"]
  altera: []
teste_integracao: "O simulado sobe em porta livre, responde aos seis metodos para o token valido, registra cada requisicao com metodo, caminho e corpo JSON e fecha sem deixar a porta aberta."
teste_funcional: "getMe com token valido devolve ok true com o bot configurado, com token desconhecido devolve 401 com ok false, setWebhook registra o secret_token e dispararUpdate envia o cabecalho X-Telegram-Bot-Api-Secret-Token ao endereco dado."
criterio_aceite: "tests/telegram-falso.test.ts passa e o simulado nao importa nada de src."
depende_de: ["T-01.02"]
paralelizavel: false
status: pendente
```
