---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-02
atualizado_em: 2026-09-30
tasks:
  - id: T-02.01
    titulo: "Termos, stopwords e expressao MATCH"
    fase: F-02.1
    status: concluida
    objetivo: "Escrever as funcoes puras extrairTermos e montarExpressaoMatch."
    arquivos:
      cria: ["src/servicos/recuperacao-termos.ts", "tests/recuperacao-termos.test.ts"]
      altera: []
    teste_integracao: "A expressao montada por montarExpressaoMatch e aceita pelo FTS5 real do banco de teste para entradas com aspas, parenteses, asterisco, dois-pontos, NEAR, AND e OR soltos."
    teste_funcional: "extrairTermos('Qual o HORÁRIO de atendimento?') devolve ['horario','atendimento'], 'olá' devolve [], repeticoes saem e o teto e 12 termos."
    criterio_aceite: "tests/recuperacao-termos.test.ts passa com ao menos 12 casos, incluindo termos de 4+ caracteres com prefixo e os de 2 e 3 sem prefixo."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.02
    titulo: "buscarTrechos com filtros e BM25"
    fase: F-02.2
    status: pendente
    objetivo: "Implementar buscarTrechos por prisma.$queryRaw parametrizado, filtrando agente e fonte pronto, ordenando por BM25 e limitando a 6."
    arquivos:
      cria: ["src/servicos/recuperacao.ts", "tests/recuperacao.test.ts"]
      altera: []
    teste_integracao: "Com duas bases de agentes diferentes e fontes em pronto, erro e pendente, a busca de um agente so devolve trechos de fontes prontas dele, com titulo, posicao, texto e pontuacao."
    teste_funcional: "Pergunta sem acento acha texto acentuado, pergunta so de saudacao devolve [], pergunta maliciosa (aspas, NEAR, asterisco) nao lanca, limite vale no maximo 6 e 'e o preco?' com perguntaAnterior acha o trecho do preco."
    criterio_aceite: "tests/recuperacao.test.ts passa e grep em src/servicos/recuperacao.ts nao encontra $queryRawUnsafe nem concatenacao da pergunta no SQL."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.03
    titulo: "Desempenho e reconstrucao do indice"
    fase: F-02.2
    status: pendente
    objetivo: "Medir a busca com 5.000 trechos e expor reconstruirIndiceDeTrechos."
    arquivos:
      cria: ["tests/recuperacao-desempenho.test.ts"]
      altera: ["src/servicos/recuperacao.ts"]
    teste_integracao: "Com 5.000 trechos gravados por createMany em lote, 20 buscas completam com mediana abaixo de 500 ms."
    teste_funcional: "Depois de corromper o indice (INSERT 'delete-all'), reconstruirIndiceDeTrechos() faz a busca voltar a achar os trechos."
    criterio_aceite: "tests/recuperacao-desempenho.test.ts passa e termina em menos de 30 s."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.04
    titulo: "Seed coberta pelo indice"
    fase: F-02.2
    status: pendente
    objetivo: "Provar que a fonte de exemplo semeada e recuperavel por pergunta real."
    arquivos:
      cria: ["docs/respostas-com-conhecimento/sprint-02/sprint.md", "docs/respostas-com-conhecimento/sprint-02/fases.md", "docs/respostas-com-conhecimento/sprint-02/tasks.md"]
      altera: ["tests/seed.test.ts", "prisma/seed.ts"]
    teste_integracao: "Depois de rodar a seed no banco de teste, buscarTrechos do agente de exemplo para 'qual a politica de troca' devolve o trecho da fonte de exemplo."
    teste_funcional: "Rodar a seed duas vezes nao duplica o indice nem a fonte, e 'horario de atendimento' acha o trecho do horario."
    criterio_aceite: "tests/seed.test.ts passa com os dois casos novos."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

> Um bloco por task.

---

```yaml
id: T-02.01
titulo: Termos, stopwords e expressao MATCH
objetivo: Escrever as funcoes puras extrairTermos e montarExpressaoMatch.
arquivos:
  cria: ["src/servicos/recuperacao-termos.ts", "tests/recuperacao-termos.test.ts"]
  altera: []
teste_integracao: A expressao montada por montarExpressaoMatch e aceita pelo FTS5 real do banco de teste para entradas com aspas, parenteses, asterisco, dois-pontos, NEAR, AND e OR soltos.
teste_funcional: extrairTermos('Qual o HORÁRIO de atendimento?') devolve ['horario','atendimento'], 'olá' devolve [], repeticoes saem e o teto e 12 termos.
criterio_aceite: tests/recuperacao-termos.test.ts passa com ao menos 12 casos, incluindo termos de 4+ caracteres com prefixo e os de 2 e 3 sem prefixo.
depende_de: ["T-01.03"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial: recuperacao-termos 22 passed
```

---

```yaml
id: T-02.02
titulo: buscarTrechos com filtros e BM25
objetivo: Implementar buscarTrechos por prisma.$queryRaw parametrizado, filtrando agente e fonte pronto, ordenando por BM25 e limitando a 6.
arquivos:
  cria: ["src/servicos/recuperacao.ts", "tests/recuperacao.test.ts"]
  altera: []
teste_integracao: Com duas bases de agentes diferentes e fontes em pronto, erro e pendente, a busca de um agente so devolve trechos de fontes prontas dele, com titulo, posicao, texto e pontuacao.
teste_funcional: Pergunta sem acento acha texto acentuado, pergunta so de saudacao devolve [], pergunta maliciosa (aspas, NEAR, asterisco) nao lanca, limite vale no maximo 6 e 'e o preco?' com perguntaAnterior acha o trecho do preco.
criterio_aceite: tests/recuperacao.test.ts passa e grep em src/servicos/recuperacao.ts nao encontra $queryRawUnsafe nem concatenacao da pergunta no SQL.
depende_de: ["T-02.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.03
titulo: Desempenho e reconstrucao do indice
objetivo: Medir a busca com 5.000 trechos e expor reconstruirIndiceDeTrechos.
arquivos:
  cria: ["tests/recuperacao-desempenho.test.ts"]
  altera: ["src/servicos/recuperacao.ts"]
teste_integracao: Com 5.000 trechos gravados por createMany em lote, 20 buscas completam com mediana abaixo de 500 ms.
teste_funcional: Depois de corromper o indice (INSERT 'delete-all'), reconstruirIndiceDeTrechos() faz a busca voltar a achar os trechos.
criterio_aceite: tests/recuperacao-desempenho.test.ts passa e termina em menos de 30 s.
depende_de: ["T-02.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.04
titulo: Seed coberta pelo indice
objetivo: Provar que a fonte de exemplo semeada e recuperavel por pergunta real.
arquivos:
  cria: ["docs/respostas-com-conhecimento/sprint-02/sprint.md", "docs/respostas-com-conhecimento/sprint-02/fases.md", "docs/respostas-com-conhecimento/sprint-02/tasks.md"]
  altera: ["tests/seed.test.ts", "prisma/seed.ts"]
teste_integracao: Depois de rodar a seed no banco de teste, buscarTrechos do agente de exemplo para 'qual a politica de troca' devolve o trecho da fonte de exemplo.
teste_funcional: Rodar a seed duas vezes nao duplica o indice nem a fonte, e 'horario de atendimento' acha o trecho do horario.
criterio_aceite: tests/seed.test.ts passa com os dois casos novos.
depende_de: ["T-02.02"]
paralelizavel: false
status: pendente
```

