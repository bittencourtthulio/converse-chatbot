---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-05
atualizado_em: 2026-10-01
tasks:
  - id: T-05.01
    titulo: "Servico do titular: buscar, exportar e apagar"
    fase: F-05.1
    status: concluida
    objetivo: "Criar o servico que resolve um titular por canal e identificador, exporta em JSON e TXT e apaga todas as conversas dele."
    arquivos:
      cria: ["src/servicos/titular.ts", "tests/titular.test.ts", "docs/privacidade-e-auditoria/sprint-05/sprint.md", "docs/privacidade-e-auditoria/sprint-05/fases.md", "docs/privacidade-e-auditoria/sprint-05/tasks.md"]
      altera: ["src/servicos/historico.ts"]
    teste_integracao: "buscarTitular, exportarTitular e apagarDoTitular contra o banco de teste so atendem admin, resolvem prefixo de 6 ou mais caracteres a um titular unico, avisam aoApagarConversa por conversa com origem titular e gravam dados_do_titular_apagados e dados_do_titular_exportados com contagens."
    teste_funcional: "O prefixo de 6 caracteres que casa dois visitantes devolve varios titulares com 10 caracteres de prefixo e contagens e recusa exportar e apagar com 422, o id completo apaga so as conversas daquele visitante e as de outro ficam, e o TXT e o JSON da exportacao trazem as mensagens e nao o identificador."
    criterio_aceite: "tests/titular.test.ts passa."
    depende_de: ["T-02.03", "T-03.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.02
    titulo: "Rota de exportacao do titular"
    fase: F-05.1
    status: concluida
    objetivo: "Servir a exportacao do titular como download seguro so para admin."
    arquivos:
      cria: ["src/app/api/titulares/exportar/route.ts", "tests/titulares-exportar-rota.test.ts"]
      altera: []
    teste_integracao: "POST /api/titulares/exportar no servidor de producao responde 401 sem sessao, 403 para usuario comum, 422 sem canal valido e 200 anexo com Cache-Control no-store e nosniff para admin."
    teste_funcional: "A exportacao em JSON e em TXT tem Content-Disposition attachment com nome titular-widget-AAAA-MM-DD sem o identificador e o corpo traz as mensagens do titular certo."
    criterio_aceite: "tests/titulares-exportar-rota.test.ts passa contra next start."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.03
    titulo: "Visitante apaga a propria conversa: servico e API publica"
    fase: F-05.2
    status: pendente
    objetivo: "Permitir DELETE publico que apaga so as conversas do visitante naquele agente."
    arquivos:
      cria: ["tests/publico-apagar.test.ts", "tests/publico-apagar-rota.test.ts"]
      altera: ["src/servicos/chat-publico.ts", "src/servicos/historico.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts"]
    teste_integracao: "apagarConversasDoVisitante e DELETE /api/publico/agentes/[id]/conversa com X-Visitante-Id apagam so as conversas widget dele no agente, exigem agente ativo, Origin da plataforma e o limite de uso, e gravam conversa_apagada sem usuario e sem identificador."
    teste_funcional: "Um visitante nao apaga a conversa de outro, a mesma chamada com o id do primeiro apaga, agente inativo da 404 igual ao inexistente, Origin de outro site da 403 e a 11a chamada no minuto da 429."
    criterio_aceite: "tests/publico-apagar.test.ts e tests/publico-apagar-rota.test.ts passam."
    depende_de: ["T-02.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.04
    titulo: "Botao Apagar minha conversa no chat embutido"
    fase: F-05.2
    status: pendente
    objetivo: "Acrescentar ao chat do /embed o botao Apagar minha conversa com confirmacao na tela que limpa o estado local e recomeca."
    arquivos:
      cria: ["tests/embed-apagar-logica.test.ts", "tests/embed-apagar-ui.test.tsx"]
      altera: ["src/componentes/ChatEmbutido.tsx", "src/componentes/embed-logica.ts", "src/estilos/global.css"]
    teste_integracao: "O componente em modo publico mostra o botao, a confirmacao na tela chama o DELETE com o X-Visitante-Id, limpa a conversa e o visitante do armazenamento e volta ao estado inicial, e na previa o botao nao aparece."
    teste_funcional: "esquecerVisitante remove o id e a conversa do armazenamento e do estado em memoria mesmo se o armazenamento lancar erro, a confirmacao pede dois passos e erro da API mostra a mensagem sem apagar o estado local."
    criterio_aceite: "tests/embed-apagar-logica.test.ts e tests/embed-apagar-ui.test.tsx passam."
    depende_de: ["T-05.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 05

---

```yaml
id: T-05.01
titulo: "Servico do titular: buscar, exportar e apagar"
objetivo: "Criar o servico que resolve um titular por canal e identificador, exporta em JSON e TXT e apaga todas as conversas dele."
arquivos:
  cria: ["src/servicos/titular.ts", "tests/titular.test.ts", "docs/privacidade-e-auditoria/sprint-05/sprint.md", "docs/privacidade-e-auditoria/sprint-05/fases.md", "docs/privacidade-e-auditoria/sprint-05/tasks.md"]
  altera: ["src/servicos/historico.ts"]
teste_integracao: "buscarTitular, exportarTitular e apagarDoTitular contra o banco de teste so atendem admin, resolvem prefixo de 6 ou mais caracteres a um titular unico, avisam aoApagarConversa por conversa com origem titular e gravam dados_do_titular_apagados e dados_do_titular_exportados com contagens."
teste_funcional: "O prefixo de 6 caracteres que casa dois visitantes devolve varios titulares com 10 caracteres de prefixo e contagens e recusa exportar e apagar com 422, o id completo apaga so as conversas daquele visitante e as de outro ficam, e o TXT e o JSON da exportacao trazem as mensagens e nao o identificador."
criterio_aceite: "tests/titular.test.ts passa."
depende_de: ["T-02.03", "T-03.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/titular.test.ts 19 passed, tests/historico-apagar.test.ts 6 passed, projeto 144; suite inteira no fim da sprint
```

---

```yaml
id: T-05.02
titulo: "Rota de exportacao do titular"
objetivo: "Servir a exportacao do titular como download seguro so para admin."
arquivos:
  cria: ["src/app/api/titulares/exportar/route.ts", "tests/titulares-exportar-rota.test.ts"]
  altera: []
teste_integracao: "POST /api/titulares/exportar no servidor de producao responde 401 sem sessao, 403 para usuario comum, 422 sem canal valido e 200 anexo com Cache-Control no-store e nosniff para admin."
teste_funcional: "A exportacao em JSON e em TXT tem Content-Disposition attachment com nome titular-widget-AAAA-MM-DD sem o identificador e o corpo traz as mensagens do titular certo."
criterio_aceite: "tests/titulares-exportar-rota.test.ts passa contra next start."
depende_de: ["T-05.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/titulares-exportar-rota.test.ts 6 passed contra next start (build antes); suite inteira no fim da sprint
```

---

```yaml
id: T-05.03
titulo: "Visitante apaga a propria conversa: servico e API publica"
objetivo: "Permitir DELETE publico que apaga so as conversas do visitante naquele agente."
arquivos:
  cria: ["tests/publico-apagar.test.ts", "tests/publico-apagar-rota.test.ts"]
  altera: ["src/servicos/chat-publico.ts", "src/servicos/historico.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts"]
teste_integracao: "apagarConversasDoVisitante e DELETE /api/publico/agentes/[id]/conversa com X-Visitante-Id apagam so as conversas widget dele no agente, exigem agente ativo, Origin da plataforma e o limite de uso, e gravam conversa_apagada sem usuario e sem identificador."
teste_funcional: "Um visitante nao apaga a conversa de outro, a mesma chamada com o id do primeiro apaga, agente inativo da 404 igual ao inexistente, Origin de outro site da 403 e a 11a chamada no minuto da 429."
criterio_aceite: "tests/publico-apagar.test.ts e tests/publico-apagar-rota.test.ts passam."
depende_de: ["T-02.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.04
titulo: "Botao Apagar minha conversa no chat embutido"
objetivo: "Acrescentar ao chat do /embed o botao Apagar minha conversa com confirmacao na tela que limpa o estado local e recomeca."
arquivos:
  cria: ["tests/embed-apagar-logica.test.ts", "tests/embed-apagar-ui.test.tsx"]
  altera: ["src/componentes/ChatEmbutido.tsx", "src/componentes/embed-logica.ts", "src/estilos/global.css"]
teste_integracao: "O componente em modo publico mostra o botao, a confirmacao na tela chama o DELETE com o X-Visitante-Id, limpa a conversa e o visitante do armazenamento e volta ao estado inicial, e na previa o botao nao aparece."
teste_funcional: "esquecerVisitante remove o id e a conversa do armazenamento e do estado em memoria mesmo se o armazenamento lancar erro, a confirmacao pede dois passos e erro da API mostra a mensagem sem apagar o estado local."
criterio_aceite: "tests/embed-apagar-logica.test.ts e tests/embed-apagar-ui.test.tsx passam."
depende_de: ["T-05.03"]
paralelizavel: false
status: pendente
```

