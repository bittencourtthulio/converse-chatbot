---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-02
atualizado_em: 2026-09-30
tasks:
  - id: T-02.01
    titulo: "Nucleo do adaptador e metodos de configuracao"
    fase: F-02.1
    status: concluida
    objetivo: "Escrever a chamada ao Telegram com prazo, redacao do token e erros em ErroDeAplicacao, e os metodos getMe, setWebhook, deleteWebhook e getWebhookInfo."
    arquivos:
      cria: ["src/lib/telegram.ts", "tests/telegram.test.ts", "docs/canal-telegram/sprint-02/sprint.md", "docs/canal-telegram/sprint-02/fases.md", "docs/canal-telegram/sprint-02/tasks.md"]
      altera: []
    teste_integracao: "Contra o simulado, os quatro metodos enviam o corpo certo (url, secret_token e allowed_updates message) e leem o resultado, e o eslint das camadas passa sobre src/lib."
    teste_funcional: "getMe devolve id, username e nome do bot, setWebhook com URL recusada vira telegram_webhook_recusado, token invalido vira telegram_token_invalido com mensagem em portugues e getWebhookInfo devolve url e pendentes."
    criterio_aceite: "tests/telegram.test.ts passa e nenhuma mensagem de erro contem o texto do description do Telegram."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.02
    titulo: "Envio de mensagem, digitando e divisao em pedacos"
    fase: F-02.2
    status: concluida
    objetivo: "Acrescentar sendMessage (divide acima de 4096 respeitando quebras, sem parse_mode, retry_after uma vez) e sendChatAction typing."
    arquivos:
      cria: ["tests/telegram-envio.test.ts"]
      altera: ["src/lib/telegram.ts"]
    teste_integracao: "Contra o simulado, um texto de 9000 caracteres chega em tres chamadas de ate 4096 na ordem, o corpo nunca leva parse_mode e o 429 com retry_after de 1 segundo repete uma unica vez."
    teste_funcional: "dividirTexto quebra em linha em branco, depois em quebra de linha, depois em espaco e so por fim no limite, e sendChatAction envia action typing para o chat certo."
    criterio_aceite: "tests/telegram-envio.test.ts passa e um segundo 429 seguido vira telegram_limite sem terceira tentativa."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.03
    titulo: "O token nunca aparece em erro, log ou pilha"
    fase: F-02.2
    status: concluida
    objetivo: "Provar por teste que, em erro de rede, 401, 403, 404, 429, 400, 500 e JSON invalido, o token nao aparece na mensagem, na pilha, na causa nem no que o adaptador escreve no console."
    arquivos:
      cria: ["tests/telegram-token-nao-vaza.test.ts"]
      altera: ["src/lib/telegram.ts"]
    teste_integracao: "Para cada metodo e cada falha do simulado, o erro lancado, a pilha, a causa e as saidas de console.error e console.info capturadas nao contem o token de teste nem o trecho bot mais token."
    teste_funcional: "Com o servidor fora do ar (conexao recusada) o erro e telegram_indisponivel com mensagem fixa em portugues sem o endereco, e redigirToken troca o token e qualquer bot dois-pontos segredo por bot oculto."
    criterio_aceite: "tests/telegram-token-nao-vaza.test.ts passa com ao menos 10 combinacoes de metodo e falha."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Tasks — Sprint 02

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-02.01
titulo: "Nucleo do adaptador e metodos de configuracao"
objetivo: "Escrever a chamada ao Telegram com prazo, redacao do token e erros em ErroDeAplicacao, e os metodos getMe, setWebhook, deleteWebhook e getWebhookInfo."
arquivos:
  cria: ["src/lib/telegram.ts", "tests/telegram.test.ts", "docs/canal-telegram/sprint-02/sprint.md", "docs/canal-telegram/sprint-02/fases.md", "docs/canal-telegram/sprint-02/tasks.md"]
  altera: []
teste_integracao: "Contra o simulado, os quatro metodos enviam o corpo certo (url, secret_token e allowed_updates message) e leem o resultado, e o eslint das camadas passa sobre src/lib."
teste_funcional: "getMe devolve id, username e nome do bot, setWebhook com URL recusada vira telegram_webhook_recusado, token invalido vira telegram_token_invalido com mensagem em portugues e getWebhookInfo devolve url e pendentes."
criterio_aceite: "tests/telegram.test.ts passa e nenhuma mensagem de erro contem o texto do description do Telegram."
depende_de: ["T-01.03"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/telegram.test.ts e tests/camadas.test.ts, 16 passed; tsc e eslint limpos
```

---

```yaml
id: T-02.02
titulo: "Envio de mensagem, digitando e divisao em pedacos"
objetivo: "Acrescentar sendMessage (divide acima de 4096 respeitando quebras, sem parse_mode, retry_after uma vez) e sendChatAction typing."
arquivos:
  cria: ["tests/telegram-envio.test.ts"]
  altera: ["src/lib/telegram.ts"]
teste_integracao: "Contra o simulado, um texto de 9000 caracteres chega em tres chamadas de ate 4096 na ordem, o corpo nunca leva parse_mode e o 429 com retry_after de 1 segundo repete uma unica vez."
teste_funcional: "dividirTexto quebra em linha em branco, depois em quebra de linha, depois em espaco e so por fim no limite, e sendChatAction envia action typing para o chat certo."
criterio_aceite: "tests/telegram-envio.test.ts passa e um segundo 429 seguido vira telegram_limite sem terceira tentativa."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/telegram-envio.test.ts, 11 passed
```

---

```yaml
id: T-02.03
titulo: "O token nunca aparece em erro, log ou pilha"
objetivo: "Provar por teste que, em erro de rede, 401, 403, 404, 429, 400, 500 e JSON invalido, o token nao aparece na mensagem, na pilha, na causa nem no que o adaptador escreve no console."
arquivos:
  cria: ["tests/telegram-token-nao-vaza.test.ts"]
  altera: ["src/lib/telegram.ts"]
teste_integracao: "Para cada metodo e cada falha do simulado, o erro lancado, a pilha, a causa e as saidas de console.error e console.info capturadas nao contem o token de teste nem o trecho bot mais token."
teste_funcional: "Com o servidor fora do ar (conexao recusada) o erro e telegram_indisponivel com mensagem fixa em portugues sem o endereco, e redigirToken troca o token e qualquer bot dois-pontos segredo por bot oculto."
criterio_aceite: "tests/telegram-token-nao-vaza.test.ts passa com ao menos 10 combinacoes de metodo e falha."
depende_de: ["T-02.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/telegram-token-nao-vaza.test.ts, 51 passed
```
