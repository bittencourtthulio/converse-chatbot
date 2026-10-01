---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-02
atualizado_em: 2026-10-01
tasks:
  - id: T-02.01
    titulo: "Marcador sem fala e filtro de trechos"
    fase: F-02.1
    status: pendente
    objetivo: "Fixar por teste a junção de [sem fala] com o marcador de tempo (que já funciona hoje) e criar trechoSoDeMarcadores, que reconhece o trecho feito só de marcadores (PR-105)."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/sprint-02/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-02/fases.md", "docs/robustez-de-midia-e-operacao/sprint-02/tasks.md"]
      altera: ["src/servicos/transcricao-marcadores.ts", "tests/transcricao-marcadores.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/transcricao-marcadores.test.ts: juntarPartes com um segmento [sem fala] o escreve com o marcador de tempo entre as falas e ignora o segmento vazio, e trechoSoDeMarcadores aplicado a dividirEmTrechos descarta o trecho só de marcadores."
    teste_funcional: "juntarPartes([{0,'Olá'},{600,'[sem fala]'},{1200,'Fim'}]) devolve '[00:00] Olá\\n\\n[10:00] [sem fala]\\n\\n[20:00] Fim', trechoSoDeMarcadores('[10:00] [sem fala]') é true e trechoSoDeMarcadores('[10:00] [sem fala] Oi') é false."
    criterio_aceite: "O teste passa; o vermelho inicial vem de trechoSoDeMarcadores (ainda inexistente) e a mutação registrada faz juntarPartes filtrar o marcador ou trechoSoDeMarcadores devolver sempre false."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.02
    titulo: "Transcrição grava segmento sem fala e falha só sem nenhuma fala"
    fase: F-02.1
    status: pendente
    objetivo: "Fazer transcreverMidia gravar [sem fala] para o trecho vazio depois de uma repetição e lançar Não encontrei fala neste áudio. quando nenhum trecho tem fala (PR-105)."
    arquivos:
      cria: []
      altera: ["src/servicos/transcricao-de-midia.ts", "tests/transcricao-de-midia.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/transcricao-de-midia.test.ts com armazenamento em diretório temporário e transcritor injetado: a parte 2 de 3 vazia nas duas chamadas grava segmentos/01.txt com [sem fala], o texto devolvido traz as três partes e a retomada não chama o transcritor para os segmentos já gravados."
    teste_funcional: "O transcritor vazio na parte 2 é chamado 2 vezes e as partes 1 e 3 saem com fala; com todas as partes vazias a chamada lança Não encontrei fala neste áudio. (422, transcricao_vazia); vazio seguido de fala devolve a fala."
    criterio_aceite: "Os testes passam (inclusive o de repetição existente, vazio e depois fala), e falham quando o vazio volta a derrubar a fonte (mutação registrada)."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.03
    titulo: "Fila sem trecho de marcador e vídeo mudo ponta a ponta"
    fase: F-02.2
    status: pendente
    objetivo: "Fazer a fila descartar trechos só de marcadores e provar o fluxo inteiro com ffmpeg real e OpenRouter falso."
    arquivos:
      cria: []
      altera: ["src/servicos/fontes-fila.ts", "tests/fontes-fila-video.test.ts", "tests/fontes-video-fim-a-fim.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/fontes-video-fim-a-fim.test.ts, com ffmpeg real e o OpenRouter falso (partes de 10 s, parte 1 silenciosa por índice), leva a fonte a pronto com [sem fala] no texto e a busca FTS5 acha a fala; e tests/fontes-fila-video.test.ts com transcreverMidia injetado devolvendo mais de 1.100 caracteres de fala seguidos de linhas só de marcador prova que o último trecho, feito só de marcadores, não existe no FTS5."
    teste_funcional: "Áudio de 25 s com 5 s de fala, 10 s de silêncio e 10 s de ruído vira fonte pronta; áudio inteiro sem fala vira fonte em erro com Não encontrei fala neste áudio.; Reprocessar não repete a parte já gravada."
    criterio_aceite: "Os testes passam e falham quando o descarte de trechos só de marcadores é removido da fila (mutação registrada)."
    depende_de: ["T-02.02", "T-01.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-02.01
titulo: "Marcador sem fala e filtro de trechos"
objetivo: "Fixar por teste a junção de [sem fala] com o marcador de tempo (que já funciona hoje) e criar trechoSoDeMarcadores, que reconhece o trecho feito só de marcadores (PR-105)."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/sprint-02/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-02/fases.md", "docs/robustez-de-midia-e-operacao/sprint-02/tasks.md"]
  altera: ["src/servicos/transcricao-marcadores.ts", "tests/transcricao-marcadores.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/transcricao-marcadores.test.ts: juntarPartes com um segmento [sem fala] o escreve com o marcador de tempo entre as falas e ignora o segmento vazio, e trechoSoDeMarcadores aplicado a dividirEmTrechos descarta o trecho só de marcadores."
teste_funcional: "juntarPartes([{0,'Olá'},{600,'[sem fala]'},{1200,'Fim'}]) devolve '[00:00] Olá\\n\\n[10:00] [sem fala]\\n\\n[20:00] Fim', trechoSoDeMarcadores('[10:00] [sem fala]') é true e trechoSoDeMarcadores('[10:00] [sem fala] Oi') é false."
criterio_aceite: "O teste passa; o vermelho inicial vem de trechoSoDeMarcadores (ainda inexistente) e a mutação registrada faz juntarPartes filtrar o marcador ou trechoSoDeMarcadores devolver sempre false."
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.02
titulo: "Transcrição grava segmento sem fala e falha só sem nenhuma fala"
objetivo: "Fazer transcreverMidia gravar [sem fala] para o trecho vazio depois de uma repetição e lançar Não encontrei fala neste áudio. quando nenhum trecho tem fala (PR-105)."
arquivos:
  cria: []
  altera: ["src/servicos/transcricao-de-midia.ts", "tests/transcricao-de-midia.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/transcricao-de-midia.test.ts com armazenamento em diretório temporário e transcritor injetado: a parte 2 de 3 vazia nas duas chamadas grava segmentos/01.txt com [sem fala], o texto devolvido traz as três partes e a retomada não chama o transcritor para os segmentos já gravados."
teste_funcional: "O transcritor vazio na parte 2 é chamado 2 vezes e as partes 1 e 3 saem com fala; com todas as partes vazias a chamada lança Não encontrei fala neste áudio. (422, transcricao_vazia); vazio seguido de fala devolve a fala."
criterio_aceite: "Os testes passam (inclusive o de repetição existente, vazio e depois fala), e falham quando o vazio volta a derrubar a fonte (mutação registrada)."
depende_de: ["T-02.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.03
titulo: "Fila sem trecho de marcador e vídeo mudo ponta a ponta"
objetivo: "Fazer a fila descartar trechos só de marcadores e provar o fluxo inteiro com ffmpeg real e OpenRouter falso."
arquivos:
  cria: []
  altera: ["src/servicos/fontes-fila.ts", "tests/fontes-fila-video.test.ts", "tests/fontes-video-fim-a-fim.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/fontes-video-fim-a-fim.test.ts, com ffmpeg real e o OpenRouter falso (partes de 10 s, parte 1 silenciosa por índice), leva a fonte a pronto com [sem fala] no texto e a busca FTS5 acha a fala; e tests/fontes-fila-video.test.ts com transcreverMidia injetado devolvendo mais de 1.100 caracteres de fala seguidos de linhas só de marcador prova que o último trecho, feito só de marcadores, não existe no FTS5."
teste_funcional: "Áudio de 25 s com 5 s de fala, 10 s de silêncio e 10 s de ruído vira fonte pronta; áudio inteiro sem fala vira fonte em erro com Não encontrei fala neste áudio.; Reprocessar não repete a parte já gravada."
criterio_aceite: "Os testes passam e falham quando o descarte de trechos só de marcadores é removido da fila (mutação registrada)."
depende_de: ["T-02.02", "T-01.03"]
paralelizavel: false
status: pendente
```

