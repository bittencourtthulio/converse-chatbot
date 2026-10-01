---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-02
atualizado_em: 2026-10-01
tasks:
  - id: T-02.01
    titulo: "Logica pura do historico"
    fase: F-02.1
    status: concluida
    objetivo: "Escrever as funcoes puras de rotulo mascarado, previa de 120 caracteres, escape de LIKE e validacao dos filtros."
    arquivos:
      cria: ["src/servicos/historico-logica.ts", "tests/historico-logica.test.ts", "docs/historico-de-conversas/sprint-02/sprint.md", "docs/historico-de-conversas/sprint-02/fases.md", "docs/historico-de-conversas/sprint-02/tasks.md"]
      altera: []
    teste_integracao: "O teste importa as funcoes puras e as exercita com entradas de widget, telegram, painel e usuario removido, sem banco."
    teste_funcional: "O rotulo do widget com visitanteId abcdef123456 e Visitante abcdef, o escape transforma percentual, sublinhado e barra invertida em literais, a previa corta em 120 caracteres e pagina 0 ou tamanho 101 viram erro 422."
    criterio_aceite: "tests/historico-logica.test.ts passa."
    depende_de: ["T-01.04"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.02
    titulo: "listarConversas: pagina, filtros e sem N+1"
    fase: F-02.1
    status: concluida
    objetivo: "Implementar listarConversas com filtro por agente, canal e periodo, ordenacao por atividade e uma consulta agregada."
    arquivos:
      cria: ["src/servicos/historico.ts", "tests/historico-listar.test.ts", "tests/historico-consultas.test.ts"]
      altera: []
    teste_integracao: "Contra o SQLite de teste com conversas dos tres canais, a lista devolve itens com agente, canal, rotulo, numero de mensagens, ultima atividade e previa e o contador prova no maximo duas consultas para 30 conversas."
    teste_funcional: "Com 30 conversas, tamanho 25 devolve 25 itens e total 30, a pagina 2 devolve 5, filtrar por agente e canal reduz o total e a ordem e a da atividade mais recente."
    criterio_aceite: "tests/historico-listar.test.ts e tests/historico-consultas.test.ts passam."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.03
    titulo: "Filtro por texto com LIKE"
    fase: F-02.1
    status: pendente
    objetivo: "Acrescentar o filtro de texto com LIKE escapado e o teto de 200 conversas casadas."
    arquivos:
      cria: ["tests/historico-texto.test.ts"]
      altera: ["src/servicos/historico.ts"]
    teste_integracao: "Contra o banco de teste, o texto casa o conteudo de qualquer mensagem da conversa e uma busca por percentual literal nao casa tudo."
    teste_funcional: "Buscar entrega acha so a conversa com essa palavra, buscar 50% acha so a que tem o texto 50%, uma busca com aspas e ponto e virgula nao quebra, e 250 conversas casadas devolvem no maximo 200."
    criterio_aceite: "tests/historico-texto.test.ts passa e nenhum teste usa queryRawUnsafe."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.04
    titulo: "obterConversa e exportarConversaTexto"
    fase: F-02.2
    status: pendente
    objetivo: "Ler uma conversa com todas as mensagens em ordem e fontes, e gerar o texto de exportacao."
    arquivos:
      cria: ["tests/historico-obter.test.ts"]
      altera: ["src/servicos/historico.ts"]
    teste_integracao: "Contra o banco de teste, obterConversa devolve mensagens em ordem cronologica com as fontes lidas por lerFontesGravadas e id inexistente da 404."
    teste_funcional: "A exportacao de uma conversa do widget traz agente, canal, rotulo mascarado, horarios e mensagens e nao contem o visitanteId completo."
    criterio_aceite: "tests/historico-obter.test.ts passa."
    depende_de: ["T-02.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.05
    titulo: "apagarConversa, apagarConversas e aoApagarConversa"
    fase: F-02.2
    status: pendente
    objetivo: "Apagar uma ou varias conversas em transacao, devolver a contagem e avisar o ouvinte sem conteudo."
    arquivos:
      cria: ["tests/historico-apagar.test.ts"]
      altera: ["src/servicos/historico.ts"]
    teste_integracao: "Contra o banco de teste, apagar remove conversas e mensagens em cascata e o ouvinte registrado recebe um evento por conversa apagada."
    teste_funcional: "Apagar tres ids dos quais um nao existe devolve dois, um lote de 51 ids ou vazio da 422, o ouvinte recebe conversaId, agenteId, canal, usuarioId e quantidadeDeMensagens e nunca texto nem identificador externo."
    criterio_aceite: "tests/historico-apagar.test.ts passa."
    depende_de: ["T-02.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-02.01
titulo: "Logica pura do historico"
objetivo: "Escrever as funcoes puras de rotulo mascarado, previa de 120 caracteres, escape de LIKE e validacao dos filtros."
arquivos:
  cria: ["src/servicos/historico-logica.ts", "tests/historico-logica.test.ts", "docs/historico-de-conversas/sprint-02/sprint.md", "docs/historico-de-conversas/sprint-02/fases.md", "docs/historico-de-conversas/sprint-02/tasks.md"]
  altera: []
teste_integracao: "O teste importa as funcoes puras e as exercita com entradas de widget, telegram, painel e usuario removido, sem banco."
teste_funcional: "O rotulo do widget com visitanteId abcdef123456 e Visitante abcdef, o escape transforma percentual, sublinhado e barra invertida em literais, a previa corta em 120 caracteres e pagina 0 ou tamanho 101 viram erro 422."
criterio_aceite: "tests/historico-logica.test.ts passa."
depende_de: ["T-01.04"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/historico-logica.test.ts 23 passed
```

---

```yaml
id: T-02.02
titulo: "listarConversas: pagina, filtros e sem N+1"
objetivo: "Implementar listarConversas com filtro por agente, canal e periodo, ordenacao por atividade e uma consulta agregada."
arquivos:
  cria: ["src/servicos/historico.ts", "tests/historico-listar.test.ts", "tests/historico-consultas.test.ts"]
  altera: []
teste_integracao: "Contra o SQLite de teste com conversas dos tres canais, a lista devolve itens com agente, canal, rotulo, numero de mensagens, ultima atividade e previa e o contador prova no maximo duas consultas para 30 conversas."
teste_funcional: "Com 30 conversas, tamanho 25 devolve 25 itens e total 30, a pagina 2 devolve 5, filtrar por agente e canal reduz o total e a ordem e a da atividade mais recente."
criterio_aceite: "tests/historico-listar.test.ts e tests/historico-consultas.test.ts passam."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/historico-listar.test.ts e tests/historico-consultas.test.ts 11 passed
```

---

```yaml
id: T-02.03
titulo: "Filtro por texto com LIKE"
objetivo: "Acrescentar o filtro de texto com LIKE escapado e o teto de 200 conversas casadas."
arquivos:
  cria: ["tests/historico-texto.test.ts"]
  altera: ["src/servicos/historico.ts"]
teste_integracao: "Contra o banco de teste, o texto casa o conteudo de qualquer mensagem da conversa e uma busca por percentual literal nao casa tudo."
teste_funcional: "Buscar entrega acha so a conversa com essa palavra, buscar 50% acha so a que tem o texto 50%, uma busca com aspas e ponto e virgula nao quebra, e 250 conversas casadas devolvem no maximo 200."
criterio_aceite: "tests/historico-texto.test.ts passa e nenhum teste usa queryRawUnsafe."
depende_de: ["T-02.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.04
titulo: "obterConversa e exportarConversaTexto"
objetivo: "Ler uma conversa com todas as mensagens em ordem e fontes, e gerar o texto de exportacao."
arquivos:
  cria: ["tests/historico-obter.test.ts"]
  altera: ["src/servicos/historico.ts"]
teste_integracao: "Contra o banco de teste, obterConversa devolve mensagens em ordem cronologica com as fontes lidas por lerFontesGravadas e id inexistente da 404."
teste_funcional: "A exportacao de uma conversa do widget traz agente, canal, rotulo mascarado, horarios e mensagens e nao contem o visitanteId completo."
criterio_aceite: "tests/historico-obter.test.ts passa."
depende_de: ["T-02.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.05
titulo: "apagarConversa, apagarConversas e aoApagarConversa"
objetivo: "Apagar uma ou varias conversas em transacao, devolver a contagem e avisar o ouvinte sem conteudo."
arquivos:
  cria: ["tests/historico-apagar.test.ts"]
  altera: ["src/servicos/historico.ts"]
teste_integracao: "Contra o banco de teste, apagar remove conversas e mensagens em cascata e o ouvinte registrado recebe um evento por conversa apagada."
teste_funcional: "Apagar tres ids dos quais um nao existe devolve dois, um lote de 51 ids ou vazio da 422, o ouvinte recebe conversaId, agenteId, canal, usuarioId e quantidadeDeMensagens e nunca texto nem identificador externo."
criterio_aceite: "tests/historico-apagar.test.ts passa."
depende_de: ["T-02.04"]
paralelizavel: false
status: pendente
```

