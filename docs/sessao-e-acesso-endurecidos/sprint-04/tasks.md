---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-04
atualizado_em: 2026-10-01
tasks:
  - id: T-04.01
    titulo: "Limite de login provado na acao"
    fase: F-04.1
    status: concluida
    objetivo: "Provar o limite de tentativas de login pela acao autenticar, com cookies e cabecalhos simulados e o sessao-servidor real."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/sprint-04/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-04/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-04/tasks.md", "tests/acao-autenticar-limite.test.ts"]
      altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "tests/acao-autenticar-limite.test.ts chama autenticar com TRUST_PROXY=1 e x-forwarded-for fixo e confere a sexta tentativa do mesmo IP e e-mail barrada com Muitas tentativas e a vigesima primeira do mesmo IP com e-mails diferentes."
    teste_funcional: "Credencial certa dentro do limite redireciona para / com cookie gravado, o limite reinicia 61 segundos depois com vi.setSystemTime e outro IP nao e afetado."
    criterio_aceite: "tests/acao-autenticar-limite.test.ts passa e falha quando a chamada exigirLimiteDeLogin sai de autenticar (mutacao registrada)."
    depende_de: ["T-01.01", "T-01.02", "T-02.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-04.02
    titulo: "Limite de uso na leitura publica da conversa"
    fase: F-04.1
    status: concluida
    objetivo: "Fazer o GET publico da conversa passar o IP e exigir o limite por IP e agente antes de ler o banco."
    arquivos:
      cria: ["tests/publico-conversa-limite.test.ts"]
      altera: ["src/servicos/chat-publico.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts", "tests/chat-publico.test.ts", "tests/publico-conversa-rota.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/publico-conversa-limite.test.ts chama retomarConversaDoVisitante com limitador e relogio injetados e depois o GET real no servidor de producao na porta 3251."
    teste_funcional: "A 11a leitura do mesmo IP e agente no minuto recebe 429 com Retry-After e corpo so com codigo e mensagem, sem dado do agente, e a leitura volta a passar depois da janela."
    criterio_aceite: "npm run build executado depois da ultima mudanca em src/, tests/publico-conversa-limite.test.ts e os testes publicos existentes passam e o novo falha quando o limite sai da leitura (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-04.03
    titulo: "auditoria.listar confere o papel admin"
    fase: F-04.2
    status: concluida
    objetivo: "Fazer listar receber o ator e exigir admin no servico, ajustando a pagina e os testes que a chamam."
    arquivos:
      cria: ["tests/auditoria-guarda.test.ts"]
      altera: ["src/servicos/auditoria.ts", "src/app/(sistema)/configuracoes/auditoria/page.tsx", "tests/auditoria.test.ts", "tests/auditoria-somente-acrescimo.test.ts", "tests/backup-servico.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/auditoria-guarda.test.ts chama listar com usuario comum, sem ator (undefined, conferido por autor?.id antes do papel) e com admin contra o banco de teste."
    teste_funcional: "Usuario comum recebe 403, ator ausente recebe 401, o admin recebe a pagina de registros e a pagina de auditoria continua abrindo para o admin."
    criterio_aceite: "tests/auditoria-guarda.test.ts e os testes de auditoria passam e o novo falha quando exigirAdmin sai de listar (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-04.04
    titulo: "Pagina de detalhe da conversa com guarda propria"
    fase: F-04.2
    status: pendente
    objetivo: "Fazer conversas/[id]/page.tsx chamar exigirUsuario antes de ler a conversa."
    arquivos:
      cria: ["tests/conversas-detalhe-guarda.test.tsx"]
      altera: ["src/app/(sistema)/conversas/[id]/page.tsx", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/conversas-detalhe-guarda.test.tsx renderiza a pagina com exigirUsuario simulado para redirecionar e carregarConversa observado."
    teste_funcional: "Sem sessao a pagina redireciona sem chamar carregarConversa e com sessao ela renderiza o detalhe, e tests/conversas-detalhe-rota.test.ts continua passando."
    criterio_aceite: "Os dois testes passam e o novo falha quando exigirUsuario sai da pagina (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.05
    titulo: "Teste de arquitetura das guardas e varredura dos servicos"
    fase: F-04.2
    status: pendente
    objetivo: "Enumerar as telas e rotas e falhar sem guarda propria, com excecoes publicas listadas, e registrar a varredura dos servicos de administracao."
    arquivos:
      cria: ["tests/guardas-arquitetura.test.ts", "tests/apoio/guardas.ts", "docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md"]
      altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "tests/guardas-arquitetura.test.ts varre src/app/(sistema) e src/app/api com fs e a funcao pura de verificacao e testada com amostras sinteticas."
    teste_funcional: "Uma pagina sem exigirUsuario, uma pagina de configuracoes sem exigirUsuarioAdmin, uma rota sem usuarioAtual ou exigirSessao e uma excecao que deixou de existir falham, e a arvore real passa com a lista de excecoes publicas comentada."
    criterio_aceite: "tests/guardas-arquitetura.test.ts passa, falha em cada amostra sem guarda e VARREDURA-DE-GUARDAS.md lista cada funcao exportada de administracao e o que foi corrigido (mutacao registrada)."
    depende_de: ["T-04.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-04.01
titulo: "Limite de login provado na acao"
objetivo: "Provar o limite de tentativas de login pela acao autenticar, com cookies e cabecalhos simulados e o sessao-servidor real."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/sprint-04/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-04/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-04/tasks.md", "tests/acao-autenticar-limite.test.ts"]
  altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "tests/acao-autenticar-limite.test.ts chama autenticar com TRUST_PROXY=1 e x-forwarded-for fixo e confere a sexta tentativa do mesmo IP e e-mail barrada com Muitas tentativas e a vigesima primeira do mesmo IP com e-mails diferentes."
teste_funcional: "Credencial certa dentro do limite redireciona para / com cookie gravado, o limite reinicia 61 segundos depois com vi.setSystemTime e outro IP nao e afetado."
criterio_aceite: "tests/acao-autenticar-limite.test.ts passa e falha quando a chamada exigirLimiteDeLogin sai de autenticar (mutacao registrada)."
depende_de: ["T-01.01", "T-01.02", "T-02.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/acao-autenticar-limite.test.ts 6 passed; só teste novo, nenhum código alterado
```

---

```yaml
id: T-04.02
titulo: "Limite de uso na leitura publica da conversa"
objetivo: "Fazer o GET publico da conversa passar o IP e exigir o limite por IP e agente antes de ler o banco."
arquivos:
  cria: ["tests/publico-conversa-limite.test.ts"]
  altera: ["src/servicos/chat-publico.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts", "tests/chat-publico.test.ts", "tests/publico-conversa-rota.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/publico-conversa-limite.test.ts chama retomarConversaDoVisitante com limitador e relogio injetados e depois o GET real no servidor de producao na porta 3251."
teste_funcional: "A 11a leitura do mesmo IP e agente no minuto recebe 429 com Retry-After e corpo so com codigo e mensagem, sem dado do agente, e a leitura volta a passar depois da janela."
criterio_aceite: "npm run build executado depois da ultima mudanca em src/, tests/publico-conversa-limite.test.ts e os testes publicos existentes passam e o novo falha quando o limite sai da leitura (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-04.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 257 arquivos, 2950 passed, 9 skipped, 0 failed; build antes
```

---

```yaml
id: T-04.03
titulo: "auditoria.listar confere o papel admin"
objetivo: "Fazer listar receber o ator e exigir admin no servico, ajustando a pagina e os testes que a chamam."
arquivos:
  cria: ["tests/auditoria-guarda.test.ts"]
  altera: ["src/servicos/auditoria.ts", "src/app/(sistema)/configuracoes/auditoria/page.tsx", "tests/auditoria.test.ts", "tests/auditoria-somente-acrescimo.test.ts", "tests/backup-servico.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/auditoria-guarda.test.ts chama listar com usuario comum, sem ator (undefined, conferido por autor?.id antes do papel) e com admin contra o banco de teste."
teste_funcional: "Usuario comum recebe 403, ator ausente recebe 401, o admin recebe a pagina de registros e a pagina de auditoria continua abrindo para o admin."
criterio_aceite: "tests/auditoria-guarda.test.ts e os testes de auditoria passam e o novo falha quando exigirAdmin sai de listar (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-04.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 258 arquivos, 2954 passed, 9 skipped, 0 failed
```

---

```yaml
id: T-04.04
titulo: "Pagina de detalhe da conversa com guarda propria"
objetivo: "Fazer conversas/[id]/page.tsx chamar exigirUsuario antes de ler a conversa."
arquivos:
  cria: ["tests/conversas-detalhe-guarda.test.tsx"]
  altera: ["src/app/(sistema)/conversas/[id]/page.tsx", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/conversas-detalhe-guarda.test.tsx renderiza a pagina com exigirUsuario simulado para redirecionar e carregarConversa observado."
teste_funcional: "Sem sessao a pagina redireciona sem chamar carregarConversa e com sessao ela renderiza o detalhe, e tests/conversas-detalhe-rota.test.ts continua passando."
criterio_aceite: "Os dois testes passam e o novo falha quando exigirUsuario sai da pagina (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-04.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.05
titulo: "Teste de arquitetura das guardas e varredura dos servicos"
objetivo: "Enumerar as telas e rotas e falhar sem guarda propria, com excecoes publicas listadas, e registrar a varredura dos servicos de administracao."
arquivos:
  cria: ["tests/guardas-arquitetura.test.ts", "tests/apoio/guardas.ts", "docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md"]
  altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "tests/guardas-arquitetura.test.ts varre src/app/(sistema) e src/app/api com fs e a funcao pura de verificacao e testada com amostras sinteticas."
teste_funcional: "Uma pagina sem exigirUsuario, uma pagina de configuracoes sem exigirUsuarioAdmin, uma rota sem usuarioAtual ou exigirSessao e uma excecao que deixou de existir falham, e a arvore real passa com a lista de excecoes publicas comentada."
criterio_aceite: "tests/guardas-arquitetura.test.ts passa, falha em cada amostra sem guarda e VARREDURA-DE-GUARDAS.md lista cada funcao exportada de administracao e o que foi corrigido (mutacao registrada)."
depende_de: ["T-04.04"]
paralelizavel: false
status: pendente
```
