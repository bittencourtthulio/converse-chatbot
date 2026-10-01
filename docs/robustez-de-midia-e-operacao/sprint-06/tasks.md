---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-06
atualizado_em: 2026-10-01
tasks:
  - id: T-06.01
    titulo: "Verificação no navegador"
    fase: F-06.1
    status: pendente
    objetivo: "Ver no app de produção o upload de documento e de vídeo com trecho mudo, a badge de canal e o alternador nos dois temas a 375 px e a tela Sistema (Chrome próprio, porta livre)."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/sprint-06/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-06/fases.md", "docs/robustez-de-midia-e-operacao/sprint-06/tasks.md", "docs/robustez-de-midia-e-operacao/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Com servidor de produção local (usuário administrador descartável criado por npm run admin:criar, segredos inline), servidor do OpenRouter falso de tests/apoio/servir-falso.ts e Chrome próprio com user-data-dir temporário e porta livre, alvo confirmado antes de interagir, o upload de um PDF e de um áudio com trecho mudo chega a pronto na tela de conhecimento e a tela Sistema mostra Trilha de auditoria: ativa."
    teste_funcional: "Por CDP a 375 px, nos dois temas, document.documentElement.scrollWidth é menor ou igual a window.innerWidth nas telas de conversas, painel e Sistema, a badge de canal tem background-image diferente de none e o alternador muda data-theme; o que não pôde ser visto está listado."
    criterio_aceite: "VERIFICACAO-VISUAL.md existe, lista o que foi visto e o que não foi, os defeitos em src/estilos/global.css estão corrigidos e defeito em outro arquivo entra em arquivos.altera desta task e em desvios do ENTREGA.md."
    depende_de: ["T-05.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.02
    titulo: "Lacunas e convenções da FT-13"
    fase: F-06.2
    status: pendente
    objetivo: "Converter as lacunas relevantes em LACUNAS.md e CONVENCOES.md com arquivo:linha e dar a lacuna 13 e a 37 como resolvidas."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/FECHAMENTO.md"]
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts", "README.md"]
    teste_integracao: "tests/projeto.test.ts confere que cada citação arquivo:linha de CONVENCOES.md e LACUNAS.md aponta para uma linha que existe e contém o trecho citado."
    teste_funcional: "As lacunas 13, 37 e 50 constam como resolvidas com a citação do código novo, as novas da FT-13 (isolamento, teto, trava, trava de rede) constam com arquivo:linha e o README descreve as regras novas."
    criterio_aceite: "tests/projeto.test.ts passa e FECHAMENTO.md descreve os desvios task a task."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.03
    titulo: "Fechamento no laço do buildx"
    fase: F-06.2
    status: pendente
    objetivo: "Fechar a feature no laço: MAPA, PREMISSAS, RECURSAO, ENTREGA, PR, QA, atenção, relatório e as mutações."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/RELATORIO-FEATURE.md", "docs/robustez-de-midia-e-operacao/ORQUESTRADOR.md", "docs/robustez-de-midia-e-operacao/00-AUDITORIA.md", "docs/robustez-de-midia-e-operacao/00-BLOQUEIOS.md", "docs/robustez-de-midia-e-operacao/00-DECISOES.md", "docs/robustez-de-midia-e-operacao/BRIEFING-BUILDX.md", "docs/robustez-de-midia-e-operacao/base/00-INDICE.md", "docs/robustez-de-midia-e-operacao/base/00-LACUNAS.md", "docs/robustez-de-midia-e-operacao/base/midia-sem-fala.md", "docs/robustez-de-midia-e-operacao/base/upload-e-teto.md", "docs/robustez-de-midia-e-operacao/base/extracao-isolada.md", "docs/robustez-de-midia-e-operacao/base/restauracao-trava.md", "docs/robustez-de-midia-e-operacao/base/correlacao-nos-uploads.md", "docs/robustez-de-midia-e-operacao/base/interface-canal-exclusao-tema.md", "docs/robustez-de-midia-e-operacao/base/auditoria-e-saude.md", "docs/robustez-de-midia-e-operacao/base/testes-rede-e-instabilidade.md", "docs/entregas/robustez-de-midia-e-operacao/ENTREGA.md", "docs/entregas/robustez-de-midia-e-operacao/PR.md", "docs/entregas/robustez-de-midia-e-operacao/QA-PACOTE.md", "docs/entregas/robustez-de-midia-e-operacao/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md"]
    teste_integracao: "tests/projeto.test.ts confere o frontmatter e os contadores de MAPA.md, PREMISSAS.md e RECURSAO.md e a suíte inteira roda verde com tsc, lint, build e npm audit --audit-level=high em 0."
    teste_funcional: "O MAPA.md marca a FT-13 como entregue com Sprints, Testes e PR local, o RECURSAO.md move PEND-18 a PEND-27 resolvidas e PEND-30 para Resolvido nos ciclos (ciclo 2, FT-13) e as mutações de todas as tasks estão em MUTACOES.md."
    criterio_aceite: "Todos os comandos de verificação passam, o ENTREGA.md lista as mutações, os desvios (inclusive o teto do upload mantido em MAX_UPLOAD_MB x 10 + 1 MB, D-05) e a convenção de suite parcial (PEND-10), e o RELATORIO-FEATURE.md existe."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-06.01
titulo: "Verificação no navegador"
objetivo: "Ver no app de produção o upload de documento e de vídeo com trecho mudo, a badge de canal e o alternador nos dois temas a 375 px e a tela Sistema (Chrome próprio, porta livre)."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/sprint-06/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-06/fases.md", "docs/robustez-de-midia-e-operacao/sprint-06/tasks.md", "docs/robustez-de-midia-e-operacao/VERIFICACAO-VISUAL.md"]
  altera: ["src/estilos/global.css", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "Com servidor de produção local (usuário administrador descartável criado por npm run admin:criar, segredos inline), servidor do OpenRouter falso de tests/apoio/servir-falso.ts e Chrome próprio com user-data-dir temporário e porta livre, alvo confirmado antes de interagir, o upload de um PDF e de um áudio com trecho mudo chega a pronto na tela de conhecimento e a tela Sistema mostra Trilha de auditoria: ativa."
teste_funcional: "Por CDP a 375 px, nos dois temas, document.documentElement.scrollWidth é menor ou igual a window.innerWidth nas telas de conversas, painel e Sistema, a badge de canal tem background-image diferente de none e o alternador muda data-theme; o que não pôde ser visto está listado."
criterio_aceite: "VERIFICACAO-VISUAL.md existe, lista o que foi visto e o que não foi, os defeitos em src/estilos/global.css estão corrigidos e defeito em outro arquivo entra em arquivos.altera desta task e em desvios do ENTREGA.md."
depende_de: ["T-05.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.02
titulo: "Lacunas e convenções da FT-13"
objetivo: "Converter as lacunas relevantes em LACUNAS.md e CONVENCOES.md com arquivo:linha e dar a lacuna 13 e a 37 como resolvidas."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/FECHAMENTO.md"]
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts", "README.md"]
teste_integracao: "tests/projeto.test.ts confere que cada citação arquivo:linha de CONVENCOES.md e LACUNAS.md aponta para uma linha que existe e contém o trecho citado."
teste_funcional: "As lacunas 13, 37 e 50 constam como resolvidas com a citação do código novo, as novas da FT-13 (isolamento, teto, trava, trava de rede) constam com arquivo:linha e o README descreve as regras novas."
criterio_aceite: "tests/projeto.test.ts passa e FECHAMENTO.md descreve os desvios task a task."
depende_de: ["T-06.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.03
titulo: "Fechamento no laço do buildx"
objetivo: "Fechar a feature no laço: MAPA, PREMISSAS, RECURSAO, ENTREGA, PR, QA, atenção, relatório e as mutações."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/RELATORIO-FEATURE.md", "docs/robustez-de-midia-e-operacao/ORQUESTRADOR.md", "docs/robustez-de-midia-e-operacao/00-AUDITORIA.md", "docs/robustez-de-midia-e-operacao/00-BLOQUEIOS.md", "docs/robustez-de-midia-e-operacao/00-DECISOES.md", "docs/robustez-de-midia-e-operacao/BRIEFING-BUILDX.md", "docs/robustez-de-midia-e-operacao/base/00-INDICE.md", "docs/robustez-de-midia-e-operacao/base/00-LACUNAS.md", "docs/robustez-de-midia-e-operacao/base/midia-sem-fala.md", "docs/robustez-de-midia-e-operacao/base/upload-e-teto.md", "docs/robustez-de-midia-e-operacao/base/extracao-isolada.md", "docs/robustez-de-midia-e-operacao/base/restauracao-trava.md", "docs/robustez-de-midia-e-operacao/base/correlacao-nos-uploads.md", "docs/robustez-de-midia-e-operacao/base/interface-canal-exclusao-tema.md", "docs/robustez-de-midia-e-operacao/base/auditoria-e-saude.md", "docs/robustez-de-midia-e-operacao/base/testes-rede-e-instabilidade.md", "docs/entregas/robustez-de-midia-e-operacao/ENTREGA.md", "docs/entregas/robustez-de-midia-e-operacao/PR.md", "docs/entregas/robustez-de-midia-e-operacao/QA-PACOTE.md", "docs/entregas/robustez-de-midia-e-operacao/ATENCAO.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md"]
teste_integracao: "tests/projeto.test.ts confere o frontmatter e os contadores de MAPA.md, PREMISSAS.md e RECURSAO.md e a suíte inteira roda verde com tsc, lint, build e npm audit --audit-level=high em 0."
teste_funcional: "O MAPA.md marca a FT-13 como entregue com Sprints, Testes e PR local, o RECURSAO.md move PEND-18 a PEND-27 resolvidas e PEND-30 para Resolvido nos ciclos (ciclo 2, FT-13) e as mutações de todas as tasks estão em MUTACOES.md."
criterio_aceite: "Todos os comandos de verificação passam, o ENTREGA.md lista as mutações, os desvios (inclusive o teto do upload mantido em MAX_UPLOAD_MB x 10 + 1 MB, D-05) e a convenção de suite parcial (PEND-10), e o RELATORIO-FEATURE.md existe."
depende_de: ["T-06.02"]
paralelizavel: false
status: pendente
```

