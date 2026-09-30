---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-06
atualizado_em: 2026-09-30
tasks:
  - id: T-06.01
    titulo: "Convencoes e lacunas com evidencia"
    fase: F-06.1
    status: pendente
    objetivo: "Registrar em CONVENCOES.md e LACUNAS.md o SQL cru para FTS5 e a regra de texto do usuario nunca concatenado em SQL, com arquivo:linha."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
    teste_integracao: "Cada arquivo:linha citado para a busca textual existe no repositorio e a linha contem o trecho de codigo descrito."
    teste_funcional: "CONVENCOES.md tem a regra 'texto do usuario nunca concatenado em SQL' citando src/servicos/recuperacao.ts e a migration, e LACUNAS.md registra as lacunas novas."
    criterio_aceite: "tests/projeto.test.ts passa com a conferencia das duas citacoes."
    depende_de: ["T-05.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.02
    titulo: "README e verificacao visual"
    fase: F-06.1
    status: pendente
    objetivo: "Documentar a busca no README e verificar visualmente a aba Testar com fontes e o cartao Testar busca nos dois temas."
    arquivos:
      cria: ["docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md"]
      altera: ["README.md", "tests/projeto.test.ts"]
    teste_integracao: "Com OpenRouter falso local e a seed, a aba Testar mostra Fontes e o cartao mostra resultados nos temas claro e escuro, ou o impedimento fica registrado."
    teste_funcional: "README cita a aba Conhecimento com Testar busca e a recuperacao por FTS5, conferido por tests/projeto.test.ts."
    criterio_aceite: "tests/projeto.test.ts passa e VERIFICACAO-VISUAL.md existe."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.03
    titulo: "Fechamento no laco do buildx"
    fase: F-06.2
    status: pendente
    objetivo: "Registrar a feature no mapa, nas premissas e na recursao e conferir ambiente e dependencias."
    arquivos:
      cria: ["docs/respostas-com-conhecimento/ORQUESTRADOR.md", "docs/respostas-com-conhecimento/00-AUDITORIA.md", "docs/respostas-com-conhecimento/FECHAMENTO.md", "docs/respostas-com-conhecimento/RELATORIO-FEATURE.md", "docs/respostas-com-conhecimento/BRIEFING-BUILDX.md", "docs/respostas-com-conhecimento/00-DECISOES.md", "docs/respostas-com-conhecimento/00-BLOQUEIOS.md", "docs/respostas-com-conhecimento/base/00-INDICE.md", "docs/respostas-com-conhecimento/base/00-LACUNAS.md", "docs/respostas-com-conhecimento/base/fts5-e-migration.md", "docs/respostas-com-conhecimento/base/turno-de-chat-e-sse.md", "docs/respostas-com-conhecimento/base/interface-testar-e-conhecimento.md", "docs/entregas/respostas-com-conhecimento/ENTREGA.md", "docs/entregas/respostas-com-conhecimento/PR.md", "docs/entregas/respostas-com-conhecimento/QA-PACOTE.md", "docs/entregas/respostas-com-conhecimento/ATENCAO.md", "docs/respostas-com-conhecimento/sprint-06/sprint.md", "docs/respostas-com-conhecimento/sprint-06/fases.md", "docs/respostas-com-conhecimento/sprint-06/tasks.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "tests/projeto.test.ts", "docs/respostas-com-conhecimento/sprint-01/sprint.md", "docs/respostas-com-conhecimento/sprint-01/fases.md", "docs/respostas-com-conhecimento/sprint-01/tasks.md", "docs/respostas-com-conhecimento/sprint-02/sprint.md", "docs/respostas-com-conhecimento/sprint-02/fases.md", "docs/respostas-com-conhecimento/sprint-02/tasks.md", "docs/respostas-com-conhecimento/sprint-03/sprint.md", "docs/respostas-com-conhecimento/sprint-03/fases.md", "docs/respostas-com-conhecimento/sprint-03/tasks.md", "docs/respostas-com-conhecimento/sprint-04/sprint.md", "docs/respostas-com-conhecimento/sprint-04/fases.md", "docs/respostas-com-conhecimento/sprint-04/tasks.md", "docs/respostas-com-conhecimento/sprint-05/sprint.md", "docs/respostas-com-conhecimento/sprint-05/fases.md", "docs/respostas-com-conhecimento/sprint-05/tasks.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra a FT-05 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-50 a PR-54 com total 54 e realizada em FT-05 para PR-04, PR-15 e PR-30."
    criterio_aceite: "grep de FT-05 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 54 e tests/projeto.test.ts passa."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

> Um bloco por task.

---

```yaml
id: T-06.01
titulo: Convencoes e lacunas com evidencia
objetivo: Registrar em CONVENCOES.md e LACUNAS.md o SQL cru para FTS5 e a regra de texto do usuario nunca concatenado em SQL, com arquivo:linha.
arquivos:
  cria: []
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
teste_integracao: Cada arquivo:linha citado para a busca textual existe no repositorio e a linha contem o trecho de codigo descrito.
teste_funcional: CONVENCOES.md tem a regra 'texto do usuario nunca concatenado em SQL' citando src/servicos/recuperacao.ts e a migration, e LACUNAS.md registra as lacunas novas.
criterio_aceite: tests/projeto.test.ts passa com a conferencia das duas citacoes.
depende_de: ["T-05.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.02
titulo: README e verificacao visual
objetivo: Documentar a busca no README e verificar visualmente a aba Testar com fontes e o cartao Testar busca nos dois temas.
arquivos:
  cria: ["docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md"]
  altera: ["README.md", "tests/projeto.test.ts"]
teste_integracao: Com OpenRouter falso local e a seed, a aba Testar mostra Fontes e o cartao mostra resultados nos temas claro e escuro, ou o impedimento fica registrado.
teste_funcional: README cita a aba Conhecimento com Testar busca e a recuperacao por FTS5, conferido por tests/projeto.test.ts.
criterio_aceite: tests/projeto.test.ts passa e VERIFICACAO-VISUAL.md existe.
depende_de: ["T-06.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.03
titulo: Fechamento no laco do buildx
objetivo: Registrar a feature no mapa, nas premissas e na recursao e conferir ambiente e dependencias.
arquivos:
  cria: ["docs/respostas-com-conhecimento/ORQUESTRADOR.md", "docs/respostas-com-conhecimento/00-AUDITORIA.md", "docs/respostas-com-conhecimento/FECHAMENTO.md", "docs/respostas-com-conhecimento/RELATORIO-FEATURE.md", "docs/respostas-com-conhecimento/BRIEFING-BUILDX.md", "docs/respostas-com-conhecimento/00-DECISOES.md", "docs/respostas-com-conhecimento/00-BLOQUEIOS.md", "docs/respostas-com-conhecimento/base/00-INDICE.md", "docs/respostas-com-conhecimento/base/00-LACUNAS.md", "docs/respostas-com-conhecimento/base/fts5-e-migration.md", "docs/respostas-com-conhecimento/base/turno-de-chat-e-sse.md", "docs/respostas-com-conhecimento/base/interface-testar-e-conhecimento.md", "docs/entregas/respostas-com-conhecimento/ENTREGA.md", "docs/entregas/respostas-com-conhecimento/PR.md", "docs/entregas/respostas-com-conhecimento/QA-PACOTE.md", "docs/entregas/respostas-com-conhecimento/ATENCAO.md", "docs/respostas-com-conhecimento/sprint-06/sprint.md", "docs/respostas-com-conhecimento/sprint-06/fases.md", "docs/respostas-com-conhecimento/sprint-06/tasks.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "tests/projeto.test.ts", "docs/respostas-com-conhecimento/sprint-01/sprint.md", "docs/respostas-com-conhecimento/sprint-01/fases.md", "docs/respostas-com-conhecimento/sprint-01/tasks.md", "docs/respostas-com-conhecimento/sprint-02/sprint.md", "docs/respostas-com-conhecimento/sprint-02/fases.md", "docs/respostas-com-conhecimento/sprint-02/tasks.md", "docs/respostas-com-conhecimento/sprint-03/sprint.md", "docs/respostas-com-conhecimento/sprint-03/fases.md", "docs/respostas-com-conhecimento/sprint-03/tasks.md", "docs/respostas-com-conhecimento/sprint-04/sprint.md", "docs/respostas-com-conhecimento/sprint-04/fases.md", "docs/respostas-com-conhecimento/sprint-04/tasks.md", "docs/respostas-com-conhecimento/sprint-05/sprint.md", "docs/respostas-com-conhecimento/sprint-05/fases.md", "docs/respostas-com-conhecimento/sprint-05/tasks.md"]
teste_integracao: Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel.
teste_funcional: O MAPA.md mostra a FT-05 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-50 a PR-54 com total 54 e realizada em FT-05 para PR-04, PR-15 e PR-30.
criterio_aceite: grep de FT-05 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 54 e tests/projeto.test.ts passa.
depende_de: ["T-06.02"]
paralelizavel: false
status: pendente
```

