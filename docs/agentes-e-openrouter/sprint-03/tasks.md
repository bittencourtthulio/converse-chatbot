---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
sprint_id: sprint-03
atualizado_em: 2026-09-30
sprint:
  titulo: "Chave do workspace e tela Configuracoes > Integracoes"
  status: pendente
  criterio_saida: "tests/integracoes.test.ts, tests/integracoes-conexao.test.ts, tests/menu.test.ts, tests/componentes.test.tsx e tests/rotas.test.ts passam; a chave em claro e o texto cifrado nunca aparecem na pagina."
  riscos: ["console.error da acao imprime o erro inteiro: o erro nao pode carregar a chave (base/ambiente-e-segredos.md)", "o teste de rotas exige build previo"]
  fora_de_escopo: ["auditoria da troca de chave - FT-10", "token do Telegram - FT-07"]
fases:
  - id: F-03.1
    titulo: "Chave e tela"
    status: pendente
    criterio_saida: "admin grava, testa e remove a chave por tela, vendo so a mascara"
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03, T-03.04, T-03.05]
tasks:
  - id: T-03.01
    titulo: "Modelo ConfiguracaoDoWorkspace e servico de integracoes"
    fase: F-03.1
    status: concluida
    objetivo: "Gravar a chave cifrada em tabela singleton e expor so o estado mascarado."
    arquivos:
      cria: ["prisma/migrations/20260930145651_configuracao_do_workspace/migration.sql", "src/servicos/integracoes.ts", "tests/integracoes.test.ts"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
    teste_integracao: "tests/integracoes.test.ts usa o banco de teste migrado e o servico com a cripto real."
    teste_funcional: "salvarChaveDoOpenrouter grava texto que nao contem a chave, estadoDoOpenrouter devolve configurada, mascara e atualizadoEm sem chave nem texto cifrado, remover volta a nao configurada, usuario comum recebe 403, entrada vazia ou curta recebe 422, e ha uma linha so na tabela apos duas gravacoes."
    criterio_aceite: "O teste passa e a migration so contem CREATE TABLE."
    depende_de: [T-01.01, T-01.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.02
    titulo: "Teste de conexao e leitura interna da chave"
    fase: F-03.1
    status: concluida
    objetivo: "Testar a conexao com a chave gravada e oferecer a chave decifrada a outros servicos."
    arquivos:
      cria: []
      altera: ["src/servicos/integracoes.ts", "tests/integracoes-conexao.test.ts"]
    teste_integracao: "tests/integracoes-conexao.test.ts usa o servidor simulado e o banco de teste."
    teste_funcional: "testarConexaoDoOpenrouter devolve sucesso com chave valida, lanca provedor_chave_invalida no 401, informa que nao ha chave quando nao configurada, e obterChaveDoOpenrouter devolve a chave original ou null; chave gravada com outra ENCRYPTION_KEY resulta em erro claro sem derrubar estadoDoOpenrouter, e espioes de console.error e console.log nao recebem a chave em nenhuma chamada."
    criterio_aceite: "O teste passa e nenhuma mensagem de erro contem a chave."
    depende_de: [T-03.01, T-02.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.03
    titulo: "Item Integracoes no menu"
    fase: F-03.1
    status: concluida
    objetivo: "Acrescentar o item Integracoes (somente admin) ao grupo Configuracoes."
    arquivos:
      cria: []
      altera: ["src/componentes/itens-de-menu.ts", "src/componentes/Icones.tsx", "tests/menu.test.ts"]
    teste_integracao: "tests/menu.test.ts le GRUPOS_DE_MENU e gruposVisiveis."
    teste_funcional: "admin ve Integracoes em /configuracoes/integracoes, usuario comum nao ve, e migalhasDaRota devolve Configuracoes e Integracoes."
    criterio_aceite: "O teste de menu passa e o icone novo existe em Icones.tsx."
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.04
    titulo: "Tela Integracoes"
    fase: F-03.1
    status: concluida
    objetivo: "Formulario de chave, estado, testar conexao e remover."
    arquivos:
      cria: ["src/app/(sistema)/configuracoes/integracoes/layout.tsx", "src/app/(sistema)/configuracoes/integracoes/loading.tsx", "src/app/(sistema)/configuracoes/integracoes/page.tsx", "src/componentes/PainelDaChaveOpenrouter.tsx"]
      altera: ["src/app/acoes.ts", "tests/componentes.test.tsx", "src/estilos/global.css"]
    teste_integracao: "tests/componentes.test.tsx renderiza PainelDaChaveOpenrouter com react-dom/server nos estados nao configurada e configurada."
    teste_funcional: "o campo de chave e do tipo password e vazio, o estado configurada mostra a mascara e os botoes Testar conexao e Remover chave, o estado nao configurada mostra o aviso, e o HTML nao contem nenhum valor de chave."
    criterio_aceite: "O teste passa e as acoes salvar, testar e remover chamam apenas o servico de integracoes."
    depende_de: [T-03.02, T-03.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-03.05
    titulo: "Rotas de Integracoes no servidor de producao"
    fase: F-03.1
    status: concluida
    objetivo: "Provar guarda de admin e ausencia da chave na resposta."
    arquivos:
      cria: []
      altera: ["tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts sobe o servidor de producao ja usado e grava a chave pelo servico."
    teste_funcional: "usuario comum recebe 307 para / em /configuracoes/integracoes, admin recebe 200 com a mascara e a resposta nao contem a chave em claro nem o texto cifrado, e sem sessao o destino e /entrar."
    criterio_aceite: "O teste de rotas passa apos npm run build."
    depende_de: [T-03.04]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Plano — Sprint 03 — Chave do workspace e tela Configuracoes > Integracoes

## Critério de saída da sprint

tests/integracoes.test.ts, tests/integracoes-conexao.test.ts, tests/menu.test.ts, tests/componentes.test.tsx e tests/rotas.test.ts passam; a chave em claro e o texto cifrado nunca aparecem na pagina.

## Riscos conhecidos

- console.error da acao imprime o erro inteiro: o erro nao pode carregar a chave (base/ambiente-e-segredos.md)
- o teste de rotas exige build previo

## Fora de escopo

- auditoria da troca de chave - FT-10
- token do Telegram - FT-07

## Fase F-03.1 — Chave e tela

**Tasks:** T-03.01, T-03.02, T-03.03, T-03.04, T-03.05

**Critério de saída:** admin grava, testa e remove a chave por tela, vendo so a mascara

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-03 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_03_1["F-03.1 Chave e tela"]
    T_03_01["T-03.01<br/>Modelo ConfiguracaoDoWorkspa"]
    T_03_02["T-03.02<br/>Teste de conexao e leitura i"]
    T_03_03["T-03.03<br/>Item Integracoes no menu"]
    T_03_04["T-03.04<br/>Tela Integracoes"]
    T_03_05["T-03.05<br/>Rotas de Integracoes no serv"]
  end
  T_03_01 --> T_03_02
  T_03_02 --> T_03_04
  T_03_03 --> T_03_04
  T_03_04 --> T_03_05
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_03_01 concluida
  class T_03_02 concluida
  class T_03_03 concluida
  class T_03_04 concluida
  class T_03_05 concluida
```

## Tasks

---

```yaml
id: T-03.01
titulo: Modelo ConfiguracaoDoWorkspace e servico de integracoes
objetivo: Gravar a chave cifrada em tabela singleton e expor so o estado mascarado.
arquivos:
  cria: [prisma/migrations/20260930145651_configuracao_do_workspace/migration.sql, src/servicos/integracoes.ts, tests/integracoes.test.ts]
  altera: [prisma/schema.prisma, tests/ajuda.ts]
teste_integracao: tests/integracoes.test.ts usa o banco de teste migrado e o servico com a cripto real.
teste_funcional: salvarChaveDoOpenrouter grava texto que nao contem a chave, estadoDoOpenrouter devolve configurada, mascara e atualizadoEm sem chave nem texto cifrado, remover volta a nao configurada, usuario comum recebe 403, entrada vazia ou curta recebe 422, e ha uma linha so na tabela apos duas gravacoes.
criterio_aceite: O teste passa e a migration so contem CREATE TABLE.
depende_de: [T-01.01, T-01.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: integracoes 18 passed, migracoes 8 passed; tsc e lint 0
```

---

```yaml
id: T-03.02
titulo: Teste de conexao e leitura interna da chave
objetivo: Testar a conexao com a chave gravada e oferecer a chave decifrada a outros servicos.
arquivos:
  cria: []
  altera: [src/servicos/integracoes.ts, tests/integracoes-conexao.test.ts]
teste_integracao: tests/integracoes-conexao.test.ts usa o servidor simulado e o banco de teste.
teste_funcional: testarConexaoDoOpenrouter devolve sucesso com chave valida, lanca provedor_chave_invalida no 401, informa que nao ha chave quando nao configurada, e obterChaveDoOpenrouter devolve a chave original ou null; chave gravada com outra ENCRYPTION_KEY resulta em erro claro sem derrubar estadoDoOpenrouter, e espioes de console.error e console.log nao recebem a chave em nenhuma chamada.
criterio_aceite: O teste passa e nenhuma mensagem de erro contem a chave.
depende_de: [T-03.01, T-02.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: integracoes-conexao 7 e integracoes 18 passed; tsc e lint 0
```

---

```yaml
id: T-03.03
titulo: Item Integracoes no menu
objetivo: Acrescentar o item Integracoes (somente admin) ao grupo Configuracoes.
arquivos:
  cria: []
  altera: [src/componentes/itens-de-menu.ts, src/componentes/Icones.tsx, tests/menu.test.ts]
teste_integracao: tests/menu.test.ts le GRUPOS_DE_MENU e gruposVisiveis.
teste_funcional: admin ve Integracoes em /configuracoes/integracoes, usuario comum nao ve, e migalhasDaRota devolve Configuracoes e Integracoes.
criterio_aceite: O teste de menu passa e o icone novo existe em Icones.tsx.
depende_de: [T-01.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: menu 10 passed; tsc e lint 0
```

---

```yaml
id: T-03.04
titulo: Tela Integracoes
objetivo: Formulario de chave, estado, testar conexao e remover.
arquivos:
  cria: [src/app/(sistema)/configuracoes/integracoes/layout.tsx, src/app/(sistema)/configuracoes/integracoes/loading.tsx, src/app/(sistema)/configuracoes/integracoes/page.tsx, src/componentes/PainelDaChaveOpenrouter.tsx]
  altera: [src/app/acoes.ts, tests/componentes.test.tsx, src/estilos/global.css]
teste_integracao: tests/componentes.test.tsx renderiza PainelDaChaveOpenrouter com react-dom/server nos estados nao configurada e configurada.
teste_funcional: o campo de chave e do tipo password e vazio, o estado configurada mostra a mascara e os botoes Testar conexao e Remover chave, o estado nao configurada mostra o aviso, e o HTML nao contem nenhum valor de chave.
criterio_aceite: O teste passa e as acoes salvar, testar e remover chamam apenas o servico de integracoes.
depende_de: [T-03.02, T-03.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: componentes 62 passed com tokens; tsc e lint 0
```

---

```yaml
id: T-03.05
titulo: Rotas de Integracoes no servidor de producao
objetivo: Provar guarda de admin e ausencia da chave na resposta.
arquivos:
  cria: []
  altera: [tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts sobe o servidor de producao ja usado e grava a chave pelo servico.
teste_funcional: usuario comum recebe 307 para / em /configuracoes/integracoes, admin recebe 200 com a mascara e a resposta nao contem a chave em claro nem o texto cifrado, e sem sessao o destino e /entrar.
criterio_aceite: O teste de rotas passa apos npm run build.
depende_de: [T-03.04]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: rotas 27 passed após build
```

