---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-06
atualizado_em: 2026-10-01
tasks:
  - id: T-06.01
    titulo: "Conversas ficticias na seed"
    fase: F-06.1
    status: concluida
    objetivo: "Acrescentar ao agente de exemplo duas conversas ficticias, uma do painel e outra do widget, com fontes plausiveis."
    arquivos:
      cria: ["tests/seed-conversas.test.ts", "docs/historico-de-conversas/sprint-06/sprint.md", "docs/historico-de-conversas/sprint-06/fases.md", "docs/historico-de-conversas/sprint-06/tasks.md"]
      altera: ["prisma/seed.ts", "tests/seed.test.ts"]
    teste_integracao: "A seed rodada duas vezes contra o banco de teste deixa exatamente duas conversas do agente de exemplo com mensagens e fontes que citam a fonte de exemplo."
    teste_funcional: "Uma conversa e do painel com o usuario de demonstracao, a outra e do widget com visitanteId ficticio, a segunda execucao nao duplica e a seed continua recusando NODE_ENV production."
    criterio_aceite: "tests/seed-conversas.test.ts e tests/seed.test.ts passam."
    depende_de: ["T-05.04"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.02
    titulo: "Verificacao no navegador dos tres canais"
    fase: F-06.1
    status: pendente
    objetivo: "Gerar conversas pelo painel, pelo widget e pelo Telegram falso e ver lista, filtros, detalhe, exportar, apagar e painel nos dois temas e a 375 px."
    arquivos:
      cria: ["docs/historico-de-conversas/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css", "tests/apoio/servir-falso.ts", "tests/apoio/servir-telegram-falso.ts"]
    teste_integracao: "O roteiro roda contra o app de producao com o OpenRouter falso e o Telegram falso e as tres conversas aparecem na lista com os canais certos."
    teste_funcional: "A tela mostra os tres canais, os filtros por agente e canal reduzem a lista, o detalhe mostra as fontes, Exportar baixa o texto, apagar uma e apagar em lote removem e o painel mostra numeros e grafico."
    criterio_aceite: "docs/historico-de-conversas/VERIFICACAO-VISUAL.md lista o que foi visto e o que nao pode ser visto."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.03
    titulo: "Convencoes, lacunas e README"
    fase: F-06.1
    status: pendente
    objetivo: "Converter as decisoes do historico em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md e documentar a tela e o painel no README."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
    teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
    teste_funcional: "CONVENCOES.md traz as regras do servico de historico sem N+1, do LIKE escapado, do ouvinte de apagar, do rotulo mascarado e da agregacao do painel, LACUNAS.md registra o LIKE ASCII e a varredura de mensagens e o README descreve Conversas e o painel."
    criterio_aceite: "tests/projeto.test.ts passa e o grep de historico em CONVENCOES.md devolve as regras."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.04
    titulo: "Fechamento no laco do buildx"
    fase: F-06.2
    status: pendente
    objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias, ambiente e CI."
    arquivos:
      cria: ["docs/historico-de-conversas/ORQUESTRADOR.md", "docs/historico-de-conversas/00-AUDITORIA.md", "docs/historico-de-conversas/FECHAMENTO.md", "docs/historico-de-conversas/RELATORIO-FEATURE.md", "docs/historico-de-conversas/BRIEFING-BUILDX.md", "docs/historico-de-conversas/00-DECISOES.md", "docs/historico-de-conversas/00-BLOQUEIOS.md", "docs/historico-de-conversas/base/00-INDICE.md", "docs/historico-de-conversas/base/00-LACUNAS.md", "docs/historico-de-conversas/base/conversas-e-modelo.md", "docs/historico-de-conversas/base/canais-e-rotulos.md", "docs/historico-de-conversas/base/telas-menu-e-componentes.md", "docs/historico-de-conversas/base/seed-testes-e-ci.md", "docs/historico-de-conversas/base/painel-e-agregacao.md", "docs/entregas/historico-de-conversas/ENTREGA.md", "docs/entregas/historico-de-conversas/PR.md", "docs/entregas/historico-de-conversas/QA-PACOTE.md", "docs/entregas/historico-de-conversas/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "docs/historico-de-conversas/sprint-01/tasks.md", "docs/historico-de-conversas/sprint-02/tasks.md", "docs/historico-de-conversas/sprint-03/tasks.md", "docs/historico-de-conversas/sprint-04/tasks.md", "docs/historico-de-conversas/sprint-05/tasks.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra a FT-09 entregue com sprints, testes e PR local, PREMISSAS.md tem total 85 e PR-18 realizada em FT-09 e o RECURSAO.md mantem PEND-07 com a verificacao visual de Conversas e do painel."
    criterio_aceite: "grep de FT-09 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 85 e tests/projeto.test.ts passa."
    depende_de: ["T-06.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-06.01
titulo: "Conversas ficticias na seed"
objetivo: "Acrescentar ao agente de exemplo duas conversas ficticias, uma do painel e outra do widget, com fontes plausiveis."
arquivos:
  cria: ["tests/seed-conversas.test.ts", "docs/historico-de-conversas/sprint-06/sprint.md", "docs/historico-de-conversas/sprint-06/fases.md", "docs/historico-de-conversas/sprint-06/tasks.md"]
  altera: ["prisma/seed.ts", "tests/seed.test.ts"]
teste_integracao: "A seed rodada duas vezes contra o banco de teste deixa exatamente duas conversas do agente de exemplo com mensagens e fontes que citam a fonte de exemplo."
teste_funcional: "Uma conversa e do painel com o usuario de demonstracao, a outra e do widget com visitanteId ficticio, a segunda execucao nao duplica e a seed continua recusando NODE_ENV production."
criterio_aceite: "tests/seed-conversas.test.ts e tests/seed.test.ts passam."
depende_de: ["T-05.04"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/seed-conversas e seed 22 passed
```

---

```yaml
id: T-06.02
titulo: "Verificacao no navegador dos tres canais"
objetivo: "Gerar conversas pelo painel, pelo widget e pelo Telegram falso e ver lista, filtros, detalhe, exportar, apagar e painel nos dois temas e a 375 px."
arquivos:
  cria: ["docs/historico-de-conversas/VERIFICACAO-VISUAL.md"]
  altera: ["src/estilos/global.css", "tests/apoio/servir-falso.ts", "tests/apoio/servir-telegram-falso.ts"]
teste_integracao: "O roteiro roda contra o app de producao com o OpenRouter falso e o Telegram falso e as tres conversas aparecem na lista com os canais certos."
teste_funcional: "A tela mostra os tres canais, os filtros por agente e canal reduzem a lista, o detalhe mostra as fontes, Exportar baixa o texto, apagar uma e apagar em lote removem e o painel mostra numeros e grafico."
criterio_aceite: "docs/historico-de-conversas/VERIFICACAO-VISUAL.md lista o que foi visto e o que nao pode ser visto."
depende_de: ["T-06.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.03
titulo: "Convencoes, lacunas e README"
objetivo: "Converter as decisoes do historico em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md e documentar a tela e o painel no README."
arquivos:
  cria: []
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
teste_funcional: "CONVENCOES.md traz as regras do servico de historico sem N+1, do LIKE escapado, do ouvinte de apagar, do rotulo mascarado e da agregacao do painel, LACUNAS.md registra o LIKE ASCII e a varredura de mensagens e o README descreve Conversas e o painel."
criterio_aceite: "tests/projeto.test.ts passa e o grep de historico em CONVENCOES.md devolve as regras."
depende_de: ["T-06.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.04
titulo: "Fechamento no laco do buildx"
objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias, ambiente e CI."
arquivos:
  cria: ["docs/historico-de-conversas/ORQUESTRADOR.md", "docs/historico-de-conversas/00-AUDITORIA.md", "docs/historico-de-conversas/FECHAMENTO.md", "docs/historico-de-conversas/RELATORIO-FEATURE.md", "docs/historico-de-conversas/BRIEFING-BUILDX.md", "docs/historico-de-conversas/00-DECISOES.md", "docs/historico-de-conversas/00-BLOQUEIOS.md", "docs/historico-de-conversas/base/00-INDICE.md", "docs/historico-de-conversas/base/00-LACUNAS.md", "docs/historico-de-conversas/base/conversas-e-modelo.md", "docs/historico-de-conversas/base/canais-e-rotulos.md", "docs/historico-de-conversas/base/telas-menu-e-componentes.md", "docs/historico-de-conversas/base/seed-testes-e-ci.md", "docs/historico-de-conversas/base/painel-e-agregacao.md", "docs/entregas/historico-de-conversas/ENTREGA.md", "docs/entregas/historico-de-conversas/PR.md", "docs/entregas/historico-de-conversas/QA-PACOTE.md", "docs/entregas/historico-de-conversas/ATENCAO.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "docs/historico-de-conversas/sprint-01/tasks.md", "docs/historico-de-conversas/sprint-02/tasks.md", "docs/historico-de-conversas/sprint-03/tasks.md", "docs/historico-de-conversas/sprint-04/tasks.md", "docs/historico-de-conversas/sprint-05/tasks.md"]
teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
teste_funcional: "O MAPA.md mostra a FT-09 entregue com sprints, testes e PR local, PREMISSAS.md tem total 85 e PR-18 realizada em FT-09 e o RECURSAO.md mantem PEND-07 com a verificacao visual de Conversas e do painel."
criterio_aceite: "grep de FT-09 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 85 e tests/projeto.test.ts passa."
depende_de: ["T-06.03"]
paralelizavel: false
status: pendente
```

