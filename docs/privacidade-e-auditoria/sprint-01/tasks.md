---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-01
atualizado_em: 2026-10-01
tasks:
  - id: T-01.01
    titulo: "Migration e modelo da auditoria e da privacidade"
    fase: F-01.1
    status: concluida
    objetivo: "Acrescentar a tabela registros_de_auditoria e as colunas de retencao e de aviso padrao em configuracao_do_workspace."
    arquivos:
      cria: ["prisma/migrations/20261002000000_privacidade_e_auditoria/migration.sql", "tests/privacidade-modelo.test.ts", "docs/privacidade-e-auditoria/sprint-01/sprint.md", "docs/privacidade-e-auditoria/sprint-01/fases.md", "docs/privacidade-e-auditoria/sprint-01/tasks.md"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
    teste_integracao: "A migration aplicada por migrate deploy cria registros_de_auditoria com os indices por quando e por acao e as tres colunas novas de configuracao_do_workspace, e o verificador de migracao destrutiva a aceita."
    teste_funcional: "Um registro criado para um usuario sobrevive com usuarioId nulo quando o usuario e apagado e a linha de configuracao criada sem os campos novos tem retencaoDiasConversas 90."
    criterio_aceite: "tests/privacidade-modelo.test.ts e tests/migracoes.test.ts passam e a migration nao contem DROP."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-01.02
    titulo: "Fixtures de conversa antiga e de registro de auditoria"
    fase: F-01.2
    status: concluida
    objetivo: "Criar o apoio que grava conversas com instante exato de atualizacao e registros de auditoria no banco de teste."
    arquivos:
      cria: ["tests/apoio/privacidade.ts", "tests/privacidade-apoio.test.ts"]
      altera: []
    teste_integracao: "A fixture grava conversas e mensagens com atualizadoEm e criadoEm explicitos no banco de teste e a leitura devolve exatamente o instante pedido, mesmo depois do @updatedAt."
    teste_funcional: "Dez conversas criadas em lote com datas e canais distintos sao contadas por canal e identificador e apagadas em cascata com as mensagens."
    criterio_aceite: "tests/privacidade-apoio.test.ts passa e a fixture aceita instante, agente, canal, identificador e quantidade de mensagens por parametro."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-01.03
    titulo: "Variavel AUDITORIA_RETENCAO_DIAS"
    fase: F-01.2
    status: concluida
    objetivo: "Ler a retencao dos registros de auditoria so em src/lib/ambiente.ts e documentar no exemplo de ambiente."
    arquivos:
      cria: []
      altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "tests/projeto.test.ts confere que .env.example documenta AUDITORIA_RETENCAO_DIAS sem valor secreto."
    teste_funcional: "ambiente.auditoriaRetencaoDias devolve 365 sem a variavel, 30 com 30 e lanca erro claro com 0, negativo ou texto."
    criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam e o valor padrao e 365."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: "Migration e modelo da auditoria e da privacidade"
objetivo: "Acrescentar a tabela registros_de_auditoria e as colunas de retencao e de aviso padrao em configuracao_do_workspace."
arquivos:
  cria: ["prisma/migrations/20261002000000_privacidade_e_auditoria/migration.sql", "tests/privacidade-modelo.test.ts", "docs/privacidade-e-auditoria/sprint-01/sprint.md", "docs/privacidade-e-auditoria/sprint-01/fases.md", "docs/privacidade-e-auditoria/sprint-01/tasks.md"]
  altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
teste_integracao: "A migration aplicada por migrate deploy cria registros_de_auditoria com os indices por quando e por acao e as tres colunas novas de configuracao_do_workspace, e o verificador de migracao destrutiva a aceita."
teste_funcional: "Um registro criado para um usuario sobrevive com usuarioId nulo quando o usuario e apagado e a linha de configuracao criada sem os campos novos tem retencaoDiasConversas 90."
criterio_aceite: "tests/privacidade-modelo.test.ts e tests/migracoes.test.ts passam e a migration nao contem DROP."
depende_de: []
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2258 passed, 0 failed (177 arquivos); build antes
```

---

```yaml
id: T-01.02
titulo: "Fixtures de conversa antiga e de registro de auditoria"
objetivo: "Criar o apoio que grava conversas com instante exato de atualizacao e registros de auditoria no banco de teste."
arquivos:
  cria: ["tests/apoio/privacidade.ts", "tests/privacidade-apoio.test.ts"]
  altera: []
teste_integracao: "A fixture grava conversas e mensagens com atualizadoEm e criadoEm explicitos no banco de teste e a leitura devolve exatamente o instante pedido, mesmo depois do @updatedAt."
teste_funcional: "Dez conversas criadas em lote com datas e canais distintos sao contadas por canal e identificador e apagadas em cascata com as mensagens."
criterio_aceite: "tests/privacidade-apoio.test.ts passa e a fixture aceita instante, agente, canal, identificador e quantidade de mensagens por parametro."
depende_de: ["T-01.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/privacidade-apoio.test.ts 5 passed; so arquivos novos de teste
```

---

```yaml
id: T-01.03
titulo: "Variavel AUDITORIA_RETENCAO_DIAS"
objetivo: "Ler a retencao dos registros de auditoria so em src/lib/ambiente.ts e documentar no exemplo de ambiente."
arquivos:
  cria: []
  altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "tests/projeto.test.ts confere que .env.example documenta AUDITORIA_RETENCAO_DIAS sem valor secreto."
teste_funcional: "ambiente.auditoriaRetencaoDias devolve 365 sem a variavel, 30 com 30 e lanca erro claro com 0, negativo ou texto."
criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam e o valor padrao e 365."
depende_de: ["T-01.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2267 passed, 0 failed (178 arquivos)
```

