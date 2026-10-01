---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-05
atualizado_em: 2026-10-01
tasks:
  - id: T-05.01
    titulo: "Cookie do login real e login logo depois da troca de senha"
    fase: F-05.1
    status: concluida
    objetivo: "Provar contra next start o Set-Cookie do login real e o login imediato depois da troca de senha."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/sprint-05/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-05/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-05/tasks.md", "tests/sessao-fim-a-fim.test.ts"]
      altera: ["tests/apoio/login-http.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "tests/sessao-fim-a-fim.test.ts sobe o servidor de producao na porta 3252 com JWT_TTL_SEGUNDOS=8 (TTL fixo para os tres casos da sprint) e faz o login pelo formulario real."
    teste_funcional: "O Set-Cookie traz HttpOnly, SameSite=Lax, Path=/, Secure e Max-Age igual ao TTL, e o login feito logo depois da troca de senha pelo formulario de /perfil/senha abre /perfil enquanto o cookie anterior a troca recebe 307."
    criterio_aceite: "npm run build executado depois da ultima mudanca em src/, os dois casos passam e o teste falha quando secure ou httpOnly saem do cookie (mutacao registrada)."
    depende_de: ["T-02.06", "T-03.02", "T-01.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.02
    titulo: "Logout e reuso do cookie roubado"
    fase: F-05.1
    status: concluida
    objetivo: "Provar contra next start que sair revoga: o cookie copiado antes e barrado depois, e outra sessao do mesmo usuario continua."
    arquivos:
      cria: []
      altera: ["tests/sessao-fim-a-fim.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "O teste faz login duas vezes, envia o formulario Sair logo apos o login (antes da metade da vida do token) com a primeira sessao e reutiliza o cookie copiado em pagina e em rota de API; a prova e a revogacao, nao o Set-Cookie da resposta."
    teste_funcional: "A pagina responde 307 para /entrar e a API responde 401 com o cookie roubado, a resposta do Sair apaga o cookie e a segunda sessao segue com 200."
    criterio_aceite: "npm run build executado depois da ultima mudanca em src/, o caso passa e falha quando a acao sair deixa de revogar (mutacao registrada)."
    depende_de: ["T-05.01", "T-03.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.03
    titulo: "Renovacao do usuario ativo e queda do inativo"
    fase: F-05.1
    status: concluida
    objetivo: "Provar contra next start com TTL curto que quem usa continua logado alem do TTL e quem some e derrubado."
    arquivos:
      cria: []
      altera: ["tests/sessao-fim-a-fim.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "Com JWT_TTL_SEGUNDOS curto, o teste usa a sessao depois da metade da vida e le o Set-Cookie renovado."
    teste_funcional: "Com o cookie renovado a pagina segue 200 depois do instante em que o original expiraria, e uma segunda sessao sem uso passa a receber 307 depois do TTL."
    criterio_aceite: "npm run build executado depois da ultima mudanca em src/, o caso passa e falha quando o proxy deixa de renovar (mutacao registrada)."
    depende_de: ["T-05.02", "T-03.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.04
    titulo: "Portoes: suite inteira, tsc, lint, build e audit"
    fase: F-05.2
    status: concluida
    objetivo: "Rodar os portoes da feature com a suite inteira e registrar o resultado e as mutacoes."
    arquivos:
      cria: []
      altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
    teste_integracao: "npm run build, npx tsc --noEmit, npm run lint e a suite inteira rodam sem erro, uma de cada vez."
    teste_funcional: "npm audit --audit-level=high devolve 0 vulnerabilidades e a suite inteira termina com 0 testes falhando."
    criterio_aceite: "Todos os comandos saem com 0 e MUTACOES.md tem uma linha por protecao provada."
    depende_de: ["T-05.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
---

# Tasks — Sprint 05

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-05.01
titulo: "Cookie do login real e login logo depois da troca de senha"
objetivo: "Provar contra next start o Set-Cookie do login real e o login imediato depois da troca de senha."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/sprint-05/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-05/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-05/tasks.md", "tests/sessao-fim-a-fim.test.ts"]
  altera: ["tests/apoio/login-http.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "tests/sessao-fim-a-fim.test.ts sobe o servidor de producao na porta 3252 com JWT_TTL_SEGUNDOS=8 (TTL fixo para os tres casos da sprint) e faz o login pelo formulario real."
teste_funcional: "O Set-Cookie traz HttpOnly, SameSite=Lax, Path=/, Secure e Max-Age igual ao TTL, e o login feito logo depois da troca de senha pelo formulario de /perfil/senha abre /perfil enquanto o cookie anterior a troca recebe 307."
criterio_aceite: "npm run build executado depois da ultima mudanca em src/, os dois casos passam e o teste falha quando secure ou httpOnly saem do cookie (mutacao registrada)."
depende_de: ["T-02.06", "T-03.02", "T-01.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/sessao-fim-a-fim.test.ts 2 passed contra next start na porta 3252 (TTL 8 s); build antes; só teste novo
```

---

```yaml
id: T-05.02
titulo: "Logout e reuso do cookie roubado"
objetivo: "Provar contra next start que sair revoga: o cookie copiado antes e barrado depois, e outra sessao do mesmo usuario continua."
arquivos:
  cria: []
  altera: ["tests/sessao-fim-a-fim.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "O teste faz login duas vezes, envia o formulario Sair logo apos o login (antes da metade da vida do token) com a primeira sessao e reutiliza o cookie copiado em pagina e em rota de API; a prova e a revogacao, nao o Set-Cookie da resposta."
teste_funcional: "A pagina responde 307 para /entrar e a API responde 401 com o cookie roubado, a resposta do Sair apaga o cookie e a segunda sessao segue com 200."
criterio_aceite: "npm run build executado depois da ultima mudanca em src/, o caso passa e falha quando a acao sair deixa de revogar (mutacao registrada)."
depende_de: ["T-05.01", "T-03.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/sessao-fim-a-fim.test.ts 3 passed contra next start; build antes; só teste novo
```

---

```yaml
id: T-05.03
titulo: "Renovacao do usuario ativo e queda do inativo"
objetivo: "Provar contra next start com TTL curto que quem usa continua logado alem do TTL e quem some e derrubado."
arquivos:
  cria: []
  altera: ["tests/sessao-fim-a-fim.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "Com JWT_TTL_SEGUNDOS curto, o teste usa a sessao depois da metade da vida e le o Set-Cookie renovado."
teste_funcional: "Com o cookie renovado a pagina segue 200 depois do instante em que o original expiraria, e uma segunda sessao sem uso passa a receber 307 depois do TTL."
criterio_aceite: "npm run build executado depois da ultima mudanca em src/, o caso passa e falha quando o proxy deixa de renovar (mutacao registrada)."
depende_de: ["T-05.02", "T-03.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/sessao-fim-a-fim.test.ts 4 passed contra next start (TTL 8 s, esperas reais); build antes; só teste novo
```

---

```yaml
id: T-05.04
titulo: "Portoes: suite inteira, tsc, lint, build e audit"
objetivo: "Rodar os portoes da feature com a suite inteira e registrar o resultado e as mutacoes."
arquivos:
  cria: []
  altera: ["docs/sessao-e-acesso-endurecidos/MUTACOES.md"]
teste_integracao: "npm run build, npx tsc --noEmit, npm run lint e a suite inteira rodam sem erro, uma de cada vez."
teste_funcional: "npm audit --audit-level=high devolve 0 vulnerabilidades e a suite inteira termina com 0 testes falhando."
criterio_aceite: "Todos os comandos saem com 0 e MUTACOES.md tem uma linha por protecao provada."
depende_de: ["T-05.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — build, tsc --noEmit, eslint e audit (0 vulnerabilidades) limpos; suíte inteira: 261 arquivos, 2972 passed, 9 skipped, 0 failed (portão da sprint 05)
```
