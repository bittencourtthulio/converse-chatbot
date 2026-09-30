---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
sprint_id: sprint-05
atualizado_em: 2026-09-30
sprint:
  titulo: "Telas de agentes"
  status: pendente
  criterio_saida: "tests/menu.test.ts, tests/abas-do-agente.test.tsx, tests/seletor-de-modelo.test.tsx, tests/formulario-de-agente.test.tsx e tests/rotas.test.ts passam; nenhuma cor literal fora de tokens.css; suite verde."
  riscos: ["redirect apos criar precisa ficar fora do try/catch (base/interface-e-menu.md)", "Campo do template so tem input: textarea, contador e seletor sao componentes novos sobre classes existentes"]
  fora_de_escopo: ["abas Conhecimento, Canais e Conversas - features seguintes", "conversa de teste - FT-03"]
fases:
  - id: F-05.1
    titulo: "Telas"
    status: pendente
    criterio_saida: "usuario cria, edita e exclui agente pela interface e o admin ve o aviso de chave"
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01, T-05.02, T-05.03, T-05.04, T-05.05, T-05.06, T-05.07]
tasks:
  - id: T-05.01
    titulo: "Item Agentes no menu"
    fase: F-05.1
    status: concluida
    objetivo: "Colocar Agentes abaixo de Painel e herdar o titulo nas rotas de detalhe."
    arquivos:
      cria: []
      altera: ["src/componentes/itens-de-menu.ts", "src/componentes/Icones.tsx", "tests/menu.test.ts"]
    teste_integracao: "tests/menu.test.ts le GRUPOS_DE_MENU e migalhasDaRota."
    teste_funcional: "o grupo sem titulo tem Painel e depois Agentes para todos os papeis, migalhasDaRota de /agentes/novo e de /agentes/abc devolve Agentes, e rotaEstaAtiva de /agentes em /agentes/abc e verdadeira."
    criterio_aceite: "O teste de menu passa e o icone agentes existe em Icones.tsx."
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.02
    titulo: "AbasDoAgente e lista extensivel de abas"
    fase: F-05.1
    status: concluida
    objetivo: "Componente de abas alimentado por lista propria, so com Configuracoes."
    arquivos:
      cria: ["src/componentes/abas-do-agente.ts", "src/componentes/AbasDoAgente.tsx", "tests/abas-do-agente.test.tsx"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "tests/abas-do-agente.test.tsx renderiza AbasDoAgente com react-dom/server."
    teste_funcional: "a lista tem uma aba Configuracoes com href /agentes/<id>, a aba ativa leva aria-current page, e acrescentar uma entrada na lista faz aparecer outra aba sem mudar o componente."
    criterio_aceite: "O teste passa e o global.css nao ganha cor literal (tests/tokens.test.ts verde)."
    depende_de: [T-05.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.03
    titulo: "SeletorDeModelo"
    fase: F-05.1
    status: concluida
    objetivo: "Campo de modelo com sugestoes, texto livre e aviso sem chave."
    arquivos:
      cria: ["src/componentes/SeletorDeModelo.tsx", "tests/seletor-de-modelo.test.tsx"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "tests/seletor-de-modelo.test.tsx renderiza o componente com react-dom/server."
    teste_funcional: "com modelos ha um datalist com um option por modelo e o campo aceita texto livre, sem chave nao ha datalist e aparece o aviso, o link para Integracoes so aparece quando ehAdmin e verdadeiro, e lista de reserva mostra aviso de lista reduzida."
    criterio_aceite: "O teste passa e o campo se chama modelo e tem valor inicial."
    depende_de: [T-05.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.04
    titulo: "Formulario de agente e acoes de servidor"
    fase: F-05.1
    status: pendente
    objetivo: "Formulario com contador de instrucoes, temperatura e mensagem inicial, mais as acoes criar, editar e excluir."
    arquivos:
      cria: ["src/componentes/FormularioDeAgente.tsx", "tests/formulario-de-agente.test.tsx"]
      altera: ["src/app/acoes.ts", "src/estilos/global.css"]
    teste_integracao: "tests/formulario-de-agente.test.tsx renderiza o formulario com react-dom/server."
    teste_funcional: "o formulario traz nome, instrucoes com contador 0 de 8000, seletor de modelo, temperatura de 0 a 2 com passo 0.1 e mensagem inicial com valores iniciais do agente, e as acoes usam exigirUsuario e o servico de agentes."
    criterio_aceite: "O teste passa e criarAgente redireciona para /agentes/<id> fora do try/catch."
    depende_de: [T-05.03, T-04.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.05
    titulo: "Botao de excluir com confirmacao na tela"
    fase: F-05.1
    status: pendente
    objetivo: "Excluir agente com bloco de confirmacao, sem window.confirm."
    arquivos:
      cria: ["src/componentes/BotaoExcluirAgente.tsx"]
      altera: ["tests/formulario-de-agente.test.tsx"]
    teste_integracao: "tests/formulario-de-agente.test.tsx renderiza e aciona BotaoExcluirAgente."
    teste_funcional: "o estado inicial mostra so o botao Excluir agente, apos o clique aparecem o nome do agente, Cancelar e Confirmar exclusao, e o codigo-fonte nao contem window.confirm."
    criterio_aceite: "O teste passa e Cancelar volta ao estado inicial."
    depende_de: [T-05.04]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.06
    titulo: "Paginas /agentes e /agentes/novo"
    fase: F-05.1
    status: pendente
    objetivo: "Grade de cartoes com estados vazio e carregando, e pagina de novo agente."
    arquivos:
      cria: ["src/app/(sistema)/agentes/page.tsx", "src/app/(sistema)/agentes/loading.tsx", "src/app/(sistema)/agentes/novo/page.tsx"]
      altera: ["src/estilos/global.css", "tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts sobe o servidor de producao ja usado e cria agentes pelo servico."
    teste_funcional: "sem sessao /agentes redireciona para /entrar, usuario comum ve 200 em /agentes com nome, modelo e data do agente criado, sem agentes a pagina traz o estado vazio com o link para /agentes/novo, e /agentes/novo traz o campo modelo com openai/gpt-4o-mini."
    criterio_aceite: "O teste de rotas passa apos npm run build e cada pagina chama exigirUsuario."
    depende_de: [T-05.05]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.07
    titulo: "Pagina /agentes/[id] com layout de abas"
    fase: F-05.1
    status: pendente
    objetivo: "Layout compartilhado com nome e abas e a aba Configuracoes com excluir."
    arquivos:
      cria: ["src/app/(sistema)/agentes/[id]/layout.tsx", "src/app/(sistema)/agentes/[id]/page.tsx", "src/app/(sistema)/agentes/[id]/loading.tsx"]
      altera: ["tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts sobe o servidor de producao ja usado e cria um agente pelo servico."
    teste_funcional: "/agentes/<id> responde 200 com o nome do agente, a aba Configuracoes com aria-current, o formulario com os valores salvos e o botao Excluir agente, e id inexistente responde 404."
    criterio_aceite: "O teste de rotas passa apos npm run build e a pagina nao contem window.confirm."
    depende_de: [T-05.06]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 05 — Telas de agentes

## Critério de saída da sprint

tests/menu.test.ts, tests/abas-do-agente.test.tsx, tests/seletor-de-modelo.test.tsx, tests/formulario-de-agente.test.tsx e tests/rotas.test.ts passam; nenhuma cor literal fora de tokens.css; suite verde.

## Riscos conhecidos

- redirect apos criar precisa ficar fora do try/catch (base/interface-e-menu.md)
- Campo do template so tem input: textarea, contador e seletor sao componentes novos sobre classes existentes

## Fora de escopo

- abas Conhecimento, Canais e Conversas - features seguintes
- conversa de teste - FT-03

## Fase F-05.1 — Telas

**Tasks:** T-05.01, T-05.02, T-05.03, T-05.04, T-05.05, T-05.06, T-05.07

**Critério de saída:** usuario cria, edita e exclui agente pela interface e o admin ve o aviso de chave

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-05 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_05_1["F-05.1 Telas"]
    T_05_01["T-05.01<br/>Item Agentes no menu"]
    T_05_02["T-05.02<br/>AbasDoAgente e lista extensi"]
    T_05_03["T-05.03<br/>SeletorDeModelo"]
    T_05_04["T-05.04<br/>Formulario de agente e acoes"]
    T_05_05["T-05.05<br/>Botao de excluir com confirm"]
    T_05_06["T-05.06<br/>Paginas /agentes e /agentes/"]
    T_05_07["T-05.07<br/>Pagina /agentes/[id] com lay"]
  end
  T_05_01 --> T_05_02
  T_05_02 --> T_05_03
  T_05_03 --> T_05_04
  T_05_04 --> T_05_05
  T_05_05 --> T_05_06
  T_05_06 --> T_05_07
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_05_01 concluida
  class T_05_02 concluida
  class T_05_03 concluida
  class T_05_04 pendente
  class T_05_05 pendente
  class T_05_06 pendente
  class T_05_07 pendente
```

## Tasks

---

```yaml
id: T-05.01
titulo: Item Agentes no menu
objetivo: Colocar Agentes abaixo de Painel e herdar o titulo nas rotas de detalhe.
arquivos:
  cria: []
  altera: [src/componentes/itens-de-menu.ts, src/componentes/Icones.tsx, tests/menu.test.ts]
teste_integracao: tests/menu.test.ts le GRUPOS_DE_MENU e migalhasDaRota.
teste_funcional: o grupo sem titulo tem Painel e depois Agentes para todos os papeis, migalhasDaRota de /agentes/novo e de /agentes/abc devolve Agentes, e rotaEstaAtiva de /agentes em /agentes/abc e verdadeira.
criterio_aceite: O teste de menu passa e o icone agentes existe em Icones.tsx.
depende_de: [T-03.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: menu 13 passed; tsc e lint 0
```

---

```yaml
id: T-05.02
titulo: AbasDoAgente e lista extensivel de abas
objetivo: Componente de abas alimentado por lista propria, so com Configuracoes.
arquivos:
  cria: [src/componentes/abas-do-agente.ts, src/componentes/AbasDoAgente.tsx, tests/abas-do-agente.test.tsx]
  altera: [src/estilos/global.css]
teste_integracao: tests/abas-do-agente.test.tsx renderiza AbasDoAgente com react-dom/server.
teste_funcional: a lista tem uma aba Configuracoes com href /agentes/<id>, a aba ativa leva aria-current page, e acrescentar uma entrada na lista faz aparecer outra aba sem mudar o componente.
criterio_aceite: O teste passa e o global.css nao ganha cor literal (tests/tokens.test.ts verde).
depende_de: [T-05.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: abas 5 passed, tokens ok; tsc e lint 0
```

---

```yaml
id: T-05.03
titulo: SeletorDeModelo
objetivo: Campo de modelo com sugestoes, texto livre e aviso sem chave.
arquivos:
  cria: [src/componentes/SeletorDeModelo.tsx, tests/seletor-de-modelo.test.tsx]
  altera: [src/estilos/global.css]
teste_integracao: tests/seletor-de-modelo.test.tsx renderiza o componente com react-dom/server.
teste_funcional: com modelos ha um datalist com um option por modelo e o campo aceita texto livre, sem chave nao ha datalist e aparece o aviso, o link para Integracoes so aparece quando ehAdmin e verdadeiro, e lista de reserva mostra aviso de lista reduzida.
criterio_aceite: O teste passa e o campo se chama modelo e tem valor inicial.
depende_de: [T-05.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: seletor 6 passed, tokens ok; tsc e lint 0
```

---

```yaml
id: T-05.04
titulo: Formulario de agente e acoes de servidor
objetivo: Formulario com contador de instrucoes, temperatura e mensagem inicial, mais as acoes criar, editar e excluir.
arquivos:
  cria: [src/componentes/FormularioDeAgente.tsx, tests/formulario-de-agente.test.tsx]
  altera: [src/app/acoes.ts, src/estilos/global.css]
teste_integracao: tests/formulario-de-agente.test.tsx renderiza o formulario com react-dom/server.
teste_funcional: o formulario traz nome, instrucoes com contador 0 de 8000, seletor de modelo, temperatura de 0 a 2 com passo 0.1 e mensagem inicial com valores iniciais do agente, e as acoes usam exigirUsuario e o servico de agentes.
criterio_aceite: O teste passa e criarAgente redireciona para /agentes/<id> fora do try/catch.
depende_de: [T-05.03, T-04.02]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.05
titulo: Botao de excluir com confirmacao na tela
objetivo: Excluir agente com bloco de confirmacao, sem window.confirm.
arquivos:
  cria: [src/componentes/BotaoExcluirAgente.tsx]
  altera: [tests/formulario-de-agente.test.tsx]
teste_integracao: tests/formulario-de-agente.test.tsx renderiza e aciona BotaoExcluirAgente.
teste_funcional: o estado inicial mostra so o botao Excluir agente, apos o clique aparecem o nome do agente, Cancelar e Confirmar exclusao, e o codigo-fonte nao contem window.confirm.
criterio_aceite: O teste passa e Cancelar volta ao estado inicial.
depende_de: [T-05.04]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.06
titulo: Paginas /agentes e /agentes/novo
objetivo: Grade de cartoes com estados vazio e carregando, e pagina de novo agente.
arquivos:
  cria: [src/app/(sistema)/agentes/page.tsx, src/app/(sistema)/agentes/loading.tsx, src/app/(sistema)/agentes/novo/page.tsx]
  altera: [src/estilos/global.css, tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts sobe o servidor de producao ja usado e cria agentes pelo servico.
teste_funcional: sem sessao /agentes redireciona para /entrar, usuario comum ve 200 em /agentes com nome, modelo e data do agente criado, sem agentes a pagina traz o estado vazio com o link para /agentes/novo, e /agentes/novo traz o campo modelo com openai/gpt-4o-mini.
criterio_aceite: O teste de rotas passa apos npm run build e cada pagina chama exigirUsuario.
depende_de: [T-05.05]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.07
titulo: Pagina /agentes/[id] com layout de abas
objetivo: Layout compartilhado com nome e abas e a aba Configuracoes com excluir.
arquivos:
  cria: [src/app/(sistema)/agentes/[id]/layout.tsx, src/app/(sistema)/agentes/[id]/page.tsx, src/app/(sistema)/agentes/[id]/loading.tsx]
  altera: [tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts sobe o servidor de producao ja usado e cria um agente pelo servico.
teste_funcional: /agentes/<id> responde 200 com o nome do agente, a aba Configuracoes com aria-current, o formulario com os valores salvos e o botao Excluir agente, e id inexistente responde 404.
criterio_aceite: O teste de rotas passa apos npm run build e a pagina nao contem window.confirm.
depende_de: [T-05.06]
paralelizavel: false
status: pendente
```

