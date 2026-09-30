---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-02
atualizado_em: 2026-09-30
tasks:
  - id: T-02.01
    titulo: "Servico de configuracao: salvar e obter"
    fase: F-02.1
    status: concluida
    objetivo: "Implementar obterConfiguracao e salvarConfiguracao com zod e autor obrigatorio."
    arquivos:
      cria: ["src/servicos/chat-publico-config.ts", "tests/chat-publico-config.test.ts", "docs/chat-embutido/sprint-02/sprint.md", "docs/chat-embutido/sprint-02/fases.md", "docs/chat-embutido/sprint-02/tasks.md"]
      altera: []
    teste_integracao: "Contra o banco de teste, salvar cria a linha na primeira vez e atualiza nas seguintes, e obter sem linha devolve os padroes."
    teste_funcional: "salvarConfiguracao recusa cor 'azul', aviso de 301 caracteres, URL 'ftp://x', 4 sugestoes, limiteDiario 0 e 100001 com entradaInvalida, e aceita '#ABC' gravando o hex de seis digitos."
    criterio_aceite: "tests/chat-publico-config.test.ts passa com ao menos 14 casos e recusa autor nulo com nao autenticado."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.02
    titulo: "Leitura publica e dominios do embed"
    fase: F-02.1
    status: concluida
    objetivo: "Implementar configuracaoPublica(agenteId) e dominiosDoEmbed(agenteId)."
    arquivos:
      cria: ["tests/chat-publico-config-publica.test.ts"]
      altera: ["src/servicos/chat-publico-config.ts"]
    teste_integracao: "Contra o banco de teste, agente inativo e agente inexistente devolvem o mesmo resultado nulo e o ativo devolve so os campos visuais."
    teste_funcional: "configuracaoPublica devolve titulo igual ao nome do agente quando vazio e nunca contem instrucoes, modelo, dominios nem limiteDiario, e dominiosDoEmbed devolve a lista do agente ativo e ativo false para o inativo."
    criterio_aceite: "tests/chat-publico-config-publica.test.ts passa e o JSON da configuracao publica nao contem as chaves instrucoes, modelo, dominiosPermitidos e limiteDiario."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.03
    titulo: "Limites e teto diario"
    fase: F-02.2
    status: concluida
    objetivo: "Implementar os limites por IP, por IP e agente, por conversa e o teto diario contado no banco, com limitador e relogio injetaveis."
    arquivos:
      cria: ["src/servicos/chat-publico-limites.ts", "tests/chat-publico-limites.test.ts"]
      altera: []
    teste_integracao: "Contra o banco de teste, mensagens user do canal widget do dia contam para o teto e as de ontem, de outro agente e do painel nao contam."
    teste_funcional: "A 11a chamada no minuto do mesmo IP e agente recusa com limite_excedido, a 31a do IP recusa, a conversa com 60 mensagens recusa com conversa_cheia, e o teto diario recusa com limite_diario e segundos ate a meia-noite local."
    criterio_aceite: "tests/chat-publico-limites.test.ts passa com ao menos 12 casos, incluindo o relogio injetado."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.04
    titulo: "Servico do turno publico"
    fase: F-02.2
    status: pendente
    objetivo: "Implementar validarVisitanteId, exigirAgenteAtivo, o turno do canal widget, a retomada das ultimas 50 mensagens e a reducao do evento fontes."
    arquivos:
      cria: ["src/servicos/chat-publico.ts", "tests/chat-publico.test.ts", "tests/apoio/publico.ts"]
      altera: []
    teste_integracao: "Contra o banco e o OpenRouter falso, o turno publico grava conversa canal widget com identificadorExterno igual ao visitanteId e stream de trechos, fontes reduzidas e fim."
    teste_funcional: "Visitante B nao continua a conversa do visitante A (404), agente inativo da 404 igual ao inexistente, mensagem de 1001 caracteres e visitanteId curto dao entradaInvalida, e o evento fontes publico so traz titulo, citada e numeros sem trechoTexto."
    criterio_aceite: "tests/chat-publico.test.ts passa com ao menos 16 casos e nenhum evento publico contem trecho interno da base."
    depende_de: ["T-02.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.05
    titulo: "Tradutor SSE com mapeador de erro"
    fase: F-02.2
    status: pendente
    objetivo: "Fazer fluxoDeEventos aceitar um mapeador de erro opcional, mantendo o comportamento do painel."
    arquivos:
      cria: []
      altera: ["src/app/eventos-sse.ts", "tests/eventos-sse.test.ts"]
    teste_integracao: "O gerador do turno com erro no meio vira o evento erro com a frase de mensagemParaVisitante quando o mapeador publico e passado, e com a do operador sem ele."
    teste_funcional: "Sem mapeador o evento erro e identico ao de antes e com mapeador o codigo e 'indisponivel' e a mensagem e a do visitante sem correlacao."
    criterio_aceite: "tests/eventos-sse.test.ts passa com os casos antigos inalterados mais ao menos 3 novos."
    depende_de: ["T-02.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-02.01
titulo: "Servico de configuracao: salvar e obter"
objetivo: "Implementar obterConfiguracao e salvarConfiguracao com zod e autor obrigatorio."
arquivos:
  cria: ["src/servicos/chat-publico-config.ts", "tests/chat-publico-config.test.ts", "docs/chat-embutido/sprint-02/sprint.md", "docs/chat-embutido/sprint-02/fases.md", "docs/chat-embutido/sprint-02/tasks.md"]
  altera: []
teste_integracao: "Contra o banco de teste, salvar cria a linha na primeira vez e atualiza nas seguintes, e obter sem linha devolve os padroes."
teste_funcional: "salvarConfiguracao recusa cor 'azul', aviso de 301 caracteres, URL 'ftp://x', 4 sugestoes, limiteDiario 0 e 100001 com entradaInvalida, e aceita '#ABC' gravando o hex de seis digitos."
criterio_aceite: "tests/chat-publico-config.test.ts passa com ao menos 14 casos e recusa autor nulo com nao autenticado."
depende_de: ["T-01.03"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1175 passed
```

---

```yaml
id: T-02.02
titulo: "Leitura publica e dominios do embed"
objetivo: "Implementar configuracaoPublica(agenteId) e dominiosDoEmbed(agenteId)."
arquivos:
  cria: ["tests/chat-publico-config-publica.test.ts"]
  altera: ["src/servicos/chat-publico-config.ts"]
teste_integracao: "Contra o banco de teste, agente inativo e agente inexistente devolvem o mesmo resultado nulo e o ativo devolve so os campos visuais."
teste_funcional: "configuracaoPublica devolve titulo igual ao nome do agente quando vazio e nunca contem instrucoes, modelo, dominios nem limiteDiario, e dominiosDoEmbed devolve a lista do agente ativo e ativo false para o inativo."
criterio_aceite: "tests/chat-publico-config-publica.test.ts passa e o JSON da configuracao publica nao contem as chaves instrucoes, modelo, dominiosPermitidos e limiteDiario."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1183 passed
```

---

```yaml
id: T-02.03
titulo: "Limites e teto diario"
objetivo: "Implementar os limites por IP, por IP e agente, por conversa e o teto diario contado no banco, com limitador e relogio injetaveis."
arquivos:
  cria: ["src/servicos/chat-publico-limites.ts", "tests/chat-publico-limites.test.ts"]
  altera: []
teste_integracao: "Contra o banco de teste, mensagens user do canal widget do dia contam para o teto e as de ontem, de outro agente e do painel nao contam."
teste_funcional: "A 11a chamada no minuto do mesmo IP e agente recusa com limite_excedido, a 31a do IP recusa, a conversa com 60 mensagens recusa com conversa_cheia, e o teto diario recusa com limite_diario e segundos ate a meia-noite local."
criterio_aceite: "tests/chat-publico-limites.test.ts passa com ao menos 12 casos, incluindo o relogio injetado."
depende_de: ["T-02.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1196 passed
```

---

```yaml
id: T-02.04
titulo: "Servico do turno publico"
objetivo: "Implementar validarVisitanteId, exigirAgenteAtivo, o turno do canal widget, a retomada das ultimas 50 mensagens e a reducao do evento fontes."
arquivos:
  cria: ["src/servicos/chat-publico.ts", "tests/chat-publico.test.ts", "tests/apoio/publico.ts"]
  altera: []
teste_integracao: "Contra o banco e o OpenRouter falso, o turno publico grava conversa canal widget com identificadorExterno igual ao visitanteId e stream de trechos, fontes reduzidas e fim."
teste_funcional: "Visitante B nao continua a conversa do visitante A (404), agente inativo da 404 igual ao inexistente, mensagem de 1001 caracteres e visitanteId curto dao entradaInvalida, e o evento fontes publico so traz titulo, citada e numeros sem trechoTexto."
criterio_aceite: "tests/chat-publico.test.ts passa com ao menos 16 casos e nenhum evento publico contem trecho interno da base."
depende_de: ["T-02.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.05
titulo: "Tradutor SSE com mapeador de erro"
objetivo: "Fazer fluxoDeEventos aceitar um mapeador de erro opcional, mantendo o comportamento do painel."
arquivos:
  cria: []
  altera: ["src/app/eventos-sse.ts", "tests/eventos-sse.test.ts"]
teste_integracao: "O gerador do turno com erro no meio vira o evento erro com a frase de mensagemParaVisitante quando o mapeador publico e passado, e com a do operador sem ele."
teste_funcional: "Sem mapeador o evento erro e identico ao de antes e com mapeador o codigo e 'indisponivel' e a mensagem e a do visitante sem correlacao."
criterio_aceite: "tests/eventos-sse.test.ts passa com os casos antigos inalterados mais ao menos 3 novos."
depende_de: ["T-02.04"]
paralelizavel: false
status: pendente
```
