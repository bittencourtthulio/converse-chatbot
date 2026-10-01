---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-08
atualizado_em: 2026-10-01
tasks:
  - id: T-08.01
    titulo: "Exemplo de ambiente e README operacional"
    fase: F-08.1
    status: concluida
    objetivo: "Documentar todas as variaveis no exemplo de ambiente e escrever as secoes de operacao no README com teste que as confere."
    arquivos:
      cria: ["docs/operacao-e-backup/sprint-08/sprint.md", "docs/operacao-e-backup/sprint-08/fases.md", "docs/operacao-e-backup/sprint-08/tasks.md"]
      altera: [".env.example", "README.md", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere que o exemplo de ambiente documenta LOG_LEVEL, BACKUP_DIR, BACKUP_MANTER, ADMIN_SENHA e TZ sem valor secreto e que o README tem as secoes de requisitos, variaveis, Docker, HTTPS, URL publica, backup, restauracao, cron, atualizacao, seguranca e solucao de problemas."
    teste_funcional: "A tabela de variaveis do README tem uma linha para cada variavel lida em src/lib/ambiente.ts e o README diz com destaque que o backup nao contem a ENCRYPTION_KEY e que a restauracao e so por linha de comando."
    criterio_aceite: "tests/projeto.test.ts passa."
    depende_de: ["T-07.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-08.02
    titulo: "Convencoes e lacunas com evidencia"
    fase: F-08.1
    status: concluida
    objetivo: "Converter log, console, ffmpeg no conteiner e backup do storage em evidencia com arquivo e linha e registrar as lacunas novas."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere cada citacao arquivo:linha nova de CONVENCOES.md e LACUNAS.md contra o codigo."
    teste_funcional: "CONVENCOES.md tem as regras de log, correlacao, ambiente, saude, backup, restauracao e conteiner, a lacuna 6 esta marcada resolvida e as lacunas novas estao registradas."
    criterio_aceite: "tests/projeto.test.ts passa."
    depende_de: ["T-08.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-08.03
    titulo: "Verificacao no navegador"
    fase: F-08.2
    status: concluida
    objetivo: "Verificar num Chrome proprio, com porta livre e alvo confirmado, a tela Sistema, o backup, as paginas de erro e o conteiner, nos dois temas e a 375 px, e registrar o resultado."
    arquivos:
      cria: ["docs/operacao-e-backup/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "Com o servidor de producao de pe, a tela Sistema mostra os dados reais, Gerar backup agora cria o arquivo e aparece na lista e no registro de Auditoria, e o arquivo baixado pelo navegador confere com o do disco."
    teste_funcional: "A pagina de erro e o 404 mostram o codigo de referencia e a tela Sistema e as paginas de erro nao tem rolagem lateral a 375 px nos temas claro e escuro."
    criterio_aceite: "VERIFICACAO-VISUAL.md existe, lista o que foi visto e o que nao foi e os defeitos achados estao corrigidos."
    depende_de: ["T-08.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-08.04
    titulo: "Fechamento no laco do buildx"
    fase: F-08.2
    status: concluida
    objetivo: "Fechar a feature no mapa, nas premissas e na recursao e consolidar os artefatos de entrega."
    arquivos:
      cria: ["docs/operacao-e-backup/FECHAMENTO.md", "docs/operacao-e-backup/RELATORIO-FEATURE.md", "docs/operacao-e-backup/ORQUESTRADOR.md", "docs/operacao-e-backup/00-AUDITORIA.md", "docs/operacao-e-backup/00-BLOQUEIOS.md", "docs/operacao-e-backup/00-DECISOES.md", "docs/operacao-e-backup/BRIEFING-BUILDX.md", "docs/operacao-e-backup/base/00-INDICE.md", "docs/operacao-e-backup/base/00-LACUNAS.md", "docs/operacao-e-backup/base/log-e-erros.md", "docs/operacao-e-backup/base/ambiente-e-start.md", "docs/operacao-e-backup/base/banco-e-armazenamento.md", "docs/operacao-e-backup/base/segundo-plano-e-auditoria.md", "docs/operacao-e-backup/base/telas-menu-e-guardas.md", "docs/operacao-e-backup/base/testes-ci-e-docs.md", "docs/operacao-e-backup/base/conteiner-e-ferramentas.md", "docs/entregas/operacao-e-backup/ENTREGA.md", "docs/entregas/operacao-e-backup/PR.md", "docs/entregas/operacao-e-backup/QA-PACOTE.md", "docs/entregas/operacao-e-backup/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", ".github/workflows/ci.yml"]
    teste_integracao: "tests/projeto.test.ts confere que MAPA.md marca FT-11 entregue com sprints, testes e PR local, que PREMISSAS.md tem PR-92 a PR-100 realizadas e que RECURSAO.md registra as pendencias."
    teste_funcional: "docs/operacao-e-backup/RELATORIO-FEATURE.md existe com o que foi entregue, como demonstrar, os desvios e o que a proxima etapa precisa saber, e o projeto.md conta 11 features entregues."
    criterio_aceite: "A suite inteira esta verde, tsc, lint, build e npm audit --audit-level=high passam e o MAPA.md tem status entregue."
    depende_de: ["T-08.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
---

# Tasks — Sprint 08

---

```yaml
id: T-08.01
titulo: "Exemplo de ambiente e README operacional"
objetivo: "Documentar todas as variaveis no exemplo de ambiente e escrever as secoes de operacao no README com teste que as confere."
arquivos:
  cria: ["docs/operacao-e-backup/sprint-08/sprint.md", "docs/operacao-e-backup/sprint-08/fases.md", "docs/operacao-e-backup/sprint-08/tasks.md"]
  altera: [".env.example", "README.md", "tests/projeto.test.ts"]
teste_integracao: "tests/projeto.test.ts confere que o exemplo de ambiente documenta LOG_LEVEL, BACKUP_DIR, BACKUP_MANTER, ADMIN_SENHA e TZ sem valor secreto e que o README tem as secoes de requisitos, variaveis, Docker, HTTPS, URL publica, backup, restauracao, cron, atualizacao, seguranca e solucao de problemas."
teste_funcional: "A tabela de variaveis do README tem uma linha para cada variavel lida em src/lib/ambiente.ts e o README diz com destaque que o backup nao contem a ENCRYPTION_KEY e que a restauracao e so por linha de comando."
criterio_aceite: "tests/projeto.test.ts passa."
depende_de: ["T-07.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/projeto.test.ts 181 passed; só documentação e teste
```

---

```yaml
id: T-08.02
titulo: "Convencoes e lacunas com evidencia"
objetivo: "Converter log, console, ffmpeg no conteiner e backup do storage em evidencia com arquivo e linha e registrar as lacunas novas."
arquivos:
  cria: []
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
teste_integracao: "tests/projeto.test.ts confere cada citacao arquivo:linha nova de CONVENCOES.md e LACUNAS.md contra o codigo."
teste_funcional: "CONVENCOES.md tem as regras de log, correlacao, ambiente, saude, backup, restauracao e conteiner, a lacuna 6 esta marcada resolvida e as lacunas novas estao registradas."
criterio_aceite: "tests/projeto.test.ts passa."
depende_de: ["T-08.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/projeto.test.ts 217 passed (34 citações novas conferidas contra o código)
```

---

```yaml
id: T-08.03
titulo: "Verificacao no navegador"
objetivo: "Verificar num Chrome proprio, com porta livre e alvo confirmado, a tela Sistema, o backup, as paginas de erro e o conteiner, nos dois temas e a 375 px, e registrar o resultado."
arquivos:
  cria: ["docs/operacao-e-backup/VERIFICACAO-VISUAL.md"]
  altera: ["src/estilos/global.css"]
teste_integracao: "Com o servidor de producao de pe, a tela Sistema mostra os dados reais, Gerar backup agora cria o arquivo e aparece na lista e no registro de Auditoria, e o arquivo baixado pelo navegador confere com o do disco."
teste_funcional: "A pagina de erro e o 404 mostram o codigo de referencia e a tela Sistema e as paginas de erro nao tem rolagem lateral a 375 px nos temas claro e escuro."
criterio_aceite: "VERIFICACAO-VISUAL.md existe, lista o que foi visto e o que nao foi e os defeitos achados estao corrigidos."
depende_de: ["T-08.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — verificação em Chrome próprio: Sistema, backup, 404 e erro nos dois temas e a 375 px
```

---

```yaml
id: T-08.04
titulo: "Fechamento no laco do buildx"
objetivo: "Fechar a feature no mapa, nas premissas e na recursao e consolidar os artefatos de entrega."
arquivos:
  cria: ["docs/operacao-e-backup/FECHAMENTO.md", "docs/operacao-e-backup/RELATORIO-FEATURE.md", "docs/operacao-e-backup/ORQUESTRADOR.md", "docs/operacao-e-backup/00-AUDITORIA.md", "docs/operacao-e-backup/00-BLOQUEIOS.md", "docs/operacao-e-backup/00-DECISOES.md", "docs/operacao-e-backup/BRIEFING-BUILDX.md", "docs/operacao-e-backup/base/00-INDICE.md", "docs/operacao-e-backup/base/00-LACUNAS.md", "docs/operacao-e-backup/base/log-e-erros.md", "docs/operacao-e-backup/base/ambiente-e-start.md", "docs/operacao-e-backup/base/banco-e-armazenamento.md", "docs/operacao-e-backup/base/segundo-plano-e-auditoria.md", "docs/operacao-e-backup/base/telas-menu-e-guardas.md", "docs/operacao-e-backup/base/testes-ci-e-docs.md", "docs/operacao-e-backup/base/conteiner-e-ferramentas.md", "docs/entregas/operacao-e-backup/ENTREGA.md", "docs/entregas/operacao-e-backup/PR.md", "docs/entregas/operacao-e-backup/QA-PACOTE.md", "docs/entregas/operacao-e-backup/ATENCAO.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", ".github/workflows/ci.yml"]
teste_integracao: "tests/projeto.test.ts confere que MAPA.md marca FT-11 entregue com sprints, testes e PR local, que PREMISSAS.md tem PR-92 a PR-100 realizadas e que RECURSAO.md registra as pendencias."
teste_funcional: "docs/operacao-e-backup/RELATORIO-FEATURE.md existe com o que foi entregue, como demonstrar, os desvios e o que a proxima etapa precisa saber, e o projeto.md conta 11 features entregues."
criterio_aceite: "A suite inteira esta verde, tsc, lint, build e npm audit --audit-level=high passam e o MAPA.md tem status entregue."
depende_de: ["T-08.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2863 passed, 9 skipped (opt-in do contêiner), 243 arquivos; tsc, lint, build e npm audit verdes
```

