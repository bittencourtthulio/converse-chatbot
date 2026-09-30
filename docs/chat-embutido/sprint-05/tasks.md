---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-05
atualizado_em: 2026-09-30
tasks:
  - id: T-05.01
    titulo: "Widget: montagem, config e idempotencia"
    fase: F-05.1
    status: pendente
    objetivo: "Escrever o widget que acha o proprio script, busca o config, monta botao e painel em Shadow DOM e nao faz nada se inativo."
    arquivos:
      cria: ["src/widget/widget.js", "tests/widget-montagem.test.ts", "docs/chat-embutido/sprint-05/sprint.md", "docs/chat-embutido/sprint-05/fases.md", "docs/chat-embutido/sprint-05/tasks.md"]
      altera: []
    teste_integracao: "No happy-dom, com fetch simulado, o script acrescenta um host com Shadow DOM e um botao com aria-label e aria-expanded falso."
    teste_funcional: "Com config 404 nada e acrescentado e o console nao recebe erro, incluir o script duas vezes monta um so botao, data-position e data-color validos sobrescrevem e invalidos sao ignorados, e a unica global nova e window.Converse."
    criterio_aceite: "tests/widget-montagem.test.ts passa com ao menos 10 casos."
    depende_de: ["T-04.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.02
    titulo: "Widget: abrir, fechar, foco e postMessage"
    fase: F-05.1
    status: pendente
    objetivo: "Acrescentar abertura com iframe preguicoso, Esc, foco, tela estreita, movimento reduzido e postMessage com origin estrito."
    arquivos:
      cria: ["tests/widget-interacao.test.ts"]
      altera: ["src/widget/widget.js"]
    teste_integracao: "No happy-dom o iframe so existe depois do primeiro clique, aponta para origem-da-plataforma/embed/id e fechar devolve o foco ao botao."
    teste_funcional: "Esc fecha, mensagem fechar com origin da plataforma fecha e com origin de outro site e ignorada, abrir() e fechar() de window.Converse funcionam e abaixo de 480px o painel ocupa a tela toda."
    criterio_aceite: "tests/widget-interacao.test.ts passa com ao menos 10 casos."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.03
    titulo: "Rota /widget.js"
    fase: F-05.2
    status: pendente
    objetivo: "Servir src/widget/widget.js por rota estatica com os cabecalhos do PR-60."
    arquivos:
      cria: ["src/app/widget.js/route.ts", "tests/widget-rota.test.ts"]
      altera: []
    teste_integracao: "Contra next start, GET /widget.js devolve 200 com o conteudo de src/widget/widget.js."
    teste_funcional: "Os cabecalhos sao Content-Type application/javascript, Cache-Control public max-age=300, Access-Control-Allow-Origin * e Cross-Origin-Resource-Policy cross-origin, e o corpo nao contem segredo nem cor fora do script."
    criterio_aceite: "tests/widget-rota.test.ts passa."
    depende_de: ["T-05.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 05

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-05.01
titulo: "Widget: montagem, config e idempotencia"
objetivo: "Escrever o widget que acha o proprio script, busca o config, monta botao e painel em Shadow DOM e nao faz nada se inativo."
arquivos:
  cria: ["src/widget/widget.js", "tests/widget-montagem.test.ts", "docs/chat-embutido/sprint-05/sprint.md", "docs/chat-embutido/sprint-05/fases.md", "docs/chat-embutido/sprint-05/tasks.md"]
  altera: []
teste_integracao: "No happy-dom, com fetch simulado, o script acrescenta um host com Shadow DOM e um botao com aria-label e aria-expanded falso."
teste_funcional: "Com config 404 nada e acrescentado e o console nao recebe erro, incluir o script duas vezes monta um so botao, data-position e data-color validos sobrescrevem e invalidos sao ignorados, e a unica global nova e window.Converse."
criterio_aceite: "tests/widget-montagem.test.ts passa com ao menos 10 casos."
depende_de: ["T-04.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.02
titulo: "Widget: abrir, fechar, foco e postMessage"
objetivo: "Acrescentar abertura com iframe preguicoso, Esc, foco, tela estreita, movimento reduzido e postMessage com origin estrito."
arquivos:
  cria: ["tests/widget-interacao.test.ts"]
  altera: ["src/widget/widget.js"]
teste_integracao: "No happy-dom o iframe so existe depois do primeiro clique, aponta para origem-da-plataforma/embed/id e fechar devolve o foco ao botao."
teste_funcional: "Esc fecha, mensagem fechar com origin da plataforma fecha e com origin de outro site e ignorada, abrir() e fechar() de window.Converse funcionam e abaixo de 480px o painel ocupa a tela toda."
criterio_aceite: "tests/widget-interacao.test.ts passa com ao menos 10 casos."
depende_de: ["T-05.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.03
titulo: "Rota /widget.js"
objetivo: "Servir src/widget/widget.js por rota estatica com os cabecalhos do PR-60."
arquivos:
  cria: ["src/app/widget.js/route.ts", "tests/widget-rota.test.ts"]
  altera: []
teste_integracao: "Contra next start, GET /widget.js devolve 200 com o conteudo de src/widget/widget.js."
teste_funcional: "Os cabecalhos sao Content-Type application/javascript, Cache-Control public max-age=300, Access-Control-Allow-Origin * e Cross-Origin-Resource-Policy cross-origin, e o corpo nao contem segredo nem cor fora do script."
criterio_aceite: "tests/widget-rota.test.ts passa."
depende_de: ["T-05.02"]
paralelizavel: false
status: pendente
```
