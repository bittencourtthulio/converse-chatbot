---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-02
atualizado_em: 2026-10-01
tasks:
  - id: T-02.01
    titulo: "Correlacao por requisicao no proxy"
    fase: F-02.1
    status: pendente
    objetivo: "Fazer o proxy gerar a correlacao de toda requisicao, repassa-la por cabecalho ao handler, devolve-la em X-Correlacao e ler o cabecalho no servidor; chat-erros passa a gerar o codigo pelo log."
    arquivos:
      cria: ["src/app/correlacao-servidor.ts", "tests/correlacao.test.ts", "docs/operacao-e-backup/sprint-02/sprint.md", "docs/operacao-e-backup/sprint-02/fases.md", "docs/operacao-e-backup/sprint-02/tasks.md"]
      altera: ["src/proxy.ts", "src/servicos/chat-erros.ts", "tests/chat-erros.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "O proxy chamado com uma requisicao a /api/qualquer devolve X-Correlacao de 8 caracteres hexadecimais, repassa x-correlacao ao handler e ignora o valor que o cliente mandou, e em /embed continua definindo o frame-ancestors."
    teste_funcional: "O matcher do proxy cobre a raiz e as rotas de API e de pagina e nao cobre /_next/static, /_next/image nem favicon.ico, e gerarCorrelacao de chat-erros devolve 8 caracteres hexadecimais."
    criterio_aceite: "tests/correlacao.test.ts, tests/chat-erros.test.ts e tests/embed-cabecalhos.test.ts passam e toda resposta de teste ao servidor tem X-Correlacao."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.02
    titulo: "Servicos de conhecimento, Telegram e historico usam o log"
    fase: F-02.1
    status: pendente
    objetivo: "Trocar os console.* de fontes, fila de fontes, transcricao, agentes, canal Telegram, webhook do Telegram e historico por chamadas ao log, com a fila rodando cada fonte dentro de comCorrelacao."
    arquivos:
      cria: []
      altera: ["src/servicos/fontes.ts", "src/servicos/fontes-fila.ts", "src/servicos/transcricao-de-midia.ts", "src/servicos/agentes.ts", "src/servicos/canal-telegram.ts", "src/servicos/telegram-webhook.ts", "src/servicos/historico.ts", "tests/fontes-fila.test.ts", "tests/fontes-fila-video.test.ts", "tests/fontes-fila-execucao.test.ts", "tests/fontes-ciclo.test.ts", "tests/agentes.test.ts", "tests/historico-apagar.test.ts", "tests/telegram-acoes.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "A falha da fila de fontes, do armazenamento de agente e de um ouvinte de exclusao de conversa vira uma linha JSON do log com nivel erro, msg do evento e os ids, sem conteudo, e a linha da fila leva a correlacao da fonte."
    teste_funcional: "Nenhum arquivo dessa lista contem console. e o processamento de uma fonte com erro mantem a mensagem generica ao usuario e o estado erro da fonte."
    criterio_aceite: "Os testes de fila, agentes, historico e telegram-acoes passam lendo msg no lugar de evento e grep console\\. nesses arquivos nao acha nada."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.03
    titulo: "Camada de apresentacao e instrumentacao usam o log com codigo de referencia"
    fase: F-02.1
    status: pendente
    objetivo: "Trocar os console.* de acoes, fluxo SSE, respostas de erro das rotas e instrumentation pelo log, com o erro inesperado devolvendo o codigo de referencia e gravando so nome e codigo."
    arquivos:
      cria: []
      altera: ["src/app/acoes.ts", "src/app/eventos-sse.ts", "src/app/api/conversas/resposta.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "src/instrumentation.ts", "tests/eventos-sse.test.ts", "tests/instrumentacao.test.ts", "tests/integracoes-conexao.test.ts", "tests/conversas-apagar-rota.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Um erro inesperado numa acao de servidor e numa rota de conversas grava uma linha do log com o nome do erro e a correlacao e devolve a mensagem generica com Codigo de referencia igual a correlacao gravada."
    teste_funcional: "A mensagem devolvida ao usuario e a linha do log nao contem a mensagem do erro, a pilha, a chave nem o objeto do erro, e register() registra falha de tarefa pelo log sem derrubar as demais."
    criterio_aceite: "tests/eventos-sse.test.ts, tests/instrumentacao.test.ts, tests/integracoes-conexao.test.ts e tests/conversas-apagar-rota.test.ts passam e esses arquivos nao tem console."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.04
    titulo: "Chat, auditoria e expurgo usam o log"
    fase: F-02.1
    status: pendente
    objetivo: "Trocar os console.* do turno de conversa, da auditoria de melhor esforco e do agendador do expurgo pelo log."
    arquivos:
      cria: []
      altera: ["src/servicos/chat.ts", "src/servicos/auditoria.ts", "src/servicos/expurgo.ts", "tests/chat-falhas.test.ts", "tests/chat-fundamentado.test.ts", "tests/chat-fontes.test.ts", "tests/auditoria.test.ts", "tests/auditoria-ouvintes.test.ts", "tests/auditoria-integracoes.test.ts", "tests/expurgo-agendador.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "O erro do turno de conversa, a falha de gravar fontes, a recuperacao, a falha da auditoria de melhor esforco e a falha do expurgo viram linhas do log com msg, correlacao e ids, nunca o texto da pergunta ou da resposta."
    teste_funcional: "O erro inesperado do chat continua devolvendo Codigo de referencia ao operador e a frase unica ao visitante, e a correlacao devolvida e a mesma da linha do log."
    criterio_aceite: "Os testes listados passam e grep console\\. nesses tres servicos nao acha nada."
    depende_de: ["T-02.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.05
    titulo: "Regra que proibe console novo em src"
    fase: F-02.1
    status: pendente
    objetivo: "Impor por ESLint e por teste de arquitetura que nenhum console.* exista em src/ fora de src/lib/log.ts, com excecao declarada para prisma/seed.ts, scripts e tests."
    arquivos:
      cria: ["tests/log-arquitetura.test.ts"]
      altera: ["eslint.config.mjs", "tests/projeto.test.ts"]
    teste_integracao: "O ESLint real aplicado a um arquivo temporario de src/ com console.log reporta no-console e aplicado a src/lib/log.ts, prisma/seed.ts e scripts nao reporta."
    teste_funcional: "A varredura de todos os arquivos de src/ por console. acha ocorrencia so em src/lib/log.ts."
    criterio_aceite: "tests/log-arquitetura.test.ts passa e npm run lint termina sem erro."
    depende_de: ["T-02.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.06
    titulo: "Paginas de erro e not-found com codigo de referencia"
    fase: F-02.2
    status: pendente
    objetivo: "Criar error.tsx, global-error.tsx e not-found.tsx na raiz de src/app, ajustar o error.tsx do sistema e o onRequestError que grava erro_na_requisicao com digest e correlacao."
    arquivos:
      cria: ["src/app/error.tsx", "src/app/global-error.tsx", "src/app/not-found.tsx", "src/componentes/CodigoDeReferencia.tsx", "tests/erro-paginas.test.tsx"]
      altera: ["src/app/(sistema)/error.tsx", "src/instrumentation.ts", "src/estilos/global.css", "tests/instrumentacao.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "Renderizar o error com digest mostra a frase Codigo de referencia seguida do digest e o botao Tentar de novo, e onRequestError grava a linha erro_na_requisicao com digest, correlacao do cabecalho, rota e nome do erro."
    teste_funcional: "A pagina de erro sem digest nao mostra codigo, o not-found mostra o codigo da correlacao e nenhum dos tres mostra a mensagem do erro."
    criterio_aceite: "tests/erro-paginas.test.tsx e tests/instrumentacao.test.ts passam e tests/tokens.test.ts continua passando sem cor literal."
    depende_de: ["T-02.05"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.07
    titulo: "A pilha nao vaza em rota de API nem em pagina"
    fase: F-02.2
    status: pendente
    objetivo: "Provar contra o servidor de producao com banco inacessivel que a rota de API e a pagina devolvem so mensagem generica e codigo de referencia, com X-Correlacao e a mesma referencia no log."
    arquivos:
      cria: ["tests/pilha-nao-vaza.test.ts"]
      altera: ["tests/apoio/servidor.ts"]
    teste_integracao: "Com DATABASE_URL apontando para arquivo inacessivel, GET em uma rota publica de API devolve 5xx com JSON generico e Codigo de referencia, e GET em uma pagina devolve a pagina de erro, ambas com X-Correlacao."
    teste_funcional: "Nem o corpo das respostas nem o log do servidor contem at e caminho de arquivo de pilha, node_modules, a URL do banco ou a mensagem do erro, e o log tem a referencia mostrada."
    criterio_aceite: "tests/pilha-nao-vaza.test.ts passa contra o build de producao."
    depende_de: ["T-02.06"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: "Correlacao por requisicao no proxy"
objetivo: "Fazer o proxy gerar a correlacao de toda requisicao, repassa-la por cabecalho ao handler, devolve-la em X-Correlacao e ler o cabecalho no servidor; chat-erros passa a gerar o codigo pelo log."
arquivos:
  cria: ["src/app/correlacao-servidor.ts", "tests/correlacao.test.ts", "docs/operacao-e-backup/sprint-02/sprint.md", "docs/operacao-e-backup/sprint-02/fases.md", "docs/operacao-e-backup/sprint-02/tasks.md"]
  altera: ["src/proxy.ts", "src/servicos/chat-erros.ts", "tests/chat-erros.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "O proxy chamado com uma requisicao a /api/qualquer devolve X-Correlacao de 8 caracteres hexadecimais, repassa x-correlacao ao handler e ignora o valor que o cliente mandou, e em /embed continua definindo o frame-ancestors."
teste_funcional: "O matcher do proxy cobre a raiz e as rotas de API e de pagina e nao cobre /_next/static, /_next/image nem favicon.ico, e gerarCorrelacao de chat-erros devolve 8 caracteres hexadecimais."
criterio_aceite: "tests/correlacao.test.ts, tests/chat-erros.test.ts e tests/embed-cabecalhos.test.ts passam e toda resposta de teste ao servidor tem X-Correlacao."
depende_de: ["T-01.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.02
titulo: "Servicos de conhecimento, Telegram e historico usam o log"
objetivo: "Trocar os console.* de fontes, fila de fontes, transcricao, agentes, canal Telegram, webhook do Telegram e historico por chamadas ao log, com a fila rodando cada fonte dentro de comCorrelacao."
arquivos:
  cria: []
  altera: ["src/servicos/fontes.ts", "src/servicos/fontes-fila.ts", "src/servicos/transcricao-de-midia.ts", "src/servicos/agentes.ts", "src/servicos/canal-telegram.ts", "src/servicos/telegram-webhook.ts", "src/servicos/historico.ts", "tests/fontes-fila.test.ts", "tests/fontes-fila-video.test.ts", "tests/fontes-fila-execucao.test.ts", "tests/fontes-ciclo.test.ts", "tests/agentes.test.ts", "tests/historico-apagar.test.ts", "tests/telegram-acoes.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "A falha da fila de fontes, do armazenamento de agente e de um ouvinte de exclusao de conversa vira uma linha JSON do log com nivel erro, msg do evento e os ids, sem conteudo, e a linha da fila leva a correlacao da fonte."
teste_funcional: "Nenhum arquivo dessa lista contem console. e o processamento de uma fonte com erro mantem a mensagem generica ao usuario e o estado erro da fonte."
criterio_aceite: "Os testes de fila, agentes, historico e telegram-acoes passam lendo msg no lugar de evento e grep console\\. nesses arquivos nao acha nada."
depende_de: ["T-02.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.03
titulo: "Camada de apresentacao e instrumentacao usam o log com codigo de referencia"
objetivo: "Trocar os console.* de acoes, fluxo SSE, respostas de erro das rotas e instrumentation pelo log, com o erro inesperado devolvendo o codigo de referencia e gravando so nome e codigo."
arquivos:
  cria: []
  altera: ["src/app/acoes.ts", "src/app/eventos-sse.ts", "src/app/api/conversas/resposta.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "src/instrumentation.ts", "tests/eventos-sse.test.ts", "tests/instrumentacao.test.ts", "tests/integracoes-conexao.test.ts", "tests/conversas-apagar-rota.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "Um erro inesperado numa acao de servidor e numa rota de conversas grava uma linha do log com o nome do erro e a correlacao e devolve a mensagem generica com Codigo de referencia igual a correlacao gravada."
teste_funcional: "A mensagem devolvida ao usuario e a linha do log nao contem a mensagem do erro, a pilha, a chave nem o objeto do erro, e register() registra falha de tarefa pelo log sem derrubar as demais."
criterio_aceite: "tests/eventos-sse.test.ts, tests/instrumentacao.test.ts, tests/integracoes-conexao.test.ts e tests/conversas-apagar-rota.test.ts passam e esses arquivos nao tem console."
depende_de: ["T-02.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.04
titulo: "Chat, auditoria e expurgo usam o log"
objetivo: "Trocar os console.* do turno de conversa, da auditoria de melhor esforco e do agendador do expurgo pelo log."
arquivos:
  cria: []
  altera: ["src/servicos/chat.ts", "src/servicos/auditoria.ts", "src/servicos/expurgo.ts", "tests/chat-falhas.test.ts", "tests/chat-fundamentado.test.ts", "tests/chat-fontes.test.ts", "tests/auditoria.test.ts", "tests/auditoria-ouvintes.test.ts", "tests/auditoria-integracoes.test.ts", "tests/expurgo-agendador.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "O erro do turno de conversa, a falha de gravar fontes, a recuperacao, a falha da auditoria de melhor esforco e a falha do expurgo viram linhas do log com msg, correlacao e ids, nunca o texto da pergunta ou da resposta."
teste_funcional: "O erro inesperado do chat continua devolvendo Codigo de referencia ao operador e a frase unica ao visitante, e a correlacao devolvida e a mesma da linha do log."
criterio_aceite: "Os testes listados passam e grep console\\. nesses tres servicos nao acha nada."
depende_de: ["T-02.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.05
titulo: "Regra que proibe console novo em src"
objetivo: "Impor por ESLint e por teste de arquitetura que nenhum console.* exista em src/ fora de src/lib/log.ts, com excecao declarada para prisma/seed.ts, scripts e tests."
arquivos:
  cria: ["tests/log-arquitetura.test.ts"]
  altera: ["eslint.config.mjs", "tests/projeto.test.ts"]
teste_integracao: "O ESLint real aplicado a um arquivo temporario de src/ com console.log reporta no-console e aplicado a src/lib/log.ts, prisma/seed.ts e scripts nao reporta."
teste_funcional: "A varredura de todos os arquivos de src/ por console. acha ocorrencia so em src/lib/log.ts."
criterio_aceite: "tests/log-arquitetura.test.ts passa e npm run lint termina sem erro."
depende_de: ["T-02.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.06
titulo: "Paginas de erro e not-found com codigo de referencia"
objetivo: "Criar error.tsx, global-error.tsx e not-found.tsx na raiz de src/app, ajustar o error.tsx do sistema e o onRequestError que grava erro_na_requisicao com digest e correlacao."
arquivos:
  cria: ["src/app/error.tsx", "src/app/global-error.tsx", "src/app/not-found.tsx", "src/componentes/CodigoDeReferencia.tsx", "tests/erro-paginas.test.tsx"]
  altera: ["src/app/(sistema)/error.tsx", "src/instrumentation.ts", "src/estilos/global.css", "tests/instrumentacao.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "Renderizar o error com digest mostra a frase Codigo de referencia seguida do digest e o botao Tentar de novo, e onRequestError grava a linha erro_na_requisicao com digest, correlacao do cabecalho, rota e nome do erro."
teste_funcional: "A pagina de erro sem digest nao mostra codigo, o not-found mostra o codigo da correlacao e nenhum dos tres mostra a mensagem do erro."
criterio_aceite: "tests/erro-paginas.test.tsx e tests/instrumentacao.test.ts passam e tests/tokens.test.ts continua passando sem cor literal."
depende_de: ["T-02.05"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.07
titulo: "A pilha nao vaza em rota de API nem em pagina"
objetivo: "Provar contra o servidor de producao com banco inacessivel que a rota de API e a pagina devolvem so mensagem generica e codigo de referencia, com X-Correlacao e a mesma referencia no log."
arquivos:
  cria: ["tests/pilha-nao-vaza.test.ts"]
  altera: ["tests/apoio/servidor.ts"]
teste_integracao: "Com DATABASE_URL apontando para arquivo inacessivel, GET em uma rota publica de API devolve 5xx com JSON generico e Codigo de referencia, e GET em uma pagina devolve a pagina de erro, ambas com X-Correlacao."
teste_funcional: "Nem o corpo das respostas nem o log do servidor contem at e caminho de arquivo de pilha, node_modules, a URL do banco ou a mensagem do erro, e o log tem a referencia mostrada."
criterio_aceite: "tests/pilha-nao-vaza.test.ts passa contra o build de producao."
depende_de: ["T-02.06"]
paralelizavel: false
status: pendente
```

