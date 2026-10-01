---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-04
atualizado_em: 2026-10-01
tasks:
  - id: T-04.01
    titulo: "Logica da tela de conversas"
    fase: F-04.1
    status: concluida
    objetivo: "Escrever a logica pura de filtros por searchParams, paginacao, selecao e formatacao de data."
    arquivos:
      cria: ["src/componentes/conversas-logica.ts", "tests/conversas-logica.test.ts", "docs/historico-de-conversas/sprint-04/sprint.md", "docs/historico-de-conversas/sprint-04/fases.md", "docs/historico-de-conversas/sprint-04/tasks.md"]
      altera: []
    teste_integracao: "O teste importa o modulo puro e o exercita com searchParams reais e com o reducer de selecao."
    teste_funcional: "searchParams com agente, canal, texto, de, ate e pagina viram o filtro do servico, pagina invalida vira 1, o reducer marca, desmarca e marca todos da pagina e o limite de 50 selecionadas e respeitado."
    criterio_aceite: "tests/conversas-logica.test.ts passa."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-04.02
    titulo: "Pagina da lista de conversas"
    fase: F-04.1
    status: concluida
    objetivo: "Criar /conversas com filtros, tabela que vira cartoes, badges de canal, paginacao, vazio, carregando e erro."
    arquivos:
      cria: ["src/app/(sistema)/conversas/(lista)/page.tsx", "src/app/(sistema)/conversas/(lista)/loading.tsx", "src/componentes/ListaDeConversas.tsx", "src/componentes/FiltrosDeConversas.tsx", "src/componentes/BadgeDeCanal.tsx", "tests/conversas-lista-ui.test.tsx", "tests/conversas-lista-estilos.test.ts"]
      altera: ["src/estilos/global.css", "tests/rotas.test.ts"]
    teste_integracao: "A pagina renderizada contra o servidor de producao do teste com conversas dos tres canais traz filtros, linhas clicaveis, badges com texto do canal e paginacao, e abre vazia com orientacao."
    teste_funcional: "A renderizacao com 3 conversas mostra rotulo, agente, canal, numero de mensagens, atividade e previa, a linha e um link para /conversas/<id>, sem conversas aparece o estado vazio que explica testar, publicar e conectar Telegram e o CSS traz o layout de cartoes abaixo de 768px."
    criterio_aceite: "tests/conversas-lista-ui.test.tsx, tests/conversas-lista-estilos.test.ts e o bloco de conversas de tests/rotas.test.ts passam."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-04.03
    titulo: "Selecao e apagar em lote com confirmacao"
    fase: F-04.2
    status: concluida
    objetivo: "Criar o componente de cliente com caixas de selecao, barra de acoes e confirmacao na propria tela."
    arquivos:
      cria: ["src/componentes/ListaComSelecao.tsx", "src/componentes/apagar-conversas.ts", "tests/conversas-lote-ui.test.tsx"]
      altera: ["src/componentes/ListaDeConversas.tsx", "src/estilos/global.css", "src/app/(sistema)/conversas/(lista)/page.tsx"]
    teste_integracao: "Com happy-dom e fetch simulado, marcar duas linhas, clicar em Apagar selecionadas e confirmar chama POST /api/conversas/apagar com os dois ids e recarrega a lista."
    teste_funcional: "A barra mostra a contagem, Cancelar fecha a confirmacao sem chamar a rede, window.confirm nunca e usado, falha do servidor mostra o erro na tela e o foco volta ao botao."
    criterio_aceite: "tests/conversas-lote-ui.test.tsx passa."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-04.04
    titulo: "Detalhe da conversa"
    fase: F-04.2
    status: concluida
    objetivo: "Criar /conversas/[id] com transcricao em bolhas, fontes da FT-05, metadados do canal, Exportar e Apagar com confirmacao."
    arquivos:
      cria: ["src/app/(sistema)/conversas/[id]/page.tsx", "src/app/(sistema)/conversas/[id]/loading.tsx", "src/app/(sistema)/conversas/[id]/not-found.tsx", "src/componentes/TranscricaoDaConversa.tsx", "src/componentes/AcoesDaConversa.tsx", "tests/conversas-detalhe-ui.test.tsx", "tests/conversas-detalhe-rota.test.ts", "src/app/(sistema)/conversas/[id]/layout.tsx", "src/app/(sistema)/conversas/[id]/carregar-conversa.ts"]
      altera: ["src/estilos/global.css", "tests/rotas.test.ts"]
    teste_integracao: "A pagina de uma conversa do widget com fontes, renderizada contra o servidor de producao do teste, mostra as bolhas na ordem, o horario, as fontes da resposta e o link para o agente, e id inexistente da 404."
    teste_funcional: "Uma mensagem de visitante com script e img onerror aparece como texto escapado sem elemento script nem img, o botao Exportar aponta para /api/conversas/<id>/exportar, Apagar pede confirmacao na tela e a pagina nao usa dangerouslySetInnerHTML."
    criterio_aceite: "tests/conversas-detalhe-ui.test.tsx e o bloco de detalhe de tests/rotas.test.ts passam."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
---

# Tasks — Sprint 04

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-04.01
titulo: "Logica da tela de conversas"
objetivo: "Escrever a logica pura de filtros por searchParams, paginacao, selecao e formatacao de data."
arquivos:
  cria: ["src/componentes/conversas-logica.ts", "tests/conversas-logica.test.ts", "docs/historico-de-conversas/sprint-04/sprint.md", "docs/historico-de-conversas/sprint-04/fases.md", "docs/historico-de-conversas/sprint-04/tasks.md"]
  altera: []
teste_integracao: "O teste importa o modulo puro e o exercita com searchParams reais e com o reducer de selecao."
teste_funcional: "searchParams com agente, canal, texto, de, ate e pagina viram o filtro do servico, pagina invalida vira 1, o reducer marca, desmarca e marca todos da pagina e o limite de 50 selecionadas e respeitado."
criterio_aceite: "tests/conversas-logica.test.ts passa."
depende_de: ["T-03.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/conversas-logica.test.ts 14 passed
```

---

```yaml
id: T-04.02
titulo: "Pagina da lista de conversas"
objetivo: "Criar /conversas com filtros, tabela que vira cartoes, badges de canal, paginacao, vazio, carregando e erro."
arquivos:
  cria: ["src/app/(sistema)/conversas/(lista)/page.tsx", "src/app/(sistema)/conversas/(lista)/loading.tsx", "src/componentes/ListaDeConversas.tsx", "src/componentes/FiltrosDeConversas.tsx", "src/componentes/BadgeDeCanal.tsx", "tests/conversas-lista-ui.test.tsx", "tests/conversas-lista-estilos.test.ts"]
  altera: ["src/estilos/global.css", "tests/rotas.test.ts"]
teste_integracao: "A pagina renderizada contra o servidor de producao do teste com conversas dos tres canais traz filtros, linhas clicaveis, badges com texto do canal e paginacao, e abre vazia com orientacao."
teste_funcional: "A renderizacao com 3 conversas mostra rotulo, agente, canal, numero de mensagens, atividade e previa, a linha e um link para /conversas/<id>, sem conversas aparece o estado vazio que explica testar, publicar e conectar Telegram e o CSS traz o layout de cartoes abaixo de 768px."
criterio_aceite: "tests/conversas-lista-ui.test.tsx, tests/conversas-lista-estilos.test.ts e o bloco de conversas de tests/rotas.test.ts passam."
depende_de: ["T-04.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/conversas-lista-ui, conversas-lista-estilos, tokens e rotas passam; desvio: pagina em conversas/(lista)/
```

---

```yaml
id: T-04.03
titulo: "Selecao e apagar em lote com confirmacao"
objetivo: "Criar o componente de cliente com caixas de selecao, barra de acoes e confirmacao na propria tela."
arquivos:
  cria: ["src/componentes/ListaComSelecao.tsx", "src/componentes/apagar-conversas.ts", "tests/conversas-lote-ui.test.tsx"]
  altera: ["src/componentes/ListaDeConversas.tsx", "src/estilos/global.css", "src/app/(sistema)/conversas/(lista)/page.tsx"]
teste_integracao: "Com happy-dom e fetch simulado, marcar duas linhas, clicar em Apagar selecionadas e confirmar chama POST /api/conversas/apagar com os dois ids e recarrega a lista."
teste_funcional: "A barra mostra a contagem, Cancelar fecha a confirmacao sem chamar a rede, window.confirm nunca e usado, falha do servidor mostra o erro na tela e o foco volta ao botao."
criterio_aceite: "tests/conversas-lote-ui.test.tsx passa."
depende_de: ["T-04.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/conversas-lote-ui, lista-ui, lista-estilos, tokens 77 passed; desvio: page.tsx da lista passa a usar ListaComSelecao
```

---

```yaml
id: T-04.04
titulo: "Detalhe da conversa"
objetivo: "Criar /conversas/[id] com transcricao em bolhas, fontes da FT-05, metadados do canal, Exportar e Apagar com confirmacao."
arquivos:
  cria: ["src/app/(sistema)/conversas/[id]/page.tsx", "src/app/(sistema)/conversas/[id]/loading.tsx", "src/app/(sistema)/conversas/[id]/not-found.tsx", "src/componentes/TranscricaoDaConversa.tsx", "src/componentes/AcoesDaConversa.tsx", "tests/conversas-detalhe-ui.test.tsx", "tests/conversas-detalhe-rota.test.ts", "src/app/(sistema)/conversas/[id]/layout.tsx", "src/app/(sistema)/conversas/[id]/carregar-conversa.ts"]
  altera: ["src/estilos/global.css", "tests/rotas.test.ts"]
teste_integracao: "A pagina de uma conversa do widget com fontes, renderizada contra o servidor de producao do teste, mostra as bolhas na ordem, o horario, as fontes da resposta e o link para o agente, e id inexistente da 404."
teste_funcional: "Uma mensagem de visitante com script e img onerror aparece como texto escapado sem elemento script nem img, o botao Exportar aponta para /api/conversas/<id>/exportar, Apagar pede confirmacao na tela e a pagina nao usa dangerouslySetInnerHTML."
criterio_aceite: "tests/conversas-detalhe-ui.test.tsx e o bloco de detalhe de tests/rotas.test.ts passam."
depende_de: ["T-04.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — detalhe-ui, detalhe-rota, lista-ui, lista-estilos e tokens 85 passed; desvio: layout.tsx, carregar-conversa.ts e tests/conversas-detalhe-rota.test.ts
```

