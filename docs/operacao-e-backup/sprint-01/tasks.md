---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-01
atualizado_em: 2026-10-01
tasks:
  - id: T-01.01
    titulo: "Dependencias tar e better-sqlite3 e prova do backup online"
    fase: F-01.1
    status: concluida
    objetivo: "Fixar tar e better-sqlite3 (e seus tipos) como dependencias diretas, mover prisma e tsx para dependencies e provar que db.backup preserva o rowid das linhas de trechos e que o tar cria e extrai sem shell."
    arquivos:
      cria: ["tests/dependencias-operacao.test.ts", "docs/operacao-e-backup/sprint-01/sprint.md", "docs/operacao-e-backup/sprint-01/fases.md", "docs/operacao-e-backup/sprint-01/tasks.md"]
      altera: ["package.json", "package-lock.json"]
    teste_integracao: "Um banco migrado com trechos e indice FTS5 copiado por db.backup mantem o rowid de cada trecho, a busca MATCH devolve os mesmos ids e PRAGMA integrity_check da copia responde ok."
    teste_funcional: "Um diretorio com um arquivo criado por tar.create com gzip em arquivo 0600 e extraido por tar.extract em outro diretorio tem o mesmo conteudo."
    criterio_aceite: "tests/dependencias-operacao.test.ts passa, npm audit --audit-level=high termina com 0 vulnerabilidades e package.json tem tar e better-sqlite3 com versao fixa e prisma e tsx em dependencies."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-01.02
    titulo: "Instalacao de teste com dados de todas as camadas"
    fase: F-01.1
    status: pendente
    objetivo: "Criar o apoio que monta uma instalacao completa no banco e no storage do teste e tira um retrato comparavel linha a linha."
    arquivos:
      cria: ["tests/apoio/instalacao.ts", "tests/instalacao-apoio.test.ts"]
      altera: []
    teste_integracao: "semearInstalacao grava no banco de teste usuarios, agente com configuracao de chat e canal Telegram com token cifrado, fontes com trechos e indice FTS, conversa com mensagens e fontes e registros de auditoria, e no STORAGE_DIR um original e os temporarios audio, segmentos e original.parcial."
    teste_funcional: "retratoDoBanco devolve as linhas de cada tabela em ordem estavel, duas leituras seguidas sao iguais e uma alteracao de uma linha muda o retrato."
    criterio_aceite: "tests/instalacao-apoio.test.ts passa e a fixture devolve os caminhos do original e dos temporarios semeados."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: "Modulo de log com redacao, niveis e correlacao"
    fase: F-01.2
    status: pendente
    objetivo: "Criar src/lib/log.ts com log.debug, log.info, log.aviso e log.erro, redacao central, nivel por LOG_LEVEL e correlacao por AsyncLocalStorage."
    arquivos:
      cria: ["src/lib/log.ts", "tests/log.test.ts"]
      altera: ["src/lib/ambiente.ts", "tests/ambiente.test.ts"]
    teste_integracao: "Cada chamada de log escreve uma unica linha JSON com nivel, quando, msg e os campos pelo console do nivel correspondente, e abaixo do nivel de LOG_LEVEL nao escreve nada."
    teste_funcional: "Um evento com senha, token, chave, authorization, cookie, secret, texto de mensagem, e-mail, chave sk-, texto v1:, token de bot e JWT nao deixa nenhum desses valores na linha, o e-mail sai mascarado e um Error sai so com nome e codigo."
    criterio_aceite: "tests/log.test.ts e tests/ambiente.test.ts passam e dentro de comCorrelacao a linha leva o campo correlacao."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

---

```yaml
id: T-01.01
titulo: "Dependencias tar e better-sqlite3 e prova do backup online"
objetivo: "Fixar tar e better-sqlite3 (e seus tipos) como dependencias diretas, mover prisma e tsx para dependencies e provar que db.backup preserva o rowid das linhas de trechos e que o tar cria e extrai sem shell."
arquivos:
  cria: ["tests/dependencias-operacao.test.ts", "docs/operacao-e-backup/sprint-01/sprint.md", "docs/operacao-e-backup/sprint-01/fases.md", "docs/operacao-e-backup/sprint-01/tasks.md"]
  altera: ["package.json", "package-lock.json"]
teste_integracao: "Um banco migrado com trechos e indice FTS5 copiado por db.backup mantem o rowid de cada trecho, a busca MATCH devolve os mesmos ids e PRAGMA integrity_check da copia responde ok."
teste_funcional: "Um diretorio com um arquivo criado por tar.create com gzip em arquivo 0600 e extraido por tar.extract em outro diretorio tem o mesmo conteudo."
criterio_aceite: "tests/dependencias-operacao.test.ts passa, npm audit --audit-level=high termina com 0 vulnerabilidades e package.json tem tar e better-sqlite3 com versao fixa e prisma e tsx em dependencies."
depende_de: []
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2548 passed, 0 failed (209 arquivos); build antes
```

---

```yaml
id: T-01.02
titulo: "Instalacao de teste com dados de todas as camadas"
objetivo: "Criar o apoio que monta uma instalacao completa no banco e no storage do teste e tira um retrato comparavel linha a linha."
arquivos:
  cria: ["tests/apoio/instalacao.ts", "tests/instalacao-apoio.test.ts"]
  altera: []
teste_integracao: "semearInstalacao grava no banco de teste usuarios, agente com configuracao de chat e canal Telegram com token cifrado, fontes com trechos e indice FTS, conversa com mensagens e fontes e registros de auditoria, e no STORAGE_DIR um original e os temporarios audio, segmentos e original.parcial."
teste_funcional: "retratoDoBanco devolve as linhas de cada tabela em ordem estavel, duas leituras seguidas sao iguais e uma alteracao de uma linha muda o retrato."
criterio_aceite: "tests/instalacao-apoio.test.ts passa e a fixture devolve os caminhos do original e dos temporarios semeados."
depende_de: ["T-01.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.03
titulo: "Modulo de log com redacao, niveis e correlacao"
objetivo: "Criar src/lib/log.ts com log.debug, log.info, log.aviso e log.erro, redacao central, nivel por LOG_LEVEL e correlacao por AsyncLocalStorage."
arquivos:
  cria: ["src/lib/log.ts", "tests/log.test.ts"]
  altera: ["src/lib/ambiente.ts", "tests/ambiente.test.ts"]
teste_integracao: "Cada chamada de log escreve uma unica linha JSON com nivel, quando, msg e os campos pelo console do nivel correspondente, e abaixo do nivel de LOG_LEVEL nao escreve nada."
teste_funcional: "Um evento com senha, token, chave, authorization, cookie, secret, texto de mensagem, e-mail, chave sk-, texto v1:, token de bot e JWT nao deixa nenhum desses valores na linha, o e-mail sai mascarado e um Error sai so com nome e codigo."
criterio_aceite: "tests/log.test.ts e tests/ambiente.test.ts passam e dentro de comCorrelacao a linha leva o campo correlacao."
depende_de: ["T-01.02"]
paralelizavel: false
status: pendente
```

