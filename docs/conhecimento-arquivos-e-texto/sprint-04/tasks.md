---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-04
atualizado_em: 2026-09-30
tasks:
  - id: T-04.01
    titulo: "Fila: processar uma fonte"
    fase: F-04.1
    status: concluida
    objetivo: "Ler o original, extrair, dividir e gravar trechos e pronto em transacao, ou gravar erro amigavel."
    arquivos:
      cria: ["src/servicos/fontes-fila.ts", "tests/apoio/fontes.ts", "tests/fontes-fila.test.ts"]
      altera: []
    teste_integracao: "Uma fonte de texto e uma de PDF criadas direto no banco e no armazenamento temporario viram pronto com trechos e totais corretos."
    teste_funcional: "Uma fonte cujo arquivo sumiu e uma de PDF escaneado viram status erro com mensagemErro em portugues, sem caminho interno, e a fila nao lanca."
    criterio_aceite: "tests/fontes-fila.test.ts passa e um log JSON de correlacao sai so em erro inesperado, sem conteudo do arquivo."
    depende_de: ["T-02.01", "T-02.02", "T-02.04", "T-03.09"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-04.02
    titulo: "Fila: concorrencia, retomada e singleton"
    fase: F-04.1
    status: pendente
    objetivo: "Processar pendentes com concorrencia 2, retomar processando e ligar o acordar automatico."
    arquivos:
      cria: ["tests/fontes-fila-execucao.test.ts"]
      altera: ["src/servicos/fontes-fila.ts"]
    teste_integracao: "processarPendentes com cinco fontes pendentes e um extrator lento simulado nunca tem mais de duas em processando ao mesmo tempo e termina com todas prontas."
    teste_funcional: "retomar() converte processando em pendente, uma fonte excluida durante o processamento tem o resultado descartado sem erro, e acordar() nao faz nada antes de iniciar()."
    criterio_aceite: "tests/fontes-fila-execucao.test.ts passa."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.03
    titulo: "Servico: texto, listar, obter, resumo e trechos"
    fase: F-04.2
    status: pendente
    objetivo: "Criar o servico fontes com texto colado, consulta e resumo."
    arquivos:
      cria: ["src/servicos/fontes.ts", "tests/fontes.test.ts"]
      altera: []
    teste_integracao: "adicionarTexto grava o arquivo original, cria a Fonte pendente e, depois de processarPendentes, listar e trechosDaFonte devolvem pronto e a primeira pagina de trechos."
    teste_funcional: "adicionarTexto recusa titulo vazio, titulo com 121 caracteres, conteudo vazio e conteudo com 200001 caracteres com 422 e mensagem, resumo devolve total, prontas, emProcessamento, comErro e caracteres, e agente ou fonte de outro agente e 404."
    criterio_aceite: "tests/fontes.test.ts passa e a visao devolvida nao tem o campo caminhoArquivo."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.04
    titulo: "Servico: adicionarArquivos"
    fase: F-04.2
    status: pendente
    objetivo: "Validar cada arquivo e devolver um resultado por arquivo, aceito ou recusado com motivo."
    arquivos:
      cria: ["tests/fontes-arquivos.test.ts"]
      altera: ["src/servicos/fontes.ts"]
    teste_integracao: "Enviar as nove fixtures reais aceita todas, e depois de processarPendentes todas ficam prontas com trechos."
    teste_funcional: "Um lote com um arquivo vazio, um .exe, um .pdf falso, um acima do limite e um valido recusa os quatro com motivos distintos em portugues e aceita so o valido."
    criterio_aceite: "tests/fontes-arquivos.test.ts passa e nenhum motivo contem caminho interno."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.05
    titulo: "Servico: excluir e reprocessar"
    fase: F-04.2
    status: pendente
    objetivo: "Excluir com arquivo e reprocessar apenas fonte em erro."
    arquivos:
      cria: ["tests/fontes-ciclo.test.ts"]
      altera: ["src/servicos/fontes.ts"]
    teste_integracao: "Excluir uma fonte pronta remove a linha, os trechos e o diretorio do armazenamento temporario."
    teste_funcional: "reprocessar uma fonte em erro cujo arquivo foi corrigido leva a pronto substituindo os trechos, e reprocessar fonte pronta ou pendente lanca 409."
    criterio_aceite: "tests/fontes-ciclo.test.ts passa."
    depende_de: ["T-04.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.06
    titulo: "Subida do servidor: instrumentation"
    fase: F-04.3
    status: pendente
    objetivo: "Retomar e iniciar a fila na subida, so no runtime Node e sem bloquear."
    arquivos:
      cria: ["src/instrumentation.ts", "tests/instrumentacao.test.ts"]
      altera: []
    teste_integracao: "register() com NEXT_RUNTIME=nodejs converte processando em pendente no banco de teste e liga a fila, e com NEXT_RUNTIME=edge nao faz nada."
    teste_funcional: "register() devolve sem esperar o fim do processamento de uma fonte lenta e nao lanca quando o banco esta vazio."
    criterio_aceite: "tests/instrumentacao.test.ts passa e src/instrumentation.ts importa a fila por import dinamico."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

> Um bloco por task.

---

```yaml
id: T-04.01
titulo: Fila: processar uma fonte
objetivo: Ler o original, extrair, dividir e gravar trechos e pronto em transacao, ou gravar erro amigavel.
arquivos:
  cria: ["src/servicos/fontes-fila.ts", "tests/apoio/fontes.ts", "tests/fontes-fila.test.ts"]
  altera: []
teste_integracao: Uma fonte de texto e uma de PDF criadas direto no banco e no armazenamento temporario viram pronto com trechos e totais corretos.
teste_funcional: Uma fonte cujo arquivo sumiu e uma de PDF escaneado viram status erro com mensagemErro em portugues, sem caminho interno, e a fila nao lanca.
criterio_aceite: tests/fontes-fila.test.ts passa e um log JSON de correlacao sai so em erro inesperado, sem conteudo do arquivo.
depende_de: ["T-02.01", "T-02.02", "T-02.04", "T-03.09"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 765 passed 765, 0 failed
```

---

```yaml
id: T-04.02
titulo: Fila: concorrencia, retomada e singleton
objetivo: Processar pendentes com concorrencia 2, retomar processando e ligar o acordar automatico.
arquivos:
  cria: ["tests/fontes-fila-execucao.test.ts"]
  altera: ["src/servicos/fontes-fila.ts"]
teste_integracao: processarPendentes com cinco fontes pendentes e um extrator lento simulado nunca tem mais de duas em processando ao mesmo tempo e termina com todas prontas.
teste_funcional: retomar() converte processando em pendente, uma fonte excluida durante o processamento tem o resultado descartado sem erro, e acordar() nao faz nada antes de iniciar().
criterio_aceite: tests/fontes-fila-execucao.test.ts passa.
depende_de: ["T-04.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.03
titulo: Servico: texto, listar, obter, resumo e trechos
objetivo: Criar o servico fontes com texto colado, consulta e resumo.
arquivos:
  cria: ["src/servicos/fontes.ts", "tests/fontes.test.ts"]
  altera: []
teste_integracao: adicionarTexto grava o arquivo original, cria a Fonte pendente e, depois de processarPendentes, listar e trechosDaFonte devolvem pronto e a primeira pagina de trechos.
teste_funcional: adicionarTexto recusa titulo vazio, titulo com 121 caracteres, conteudo vazio e conteudo com 200001 caracteres com 422 e mensagem, resumo devolve total, prontas, emProcessamento, comErro e caracteres, e agente ou fonte de outro agente e 404.
criterio_aceite: tests/fontes.test.ts passa e a visao devolvida nao tem o campo caminhoArquivo.
depende_de: ["T-04.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.04
titulo: Servico: adicionarArquivos
objetivo: Validar cada arquivo e devolver um resultado por arquivo, aceito ou recusado com motivo.
arquivos:
  cria: ["tests/fontes-arquivos.test.ts"]
  altera: ["src/servicos/fontes.ts"]
teste_integracao: Enviar as nove fixtures reais aceita todas, e depois de processarPendentes todas ficam prontas com trechos.
teste_funcional: Um lote com um arquivo vazio, um .exe, um .pdf falso, um acima do limite e um valido recusa os quatro com motivos distintos em portugues e aceita so o valido.
criterio_aceite: tests/fontes-arquivos.test.ts passa e nenhum motivo contem caminho interno.
depende_de: ["T-04.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.05
titulo: Servico: excluir e reprocessar
objetivo: Excluir com arquivo e reprocessar apenas fonte em erro.
arquivos:
  cria: ["tests/fontes-ciclo.test.ts"]
  altera: ["src/servicos/fontes.ts"]
teste_integracao: Excluir uma fonte pronta remove a linha, os trechos e o diretorio do armazenamento temporario.
teste_funcional: reprocessar uma fonte em erro cujo arquivo foi corrigido leva a pronto substituindo os trechos, e reprocessar fonte pronta ou pendente lanca 409.
criterio_aceite: tests/fontes-ciclo.test.ts passa.
depende_de: ["T-04.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.06
titulo: Subida do servidor: instrumentation
objetivo: Retomar e iniciar a fila na subida, so no runtime Node e sem bloquear.
arquivos:
  cria: ["src/instrumentation.ts", "tests/instrumentacao.test.ts"]
  altera: []
teste_integracao: register() com NEXT_RUNTIME=nodejs converte processando em pendente no banco de teste e liga a fila, e com NEXT_RUNTIME=edge nao faz nada.
teste_funcional: register() devolve sem esperar o fim do processamento de uma fonte lenta e nao lanca quando o banco esta vazio.
criterio_aceite: tests/instrumentacao.test.ts passa e src/instrumentation.ts importa a fila por import dinamico.
depende_de: ["T-04.02"]
paralelizavel: false
status: pendente
```
