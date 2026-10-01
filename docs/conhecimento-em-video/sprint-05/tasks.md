---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-05
atualizado_em: 2026-09-30
tasks:
  - id: T-05.01
    titulo: "YouTube: id e validacao da URL"
    fase: F-05.1
    status: concluida
    objetivo: "Criar src/lib/youtube.ts com a extracao do id de watch, youtu.be, shorts e embed e a validacao do host da URL do usuario."
    arquivos:
      cria: ["src/lib/youtube.ts", "tests/youtube-url.test.ts", "docs/conhecimento-em-video/sprint-05/sprint.md", "docs/conhecimento-em-video/sprint-05/fases.md", "docs/conhecimento-em-video/sprint-05/tasks.md"]
      altera: []
    teste_integracao: "As quatro formas de URL com o mesmo id de 11 caracteres devolvem esse id e a URL gerada para ele usa so a base configurada."
    teste_funcional: "Host de outro dominio, esquema que nao e http ou https, id fora de 11 caracteres de A-Za-z0-9_- e youtube.com.evil.com devolvem erro 422 com mensagem clara."
    criterio_aceite: "tests/youtube-url.test.ts passa."
    depende_de: ["T-01.05"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.02
    titulo: "YouTube: pagina e faixas"
    fase: F-05.1
    status: concluida
    objetivo: "Acrescentar a youtube.ts a leitura da pagina do video na base configurada, a extracao do titulo e das faixas e a escolha da faixa por preferencia."
    arquivos:
      cria: ["tests/youtube-pagina.test.ts"]
      altera: ["src/lib/youtube.ts"]
    teste_integracao: "Contra o simulado a pagina de um id conhecido devolve o titulo e as faixas com idioma e se e automatica."
    teste_funcional: "Com faixas manual em ingles, manual em portugues e automatica a escolha e a manual em portugues, sem manual em portugues e a manual em ingles, so com automatica e a automatica e sem faixa lanca Este video nao tem legendas disponiveis."
    criterio_aceite: "tests/youtube-pagina.test.ts passa e a pagina e lida com teto de 3 MB e prazo de 15 s."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.03
    titulo: "YouTube: baixar a legenda com SSRF"
    fase: F-05.1
    status: concluida
    objetivo: "Acrescentar a youtube.ts o download da legenda em json3 ou XML com host conferido, um redirect, teto de 5 MB e prazo, devolvendo as falas com tempo."
    arquivos:
      cria: ["tests/youtube-legenda.test.ts"]
      altera: ["src/lib/youtube.ts", "tests/apoio/youtube-falso.ts"]
    teste_integracao: "Contra o simulado a legenda em json3 e a em XML devolvem as mesmas falas com tempo de inicio e o texto das entidades decodificado."
    teste_funcional: "Uma baseUrl de host fora de youtube.com e recusada sem conexao, um redirect para host fora da lista e recusado, dois redirects em sequencia sao recusados, resposta acima do teto aborta e a legenda lenta estoura o prazo."
    criterio_aceite: "tests/youtube-legenda.test.ts passa e o simulado registra zero conexoes ao host proibido."
    depende_de: ["T-05.02", "T-04.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.04
    titulo: "Servico: adicionar YouTube"
    fase: F-05.2
    status: concluida
    objetivo: "Acrescentar a fontes.ts adicionarYoutube com validacao zod da URL, fonte pendente de tipo youtube com urlOrigem e titulo provisorio."
    arquivos:
      cria: ["tests/fontes-youtube.test.ts"]
      altera: ["src/servicos/fontes.ts"]
    teste_integracao: "Uma URL valida cria fonte pendente de tipo youtube com urlOrigem normalizada, sem arquivo em disco e acorda a fila."
    teste_funcional: "URL de outro host da 422, url ausente ou acima de 300 caracteres da 422, agente inexistente da 404 e usuario sem sessao da 401."
    criterio_aceite: "tests/fontes-youtube.test.ts passa."
    depende_de: ["T-05.01", "T-03.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.05
    titulo: "Rota do YouTube"
    fase: F-05.2
    status: concluida
    objetivo: "Criar POST /api/agentes/[id]/fontes/youtube com sessao, corpo JSON e resposta 202 com a fonte."
    arquivos:
      cria: ["src/app/api/agentes/[id]/fontes/youtube/route.ts", "tests/youtube-rota.test.ts"]
      altera: []
    teste_integracao: "Contra o servidor de producao um POST com url valida responde 202 com a fonte pendente e a fonte aparece na lista."
    teste_funcional: "Sem sessao responde 401, tipo de conteudo errado responde 415, URL de outro host responde 422 e corpo acima do teto responde 413."
    criterio_aceite: "tests/youtube-rota.test.ts passa com npm run build feito antes."
    depende_de: ["T-05.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.06
    titulo: "Fila: fonte YouTube"
    fase: F-05.2
    status: concluida
    objetivo: "Tratar o tipo youtube em fontes-fila.ts: buscar as legendas, trocar o titulo provisorio pelo do video, gravar duracao e tamanho e montar o texto com marcadores."
    arquivos:
      cria: ["tests/fontes-fila-youtube.test.ts"]
      altera: ["src/servicos/fontes-fila.ts", "src/lib/youtube.ts", "src/servicos/fontes.ts"]
    teste_integracao: "Contra o simulado do YouTube uma fonte youtube pendente vai a pronta com trechos que comecam com [00:00], titulo do video e duracaoSegundos preenchidos."
    teste_funcional: "Sem legendas a fonte fica em erro com a frase do briefing, um titulo dado pelo usuario nao e trocado, uma pagina quebrada da erro de leitura sem vazar detalhe e Reprocessar volta a buscar."
    criterio_aceite: "tests/fontes-fila-youtube.test.ts passa."
    depende_de: ["T-05.03", "T-05.04", "T-04.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Tasks — Sprint 05

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-05.01
titulo: "YouTube: id e validacao da URL"
objetivo: "Criar src/lib/youtube.ts com a extracao do id de watch, youtu.be, shorts e embed e a validacao do host da URL do usuario."
arquivos:
  cria: ["src/lib/youtube.ts", "tests/youtube-url.test.ts", "docs/conhecimento-em-video/sprint-05/sprint.md", "docs/conhecimento-em-video/sprint-05/fases.md", "docs/conhecimento-em-video/sprint-05/tasks.md"]
  altera: []
teste_integracao: "As quatro formas de URL com o mesmo id de 11 caracteres devolvem esse id e a URL gerada para ele usa so a base configurada."
teste_funcional: "Host de outro dominio, esquema que nao e http ou https, id fora de 11 caracteres de A-Za-z0-9_- e youtube.com.evil.com devolvem erro 422 com mensagem clara."
criterio_aceite: "tests/youtube-url.test.ts passa."
depende_de: ["T-01.05"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/youtube-url.test.ts, 33 passed
```

---

```yaml
id: T-05.02
titulo: "YouTube: pagina e faixas"
objetivo: "Acrescentar a youtube.ts a leitura da pagina do video na base configurada, a extracao do titulo e das faixas e a escolha da faixa por preferencia."
arquivos:
  cria: ["tests/youtube-pagina.test.ts"]
  altera: ["src/lib/youtube.ts"]
teste_integracao: "Contra o simulado a pagina de um id conhecido devolve o titulo e as faixas com idioma e se e automatica."
teste_funcional: "Com faixas manual em ingles, manual em portugues e automatica a escolha e a manual em portugues, sem manual em portugues e a manual em ingles, so com automatica e a automatica e sem faixa lanca Este video nao tem legendas disponiveis."
criterio_aceite: "tests/youtube-pagina.test.ts passa e a pagina e lida com teto de 3 MB e prazo de 15 s."
depende_de: ["T-05.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/youtube-pagina.test.ts e tests/youtube-url.test.ts, 42 passed
```

---

```yaml
id: T-05.03
titulo: "YouTube: baixar a legenda com SSRF"
objetivo: "Acrescentar a youtube.ts o download da legenda em json3 ou XML com host conferido, um redirect, teto de 5 MB e prazo, devolvendo as falas com tempo."
arquivos:
  cria: ["tests/youtube-legenda.test.ts"]
  altera: ["src/lib/youtube.ts", "tests/apoio/youtube-falso.ts"]
teste_integracao: "Contra o simulado a legenda em json3 e a em XML devolvem as mesmas falas com tempo de inicio e o texto das entidades decodificado."
teste_funcional: "Uma baseUrl de host fora de youtube.com e recusada sem conexao, um redirect para host fora da lista e recusado, dois redirects em sequencia sao recusados, resposta acima do teto aborta e a legenda lenta estoura o prazo."
criterio_aceite: "tests/youtube-legenda.test.ts passa e o simulado registra zero conexoes ao host proibido."
depende_de: ["T-05.02", "T-04.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/youtube-legenda.test.ts, tests/youtube-pagina.test.ts e tests/youtube-falso.test.ts, 24 passed
```

---

```yaml
id: T-05.04
titulo: "Servico: adicionar YouTube"
objetivo: "Acrescentar a fontes.ts adicionarYoutube com validacao zod da URL, fonte pendente de tipo youtube com urlOrigem e titulo provisorio."
arquivos:
  cria: ["tests/fontes-youtube.test.ts"]
  altera: ["src/servicos/fontes.ts"]
teste_integracao: "Uma URL valida cria fonte pendente de tipo youtube com urlOrigem normalizada, sem arquivo em disco e acorda a fila."
teste_funcional: "URL de outro host da 422, url ausente ou acima de 300 caracteres da 422, agente inexistente da 404 e usuario sem sessao da 401."
criterio_aceite: "tests/fontes-youtube.test.ts passa."
depende_de: ["T-05.01", "T-03.03"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/fontes-youtube.test.ts, tests/fontes.test.ts e tests/fontes-video.test.ts, 20 passed
```

---

```yaml
id: T-05.05
titulo: "Rota do YouTube"
objetivo: "Criar POST /api/agentes/[id]/fontes/youtube com sessao, corpo JSON e resposta 202 com a fonte."
arquivos:
  cria: ["src/app/api/agentes/[id]/fontes/youtube/route.ts", "tests/youtube-rota.test.ts"]
  altera: []
teste_integracao: "Contra o servidor de producao um POST com url valida responde 202 com a fonte pendente e a fonte aparece na lista."
teste_funcional: "Sem sessao responde 401, tipo de conteudo errado responde 415, URL de outro host responde 422 e corpo acima do teto responde 413."
criterio_aceite: "tests/youtube-rota.test.ts passa com npm run build feito antes."
depende_de: ["T-05.04"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/youtube-rota.test.ts, 4 passed
```

---

```yaml
id: T-05.06
titulo: "Fila: fonte YouTube"
objetivo: "Tratar o tipo youtube em fontes-fila.ts: buscar as legendas, trocar o titulo provisorio pelo do video, gravar duracao e tamanho e montar o texto com marcadores."
arquivos:
  cria: ["tests/fontes-fila-youtube.test.ts"]
  altera: ["src/servicos/fontes-fila.ts", "src/lib/youtube.ts", "src/servicos/fontes.ts"]
teste_integracao: "Contra o simulado do YouTube uma fonte youtube pendente vai a pronta com trechos que comecam com [00:00], titulo do video e duracaoSegundos preenchidos."
teste_funcional: "Sem legendas a fonte fica em erro com a frase do briefing, um titulo dado pelo usuario nao e trocado, uma pagina quebrada da erro de leitura sem vazar detalhe e Reprocessar volta a buscar."
criterio_aceite: "tests/fontes-fila-youtube.test.ts passa."
depende_de: ["T-05.03", "T-05.04", "T-04.04"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/fontes-fila-youtube.test.ts, tests/fontes-fila-video.test.ts, tests/fontes-fila.test.ts e tests/fontes-youtube.test.ts, 29 passed
```

---

