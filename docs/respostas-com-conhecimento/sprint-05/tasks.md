---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-05
atualizado_em: 2026-09-30
tasks:
  - id: T-05.01
    titulo: "Referencias [n] no texto do modelo"
    fase: F-05.1
    status: concluida
    objetivo: "Acrescentar o no referencia ao analisador e ao renderizador seguro, so para numeros presentes na lista."
    arquivos:
      cria: []
      altera: ["src/componentes/texto-seguro.ts", "src/componentes/TextoDoModelo.tsx", "tests/texto-seguro.test.tsx"]
    teste_integracao: "TextoDoModelo com referencias=[1,2] renderiza [1] e [2] como elementos de referencia (botao com rotulo acessivel) e o markup nao tem HTML cru."
    teste_funcional: "analisarTexto('veja [1] e [7]', {referencias:[1]}) marca so o 1, '[1](https://x.com)' continua link e sem a opcao nada muda em relacao a FT-03."
    criterio_aceite: "tests/texto-seguro.test.tsx passa com os casos antigos e os novos."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.02
    titulo: "Estado da conversa com fontes"
    fase: F-05.1
    status: pendente
    objetivo: "Bolha.fontes opcional, acao fontes e retomada com fontes."
    arquivos:
      cria: []
      altera: ["src/componentes/estado-da-conversa.ts", "tests/estado-da-conversa.test.ts"]
    teste_integracao: "reduzir com a acao fontes durante a transmissao guarda as fontes na bolha do agente e o fim preserva."
    teste_funcional: "estadoInicial com retomada que traz fontes por mensagem as coloca nas bolhas, e 'parar' ou 'erro' sem fim descarta as fontes da bolha incompleta."
    criterio_aceite: "tests/estado-da-conversa.test.ts passa com os casos novos e os antigos."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.03
    titulo: "Fontes da resposta na aba Testar"
    fase: F-05.2
    status: pendente
    objetivo: "Criar FontesDaResposta (chips, citadas em destaque, consultadas recolhidas, trecho expansivel), ligar ao chat e a pagina Testar, com estilos."
    arquivos:
      cria: ["src/componentes/FontesDaResposta.tsx", "src/componentes/fontes-da-resposta-logica.ts", "tests/fontes-da-resposta-ui.test.tsx"]
      altera: ["src/componentes/ChatDeTeste.tsx", "src/app/(sistema)/agentes/[id]/testar/page.tsx", "src/estilos/global.css", "tests/chat-de-teste.test.tsx"]
    teste_integracao: "renderToStaticMarkup do ChatDeTeste com retomada que traz fontes mostra a secao Fontes com chip por fonte citada, a secao recolhida das consultadas e as referencias [n] ligadas."
    teste_funcional: "fontes-da-resposta-logica separa citadas e consultadas e nenhum CSS novo usa cor literal (tests/tokens.test.ts)."
    criterio_aceite: "tests/fontes-da-resposta-ui.test.tsx, tests/chat-de-teste.test.tsx e tests/tokens.test.ts passam."
    depende_de: ["T-05.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.04
    titulo: "Cartao Testar busca na aba Conhecimento"
    fase: F-05.2
    status: pendente
    objetivo: "Criar TestarBusca com campo, botao e estados vazio, carregando, erro e resultado, dentro do PainelDeConhecimento."
    arquivos:
      cria: ["src/componentes/TestarBusca.tsx", "src/componentes/busca-logica.ts", "tests/busca-logica.test.ts", "docs/respostas-com-conhecimento/sprint-05/sprint.md", "docs/respostas-com-conhecimento/sprint-05/fases.md", "docs/respostas-com-conhecimento/sprint-05/tasks.md"]
      altera: ["src/componentes/PainelDeConhecimento.tsx", "src/estilos/global.css", "tests/painel-de-conhecimento.test.tsx"]
    teste_integracao: "renderToStaticMarkup do PainelDeConhecimento contem o cartao Testar busca com campo rotulado e botao."
    teste_funcional: "busca-logica valida a pergunta (1 a 500), reduz os estados vazio, carregando, erro e resultado, e formata a pontuacao com duas casas."
    criterio_aceite: "tests/busca-logica.test.ts, tests/painel-de-conhecimento.test.tsx e tests/tokens.test.ts passam."
    depende_de: ["T-04.03", "T-05.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 05

> Um bloco por task.

---

```yaml
id: T-05.01
titulo: Referencias [n] no texto do modelo
objetivo: Acrescentar o no referencia ao analisador e ao renderizador seguro, so para numeros presentes na lista.
arquivos:
  cria: []
  altera: ["src/componentes/texto-seguro.ts", "src/componentes/TextoDoModelo.tsx", "tests/texto-seguro.test.tsx"]
teste_integracao: TextoDoModelo com referencias=[1,2] renderiza [1] e [2] como elementos de referencia (botao com rotulo acessivel) e o markup nao tem HTML cru.
teste_funcional: analisarTexto('veja [1] e [7]', {referencias:[1]}) marca so o 1, '[1](https://x.com)' continua link e sem a opcao nada muda em relacao a FT-03.
criterio_aceite: tests/texto-seguro.test.tsx passa com os casos antigos e os novos.
depende_de: ["T-04.01"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial: texto-seguro 26 passed
```

---

```yaml
id: T-05.02
titulo: Estado da conversa com fontes
objetivo: Bolha.fontes opcional, acao fontes e retomada com fontes.
arquivos:
  cria: []
  altera: ["src/componentes/estado-da-conversa.ts", "tests/estado-da-conversa.test.ts"]
teste_integracao: reduzir com a acao fontes durante a transmissao guarda as fontes na bolha do agente e o fim preserva.
teste_funcional: estadoInicial com retomada que traz fontes por mensagem as coloca nas bolhas, e 'parar' ou 'erro' sem fim descarta as fontes da bolha incompleta.
criterio_aceite: tests/estado-da-conversa.test.ts passa com os casos novos e os antigos.
depende_de: ["T-05.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.03
titulo: Fontes da resposta na aba Testar
objetivo: Criar FontesDaResposta (chips, citadas em destaque, consultadas recolhidas, trecho expansivel), ligar ao chat e a pagina Testar, com estilos.
arquivos:
  cria: ["src/componentes/FontesDaResposta.tsx", "src/componentes/fontes-da-resposta-logica.ts", "tests/fontes-da-resposta-ui.test.tsx"]
  altera: ["src/componentes/ChatDeTeste.tsx", "src/app/(sistema)/agentes/[id]/testar/page.tsx", "src/estilos/global.css", "tests/chat-de-teste.test.tsx"]
teste_integracao: renderToStaticMarkup do ChatDeTeste com retomada que traz fontes mostra a secao Fontes com chip por fonte citada, a secao recolhida das consultadas e as referencias [n] ligadas.
teste_funcional: fontes-da-resposta-logica separa citadas e consultadas e nenhum CSS novo usa cor literal (tests/tokens.test.ts).
criterio_aceite: tests/fontes-da-resposta-ui.test.tsx, tests/chat-de-teste.test.tsx e tests/tokens.test.ts passam.
depende_de: ["T-05.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.04
titulo: Cartao Testar busca na aba Conhecimento
objetivo: Criar TestarBusca com campo, botao e estados vazio, carregando, erro e resultado, dentro do PainelDeConhecimento.
arquivos:
  cria: ["src/componentes/TestarBusca.tsx", "src/componentes/busca-logica.ts", "tests/busca-logica.test.ts", "docs/respostas-com-conhecimento/sprint-05/sprint.md", "docs/respostas-com-conhecimento/sprint-05/fases.md", "docs/respostas-com-conhecimento/sprint-05/tasks.md"]
  altera: ["src/componentes/PainelDeConhecimento.tsx", "src/estilos/global.css", "tests/painel-de-conhecimento.test.tsx"]
teste_integracao: renderToStaticMarkup do PainelDeConhecimento contem o cartao Testar busca com campo rotulado e botao.
teste_funcional: busca-logica valida a pergunta (1 a 500), reduz os estados vazio, carregando, erro e resultado, e formata a pontuacao com duas casas.
criterio_aceite: tests/busca-logica.test.ts, tests/painel-de-conhecimento.test.tsx e tests/tokens.test.ts passam.
depende_de: ["T-04.03", "T-05.03"]
paralelizavel: false
status: pendente
```

