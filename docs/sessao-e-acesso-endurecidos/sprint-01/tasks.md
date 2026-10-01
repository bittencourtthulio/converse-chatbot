---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-01
atualizado_em: 2026-10-01
tasks:
  - id: T-01.01
    titulo: "Relogio do limitador alcancavel por relogio falso"
    fase: F-01.1
    status: concluida
    objetivo: "Fazer o limitador padrao do processo usar o relogio de Date.now no instante da chamada, para que vi.setSystemTime o alcance, e abrir o registro das mutacoes da feature."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/sprint-01/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-01/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-01/tasks.md", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
      altera: ["src/lib/limite-de-uso.ts", "tests/limite-de-uso.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/limite-de-uso.test.ts usa o limitadorPadrao do modulo com vi.useFakeTimers e vi.setSystemTime depois do import e prova que a janela anda com o relogio falso."
    teste_funcional: "Com a chave x e max 5, as 5 primeiras chamadas passam, a sexta e recusada com reiniciaEmMs de 60000 e, 61 segundos depois, a setima passa."
    criterio_aceite: "tests/limite-de-uso.test.ts passa e falha quando o relogio padrao volta a ser a referencia Date.now capturada na criacao (mutacao registrada em MUTACOES.md) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-01.02
    titulo: "Cookies e cabecalhos falsos do next/headers"
    fase: F-01.1
    status: concluida
    objetivo: "Criar o apoio de teste que simula cookies() e headers() do Next e provar, com ele, o comportamento atual de gravarCookieDeSessao, apagarCookieDeSessao e ipDoCliente."
    arquivos:
      cria: ["tests/apoio/next-falso.ts", "tests/apoio-next-falso.test.ts"]
      altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "Com next/headers simulado pelo apoio, gravarCookieDeSessao e apagarCookieDeSessao reais registram o set e o delete de expx_sessao com as opcoes e ipDoCliente le x-forwarded-for."
    teste_funcional: "O jar devolve o valor gravado com get, devolve undefined depois do delete e headers() devolve o cabecalho configurado; com TRUST_PROXY=1 o IP vem do primeiro valor de x-forwarded-for."
    criterio_aceite: "tests/apoio-next-falso.test.ts passa."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-01.03
    titulo: "Login por formulario contra o servidor de producao"
    fase: F-01.2
    status: concluida
    objetivo: "Criar o apoio que envia formularios de Server Action sem JavaScript a um next start e provar o login real com ele."
    arquivos:
      cria: ["tests/apoio/login-http.ts", "tests/apoio-login-http.test.ts"]
      altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "O apoio le os campos ocultos da acao em GET /entrar, envia e-mail e senha ao servidor de producao na porta 3250 e devolve status, location e Set-Cookie."
    teste_funcional: "Com a senha certa a resposta e 303 para / com Set-Cookie de expx_sessao; com a senha errada e 200 com a mensagem E-mail ou senha incorretos e sem Set-Cookie."
    criterio_aceite: "tests/apoio-login-http.test.ts passa depois de npm run build."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
---

# Tasks — Sprint 01

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-01.01
titulo: "Relogio do limitador alcancavel por relogio falso"
objetivo: "Fazer o limitador padrao do processo usar o relogio de Date.now no instante da chamada, para que vi.setSystemTime o alcance, e abrir o registro das mutacoes da feature."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/sprint-01/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-01/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-01/tasks.md", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
  altera: ["src/lib/limite-de-uso.ts", "tests/limite-de-uso.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/limite-de-uso.test.ts usa o limitadorPadrao do modulo com vi.useFakeTimers e vi.setSystemTime depois do import e prova que a janela anda com o relogio falso."
teste_funcional: "Com a chave x e max 5, as 5 primeiras chamadas passam, a sexta e recusada com reiniciaEmMs de 60000 e, 61 segundos depois, a setima passa."
criterio_aceite: "tests/limite-de-uso.test.ts passa e falha quando o relogio padrao volta a ser a referencia Date.now capturada na criacao (mutacao registrada em MUTACOES.md) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: []
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 243 arquivos, 2866 passed, 9 skipped, 0 failed; mutação do relógio registrada
```

---

```yaml
id: T-01.02
titulo: "Cookies e cabecalhos falsos do next/headers"
objetivo: "Criar o apoio de teste que simula cookies() e headers() do Next e provar, com ele, o comportamento atual de gravarCookieDeSessao, apagarCookieDeSessao e ipDoCliente."
arquivos:
  cria: ["tests/apoio/next-falso.ts", "tests/apoio-next-falso.test.ts"]
  altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "Com next/headers simulado pelo apoio, gravarCookieDeSessao e apagarCookieDeSessao reais registram o set e o delete de expx_sessao com as opcoes e ipDoCliente le x-forwarded-for."
teste_funcional: "O jar devolve o valor gravado com get, devolve undefined depois do delete e headers() devolve o cabecalho configurado; com TRUST_PROXY=1 o IP vem do primeiro valor de x-forwarded-for."
criterio_aceite: "tests/apoio-next-falso.test.ts passa."
depende_de: ["T-01.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/apoio-next-falso.test.ts 4 passed; só apoio de teste
```

---

```yaml
id: T-01.03
titulo: "Login por formulario contra o servidor de producao"
objetivo: "Criar o apoio que envia formularios de Server Action sem JavaScript a um next start e provar o login real com ele."
arquivos:
  cria: ["tests/apoio/login-http.ts", "tests/apoio-login-http.test.ts"]
  altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "O apoio le os campos ocultos da acao em GET /entrar, envia e-mail e senha ao servidor de producao na porta 3250 e devolve status, location e Set-Cookie."
teste_funcional: "Com a senha certa a resposta e 303 para / com Set-Cookie de expx_sessao; com a senha errada e 200 com a mensagem E-mail ou senha incorretos e sem Set-Cookie."
criterio_aceite: "tests/apoio-login-http.test.ts passa depois de npm run build."
depende_de: ["T-01.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/apoio-login-http.test.ts 3 passed contra next start na porta 3250
```
