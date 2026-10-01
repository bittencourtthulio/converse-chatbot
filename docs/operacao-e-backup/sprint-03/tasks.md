---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-03
atualizado_em: 2026-10-01
tasks:
  - id: T-03.01
    titulo: "validarAmbiente e variaveis de operacao"
    fase: F-03.1
    status: pendente
    objetivo: "Criar validarAmbiente em src/lib/ambiente.ts, as variaveis LOG_LEVEL, BACKUP_DIR, BACKUP_MANTER, o caminho do arquivo do banco e o fuso, e exportar a validacao da ENCRYPTION_KEY de cripto.ts."
    arquivos:
      cria: ["tests/ambiente-validar.test.ts", "docs/operacao-e-backup/sprint-03/sprint.md", "docs/operacao-e-backup/sprint-03/fases.md", "docs/operacao-e-backup/sprint-03/tasks.md"]
      altera: ["src/lib/ambiente.ts", "src/lib/cripto.ts", "tests/ambiente.test.ts", "tests/cripto.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "Com NODE_ENV production e sem JWT_SECRET, DATABASE_URL e ENCRYPTION_KEY validarAmbiente lanca um Erro cuja mensagem lista os tres nomes, e com valores a lista de erros e vazia."
    teste_funcional: "JWT_SECRET de 31 caracteres, ENCRYPTION_KEY invalida e BACKUP_MANTER 0 entram na lista pelo nome sem repetir o valor, APP_URL ausente ou http vira aviso e fora de producao a funcao devolve listas vazias."
    criterio_aceite: "tests/ambiente-validar.test.ts, tests/ambiente.test.ts e tests/cripto.test.ts passam e a mensagem de erro nunca contem o valor de uma variavel."
    depende_de: ["T-02.07"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.02
    titulo: "Start de producao derrubado por configuracao ausente"
    fase: F-03.1
    status: pendente
    objetivo: "Chamar validarAmbiente no inicio de register(), logar os avisos e provar contra next start que a producao sem as variaveis nao sobe."
    arquivos:
      cria: ["tests/ambiente-start.test.ts"]
      altera: ["src/instrumentation.ts", "tests/instrumentacao.test.ts"]
    teste_integracao: "register() em producao sem JWT_SECRET lanca antes de ligar auditoria, expurgo e fila, e com tudo definido segue e loga o aviso de APP_URL sem HTTPS."
    teste_funcional: "next start com NODE_ENV production sem JWT_SECRET, DATABASE_URL e ENCRYPTION_KEY termina com codigo diferente de zero, a saida cita os tres nomes e nenhum valor, e com as variaveis o servidor responde."
    criterio_aceite: "tests/instrumentacao.test.ts e tests/ambiente-start.test.ts passam."
    depende_de: ["T-03.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.03
    titulo: "Servico de saude e GET /api/saude"
    fase: F-03.2
    status: pendente
    objetivo: "Criar verificarSaude (banco, disco gravavel, FTS5, midia com cache) e a rota publica que devolve so o status."
    arquivos:
      cria: ["src/servicos/saude.ts", "src/app/api/saude/route.ts", "tests/saude.test.ts", "tests/saude-rota.test.ts"]
      altera: []
    teste_integracao: "verificarSaude com banco, storage e FTS5 sadios e ffmpeg presente devolve ok, sem ffmpeg devolve degradado, e com banco fora do ar, storage nao gravavel ou trechos_fts ausente devolve falha."
    teste_funcional: "GET /api/saude sem sessao devolve 200 e apenas {status:'ok'} com Cache-Control no-store, devolve 503 em falha e 200 em degradado, e duas chamadas em 60 segundos rodam a sonda de ffmpeg uma vez."
    criterio_aceite: "tests/saude.test.ts e tests/saude-rota.test.ts passam e o corpo da resposta tem uma unica chave."
    depende_de: ["T-03.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.04
    titulo: "Dados do sistema para a tela e ultima rodada do expurgo"
    fase: F-03.2
    status: pendente
    objetivo: "Criar src/lib/versao.ts e src/servicos/sistema.ts com obterSistema(admin) e acrescentar ultimaExecucaoEm ao agendador do expurgo."
    arquivos:
      cria: ["src/lib/versao.ts", "src/servicos/sistema.ts", "tests/versao.test.ts", "tests/sistema.test.ts"]
      altera: ["src/servicos/expurgo.ts", "tests/expurgo-agendador.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "obterSistema para um admin devolve versao do package.json, migrations aplicadas e a ultima, uptime, Node, fuso, tamanho do banco e do storage, midia, contagem da fila por status, agendador, e o estado de ENCRYPTION_KEY, APP_URL e chave do OpenRouter como sim ou nao."
    teste_funcional: "obterSistema para um usuario comum lanca 403, o resultado serializado nao contem o valor de ENCRYPTION_KEY, JWT_SECRET nem da chave do OpenRouter, e ultimaExecucaoEm do agendador passa de nulo para a hora da rodada."
    criterio_aceite: "tests/versao.test.ts, tests/sistema.test.ts e tests/expurgo-agendador.test.ts passam."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: "validarAmbiente e variaveis de operacao"
objetivo: "Criar validarAmbiente em src/lib/ambiente.ts, as variaveis LOG_LEVEL, BACKUP_DIR, BACKUP_MANTER, o caminho do arquivo do banco e o fuso, e exportar a validacao da ENCRYPTION_KEY de cripto.ts."
arquivos:
  cria: ["tests/ambiente-validar.test.ts", "docs/operacao-e-backup/sprint-03/sprint.md", "docs/operacao-e-backup/sprint-03/fases.md", "docs/operacao-e-backup/sprint-03/tasks.md"]
  altera: ["src/lib/ambiente.ts", "src/lib/cripto.ts", "tests/ambiente.test.ts", "tests/cripto.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "Com NODE_ENV production e sem JWT_SECRET, DATABASE_URL e ENCRYPTION_KEY validarAmbiente lanca um Erro cuja mensagem lista os tres nomes, e com valores a lista de erros e vazia."
teste_funcional: "JWT_SECRET de 31 caracteres, ENCRYPTION_KEY invalida e BACKUP_MANTER 0 entram na lista pelo nome sem repetir o valor, APP_URL ausente ou http vira aviso e fora de producao a funcao devolve listas vazias."
criterio_aceite: "tests/ambiente-validar.test.ts, tests/ambiente.test.ts e tests/cripto.test.ts passam e a mensagem de erro nunca contem o valor de uma variavel."
depende_de: ["T-02.07"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.02
titulo: "Start de producao derrubado por configuracao ausente"
objetivo: "Chamar validarAmbiente no inicio de register(), logar os avisos e provar contra next start que a producao sem as variaveis nao sobe."
arquivos:
  cria: ["tests/ambiente-start.test.ts"]
  altera: ["src/instrumentation.ts", "tests/instrumentacao.test.ts"]
teste_integracao: "register() em producao sem JWT_SECRET lanca antes de ligar auditoria, expurgo e fila, e com tudo definido segue e loga o aviso de APP_URL sem HTTPS."
teste_funcional: "next start com NODE_ENV production sem JWT_SECRET, DATABASE_URL e ENCRYPTION_KEY termina com codigo diferente de zero, a saida cita os tres nomes e nenhum valor, e com as variaveis o servidor responde."
criterio_aceite: "tests/instrumentacao.test.ts e tests/ambiente-start.test.ts passam."
depende_de: ["T-03.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.03
titulo: "Servico de saude e GET /api/saude"
objetivo: "Criar verificarSaude (banco, disco gravavel, FTS5, midia com cache) e a rota publica que devolve so o status."
arquivos:
  cria: ["src/servicos/saude.ts", "src/app/api/saude/route.ts", "tests/saude.test.ts", "tests/saude-rota.test.ts"]
  altera: []
teste_integracao: "verificarSaude com banco, storage e FTS5 sadios e ffmpeg presente devolve ok, sem ffmpeg devolve degradado, e com banco fora do ar, storage nao gravavel ou trechos_fts ausente devolve falha."
teste_funcional: "GET /api/saude sem sessao devolve 200 e apenas {status:'ok'} com Cache-Control no-store, devolve 503 em falha e 200 em degradado, e duas chamadas em 60 segundos rodam a sonda de ffmpeg uma vez."
criterio_aceite: "tests/saude.test.ts e tests/saude-rota.test.ts passam e o corpo da resposta tem uma unica chave."
depende_de: ["T-03.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.04
titulo: "Dados do sistema para a tela e ultima rodada do expurgo"
objetivo: "Criar src/lib/versao.ts e src/servicos/sistema.ts com obterSistema(admin) e acrescentar ultimaExecucaoEm ao agendador do expurgo."
arquivos:
  cria: ["src/lib/versao.ts", "src/servicos/sistema.ts", "tests/versao.test.ts", "tests/sistema.test.ts"]
  altera: ["src/servicos/expurgo.ts", "tests/expurgo-agendador.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "obterSistema para um admin devolve versao do package.json, migrations aplicadas e a ultima, uptime, Node, fuso, tamanho do banco e do storage, midia, contagem da fila por status, agendador, e o estado de ENCRYPTION_KEY, APP_URL e chave do OpenRouter como sim ou nao."
teste_funcional: "obterSistema para um usuario comum lanca 403, o resultado serializado nao contem o valor de ENCRYPTION_KEY, JWT_SECRET nem da chave do OpenRouter, e ultimaExecucaoEm do agendador passa de nulo para a hora da rodada."
criterio_aceite: "tests/versao.test.ts, tests/sistema.test.ts e tests/expurgo-agendador.test.ts passam."
depende_de: ["T-03.03"]
paralelizavel: false
status: pendente
```

