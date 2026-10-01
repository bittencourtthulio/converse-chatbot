---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-07
atualizado_em: 2026-10-01
tasks:
  - id: T-07.01
    titulo: "Prova no servidor de producao: ouvintes e DELETE publico"
    fase: F-07.1
    status: concluida
    objetivo: "Provar contra next start que apagar conversa pelo painel e o DELETE do visitante gravam auditoria pelos ouvintes ligados na subida."
    arquivos:
      cria: ["tests/privacidade-fim-a-fim.test.ts", "docs/privacidade-e-auditoria/sprint-07/sprint.md", "docs/privacidade-e-auditoria/sprint-07/fases.md", "docs/privacidade-e-auditoria/sprint-07/tasks.md"]
      altera: []
    teste_integracao: "Contra o servidor de producao em porta livre, DELETE /api/conversas/[id] com sessao de admin e DELETE publico do visitante gravam conversa_apagada no banco compartilhado, o que prova os ouvintes ligados pela instrumentacao."
    teste_funcional: "Apagar uma conversa pelo painel e pelo visitante grava exatamente um conversa_apagada por conversa no banco compartilhado, com rotulo do admin ou Visitante (chat embutido), e a listagem da auditoria no servidor de producao as devolve."
    criterio_aceite: "tests/privacidade-fim-a-fim.test.ts passa sem variavel de ambiente nova."
    depende_de: ["T-06.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-07.02
    titulo: "Roteiro de dados semeados e verificacao no navegador"
    fase: F-07.2
    status: concluida
    objetivo: "Criar o script de dados para a verificacao e registrar a verificacao no navegador."
    arquivos:
      cria: ["tests/apoio/semear-privacidade.ts", "docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css", "src/servicos/titular.ts", "src/componentes/FerramentasDoTitular.tsx", "tests/titular.test.ts", "tests/privacidade-estilos.test.ts"]
    teste_integracao: "O script semeia no banco de desenvolvimento conversas antigas e recentes dos tres canais e usuarios para excluir, sem tocar em segredo, e a verificacao percorre cada acao ate a tela de auditoria."
    teste_funcional: "Depois de semear, o expurgo apaga so as antigas e a verificacao registra os dois temas, 375 px, exportacao baixada e Apagar minha conversa no widget."
    criterio_aceite: "VERIFICACAO-VISUAL.md lista cada acao vista na tela de auditoria, os dois temas, 375 px, a exportacao e o que nao pode ser visto."
    depende_de: ["T-07.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-07.03
    titulo: "Documentacao: README, convencoes e lacunas"
    fase: F-07.2
    status: concluida
    objetivo: "Escrever a secao Privacidade e auditoria do README e converter convencoes e lacunas com arquivo e linha."
    arquivos:
      cria: []
      altera: ["README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere que o README tem a secao Privacidade e auditoria e cita AUDITORIA_RETENCAO_DIAS."
    teste_funcional: "CONVENCOES.md ganha as linhas de auditoria, expurgo, titular e exclusao de usuario com arquivo e linha existentes e LACUNAS.md registra as novas e converte a 25."
    criterio_aceite: "tests/projeto.test.ts passa e cada citacao de arquivo e linha aponta para uma linha existente."
    depende_de: ["T-07.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-07.04
    titulo: "Fechamento no laco do buildx"
    fase: F-07.2
    status: concluida
    objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e fechar os artefatos da entrega."
    arquivos:
      cria: ["docs/privacidade-e-auditoria/ORQUESTRADOR.md", "docs/privacidade-e-auditoria/00-AUDITORIA.md", "docs/privacidade-e-auditoria/FECHAMENTO.md", "docs/privacidade-e-auditoria/RELATORIO-FEATURE.md", "docs/privacidade-e-auditoria/BRIEFING-BUILDX.md", "docs/privacidade-e-auditoria/00-DECISOES.md", "docs/privacidade-e-auditoria/00-BLOQUEIOS.md", "docs/privacidade-e-auditoria/base/00-INDICE.md", "docs/privacidade-e-auditoria/base/00-LACUNAS.md", "docs/privacidade-e-auditoria/base/schema-e-migracoes.md", "docs/privacidade-e-auditoria/base/usuarios-e-sessao.md", "docs/privacidade-e-auditoria/base/integracoes-e-agentes.md", "docs/privacidade-e-auditoria/base/canais-e-conversas.md", "docs/privacidade-e-auditoria/base/segundo-plano-e-ambiente.md", "docs/privacidade-e-auditoria/base/telas-menu-e-publico.md", "docs/privacidade-e-auditoria/base/testes-e-ci.md", "docs/entregas/privacidade-e-auditoria/ENTREGA.md", "docs/entregas/privacidade-e-auditoria/PR.md", "docs/entregas/privacidade-e-auditoria/QA-PACOTE.md", "docs/entregas/privacidade-e-auditoria/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "docs/privacidade-e-auditoria/sprint-01/tasks.md", "docs/privacidade-e-auditoria/sprint-02/tasks.md", "docs/privacidade-e-auditoria/sprint-03/tasks.md", "docs/privacidade-e-auditoria/sprint-04/tasks.md", "docs/privacidade-e-auditoria/sprint-05/tasks.md", "docs/privacidade-e-auditoria/sprint-06/tasks.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra a FT-10 entregue com sprints, testes e PR local, PREMISSAS.md tem total 91 e PR-18 e PR-19 realizadas em FT-10 e o RECURSAO.md mantem PEND-07 com a verificacao visual das telas novas e ganha PEND-08 decisao_humana para confirmar a base legal."
    criterio_aceite: "grep de FT-10 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 91 e tests/projeto.test.ts passa."
    depende_de: ["T-07.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
---

# Tasks — Sprint 07

---

```yaml
id: T-07.01
titulo: "Prova no servidor de producao: ouvintes e DELETE publico"
objetivo: "Provar contra next start que apagar conversa pelo painel e o DELETE do visitante gravam auditoria pelos ouvintes ligados na subida."
arquivos:
  cria: ["tests/privacidade-fim-a-fim.test.ts", "docs/privacidade-e-auditoria/sprint-07/sprint.md", "docs/privacidade-e-auditoria/sprint-07/fases.md", "docs/privacidade-e-auditoria/sprint-07/tasks.md"]
  altera: []
teste_integracao: "Contra o servidor de producao em porta livre, DELETE /api/conversas/[id] com sessao de admin e DELETE publico do visitante gravam conversa_apagada no banco compartilhado, o que prova os ouvintes ligados pela instrumentacao."
teste_funcional: "Apagar uma conversa pelo painel e pelo visitante grava exatamente um conversa_apagada por conversa no banco compartilhado, com rotulo do admin ou Visitante (chat embutido), e a listagem da auditoria no servidor de producao as devolve."
criterio_aceite: "tests/privacidade-fim-a-fim.test.ts passa sem variavel de ambiente nova."
depende_de: ["T-06.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/privacidade-fim-a-fim.test.ts 5 passed contra next start; suite inteira no fechamento
```

---

```yaml
id: T-07.02
titulo: "Roteiro de dados semeados e verificacao no navegador"
objetivo: "Criar o script de dados para a verificacao e registrar a verificacao no navegador."
arquivos:
  cria: ["tests/apoio/semear-privacidade.ts", "docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md"]
  altera: ["src/estilos/global.css", "src/servicos/titular.ts", "src/componentes/FerramentasDoTitular.tsx", "tests/titular.test.ts", "tests/privacidade-estilos.test.ts"]
teste_integracao: "O script semeia no banco de desenvolvimento conversas antigas e recentes dos tres canais e usuarios para excluir, sem tocar em segredo, e a verificacao percorre cada acao ate a tela de auditoria."
teste_funcional: "Depois de semear, o expurgo apaga so as antigas e a verificacao registra os dois temas, 375 px, exportacao baixada e Apagar minha conversa no widget."
criterio_aceite: "VERIFICACAO-VISUAL.md lista cada acao vista na tela de auditoria, os dois temas, 375 px, a exportacao e o que nao pode ser visto."
depende_de: ["T-07.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2513 passed, 0 failed (208 arquivos); lint, tsc e build antes; verificacao no navegador em VERIFICACAO-VISUAL.md
```

---

```yaml
id: T-07.03
titulo: "Documentacao: README, convencoes e lacunas"
objetivo: "Escrever a secao Privacidade e auditoria do README e converter convencoes e lacunas com arquivo e linha."
arquivos:
  cria: []
  altera: ["README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
teste_integracao: "tests/projeto.test.ts confere que o README tem a secao Privacidade e auditoria e cita AUDITORIA_RETENCAO_DIAS."
teste_funcional: "CONVENCOES.md ganha as linhas de auditoria, expurgo, titular e exclusao de usuario com arquivo e linha existentes e LACUNAS.md registra as novas e converte a 25."
criterio_aceite: "tests/projeto.test.ts passa e cada citacao de arquivo e linha aponta para uma linha existente."
depende_de: ["T-07.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/projeto.test.ts 175 passed; suite inteira no fechamento
```

---

```yaml
id: T-07.04
titulo: "Fechamento no laco do buildx"
objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e fechar os artefatos da entrega."
arquivos:
  cria: ["docs/privacidade-e-auditoria/ORQUESTRADOR.md", "docs/privacidade-e-auditoria/00-AUDITORIA.md", "docs/privacidade-e-auditoria/FECHAMENTO.md", "docs/privacidade-e-auditoria/RELATORIO-FEATURE.md", "docs/privacidade-e-auditoria/BRIEFING-BUILDX.md", "docs/privacidade-e-auditoria/00-DECISOES.md", "docs/privacidade-e-auditoria/00-BLOQUEIOS.md", "docs/privacidade-e-auditoria/base/00-INDICE.md", "docs/privacidade-e-auditoria/base/00-LACUNAS.md", "docs/privacidade-e-auditoria/base/schema-e-migracoes.md", "docs/privacidade-e-auditoria/base/usuarios-e-sessao.md", "docs/privacidade-e-auditoria/base/integracoes-e-agentes.md", "docs/privacidade-e-auditoria/base/canais-e-conversas.md", "docs/privacidade-e-auditoria/base/segundo-plano-e-ambiente.md", "docs/privacidade-e-auditoria/base/telas-menu-e-publico.md", "docs/privacidade-e-auditoria/base/testes-e-ci.md", "docs/entregas/privacidade-e-auditoria/ENTREGA.md", "docs/entregas/privacidade-e-auditoria/PR.md", "docs/entregas/privacidade-e-auditoria/QA-PACOTE.md", "docs/entregas/privacidade-e-auditoria/ATENCAO.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "docs/privacidade-e-auditoria/sprint-01/tasks.md", "docs/privacidade-e-auditoria/sprint-02/tasks.md", "docs/privacidade-e-auditoria/sprint-03/tasks.md", "docs/privacidade-e-auditoria/sprint-04/tasks.md", "docs/privacidade-e-auditoria/sprint-05/tasks.md", "docs/privacidade-e-auditoria/sprint-06/tasks.md"]
teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
teste_funcional: "O MAPA.md mostra a FT-10 entregue com sprints, testes e PR local, PREMISSAS.md tem total 91 e PR-18 e PR-19 realizadas em FT-10 e o RECURSAO.md mantem PEND-07 com a verificacao visual das telas novas e ganha PEND-08 decisao_humana para confirmar a base legal."
criterio_aceite: "grep de FT-10 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 91 e tests/projeto.test.ts passa."
depende_de: ["T-07.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2544 passed, 0 failed (208 arquivos); tsc, lint, build e audit verdes
```

