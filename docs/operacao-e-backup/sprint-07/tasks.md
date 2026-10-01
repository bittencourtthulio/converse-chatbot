---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-07
atualizado_em: 2026-10-01
tasks:
  - id: T-07.01
    titulo: "Desligamento limpo no SIGTERM"
    fase: F-07.1
    status: concluida
    objetivo: "Acrescentar parar e aguardarEncerramento a fila de fontes e instalar em register() o desligamento limpo de SIGTERM e SIGINT que para o expurgo, drena a fila com prazo e espera a auditoria."
    arquivos:
      cria: ["tests/desligamento.test.ts", "docs/operacao-e-backup/sprint-07/sprint.md", "docs/operacao-e-backup/sprint-07/fases.md", "docs/operacao-e-backup/sprint-07/tasks.md"]
      altera: ["src/servicos/fontes-fila.ts", "src/instrumentation.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "Depois de parar(), a fila nao reivindica fonte nova e aguardarEncerramento resolve quando a fonte em curso termina ou o prazo acaba, e o desligamento chama parar do agendador do expurgo e espera as gravacoes pendentes da auditoria."
    teste_funcional: "next start com NEXT_MANUAL_SIG_HANDLE recebendo SIGTERM escreve a linha desligamento no log e sai com 0, e uma fonte em processando no momento do sinal volta a pendente no start seguinte."
    criterio_aceite: "tests/desligamento.test.ts, tests/fontes-fila.test.ts e tests/instrumentacao.test.ts passam."
    depende_de: ["T-06.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-07.02
    titulo: "Comando do primeiro administrador"
    fase: F-07.1
    status: pendente
    objetivo: "Criar criarAdministradorInicial em usuarios.ts e scripts/criar-admin.ts que cria o primeiro administrador lendo a senha de ADMIN_SENHA ou da entrada padrao."
    arquivos:
      cria: ["scripts/criar-admin.ts", "tests/criar-admin.test.ts"]
      altera: ["src/servicos/usuarios.ts", "package.json", "tests/usuarios.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "O comando como processo filho com ADMIN_SENHA cria um usuario admin ativo que entra com a senha, grava a auditoria usuario_criado com ator Sistema e imprime o e-mail sem a senha."
    teste_funcional: "E-mail ja existente, senha com menos de 8 caracteres e senha passada como argumento sao recusados com mensagem clara e sem criar usuario, e a saida e o log nunca contem a senha."
    criterio_aceite: "tests/criar-admin.test.ts e tests/usuarios.test.ts passam e package.json tem o script admin:criar."
    depende_de: ["T-07.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-07.03
    titulo: "Dockerfile, entrypoint, compose e dockerignore"
    fase: F-07.2
    status: pendente
    objetivo: "Criar o Dockerfile multi-estagio, o entrypoint, o docker-compose.yml e o .dockerignore conforme a PR-99."
    arquivos:
      cria: ["Dockerfile", "docker-entrypoint.sh", "docker-compose.yml", ".dockerignore", "tests/conteiner.test.ts"]
      altera: []
    teste_integracao: "O Dockerfile usa node:22-bookworm-slim, instala ffmpeg, roda como usuario nao-root, declara o volume /data, as variaveis de caminho, HEALTHCHECK em /api/saude e ENTRYPOINT docker-entrypoint.sh, e o entrypoint aplica migrate deploy antes de next start com exec."
    teste_funcional: "O compose define volume nomeado, env_file, restart unless-stopped, healthcheck, porta, TRUST_PROXY, init e stop_grace_period, e o .dockerignore exclui o arquivo de segredos, node_modules, storage, backups, *.db e .next."
    criterio_aceite: "tests/conteiner.test.ts passa e docker compose config valida o compose."
    depende_de: ["T-07.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-07.04
    titulo: "Verificacao real do conteiner"
    fase: F-07.2
    status: pendente
    objetivo: "Construir a imagem, subir o conteiner com segredos descartaveis, conferir saude, login, ffmpeg, persistencia, backup e restauracao por dentro e desligamento, e remover tudo."
    arquivos:
      cria: ["tests/conteiner-imagem.test.ts", "docs/operacao-e-backup/VERIFICACAO-CONTEINER.md"]
      altera: ["Dockerfile", "docker-entrypoint.sh", "docker-compose.yml", ".dockerignore"]
    teste_integracao: "Com VERIFICAR_CONTEINER=1 o teste constroi a imagem, sobe o conteiner e GET /api/saude responde 200 com status ok, o login de um admin criado por admin:criar funciona e ffmpeg -version responde dentro dele."
    teste_funcional: "Os dados criados sobrevivem a docker compose down e up, npm run backup e npm run restore funcionam dentro do conteiner, docker stop encerra com codigo 0 e a linha desligamento, e o teste remove conteineres, volumes e imagem de teste."
    criterio_aceite: "A execucao com VERIFICAR_CONTEINER=1 passa e VERIFICACAO-CONTEINER.md registra o que foi e o que nao foi verificado."
    depende_de: ["T-07.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-07.05
    titulo: "Job de CI que constroi a imagem"
    fase: F-07.2
    status: pendente
    objetivo: "Acrescentar ao CI um job que roda docker build sem publicar."
    arquivos:
      cria: []
      altera: [".github/workflows/ci.yml", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere que o CI tem o job construir-imagem com docker build e sem push nem login em registro."
    teste_funcional: "O job verificar existente continua com os passos de lint, tipos, build, testes e auditoria na mesma ordem."
    criterio_aceite: "tests/projeto.test.ts passa."
    depende_de: ["T-07.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 07

---

```yaml
id: T-07.01
titulo: "Desligamento limpo no SIGTERM"
objetivo: "Acrescentar parar e aguardarEncerramento a fila de fontes e instalar em register() o desligamento limpo de SIGTERM e SIGINT que para o expurgo, drena a fila com prazo e espera a auditoria."
arquivos:
  cria: ["tests/desligamento.test.ts", "docs/operacao-e-backup/sprint-07/sprint.md", "docs/operacao-e-backup/sprint-07/fases.md", "docs/operacao-e-backup/sprint-07/tasks.md"]
  altera: ["src/servicos/fontes-fila.ts", "src/instrumentation.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "Depois de parar(), a fila nao reivindica fonte nova e aguardarEncerramento resolve quando a fonte em curso termina ou o prazo acaba, e o desligamento chama parar do agendador do expurgo e espera as gravacoes pendentes da auditoria."
teste_funcional: "next start com NEXT_MANUAL_SIG_HANDLE recebendo SIGTERM escreve a linha desligamento no log e sai com 0, e uma fonte em processando no momento do sinal volta a pendente no start seguinte."
criterio_aceite: "tests/desligamento.test.ts, tests/fontes-fila.test.ts e tests/instrumentacao.test.ts passam."
depende_de: ["T-06.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2792 passed, 0 failed (240 arquivos); build antes; SIGTERM contra next start com NEXT_MANUAL_SIG_HANDLE provado
```

---

```yaml
id: T-07.02
titulo: "Comando do primeiro administrador"
objetivo: "Criar criarAdministradorInicial em usuarios.ts e scripts/criar-admin.ts que cria o primeiro administrador lendo a senha de ADMIN_SENHA ou da entrada padrao."
arquivos:
  cria: ["scripts/criar-admin.ts", "tests/criar-admin.test.ts"]
  altera: ["src/servicos/usuarios.ts", "package.json", "tests/usuarios.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "O comando como processo filho com ADMIN_SENHA cria um usuario admin ativo que entra com a senha, grava a auditoria usuario_criado com ator Sistema e imprime o e-mail sem a senha."
teste_funcional: "E-mail ja existente, senha com menos de 8 caracteres e senha passada como argumento sao recusados com mensagem clara e sem criar usuario, e a saida e o log nunca contem a senha."
criterio_aceite: "tests/criar-admin.test.ts e tests/usuarios.test.ts passam e package.json tem o script admin:criar."
depende_de: ["T-07.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-07.03
titulo: "Dockerfile, entrypoint, compose e dockerignore"
objetivo: "Criar o Dockerfile multi-estagio, o entrypoint, o docker-compose.yml e o .dockerignore conforme a PR-99."
arquivos:
  cria: ["Dockerfile", "docker-entrypoint.sh", "docker-compose.yml", ".dockerignore", "tests/conteiner.test.ts"]
  altera: []
teste_integracao: "O Dockerfile usa node:22-bookworm-slim, instala ffmpeg, roda como usuario nao-root, declara o volume /data, as variaveis de caminho, HEALTHCHECK em /api/saude e ENTRYPOINT docker-entrypoint.sh, e o entrypoint aplica migrate deploy antes de next start com exec."
teste_funcional: "O compose define volume nomeado, env_file, restart unless-stopped, healthcheck, porta, TRUST_PROXY, init e stop_grace_period, e o .dockerignore exclui o arquivo de segredos, node_modules, storage, backups, *.db e .next."
criterio_aceite: "tests/conteiner.test.ts passa e docker compose config valida o compose."
depende_de: ["T-07.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-07.04
titulo: "Verificacao real do conteiner"
objetivo: "Construir a imagem, subir o conteiner com segredos descartaveis, conferir saude, login, ffmpeg, persistencia, backup e restauracao por dentro e desligamento, e remover tudo."
arquivos:
  cria: ["tests/conteiner-imagem.test.ts", "docs/operacao-e-backup/VERIFICACAO-CONTEINER.md"]
  altera: ["Dockerfile", "docker-entrypoint.sh", "docker-compose.yml", ".dockerignore"]
teste_integracao: "Com VERIFICAR_CONTEINER=1 o teste constroi a imagem, sobe o conteiner e GET /api/saude responde 200 com status ok, o login de um admin criado por admin:criar funciona e ffmpeg -version responde dentro dele."
teste_funcional: "Os dados criados sobrevivem a docker compose down e up, npm run backup e npm run restore funcionam dentro do conteiner, docker stop encerra com codigo 0 e a linha desligamento, e o teste remove conteineres, volumes e imagem de teste."
criterio_aceite: "A execucao com VERIFICAR_CONTEINER=1 passa e VERIFICACAO-CONTEINER.md registra o que foi e o que nao foi verificado."
depende_de: ["T-07.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-07.05
titulo: "Job de CI que constroi a imagem"
objetivo: "Acrescentar ao CI um job que roda docker build sem publicar."
arquivos:
  cria: []
  altera: [".github/workflows/ci.yml", "tests/projeto.test.ts"]
teste_integracao: "tests/projeto.test.ts confere que o CI tem o job construir-imagem com docker build e sem push nem login em registro."
teste_funcional: "O job verificar existente continua com os passos de lint, tipos, build, testes e auditoria na mesma ordem."
criterio_aceite: "tests/projeto.test.ts passa."
depende_de: ["T-07.04"]
paralelizavel: false
status: pendente
```

