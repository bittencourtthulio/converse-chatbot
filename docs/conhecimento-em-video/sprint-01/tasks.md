---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-01
atualizado_em: 2026-09-30
tasks:
  - id: T-01.01
    titulo: "Migration e campos de video"
    fase: F-01.1
    status: pendente
    objetivo: "Acrescentar progresso, etapa, duracaoSegundos e urlOrigem em Fonte e modeloDeTranscricao em ConfiguracaoDoWorkspace por migration aditiva."
    arquivos:
      cria: ["prisma/migrations/20261001000000_conhecimento_em_video/migration.sql", "tests/video-modelo.test.ts", "docs/conhecimento-em-video/sprint-01/sprint.md", "docs/conhecimento-em-video/sprint-01/fases.md", "docs/conhecimento-em-video/sprint-01/tasks.md"]
      altera: ["prisma/schema.prisma"]
    teste_integracao: "Com o banco migrado do zero por migrate deploy, uma Fonte do tipo video e criada com progresso, etapa, duracaoSegundos e urlOrigem e a configuracao do workspace aceita modeloDeTranscricao."
    teste_funcional: "Uma fonte criada sem os campos novos devolve os quatro como nulos, o modeloDeTranscricao da configuracao nasce nulo e a migration nao contem DROP."
    criterio_aceite: "tests/video-modelo.test.ts e tests/migracoes.test.ts passam."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: "Variaveis de ambiente do video"
    fase: F-01.1
    status: pendente
    objetivo: "Acrescentar em ambiente.ts maxVideoBytes, maxVideoMinutos, ffmpegPath, ffprobePath, openrouterModeloTranscricao e youtubeBase, a constante MODELO_DE_TRANSCRICAO_PADRAO e documentar no .env.example."
    arquivos:
      cria: []
      altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere que o .env.example documenta as seis variaveis e o teste de ambiente le as variaveis do processo."
    teste_funcional: "Sem variavel os padroes sao 500 MB, 180 minutos, ffmpeg, ffprobe, google/gemini-2.5-flash e https://www.youtube.com, MAX_VIDEO_MB acima de 2000 ou zero lanca erro claro e a barra final de YOUTUBE_BASE e removida."
    criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: "Simulado do OpenRouter com audio"
    fase: F-01.2
    status: pendente
    objetivo: "Estender tests/apoio/openrouter-falso.ts para reconhecer a parte input_audio e devolver transcricao configuravel por parte, com falha e latencia por parte."
    arquivos:
      cria: ["tests/openrouter-falso-audio.test.ts"]
      altera: ["tests/apoio/openrouter-falso.ts"]
    teste_integracao: "O simulado sobe em porta livre, registra cada pedido de audio com modelo, formato e tamanho do base64 e continua atendendo aos testes existentes do servidor simulado."
    teste_funcional: "O primeiro pedido com input_audio devolve a primeira transcricao configurada, o segundo a segunda, uma falha configurada para a parte 2 devolve o status pedido e um pedido sem audio segue devolvendo a resposta de texto."
    criterio_aceite: "tests/openrouter-falso-audio.test.ts e tests/openrouter.test.ts passam."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.04
    titulo: "Apoio de ffmpeg e CI"
    fase: F-01.2
    status: pendente
    objetivo: "Criar o apoio de teste que detecta o ffmpeg, gera midia pequena com lavfi e exige o ffmpeg quando EXIGIR_FFMPEG=1, e instalar o ffmpeg no CI."
    arquivos:
      cria: ["tests/apoio/ffmpeg.ts", "tests/apoio-ffmpeg.test.ts"]
      altera: [".github/workflows/ci.yml", "tests/projeto.test.ts"]
    teste_integracao: "O apoio roda o ffmpeg local para gerar um MP3, um WAV e um MP4 de 3 segundos e os arquivos tem a assinatura esperada."
    teste_funcional: "ffmpegDisponivel e verdadeiro quando o binario responde, e com EXIGIR_FFMPEG=1 e FFMPEG_PATH inexistente a funcao de exigencia lanca erro, enquanto sem EXIGIR_FFMPEG apenas pula."
    criterio_aceite: "tests/apoio-ffmpeg.test.ts e tests/projeto.test.ts passam e o ci.yml contem apt-get install -y ffmpeg e EXIGIR_FFMPEG."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.05
    titulo: "Simulado do YouTube"
    fase: F-01.2
    status: pendente
    objetivo: "Escrever tests/apoio/youtube-falso.ts que serve a pagina do video com ytInitialPlayerResponse e as legendas em json3 e XML de fixture, com redirect, tamanho, atraso e host de legenda configuraveis."
    arquivos:
      cria: ["tests/apoio/youtube-falso.ts", "tests/youtube-falso.test.ts"]
      altera: []
    teste_integracao: "O simulado sobe em porta livre, serve GET /watch?v=ID com as faixas e GET da legenda, registra cada requisicao e fecha sem deixar a porta aberta."
    teste_funcional: "A pagina de um id conhecido traz o titulo e duas faixas, a legenda em json3 e em XML devolve as falas da fixture e um id desconhecido devolve a pagina sem captions."
    criterio_aceite: "tests/youtube-falso.test.ts passa e o simulado nao importa nada de src."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-01.01
titulo: "Migration e campos de video"
objetivo: "Acrescentar progresso, etapa, duracaoSegundos e urlOrigem em Fonte e modeloDeTranscricao em ConfiguracaoDoWorkspace por migration aditiva."
arquivos:
  cria: ["prisma/migrations/20261001000000_conhecimento_em_video/migration.sql", "tests/video-modelo.test.ts", "docs/conhecimento-em-video/sprint-01/sprint.md", "docs/conhecimento-em-video/sprint-01/fases.md", "docs/conhecimento-em-video/sprint-01/tasks.md"]
  altera: ["prisma/schema.prisma"]
teste_integracao: "Com o banco migrado do zero por migrate deploy, uma Fonte do tipo video e criada com progresso, etapa, duracaoSegundos e urlOrigem e a configuracao do workspace aceita modeloDeTranscricao."
teste_funcional: "Uma fonte criada sem os campos novos devolve os quatro como nulos, o modeloDeTranscricao da configuracao nasce nulo e a migration nao contem DROP."
criterio_aceite: "tests/video-modelo.test.ts e tests/migracoes.test.ts passam."
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.02
titulo: "Variaveis de ambiente do video"
objetivo: "Acrescentar em ambiente.ts maxVideoBytes, maxVideoMinutos, ffmpegPath, ffprobePath, openrouterModeloTranscricao e youtubeBase, a constante MODELO_DE_TRANSCRICAO_PADRAO e documentar no .env.example."
arquivos:
  cria: []
  altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts"]
teste_integracao: "tests/projeto.test.ts confere que o .env.example documenta as seis variaveis e o teste de ambiente le as variaveis do processo."
teste_funcional: "Sem variavel os padroes sao 500 MB, 180 minutos, ffmpeg, ffprobe, google/gemini-2.5-flash e https://www.youtube.com, MAX_VIDEO_MB acima de 2000 ou zero lanca erro claro e a barra final de YOUTUBE_BASE e removida."
criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam."
depende_de: ["T-01.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.03
titulo: "Simulado do OpenRouter com audio"
objetivo: "Estender tests/apoio/openrouter-falso.ts para reconhecer a parte input_audio e devolver transcricao configuravel por parte, com falha e latencia por parte."
arquivos:
  cria: ["tests/openrouter-falso-audio.test.ts"]
  altera: ["tests/apoio/openrouter-falso.ts"]
teste_integracao: "O simulado sobe em porta livre, registra cada pedido de audio com modelo, formato e tamanho do base64 e continua atendendo aos testes existentes do servidor simulado."
teste_funcional: "O primeiro pedido com input_audio devolve a primeira transcricao configurada, o segundo a segunda, uma falha configurada para a parte 2 devolve o status pedido e um pedido sem audio segue devolvendo a resposta de texto."
criterio_aceite: "tests/openrouter-falso-audio.test.ts e tests/openrouter.test.ts passam."
depende_de: ["T-01.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.04
titulo: "Apoio de ffmpeg e CI"
objetivo: "Criar o apoio de teste que detecta o ffmpeg, gera midia pequena com lavfi e exige o ffmpeg quando EXIGIR_FFMPEG=1, e instalar o ffmpeg no CI."
arquivos:
  cria: ["tests/apoio/ffmpeg.ts", "tests/apoio-ffmpeg.test.ts"]
  altera: [".github/workflows/ci.yml", "tests/projeto.test.ts"]
teste_integracao: "O apoio roda o ffmpeg local para gerar um MP3, um WAV e um MP4 de 3 segundos e os arquivos tem a assinatura esperada."
teste_funcional: "ffmpegDisponivel e verdadeiro quando o binario responde, e com EXIGIR_FFMPEG=1 e FFMPEG_PATH inexistente a funcao de exigencia lanca erro, enquanto sem EXIGIR_FFMPEG apenas pula."
criterio_aceite: "tests/apoio-ffmpeg.test.ts e tests/projeto.test.ts passam e o ci.yml contem apt-get install -y ffmpeg e EXIGIR_FFMPEG."
depende_de: ["T-01.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.05
titulo: "Simulado do YouTube"
objetivo: "Escrever tests/apoio/youtube-falso.ts que serve a pagina do video com ytInitialPlayerResponse e as legendas em json3 e XML de fixture, com redirect, tamanho, atraso e host de legenda configuraveis."
arquivos:
  cria: ["tests/apoio/youtube-falso.ts", "tests/youtube-falso.test.ts"]
  altera: []
teste_integracao: "O simulado sobe em porta livre, serve GET /watch?v=ID com as faixas e GET da legenda, registra cada requisicao e fecha sem deixar a porta aberta."
teste_funcional: "A pagina de um id conhecido traz o titulo e duas faixas, a legenda em json3 e em XML devolve as falas da fixture e um id desconhecido devolve a pagina sem captions."
criterio_aceite: "tests/youtube-falso.test.ts passa e o simulado nao importa nada de src."
depende_de: ["T-01.02"]
paralelizavel: false
status: pendente
```

---

