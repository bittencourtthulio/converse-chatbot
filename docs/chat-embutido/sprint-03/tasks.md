---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-03
atualizado_em: 2026-09-30
tasks:
  - id: T-03.01
    titulo: "Rota GET config e OPTIONS"
    fase: F-03.1
    status: pendente
    objetivo: "Criar o handler fino do config com CORS pela lista de dominios e o OPTIONS."
    arquivos:
      cria: ["src/app/api/publico/agentes/[id]/config/route.ts", "src/app/api/publico/resposta.ts", "tests/publico-config-rota.test.ts", "docs/chat-embutido/sprint-03/sprint.md", "docs/chat-embutido/sprint-03/fases.md", "docs/chat-embutido/sprint-03/tasks.md"]
      altera: []
    teste_integracao: "Contra next start, GET config de agente ativo devolve 200 so com campos visuais e 404 identico para inativo e inexistente, sem cookie de sessao."
    teste_funcional: "Com lista vazia o Access-Control-Allow-Origin e '*', com lista o Origin permitido e ecoado e o de fora nao recebe o cabecalho, Vary: Origin sempre presente e OPTIONS devolve 204."
    criterio_aceite: "tests/publico-config-rota.test.ts passa e a resposta nao contem instrucoes, modelo, dominios nem limite."
    depende_de: ["T-02.05"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.02
    titulo: "Rota POST conversar"
    fase: F-03.1
    status: pendente
    objetivo: "Criar o handler fino do turno publico em SSE com limites e checagem de Origin."
    arquivos:
      cria: ["src/app/api/publico/agentes/[id]/conversar/route.ts", "tests/publico-conversar-rota.test.ts"]
      altera: []
    teste_integracao: "Contra next start e o OpenRouter falso, o POST sem cookie devolve text/event-stream com trecho, fontes e fim, X-Conversa-Id e Cache-Control no-store."
    teste_funcional: "Erro do provedor vira evento erro com a frase do visitante, a 11a mensagem do minuto devolve 429 com Retry-After, teto diario 1 devolve 429 na 2a, Origin de outro site devolve 403 e visitanteId invalido devolve 422."
    criterio_aceite: "tests/publico-conversar-rota.test.ts passa e nenhuma resposta contem codigo do provedor, pilha nem correlacao."
    depende_de: ["T-03.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.03
    titulo: "Rota GET conversa"
    fase: F-03.1
    status: pendente
    objetivo: "Criar o handler da retomada das ultimas 50 mensagens do visitante."
    arquivos:
      cria: ["src/app/api/publico/agentes/[id]/conversa/route.ts", "tests/publico-conversa-rota.test.ts"]
      altera: []
    teste_integracao: "Contra next start, depois de conversar, GET conversa com X-Visitante-Id devolve as mensagens do proprio visitante e nada de outro visitante."
    teste_funcional: "Sem conversa devolve conversa null, com 60 mensagens devolve as ultimas 50 e truncada true, agente inativo devolve 404 e cabecalho ausente devolve 422."
    criterio_aceite: "tests/publico-conversa-rota.test.ts passa."
    depende_de: ["T-03.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.04
    titulo: "proxy.ts e X-Frame-Options fora de /embed"
    fase: F-03.2
    status: pendente
    objetivo: "Criar src/proxy.ts com frame-ancestors dinamico e separar o X-Frame-Options no next.config.ts."
    arquivos:
      cria: ["src/proxy.ts", "tests/embed-cabecalhos.test.ts"]
      altera: ["next.config.ts", "tests/rotas.test.ts"]
    teste_integracao: "Contra next start, GET /embed/<id> devolve Content-Security-Policy com frame-ancestors conforme a lista do agente e nenhum X-Frame-Options, e /entrar segue com DENY."
    teste_funcional: "Lista vazia devolve \"frame-ancestors *\", lista com dominios devolve 'self' mais os dominios, agente inativo e inexistente devolvem \"frame-ancestors 'self'\" identicos e nosniff e Referrer-Policy seguem presentes."
    criterio_aceite: "tests/embed-cabecalhos.test.ts e tests/rotas.test.ts passam."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-03.01
titulo: "Rota GET config e OPTIONS"
objetivo: "Criar o handler fino do config com CORS pela lista de dominios e o OPTIONS."
arquivos:
  cria: ["src/app/api/publico/agentes/[id]/config/route.ts", "src/app/api/publico/resposta.ts", "tests/publico-config-rota.test.ts", "docs/chat-embutido/sprint-03/sprint.md", "docs/chat-embutido/sprint-03/fases.md", "docs/chat-embutido/sprint-03/tasks.md"]
  altera: []
teste_integracao: "Contra next start, GET config de agente ativo devolve 200 so com campos visuais e 404 identico para inativo e inexistente, sem cookie de sessao."
teste_funcional: "Com lista vazia o Access-Control-Allow-Origin e '*', com lista o Origin permitido e ecoado e o de fora nao recebe o cabecalho, Vary: Origin sempre presente e OPTIONS devolve 204."
criterio_aceite: "tests/publico-config-rota.test.ts passa e a resposta nao contem instrucoes, modelo, dominios nem limite."
depende_de: ["T-02.05"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.02
titulo: "Rota POST conversar"
objetivo: "Criar o handler fino do turno publico em SSE com limites e checagem de Origin."
arquivos:
  cria: ["src/app/api/publico/agentes/[id]/conversar/route.ts", "tests/publico-conversar-rota.test.ts"]
  altera: []
teste_integracao: "Contra next start e o OpenRouter falso, o POST sem cookie devolve text/event-stream com trecho, fontes e fim, X-Conversa-Id e Cache-Control no-store."
teste_funcional: "Erro do provedor vira evento erro com a frase do visitante, a 11a mensagem do minuto devolve 429 com Retry-After, teto diario 1 devolve 429 na 2a, Origin de outro site devolve 403 e visitanteId invalido devolve 422."
criterio_aceite: "tests/publico-conversar-rota.test.ts passa e nenhuma resposta contem codigo do provedor, pilha nem correlacao."
depende_de: ["T-03.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.03
titulo: "Rota GET conversa"
objetivo: "Criar o handler da retomada das ultimas 50 mensagens do visitante."
arquivos:
  cria: ["src/app/api/publico/agentes/[id]/conversa/route.ts", "tests/publico-conversa-rota.test.ts"]
  altera: []
teste_integracao: "Contra next start, depois de conversar, GET conversa com X-Visitante-Id devolve as mensagens do proprio visitante e nada de outro visitante."
teste_funcional: "Sem conversa devolve conversa null, com 60 mensagens devolve as ultimas 50 e truncada true, agente inativo devolve 404 e cabecalho ausente devolve 422."
criterio_aceite: "tests/publico-conversa-rota.test.ts passa."
depende_de: ["T-03.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.04
titulo: "proxy.ts e X-Frame-Options fora de /embed"
objetivo: "Criar src/proxy.ts com frame-ancestors dinamico e separar o X-Frame-Options no next.config.ts."
arquivos:
  cria: ["src/proxy.ts", "tests/embed-cabecalhos.test.ts"]
  altera: ["next.config.ts", "tests/rotas.test.ts"]
teste_integracao: "Contra next start, GET /embed/<id> devolve Content-Security-Policy com frame-ancestors conforme a lista do agente e nenhum X-Frame-Options, e /entrar segue com DENY."
teste_funcional: "Lista vazia devolve \"frame-ancestors *\", lista com dominios devolve 'self' mais os dominios, agente inativo e inexistente devolvem \"frame-ancestors 'self'\" identicos e nosniff e Referrer-Policy seguem presentes."
criterio_aceite: "tests/embed-cabecalhos.test.ts e tests/rotas.test.ts passam."
depende_de: ["T-03.03"]
paralelizavel: false
status: pendente
```
