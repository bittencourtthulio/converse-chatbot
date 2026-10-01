---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-01
atualizado_em: 2026-10-01
tasks:
  - id: T-01.01
    titulo: "Trava contra rede real nos testes"
    fase: F-01.1
    status: concluida
    objetivo: "Instalar nos testes uma trava que recusa conexão de saída para host que não seja loopback (PR-112) e abrir o registro das mutações da feature."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/sprint-01/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-01/fases.md", "docs/robustez-de-midia-e-operacao/sprint-01/tasks.md", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/apoio/trava-de-rede.ts", "tests/setup-rede.ts", "tests/trava-de-rede.test.ts"]
      altera: ["vitest.config.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/trava-de-rede.test.ts roda sob a trava instalada pelo setup e prova que fetch, http.get e net.connect para um host público são recusados com a mensagem da PR-112 e que um servidor http em 127.0.0.1 continua respondendo a fetch e a http.get."
    teste_funcional: "ehLoopback devolve true para localhost, 127.0.0.1, 127.1.2.3, ::1 e ::ffff:127.0.0.1 e false para example.com, 93.184.216.34 e 10.0.0.1, HOSTS_PERMITIDOS é a lista vazia, as formas connect(porta, host), connect(caminho) e connect([opções]) são tratadas e instalarTravaDeRede() chamada duas vezes não empilha a troca."
    criterio_aceite: "tests/trava-de-rede.test.ts passa, falha quando a instalação da trava sai do setup (mutação registrada em MUTACOES.md), o bloco de fechamento da FT-12 em tests/projeto.test.ts foi relaxado para um estado histórico estável (linha da FT-12 entregue, entregues maior ou igual a 12, sem fixar em_andamento nem pendencias_resolvidas) e a suíte inteira fica verde (teste que tocava a rede real, se houver, corrigido e registrado em desvios do ENTREGA.md)."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-01.02
    titulo: "Teste do embed estável contra o código aleatório"
    fase: F-01.1
    status: concluida
    objetivo: "Fazer tests/embed-pagina.test.ts não depender do acaso do código de referência (PEND-30)."
    arquivos:
      cria: []
      altera: ["tests/embed-pagina.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/embed-pagina.test.ts roda contra o servidor de produção e a regra do limite diário usa borda de palavra no HTML do embed."
    teste_funcional: "Um HTML com o código ab4321cd não dispara a regra e um HTML com o limite 4321 solto dispara."
    criterio_aceite: "O arquivo passa 30 execuções seguidas sozinho (resultado em ENTREGA.md), a regra falha quando o limite aparece solto no HTML (mutação registrada) e a lacuna 50 de LACUNAS.md foi reajustada."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-01.03
    titulo: "OpenRouter falso com silêncios e áudio com trecho mudo"
    fase: F-01.2
    status: concluida
    objetivo: "Estender o OpenRouter falso para responder vazio em partes escolhidas e gerar com o ffmpeg um áudio com fala, silêncio e ruído."
    arquivos:
      cria: ["tests/apoio-audio-com-silencio.test.ts"]
      altera: ["tests/apoio/openrouter-falso.ts", "tests/apoio/ffmpeg.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Com silencios:[1] o OpenRouter falso responde conteúdo vazio à parte 1 e o texto simulado às demais, e o gerador produz com o ffmpeg um áudio que o ffprobe mede."
    teste_funcional: "gerarAudioComSilencio({fala:5,silencio:10,ruido:10}) devolve um mp3 de 25 s (tolerância de 1 s) cujas partes de 10 s são áudios distintos (ruído distinto por parte), e o transcritor falso devolve vazio exatamente para o índice listado em silencios (o vazio vem do índice, não do áudio)."
    criterio_aceite: "tests/apoio-audio-com-silencio.test.ts passa (com ffmpeg; pula sem ele como os demais) e os testes do OpenRouter falso existentes continuam verdes."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-01.04
    titulo: "Apoios de PDF grande e de corpo chunked"
    fase: F-01.2
    status: pendente
    objetivo: "Criar o gerador de PDF com N páginas e o cliente que envia corpo chunked sem Content-Length."
    arquivos:
      cria: ["tests/apoio/pdf-sintetico.ts", "tests/apoio/corpo-chunked.ts", "tests/apoio-pdf-chunked.test.ts"]
      altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "gerarPdf(501) é aberto por getDocumentProxy com numPages 501 e enviarChunked contra um servidor http de teste em loopback entrega os bytes em Transfer-Encoding chunked sem Content-Length."
    teste_funcional: "gerarPdf(3) tem texto extraível por extrairPdf e enviarChunked devolve o status recebido e o total de bytes que o servidor aceitou antes de recusar."
    criterio_aceite: "tests/apoio-pdf-chunked.test.ts passa."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-01.01
titulo: "Trava contra rede real nos testes"
objetivo: "Instalar nos testes uma trava que recusa conexão de saída para host que não seja loopback (PR-112) e abrir o registro das mutações da feature."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/sprint-01/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-01/fases.md", "docs/robustez-de-midia-e-operacao/sprint-01/tasks.md", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/apoio/trava-de-rede.ts", "tests/setup-rede.ts", "tests/trava-de-rede.test.ts"]
  altera: ["vitest.config.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/trava-de-rede.test.ts roda sob a trava instalada pelo setup e prova que fetch, http.get e net.connect para um host público são recusados com a mensagem da PR-112 e que um servidor http em 127.0.0.1 continua respondendo a fetch e a http.get."
teste_funcional: "ehLoopback devolve true para localhost, 127.0.0.1, 127.1.2.3, ::1 e ::ffff:127.0.0.1 e false para example.com, 93.184.216.34 e 10.0.0.1, HOSTS_PERMITIDOS é a lista vazia, as formas connect(porta, host), connect(caminho) e connect([opções]) são tratadas e instalarTravaDeRede() chamada duas vezes não empilha a troca."
criterio_aceite: "tests/trava-de-rede.test.ts passa, falha quando a instalação da trava sai do setup (mutação registrada em MUTACOES.md), o bloco de fechamento da FT-12 em tests/projeto.test.ts foi relaxado para um estado histórico estável (linha da FT-12 entregue, entregues maior ou igual a 12, sem fixar em_andamento nem pendencias_resolvidas) e a suíte inteira fica verde (teste que tocava a rede real, se houver, corrigido e registrado em desvios do ENTREGA.md)."
depende_de: []
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 262 arquivos, 3000 passed, 9 skipped, 0 failed; mutação registrada
```

---

```yaml
id: T-01.02
titulo: "Teste do embed estável contra o código aleatório"
objetivo: "Fazer tests/embed-pagina.test.ts não depender do acaso do código de referência (PEND-30)."
arquivos:
  cria: []
  altera: ["tests/embed-pagina.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/embed-pagina.test.ts roda contra o servidor de produção e a regra do limite diário usa borda de palavra no HTML do embed."
teste_funcional: "Um HTML com o código ab4321cd não dispara a regra e um HTML com o limite 4321 solto dispara."
criterio_aceite: "O arquivo passa 30 execuções seguidas sozinho (resultado em ENTREGA.md), a regra falha quando o limite aparece solto no HTML (mutação registrada) e a lacuna 50 de LACUNAS.md foi reajustada."
depende_de: []
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/embed-pagina.test.ts 11 passed e 30 execuções seguidas sozinho passaram (30 de 30); tests/projeto.test.ts verde; mutação registrada
```

---

```yaml
id: T-01.03
titulo: "OpenRouter falso com silêncios e áudio com trecho mudo"
objetivo: "Estender o OpenRouter falso para responder vazio em partes escolhidas e gerar com o ffmpeg um áudio com fala, silêncio e ruído."
arquivos:
  cria: ["tests/apoio-audio-com-silencio.test.ts"]
  altera: ["tests/apoio/openrouter-falso.ts", "tests/apoio/ffmpeg.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "Com silencios:[1] o OpenRouter falso responde conteúdo vazio à parte 1 e o texto simulado às demais, e o gerador produz com o ffmpeg um áudio que o ffprobe mede."
teste_funcional: "gerarAudioComSilencio({fala:5,silencio:10,ruido:10}) devolve um mp3 de 25 s (tolerância de 1 s) cujas partes de 10 s são áudios distintos (ruído distinto por parte), e o transcritor falso devolve vazio exatamente para o índice listado em silencios (o vazio vem do índice, não do áudio)."
criterio_aceite: "tests/apoio-audio-com-silencio.test.ts passa (com ffmpeg; pula sem ele como os demais) e os testes do OpenRouter falso existentes continuam verdes."
depende_de: ["T-01.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/apoio-audio-com-silencio, apoio-ffmpeg, transcricao-de-midia, fontes-video-fim-a-fim, openrouter-transcricao, projeto: 0 failed; mutação registrada
```

---

```yaml
id: T-01.04
titulo: "Apoios de PDF grande e de corpo chunked"
objetivo: "Criar o gerador de PDF com N páginas e o cliente que envia corpo chunked sem Content-Length."
arquivos:
  cria: ["tests/apoio/pdf-sintetico.ts", "tests/apoio/corpo-chunked.ts", "tests/apoio-pdf-chunked.test.ts"]
  altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "gerarPdf(501) é aberto por getDocumentProxy com numPages 501 e enviarChunked contra um servidor http de teste em loopback entrega os bytes em Transfer-Encoding chunked sem Content-Length."
teste_funcional: "gerarPdf(3) tem texto extraível por extrairPdf e enviarChunked devolve o status recebido e o total de bytes que o servidor aceitou antes de recusar."
criterio_aceite: "tests/apoio-pdf-chunked.test.ts passa."
depende_de: ["T-01.03"]
paralelizavel: false
status: pendente
```

