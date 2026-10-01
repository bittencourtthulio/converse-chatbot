---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-01
atualizado_em: 2026-10-01
tasks:
  - id: T-01.01
    titulo: "Contador de consultas ao banco em teste"
    fase: F-01.1
    status: pendente
    objetivo: "Criar o apoio que conta as consultas que uma funcao faz ao banco de teste, para provar a ausencia de N+1."
    arquivos:
      cria: ["tests/apoio/contador-de-consultas.ts", "tests/contador-de-consultas.test.ts", "docs/historico-de-conversas/sprint-01/sprint.md", "docs/historico-de-conversas/sprint-01/fases.md", "docs/historico-de-conversas/sprint-01/tasks.md"]
      altera: []
    teste_integracao: "O contador, montado sobre um cliente Prisma de teste com log de consultas apontado para o SQLite de teste, conta uma consulta para um findMany e duas para duas leituras em sequencia."
    teste_funcional: "Uma funcao que consulta uma vez por item de uma lista de tres e contada em quatro e uma consulta agregada unica e contada em um."
    criterio_aceite: "tests/contador-de-consultas.test.ts passa e o apoio exporta uma funcao que devolve o numero de consultas de uma funcao assincrona."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: "Fixtures de conversas dos tres canais"
    fase: F-01.1
    status: pendente
    objetivo: "Criar o apoio que grava conversas do painel, do widget e do Telegram com mensagens e fontes no banco de teste."
    arquivos:
      cria: ["tests/apoio/historico.ts", "tests/historico-apoio.test.ts"]
      altera: []
    teste_integracao: "A fixture grava conversa, mensagens e fontes no banco de teste e a limpeza apaga tudo em cascata sem sobra."
    teste_funcional: "Uma conversa de cada canal criada pela fixture tem o canal, o identificador externo e o titulo esperados e a de resposta com fontes devolve as fontes por lerFontesGravadas."
    criterio_aceite: "tests/historico-apoio.test.ts passa e a fixture aceita instante, agente, canal e mensagens por parametro."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: "Caracterizacao do SQLite: DateTime, dia local e LIKE"
    fase: F-01.1
    status: pendente
    objetivo: "Provar por teste o formato real de DateTime e o comportamento de strftime com fuso local e de LIKE com ESCAPE sobre texto em portugues."
    arquivos:
      cria: ["tests/sqlite-formatos.test.ts"]
      altera: []
    teste_integracao: "O teste grava mensagens pelo Prisma no SQLite de teste e consulta por $queryRaw o tipo e o valor armazenado, o dia por strftime e o resultado de LIKE com ESCAPE."
    teste_funcional: "Com TZ fixado, uma mensagem gravada as 23:30 locais cai no dia local certo, o LIKE acha letras sem acento ignorando maiusculas e escapa os caracteres percentual, sublinhado e barra invertida."
    criterio_aceite: "tests/sqlite-formatos.test.ts passa e cada afirmacao sobre formato esta no proprio teste como expectativa."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.04
    titulo: "Tokens de canal e de serie do grafico"
    fase: F-01.2
    status: pendente
    objetivo: "Acrescentar a tokens.css os tokens de badge de canal e de serie do grafico nos tres blocos de tema."
    arquivos:
      cria: ["tests/tokens-historico.test.ts"]
      altera: ["src/estilos/tokens.css"]
    teste_integracao: "tests/tokens-historico.test.ts le tokens.css real e confere que cada token novo existe no tema claro e nos dois blocos escuros identicos."
    teste_funcional: "Cada par de texto e fundo dos tokens de canal tem contraste de pelo menos 4,5:1 nos dois temas e nenhum componente usa cor literal (tests/tokens.test.ts)."
    criterio_aceite: "tests/tokens-historico.test.ts e tests/tokens.test.ts passam."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-01.01
titulo: "Contador de consultas ao banco em teste"
objetivo: "Criar o apoio que conta as consultas que uma funcao faz ao banco de teste, para provar a ausencia de N+1."
arquivos:
  cria: ["tests/apoio/contador-de-consultas.ts", "tests/contador-de-consultas.test.ts", "docs/historico-de-conversas/sprint-01/sprint.md", "docs/historico-de-conversas/sprint-01/fases.md", "docs/historico-de-conversas/sprint-01/tasks.md"]
  altera: []
teste_integracao: "O contador, montado sobre um cliente Prisma de teste com log de consultas apontado para o SQLite de teste, conta uma consulta para um findMany e duas para duas leituras em sequencia."
teste_funcional: "Uma funcao que consulta uma vez por item de uma lista de tres e contada em quatro e uma consulta agregada unica e contada em um."
criterio_aceite: "tests/contador-de-consultas.test.ts passa e o apoio exporta uma funcao que devolve o numero de consultas de uma funcao assincrona."
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.02
titulo: "Fixtures de conversas dos tres canais"
objetivo: "Criar o apoio que grava conversas do painel, do widget e do Telegram com mensagens e fontes no banco de teste."
arquivos:
  cria: ["tests/apoio/historico.ts", "tests/historico-apoio.test.ts"]
  altera: []
teste_integracao: "A fixture grava conversa, mensagens e fontes no banco de teste e a limpeza apaga tudo em cascata sem sobra."
teste_funcional: "Uma conversa de cada canal criada pela fixture tem o canal, o identificador externo e o titulo esperados e a de resposta com fontes devolve as fontes por lerFontesGravadas."
criterio_aceite: "tests/historico-apoio.test.ts passa e a fixture aceita instante, agente, canal e mensagens por parametro."
depende_de: ["T-01.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.03
titulo: "Caracterizacao do SQLite: DateTime, dia local e LIKE"
objetivo: "Provar por teste o formato real de DateTime e o comportamento de strftime com fuso local e de LIKE com ESCAPE sobre texto em portugues."
arquivos:
  cria: ["tests/sqlite-formatos.test.ts"]
  altera: []
teste_integracao: "O teste grava mensagens pelo Prisma no SQLite de teste e consulta por $queryRaw o tipo e o valor armazenado, o dia por strftime e o resultado de LIKE com ESCAPE."
teste_funcional: "Com TZ fixado, uma mensagem gravada as 23:30 locais cai no dia local certo, o LIKE acha letras sem acento ignorando maiusculas e escapa os caracteres percentual, sublinhado e barra invertida."
criterio_aceite: "tests/sqlite-formatos.test.ts passa e cada afirmacao sobre formato esta no proprio teste como expectativa."
depende_de: ["T-01.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.04
titulo: "Tokens de canal e de serie do grafico"
objetivo: "Acrescentar a tokens.css os tokens de badge de canal e de serie do grafico nos tres blocos de tema."
arquivos:
  cria: ["tests/tokens-historico.test.ts"]
  altera: ["src/estilos/tokens.css"]
teste_integracao: "tests/tokens-historico.test.ts le tokens.css real e confere que cada token novo existe no tema claro e nos dois blocos escuros identicos."
teste_funcional: "Cada par de texto e fundo dos tokens de canal tem contraste de pelo menos 4,5:1 nos dois temas e nenhum componente usa cor literal (tests/tokens.test.ts)."
criterio_aceite: "tests/tokens-historico.test.ts e tests/tokens.test.ts passam."
depende_de: ["T-01.03"]
paralelizavel: false
status: pendente
```

