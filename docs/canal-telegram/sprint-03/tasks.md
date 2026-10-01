---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-03
atualizado_em: 2026-09-30
tasks:
  - id: T-03.01
    titulo: "Conectar o bot e ler o estado"
    fase: F-03.1
    status: concluida
    objetivo: "Escrever conectar (formato do token, getMe, segredo de 32 bytes, setWebhook, token cifrado, hash, HTTPS, bot unico, reconexao gira o segredo) e estado sem segredo."
    arquivos:
      cria: ["src/servicos/canal-telegram.ts", "tests/canal-telegram-conectar.test.ts", "docs/canal-telegram/sprint-03/sprint.md", "docs/canal-telegram/sprint-03/fases.md", "docs/canal-telegram/sprint-03/tasks.md"]
      altera: []
    teste_integracao: "Com o simulado e APP_URL https, conectar grava o canal com o token cifrado (formato v1), o hash SHA-256 do mesmo segredo que o simulado recebeu no setWebhook e a URL certa do webhook."
    teste_funcional: "conectar recusa token malformado, APP_URL ausente ou http (telegram_url_nao_https), bot ja usado por outro agente (telegram_bot_em_uso), e reconectar com outro token troca o hash; estado devolve o usuario do bot e nunca o token, o cifrado nem o hash."
    criterio_aceite: "tests/canal-telegram-conectar.test.ts passa e a serializacao do estado nao contem o token de teste."
    depende_de: ["T-02.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.02
    titulo: "Desconectar, pausar, retomar e verificar"
    fase: F-03.2
    status: pendente
    objetivo: "Escrever desconectar, pausar, retomar, verificar (getWebhookInfo), definirLimiteDiario e o ponto de extensao aoAlterarCanal."
    arquivos:
      cria: ["tests/canal-telegram-ciclo.test.ts"]
      altera: ["src/servicos/canal-telegram.ts"]
    teste_integracao: "Contra o simulado, desconectar chama deleteWebhook e apaga o canal mantendo as conversas do agente, pausar e retomar so mudam ativo e verificar le o getWebhookInfo."
    teste_funcional: "desconectar com o Telegram fora do ar ainda apaga o canal localmente, verificar diz que a URL nao confere quando o simulado devolve outra, definirLimiteDiario recusa 0 e 100001, e o ouvinte de aoAlterarCanal recebe a acao sem token."
    criterio_aceite: "tests/canal-telegram-ciclo.test.ts passa e qualquer usuario autenticado consegue gerenciar o canal de qualquer agente."
    depende_de: ["T-03.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.03
    titulo: "Teto diario parametrizado por canal"
    fase: F-03.2
    status: pendente
    objetivo: "Dar a exigirTetoDiario o parametro de canal (padrao widget) sem mudar o comportamento do chat embutido."
    arquivos:
      cria: []
      altera: ["src/servicos/chat-publico-limites.ts", "tests/chat-publico-limites.test.ts"]
    teste_integracao: "Os testes existentes de limite do widget continuam passando sem mudanca de chamada e o teto do canal telegram conta so conversas telegram do agente."
    teste_funcional: "Com 3 mensagens de usuario no canal telegram e limite 3, exigirTetoDiario(agente, 3, agora, 'telegram') lanca limite_diario enquanto o do widget do mesmo agente nao lanca."
    criterio_aceite: "tests/chat-publico-limites.test.ts e tests/chat-publico.test.ts passam."
    depende_de: ["T-03.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-03.01
titulo: "Conectar o bot e ler o estado"
objetivo: "Escrever conectar (formato do token, getMe, segredo de 32 bytes, setWebhook, token cifrado, hash, HTTPS, bot unico, reconexao gira o segredo) e estado sem segredo."
arquivos:
  cria: ["src/servicos/canal-telegram.ts", "tests/canal-telegram-conectar.test.ts", "docs/canal-telegram/sprint-03/sprint.md", "docs/canal-telegram/sprint-03/fases.md", "docs/canal-telegram/sprint-03/tasks.md"]
  altera: []
teste_integracao: "Com o simulado e APP_URL https, conectar grava o canal com o token cifrado (formato v1), o hash SHA-256 do mesmo segredo que o simulado recebeu no setWebhook e a URL certa do webhook."
teste_funcional: "conectar recusa token malformado, APP_URL ausente ou http (telegram_url_nao_https), bot ja usado por outro agente (telegram_bot_em_uso), e reconectar com outro token troca o hash; estado devolve o usuario do bot e nunca o token, o cifrado nem o hash."
criterio_aceite: "tests/canal-telegram-conectar.test.ts passa e a serializacao do estado nao contem o token de teste."
depende_de: ["T-02.03"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/canal-telegram-conectar.test.ts, 13 passed; tsc e eslint limpos
```

---

```yaml
id: T-03.02
titulo: "Desconectar, pausar, retomar e verificar"
objetivo: "Escrever desconectar, pausar, retomar, verificar (getWebhookInfo), definirLimiteDiario e o ponto de extensao aoAlterarCanal."
arquivos:
  cria: ["tests/canal-telegram-ciclo.test.ts"]
  altera: ["src/servicos/canal-telegram.ts"]
teste_integracao: "Contra o simulado, desconectar chama deleteWebhook e apaga o canal mantendo as conversas do agente, pausar e retomar so mudam ativo e verificar le o getWebhookInfo."
teste_funcional: "desconectar com o Telegram fora do ar ainda apaga o canal localmente, verificar diz que a URL nao confere quando o simulado devolve outra, definirLimiteDiario recusa 0 e 100001, e o ouvinte de aoAlterarCanal recebe a acao sem token."
criterio_aceite: "tests/canal-telegram-ciclo.test.ts passa e qualquer usuario autenticado consegue gerenciar o canal de qualquer agente."
depende_de: ["T-03.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.03
titulo: "Teto diario parametrizado por canal"
objetivo: "Dar a exigirTetoDiario o parametro de canal (padrao widget) sem mudar o comportamento do chat embutido."
arquivos:
  cria: []
  altera: ["src/servicos/chat-publico-limites.ts", "tests/chat-publico-limites.test.ts"]
teste_integracao: "Os testes existentes de limite do widget continuam passando sem mudanca de chamada e o teto do canal telegram conta so conversas telegram do agente."
teste_funcional: "Com 3 mensagens de usuario no canal telegram e limite 3, exigirTetoDiario(agente, 3, agora, 'telegram') lanca limite_diario enquanto o do widget do mesmo agente nao lanca."
criterio_aceite: "tests/chat-publico-limites.test.ts e tests/chat-publico.test.ts passam."
depende_de: ["T-03.02"]
paralelizavel: false
status: pendente
```
