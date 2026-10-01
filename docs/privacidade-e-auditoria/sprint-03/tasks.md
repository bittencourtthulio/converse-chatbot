---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
sprint_id: sprint-03
atualizado_em: 2026-10-01
tasks:
  - id: T-03.01
    titulo: "Servico excluirDefinitivamente"
    fase: F-03.1
    status: concluida
    objetivo: "Excluir usuario de forma definitiva, preservando agentes, conversas e fontes e invalidando a sessao."
    arquivos:
      cria: ["tests/usuarios-excluir.test.ts", "docs/privacidade-e-auditoria/sprint-03/sprint.md", "docs/privacidade-e-auditoria/sprint-03/fases.md", "docs/privacidade-e-auditoria/sprint-03/tasks.md"]
      altera: ["src/servicos/usuarios.ts"]
    teste_integracao: "excluirDefinitivamente numa transacao passa os agentes ao admin, deixa nulo o criadoPorId de conversas e fontes e o atualizadoPor da configuracao, apaga o usuario e grava usuario_excluido com o rotulo, e a sessao dele deixa de valer."
    teste_funcional: "Excluir a si mesmo ou o ultimo admin ativo da 409, quem nao e admin da 403, usuario inexistente da 404, e com um usuario com 2 agentes, 3 conversas e 1 fonte tudo permanece com os agentes agora do admin."
    criterio_aceite: "tests/usuarios-excluir.test.ts passa e tests/usuarios.test.ts continua passando."
    depende_de: ["T-02.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-03.02
    titulo: "Tela: Excluir definitivamente em Usuarios"
    fase: F-03.1
    status: concluida
    objetivo: "Acrescentar na lista de usuarios a acao Excluir definitivamente com confirmacao na tela que exige digitar o e-mail."
    arquivos:
      cria: ["src/componentes/excluir-usuario-logica.ts", "tests/excluir-usuario-logica.test.ts", "tests/usuarios-excluir-ui.test.tsx", "tests/usuarios-excluir-acao.test.ts"]
      altera: ["src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx", "src/app/acoes.ts", "src/estilos/global.css", "src/servicos/usuarios.ts", "tests/usuarios-excluir.test.ts"]
    teste_integracao: "A acao de servidor excluirUsuario chama o servico com a sessao de admin e devolve a mensagem de erro de 409 e a de sucesso, e a linha renderizada mostra o botao, a confirmacao e o texto de irreversibilidade."
    teste_funcional: "O botao de confirmar fica desabilitado ate o e-mail digitado, sem diferenca de maiusculas e espacos nas pontas, ser igual ao do usuario, a propria linha nao oferece a acao e o texto cita desativar como alternativa."
    criterio_aceite: "tests/excluir-usuario-logica.test.ts e tests/usuarios-excluir-ui.test.tsx passam."
    depende_de: ["T-03.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-03.03
    titulo: "Servico de retencao e aviso padrao"
    fase: F-03.2
    status: concluida
    objetivo: "Criar o servico que le e salva a retencao das conversas e o aviso de privacidade padrao do workspace, so para admin."
    arquivos:
      cria: ["src/servicos/privacidade.ts", "tests/privacidade.test.ts"]
      altera: []
    teste_integracao: "salvarRetencao e salvarAvisoPadrao gravam em ConfiguracaoDoWorkspace, so admin, e retencao_alterada e gravado com os dias anterior e novo pela auditoria de melhor esforco."
    teste_funcional: "Retencao 6 e 3651 sao recusadas com 422, 7 e 3650 aceitas, sem_expurgo exige a confirmacao de risco, o aviso passa de 300 caracteres e recusado e a URL aceita so http ou https."
    criterio_aceite: "tests/privacidade.test.ts passa e retencaoEfetivaDias devolve 90 sem linha, o valor salvo ou nulo para sem expurgo."
    depende_de: ["T-02.01", "T-01.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-03.04
    titulo: "Aviso padrao no chat embutido e no /start do Telegram"
    fase: F-03.2
    status: pendente
    objetivo: "Usar o aviso padrao do workspace quando o agente nao tem aviso proprio e anexa-lo a resposta do /start."
    arquivos:
      cria: ["tests/privacidade-aviso-canais.test.ts"]
      altera: ["src/servicos/chat-publico-config.ts", "src/servicos/telegram-atendimento.ts", "src/componentes/FormularioDoChat.tsx"]
    teste_integracao: "configuracaoPublica e a previa devolvem o aviso do agente quando ha texto e o do workspace quando nao ha, e o /start do Telegram simulado envia a mensagem inicial seguida do aviso e da URL."
    teste_funcional: "Com aviso padrao Seus dados sao usados so para atendimento e agente sem aviso, a configuracao publica traz esse texto e a URL, com aviso proprio traz o do agente, e sem aviso padrao o /start envia so a mensagem inicial."
    criterio_aceite: "tests/privacidade-aviso-canais.test.ts passa e tests/chat-publico-config-publica.test.ts e tests/telegram-comandos.test.ts continuam passando."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: "Servico excluirDefinitivamente"
objetivo: "Excluir usuario de forma definitiva, preservando agentes, conversas e fontes e invalidando a sessao."
arquivos:
  cria: ["tests/usuarios-excluir.test.ts", "docs/privacidade-e-auditoria/sprint-03/sprint.md", "docs/privacidade-e-auditoria/sprint-03/fases.md", "docs/privacidade-e-auditoria/sprint-03/tasks.md"]
  altera: ["src/servicos/usuarios.ts"]
teste_integracao: "excluirDefinitivamente numa transacao passa os agentes ao admin, deixa nulo o criadoPorId de conversas e fontes e o atualizadoPor da configuracao, apaga o usuario e grava usuario_excluido com o rotulo, e a sessao dele deixa de valer."
teste_funcional: "Excluir a si mesmo ou o ultimo admin ativo da 409, quem nao e admin da 403, usuario inexistente da 404, e com um usuario com 2 agentes, 3 conversas e 1 fonte tudo permanece com os agentes agora do admin."
criterio_aceite: "tests/usuarios-excluir.test.ts passa e tests/usuarios.test.ts continua passando."
depende_de: ["T-02.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/usuarios-excluir.test.ts 8 passed, tests/usuarios.test.ts e tests/projeto.test.ts 165 passed; suite inteira no fim da sprint
```

---

```yaml
id: T-03.02
titulo: "Tela: Excluir definitivamente em Usuarios"
objetivo: "Acrescentar na lista de usuarios a acao Excluir definitivamente com confirmacao na tela que exige digitar o e-mail."
arquivos:
  cria: ["src/componentes/excluir-usuario-logica.ts", "tests/excluir-usuario-logica.test.ts", "tests/usuarios-excluir-ui.test.tsx", "tests/usuarios-excluir-acao.test.ts"]
  altera: ["src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx", "src/app/acoes.ts", "src/estilos/global.css", "src/servicos/usuarios.ts", "tests/usuarios-excluir.test.ts"]
teste_integracao: "A acao de servidor excluirUsuario chama o servico com a sessao de admin e devolve a mensagem de erro de 409 e a de sucesso, e a linha renderizada mostra o botao, a confirmacao e o texto de irreversibilidade."
teste_funcional: "O botao de confirmar fica desabilitado ate o e-mail digitado, sem diferenca de maiusculas e espacos nas pontas, ser igual ao do usuario, a propria linha nao oferece a acao e o texto cita desativar como alternativa."
criterio_aceite: "tests/excluir-usuario-logica.test.ts e tests/usuarios-excluir-ui.test.tsx passam."
depende_de: ["T-03.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — excluir-usuario-logica 5, usuarios-excluir-ui 6, usuarios-excluir-acao 4, usuarios-excluir 9; 230 passed com componentes, projeto e rotas; suite inteira no fim da sprint
```

---

```yaml
id: T-03.03
titulo: "Servico de retencao e aviso padrao"
objetivo: "Criar o servico que le e salva a retencao das conversas e o aviso de privacidade padrao do workspace, so para admin."
arquivos:
  cria: ["src/servicos/privacidade.ts", "tests/privacidade.test.ts"]
  altera: []
teste_integracao: "salvarRetencao e salvarAvisoPadrao gravam em ConfiguracaoDoWorkspace, so admin, e retencao_alterada e gravado com os dias anterior e novo pela auditoria de melhor esforco."
teste_funcional: "Retencao 6 e 3651 sao recusadas com 422, 7 e 3650 aceitas, sem_expurgo exige a confirmacao de risco, o aviso passa de 300 caracteres e recusado e a URL aceita so http ou https."
criterio_aceite: "tests/privacidade.test.ts passa e retencaoEfetivaDias devolve 90 sem linha, o valor salvo ou nulo para sem expurgo."
depende_de: ["T-02.01", "T-01.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/privacidade.test.ts 11 passed e tests/projeto.test.ts; so arquivos novos
```

---

```yaml
id: T-03.04
titulo: "Aviso padrao no chat embutido e no /start do Telegram"
objetivo: "Usar o aviso padrao do workspace quando o agente nao tem aviso proprio e anexa-lo a resposta do /start."
arquivos:
  cria: ["tests/privacidade-aviso-canais.test.ts"]
  altera: ["src/servicos/chat-publico-config.ts", "src/servicos/telegram-atendimento.ts", "src/componentes/FormularioDoChat.tsx"]
teste_integracao: "configuracaoPublica e a previa devolvem o aviso do agente quando ha texto e o do workspace quando nao ha, e o /start do Telegram simulado envia a mensagem inicial seguida do aviso e da URL."
teste_funcional: "Com aviso padrao Seus dados sao usados so para atendimento e agente sem aviso, a configuracao publica traz esse texto e a URL, com aviso proprio traz o do agente, e sem aviso padrao o /start envia so a mensagem inicial."
criterio_aceite: "tests/privacidade-aviso-canais.test.ts passa e tests/chat-publico-config-publica.test.ts e tests/telegram-comandos.test.ts continuam passando."
depende_de: ["T-03.03"]
paralelizavel: false
status: pendente
```

