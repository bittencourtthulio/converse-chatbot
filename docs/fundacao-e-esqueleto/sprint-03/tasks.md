---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
sprint_id: sprint-03
atualizado_em: 2026-09-30
sprint:
  titulo: "Base visual: tokens, componentes de estilo, menu e casca do sistema"
  status: nao_iniciado
  criterio_saida: "npm test, npm run lint, npx tsc --noEmit e npm run build terminam com 0 falhas, e o teste de tokens prova contraste 4,5:1 nos dois temas e nenhuma cor literal fora de tokens.css."
  riscos: ["o teste de rotas afirma texto da interface; a nova casca precisa preservar Painel, Meu perfil e o link de Usuarios (base/interface-atual.md)", "script de tema antes da pintura precisa cobrir escolha salva e preferencia do sistema (D-03)"]
  fora_de_escopo: ["redesenho das telas de conteudo - sprint 04"]
fases:
  - id: F-03.1
    titulo: "Base visual"
    status: nao_iniciado
    criterio_saida: "o teste de tokens, o de menu e o de rotas passam e o build gera as rotas"
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03, T-03.04]
tasks:
  - id: T-03.01
    titulo: "Tokens semanticos e CSS de componentes"
    fase: F-03.1
    status: concluida
    objetivo: "Escrever tokens claro e escuro (indigo, slate, raios, sombras, fonte de sistema) e as classes de componente."
    arquivos:
      cria: ["tests/tokens.test.ts"]
      altera: ["src/estilos/tokens.css", "src/estilos/global.css"]
    teste_integracao: "tests/tokens.test.ts le tokens.css e global.css reais, calcula a razao de contraste dos pares texto e fundo em cada tema e varre src e global.css em busca de cor literal."
    teste_funcional: "Cada par declarado (texto sobre fundo, muted sobre fundo, texto do botao sobre destaque, cada estado sobre seu fundo) tem razao maior ou igual a 4,5 no tema claro e no escuro, e nenhum arquivo de src nem global.css contem cor hexadecimal, rgb ou hsl."
    criterio_aceite: "O teste de tokens passa com os dois temas e a media query de prefers-color-scheme presentes."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.02
    titulo: "Icones e itens de menu em arquivo unico"
    fase: F-03.1
    status: concluida
    objetivo: "Definir a lista unica de itens de menu, o filtro por papel e o caminho de titulo por rota, com icones SVG inline."
    arquivos:
      cria: ["src/componentes/itens-de-menu.ts", "src/componentes/Icones.tsx", "tests/menu.test.ts"]
      altera: []
    teste_integracao: "tests/menu.test.ts importa itens-de-menu.ts e usa renderToStaticMarkup em Icones.tsx."
    teste_funcional: "itensVisiveis(false) nao contem Usuarios e itensVisiveis(true) contem; rotas sao unicas e comecam com barra; tituloDaRota devolve Configuracoes e Usuarios para /configuracoes/usuarios; todo icone declarado renderiza um svg com aria-hidden."
    criterio_aceite: "O teste de menu passa e acrescentar um item exige editar apenas itens-de-menu.ts."
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.03
    titulo: "Casca SaaS do sistema"
    fase: F-03.1
    status: concluida
    objetivo: "Montar barra lateral com logotipo, cabecalho, menu do usuario, gaveta abaixo de 768px e alternador de tema."
    arquivos:
      cria: ["src/componentes/CascaDoSistema.tsx", "src/componentes/BarraLateral.tsx", "src/componentes/Cabecalho.tsx", "src/componentes/MenuDoUsuario.tsx", "src/componentes/Logotipo.tsx"]
      altera: ["src/componentes/AlternadorDeTema.tsx", "src/app/(sistema)/layout.tsx", "tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts pede / ao servidor de producao com sessao de admin e de usuario comum e le o HTML."
    teste_funcional: "O HTML de admin traz o nome Converse no logotipo, o link /configuracoes/usuarios, as iniciais e o nome do usuario, um botao Abrir menu e um formulario de sair; o de usuario comum nao traz o link de Usuarios."
    criterio_aceite: "O teste de rotas atualizado passa e src/componentes/Navegacao.tsx deixa de existir."
    depende_de: [T-03.02, T-02.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.04
    titulo: "Layout raiz com titulo do produto e tema sem flash"
    fase: F-03.1
    status: concluida
    objetivo: "Usar APP_NAME no titulo e resolver o tema antes da primeira pintura."
    arquivos:
      cria: []
      altera: ["src/app/layout.tsx", "tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts le o HTML de /entrar do servidor de producao."
    teste_funcional: "O title contem Converse, o script inline do head le a chave tema e cai em prefers-color-scheme, e o html declara lang pt-BR."
    criterio_aceite: "O teste passa e o layout nao contem o texto Gerado pelo buildx."
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Plano — Sprint 03 — Base visual: tokens, componentes de estilo, menu e casca do sistema

## Objetivo da sprint

Substitui a casca de IDE pela casca SaaS: tokens semanticos nos dois temas, classes de componente, itens de menu em um so arquivo, barra lateral, cabecalho, menu do usuario, gaveta e alternador de tema sem flash.

## Critério de saída da sprint

npm test, npm run lint, npx tsc --noEmit e npm run build terminam com 0 falhas, e o teste de tokens prova contraste 4,5:1 nos dois temas e nenhuma cor literal fora de tokens.css.

## Riscos conhecidos

- o teste de rotas afirma texto da interface; a nova casca precisa preservar Painel, Meu perfil e o link de Usuarios (base/interface-atual.md)
- script de tema antes da pintura precisa cobrir escolha salva e preferencia do sistema (D-03)

## Fora de escopo

- redesenho das telas de conteudo - sprint 04

## Fase F-03.1 — Base visual

**Objetivo:** Tokens, CSS, menu, casca e tema.

**Tasks:** T-03.01, T-03.02, T-03.03, T-03.04

**Critério de saída:** o teste de tokens, o de menu e o de rotas passam e o build gera as rotas

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-03 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_03_1["F-03.1 Base visual"]
    T_03_01["T-03.01<br/>Tokens semanticos e CSS de c"]
    T_03_02["T-03.02<br/>Icones e itens de menu em ar"]
    T_03_03["T-03.03<br/>Casca SaaS do sistema"]
    T_03_04["T-03.04<br/>Layout raiz com titulo do pr"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_03
  T_03_03 --> T_03_04
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 concluida
```

## Tasks

---

```yaml
id: T-03.01
titulo: Tokens semanticos e CSS de componentes
objetivo: Escrever tokens claro e escuro (indigo, slate, raios, sombras, fonte de sistema) e as classes de componente.
arquivos:
  cria: [tests/tokens.test.ts]
  altera: [src/estilos/tokens.css, src/estilos/global.css]
teste_integracao: tests/tokens.test.ts le tokens.css e global.css reais, calcula a razao de contraste dos pares texto e fundo em cada tema e varre src e global.css em busca de cor literal.
teste_funcional: Cada par declarado (texto sobre fundo, muted sobre fundo, texto do botao sobre destaque, cada estado sobre seu fundo) tem razao maior ou igual a 4,5 no tema claro e no escuro, e nenhum arquivo de src nem global.css contem cor hexadecimal, rgb ou hsl.
criterio_aceite: O teste de tokens passa com os dois temas e a media query de prefers-color-scheme presentes.
depende_de: []
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: tokens.test 50 passed
```

---

```yaml
id: T-03.02
titulo: Icones e itens de menu em arquivo unico
objetivo: Definir a lista unica de itens de menu, o filtro por papel e o caminho de titulo por rota, com icones SVG inline.
arquivos:
  cria: [src/componentes/itens-de-menu.ts, src/componentes/Icones.tsx, tests/menu.test.ts]
  altera: []
teste_integracao: tests/menu.test.ts importa itens-de-menu.ts e usa renderToStaticMarkup em Icones.tsx.
teste_funcional: itensVisiveis(false) nao contem Usuarios e itensVisiveis(true) contem; rotas sao unicas e comecam com barra; tituloDaRota devolve Configuracoes e Usuarios para /configuracoes/usuarios; todo icone declarado renderiza um svg com aria-hidden.
criterio_aceite: O teste de menu passa e acrescentar um item exige editar apenas itens-de-menu.ts.
depende_de: [T-03.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: menu.test 9 passed
```

---

```yaml
id: T-03.03
titulo: Casca SaaS do sistema
objetivo: Montar barra lateral com logotipo, cabecalho, menu do usuario, gaveta abaixo de 768px e alternador de tema.
arquivos:
  cria: [src/componentes/CascaDoSistema.tsx, src/componentes/BarraLateral.tsx, src/componentes/Cabecalho.tsx, src/componentes/MenuDoUsuario.tsx, src/componentes/Logotipo.tsx]
  altera: [src/componentes/AlternadorDeTema.tsx, src/app/(sistema)/layout.tsx, tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts pede / ao servidor de producao com sessao de admin e de usuario comum e le o HTML.
teste_funcional: O HTML de admin traz o nome Converse no logotipo, o link /configuracoes/usuarios, as iniciais e o nome do usuario, um botao Abrir menu e um formulario de sair; o de usuario comum nao traz o link de Usuarios.
criterio_aceite: O teste de rotas atualizado passa e src/componentes/Navegacao.tsx deixa de existir.
depende_de: [T-03.02, T-02.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: rotas 19 + iniciais 2 passed; tsc e lint ok
```

---

```yaml
id: T-03.04
titulo: Layout raiz com titulo do produto e tema sem flash
objetivo: Usar APP_NAME no titulo e resolver o tema antes da primeira pintura.
arquivos:
  cria: []
  altera: [src/app/layout.tsx, tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts le o HTML de /entrar do servidor de producao.
teste_funcional: O title contem Converse, o script inline do head le a chave tema e cai em prefers-color-scheme, e o html declara lang pt-BR.
criterio_aceite: O teste passa e o layout nao contem o texto Gerado pelo buildx.
depende_de: [T-03.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: rotas 21 passed
```

