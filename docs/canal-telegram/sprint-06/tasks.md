---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-06
atualizado_em: 2026-09-30
tasks:
  - id: T-06.01
    titulo: "Aba Canais, pagina e logica do cartao"
    fase: F-06.1
    status: concluida
    objetivo: "Acrescentar a aba Canais, a pagina servidora com carregando, a lista de canais extensivel e o modulo puro que transforma o estado em visao do cartao."
    arquivos:
      cria: ["src/app/(sistema)/agentes/[id]/canais/page.tsx", "src/app/(sistema)/agentes/[id]/canais/loading.tsx", "src/componentes/canais-logica.ts", "src/componentes/canais.ts", "tests/canais-logica.test.ts", "docs/canal-telegram/sprint-06/sprint.md", "docs/canal-telegram/sprint-06/fases.md", "docs/canal-telegram/sprint-06/tasks.md"]
      altera: ["src/componentes/abas-do-agente.ts", "tests/abas-do-agente.test.tsx", "tests/rotas.test.ts"]
    teste_integracao: "tests/abas-do-agente.test.tsx e tests/rotas.test.ts conferem a aba Canais e a pagina exige sessao."
    teste_funcional: "visaoDoCartao devolve estado conectado, pausado ou com erro conforme o canal, habilita Conectar so com APP_URL https ou com a excecao de desenvolvimento e monta o link https://t.me/usuario."
    criterio_aceite: "tests/canais-logica.test.ts, tests/abas-do-agente.test.tsx e tests/rotas.test.ts passam."
    depende_de: ["T-05.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-06.02
    titulo: "Cartao do Telegram"
    fase: F-06.2
    status: pendente
    objetivo: "Criar o componente do cartao com passo a passo, campo de token em senha nunca preenchido, estados, confirmacao de desconectar, limite diario, aviso de APP_URL e estilos sobre tokens."
    arquivos:
      cria: ["src/componentes/CartaoTelegram.tsx", "tests/canais-ui.test.tsx"]
      altera: ["src/estilos/global.css", "tests/rotas.test.ts"]
    teste_integracao: "Renderizado com cada estado da visao, o cartao mostra o botao certo, o campo de token e type password sem value e o botao Conectar desabilitado com o aviso quando APP_URL nao e https."
    teste_funcional: "Conectado, o cartao mostra o nome do bot com link para https://t.me/usuario, selo Conectado, e Desconectar so age depois da confirmacao na propria tela; tests/tokens.test.ts continua verde sem cor literal."
    criterio_aceite: "tests/canais-ui.test.tsx e tests/tokens.test.ts passam e o alvo de toque dos botoes tem 44px no CSS."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-06.01
titulo: "Aba Canais, pagina e logica do cartao"
objetivo: "Acrescentar a aba Canais, a pagina servidora com carregando, a lista de canais extensivel e o modulo puro que transforma o estado em visao do cartao."
arquivos:
  cria: ["src/app/(sistema)/agentes/[id]/canais/page.tsx", "src/app/(sistema)/agentes/[id]/canais/loading.tsx", "src/componentes/canais-logica.ts", "src/componentes/canais.ts", "tests/canais-logica.test.ts", "docs/canal-telegram/sprint-06/sprint.md", "docs/canal-telegram/sprint-06/fases.md", "docs/canal-telegram/sprint-06/tasks.md"]
  altera: ["src/componentes/abas-do-agente.ts", "tests/abas-do-agente.test.tsx", "tests/rotas.test.ts"]
teste_integracao: "tests/abas-do-agente.test.tsx e tests/rotas.test.ts conferem a aba Canais e a pagina exige sessao."
teste_funcional: "visaoDoCartao devolve estado conectado, pausado ou com erro conforme o canal, habilita Conectar so com APP_URL https ou com a excecao de desenvolvimento e monta o link https://t.me/usuario."
criterio_aceite: "tests/canais-logica.test.ts, tests/abas-do-agente.test.tsx e tests/rotas.test.ts passam."
depende_de: ["T-05.02"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/canais-logica.test.ts, tests/abas-do-agente.test.tsx e tests/rotas.test.ts, 72 passed depois de npm run build; tsc e eslint limpos
```

---

```yaml
id: T-06.02
titulo: "Cartao do Telegram"
objetivo: "Criar o componente do cartao com passo a passo, campo de token em senha nunca preenchido, estados, confirmacao de desconectar, limite diario, aviso de APP_URL e estilos sobre tokens."
arquivos:
  cria: ["src/componentes/CartaoTelegram.tsx", "tests/canais-ui.test.tsx"]
  altera: ["src/estilos/global.css", "tests/rotas.test.ts"]
teste_integracao: "Renderizado com cada estado da visao, o cartao mostra o botao certo, o campo de token e type password sem value e o botao Conectar desabilitado com o aviso quando APP_URL nao e https."
teste_funcional: "Conectado, o cartao mostra o nome do bot com link para https://t.me/usuario, selo Conectado, e Desconectar so age depois da confirmacao na propria tela; tests/tokens.test.ts continua verde sem cor literal."
criterio_aceite: "tests/canais-ui.test.tsx e tests/tokens.test.ts passam e o alvo de toque dos botoes tem 44px no CSS."
depende_de: ["T-06.01"]
paralelizavel: false
status: pendente
```
