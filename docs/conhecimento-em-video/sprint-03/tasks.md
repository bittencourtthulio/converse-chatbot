---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-03
atualizado_em: 2026-09-30
tasks:
  - id: T-03.01
    titulo: "Armazenamento: gravar em stream"
    fase: F-03.1
    status: concluida
    objetivo: "Acrescentar a armazenamento.ts gravarDeStream que escreve o corpo em original.parcial por stream, conta bytes, aborta no teto, confere os primeiros bytes e renomeia."
    arquivos:
      cria: ["tests/armazenamento-stream.test.ts", "docs/conhecimento-em-video/sprint-03/sprint.md", "docs/conhecimento-em-video/sprint-03/fases.md", "docs/conhecimento-em-video/sprint-03/tasks.md"]
      altera: ["src/lib/armazenamento.ts"]
    teste_integracao: "Um ReadableStream de 5 MB gravado por gravarDeStream gera o original com os mesmos bytes sem sobrar o parcial e o caminho devolvido e o relativo da fonte."
    teste_funcional: "Um stream acima do teto aborta com erro de tamanho e apaga o parcial, um conferidor de inicio que rejeita apaga o parcial e um stream que falha no meio apaga o parcial."
    criterio_aceite: "tests/armazenamento-stream.test.ts e tests/armazenamento.test.ts passam."
    depende_de: ["T-02.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.02
    titulo: "Armazenamento: pastas e segmentos"
    fase: F-03.1
    status: concluida
    objetivo: "Acrescentar a armazenamento.ts o caminho absoluto interno do original, a pasta de audio e os arquivos de segmento NN.txt (gravar, ler, listar e apagar a pasta de trabalho)."
    arquivos:
      cria: ["tests/armazenamento-segmentos.test.ts"]
      altera: ["src/lib/armazenamento.ts"]
    teste_integracao: "Gravar os segmentos 0 e 2 de uma fonte e listar devolve exatamente esses dois indices lendo o texto de cada um e apagar a pasta de trabalho remove audio e segmentos mas mantem o original."
    teste_funcional: "Um id fora do alfabeto fechado lanca erro de identificador, o indice de segmento negativo lanca erro e o caminho absoluto do original fica dentro da raiz."
    criterio_aceite: "tests/armazenamento-segmentos.test.ts passa."
    depende_de: ["T-03.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.03
    titulo: "Servico: adicionar video"
    fase: F-03.2
    status: pendente
    objetivo: "Acrescentar a fontes.ts adicionarVideo (nome sanitizado, limite, assinatura, gravacao em stream, linha pendente) e os quatro campos novos em FonteVisivel e visaoDaFonte."
    arquivos:
      cria: ["tests/fontes-video.test.ts"]
      altera: ["src/servicos/fontes.ts"]
    teste_integracao: "Um stream de MP3 gerado pelo ffmpeg vira uma fonte pendente de tipo video com o original em disco, o tamanho real e o nome sanitizado como titulo."
    teste_funcional: "Extensao fora da lista da erro formato_nao_aceito 415, assinatura incoerente da assinatura_incoerente 415, corpo vazio da arquivo_vazio 422, acima do limite da arquivo_grande_demais 413 e nenhuma falha deixa diretorio ou linha."
    criterio_aceite: "tests/fontes-video.test.ts e tests/fontes.test.ts passam."
    depende_de: ["T-03.01", "T-02.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.04
    titulo: "Rota de upload de video"
    fase: F-03.2
    status: pendente
    objetivo: "Criar POST /api/agentes/[id]/fontes/video com sessao, recusa por Content-Length, corpo bruto em stream ate o servico e resposta 202 com a fonte."
    arquivos:
      cria: ["src/app/api/agentes/[id]/fontes/video/route.ts", "tests/video-rota.test.ts"]
      altera: []
    teste_integracao: "Contra o servidor de producao um corpo de MP3 enviado com nome na query vira fonte pendente, aparece no GET da lista e o original em disco tem os mesmos bytes."
    teste_funcional: "Sem sessao responde 401, Content-Length acima do limite responde 413 sem ler o corpo, um txt com nome mp4 responde 415, corpo vazio responde 422 e nenhuma resposta traz o caminho do arquivo."
    criterio_aceite: "tests/video-rota.test.ts passa com npm run build feito antes."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-03.01
titulo: "Armazenamento: gravar em stream"
objetivo: "Acrescentar a armazenamento.ts gravarDeStream que escreve o corpo em original.parcial por stream, conta bytes, aborta no teto, confere os primeiros bytes e renomeia."
arquivos:
  cria: ["tests/armazenamento-stream.test.ts", "docs/conhecimento-em-video/sprint-03/sprint.md", "docs/conhecimento-em-video/sprint-03/fases.md", "docs/conhecimento-em-video/sprint-03/tasks.md"]
  altera: ["src/lib/armazenamento.ts"]
teste_integracao: "Um ReadableStream de 5 MB gravado por gravarDeStream gera o original com os mesmos bytes sem sobrar o parcial e o caminho devolvido e o relativo da fonte."
teste_funcional: "Um stream acima do teto aborta com erro de tamanho e apaga o parcial, um conferidor de inicio que rejeita apaga o parcial e um stream que falha no meio apaga o parcial."
criterio_aceite: "tests/armazenamento-stream.test.ts e tests/armazenamento.test.ts passam."
depende_de: ["T-02.03"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/armazenamento-stream.test.ts e tests/armazenamento.test.ts, 15 passed
```

---

```yaml
id: T-03.02
titulo: "Armazenamento: pastas e segmentos"
objetivo: "Acrescentar a armazenamento.ts o caminho absoluto interno do original, a pasta de audio e os arquivos de segmento NN.txt (gravar, ler, listar e apagar a pasta de trabalho)."
arquivos:
  cria: ["tests/armazenamento-segmentos.test.ts"]
  altera: ["src/lib/armazenamento.ts"]
teste_integracao: "Gravar os segmentos 0 e 2 de uma fonte e listar devolve exatamente esses dois indices lendo o texto de cada um e apagar a pasta de trabalho remove audio e segmentos mas mantem o original."
teste_funcional: "Um id fora do alfabeto fechado lanca erro de identificador, o indice de segmento negativo lanca erro e o caminho absoluto do original fica dentro da raiz."
criterio_aceite: "tests/armazenamento-segmentos.test.ts passa."
depende_de: ["T-03.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/armazenamento-segmentos.test.ts, tests/armazenamento-stream.test.ts, tests/armazenamento.test.ts e tests/projeto.test.ts, 99 passed
```

---

```yaml
id: T-03.03
titulo: "Servico: adicionar video"
objetivo: "Acrescentar a fontes.ts adicionarVideo (nome sanitizado, limite, assinatura, gravacao em stream, linha pendente) e os quatro campos novos em FonteVisivel e visaoDaFonte."
arquivos:
  cria: ["tests/fontes-video.test.ts"]
  altera: ["src/servicos/fontes.ts"]
teste_integracao: "Um stream de MP3 gerado pelo ffmpeg vira uma fonte pendente de tipo video com o original em disco, o tamanho real e o nome sanitizado como titulo."
teste_funcional: "Extensao fora da lista da erro formato_nao_aceito 415, assinatura incoerente da assinatura_incoerente 415, corpo vazio da arquivo_vazio 422, acima do limite da arquivo_grande_demais 413 e nenhuma falha deixa diretorio ou linha."
criterio_aceite: "tests/fontes-video.test.ts e tests/fontes.test.ts passam."
depende_de: ["T-03.01", "T-02.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.04
titulo: "Rota de upload de video"
objetivo: "Criar POST /api/agentes/[id]/fontes/video com sessao, recusa por Content-Length, corpo bruto em stream ate o servico e resposta 202 com a fonte."
arquivos:
  cria: ["src/app/api/agentes/[id]/fontes/video/route.ts", "tests/video-rota.test.ts"]
  altera: []
teste_integracao: "Contra o servidor de producao um corpo de MP3 enviado com nome na query vira fonte pendente, aparece no GET da lista e o original em disco tem os mesmos bytes."
teste_funcional: "Sem sessao responde 401, Content-Length acima do limite responde 413 sem ler o corpo, um txt com nome mp4 responde 415, corpo vazio responde 422 e nenhuma resposta traz o caminho do arquivo."
criterio_aceite: "tests/video-rota.test.ts passa com npm run build feito antes."
depende_de: ["T-03.03"]
paralelizavel: false
status: pendente
```

---

