---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
sprint_id: sprint-04
atualizado_em: 2026-09-30
sprint:
  titulo: "Telas: componentes de pagina, login, painel e configuracoes"
  status: concluido
  criterio_saida: "npm test, npm run lint, npx tsc --noEmit e npm run build terminam com 0 falhas e a verificacao visual esta registrada ou declarada nao realizada."
  riscos: ["a tabela de usuarios tem acoes por linha que precisam continuar acessiveis a 375px (base/interface-atual.md)", "ferramenta de navegador pode estar indisponivel: registrar limitacao (D-18)"]
  fora_de_escopo: ["conteudo real do painel - FT-02 a FT-09"]
fases:
  - id: F-04.1
    titulo: "Telas"
    status: concluido
    criterio_saida: "teste de componentes e de rotas passam e o build gera as rotas"
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02, T-04.03, T-04.04]
tasks:
  - id: T-04.01
    titulo: "Componentes de pagina e estados"
    fase: F-04.1
    status: concluida
    objetivo: "Criar CabecalhoDaPagina, EstadoVazio, Esqueleto, Badge e Alerta e os arquivos loading e error do sistema."
    arquivos:
      cria: ["src/componentes/CabecalhoDaPagina.tsx", "src/componentes/EstadoVazio.tsx", "src/componentes/Esqueleto.tsx", "src/componentes/Badge.tsx", "src/componentes/Alerta.tsx", "src/app/(sistema)/configuracoes/usuarios/loading.tsx", "src/app/(sistema)/error.tsx", "tests/componentes.test.tsx"]
      altera: ["vitest.config.ts"]
    teste_integracao: "tests/componentes.test.tsx renderiza os componentes com renderToStaticMarkup, com o Vitest incluindo arquivos tsx."
    teste_funcional: "EstadoVazio com titulo e descricao rende o texto e role status, Alerta de erro rende role alert, Esqueleto rende aria-busy, Badge rende o texto com a variante, CabecalhoDaPagina rende h1 e subtitulo."
    criterio_aceite: "O teste de componentes passa e error.tsx nao exibe a mensagem tecnica do erro."
    depende_de: [T-03.04]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.02
    titulo: "Tela de login em cartao"
    fase: F-04.1
    status: concluida
    objetivo: "Refazer o login como cartao centralizado com o nome do produto e erro claro."
    arquivos:
      cria: ["src/componentes/FormularioDeLogin.tsx", "src/app/(sistema)/configuracoes/usuarios/layout.tsx"]
      altera: ["src/app/entrar/page.tsx", "src/componentes/Formulario.tsx", "tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts le o HTML de /entrar do servidor de producao."
    teste_funcional: "O HTML traz o nome Converse, os campos e-mail e senha com rotulo, o botao Entrar e nenhum estilo inline de cor."
    criterio_aceite: "O teste de rotas passa e a acao de login mostra a mensagem de excesso de tentativas quando o servico lanca 429."
    depende_de: [T-04.01, T-02.04]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.03
    titulo: "Painel, usuarios, perfil e troca de senha"
    fase: F-04.1
    status: concluida
    objetivo: "Aplicar cabecalho de pagina, cartoes, tabela com badges e estado vazio as telas do P-9."
    arquivos:
      cria: []
      altera: ["src/app/(sistema)/page.tsx", "src/app/(sistema)/configuracoes/usuarios/page.tsx", "src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx", "src/app/(sistema)/perfil/page.tsx", "src/app/(sistema)/perfil/senha/page.tsx", "tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts pede cada rota do sistema ao servidor de producao com sessao."
    teste_funcional: "O painel traz Painel, um subtitulo proprio e Ainda nao ha o que mostrar; usuarios traz a tabela com e-mails e badges de papel e situacao; perfil traz Meu perfil; troca traz Trocar senha."
    criterio_aceite: "O teste de rotas atualizado passa e nenhuma tela de src/app tem cor literal."
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.04
    titulo: "Verificacao visual nos dois temas e em 375px"
    fase: F-04.1
    status: concluida
    objetivo: "Abrir o app e conferir login e painel claro, escuro e a 375px."
    arquivos:
      cria: ["docs/fundacao-e-esqueleto/VERIFICACAO-VISUAL.md"]
      altera: []
    teste_integracao: "O servidor de producao sobe com segredos inline e /entrar e / respondem 200 ao navegador da sessao."
    teste_funcional: "Capturas de login e painel nos temas claro e escuro e a 375px, com a gaveta aberta e fechada, sem sobreposicao nem rolagem horizontal, ou registro explicito de que a ferramenta de navegador nao esta disponivel."
    criterio_aceite: "O arquivo de verificacao existe com o resultado de cada captura ou com a limitacao declarada."
    depende_de: [T-04.02, T-04.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Plano — Sprint 04 — Telas: componentes de pagina, login, painel e configuracoes

## Objetivo da sprint

Aplica a base visual as telas: componentes de pagina, estados vazio, carregando e erro, login em cartao, painel com estado vazio, usuarios, perfil e troca de senha.

## Critério de saída da sprint

npm test, npm run lint, npx tsc --noEmit e npm run build terminam com 0 falhas e a verificacao visual esta registrada ou declarada nao realizada.

## Riscos conhecidos

- a tabela de usuarios tem acoes por linha que precisam continuar acessiveis a 375px (base/interface-atual.md)
- ferramenta de navegador pode estar indisponivel: registrar limitacao (D-18)

## Fora de escopo

- conteudo real do painel - FT-02 a FT-09

## Fase F-04.1 — Telas

**Objetivo:** Componentes de pagina e as cinco telas.

**Tasks:** T-04.01, T-04.02, T-04.03, T-04.04

**Critério de saída:** teste de componentes e de rotas passam e o build gera as rotas

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-04 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_04_1["F-04.1 Telas"]
    T_04_01["T-04.01<br/>Componentes de pagina e esta"]
    T_04_02["T-04.02<br/>Tela de login em cartao"]
    T_04_03["T-04.03<br/>Painel, usuarios, perfil e t"]
    T_04_04["T-04.04<br/>Verificacao visual nos dois "]
  end
  T_04_01 --> T_04_02
  T_04_01 --> T_04_03
  T_04_02 --> T_04_04
  T_04_03 --> T_04_04
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_04_01 concluida
  class T_04_02 concluida
  class T_04_03 concluida
  class T_04_04 concluida
```

## Tasks

---

```yaml
id: T-04.01
titulo: Componentes de pagina e estados
objetivo: Criar CabecalhoDaPagina, EstadoVazio, Esqueleto, Badge e Alerta e os arquivos loading e error do sistema.
arquivos:
  cria: [src/componentes/CabecalhoDaPagina.tsx, src/componentes/EstadoVazio.tsx, src/componentes/Esqueleto.tsx, src/componentes/Badge.tsx, src/componentes/Alerta.tsx, src/app/(sistema)/configuracoes/usuarios/loading.tsx, src/app/(sistema)/error.tsx, tests/componentes.test.tsx]
  altera: [vitest.config.ts]
teste_integracao: tests/componentes.test.tsx renderiza os componentes com renderToStaticMarkup, com o Vitest incluindo arquivos tsx.
teste_funcional: EstadoVazio com titulo e descricao rende o texto e role status, Alerta de erro rende role alert, Esqueleto rende aria-busy, Badge rende o texto com a variante, CabecalhoDaPagina rende h1 e subtitulo.
criterio_aceite: O teste de componentes passa e error.tsx nao exibe a mensagem tecnica do erro.
depende_de: [T-03.04]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: componentes.test 8 passed
```

---

```yaml
id: T-04.02
titulo: Tela de login em cartao
objetivo: Refazer o login como cartao centralizado com o nome do produto e erro claro.
arquivos:
  cria: [src/componentes/FormularioDeLogin.tsx, src/app/(sistema)/configuracoes/usuarios/layout.tsx]
  altera: [src/app/entrar/page.tsx, src/componentes/Formulario.tsx, tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts le o HTML de /entrar do servidor de producao.
teste_funcional: O HTML traz o nome Converse, os campos e-mail e senha com rotulo, o botao Entrar e nenhum estilo inline de cor.
criterio_aceite: O teste de rotas passa e a acao de login mostra a mensagem de excesso de tentativas quando o servico lanca 429.
depende_de: [T-04.01, T-02.04]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: rotas 22 + componentes 8 passed
```

---

```yaml
id: T-04.03
titulo: Painel, usuarios, perfil e troca de senha
objetivo: Aplicar cabecalho de pagina, cartoes, tabela com badges e estado vazio as telas do P-9.
arquivos:
  cria: []
  altera: [src/app/(sistema)/page.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx, src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx, src/app/(sistema)/perfil/page.tsx, src/app/(sistema)/perfil/senha/page.tsx, tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts pede cada rota do sistema ao servidor de producao com sessao.
teste_funcional: O painel traz Painel, um subtitulo proprio e Ainda nao ha o que mostrar; usuarios traz a tabela com e-mails e badges de papel e situacao; perfil traz Meu perfil; troca traz Trocar senha.
criterio_aceite: O teste de rotas atualizado passa e nenhuma tela de src/app tem cor literal.
depende_de: [T-04.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: rotas 23 passed; suite 180 passed
```

---

```yaml
id: T-04.04
titulo: Verificacao visual nos dois temas e em 375px
objetivo: Abrir o app e conferir login e painel claro, escuro e a 375px.
arquivos:
  cria: [docs/fundacao-e-esqueleto/VERIFICACAO-VISUAL.md]
  altera: []
teste_integracao: O servidor de producao sobe com segredos inline e /entrar e / respondem 200 ao navegador da sessao.
teste_funcional: Capturas de login e painel nos temas claro e escuro e a 375px, com a gaveta aberta e fechada, sem sobreposicao nem rolagem horizontal, ou registro explicito de que a ferramenta de navegador nao esta disponivel.
criterio_aceite: O arquivo de verificacao existe com o resultado de cada captura ou com a limitacao declarada.
depende_de: [T-04.02, T-04.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: servidor de pe, /entrar e / 200; capturas em VERIFICACAO-VISUAL.md; suite 180 passed
```

