---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-07
atualizado_em: 2026-09-30
tasks:
  - id: T-07.01
    titulo: "Seed: fonte de exemplo ja processada"
    fase: F-07.1
    status: concluida
    objetivo: "Semear uma fonte de texto ficticia pronta no agente de exemplo pelo mesmo divisor e armazenamento."
    arquivos:
      cria: []
      altera: ["prisma/seed.ts", "tests/seed.test.ts"]
    teste_integracao: "A seed rodada duas vezes contra o banco de teste deixa uma so fonte no agente de exemplo, com status pronto, trechos gerados por dividirEmTrechos e arquivo original no STORAGE_DIR."
    teste_funcional: "A fonte semeada aparece em listar e resumo do servico, e a seed continua recusando NODE_ENV=production."
    criterio_aceite: "tests/seed.test.ts passa."
    depende_de: ["T-06.06"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-07.02
    titulo: "Verificacao visual da aba Conhecimento"
    fase: F-07.1
    status: concluida
    objetivo: "Abrir a aba nos dois temas com upload real de arquivo pequeno, ou registrar por que nao foi possivel."
    arquivos:
      cria: ["docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md"]
      altera: []
    teste_integracao: "O app roda com segredos inline e a ferramenta de navegador da sessao abre a aba e envia um arquivo pequeno, ou o registro diz que nao foi possivel."
    teste_funcional: "O registro traz, por tema, o que foi visto e o resultado do upload, sem declarar verificado o que nao se viu."
    criterio_aceite: "O arquivo existe e cita os temas claro e escuro, a largura de 375px e o resultado do upload."
    depende_de: ["T-07.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-07.03
    titulo: "Convencoes e lacunas com a evidencia nova"
    fase: F-07.1
    status: concluida
    objetivo: "Converter as lacunas 5 e 8 e o armazenamento em regras com arquivo e linha."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/rotas.test.ts"]
    teste_integracao: "Cada evidencia citada em CONVENCOES.md aponta para arquivo e linha existentes."
    teste_funcional: "A linha de tarefa em segundo plano cita src/servicos/fontes-fila.ts e src/instrumentation.ts, a de sistema de arquivos cita src/lib/armazenamento.ts e tests/setup.ts, e as lacunas 5 e 8 aparecem resolvidas."
    criterio_aceite: "grep das linhas citadas confirma cada referencia e o commit-referencia e atualizado."
    depende_de: ["T-07.02"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-07.04
    titulo: "Fechamento no laco do buildx"
    fase: F-07.2
    status: concluida
    objetivo: "Registrar a feature no mapa, premissas e recursao e conferir arquivos de ambiente e dependencias."
    arquivos:
      cria: ["docs/conhecimento-arquivos-e-texto/ORQUESTRADOR.md", "docs/conhecimento-arquivos-e-texto/00-AUDITORIA.md", "docs/conhecimento-arquivos-e-texto/FECHAMENTO.md", "docs/conhecimento-arquivos-e-texto/RELATORIO-FEATURE.md", "docs/conhecimento-arquivos-e-texto/BRIEFING-BUILDX.md", "docs/conhecimento-arquivos-e-texto/00-DECISOES.md", "docs/conhecimento-arquivos-e-texto/00-BLOQUEIOS.md", "docs/conhecimento-arquivos-e-texto/base/00-INDICE.md", "docs/conhecimento-arquivos-e-texto/base/00-LACUNAS.md", "docs/conhecimento-arquivos-e-texto/base/extracao-bibliotecas.md", "docs/conhecimento-arquivos-e-texto/base/banco-armazenamento-e-ambiente.md", "docs/conhecimento-arquivos-e-texto/base/servicos-handlers-e-fila.md", "docs/conhecimento-arquivos-e-texto/base/interface-do-agente-e-conhecimento.md", "docs/entregas/conhecimento-arquivos-e-texto/ENTREGA.md", "docs/entregas/conhecimento-arquivos-e-texto/PR.md", "docs/entregas/conhecimento-arquivos-e-texto/QA-PACOTE.md", "docs/entregas/conhecimento-arquivos-e-texto/ATENCAO.md", "docs/conhecimento-arquivos-e-texto/sprint-01/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-01/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-02/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-02/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-03/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-03/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-04/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-04/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-05/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-05/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-06/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-06/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-07/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-07/fases.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts", "docs/conhecimento-arquivos-e-texto/sprint-01/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-02/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-03/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-04/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-05/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-06/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-07/tasks.md", "docs/projeto/PROJETO.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra FT-04 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-45 a PR-49 com total 49, e o README documenta STORAGE_DIR, MAX_UPLOAD_MB e a aba Conhecimento."
    criterio_aceite: "grep de FT-04 no painel do MAPA.md devolve entregue e o total de premissas do frontmatter e 49."
    depende_de: ["T-07.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
---

# Tasks — Sprint 07

> Um bloco por task.

---

```yaml
id: T-07.01
titulo: Seed: fonte de exemplo ja processada
objetivo: Semear uma fonte de texto ficticia pronta no agente de exemplo pelo mesmo divisor e armazenamento.
arquivos:
  cria: []
  altera: ["prisma/seed.ts", "tests/seed.test.ts"]
teste_integracao: A seed rodada duas vezes contra o banco de teste deixa uma so fonte no agente de exemplo, com status pronto, trechos gerados por dividirEmTrechos e arquivo original no STORAGE_DIR.
teste_funcional: A fonte semeada aparece em listar e resumo do servico, e a seed continua recusando NODE_ENV=production.
criterio_aceite: tests/seed.test.ts passa.
depende_de: ["T-06.06"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 890 passed 890, 0 failed
```

---

```yaml
id: T-07.02
titulo: Verificacao visual da aba Conhecimento
objetivo: Abrir a aba nos dois temas com upload real de arquivo pequeno, ou registrar por que nao foi possivel.
arquivos:
  cria: ["docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md"]
  altera: []
teste_integracao: O app roda com segredos inline e a ferramenta de navegador da sessao abre a aba e envia um arquivo pequeno, ou o registro diz que nao foi possivel.
teste_funcional: O registro traz, por tema, o que foi visto e o resultado do upload, sem declarar verificado o que nao se viu.
criterio_aceite: O arquivo existe e cita os temas claro e escuro, a largura de 375px e o resultado do upload.
depende_de: ["T-07.01"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 890 passed, 0 failed
```

---

```yaml
id: T-07.03
titulo: Convencoes e lacunas com a evidencia nova
objetivo: Converter as lacunas 5 e 8 e o armazenamento em regras com arquivo e linha.
arquivos:
  cria: []
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/rotas.test.ts"]
teste_integracao: Cada evidencia citada em CONVENCOES.md aponta para arquivo e linha existentes.
teste_funcional: A linha de tarefa em segundo plano cita src/servicos/fontes-fila.ts e src/instrumentation.ts, a de sistema de arquivos cita src/lib/armazenamento.ts e tests/setup.ts, e as lacunas 5 e 8 aparecem resolvidas.
criterio_aceite: grep das linhas citadas confirma cada referencia e o commit-referencia e atualizado.
depende_de: ["T-07.02"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 890 passed 890, 0 failed
```

---

```yaml
id: T-07.04
titulo: Fechamento no laco do buildx
objetivo: Registrar a feature no mapa, premissas e recursao e conferir arquivos de ambiente e dependencias.
arquivos:
  cria: ["docs/conhecimento-arquivos-e-texto/ORQUESTRADOR.md", "docs/conhecimento-arquivos-e-texto/00-AUDITORIA.md", "docs/conhecimento-arquivos-e-texto/FECHAMENTO.md", "docs/conhecimento-arquivos-e-texto/RELATORIO-FEATURE.md", "docs/conhecimento-arquivos-e-texto/BRIEFING-BUILDX.md", "docs/conhecimento-arquivos-e-texto/00-DECISOES.md", "docs/conhecimento-arquivos-e-texto/00-BLOQUEIOS.md", "docs/conhecimento-arquivos-e-texto/base/00-INDICE.md", "docs/conhecimento-arquivos-e-texto/base/00-LACUNAS.md", "docs/conhecimento-arquivos-e-texto/base/extracao-bibliotecas.md", "docs/conhecimento-arquivos-e-texto/base/banco-armazenamento-e-ambiente.md", "docs/conhecimento-arquivos-e-texto/base/servicos-handlers-e-fila.md", "docs/conhecimento-arquivos-e-texto/base/interface-do-agente-e-conhecimento.md", "docs/entregas/conhecimento-arquivos-e-texto/ENTREGA.md", "docs/entregas/conhecimento-arquivos-e-texto/PR.md", "docs/entregas/conhecimento-arquivos-e-texto/QA-PACOTE.md", "docs/entregas/conhecimento-arquivos-e-texto/ATENCAO.md", "docs/conhecimento-arquivos-e-texto/sprint-01/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-01/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-02/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-02/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-03/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-03/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-04/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-04/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-05/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-05/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-06/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-06/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-07/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-07/fases.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts", "docs/conhecimento-arquivos-e-texto/sprint-01/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-02/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-03/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-04/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-05/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-06/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-07/tasks.md", "docs/projeto/PROJETO.md"]
teste_integracao: Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel.
teste_funcional: O MAPA.md mostra FT-04 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-45 a PR-49 com total 49, e o README documenta STORAGE_DIR, MAX_UPLOAD_MB e a aba Conhecimento.
criterio_aceite: grep de FT-04 no painel do MAPA.md devolve entregue e o total de premissas do frontmatter e 49.
depende_de: ["T-07.03"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 891 passed, 0 failed
```
