---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-04
atualizado_em: 2026-09-30
tasks:
  - id: T-04.01
    titulo: "Logica pura do embed"
    fase: F-04.1
    status: concluida
    objetivo: "Escrever geracao e guarda do visitanteId, cor e estilo do agente e estado da retomada em modulo puro."
    arquivos:
      cria: ["src/componentes/embed-logica.ts", "tests/embed-logica.test.ts", "docs/chat-embutido/sprint-04/sprint.md", "docs/chat-embutido/sprint-04/fases.md", "docs/chat-embutido/sprint-04/tasks.md"]
      altera: []
    teste_integracao: "Com um storage falso que lanca em todo acesso, obterVisitanteId devolve um id efemero valido e com storage normal devolve o mesmo id nas chamadas seguintes."
    teste_funcional: "O id gerado tem 32 hexadecimais aceitos por [A-Za-z0-9_-]{16,64}, e estiloDoAgente('#ffeb3b') usa texto escuro e estiloDoAgente('#1a237e') usa texto claro com contraste de 4,5 ou mais."
    criterio_aceite: "tests/embed-logica.test.ts passa com ao menos 12 casos."
    depende_de: ["T-03.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-04.02
    titulo: "Componente ChatEmbutido"
    fase: F-04.1
    status: concluida
    objetivo: "Criar o componente cliente do chat compacto reusando o reducer, lerEventos e o renderizador seguro."
    arquivos:
      cria: ["src/componentes/ChatEmbutido.tsx", "src/componentes/AvatarDoChat.tsx", "tests/chat-embutido-ui.test.tsx"]
      altera: ["src/estilos/global.css", "src/componentes/embed-logica.ts", "tests/embed-logica.test.ts"]
    teste_integracao: "Renderizado no servidor com configuracao e sem historico, o componente mostra cabecalho com avatar e titulo, mensagem inicial, sugestoes como botoes, aviso de privacidade e campo rotulado."
    teste_funcional: "Com configuracao sem aviso e sem sugestoes esses blocos nao aparecem, a cor do agente entra como variavel de CSS, nenhum dangerouslySetInnerHTML existe no arquivo e nenhuma cor literal existe no CSS novo."
    criterio_aceite: "tests/chat-embutido-ui.test.tsx e tests/tokens.test.ts passam."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-04.03
    titulo: "Mensagens do iframe e previa"
    fase: F-04.2
    status: concluida
    objetivo: "Escrever o protocolo puro de postMessage (fechar, redimensionar, previa) e ligar ao componente."
    arquivos:
      cria: ["src/componentes/embed-mensagens.ts", "tests/embed-mensagens.test.ts"]
      altera: ["src/componentes/ChatEmbutido.tsx"]
    teste_integracao: "O ouvinte da previa aceita so mensagens de event.origin igual a location.origin e ignora as demais."
    teste_funcional: "montarMensagem('fechar') devolve {origem:'converse', tipo:'fechar'}, a previa com cor invalida e ignorada e com cor valida atualiza a configuracao exibida."
    criterio_aceite: "tests/embed-mensagens.test.ts passa com ao menos 8 casos."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-04.04
    titulo: "Pagina /embed/[id]"
    fase: F-04.2
    status: pendente
    objetivo: "Criar a pagina fora do grupo sistema, com estado indisponivel neutro e previa por sessao."
    arquivos:
      cria: ["src/app/embed/[id]/page.tsx", "src/app/embed/[id]/loading.tsx", "src/app/embed/[id]/not-found.tsx", "tests/embed-pagina.test.ts"]
      altera: ["src/servicos/chat-publico-config.ts", "tests/chat-publico-config-publica.test.ts", "src/estilos/global.css"]
    teste_integracao: "Contra next start, /embed/<id> de agente ativo abre sem login e sem barra lateral com titulo, cor e mensagem inicial e o de agente inativo e inexistente mostra o mesmo texto neutro sem nome do agente."
    teste_funcional: "Com ?previa=1 sem sessao a pagina mostra a mensagem neutra, com sessao e agente inativo mostra o chat com o aviso de previa, e o HTML nunca contem instrucoes nem modelo."
    criterio_aceite: "tests/embed-pagina.test.ts passa e a resposta nao contem as instrucoes do agente."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-04.01
titulo: "Logica pura do embed"
objetivo: "Escrever geracao e guarda do visitanteId, cor e estilo do agente e estado da retomada em modulo puro."
arquivos:
  cria: ["src/componentes/embed-logica.ts", "tests/embed-logica.test.ts", "docs/chat-embutido/sprint-04/sprint.md", "docs/chat-embutido/sprint-04/fases.md", "docs/chat-embutido/sprint-04/tasks.md"]
  altera: []
teste_integracao: "Com um storage falso que lanca em todo acesso, obterVisitanteId devolve um id efemero valido e com storage normal devolve o mesmo id nas chamadas seguintes."
teste_funcional: "O id gerado tem 32 hexadecimais aceitos por [A-Za-z0-9_-]{16,64}, e estiloDoAgente('#ffeb3b') usa texto escuro e estiloDoAgente('#1a237e') usa texto claro com contraste de 4,5 ou mais."
criterio_aceite: "tests/embed-logica.test.ts passa com ao menos 12 casos."
depende_de: ["T-03.04"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1291 passed
```

---

```yaml
id: T-04.02
titulo: "Componente ChatEmbutido"
objetivo: "Criar o componente cliente do chat compacto reusando o reducer, lerEventos e o renderizador seguro."
arquivos:
  cria: ["src/componentes/ChatEmbutido.tsx", "src/componentes/AvatarDoChat.tsx", "tests/chat-embutido-ui.test.tsx"]
  altera: ["src/estilos/global.css", "src/componentes/embed-logica.ts", "tests/embed-logica.test.ts"]
teste_integracao: "Renderizado no servidor com configuracao e sem historico, o componente mostra cabecalho com avatar e titulo, mensagem inicial, sugestoes como botoes, aviso de privacidade e campo rotulado."
teste_funcional: "Com configuracao sem aviso e sem sugestoes esses blocos nao aparecem, a cor do agente entra como variavel de CSS, nenhum dangerouslySetInnerHTML existe no arquivo e nenhuma cor literal existe no CSS novo."
criterio_aceite: "tests/chat-embutido-ui.test.tsx e tests/tokens.test.ts passam."
depende_de: ["T-04.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1317 passed
```

---

```yaml
id: T-04.03
titulo: "Mensagens do iframe e previa"
objetivo: "Escrever o protocolo puro de postMessage (fechar, redimensionar, previa) e ligar ao componente."
arquivos:
  cria: ["src/componentes/embed-mensagens.ts", "tests/embed-mensagens.test.ts"]
  altera: ["src/componentes/ChatEmbutido.tsx"]
teste_integracao: "O ouvinte da previa aceita so mensagens de event.origin igual a location.origin e ignora as demais."
teste_funcional: "montarMensagem('fechar') devolve {origem:'converse', tipo:'fechar'}, a previa com cor invalida e ignorada e com cor valida atualiza a configuracao exibida."
criterio_aceite: "tests/embed-mensagens.test.ts passa com ao menos 8 casos."
depende_de: ["T-04.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1328 passed
```

---

```yaml
id: T-04.04
titulo: "Pagina /embed/[id]"
objetivo: "Criar a pagina fora do grupo sistema, com estado indisponivel neutro e previa por sessao."
arquivos:
  cria: ["src/app/embed/[id]/page.tsx", "src/app/embed/[id]/loading.tsx", "src/app/embed/[id]/not-found.tsx", "tests/embed-pagina.test.ts"]
  altera: ["src/servicos/chat-publico-config.ts", "tests/chat-publico-config-publica.test.ts", "src/estilos/global.css"]
teste_integracao: "Contra next start, /embed/<id> de agente ativo abre sem login e sem barra lateral com titulo, cor e mensagem inicial e o de agente inativo e inexistente mostra o mesmo texto neutro sem nome do agente."
teste_funcional: "Com ?previa=1 sem sessao a pagina mostra a mensagem neutra, com sessao e agente inativo mostra o chat com o aviso de previa, e o HTML nunca contem instrucoes nem modelo."
criterio_aceite: "tests/embed-pagina.test.ts passa e a resposta nao contem as instrucoes do agente."
depende_de: ["T-04.03"]
paralelizavel: false
status: pendente
```
