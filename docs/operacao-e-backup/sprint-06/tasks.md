---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-06
atualizado_em: 2026-10-01
tasks:
  - id: T-06.01
    titulo: "Validacao do backup antes de tocar na instalacao"
    fase: F-06.1
    status: concluida
    objetivo: "Criar src/lib/restauracao.ts com a extracao segura para diretorio temporario, a conferencia do manifest e dos SHA-256 e a comparacao de esquema."
    arquivos:
      cria: ["src/lib/restauracao.ts", "tests/restauracao-validacao.test.ts", "docs/operacao-e-backup/sprint-06/sprint.md", "docs/operacao-e-backup/sprint-06/fases.md", "docs/operacao-e-backup/sprint-06/tasks.md", "tests/apoio/backups-de-teste.ts"]
      altera: []
    teste_integracao: "lerEValidarBackup sobre um backup gerado extrai para o diretorio temporario, devolve o manifest validado e a posicao de cada parte, e compararEsquema devolve igual para o mesmo conjunto de migrations e mais_antigo para um prefixo."
    teste_funcional: "Arquivo adulterado (um byte do banco), sem manifest, truncado, com parte extra fora do manifesto, com caminho ../ ou absoluto e com link simbolico sao recusados com mensagem clara e esquema com migration desconhecida devolve mais_novo."
    criterio_aceite: "tests/restauracao-validacao.test.ts passa e a instalacao de destino nao e tocada em nenhum caso de recusa."
    depende_de: ["T-05.07"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.02
    titulo: "Troca de banco e storage com copia pre-restauracao e desfazer"
    fase: F-06.1
    status: concluida
    objetivo: "Acrescentar a restauracao dos arquivos: copia consistente do estado atual em pre-restauracao, troca por renomeacao no mesmo volume e desfazer quando algo falha no meio."
    arquivos:
      cria: ["tests/restauracao-troca.test.ts"]
      altera: ["src/lib/restauracao.ts"]
    teste_integracao: "restaurarArquivos com um backup valido deixa em BACKUP_DIR/pre-restauracao-<data> o banco anterior e o storage anterior e coloca o banco e o storage do backup no destino, removendo sobras de -journal e -wal."
    teste_funcional: "Uma falha simulada na troca do storage devolve o banco e o storage anteriores ao lugar e uma instalacao vazia (sem banco nem storage) restaura sem cópia previa."
    criterio_aceite: "tests/restauracao-troca.test.ts passa e o diretorio temporario de extracao nao sobra."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.03
    titulo: "Comando npm run restore"
    fase: F-06.2
    status: concluida
    objetivo: "Criar scripts/restore.ts que recusa rodar com o servidor de pe, valida, restaura, aplica migrations se o esquema for mais antigo, reconstroi o FTS5, grava a auditoria no banco restaurado e imprime o resumo."
    arquivos:
      cria: ["scripts/restore.ts", "tests/restauracao-comando.test.ts"]
      altera: ["package.json", "README.md", "src/lib/restauracao.ts", "tests/restauracao-validacao.test.ts"]
    teste_integracao: "O comando executado como processo filho com diretorios temporarios restaura um backup valido, aplica migrate deploy quando o backup e de esquema mais antigo, imprime o resumo com o aviso sobre a ENCRYPTION_KEY e termina com 0."
    teste_funcional: "Com um servidor respondendo em /api/saude na URL local o comando recusa sem tocar em nada e com --forcar prossegue, e sem argumento ou com arquivo inexistente sai com codigo diferente de zero e mensagem clara."
    criterio_aceite: "tests/restauracao-comando.test.ts passa e package.json tem o script restore."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.04
    titulo: "Teste fim a fim da restauracao numa instalacao limpa (PR-20)"
    fase: F-06.2
    status: concluida
    objetivo: "Provar que backup e restauracao devolvem os dados: monta a instalacao, gera o backup, destroi, restaura em diretorios limpos pelo comando e confere linha a linha."
    arquivos:
      cria: ["tests/restauracao-fim-a-fim.test.ts"]
      altera: ["tests/apoio/instalacao.ts"]
    teste_integracao: "Depois de destruir e alterar a instalacao, o comando restore em diretorios limpos devolve cada tabela igual ao retrato de antes do backup, a busca FTS responde com os mesmos trechos e o original esta no storage restaurado."
    teste_funcional: "Os temporarios audio, segmentos e original.parcial ficaram de fora, a auditoria tem a entrada restauracao, e o token cifrado do Telegram e a chave do OpenRouter decifram com a mesma ENCRYPTION_KEY no banco restaurado."
    criterio_aceite: "tests/restauracao-fim-a-fim.test.ts passa sem tocar em prisma/dev.db nem em ./storage."
    depende_de: ["T-06.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.05
    titulo: "Casos de recusa da restauracao pelo comando"
    fase: F-06.2
    status: pendente
    objetivo: "Provar pelo comando que arquivo adulterado, sem manifest, de esquema mais novo, truncado e BACKUP_DIR sem permissao sao recusados sem alterar a instalacao."
    arquivos:
      cria: ["tests/restauracao-recusas.test.ts"]
      altera: []
    teste_integracao: "Para cada um dos cinco casos o comando sai com codigo diferente de zero, imprime o motivo e o banco e o storage de destino ficam byte a byte iguais ao antes."
    teste_funcional: "O caso de BACKUP_DIR sem permissao de escrita impede a copia pre-restauracao e nada e trocado, e o teste e pulado de forma declarada quando roda como root."
    criterio_aceite: "tests/restauracao-recusas.test.ts passa."
    depende_de: ["T-06.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

---

```yaml
id: T-06.01
titulo: "Validacao do backup antes de tocar na instalacao"
objetivo: "Criar src/lib/restauracao.ts com a extracao segura para diretorio temporario, a conferencia do manifest e dos SHA-256 e a comparacao de esquema."
arquivos:
  cria: ["src/lib/restauracao.ts", "tests/restauracao-validacao.test.ts", "docs/operacao-e-backup/sprint-06/sprint.md", "docs/operacao-e-backup/sprint-06/fases.md", "docs/operacao-e-backup/sprint-06/tasks.md", "tests/apoio/backups-de-teste.ts"]
  altera: []
teste_integracao: "lerEValidarBackup sobre um backup gerado extrai para o diretorio temporario, devolve o manifest validado e a posicao de cada parte, e compararEsquema devolve igual para o mesmo conjunto de migrations e mais_antigo para um prefixo."
teste_funcional: "Arquivo adulterado (um byte do banco), sem manifest, truncado, com parte extra fora do manifesto, com caminho ../ ou absoluto e com link simbolico sao recusados com mensagem clara e esquema com migration desconhecida devolve mais_novo."
criterio_aceite: "tests/restauracao-validacao.test.ts passa e a instalacao de destino nao e tocada em nenhum caso de recusa."
depende_de: ["T-05.07"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/restauracao-validacao.test.ts 16 passed (3 rodadas estáveis); arquivos novos; a troca (restaurarArquivos) já está no mesmo módulo e é testada na T-06.02
```

---

```yaml
id: T-06.02
titulo: "Troca de banco e storage com copia pre-restauracao e desfazer"
objetivo: "Acrescentar a restauracao dos arquivos: copia consistente do estado atual em pre-restauracao, troca por renomeacao no mesmo volume e desfazer quando algo falha no meio."
arquivos:
  cria: ["tests/restauracao-troca.test.ts"]
  altera: ["src/lib/restauracao.ts"]
teste_integracao: "restaurarArquivos com um backup valido deixa em BACKUP_DIR/pre-restauracao-<data> o banco anterior e o storage anterior e coloca o banco e o storage do backup no destino, removendo sobras de -journal e -wal."
teste_funcional: "Uma falha simulada na troca do storage devolve o banco e o storage anteriores ao lugar e uma instalacao vazia (sem banco nem storage) restaura sem cópia previa."
criterio_aceite: "tests/restauracao-troca.test.ts passa e o diretorio temporario de extracao nao sobra."
depende_de: ["T-06.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/restauracao-troca.test.ts e tests/restauracao-validacao.test.ts passam (22); achado: duas restaurações no mesmo segundo colidiam no nome de pre-restauracao, agora com sufixo; a troca entre volumes (EXDEV) só tem o caminho de cópia, não exercitado
```

---

```yaml
id: T-06.03
titulo: "Comando npm run restore"
objetivo: "Criar scripts/restore.ts que recusa rodar com o servidor de pe, valida, restaura, aplica migrations se o esquema for mais antigo, reconstroi o FTS5, grava a auditoria no banco restaurado e imprime o resumo."
arquivos:
  cria: ["scripts/restore.ts", "tests/restauracao-comando.test.ts"]
  altera: ["package.json", "README.md", "src/lib/restauracao.ts", "tests/restauracao-validacao.test.ts"]
teste_integracao: "O comando executado como processo filho com diretorios temporarios restaura um backup valido, aplica migrate deploy quando o backup e de esquema mais antigo, imprime o resumo com o aviso sobre a ENCRYPTION_KEY e termina com 0."
teste_funcional: "Com um servidor respondendo em /api/saude na URL local o comando recusa sem tocar em nada e com --forcar prossegue, e sem argumento ou com arquivo inexistente sai com codigo diferente de zero e mensagem clara."
criterio_aceite: "tests/restauracao-comando.test.ts passa e package.json tem o script restore."
depende_de: ["T-06.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/restauracao-comando.test.ts 9 passed (inclui backup de esquema mais antigo com prisma migrate deploy real), tests/projeto.test.ts verde
```

---

```yaml
id: T-06.04
titulo: "Teste fim a fim da restauracao numa instalacao limpa (PR-20)"
objetivo: "Provar que backup e restauracao devolvem os dados: monta a instalacao, gera o backup, destroi, restaura em diretorios limpos pelo comando e confere linha a linha."
arquivos:
  cria: ["tests/restauracao-fim-a-fim.test.ts"]
  altera: ["tests/apoio/instalacao.ts"]
teste_integracao: "Depois de destruir e alterar a instalacao, o comando restore em diretorios limpos devolve cada tabela igual ao retrato de antes do backup, a busca FTS responde com os mesmos trechos e o original esta no storage restaurado."
teste_funcional: "Os temporarios audio, segmentos e original.parcial ficaram de fora, a auditoria tem a entrada restauracao, e o token cifrado do Telegram e a chave do OpenRouter decifram com a mesma ENCRYPTION_KEY no banco restaurado."
criterio_aceite: "tests/restauracao-fim-a-fim.test.ts passa sem tocar em prisma/dev.db nem em ./storage."
depende_de: ["T-06.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/restauracao-fim-a-fim.test.ts 2 passed; mutação (temporários incluídos no backup) provou que o teste falha com implementação errada
```

---

```yaml
id: T-06.05
titulo: "Casos de recusa da restauracao pelo comando"
objetivo: "Provar pelo comando que arquivo adulterado, sem manifest, de esquema mais novo, truncado e BACKUP_DIR sem permissao sao recusados sem alterar a instalacao."
arquivos:
  cria: ["tests/restauracao-recusas.test.ts"]
  altera: []
teste_integracao: "Para cada um dos cinco casos o comando sai com codigo diferente de zero, imprime o motivo e o banco e o storage de destino ficam byte a byte iguais ao antes."
teste_funcional: "O caso de BACKUP_DIR sem permissao de escrita impede a copia pre-restauracao e nada e trocado, e o teste e pulado de forma declarada quando roda como root."
criterio_aceite: "tests/restauracao-recusas.test.ts passa."
depende_de: ["T-06.04"]
paralelizavel: false
status: pendente
```

