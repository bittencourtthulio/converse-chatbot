---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-04
atualizado_em: 2026-09-30
tasks:
  - id: T-04.01
    titulo: "Marcadores de tempo e montagem"
    fase: F-04.1
    status: concluida
    objetivo: "Criar src/servicos/transcricao-marcadores.ts puro com o marcador [MM:SS] ou [H:MM:SS], a juncao das partes e a montagem do texto de legenda com marcador a cada cerca de 60 segundos."
    arquivos:
      cria: ["src/servicos/transcricao-marcadores.ts", "tests/transcricao-marcadores.test.ts", "docs/conhecimento-em-video/sprint-04/sprint.md", "docs/conhecimento-em-video/sprint-04/fases.md", "docs/conhecimento-em-video/sprint-04/tasks.md"]
      altera: []
    teste_integracao: "A juncao de tres partes de 600 segundos gera o texto com [00:00], [10:00] e [20:00] no comeco de cada uma separadas por linha em branco e passa por dividirEmTrechos sem perder o marcador da primeira parte."
    teste_funcional: "O marcador de 3600 segundos e [1:00:00], uma parte vazia e ignorada sem marcador e as falas de legenda de 0 a 130 segundos recebem marcador em 00:00, 01:00 e 02:00."
    criterio_aceite: "tests/transcricao-marcadores.test.ts passa."
    depende_de: ["T-03.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.02
    titulo: "Modelo de transcricao efetivo"
    fase: F-04.1
    status: concluida
    objetivo: "Acrescentar a integracoes.ts o modelo efetivo (banco, depois ambiente, depois constante), salvar e restaurar o padrao so pelo admin e leitura do modelo em uso por qualquer usuario."
    arquivos:
      cria: ["tests/integracoes-transcricao.test.ts"]
      altera: ["src/servicos/integracoes.ts"]
    teste_integracao: "Com banco vazio e sem variavel o modelo efetivo e a constante, com OPENROUTER_MODELO_TRANSCRICAO e o da variavel e com o banco preenchido e o do banco."
    teste_funcional: "Usuario comum nao salva o modelo (403), modelo com espaco ou acima de 100 caracteres da erro 422, vazio restaura o padrao e a leitura do modelo em uso funciona para usuario comum."
    criterio_aceite: "tests/integracoes-transcricao.test.ts passa."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.03
    titulo: "Transcricao de midia por parte"
    fase: F-04.1
    status: concluida
    objetivo: "Criar src/servicos/transcricao-de-midia.ts que sonda, confere limites, extrai, divide, transcreve cada parte com repeticao do transitorio, grava segmentos, informa etapa e progresso e devolve o texto montado."
    arquivos:
      cria: ["src/servicos/transcricao-de-midia.ts", "tests/transcricao-de-midia.test.ts"]
      altera: ["src/lib/armazenamento.ts"]
    teste_integracao: "Com a midia e o transcritor injetados, tres partes geram tres arquivos de segmento, o texto montado com marcadores, as etapas em ordem e o progresso crescente ate 100."
    teste_funcional: "Com o segmento 1 ja em disco o transcritor nao e chamado para a parte 1, uma falha permanente na parte 2 lanca erro com a parte indicada e mantem os segmentos, uma falha transitoria e repetida ate duas vezes e a fonte excluida entre partes interrompe sem novo gasto."
    criterio_aceite: "tests/transcricao-de-midia.test.ts passa sem precisar de ffmpeg."
    depende_de: ["T-04.01", "T-04.02", "T-03.02", "T-02.04", "T-02.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.04
    titulo: "Fila: duas raias e andamento"
    fase: F-04.2
    status: pendente
    objetivo: "Alterar fontes-fila.ts para duas raias (leve com concorrencia 2 e midia com 1), tratar video e atualizar etapa e progresso por atualizacao condicional."
    arquivos:
      cria: ["tests/fontes-fila-video.test.ts"]
      altera: ["src/servicos/fontes-fila.ts"]
    teste_integracao: "Com o transcritor injetado a fila leva uma fonte de video de pendente a pronto, grava etapa e progresso no banco durante o trabalho e limpa os dois ao concluir mantendo duracaoSegundos."
    teste_funcional: "Um video lento nao impede um texto de ficar pronto, dois videos nunca rodam ao mesmo tempo, tipo desconhecido segue dando tipo_nao_suportado e fonte excluida no meio nao e recriada pelo andamento."
    criterio_aceite: "tests/fontes-fila-video.test.ts e tests/fontes-fila.test.ts passam."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.05
    titulo: "Video fim a fim na fila"
    fase: F-04.2
    status: pendente
    objetivo: "Provar o caminho completo com ffmpeg real e OpenRouter simulado, a falha de parte com Reprocessar retomando das partes que faltam e o texto buscavel pela recuperacao."
    arquivos:
      cria: ["tests/fontes-video-fim-a-fim.test.ts"]
      altera: ["src/servicos/fontes.ts"]
    teste_integracao: "Um audio de 25 segundos gerado pelo ffmpeg, enviado por adicionarVideo e processado pela fila com segmentos de 10 segundos, vira fonte pronta com trechos que comecam em [00:00] e buscarTrechos acha uma palavra da transcricao."
    teste_funcional: "Com falha configurada na parte 2 a fonte fica em erro com Falha na parte 2 de 3, o Reprocessar zera etapa e progresso, retoma e so a parte 2 e a 3 chamam o simulado e ao concluir nao sobram audio nem segmentos."
    criterio_aceite: "tests/fontes-video-fim-a-fim.test.ts passa (com ffmpeg local ou EXIGIR_FFMPEG=1)."
    depende_de: ["T-04.04", "T-03.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-04.01
titulo: "Marcadores de tempo e montagem"
objetivo: "Criar src/servicos/transcricao-marcadores.ts puro com o marcador [MM:SS] ou [H:MM:SS], a juncao das partes e a montagem do texto de legenda com marcador a cada cerca de 60 segundos."
arquivos:
  cria: ["src/servicos/transcricao-marcadores.ts", "tests/transcricao-marcadores.test.ts", "docs/conhecimento-em-video/sprint-04/sprint.md", "docs/conhecimento-em-video/sprint-04/fases.md", "docs/conhecimento-em-video/sprint-04/tasks.md"]
  altera: []
teste_integracao: "A juncao de tres partes de 600 segundos gera o texto com [00:00], [10:00] e [20:00] no comeco de cada uma separadas por linha em branco e passa por dividirEmTrechos sem perder o marcador da primeira parte."
teste_funcional: "O marcador de 3600 segundos e [1:00:00], uma parte vazia e ignorada sem marcador e as falas de legenda de 0 a 130 segundos recebem marcador em 00:00, 01:00 e 02:00."
criterio_aceite: "tests/transcricao-marcadores.test.ts passa."
depende_de: ["T-03.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/transcricao-marcadores.test.ts, 8 passed
```

---

```yaml
id: T-04.02
titulo: "Modelo de transcricao efetivo"
objetivo: "Acrescentar a integracoes.ts o modelo efetivo (banco, depois ambiente, depois constante), salvar e restaurar o padrao so pelo admin e leitura do modelo em uso por qualquer usuario."
arquivos:
  cria: ["tests/integracoes-transcricao.test.ts"]
  altera: ["src/servicos/integracoes.ts"]
teste_integracao: "Com banco vazio e sem variavel o modelo efetivo e a constante, com OPENROUTER_MODELO_TRANSCRICAO e o da variavel e com o banco preenchido e o do banco."
teste_funcional: "Usuario comum nao salva o modelo (403), modelo com espaco ou acima de 100 caracteres da erro 422, vazio restaura o padrao e a leitura do modelo em uso funciona para usuario comum."
criterio_aceite: "tests/integracoes-transcricao.test.ts passa."
depende_de: ["T-01.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/integracoes-transcricao.test.ts e tests/integracoes-conexao.test.ts, 12 passed
```

---

```yaml
id: T-04.03
titulo: "Transcricao de midia por parte"
objetivo: "Criar src/servicos/transcricao-de-midia.ts que sonda, confere limites, extrai, divide, transcreve cada parte com repeticao do transitorio, grava segmentos, informa etapa e progresso e devolve o texto montado."
arquivos:
  cria: ["src/servicos/transcricao-de-midia.ts", "tests/transcricao-de-midia.test.ts"]
  altera: ["src/lib/armazenamento.ts"]
teste_integracao: "Com a midia e o transcritor injetados, tres partes geram tres arquivos de segmento, o texto montado com marcadores, as etapas em ordem e o progresso crescente ate 100."
teste_funcional: "Com o segmento 1 ja em disco o transcritor nao e chamado para a parte 1, uma falha permanente na parte 2 lanca erro com a parte indicada e mantem os segmentos, uma falha transitoria e repetida ate duas vezes e a fonte excluida entre partes interrompe sem novo gasto."
criterio_aceite: "tests/transcricao-de-midia.test.ts passa sem precisar de ffmpeg."
depende_de: ["T-04.01", "T-04.02", "T-03.02", "T-02.04", "T-02.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/transcricao-de-midia.test.ts e tests/armazenamento-segmentos.test.ts, 14 passed
```

---

```yaml
id: T-04.04
titulo: "Fila: duas raias e andamento"
objetivo: "Alterar fontes-fila.ts para duas raias (leve com concorrencia 2 e midia com 1), tratar video e atualizar etapa e progresso por atualizacao condicional."
arquivos:
  cria: ["tests/fontes-fila-video.test.ts"]
  altera: ["src/servicos/fontes-fila.ts"]
teste_integracao: "Com o transcritor injetado a fila leva uma fonte de video de pendente a pronto, grava etapa e progresso no banco durante o trabalho e limpa os dois ao concluir mantendo duracaoSegundos."
teste_funcional: "Um video lento nao impede um texto de ficar pronto, dois videos nunca rodam ao mesmo tempo, tipo desconhecido segue dando tipo_nao_suportado e fonte excluida no meio nao e recriada pelo andamento."
criterio_aceite: "tests/fontes-fila-video.test.ts e tests/fontes-fila.test.ts passam."
depende_de: ["T-04.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.05
titulo: "Video fim a fim na fila"
objetivo: "Provar o caminho completo com ffmpeg real e OpenRouter simulado, a falha de parte com Reprocessar retomando das partes que faltam e o texto buscavel pela recuperacao."
arquivos:
  cria: ["tests/fontes-video-fim-a-fim.test.ts"]
  altera: ["src/servicos/fontes.ts"]
teste_integracao: "Um audio de 25 segundos gerado pelo ffmpeg, enviado por adicionarVideo e processado pela fila com segmentos de 10 segundos, vira fonte pronta com trechos que comecam em [00:00] e buscarTrechos acha uma palavra da transcricao."
teste_funcional: "Com falha configurada na parte 2 a fonte fica em erro com Falha na parte 2 de 3, o Reprocessar zera etapa e progresso, retoma e so a parte 2 e a 3 chamam o simulado e ao concluir nao sobram audio nem segmentos."
criterio_aceite: "tests/fontes-video-fim-a-fim.test.ts passa (com ffmpeg local ou EXIGIR_FFMPEG=1)."
depende_de: ["T-04.04", "T-03.03"]
paralelizavel: false
status: pendente
```

---

