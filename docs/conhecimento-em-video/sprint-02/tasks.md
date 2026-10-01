---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-02
atualizado_em: 2026-09-30
tasks:
  - id: T-02.01
    titulo: "Midia: binarios e sonda"
    fase: F-02.1
    status: concluida
    objetivo: "Criar src/lib/midia.ts com verificarMidia, o executor de processo sem shell com prazo e teto de saida, o erro de binario ausente e sondar com duracao, faixa de audio e limite de minutos."
    arquivos:
      cria: ["src/lib/midia.ts", "tests/midia-sonda.test.ts", "docs/conhecimento-em-video/sprint-02/sprint.md", "docs/conhecimento-em-video/sprint-02/fases.md", "docs/conhecimento-em-video/sprint-02/tasks.md"]
      altera: []
    teste_integracao: "Contra um MP3 gerado pelo ffmpeg a sonda devolve a duracao e temAudio verdadeiro, e contra um MP4 so de video devolve temAudio falso."
    teste_funcional: "Com FFPROBE_PATH inexistente sondar lanca a mensagem Nao encontrei o ffmpeg neste servidor, uma duracao acima do limite de minutos lanca erro claro e verificarMidia informa quais binarios respondem."
    criterio_aceite: "tests/midia-sonda.test.ts passa (com ffmpeg local ou EXIGIR_FFMPEG=1) e o executor usa spawn com vetor de argumentos."
    depende_de: ["T-01.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.02
    titulo: "Midia: extrair e dividir audio"
    fase: F-02.1
    status: concluida
    objetivo: "Acrescentar extrairAudio (MP3 mono 16 kHz 32 kbps) e dividirEmSegmentos (partes de 10 minutos sem reencodar) a midia.ts, com limpeza e prazo por processo."
    arquivos:
      cria: ["tests/midia-extracao.test.ts"]
      altera: ["src/lib/midia.ts"]
    teste_integracao: "Contra um audio de 25 segundos gerado pelo ffmpeg a extracao produz um MP3 mono de 16 kHz e a divisao com segmento de 10 segundos produz 3 arquivos em ordem."
    teste_funcional: "Um arquivo corrompido lanca erro claro sem repassar a saida do ffmpeg, um prazo de 1 ms mata o processo com erro de tempo esgotado e a pasta de trabalho fica sem temporarios apos a limpeza."
    criterio_aceite: "tests/midia-extracao.test.ts passa."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.03
    titulo: "Formatos e assinatura de midia"
    fase: F-02.2
    status: concluida
    objetivo: "Criar src/lib/midia-formatos.ts puro com as extensoes aceitas, o formato por extensao e a conferencia da assinatura dos primeiros bytes."
    arquivos:
      cria: ["src/lib/midia-formatos.ts", "tests/midia-formatos.test.ts"]
      altera: []
    teste_integracao: "Os primeiros bytes de arquivos gerados pelo ffmpeg (mp4, webm, mkv, mp3, wav, m4a, ogg, flac) passam na conferencia da propria extensao."
    teste_funcional: "Um arquivo txt renomeado para mp4 e rejeitado, um mp4 com extensao mkv e rejeitado, arquivo vazio e rejeitado e a lista de extensoes tem as doze do briefing."
    criterio_aceite: "tests/midia-formatos.test.ts passa e o modulo nao importa node: nem next."
    depende_de: ["T-01.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.04
    titulo: "Transcricao pelo OpenRouter"
    fase: F-02.2
    status: pendente
    objetivo: "Acrescentar transcreverAudio a src/lib/openrouter.ts, sem stream, com prazo total de 5 minutos, instrucao fixa, erros provedor_* e transcricao_vazia."
    arquivos:
      cria: ["tests/openrouter-transcricao.test.ts"]
      altera: ["src/lib/openrouter.ts"]
    teste_integracao: "Contra o simulado, transcreverAudio envia o modelo, a instrucao fixa e a parte input_audio com o base64 e o formato e devolve o texto da resposta sem a chave aparecer em erro."
    teste_funcional: "Resposta com texto vazio lanca transcricao_vazia, status 402 vira provedor_sem_saldo, latencia acima do prazo vira provedor_tempo_esgotado e um sinal abortado cancela o pedido."
    criterio_aceite: "tests/openrouter-transcricao.test.ts passa."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-02.01
titulo: "Midia: binarios e sonda"
objetivo: "Criar src/lib/midia.ts com verificarMidia, o executor de processo sem shell com prazo e teto de saida, o erro de binario ausente e sondar com duracao, faixa de audio e limite de minutos."
arquivos:
  cria: ["src/lib/midia.ts", "tests/midia-sonda.test.ts", "docs/conhecimento-em-video/sprint-02/sprint.md", "docs/conhecimento-em-video/sprint-02/fases.md", "docs/conhecimento-em-video/sprint-02/tasks.md"]
  altera: []
teste_integracao: "Contra um MP3 gerado pelo ffmpeg a sonda devolve a duracao e temAudio verdadeiro, e contra um MP4 so de video devolve temAudio falso."
teste_funcional: "Com FFPROBE_PATH inexistente sondar lanca a mensagem Nao encontrei o ffmpeg neste servidor, uma duracao acima do limite de minutos lanca erro claro e verificarMidia informa quais binarios respondem."
criterio_aceite: "tests/midia-sonda.test.ts passa (com ffmpeg local ou EXIGIR_FFMPEG=1) e o executor usa spawn com vetor de argumentos."
depende_de: ["T-01.04"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/midia-sonda.test.ts, 7 passed
```

---

```yaml
id: T-02.02
titulo: "Midia: extrair e dividir audio"
objetivo: "Acrescentar extrairAudio (MP3 mono 16 kHz 32 kbps) e dividirEmSegmentos (partes de 10 minutos sem reencodar) a midia.ts, com limpeza e prazo por processo."
arquivos:
  cria: ["tests/midia-extracao.test.ts"]
  altera: ["src/lib/midia.ts"]
teste_integracao: "Contra um audio de 25 segundos gerado pelo ffmpeg a extracao produz um MP3 mono de 16 kHz e a divisao com segmento de 10 segundos produz 3 arquivos em ordem."
teste_funcional: "Um arquivo corrompido lanca erro claro sem repassar a saida do ffmpeg, um prazo de 1 ms mata o processo com erro de tempo esgotado e a pasta de trabalho fica sem temporarios apos a limpeza."
criterio_aceite: "tests/midia-extracao.test.ts passa."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/midia-extracao.test.ts e tests/midia-sonda.test.ts, 13 passed
```

---

```yaml
id: T-02.03
titulo: "Formatos e assinatura de midia"
objetivo: "Criar src/lib/midia-formatos.ts puro com as extensoes aceitas, o formato por extensao e a conferencia da assinatura dos primeiros bytes."
arquivos:
  cria: ["src/lib/midia-formatos.ts", "tests/midia-formatos.test.ts"]
  altera: []
teste_integracao: "Os primeiros bytes de arquivos gerados pelo ffmpeg (mp4, webm, mkv, mp3, wav, m4a, ogg, flac) passam na conferencia da propria extensao."
teste_funcional: "Um arquivo txt renomeado para mp4 e rejeitado, um mp4 com extensao mkv e rejeitado, arquivo vazio e rejeitado e a lista de extensoes tem as doze do briefing."
criterio_aceite: "tests/midia-formatos.test.ts passa e o modulo nao importa node: nem next."
depende_de: ["T-01.04"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/midia-formatos.test.ts, 32 passed
```

---

```yaml
id: T-02.04
titulo: "Transcricao pelo OpenRouter"
objetivo: "Acrescentar transcreverAudio a src/lib/openrouter.ts, sem stream, com prazo total de 5 minutos, instrucao fixa, erros provedor_* e transcricao_vazia."
arquivos:
  cria: ["tests/openrouter-transcricao.test.ts"]
  altera: ["src/lib/openrouter.ts"]
teste_integracao: "Contra o simulado, transcreverAudio envia o modelo, a instrucao fixa e a parte input_audio com o base64 e o formato e devolve o texto da resposta sem a chave aparecer em erro."
teste_funcional: "Resposta com texto vazio lanca transcricao_vazia, status 402 vira provedor_sem_saldo, latencia acima do prazo vira provedor_tempo_esgotado e um sinal abortado cancela o pedido."
criterio_aceite: "tests/openrouter-transcricao.test.ts passa."
depende_de: ["T-01.03"]
paralelizavel: false
status: pendente
```

---

