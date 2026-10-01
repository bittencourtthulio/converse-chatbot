---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-02
atualizado_em: 2026-10-01
tasks:
  - id: T-02.01
    titulo: "Servico de auditoria: registrar e listar"
    fase: F-02.1
    status: concluida
    objetivo: "Criar o conjunto fechado de acoes e o servico com registrar, registrarMelhorEsforco e listar."
    arquivos:
      cria: ["src/servicos/auditoria-acoes.ts", "src/servicos/auditoria.ts", "tests/auditoria-acoes.test.ts", "tests/auditoria.test.ts", "docs/privacidade-e-auditoria/sprint-02/sprint.md", "docs/privacidade-e-auditoria/sprint-02/fases.md", "docs/privacidade-e-auditoria/sprint-02/tasks.md"]
      altera: []
    teste_integracao: "registrar grava a linha com o rotulo Nome e e-mail do usuario e listar devolve do mais recente ao mais antigo com filtros de acao, usuario e periodo e o total, contra o banco de teste."
    teste_funcional: "registrar com acao fora do conjunto fechado, com chave de detalhes nao permitida ou com detalhes acima de 1000 caracteres e recusado com 422, restauracao e aceita e registrarMelhorEsforco com o banco falhando so escreve o log sem lancar."
    criterio_aceite: "tests/auditoria.test.ts e tests/auditoria-acoes.test.ts passam, o conjunto fechado tem as 18 acoes do plano e aguardarGravacoesPendentes espera as gravacoes de melhor esforco."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.02
    titulo: "Somente-acrescimo e purga por idade"
    fase: F-02.1
    status: concluida
    objetivo: "Provar que nada atualiza ou apaga registro e oferecer a unica remocao, a purga por idade."
    arquivos:
      cria: ["tests/auditoria-somente-acrescimo.test.ts"]
      altera: ["src/servicos/auditoria.ts"]
    teste_integracao: "Uma varredura de src/ prova que so auditoria.ts toca registroDeAuditoria, so com create, findMany, count e deleteMany da purga, e que nenhuma rota de src/app/api ou acao de src/app/acoes.ts apaga ou altera registro."
    teste_funcional: "purgarAnterioresA(corte) apaga so os registros com quando estritamente anterior ao corte, devolve a contagem e o registro exatamente no corte fica."
    criterio_aceite: "tests/auditoria-somente-acrescimo.test.ts passa."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.03
    titulo: "Ouvintes de canal e de conversa apagada ligados a auditoria"
    fase: F-02.2
    status: concluida
    objetivo: "Ligar aoAlterarCanal e aoApagarConversa a auditoria por ligarAuditoria, com os ouvintes em globalThis e a subida chamando a ligacao."
    arquivos:
      cria: ["src/servicos/auditoria-ouvintes.ts", "tests/auditoria-ouvintes.test.ts"]
      altera: ["src/servicos/canal-telegram.ts", "src/servicos/historico.ts", "src/instrumentation.ts", "tests/instrumentacao.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "src/servicos/auditoria.ts"]
    teste_integracao: "Depois de ligarAuditoria chamada duas vezes, ainda com os modulos recarregados por vi.resetModules, apagar conversas e conectar, pausar, retomar, mudar o limite e desconectar o Telegram simulado gravam um registro cada no banco de teste."
    teste_funcional: "Apagar duas conversas de tres mensagens grava dois conversa_apagada com a contagem 3 e sem texto, a exclusao com origem titular nao grava, e o log recebe auditoria_falhou sem derrubar a exclusao quando a gravacao falha."
    criterio_aceite: "tests/auditoria-ouvintes.test.ts e tests/instrumentacao.test.ts passam, register chama ligarAuditoria e os testes aguardam as gravacoes pendentes por aguardarGravacoesPendentes."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-02.04
    titulo: "Auditoria da chave e do modelo de transcricao"
    fase: F-02.2
    status: concluida
    objetivo: "Gravar chave_openrouter_alterada e chave_openrouter_removida na mesma transacao da gravacao e modelo_transcricao_alterado logo depois."
    arquivos:
      cria: ["tests/auditoria-integracoes.test.ts"]
      altera: ["src/servicos/integracoes.ts"]
    teste_integracao: "Primeira transacao interativa do repositorio: salvar e remover a chave gravam o registro na mesma transacao, e com a auditoria forcada a falhar a chave no banco nao muda; salvar o modelo grava modelo_transcricao_alterado."
    teste_funcional: "Depois de salvar a chave sk-or-segredo-de-teste nenhum registro contem a chave, a mascara nem o texto cifrado, so o rotulo do admin e o nome do campo."
    criterio_aceite: "tests/auditoria-integracoes.test.ts passa e tests/integracoes.test.ts continua passando."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.05
    titulo: "Auditoria de criar e editar usuario"
    fase: F-02.2
    status: concluida
    objetivo: "Gravar usuario_criado e usuario_editado na mesma transacao, com so os nomes dos campos alterados."
    arquivos:
      cria: ["tests/auditoria-usuarios.test.ts"]
      altera: ["src/servicos/usuarios.ts"]
    teste_integracao: "Criar e editar usuario gravam o registro na mesma transacao e, com a auditoria forcada a falhar, o usuario nao e criado nem alterado."
    teste_funcional: "Editar so o papel de usuario para admin grava campos papel com papel anterior e novo e nenhum e-mail ou senha, desativar grava ativo falso e editar sem mudanca nao grava."
    criterio_aceite: "tests/auditoria-usuarios.test.ts passa e tests/usuarios.test.ts continua passando."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.06
    titulo: "Auditoria da exclusao de agente"
    fase: F-02.2
    status: pendente
    objetivo: "Gravar agente_excluido com o nome do agente na mesma transacao da exclusao."
    arquivos:
      cria: ["tests/auditoria-agentes.test.ts"]
      altera: ["src/servicos/agentes.ts"]
    teste_integracao: "Excluir agente grava agente_excluido na mesma transacao e, com a auditoria forcada a falhar, o agente continua existindo."
    teste_funcional: "Excluir um agente com duas conversas e uma fonte grava o nome do agente e as contagens 2 e 1 e nenhum texto de instrucao ou de conversa."
    criterio_aceite: "tests/auditoria-agentes.test.ts passa e tests/agentes.test.ts continua passando."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: "Servico de auditoria: registrar e listar"
objetivo: "Criar o conjunto fechado de acoes e o servico com registrar, registrarMelhorEsforco e listar."
arquivos:
  cria: ["src/servicos/auditoria-acoes.ts", "src/servicos/auditoria.ts", "tests/auditoria-acoes.test.ts", "tests/auditoria.test.ts", "docs/privacidade-e-auditoria/sprint-02/sprint.md", "docs/privacidade-e-auditoria/sprint-02/fases.md", "docs/privacidade-e-auditoria/sprint-02/tasks.md"]
  altera: []
teste_integracao: "registrar grava a linha com o rotulo Nome e e-mail do usuario e listar devolve do mais recente ao mais antigo com filtros de acao, usuario e periodo e o total, contra o banco de teste."
teste_funcional: "registrar com acao fora do conjunto fechado, com chave de detalhes nao permitida ou com detalhes acima de 1000 caracteres e recusado com 422, restauracao e aceita e registrarMelhorEsforco com o banco falhando so escreve o log sem lancar."
criterio_aceite: "tests/auditoria.test.ts e tests/auditoria-acoes.test.ts passam, o conjunto fechado tem as 18 acoes do plano e aguardarGravacoesPendentes espera as gravacoes de melhor esforco."
depende_de: ["T-01.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/auditoria.test.ts e tests/auditoria-acoes.test.ts 18 passed; so arquivos novos
```

---

```yaml
id: T-02.02
titulo: "Somente-acrescimo e purga por idade"
objetivo: "Provar que nada atualiza ou apaga registro e oferecer a unica remocao, a purga por idade."
arquivos:
  cria: ["tests/auditoria-somente-acrescimo.test.ts"]
  altera: ["src/servicos/auditoria.ts"]
teste_integracao: "Uma varredura de src/ prova que so auditoria.ts toca registroDeAuditoria, so com create, findMany, count e deleteMany da purga, e que nenhuma rota de src/app/api ou acao de src/app/acoes.ts apaga ou altera registro."
teste_funcional: "purgarAnterioresA(corte) apaga so os registros com quando estritamente anterior ao corte, devolve a contagem e o registro exatamente no corte fica."
criterio_aceite: "tests/auditoria-somente-acrescimo.test.ts passa."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/auditoria-somente-acrescimo.test.ts 7 passed e tests/auditoria.test.ts 11 passed
```

---

```yaml
id: T-02.03
titulo: "Ouvintes de canal e de conversa apagada ligados a auditoria"
objetivo: "Ligar aoAlterarCanal e aoApagarConversa a auditoria por ligarAuditoria, com os ouvintes em globalThis e a subida chamando a ligacao."
arquivos:
  cria: ["src/servicos/auditoria-ouvintes.ts", "tests/auditoria-ouvintes.test.ts"]
  altera: ["src/servicos/canal-telegram.ts", "src/servicos/historico.ts", "src/instrumentation.ts", "tests/instrumentacao.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "src/servicos/auditoria.ts"]
teste_integracao: "Depois de ligarAuditoria chamada duas vezes, ainda com os modulos recarregados por vi.resetModules, apagar conversas e conectar, pausar, retomar, mudar o limite e desconectar o Telegram simulado gravam um registro cada no banco de teste."
teste_funcional: "Apagar duas conversas de tres mensagens grava dois conversa_apagada com a contagem 3 e sem texto, a exclusao com origem titular nao grava, e o log recebe auditoria_falhou sem derrubar a exclusao quando a gravacao falha."
criterio_aceite: "tests/auditoria-ouvintes.test.ts e tests/instrumentacao.test.ts passam, register chama ligarAuditoria e os testes aguardam as gravacoes pendentes por aguardarGravacoesPendentes."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2301 testes, 2296 passed na 1a rodada e os 5 de citacao de linha em tests/projeto.test.ts corrigidos e reexecutados (144 passed); build antes
```

---

```yaml
id: T-02.04
titulo: "Auditoria da chave e do modelo de transcricao"
objetivo: "Gravar chave_openrouter_alterada e chave_openrouter_removida na mesma transacao da gravacao e modelo_transcricao_alterado logo depois."
arquivos:
  cria: ["tests/auditoria-integracoes.test.ts"]
  altera: ["src/servicos/integracoes.ts"]
teste_integracao: "Primeira transacao interativa do repositorio: salvar e remover a chave gravam o registro na mesma transacao, e com a auditoria forcada a falhar a chave no banco nao muda; salvar o modelo grava modelo_transcricao_alterado."
teste_funcional: "Depois de salvar a chave sk-or-segredo-de-teste nenhum registro contem a chave, a mascara nem o texto cifrado, so o rotulo do admin e o nome do campo."
criterio_aceite: "tests/auditoria-integracoes.test.ts passa e tests/integracoes.test.ts continua passando."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/auditoria-integracoes.test.ts 8 passed e os 3 arquivos de integracoes 31 passed; suite inteira no fim da sprint
```

---

```yaml
id: T-02.05
titulo: "Auditoria de criar e editar usuario"
objetivo: "Gravar usuario_criado e usuario_editado na mesma transacao, com so os nomes dos campos alterados."
arquivos:
  cria: ["tests/auditoria-usuarios.test.ts"]
  altera: ["src/servicos/usuarios.ts"]
teste_integracao: "Criar e editar usuario gravam o registro na mesma transacao e, com a auditoria forcada a falhar, o usuario nao e criado nem alterado."
teste_funcional: "Editar so o papel de usuario para admin grava campos papel com papel anterior e novo e nenhum e-mail ou senha, desativar grava ativo falso e editar sem mudanca nao grava."
criterio_aceite: "tests/auditoria-usuarios.test.ts passa e tests/usuarios.test.ts continua passando."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/auditoria-usuarios.test.ts 7 passed, tests/usuarios.test.ts 27 passed; suite inteira no fim da sprint
```

---

```yaml
id: T-02.06
titulo: "Auditoria da exclusao de agente"
objetivo: "Gravar agente_excluido com o nome do agente na mesma transacao da exclusao."
arquivos:
  cria: ["tests/auditoria-agentes.test.ts"]
  altera: ["src/servicos/agentes.ts"]
teste_integracao: "Excluir agente grava agente_excluido na mesma transacao e, com a auditoria forcada a falhar, o agente continua existindo."
teste_funcional: "Excluir um agente com duas conversas e uma fonte grava o nome do agente e as contagens 2 e 1 e nenhum texto de instrucao ou de conversa."
criterio_aceite: "tests/auditoria-agentes.test.ts passa e tests/agentes.test.ts continua passando."
depende_de: ["T-02.01"]
paralelizavel: false
status: pendente
```

