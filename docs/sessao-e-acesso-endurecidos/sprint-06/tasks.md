---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-06
atualizado_em: 2026-10-01
tasks:
  - id: T-06.01
    titulo: "README, convencoes e lacunas com evidencia"
    fase: F-06.1
    status: concluida
    objetivo: "Documentar a sessao revogavel e renovavel, a guarda no layout e na pagina e o teste de arquitetura, convertendo as lacunas com arquivo e linha."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/sprint-06/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-06/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-06/tasks.md"]
      altera: ["README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere cada citacao arquivo:linha nova de CONVENCOES.md e LACUNAS.md contra o codigo e as secoes do README."
    teste_funcional: "O README explica a renovacao, o logout real e SESSAO_MAXIMA_HORAS, as convencoes trazem a regra da guarda propria e as lacunas dizem que o limite de login e em memoria, que o upload nao renova e o que ficou."
    criterio_aceite: "tests/projeto.test.ts passa."
    depende_de: ["T-05.04"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.02
    titulo: "Verificacao no navegador"
    fase: F-06.2
    status: pendente
    objetivo: "Verificar num Chrome proprio, com porta livre e alvo confirmado, login, renovacao, logout com cookie antigo, troca de senha e bloqueio de login, nos dois temas e a 375 px."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Com o servidor de producao de pe e JWT_TTL_SEGUNDOS reduzido, o login, o uso depois da metade da vida, o logout e o reuso do cookie antigo, a troca de senha com login imediato e o bloqueio por excesso de tentativas se comportam como o teste de ponta a ponta."
    teste_funcional: "A mensagem de excesso de tentativas e a tela de login nao tem rolagem lateral a 375 px nos temas claro e escuro."
    criterio_aceite: "VERIFICACAO-VISUAL.md existe, lista o que foi visto e o que nao foi, os defeitos de src/estilos/global.css estao corrigidos e o defeito em outro arquivo entra em arquivos.altera desta task e em desvios do ENTREGA.md e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.03
    titulo: "Fechamento no laco do buildx"
    fase: F-06.2
    status: pendente
    objetivo: "Fechar a feature no mapa, nas premissas e na recursao e consolidar os artefatos de entrega."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/FECHAMENTO.md", "docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md", "docs/sessao-e-acesso-endurecidos/ORQUESTRADOR.md", "docs/sessao-e-acesso-endurecidos/00-AUDITORIA.md", "docs/sessao-e-acesso-endurecidos/00-BLOQUEIOS.md", "docs/sessao-e-acesso-endurecidos/00-DECISOES.md", "docs/sessao-e-acesso-endurecidos/BRIEFING-BUILDX.md", "docs/sessao-e-acesso-endurecidos/base/00-INDICE.md", "docs/sessao-e-acesso-endurecidos/base/00-LACUNAS.md", "docs/sessao-e-acesso-endurecidos/base/sessao-e-cookie.md", "docs/sessao-e-acesso-endurecidos/base/troca-de-senha-e-versao.md", "docs/sessao-e-acesso-endurecidos/base/limites-de-uso.md", "docs/sessao-e-acesso-endurecidos/base/proxy-e-renovacao.md", "docs/sessao-e-acesso-endurecidos/base/guardas-de-acesso.md", "docs/sessao-e-acesso-endurecidos/base/testes-expurgo-e-ambiente.md", "docs/entregas/sessao-e-acesso-endurecidos/ENTREGA.md", "docs/entregas/sessao-e-acesso-endurecidos/PR.md", "docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md", "docs/entregas/sessao-e-acesso-endurecidos/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "tests/projeto.test.ts confere que o MAPA marca a FT-12 entregue com sprints, testes e PR local, que PR-101 a PR-104 existem com Origem recursao e Etapa b5 e que a RECURSAO move PEND-12 a PEND-17 para Resolvido nos ciclos."
    teste_funcional: "docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md existe com o que foi entregue, como demonstrar, os desvios e o que a FT-13 precisa saber, e o PROJETO.md conta 12 features entregues."
    criterio_aceite: "A suite inteira esta verde, tsc, lint, build e npm audit --audit-level=high passam, o ENTREGA.md copia as linhas de MUTACOES.md e o MAPA.md tem status entregue."
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
titulo: "README, convencoes e lacunas com evidencia"
objetivo: "Documentar a sessao revogavel e renovavel, a guarda no layout e na pagina e o teste de arquitetura, convertendo as lacunas com arquivo e linha."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/sprint-06/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-06/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-06/tasks.md"]
  altera: ["README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "tests/projeto.test.ts"]
teste_integracao: "tests/projeto.test.ts confere cada citacao arquivo:linha nova de CONVENCOES.md e LACUNAS.md contra o codigo e as secoes do README."
teste_funcional: "O README explica a renovacao, o logout real e SESSAO_MAXIMA_HORAS, as convencoes trazem a regra da guarda propria e as lacunas dizem que o limite de login e em memoria, que o upload nao renova e o que ficou."
criterio_aceite: "tests/projeto.test.ts passa."
depende_de: ["T-05.04"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/projeto.test.ts 237 passed; só documentação e teste de documentação (a suíte inteira roda no fechamento)
```

---

```yaml
id: T-06.02
titulo: "Verificacao no navegador"
objetivo: "Verificar num Chrome proprio, com porta livre e alvo confirmado, login, renovacao, logout com cookie antigo, troca de senha e bloqueio de login, nos dois temas e a 375 px."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md"]
  altera: ["src/estilos/global.css", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "Com o servidor de producao de pe e JWT_TTL_SEGUNDOS reduzido, o login, o uso depois da metade da vida, o logout e o reuso do cookie antigo, a troca de senha com login imediato e o bloqueio por excesso de tentativas se comportam como o teste de ponta a ponta."
teste_funcional: "A mensagem de excesso de tentativas e a tela de login nao tem rolagem lateral a 375 px nos temas claro e escuro."
criterio_aceite: "VERIFICACAO-VISUAL.md existe, lista o que foi visto e o que nao foi, os defeitos de src/estilos/global.css estao corrigidos e o defeito em outro arquivo entra em arquivos.altera desta task e em desvios do ENTREGA.md e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-06.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.03
titulo: "Fechamento no laco do buildx"
objetivo: "Fechar a feature no mapa, nas premissas e na recursao e consolidar os artefatos de entrega."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/FECHAMENTO.md", "docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md", "docs/sessao-e-acesso-endurecidos/ORQUESTRADOR.md", "docs/sessao-e-acesso-endurecidos/00-AUDITORIA.md", "docs/sessao-e-acesso-endurecidos/00-BLOQUEIOS.md", "docs/sessao-e-acesso-endurecidos/00-DECISOES.md", "docs/sessao-e-acesso-endurecidos/BRIEFING-BUILDX.md", "docs/sessao-e-acesso-endurecidos/base/00-INDICE.md", "docs/sessao-e-acesso-endurecidos/base/00-LACUNAS.md", "docs/sessao-e-acesso-endurecidos/base/sessao-e-cookie.md", "docs/sessao-e-acesso-endurecidos/base/troca-de-senha-e-versao.md", "docs/sessao-e-acesso-endurecidos/base/limites-de-uso.md", "docs/sessao-e-acesso-endurecidos/base/proxy-e-renovacao.md", "docs/sessao-e-acesso-endurecidos/base/guardas-de-acesso.md", "docs/sessao-e-acesso-endurecidos/base/testes-expurgo-e-ambiente.md", "docs/entregas/sessao-e-acesso-endurecidos/ENTREGA.md", "docs/entregas/sessao-e-acesso-endurecidos/PR.md", "docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md", "docs/entregas/sessao-e-acesso-endurecidos/ATENCAO.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "tests/projeto.test.ts confere que o MAPA marca a FT-12 entregue com sprints, testes e PR local, que PR-101 a PR-104 existem com Origem recursao e Etapa b5 e que a RECURSAO move PEND-12 a PEND-17 para Resolvido nos ciclos."
teste_funcional: "docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md existe com o que foi entregue, como demonstrar, os desvios e o que a FT-13 precisa saber, e o PROJETO.md conta 12 features entregues."
criterio_aceite: "A suite inteira esta verde, tsc, lint, build e npm audit --audit-level=high passam, o ENTREGA.md copia as linhas de MUTACOES.md e o MAPA.md tem status entregue."
depende_de: ["T-06.02"]
paralelizavel: false
status: pendente
```
