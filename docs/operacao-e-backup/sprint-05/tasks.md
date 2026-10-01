---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-05
atualizado_em: 2026-10-01
tasks:
  - id: T-05.01
    titulo: "gerarBackup: copia consistente, manifest e arquivo unico"
    fase: F-05.1
    status: pendente
    objetivo: "Criar src/lib/backup.ts com a copia do banco pela API online, a conferencia de integridade, o manifest com SHA-256 e o empacotamento em .tar.gz."
    arquivos:
      cria: ["src/lib/backup.ts", "tests/backup-lib.test.ts", "docs/operacao-e-backup/sprint-05/sprint.md", "docs/operacao-e-backup/sprint-05/fases.md", "docs/operacao-e-backup/sprint-05/tasks.md"]
      altera: []
    teste_integracao: "gerarBackup sobre um banco migrado com dados e um storage com arquivos produz um unico arquivo backup-AAAAMMDD-HHMMSS.tar.gz que extraido tem manifest.json, banco/app.db e storage/ com os arquivos."
    teste_funcional: "O manifest traz formato, data, versao do app, migrations, contagem por tabela e SHA-256 de cada parte que conferem com o conteudo extraido, e o banco extraido abre, passa no integrity_check e tem as mesmas linhas."
    criterio_aceite: "tests/backup-lib.test.ts passa e nenhum processo de shell e usado."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.02
    titulo: "Backup sem temporarios, com permissao 0600 e retencao"
    fase: F-05.1
    status: pendente
    objetivo: "Excluir audio, segmentos e arquivos parcial do backup, gravar o arquivo com modo 0600 por arquivo parcial e renomeacao e aplicar BACKUP_MANTER so aos nomes do padrao."
    arquivos:
      cria: ["tests/backup-retencao.test.ts"]
      altera: ["src/lib/backup.ts", "tests/backup-lib.test.ts"]
    teste_integracao: "Um storage com original, audio, segmentos e original.parcial gera um backup que contem so o original, o arquivo final tem modo 0600 e nenhum arquivo parcial ou diretorio de trabalho sobra em BACKUP_DIR."
    teste_funcional: "Com BACKUP_MANTER 2 e cinco backups do padrao mais um arquivo e uma pasta pre-restauracao de outro nome, sobram os dois mais recentes do padrao e os outros itens ficam intactos."
    criterio_aceite: "tests/backup-lib.test.ts e tests/backup-retencao.test.ts passam e uma falha no meio da geracao nao deixa arquivo parcial."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.03
    titulo: "Acao de auditoria backup_gerado"
    fase: F-05.2
    status: pendente
    objetivo: "Acrescentar backup_gerado ao conjunto fechado de acoes com as chaves origem, bytes e arquivos e a frase na tela de Auditoria."
    arquivos:
      cria: []
      altera: ["src/servicos/auditoria-acoes.ts", "src/componentes/auditoria-logica.ts", "tests/auditoria-acoes.test.ts", "tests/auditoria-logica.test.ts", "tests/auditoria.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "registrar aceita backup_gerado com origem, bytes e arquivos, recusa chave de detalhe fora da lista e o filtro de acoes da tela inclui Backup gerado."
    teste_funcional: "descreverRegistro de backup_gerado com origem tela devolve a frase Gerou um backup do banco e dos arquivos pela tela e o conjunto fechado tem 19 acoes."
    criterio_aceite: "tests/auditoria-acoes.test.ts, tests/auditoria-logica.test.ts e tests/auditoria.test.ts passam."
    depende_de: ["T-05.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.04
    titulo: "Servico de backup: gerar, listar e localizar"
    fase: F-05.2
    status: pendente
    objetivo: "Criar src/servicos/backup.ts com gerarBackupAgora, listarBackups e caminhoDoBackup, exigindo admin e auditando."
    arquivos:
      cria: ["src/servicos/backup.ts", "tests/backup-servico.test.ts"]
      altera: []
    teste_integracao: "gerarBackupAgora para um admin cria o arquivo em BACKUP_DIR, devolve nome, tamanho e data e grava a auditoria backup_gerado com origem e bytes e sem nome de arquivo, e listarBackups lista so os arquivos do padrao do mais novo ao mais antigo."
    teste_funcional: "Usuario comum recebe 403, duas geracoes ao mesmo tempo dao 409 na segunda, e caminhoDoBackup recusa nome fora do padrao, com barra, com .. e link simbolico."
    criterio_aceite: "tests/backup-servico.test.ts passa."
    depende_de: ["T-05.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.05
    titulo: "Comando npm run backup"
    fase: F-05.2
    status: pendente
    objetivo: "Criar scripts/backup.ts que le o ambiente, gera o backup pelo mesmo servico com origem linha de comando e imprime o resumo."
    arquivos:
      cria: ["scripts/backup.ts", "tests/backup-comando.test.ts"]
      altera: ["package.json", "eslint.config.mjs"]
    teste_integracao: "O comando executado como processo filho com DATABASE_URL, STORAGE_DIR e BACKUP_DIR de teste cria o arquivo, imprime nome e tamanho e sai com 0, e a auditoria backup_gerado fica com origem linha de comando."
    teste_funcional: "Sem DATABASE_URL ou com BACKUP_DIR sem permissao de escrita o comando sai com codigo diferente de zero e mensagem clara sem pilha."
    criterio_aceite: "tests/backup-comando.test.ts passa e package.json tem o script backup."
    depende_de: ["T-05.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.06
    titulo: "Download autenticado do backup"
    fase: F-05.3
    status: pendente
    objetivo: "Criar a rota GET /api/backups/[nome] que entrega o arquivo do BACKUP_DIR ao admin com cabecalhos seguros."
    arquivos:
      cria: ["src/app/api/backups/[nome]/route.ts", "tests/backups-rota.test.ts"]
      altera: []
    teste_integracao: "Contra o servidor de producao, admin autenticado baixa um backup existente com 200, Content-Type application/gzip, Content-Disposition attachment com o nome do arquivo, Content-Length igual ao tamanho, no-store e nosniff, e os bytes batem."
    teste_funcional: "Sem sessao a rota responde 401 em JSON, usuario comum 403, nome inexistente 404 e nome com .. ou barra codificada 404 sem ler arquivo fora do BACKUP_DIR."
    criterio_aceite: "tests/backups-rota.test.ts passa."
    depende_de: ["T-05.05"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.07
    titulo: "Gerar, listar e baixar backup na tela Sistema"
    fase: F-05.3
    status: pendente
    objetivo: "Acrescentar ao cartao Backup o botao Gerar backup agora, a lista com nome, data e tamanho, o link de download e o aviso destacado sobre a ENCRYPTION_KEY, e o ultimo backup nos dados do sistema."
    arquivos:
      cria: ["src/componentes/GeradorDeBackup.tsx", "src/componentes/ListaDeBackups.tsx", "tests/backup-ui.test.tsx", "tests/backup-acao.test.ts"]
      altera: ["src/app/acoes.ts", "src/servicos/sistema.ts", "src/componentes/PainelDoSistema.tsx", "src/componentes/sistema-logica.ts", "src/estilos/global.css", "tests/sistema.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "A acao de servidor gerarBackupAgoraAcao para um admin cria o backup e devolve o estado de sucesso com o nome, para usuario comum devolve erro sem criar arquivo, e obterSistema passa a trazer o ultimo backup."
    teste_funcional: "A lista renderizada mostra nome, data e tamanho com o link de download de cada backup, o estado vazio e o aviso de que a ENCRYPTION_KEY nao esta no backup aparecem no HTML e o botao tem alvo de 44 px."
    criterio_aceite: "tests/backup-ui.test.tsx, tests/backup-acao.test.ts e tests/sistema.test.ts passam."
    depende_de: ["T-05.06"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 05

---

```yaml
id: T-05.01
titulo: "gerarBackup: copia consistente, manifest e arquivo unico"
objetivo: "Criar src/lib/backup.ts com a copia do banco pela API online, a conferencia de integridade, o manifest com SHA-256 e o empacotamento em .tar.gz."
arquivos:
  cria: ["src/lib/backup.ts", "tests/backup-lib.test.ts", "docs/operacao-e-backup/sprint-05/sprint.md", "docs/operacao-e-backup/sprint-05/fases.md", "docs/operacao-e-backup/sprint-05/tasks.md"]
  altera: []
teste_integracao: "gerarBackup sobre um banco migrado com dados e um storage com arquivos produz um unico arquivo backup-AAAAMMDD-HHMMSS.tar.gz que extraido tem manifest.json, banco/app.db e storage/ com os arquivos."
teste_funcional: "O manifest traz formato, data, versao do app, migrations, contagem por tabela e SHA-256 de cada parte que conferem com o conteudo extraido, e o banco extraido abre, passa no integrity_check e tem as mesmas linhas."
criterio_aceite: "tests/backup-lib.test.ts passa e nenhum processo de shell e usado."
depende_de: ["T-04.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.02
titulo: "Backup sem temporarios, com permissao 0600 e retencao"
objetivo: "Excluir audio, segmentos e arquivos parcial do backup, gravar o arquivo com modo 0600 por arquivo parcial e renomeacao e aplicar BACKUP_MANTER so aos nomes do padrao."
arquivos:
  cria: ["tests/backup-retencao.test.ts"]
  altera: ["src/lib/backup.ts", "tests/backup-lib.test.ts"]
teste_integracao: "Um storage com original, audio, segmentos e original.parcial gera um backup que contem so o original, o arquivo final tem modo 0600 e nenhum arquivo parcial ou diretorio de trabalho sobra em BACKUP_DIR."
teste_funcional: "Com BACKUP_MANTER 2 e cinco backups do padrao mais um arquivo e uma pasta pre-restauracao de outro nome, sobram os dois mais recentes do padrao e os outros itens ficam intactos."
criterio_aceite: "tests/backup-lib.test.ts e tests/backup-retencao.test.ts passam e uma falha no meio da geracao nao deixa arquivo parcial."
depende_de: ["T-05.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.03
titulo: "Acao de auditoria backup_gerado"
objetivo: "Acrescentar backup_gerado ao conjunto fechado de acoes com as chaves origem, bytes e arquivos e a frase na tela de Auditoria."
arquivos:
  cria: []
  altera: ["src/servicos/auditoria-acoes.ts", "src/componentes/auditoria-logica.ts", "tests/auditoria-acoes.test.ts", "tests/auditoria-logica.test.ts", "tests/auditoria.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "registrar aceita backup_gerado com origem, bytes e arquivos, recusa chave de detalhe fora da lista e o filtro de acoes da tela inclui Backup gerado."
teste_funcional: "descreverRegistro de backup_gerado com origem tela devolve a frase Gerou um backup do banco e dos arquivos pela tela e o conjunto fechado tem 19 acoes."
criterio_aceite: "tests/auditoria-acoes.test.ts, tests/auditoria-logica.test.ts e tests/auditoria.test.ts passam."
depende_de: ["T-05.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.04
titulo: "Servico de backup: gerar, listar e localizar"
objetivo: "Criar src/servicos/backup.ts com gerarBackupAgora, listarBackups e caminhoDoBackup, exigindo admin e auditando."
arquivos:
  cria: ["src/servicos/backup.ts", "tests/backup-servico.test.ts"]
  altera: []
teste_integracao: "gerarBackupAgora para um admin cria o arquivo em BACKUP_DIR, devolve nome, tamanho e data e grava a auditoria backup_gerado com origem e bytes e sem nome de arquivo, e listarBackups lista so os arquivos do padrao do mais novo ao mais antigo."
teste_funcional: "Usuario comum recebe 403, duas geracoes ao mesmo tempo dao 409 na segunda, e caminhoDoBackup recusa nome fora do padrao, com barra, com .. e link simbolico."
criterio_aceite: "tests/backup-servico.test.ts passa."
depende_de: ["T-05.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.05
titulo: "Comando npm run backup"
objetivo: "Criar scripts/backup.ts que le o ambiente, gera o backup pelo mesmo servico com origem linha de comando e imprime o resumo."
arquivos:
  cria: ["scripts/backup.ts", "tests/backup-comando.test.ts"]
  altera: ["package.json", "eslint.config.mjs"]
teste_integracao: "O comando executado como processo filho com DATABASE_URL, STORAGE_DIR e BACKUP_DIR de teste cria o arquivo, imprime nome e tamanho e sai com 0, e a auditoria backup_gerado fica com origem linha de comando."
teste_funcional: "Sem DATABASE_URL ou com BACKUP_DIR sem permissao de escrita o comando sai com codigo diferente de zero e mensagem clara sem pilha."
criterio_aceite: "tests/backup-comando.test.ts passa e package.json tem o script backup."
depende_de: ["T-05.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.06
titulo: "Download autenticado do backup"
objetivo: "Criar a rota GET /api/backups/[nome] que entrega o arquivo do BACKUP_DIR ao admin com cabecalhos seguros."
arquivos:
  cria: ["src/app/api/backups/[nome]/route.ts", "tests/backups-rota.test.ts"]
  altera: []
teste_integracao: "Contra o servidor de producao, admin autenticado baixa um backup existente com 200, Content-Type application/gzip, Content-Disposition attachment com o nome do arquivo, Content-Length igual ao tamanho, no-store e nosniff, e os bytes batem."
teste_funcional: "Sem sessao a rota responde 401 em JSON, usuario comum 403, nome inexistente 404 e nome com .. ou barra codificada 404 sem ler arquivo fora do BACKUP_DIR."
criterio_aceite: "tests/backups-rota.test.ts passa."
depende_de: ["T-05.05"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.07
titulo: "Gerar, listar e baixar backup na tela Sistema"
objetivo: "Acrescentar ao cartao Backup o botao Gerar backup agora, a lista com nome, data e tamanho, o link de download e o aviso destacado sobre a ENCRYPTION_KEY, e o ultimo backup nos dados do sistema."
arquivos:
  cria: ["src/componentes/GeradorDeBackup.tsx", "src/componentes/ListaDeBackups.tsx", "tests/backup-ui.test.tsx", "tests/backup-acao.test.ts"]
  altera: ["src/app/acoes.ts", "src/servicos/sistema.ts", "src/componentes/PainelDoSistema.tsx", "src/componentes/sistema-logica.ts", "src/estilos/global.css", "tests/sistema.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "A acao de servidor gerarBackupAgoraAcao para um admin cria o backup e devolve o estado de sucesso com o nome, para usuario comum devolve erro sem criar arquivo, e obterSistema passa a trazer o ultimo backup."
teste_funcional: "A lista renderizada mostra nome, data e tamanho com o link de download de cada backup, o estado vazio e o aviso de que a ENCRYPTION_KEY nao esta no backup aparecem no HTML e o botao tem alvo de 44 px."
criterio_aceite: "tests/backup-ui.test.tsx, tests/backup-acao.test.ts e tests/sistema.test.ts passam."
depende_de: ["T-05.06"]
paralelizavel: false
status: pendente
```

