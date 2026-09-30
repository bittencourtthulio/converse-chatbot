---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-04
atualizado_em: 2026-09-30
tasks:
  - id: T-04.01
    titulo: "Tradutor e leitor do evento fontes"
    fase: F-04.1
    status: pendente
    objetivo: "Estender fluxoDeEventos e lerEventos para o evento fontes, sem encerrar o stream."
    arquivos:
      cria: []
      altera: ["src/app/eventos-sse.ts", "src/componentes/leitor-de-sse.ts", "tests/eventos-sse.test.ts", "tests/leitor-de-sse.test.ts"]
    teste_integracao: "fluxoDeEventos com um gerador trecho, fontes, fim produz tres quadros SSE na ordem e fecha so depois do fim."
    teste_funcional: "lerEventos devolve o evento fontes com a lista, ignora nome desconhecido como antes, trata fontes ilegivel como resposta invalida e aceita o quadro partido em pacotes."
    criterio_aceite: "tests/eventos-sse.test.ts e tests/leitor-de-sse.test.ts passam com os casos novos e os antigos."
    depende_de: ["T-03.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.02
    titulo: "Rota de conversa emite fontes de ponta a ponta"
    fase: F-04.1
    status: pendente
    objetivo: "Provar pelo servidor de producao que a rota conversar entrega o evento fontes e as fontes aparecem na conversa retomada."
    arquivos:
      cria: []
      altera: ["tests/conversar-rota.test.ts", "tests/apoio/servidor.ts"]
    teste_integracao: "Com next start, banco de teste com base pronta e OpenRouter falso, POST em conversar devolve no SSE os eventos trecho, fontes e fim."
    teste_funcional: "Sem fonte pronta a mesma rota devolve so trecho e fim, como na FT-03."
    criterio_aceite: "tests/conversar-rota.test.ts passa apos npm run build."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.03
    titulo: "POST /api/agentes/[id]/buscar"
    fase: F-04.2
    status: pendente
    objetivo: "Criar o handler fino e o servico buscarNaBase com validacao."
    arquivos:
      cria: ["src/app/api/agentes/[id]/buscar/route.ts", "tests/buscar-rota.test.ts", "docs/respostas-com-conhecimento/sprint-04/sprint.md", "docs/respostas-com-conhecimento/sprint-04/fases.md", "docs/respostas-com-conhecimento/sprint-04/tasks.md"]
      altera: ["src/servicos/recuperacao.ts", "tests/rotas.test.ts"]
    teste_integracao: "Contra next start com banco de teste, POST com sessao e {pergunta} devolve 200 e {trechos} com fonte, posicao, texto e pontuacao da fonte de exemplo."
    teste_funcional: "Sem sessao 401, agente inexistente 404, pergunta vazia ou com mais de 500 caracteres 422, e a resposta tem Cache-Control sem cache."
    criterio_aceite: "tests/buscar-rota.test.ts e tests/rotas.test.ts passam apos npm run build."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

> Um bloco por task.

---

```yaml
id: T-04.01
titulo: Tradutor e leitor do evento fontes
objetivo: Estender fluxoDeEventos e lerEventos para o evento fontes, sem encerrar o stream.
arquivos:
  cria: []
  altera: ["src/app/eventos-sse.ts", "src/componentes/leitor-de-sse.ts", "tests/eventos-sse.test.ts", "tests/leitor-de-sse.test.ts"]
teste_integracao: fluxoDeEventos com um gerador trecho, fontes, fim produz tres quadros SSE na ordem e fecha so depois do fim.
teste_funcional: lerEventos devolve o evento fontes com a lista, ignora nome desconhecido como antes, trata fontes ilegivel como resposta invalida e aceita o quadro partido em pacotes.
criterio_aceite: tests/eventos-sse.test.ts e tests/leitor-de-sse.test.ts passam com os casos novos e os antigos.
depende_de: ["T-03.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.02
titulo: Rota de conversa emite fontes de ponta a ponta
objetivo: Provar pelo servidor de producao que a rota conversar entrega o evento fontes e as fontes aparecem na conversa retomada.
arquivos:
  cria: []
  altera: ["tests/conversar-rota.test.ts", "tests/apoio/servidor.ts"]
teste_integracao: Com next start, banco de teste com base pronta e OpenRouter falso, POST em conversar devolve no SSE os eventos trecho, fontes e fim.
teste_funcional: Sem fonte pronta a mesma rota devolve so trecho e fim, como na FT-03.
criterio_aceite: tests/conversar-rota.test.ts passa apos npm run build.
depende_de: ["T-04.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.03
titulo: POST /api/agentes/[id]/buscar
objetivo: Criar o handler fino e o servico buscarNaBase com validacao.
arquivos:
  cria: ["src/app/api/agentes/[id]/buscar/route.ts", "tests/buscar-rota.test.ts", "docs/respostas-com-conhecimento/sprint-04/sprint.md", "docs/respostas-com-conhecimento/sprint-04/fases.md", "docs/respostas-com-conhecimento/sprint-04/tasks.md"]
  altera: ["src/servicos/recuperacao.ts", "tests/rotas.test.ts"]
teste_integracao: Contra next start com banco de teste, POST com sessao e {pergunta} devolve 200 e {trechos} com fonte, posicao, texto e pontuacao da fonte de exemplo.
teste_funcional: Sem sessao 401, agente inexistente 404, pergunta vazia ou com mais de 500 caracteres 422, e a resposta tem Cache-Control sem cache.
criterio_aceite: tests/buscar-rota.test.ts e tests/rotas.test.ts passam apos npm run build.
depende_de: ["T-02.02"]
paralelizavel: false
status: pendente
```

