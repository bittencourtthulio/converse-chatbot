---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-06
atualizado_em: 2026-10-01
tasks:
  - id: T-06.01
    titulo: "Itens de menu e guardas de admin"
    fase: F-06.1
    status: concluida
    objetivo: "Acrescentar os itens Privacidade e Auditoria ao grupo Configuracoes e as guardas e loading das duas pastas."
    arquivos:
      cria: ["src/app/(sistema)/configuracoes/privacidade/layout.tsx", "src/app/(sistema)/configuracoes/privacidade/loading.tsx", "src/app/(sistema)/configuracoes/auditoria/layout.tsx", "src/app/(sistema)/configuracoes/auditoria/loading.tsx", "src/app/(sistema)/configuracoes/privacidade/page.tsx", "src/app/(sistema)/configuracoes/auditoria/page.tsx", "docs/privacidade-e-auditoria/sprint-06/sprint.md", "docs/privacidade-e-auditoria/sprint-06/fases.md", "docs/privacidade-e-auditoria/sprint-06/tasks.md"]
      altera: ["src/componentes/itens-de-menu.ts", "tests/menu.test.ts", "tests/rotas.test.ts"]
    teste_integracao: "No servidor de producao /configuracoes/privacidade e /configuracoes/auditoria redirecionam com 307 para o login sem sessao e para o painel com usuario comum."
    teste_funcional: "itensVisiveis para admin inclui Privacidade e Auditoria no grupo Configuracoes, para usuario comum nao inclui e migalhasDaRota devolve Configuracoes e o rotulo."
    criterio_aceite: "tests/menu.test.ts e tests/rotas.test.ts passam com a contagem de itens atualizada."
    depende_de: ["T-05.02", "T-04.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.02
    titulo: "Logica da tela de auditoria: rotulos e detalhes em portugues"
    fase: F-06.2
    status: concluida
    objetivo: "Criar o modulo puro que descreve cada acao e seus detalhes em portugues e valida os filtros da tela."
    arquivos:
      cria: ["src/componentes/auditoria-logica.ts", "tests/auditoria-logica.test.ts"]
      altera: []
    teste_integracao: "Todas as acoes do conjunto fechado tem rotulo e descricao e a validacao dos filtros por zod aceita acao, usuario e periodo e recusa acao desconhecida e periodo invertido."
    teste_funcional: "descreverRegistro de usuario_editado com campos papel devolve a frase Alterou o papel de Maria de usuario para admin sem e-mail ou valor sensivel, e de conversa_apagada devolve a contagem de mensagens."
    criterio_aceite: "tests/auditoria-logica.test.ts passa e nenhuma acao do conjunto fica sem rotulo."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.03
    titulo: "Pagina de auditoria"
    fase: F-06.2
    status: concluida
    objetivo: "Criar a pagina Auditoria com filtros, tabela que vira cartoes, paginacao e estados vazio, carregando e erro."
    arquivos:
      cria: ["src/app/(sistema)/configuracoes/auditoria/page.tsx", "src/componentes/FiltrosDeAuditoria.tsx", "src/componentes/ListaDeAuditoria.tsx", "tests/auditoria-ui.test.tsx", "tests/privacidade-estilos.test.ts"]
      altera: ["src/estilos/global.css", "src/servicos/auditoria.ts", "src/componentes/auditoria-logica.ts", "tests/auditoria-logica.test.ts"]
    teste_integracao: "A pagina renderizada com registros do banco de teste mostra quando, quem, acao e detalhe em portugues, os filtros por searchParams, a paginacao de 25 e o estado vazio, e filtro invalido mostra o erro na tela."
    teste_funcional: "A tabela abaixo de 768 px vira cartoes por CSS com data-rotulo em cada celula, a lista nao tem rolagem lateral a 375 px por regra de CSS e os controles tem alvo de 44 px."
    criterio_aceite: "tests/auditoria-ui.test.tsx e tests/privacidade-estilos.test.ts passam."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.04
    titulo: "Pagina de privacidade: retencao, aviso e dados tratados"
    fase: F-06.3
    status: concluida
    objetivo: "Criar a pagina Privacidade com os formularios de retencao e de aviso padrao e o painel somente leitura de dados pessoais tratados."
    arquivos:
      cria: ["src/app/(sistema)/configuracoes/privacidade/page.tsx", "src/componentes/FormularioDeRetencao.tsx", "src/componentes/FormularioDoAvisoPadrao.tsx", "src/componentes/PainelDeDadosPessoais.tsx", "src/componentes/privacidade-logica.ts", "tests/privacidade-ui.test.tsx", "tests/privacidade-logica.test.ts", "tests/privacidade-acoes.test.ts"]
      altera: ["src/app/acoes.ts", "src/estilos/global.css", "tests/privacidade-estilos.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "As acoes salvarRetencao e salvarAvisoPadrao chamam o servico com a sessao de admin, gravam o registro de auditoria e devolvem erro de validacao em portugues, e a pagina mostra a retencao atual lida do banco."
    teste_funcional: "O painel de dados tem texto fixo com os campos de cada canal, a finalidade de atendimento e a base legal escrita como legitimo interesse, a confirmar pela empresa, com a frase exata da PR-91 e sem a palavra parecer, e escolher sem expurgo exige marcar o aviso de risco."
    criterio_aceite: "tests/privacidade-ui.test.tsx e tests/privacidade-logica.test.ts passam."
    depende_de: ["T-06.03", "T-03.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.05
    titulo: "Ferramentas do titular na tela de privacidade"
    fase: F-06.3
    status: concluida
    objetivo: "Acrescentar a busca por canal e identificador com desambiguacao, o download da exportacao e o apagar com confirmacao na tela."
    arquivos:
      cria: ["src/componentes/FerramentasDoTitular.tsx", "tests/titular-ui.test.tsx", "src/componentes/exportar-titular.ts", "tests/titular-acoes.test.ts"]
      altera: ["src/app/(sistema)/configuracoes/privacidade/page.tsx", "src/app/acoes.ts", "src/componentes/privacidade-logica.ts", "src/estilos/global.css", "tests/privacidade-estilos.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "A acao buscarTitular devolve o estado nenhum, unico ou varios sem nenhum identificador completo e a acao apagarTitular grava a auditoria e devolve as contagens."
    teste_funcional: "Com varios titulares a tela lista prefixo de 10 caracteres e contagens e pede mais caracteres, com um so mostra Exportar em JSON, Exportar em TXT e Apagar tudo, e apagar so habilita depois de digitar a palavra APAGAR."
    criterio_aceite: "tests/titular-ui.test.tsx passa."
    depende_de: ["T-06.04", "T-05.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
---

# Tasks — Sprint 06

---

```yaml
id: T-06.01
titulo: "Itens de menu e guardas de admin"
objetivo: "Acrescentar os itens Privacidade e Auditoria ao grupo Configuracoes e as guardas e loading das duas pastas."
arquivos:
  cria: ["src/app/(sistema)/configuracoes/privacidade/layout.tsx", "src/app/(sistema)/configuracoes/privacidade/loading.tsx", "src/app/(sistema)/configuracoes/auditoria/layout.tsx", "src/app/(sistema)/configuracoes/auditoria/loading.tsx", "src/app/(sistema)/configuracoes/privacidade/page.tsx", "src/app/(sistema)/configuracoes/auditoria/page.tsx", "docs/privacidade-e-auditoria/sprint-06/sprint.md", "docs/privacidade-e-auditoria/sprint-06/fases.md", "docs/privacidade-e-auditoria/sprint-06/tasks.md"]
  altera: ["src/componentes/itens-de-menu.ts", "tests/menu.test.ts", "tests/rotas.test.ts"]
teste_integracao: "No servidor de producao /configuracoes/privacidade e /configuracoes/auditoria redirecionam com 307 para o login sem sessao e para o painel com usuario comum."
teste_funcional: "itensVisiveis para admin inclui Privacidade e Auditoria no grupo Configuracoes, para usuario comum nao inclui e migalhasDaRota devolve Configuracoes e o rotulo."
criterio_aceite: "tests/menu.test.ts e tests/rotas.test.ts passam com a contagem de itens atualizada."
depende_de: ["T-05.02", "T-04.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/rotas.test.ts e tests/menu.test.ts 70 passed contra next start (build antes); suite inteira no fim da sprint
```

---

```yaml
id: T-06.02
titulo: "Logica da tela de auditoria: rotulos e detalhes em portugues"
objetivo: "Criar o modulo puro que descreve cada acao e seus detalhes em portugues e valida os filtros da tela."
arquivos:
  cria: ["src/componentes/auditoria-logica.ts", "tests/auditoria-logica.test.ts"]
  altera: []
teste_integracao: "Todas as acoes do conjunto fechado tem rotulo e descricao e a validacao dos filtros por zod aceita acao, usuario e periodo e recusa acao desconhecida e periodo invertido."
teste_funcional: "descreverRegistro de usuario_editado com campos papel devolve a frase Alterou o papel de Maria de usuario para admin sem e-mail ou valor sensivel, e de conversa_apagada devolve a contagem de mensagens."
criterio_aceite: "tests/auditoria-logica.test.ts passa e nenhuma acao do conjunto fica sem rotulo."
depende_de: ["T-06.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/auditoria-logica.test.ts 13 passed; so arquivos novos
```

---

```yaml
id: T-06.03
titulo: "Pagina de auditoria"
objetivo: "Criar a pagina Auditoria com filtros, tabela que vira cartoes, paginacao e estados vazio, carregando e erro."
arquivos:
  cria: ["src/app/(sistema)/configuracoes/auditoria/page.tsx", "src/componentes/FiltrosDeAuditoria.tsx", "src/componentes/ListaDeAuditoria.tsx", "tests/auditoria-ui.test.tsx", "tests/privacidade-estilos.test.ts"]
  altera: ["src/estilos/global.css", "src/servicos/auditoria.ts", "src/componentes/auditoria-logica.ts", "tests/auditoria-logica.test.ts"]
teste_integracao: "A pagina renderizada com registros do banco de teste mostra quando, quem, acao e detalhe em portugues, os filtros por searchParams, a paginacao de 25 e o estado vazio, e filtro invalido mostra o erro na tela."
teste_funcional: "A tabela abaixo de 768 px vira cartoes por CSS com data-rotulo em cada celula, a lista nao tem rolagem lateral a 375 px por regra de CSS e os controles tem alvo de 44 px."
criterio_aceite: "tests/auditoria-ui.test.tsx e tests/privacidade-estilos.test.ts passam."
depende_de: ["T-06.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/auditoria-ui.test.tsx 14 passed contra next start (build antes), auditoria-logica 17, privacidade-estilos 4, auditoria 11, somente-acrescimo 7, projeto e tokens; suite inteira no fim da sprint
```

---

```yaml
id: T-06.04
titulo: "Pagina de privacidade: retencao, aviso e dados tratados"
objetivo: "Criar a pagina Privacidade com os formularios de retencao e de aviso padrao e o painel somente leitura de dados pessoais tratados."
arquivos:
  cria: ["src/app/(sistema)/configuracoes/privacidade/page.tsx", "src/componentes/FormularioDeRetencao.tsx", "src/componentes/FormularioDoAvisoPadrao.tsx", "src/componentes/PainelDeDadosPessoais.tsx", "src/componentes/privacidade-logica.ts", "tests/privacidade-ui.test.tsx", "tests/privacidade-logica.test.ts", "tests/privacidade-acoes.test.ts"]
  altera: ["src/app/acoes.ts", "src/estilos/global.css", "tests/privacidade-estilos.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "As acoes salvarRetencao e salvarAvisoPadrao chamam o servico com a sessao de admin, gravam o registro de auditoria e devolvem erro de validacao em portugues, e a pagina mostra a retencao atual lida do banco."
teste_funcional: "O painel de dados tem texto fixo com os campos de cada canal, a finalidade de atendimento e a base legal escrita como legitimo interesse, a confirmar pela empresa, com a frase exata da PR-91 e sem a palavra parecer, e escolher sem expurgo exige marcar o aviso de risco."
criterio_aceite: "tests/privacidade-ui.test.tsx e tests/privacidade-logica.test.ts passam."
depende_de: ["T-06.03", "T-03.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — privacidade-logica 8, privacidade-acoes 6, privacidade-ui 8 contra next start (build antes), estilos, tokens, projeto 150; suite inteira no fim da sprint
```

---

```yaml
id: T-06.05
titulo: "Ferramentas do titular na tela de privacidade"
objetivo: "Acrescentar a busca por canal e identificador com desambiguacao, o download da exportacao e o apagar com confirmacao na tela."
arquivos:
  cria: ["src/componentes/FerramentasDoTitular.tsx", "tests/titular-ui.test.tsx", "src/componentes/exportar-titular.ts", "tests/titular-acoes.test.ts"]
  altera: ["src/app/(sistema)/configuracoes/privacidade/page.tsx", "src/app/acoes.ts", "src/componentes/privacidade-logica.ts", "src/estilos/global.css", "tests/privacidade-estilos.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "A acao buscarTitular devolve o estado nenhum, unico ou varios sem nenhum identificador completo e a acao apagarTitular grava a auditoria e devolve as contagens."
teste_funcional: "Com varios titulares a tela lista prefixo de 10 caracteres e contagens e pede mais caracteres, com um so mostra Exportar em JSON, Exportar em TXT e Apagar tudo, e apagar so habilita depois de digitar a palavra APAGAR."
criterio_aceite: "tests/titular-ui.test.tsx passa."
depende_de: ["T-06.04", "T-05.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2505 testes, 2504 passed na rodada e o 1 de tests/chat-de-teste.test.tsx corrigido e reexecutado (25 passed); lint e build antes
```

