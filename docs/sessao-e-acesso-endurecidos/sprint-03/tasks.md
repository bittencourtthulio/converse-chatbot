---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-03
atualizado_em: 2026-10-01
tasks:
  - id: T-03.01
    titulo: "Acao sair revoga a sessao"
    fase: F-03.1
    status: concluida
    objetivo: "Fazer a acao sair ler o token do cookie, revogar o jti, apagar o cookie e redirecionar."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/sprint-03/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-03/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-03/tasks.md", "tests/acao-sair.test.ts"]
      altera: ["src/app/acoes.ts", "src/app/sessao-servidor.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/acao-sair.test.ts chama a acao sair real com cookies simulados e o sessao-servidor real e confere a linha em sessoes_revogadas e o delete do cookie."
    teste_funcional: "Depois de sair, usuarioDaSessao recusa o token antigo e aceita o de outra sessao do mesmo usuario, sair sem cookie so redireciona para /entrar, e falha ao gravar a revogacao ainda apaga o cookie e loga so o nome do erro."
    criterio_aceite: "tests/acao-sair.test.ts passa e falha quando a chamada de revogacao sai da acao (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.05", "T-01.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-03.02
    titulo: "salvarSenha grava o cookie real"
    fase: F-03.1
    status: concluida
    objetivo: "Provar a acao salvarSenha sem simular gravarCookieDeSessao: o cookie gravado leva o token da versao nova e os atributos certos."
    arquivos:
      cria: ["tests/acao-salvar-senha.test.ts"]
      altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "tests/acao-salvar-senha.test.ts chama salvarSenha com cookies simulados e o sessao-servidor real e le o cookie gravado no jar."
    teste_funcional: "O cookie gravado tem httpOnly, sameSite lax, path /, o Max-Age do TTL e um token que usuarioDaSessao aceita, enquanto o token anterior e recusado."
    criterio_aceite: "tests/acao-salvar-senha.test.ts passa e falha quando salvarSenha deixa de gravar o cookie (mutacao registrada)."
    depende_de: ["T-03.01", "T-02.06"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-03.03
    titulo: "Renovacao do cookie no proxy"
    fase: F-03.2
    status: concluida
    objetivo: "Criar a renovacao do cookie na resposta do proxy e chama-la de src/proxy.ts, pulando Server Action (POST a uma pagina, com ou sem o cabecalho next-action, o que cobre o formulario sem JavaScript), rotas publicas e o que nao tem cookie."
    arquivos:
      cria: ["src/app/renovar-sessao.ts", "tests/proxy-renovacao.test.ts"]
      altera: ["src/proxy.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/proxy-renovacao.test.ts chama o proxy com requisicoes reais do Next e relogio falso e confere o Set-Cookie de expx_sessao depois da metade da vida."
    teste_funcional: "Antes da metade nao ha Set-Cookie, depois ha um com os atributos de sempre e o mesmo jti, e nao ha em POST a uma pagina nem com cabecalho next-action (mas POST a /api renova), em /embed, /api/publico, /api/telegram e /api/saude, com token revogado, invalido ou erro de banco (que so loga aviso), e o matcher segue excluindo os uploads e os estaticos."
    criterio_aceite: "tests/proxy-renovacao.test.ts e tests/correlacao.test.ts passam e o novo falha quando a chamada de renovacao sai do proxy (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.07", "T-03.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
---

# Tasks — Sprint 03

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-03.01
titulo: "Acao sair revoga a sessao"
objetivo: "Fazer a acao sair ler o token do cookie, revogar o jti, apagar o cookie e redirecionar."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/sprint-03/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-03/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-03/tasks.md", "tests/acao-sair.test.ts"]
  altera: ["src/app/acoes.ts", "src/app/sessao-servidor.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/acao-sair.test.ts chama a acao sair real com cookies simulados e o sessao-servidor real e confere a linha em sessoes_revogadas e o delete do cookie."
teste_funcional: "Depois de sair, usuarioDaSessao recusa o token antigo e aceita o de outra sessao do mesmo usuario, sair sem cookie so redireciona para /entrar, e falha ao gravar a revogacao ainda apaga o cookie e loga so o nome do erro."
criterio_aceite: "tests/acao-sair.test.ts passa e falha quando a chamada de revogacao sai da acao (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.05", "T-01.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 253 arquivos, 2925 passed, 9 skipped, 0 failed
```

---

```yaml
id: T-03.02
titulo: "salvarSenha grava o cookie real"
objetivo: "Provar a acao salvarSenha sem simular gravarCookieDeSessao: o cookie gravado leva o token da versao nova e os atributos certos."
arquivos:
  cria: ["tests/acao-salvar-senha.test.ts"]
  altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "tests/acao-salvar-senha.test.ts chama salvarSenha com cookies simulados e o sessao-servidor real e le o cookie gravado no jar."
teste_funcional: "O cookie gravado tem httpOnly, sameSite lax, path /, o Max-Age do TTL e um token que usuarioDaSessao aceita, enquanto o token anterior e recusado."
criterio_aceite: "tests/acao-salvar-senha.test.ts passa e falha quando salvarSenha deixa de gravar o cookie (mutacao registrada)."
depende_de: ["T-03.01", "T-02.06"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/acao-salvar-senha.test.ts 2 passed; só teste novo, nenhum código alterado
```

---

```yaml
id: T-03.03
titulo: "Renovacao do cookie no proxy"
objetivo: "Criar a renovacao do cookie na resposta do proxy e chama-la de src/proxy.ts, pulando Server Action (POST a uma pagina, com ou sem o cabecalho next-action, o que cobre o formulario sem JavaScript), rotas publicas e o que nao tem cookie."
arquivos:
  cria: ["src/app/renovar-sessao.ts", "tests/proxy-renovacao.test.ts"]
  altera: ["src/proxy.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/proxy-renovacao.test.ts chama o proxy com requisicoes reais do Next e relogio falso e confere o Set-Cookie de expx_sessao depois da metade da vida."
teste_funcional: "Antes da metade nao ha Set-Cookie, depois ha um com os atributos de sempre e o mesmo jti, e nao ha em POST a uma pagina nem com cabecalho next-action (mas POST a /api renova), em /embed, /api/publico, /api/telegram e /api/saude, com token revogado, invalido ou erro de banco (que so loga aviso), e o matcher segue excluindo os uploads e os estaticos."
criterio_aceite: "tests/proxy-renovacao.test.ts e tests/correlacao.test.ts passam e o novo falha quando a chamada de renovacao sai do proxy (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.07", "T-03.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 255 arquivos, 2941 passed, 9 skipped, 0 failed (portão da sprint 03)
```
