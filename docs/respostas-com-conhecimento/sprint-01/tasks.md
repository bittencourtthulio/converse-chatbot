---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-01
atualizado_em: 2026-09-30
tasks:
  - id: T-01.01
    titulo: "Migration do indice FTS5 e gatilhos"
    fase: F-01.1
    status: concluida
    objetivo: "Criar a tabela virtual trechos_fts de conteudo externo com tres gatilhos e rebuild inicial, por SQL cru numa migration nova."
    arquivos:
      cria: ["prisma/migrations/20260930190000_busca_fts5/migration.sql", "tests/indice-fts5.test.ts"]
      altera: []
    teste_integracao: "Com o banco criado por migrate deploy do zero (setup de teste), inserir um trecho em trechos faz MATCH em trechos_fts achar o rowid dele."
    teste_funcional: "Insert, update do texto e delete de trecho refletem no MATCH (termo novo acha, termo antigo nao acha, apagado nao acha), e a busca ignora acento e caixa ('politica' acha 'Política')."
    criterio_aceite: "tests/indice-fts5.test.ts passa, tests/migracoes.test.ts passa com a migration nova e migrate status nao acusa pendencia."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-01.02
    titulo: "Cascata e reprocessamento mantem o indice"
    fase: F-01.2
    status: concluida
    objetivo: "Provar que excluir fonte, excluir agente, reprocessar e limparBanco deixam o indice sem linhas orfas."
    arquivos:
      cria: ["tests/indice-fts5-cascata.test.ts"]
      altera: ["prisma/migrations/20260930190000_busca_fts5/migration.sql", "src/servicos/fontes.ts", "src/servicos/agentes.ts"]
    teste_integracao: "Excluir uma fonte e excluir um agente (servicos reais) apagam os trechos por cascata e nenhum MATCH acha o texto deles depois."
    teste_funcional: "Reprocessar uma fonte em erro com texto novo (gravarResultado da fila) substitui os trechos e o MATCH acha so o texto novo; limparBanco deixa o indice vazio."
    criterio_aceite: "tests/indice-fts5-cascata.test.ts passa e a consulta de contagem do indice (INSERT 'integrity-check' do FTS5) termina sem erro."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-01.03
    titulo: "Apoio de teste: agente com base pronta"
    fase: F-01.2
    status: concluida
    objetivo: "Criar helper que monta agente, fonte pronto e trechos para os testes de recuperacao e de chat."
    arquivos:
      cria: ["tests/apoio/conhecimento.ts", "tests/apoio-conhecimento.test.ts", "docs/respostas-com-conhecimento/sprint-01/sprint.md", "docs/respostas-com-conhecimento/sprint-01/fases.md", "docs/respostas-com-conhecimento/sprint-01/tasks.md"]
      altera: []
    teste_integracao: "O helper grava agente, fonte com status pronto e trechos pela mesma via da seed (prisma.trecho.createMany) e o indice os acha."
    teste_funcional: "criarBase({textos}) devolve ids do agente, da fonte e dos trechos, e criarBase com status erro deixa a fonte fora das buscas futuras."
    criterio_aceite: "tests/apoio-conhecimento.test.ts passa e nenhum texto de teste contem dado real."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
---

# Tasks — Sprint 01

> Um bloco por task.

---

```yaml
id: T-01.01
titulo: Migration do indice FTS5 e gatilhos
objetivo: Criar a tabela virtual trechos_fts de conteudo externo com tres gatilhos e rebuild inicial, por SQL cru numa migration nova.
arquivos:
  cria: ["prisma/migrations/20260930190000_busca_fts5/migration.sql", "tests/indice-fts5.test.ts"]
  altera: []
teste_integracao: Com o banco criado por migrate deploy do zero (setup de teste), inserir um trecho em trechos faz MATCH em trechos_fts achar o rowid dele.
teste_funcional: Insert, update do texto e delete de trecho refletem no MATCH (termo novo acha, termo antigo nao acha, apagado nao acha), e a busca ignora acento e caixa ('politica' acha 'Política').
criterio_aceite: tests/indice-fts5.test.ts passa, tests/migracoes.test.ts passa com a migration nova e migrate status nao acusa pendencia.
depende_de: []
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde: tests/indice-fts5 e migracoes 17 passed
```

---

```yaml
id: T-01.02
titulo: Cascata e reprocessamento mantem o indice
objetivo: Provar que excluir fonte, excluir agente, reprocessar e limparBanco deixam o indice sem linhas orfas.
arquivos:
  cria: ["tests/indice-fts5-cascata.test.ts"]
  altera: ["prisma/migrations/20260930190000_busca_fts5/migration.sql", "src/servicos/fontes.ts", "src/servicos/agentes.ts"]
teste_integracao: Excluir uma fonte e excluir um agente (servicos reais) apagam os trechos por cascata e nenhum MATCH acha o texto deles depois.
teste_funcional: Reprocessar uma fonte em erro com texto novo (gravarResultado da fila) substitui os trechos e o MATCH acha so o texto novo; limparBanco deixa o indice vazio.
criterio_aceite: tests/indice-fts5-cascata.test.ts passa e a consulta de contagem do indice (INSERT 'integrity-check' do FTS5) termina sem erro.
depende_de: ["T-01.01"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde: indice-fts5-cascata 4 passed (gatilhos disparam na cascata; sem desvio)
```

---

```yaml
id: T-01.03
titulo: Apoio de teste: agente com base pronta
objetivo: Criar helper que monta agente, fonte pronto e trechos para os testes de recuperacao e de chat.
arquivos:
  cria: ["tests/apoio/conhecimento.ts", "tests/apoio-conhecimento.test.ts", "docs/respostas-com-conhecimento/sprint-01/sprint.md", "docs/respostas-com-conhecimento/sprint-01/fases.md", "docs/respostas-com-conhecimento/sprint-01/tasks.md"]
  altera: []
teste_integracao: O helper grava agente, fonte com status pronto e trechos pela mesma via da seed (prisma.trecho.createMany) e o indice os acha.
teste_funcional: criarBase({textos}) devolve ids do agente, da fonte e dos trechos, e criarBase com status erro deixa a fonte fora das buscas futuras.
criterio_aceite: tests/apoio-conhecimento.test.ts passa e nenhum texto de teste contem dado real.
depende_de: ["T-01.01"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde: 905 passed, 0 failed (fecha a sprint 01)
```

