---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-02
atualizado_em: 2026-09-30
tasks:
  - id: T-02.01
    titulo: "Modelo Fonte e Trecho"
    fase: F-02.1
    status: concluida
    objetivo: "Acrescentar as tabelas fontes e trechos por migration aditiva e atualizar limparBanco."
    arquivos:
      cria: ["prisma/migrations/20260930180000_fontes/migration.sql", "tests/fontes-modelo.test.ts"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
    teste_integracao: "Excluir um agente apaga suas fontes e os trechos delas, e excluir uma fonte apaga os trechos, contra o banco de teste migrado."
    teste_funcional: "Uma Fonte criada so com agenteId, tipo, titulo e tamanhoBytes nasce com status pendente, totalTrechos 0 e caracteres 0, e o usuario criador some com SetNull."
    criterio_aceite: "tests/fontes-modelo.test.ts passa e tests/migracoes.test.ts continua verde com a migration nova."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.02
    titulo: "Armazenamento em disco"
    fase: F-02.1
    status: concluida
    objetivo: "Gravar, ler e apagar o original de uma fonte com id validado e protecao contra travessia."
    arquivos:
      cria: ["src/lib/armazenamento.ts", "tests/armazenamento.test.ts"]
      altera: []
    teste_integracao: "Gravar, ler e apagar o original em um diretorio temporario real produz <raiz>/fontes/<agenteId>/<fonteId>/original e o apagar remove tambem o diretorio da fonte."
    teste_funcional: "Um id com .. ou barra lanca erro e nenhum arquivo aparece fora da raiz."
    criterio_aceite: "tests/armazenamento.test.ts passa e src/lib/armazenamento.ts nao importa nada com alias @/."
    depende_de: ["T-01.01"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.03
    titulo: "Excluir agente apaga o diretorio"
    fase: F-02.1
    status: concluida
    objetivo: "Fazer agentes.excluir apagar o diretorio do agente em disco depois da linha."
    arquivos:
      cria: []
      altera: ["src/servicos/agentes.ts", "tests/agentes.test.ts"]
    teste_integracao: "Excluir um agente com arquivo gravado remove o diretorio fontes/<agenteId> do STORAGE_DIR de teste e as linhas em cascata."
    teste_funcional: "Se apagar o diretorio falhar, a exclusao no banco continua valendo e o erro vai para o log sem lancar."
    criterio_aceite: "tests/agentes.test.ts passa com os dois casos novos."
    depende_de: ["T-02.01", "T-02.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.04
    titulo: "Divisao em trechos"
    fase: F-02.2
    status: pendente
    objetivo: "Dividir texto em trechos de ate 1000 caracteres com sobreposicao de 150, de forma pura e deterministica."
    arquivos:
      cria: ["src/servicos/trechos.ts", "tests/trechos.test.ts"]
      altera: []
    teste_integracao: "Textos gerados por semente fixa com paragrafos, frases longas e palavras gigantes passam pelos testes de propriedade: nenhum trecho vazio, nenhum acima de 1000 e os trechos em ordem cobrem o texto normalizado."
    teste_funcional: "Um texto de tres paragrafos curtos vira um trecho por paragrafo quando cabem, e a mesma entrada devolve o mesmo resultado em duas chamadas."
    criterio_aceite: "tests/trechos.test.ts passa e src/servicos/trechos.ts nao importa nada com alias @/."
    depende_de: []
    paralelizavel: true
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

> Um bloco por task.

---

```yaml
id: T-02.01
titulo: Modelo Fonte e Trecho
objetivo: Acrescentar as tabelas fontes e trechos por migration aditiva e atualizar limparBanco.
arquivos:
  cria: ["prisma/migrations/20260930180000_fontes/migration.sql", "tests/fontes-modelo.test.ts"]
  altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
teste_integracao: Excluir um agente apaga suas fontes e os trechos delas, e excluir uma fonte apaga os trechos, contra o banco de teste migrado.
teste_funcional: Uma Fonte criada so com agenteId, tipo, titulo e tamanhoBytes nasce com status pendente, totalTrechos 0 e caracteres 0, e o usuario criador some com SetNull.
criterio_aceite: tests/fontes-modelo.test.ts passa e tests/migracoes.test.ts continua verde com a migration nova.
depende_de: ["T-01.01"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 594 passed, 0 failed
```

---

```yaml
id: T-02.02
titulo: Armazenamento em disco
objetivo: Gravar, ler e apagar o original de uma fonte com id validado e protecao contra travessia.
arquivos:
  cria: ["src/lib/armazenamento.ts", "tests/armazenamento.test.ts"]
  altera: []
teste_integracao: Gravar, ler e apagar o original em um diretorio temporario real produz <raiz>/fontes/<agenteId>/<fonteId>/original e o apagar remove tambem o diretorio da fonte.
teste_funcional: Um id com .. ou barra lanca erro e nenhum arquivo aparece fora da raiz.
criterio_aceite: tests/armazenamento.test.ts passa e src/lib/armazenamento.ts nao importa nada com alias @/.
depende_de: ["T-01.01"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 602 passed, 0 failed
```

---

```yaml
id: T-02.03
titulo: Excluir agente apaga o diretorio
objetivo: Fazer agentes.excluir apagar o diretorio do agente em disco depois da linha.
arquivos:
  cria: []
  altera: ["src/servicos/agentes.ts", "tests/agentes.test.ts"]
teste_integracao: Excluir um agente com arquivo gravado remove o diretorio fontes/<agenteId> do STORAGE_DIR de teste e as linhas em cascata.
teste_funcional: Se apagar o diretorio falhar, a exclusao no banco continua valendo e o erro vai para o log sem lancar.
criterio_aceite: tests/agentes.test.ts passa com os dois casos novos.
depende_de: ["T-02.01", "T-02.02"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 604 passed, 0 failed
```

---

```yaml
id: T-02.04
titulo: Divisao em trechos
objetivo: Dividir texto em trechos de ate 1000 caracteres com sobreposicao de 150, de forma pura e deterministica.
arquivos:
  cria: ["src/servicos/trechos.ts", "tests/trechos.test.ts"]
  altera: []
teste_integracao: Textos gerados por semente fixa com paragrafos, frases longas e palavras gigantes passam pelos testes de propriedade: nenhum trecho vazio, nenhum acima de 1000 e os trechos em ordem cobrem o texto normalizado.
teste_funcional: Um texto de tres paragrafos curtos vira um trecho por paragrafo quando cabem, e a mesma entrada devolve o mesmo resultado em duas chamadas.
criterio_aceite: tests/trechos.test.ts passa e src/servicos/trechos.ts nao importa nada com alias @/.
depende_de: []
paralelizavel: true
status: pendente
```
