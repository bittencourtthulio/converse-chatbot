---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-04
atualizado_em: 2026-09-30
tasks:
  - id: T-04.01
    titulo: "Autenticar o segredo, validar o update e deduplicar"
    fase: F-04.1
    status: concluida
    objetivo: "Escrever autenticarWebhook (hash em tempo constante), lerUpdate (zod), registrarAtualizacao (insert-primeiro) e purgarAtualizacoes (7 dias)."
    arquivos:
      cria: ["src/servicos/telegram-webhook.ts", "tests/telegram-webhook-base.test.ts", "docs/canal-telegram/sprint-04/sprint.md", "docs/canal-telegram/sprint-04/fases.md", "docs/canal-telegram/sprint-04/tasks.md"]
      altera: []
    teste_integracao: "Contra o banco de teste, o segredo certo autentica o canal, o errado e o canal inexistente falham do mesmo jeito e o mesmo update_id registrado duas vezes devolve novo e depois duplicado."
    teste_funcional: "lerUpdate aceita message de texto privado e recusa corpo sem update_id, purgarAtualizacoes apaga so registros com mais de 7 dias e a comparacao usa timingSafeEqual de buffers de mesmo tamanho."
    criterio_aceite: "tests/telegram-webhook-base.test.ts passa com ao menos 10 casos."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.02
    titulo: "Comandos, mensagens nao textuais e conversa do chat"
    fase: F-04.2
    status: concluida
    objetivo: "Escrever o atendimento de /start, /novo, /reiniciar, mensagem nao textual, grupo ignorado e a conversa do chat com titulo Telegram: Nome (conversas.criar ganha titulo opcional)."
    arquivos:
      cria: ["src/servicos/telegram-atendimento.ts", "tests/telegram-comandos.test.ts"]
      altera: ["src/servicos/conversas.ts", "tests/conversas.test.ts"]
    teste_integracao: "Contra o simulado, /start envia a mensagem inicial do agente ao chat_id certo, /novo cria uma conversa vazia e a seguinte mensagem cai nela, e foto em chat privado recebe o aviso de so texto."
    teste_funcional: "Update de grupo ou canal nao gera nenhuma chamada ao simulado, a conversa nasce com titulo Telegram: Maria Silva sem @usuario nem id, e conversas.criar sem titulo continua derivando da primeira mensagem."
    criterio_aceite: "tests/telegram-comandos.test.ts e tests/conversas.test.ts passam."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.03
    titulo: "Resposta do agente no Telegram"
    fase: F-04.2
    status: concluida
    objetivo: "Ligar o texto comum a responderMensagem com canal telegram, enviar a resposta em texto puro com Fontes, o digitando renovado, falha pela frase unica e atualizar ultimaMensagemEm e ultimoErro."
    arquivos:
      cria: ["tests/telegram-resposta.test.ts"]
      altera: ["src/servicos/telegram-atendimento.ts"]
    teste_integracao: "Contra o OpenRouter falso e o Telegram falso, uma pergunta gera uma conversa canal telegram com identificadorExterno igual ao chat id, a resposta gravada e uma sendMessage com o texto sem parse_mode."
    teste_funcional: "Com fonte citada a ultima linha enviada e Fontes: seguida so dos titulos citados, com o provedor em erro o chat recebe a frase unica de mensagemParaVisitante e ultimoErro e gravado sem o texto do provedor, e o sendChatAction typing e enviado durante a geracao lenta."
    criterio_aceite: "tests/telegram-resposta.test.ts passa e nenhum texto enviado ao Telegram contem codigo ou corpo do provedor."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.04
    titulo: "Limites por chat, por conversa, teto diario e ordem"
    fase: F-04.2
    status: pendente
    objetivo: "Aplicar 10 por minuto por chat, 60 por conversa, o teto diario do canal e a exclusao mutua por chat, sempre com resposta amigavel."
    arquivos:
      cria: ["src/lib/exclusao-mutua.ts", "src/servicos/telegram-limites.ts", "tests/telegram-limites.test.ts", "tests/exclusao-mutua.test.ts"]
      altera: ["src/servicos/telegram-atendimento.ts"]
    teste_integracao: "Com relogio injetado, a 11a mensagem do mesmo chat no minuto recebe a frase de limite sem chamar o OpenRouter falso e outro chat nao e afetado."
    teste_funcional: "A 61a mensagem de uma conversa pede /novo, o teto diario do canal responde que volta amanha, e duas mensagens simultaneas do mesmo chat sao atendidas em ordem enquanto a de outro chat nao espera."
    criterio_aceite: "tests/telegram-limites.test.ts e tests/exclusao-mutua.test.ts passam e o OpenRouter falso nao recebe chamada em nenhum caso de limite."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-04.01
titulo: "Autenticar o segredo, validar o update e deduplicar"
objetivo: "Escrever autenticarWebhook (hash em tempo constante), lerUpdate (zod), registrarAtualizacao (insert-primeiro) e purgarAtualizacoes (7 dias)."
arquivos:
  cria: ["src/servicos/telegram-webhook.ts", "tests/telegram-webhook-base.test.ts", "docs/canal-telegram/sprint-04/sprint.md", "docs/canal-telegram/sprint-04/fases.md", "docs/canal-telegram/sprint-04/tasks.md"]
  altera: []
teste_integracao: "Contra o banco de teste, o segredo certo autentica o canal, o errado e o canal inexistente falham do mesmo jeito e o mesmo update_id registrado duas vezes devolve novo e depois duplicado."
teste_funcional: "lerUpdate aceita message de texto privado e recusa corpo sem update_id, purgarAtualizacoes apaga so registros com mais de 7 dias e a comparacao usa timingSafeEqual de buffers de mesmo tamanho."
criterio_aceite: "tests/telegram-webhook-base.test.ts passa com ao menos 10 casos."
depende_de: ["T-03.03"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/telegram-webhook-base.test.ts, 15 passed; tsc e eslint limpos
```

---

```yaml
id: T-04.02
titulo: "Comandos, mensagens nao textuais e conversa do chat"
objetivo: "Escrever o atendimento de /start, /novo, /reiniciar, mensagem nao textual, grupo ignorado e a conversa do chat com titulo Telegram: Nome (conversas.criar ganha titulo opcional)."
arquivos:
  cria: ["src/servicos/telegram-atendimento.ts", "tests/telegram-comandos.test.ts"]
  altera: ["src/servicos/conversas.ts", "tests/conversas.test.ts"]
teste_integracao: "Contra o simulado, /start envia a mensagem inicial do agente ao chat_id certo, /novo cria uma conversa vazia e a seguinte mensagem cai nela, e foto em chat privado recebe o aviso de so texto."
teste_funcional: "Update de grupo ou canal nao gera nenhuma chamada ao simulado, a conversa nasce com titulo Telegram: Maria Silva sem @usuario nem id, e conversas.criar sem titulo continua derivando da primeira mensagem."
criterio_aceite: "tests/telegram-comandos.test.ts e tests/conversas.test.ts passam."
depende_de: ["T-04.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/telegram-comandos.test.ts e tests/conversas.test.ts, 37 passed; tsc e eslint limpos
```

---

```yaml
id: T-04.03
titulo: "Resposta do agente no Telegram"
objetivo: "Ligar o texto comum a responderMensagem com canal telegram, enviar a resposta em texto puro com Fontes, o digitando renovado, falha pela frase unica e atualizar ultimaMensagemEm e ultimoErro."
arquivos:
  cria: ["tests/telegram-resposta.test.ts"]
  altera: ["src/servicos/telegram-atendimento.ts"]
teste_integracao: "Contra o OpenRouter falso e o Telegram falso, uma pergunta gera uma conversa canal telegram com identificadorExterno igual ao chat id, a resposta gravada e uma sendMessage com o texto sem parse_mode."
teste_funcional: "Com fonte citada a ultima linha enviada e Fontes: seguida so dos titulos citados, com o provedor em erro o chat recebe a frase unica de mensagemParaVisitante e ultimoErro e gravado sem o texto do provedor, e o sendChatAction typing e enviado durante a geracao lenta."
criterio_aceite: "tests/telegram-resposta.test.ts passa e nenhum texto enviado ao Telegram contem codigo ou corpo do provedor."
depende_de: ["T-04.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/telegram-resposta.test.ts e tests/telegram-comandos.test.ts, 27 passed; tsc e eslint limpos
```

---

```yaml
id: T-04.04
titulo: "Limites por chat, por conversa, teto diario e ordem"
objetivo: "Aplicar 10 por minuto por chat, 60 por conversa, o teto diario do canal e a exclusao mutua por chat, sempre com resposta amigavel."
arquivos:
  cria: ["src/lib/exclusao-mutua.ts", "src/servicos/telegram-limites.ts", "tests/telegram-limites.test.ts", "tests/exclusao-mutua.test.ts"]
  altera: ["src/servicos/telegram-atendimento.ts"]
teste_integracao: "Com relogio injetado, a 11a mensagem do mesmo chat no minuto recebe a frase de limite sem chamar o OpenRouter falso e outro chat nao e afetado."
teste_funcional: "A 61a mensagem de uma conversa pede /novo, o teto diario do canal responde que volta amanha, e duas mensagens simultaneas do mesmo chat sao atendidas em ordem enquanto a de outro chat nao espera."
criterio_aceite: "tests/telegram-limites.test.ts e tests/exclusao-mutua.test.ts passam e o OpenRouter falso nao recebe chamada em nenhum caso de limite."
depende_de: ["T-04.03"]
paralelizavel: false
status: pendente
```
