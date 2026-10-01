---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-04
atualizado_em: 2026-10-01
tasks:
  - id: T-04.01
    titulo: "executarExpurgo com fronteiras e lotes"
    fase: F-04.1
    status: concluida
    objetivo: "Apagar conversas vencidas em lotes, atualizacoes antigas do Telegram e auditoria antiga, registrando so contagens."
    arquivos:
      cria: ["src/servicos/expurgo.ts", "tests/expurgo.test.ts", "docs/privacidade-e-auditoria/sprint-04/sprint.md", "docs/privacidade-e-auditoria/sprint-04/fases.md", "docs/privacidade-e-auditoria/sprint-04/tasks.md"]
      altera: []
    teste_integracao: "executarExpurgo contra o banco de teste apaga conversas com mensagens em cascata, atualizacoes do Telegram com mais de 7 dias e registros de auditoria com mais de 365 dias, e grava expurgo_automatico com as contagens."
    teste_funcional: "Com retencao 90 e relogio fixo a conversa exatamente no corte fica, um milissegundo antes sai, um dia depois fica, 1230 conversas saem em lotes de 500, 500 e 230, a retencao sem expurgo preserva as conversas mas apaga o resto e a segunda rodada apaga 0 e nao grava registro."
    criterio_aceite: "tests/expurgo.test.ts passa e o registro de expurgo nunca contem texto de conversa nem identificador."
    depende_de: ["T-03.03", "T-02.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-04.02
    titulo: "Agendador do expurgo e subida do servidor"
    fase: F-04.2
    status: concluida
    objetivo: "Rodar o expurgo 1 minuto depois da subida e a cada 6 horas, sem sobreposicao, e inicia-lo por instrumentation.ts."
    arquivos:
      cria: ["tests/expurgo-agendador.test.ts"]
      altera: ["src/servicos/expurgo.ts", "src/instrumentation.ts", "tests/instrumentacao.test.ts"]
    teste_integracao: "register inicia o agendador do expurgo sem esperar a primeira rodada e uma falha do banco numa rodada vira log expurgo_falhou sem derrubar o processo nem impedir a rodada seguinte."
    teste_funcional: "Com temporizador e relogio injetados a primeira rodada ocorre aos 60 segundos, a seguinte 6 horas depois, uma rodada longa nao e sobreposta por outra, iniciar duas vezes mantem um so agendador e parar cancela as rodadas."
    criterio_aceite: "tests/expurgo-agendador.test.ts e tests/instrumentacao.test.ts passam."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: "executarExpurgo com fronteiras e lotes"
objetivo: "Apagar conversas vencidas em lotes, atualizacoes antigas do Telegram e auditoria antiga, registrando so contagens."
arquivos:
  cria: ["src/servicos/expurgo.ts", "tests/expurgo.test.ts", "docs/privacidade-e-auditoria/sprint-04/sprint.md", "docs/privacidade-e-auditoria/sprint-04/fases.md", "docs/privacidade-e-auditoria/sprint-04/tasks.md"]
  altera: []
teste_integracao: "executarExpurgo contra o banco de teste apaga conversas com mensagens em cascata, atualizacoes do Telegram com mais de 7 dias e registros de auditoria com mais de 365 dias, e grava expurgo_automatico com as contagens."
teste_funcional: "Com retencao 90 e relogio fixo a conversa exatamente no corte fica, um milissegundo antes sai, um dia depois fica, 1230 conversas saem em lotes de 500, 500 e 230, a retencao sem expurgo preserva as conversas mas apaga o resto e a segunda rodada apaga 0 e nao grava registro."
criterio_aceite: "tests/expurgo.test.ts passa e o registro de expurgo nunca contem texto de conversa nem identificador."
depende_de: ["T-03.03", "T-02.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/expurgo.test.ts 11 passed; so arquivos novos; suite inteira no fim da sprint
```

---

```yaml
id: T-04.02
titulo: "Agendador do expurgo e subida do servidor"
objetivo: "Rodar o expurgo 1 minuto depois da subida e a cada 6 horas, sem sobreposicao, e inicia-lo por instrumentation.ts."
arquivos:
  cria: ["tests/expurgo-agendador.test.ts"]
  altera: ["src/servicos/expurgo.ts", "src/instrumentation.ts", "tests/instrumentacao.test.ts"]
teste_integracao: "register inicia o agendador do expurgo sem esperar a primeira rodada e uma falha do banco numa rodada vira log expurgo_falhou sem derrubar o processo nem impedir a rodada seguinte."
teste_funcional: "Com temporizador e relogio injetados a primeira rodada ocorre aos 60 segundos, a seguinte 6 horas depois, uma rodada longa nao e sobreposta por outra, iniciar duas vezes mantem um so agendador e parar cancela as rodadas."
criterio_aceite: "tests/expurgo-agendador.test.ts e tests/instrumentacao.test.ts passam."
depende_de: ["T-04.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2382 passed, 0 failed (193 arquivos); build antes
```

