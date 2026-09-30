---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-03
atualizado_em: 2026-09-30
tasks:
  - id: T-03.01
    titulo: "Prompt fundamentado"
    fase: F-03.1
    status: concluida
    objetivo: "Escrever montarMaterialDeConsulta, montarMaterialSemResultado e o gerador de marcador aleatorio em chat-prompt.ts."
    arquivos:
      cria: ["tests/chat-prompt-fundamentado.test.ts"]
      altera: ["src/servicos/chat-prompt.ts", "tests/chat-prompt.test.ts"]
    teste_integracao: "montarPrompt com materialDeConsulta entrega o bloco dentro da mensagem de sistema, depois da conduta e antes do historico."
    teste_funcional: "Com trechos numerados, o bloco tem marcador de abertura e de fechamento com o mesmo id de 16 hexadecimais, itens [1] e [2] com titulo, instrucao de citar e de ignorar instrucoes do material, e um trecho com '<<<' ou com o id perde essas sequencias e nao fecha o bloco."
    criterio_aceite: "tests/chat-prompt-fundamentado.test.ts e tests/chat-prompt.test.ts passam, o orcamento de 6000 caracteres corta do menos relevante e o trecho unico maior que o orcamento e truncado."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.02
    titulo: "Fontes da resposta como funcoes puras"
    fase: F-03.1
    status: concluida
    objetivo: "Agrupar trechos por fonte, resumir, detectar citacao e ler o JSON gravado."
    arquivos:
      cria: ["src/servicos/fontes-da-resposta.ts", "tests/fontes-da-resposta.test.ts"]
      altera: []
    teste_integracao: "montarFontes(trechosNumerados, resposta) devolve uma entrada por fonte na ordem do primeiro trecho, com trechos {n, posicao, trechoTexto<=300} e citada."
    teste_funcional: "Resposta 'veja [2] e [9]' marca como citada so a fonte do trecho 2, resposta sem colchete marca todas como nao citadas, e lerFontesGravadas('json invalido') devolve []."
    criterio_aceite: "tests/fontes-da-resposta.test.ts passa com ao menos 8 casos."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.03
    titulo: "Modo fundamentado em responderMensagem"
    fase: F-03.2
    status: pendente
    objetivo: "Buscar trechos e montar o prompt no turno, com os tres casos: sem fonte pronta, com trechos, sem trechos relevantes."
    arquivos:
      cria: ["tests/chat-fundamentado.test.ts"]
      altera: ["src/servicos/chat.ts"]
    teste_integracao: "Contra o OpenRouter falso, a requisicao enviada tem mensagem de sistema com o material numerado e delimitado quando ha trechos, e o trecho malicioso 'ignore as instrucoes anteriores' fica dentro do bloco e fora do resto."
    teste_funcional: "Agente sem fonte pronta envia exatamente o prompt da FT-03, agente com base e pergunta fora dela recebe a instrucao de dizer que nao encontrou na base, e 'e o preco?' usa a pergunta anterior do historico."
    criterio_aceite: "tests/chat-fundamentado.test.ts e os testes de chat existentes passam, e falha da busca vira erro do turno com correlacao sem texto da pergunta no log."
    depende_de: ["T-03.01", "T-03.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.04
    titulo: "Evento fontes e gravacao em Mensagem.fontes"
    fase: F-03.2
    status: pendente
    objetivo: "Emitir fontes antes do fim e gravar o JSON com a resposta, sem derrubar o turno se a gravacao das fontes falhar."
    arquivos:
      cria: ["tests/chat-fontes.test.ts"]
      altera: ["src/servicos/chat.ts", "src/servicos/conversas.ts"]
    teste_integracao: "Com base e OpenRouter falso que cita [1], o gerador emite trecho, fontes e fim nessa ordem e Mensagem.fontes guarda o JSON com citada verdadeiro."
    teste_funcional: "Sem trechos nao ha evento fontes e a coluna fica nula; se a montagem das fontes lanca, a resposta e gravada sem fontes e o turno termina com fim."
    criterio_aceite: "tests/chat-fontes.test.ts passa e o log da falha tem uma linha JSON sem conteudo da conversa."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.05
    titulo: "Retomada da conversa com fontes"
    fase: F-03.2
    status: pendente
    objetivo: "Devolver as fontes de cada mensagem em retomarDoPainel."
    arquivos:
      cria: ["docs/respostas-com-conhecimento/sprint-03/sprint.md", "docs/respostas-com-conhecimento/sprint-03/fases.md", "docs/respostas-com-conhecimento/sprint-03/tasks.md"]
      altera: ["src/servicos/conversas.ts", "tests/conversas.test.ts"]
    teste_integracao: "retomarDoPainel devolve, para a mensagem do assistente gravada com fontes, a lista de fontes lida do JSON."
    teste_funcional: "Mensagem com JSON invalido ou sem fontes volta com fontes indefinidas e sem erro."
    criterio_aceite: "tests/conversas.test.ts passa com os dois casos novos e os casos antigos seguem verdes."
    depende_de: ["T-03.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

> Um bloco por task.

---

```yaml
id: T-03.01
titulo: Prompt fundamentado
objetivo: Escrever montarMaterialDeConsulta, montarMaterialSemResultado e o gerador de marcador aleatorio em chat-prompt.ts.
arquivos:
  cria: ["tests/chat-prompt-fundamentado.test.ts"]
  altera: ["src/servicos/chat-prompt.ts", "tests/chat-prompt.test.ts"]
teste_integracao: montarPrompt com materialDeConsulta entrega o bloco dentro da mensagem de sistema, depois da conduta e antes do historico.
teste_funcional: Com trechos numerados, o bloco tem marcador de abertura e de fechamento com o mesmo id de 16 hexadecimais, itens [1] e [2] com titulo, instrucao de citar e de ignorar instrucoes do material, e um trecho com '<<<' ou com o id perde essas sequencias e nao fecha o bloco.
criterio_aceite: tests/chat-prompt-fundamentado.test.ts e tests/chat-prompt.test.ts passam, o orcamento de 6000 caracteres corta do menos relevante e o trecho unico maior que o orcamento e truncado.
depende_de: ["T-02.02"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial: chat-prompt-fundamentado + chat-prompt 20 passed
```

---

```yaml
id: T-03.02
titulo: Fontes da resposta como funcoes puras
objetivo: Agrupar trechos por fonte, resumir, detectar citacao e ler o JSON gravado.
arquivos:
  cria: ["src/servicos/fontes-da-resposta.ts", "tests/fontes-da-resposta.test.ts"]
  altera: []
teste_integracao: montarFontes(trechosNumerados, resposta) devolve uma entrada por fonte na ordem do primeiro trecho, com trechos {n, posicao, trechoTexto<=300} e citada.
teste_funcional: Resposta 'veja [2] e [9]' marca como citada so a fonte do trecho 2, resposta sem colchete marca todas como nao citadas, e lerFontesGravadas('json invalido') devolve [].
criterio_aceite: tests/fontes-da-resposta.test.ts passa com ao menos 8 casos.
depende_de: ["T-02.02"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial: fontes-da-resposta 16 passed
```

---

```yaml
id: T-03.03
titulo: Modo fundamentado em responderMensagem
objetivo: Buscar trechos e montar o prompt no turno, com os tres casos: sem fonte pronta, com trechos, sem trechos relevantes.
arquivos:
  cria: ["tests/chat-fundamentado.test.ts"]
  altera: ["src/servicos/chat.ts"]
teste_integracao: Contra o OpenRouter falso, a requisicao enviada tem mensagem de sistema com o material numerado e delimitado quando ha trechos, e o trecho malicioso 'ignore as instrucoes anteriores' fica dentro do bloco e fora do resto.
teste_funcional: Agente sem fonte pronta envia exatamente o prompt da FT-03, agente com base e pergunta fora dela recebe a instrucao de dizer que nao encontrou na base, e 'e o preco?' usa a pergunta anterior do historico.
criterio_aceite: tests/chat-fundamentado.test.ts e os testes de chat existentes passam, e falha da busca vira erro do turno com correlacao sem texto da pergunta no log.
depende_de: ["T-03.01", "T-03.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.04
titulo: Evento fontes e gravacao em Mensagem.fontes
objetivo: Emitir fontes antes do fim e gravar o JSON com a resposta, sem derrubar o turno se a gravacao das fontes falhar.
arquivos:
  cria: ["tests/chat-fontes.test.ts"]
  altera: ["src/servicos/chat.ts", "src/servicos/conversas.ts"]
teste_integracao: Com base e OpenRouter falso que cita [1], o gerador emite trecho, fontes e fim nessa ordem e Mensagem.fontes guarda o JSON com citada verdadeiro.
teste_funcional: Sem trechos nao ha evento fontes e a coluna fica nula; se a montagem das fontes lanca, a resposta e gravada sem fontes e o turno termina com fim.
criterio_aceite: tests/chat-fontes.test.ts passa e o log da falha tem uma linha JSON sem conteudo da conversa.
depende_de: ["T-03.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.05
titulo: Retomada da conversa com fontes
objetivo: Devolver as fontes de cada mensagem em retomarDoPainel.
arquivos:
  cria: ["docs/respostas-com-conhecimento/sprint-03/sprint.md", "docs/respostas-com-conhecimento/sprint-03/fases.md", "docs/respostas-com-conhecimento/sprint-03/tasks.md"]
  altera: ["src/servicos/conversas.ts", "tests/conversas.test.ts"]
teste_integracao: retomarDoPainel devolve, para a mensagem do assistente gravada com fontes, a lista de fontes lida do JSON.
teste_funcional: Mensagem com JSON invalido ou sem fontes volta com fontes indefinidas e sem erro.
criterio_aceite: tests/conversas.test.ts passa com os dois casos novos e os casos antigos seguem verdes.
depende_de: ["T-03.04"]
paralelizavel: false
status: pendente
```

