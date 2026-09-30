---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-01
atualizado_em: 2026-09-30
tasks:
  - id: T-01.01
    titulo: "Migration e modelo da configuracao do chat"
    fase: F-01.1
    status: pendente
    objetivo: "Criar a tabela configuracao_do_chat 1:1 com agente por migration aditiva e o modelo Prisma."
    arquivos:
      cria: ["prisma/migrations/20260930210000_configuracao_do_chat/migration.sql", "tests/configuracao-do-chat-modelo.test.ts", "docs/chat-embutido/sprint-01/sprint.md", "docs/chat-embutido/sprint-01/fases.md", "docs/chat-embutido/sprint-01/tasks.md"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
    teste_integracao: "Com o banco migrado do zero por migrate deploy, uma linha de configuracao e criada com os padroes e some em cascata junto com o agente."
    teste_funcional: "Criar a configuracao so com agenteId devolve ativo false, posicao direita, limiteDiario 500, dominios e sugestoes como lista JSON vazia."
    criterio_aceite: "tests/configuracao-do-chat-modelo.test.ts e tests/migracoes.test.ts passam e a migration nao contem DROP."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: "Modulo de dominios permitidos"
    fase: F-01.1
    status: pendente
    objetivo: "Escrever as funcoes puras de normalizacao, casamento de origem e cabecalho frame-ancestors."
    arquivos:
      cria: ["src/lib/dominios-permitidos.ts", "tests/dominios-permitidos.test.ts"]
      altera: []
    teste_integracao: "As funcoes importam so de bibliotecas (sem next nem servicos) e o eslint das camadas passa sobre src/lib."
    teste_funcional: "normalizarDominio('https://Exemplo.com/x') devolve 'exemplo.com', origemPermitida('https://app.exemplo.com', ['*.exemplo.com']) e true, a de 'https://exemplo.com' e false, lista vazia permite qualquer origem e cabecalhoFrameAncestors([]) devolve \"frame-ancestors *\"."
    criterio_aceite: "tests/dominios-permitidos.test.ts passa com ao menos 15 casos, incluindo porta, curinga, esquema removido, entrada invalida e limite de 20."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: "Modulo de cor e tokens sobre cor do agente"
    fase: F-01.1
    status: pendente
    objetivo: "Escrever contraste, cor do texto por luminancia, validacao de hex e amostras por trios RGB, e os tokens de texto sobre cor."
    arquivos:
      cria: ["src/lib/cor.ts", "tests/cor.test.ts"]
      altera: ["src/estilos/tokens.css"]
    teste_integracao: "tests/tokens.test.ts continua verde com os tokens novos e nenhum arquivo de src tem hex literal."
    teste_funcional: "corDoTextoSobre escolhe texto escuro sobre amarelo claro e claro sobre azul escuro, razaoDeContraste dessa escolha e pelo menos 4,5 para todas as amostras, e normalizarCor('#ABC') devolve o hex de seis digitos em minusculas."
    criterio_aceite: "tests/cor.test.ts e tests/tokens.test.ts passam."
    depende_de: ["T-01.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.04
    titulo: "Leitura de APP_URL publica"
    fase: F-01.2
    status: pendente
    objetivo: "Acrescentar ambiente.appUrlPublica (opcional, sem padrao) e documentar no .env.example."
    arquivos:
      cria: []
      altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts"]
    teste_integracao: "tests/projeto.test.ts confere que o .env.example documenta APP_URL e o teste de ambiente le a variavel do processo."
    teste_funcional: "Com APP_URL='https://x.com/' appUrlPublica devolve 'https://x.com' e sem a variavel devolve undefined, enquanto appUrl segue com o padrao localhost."
    criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.05
    titulo: "happy-dom e apoio de teste de DOM"
    fase: F-01.2
    status: pendente
    objetivo: "Adicionar happy-dom de versao fixa e um apoio que monta a pagina de teste com o script."
    arquivos:
      cria: ["tests/apoio/dom.ts", "tests/ambiente-dom.test.ts"]
      altera: ["package.json", "package-lock.json"]
    teste_integracao: "Um arquivo de teste com '@vitest-environment happy-dom' roda na mesma suite que os de ambiente node e npm audit --audit-level=high devolve 0."
    teste_funcional: "No apoio, montar uma pagina com um elemento com Shadow DOM e disparar um postMessage com origin conhecido faz o ouvinte receber event.origin igual ao informado."
    criterio_aceite: "tests/ambiente-dom.test.ts passa e npm audit --audit-level=high termina sem vulnerabilidade alta."
    depende_de: ["T-01.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-01.01
titulo: "Migration e modelo da configuracao do chat"
objetivo: "Criar a tabela configuracao_do_chat 1:1 com agente por migration aditiva e o modelo Prisma."
arquivos:
  cria: ["prisma/migrations/20260930210000_configuracao_do_chat/migration.sql", "tests/configuracao-do-chat-modelo.test.ts", "docs/chat-embutido/sprint-01/sprint.md", "docs/chat-embutido/sprint-01/fases.md", "docs/chat-embutido/sprint-01/tasks.md"]
  altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
teste_integracao: "Com o banco migrado do zero por migrate deploy, uma linha de configuracao e criada com os padroes e some em cascata junto com o agente."
teste_funcional: "Criar a configuracao so com agenteId devolve ativo false, posicao direita, limiteDiario 500, dominios e sugestoes como lista JSON vazia."
criterio_aceite: "tests/configuracao-do-chat-modelo.test.ts e tests/migracoes.test.ts passam e a migration nao contem DROP."
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.02
titulo: "Modulo de dominios permitidos"
objetivo: "Escrever as funcoes puras de normalizacao, casamento de origem e cabecalho frame-ancestors."
arquivos:
  cria: ["src/lib/dominios-permitidos.ts", "tests/dominios-permitidos.test.ts"]
  altera: []
teste_integracao: "As funcoes importam so de bibliotecas (sem next nem servicos) e o eslint das camadas passa sobre src/lib."
teste_funcional: "normalizarDominio('https://Exemplo.com/x') devolve 'exemplo.com', origemPermitida('https://app.exemplo.com', ['*.exemplo.com']) e true, a de 'https://exemplo.com' e false, lista vazia permite qualquer origem e cabecalhoFrameAncestors([]) devolve \"frame-ancestors *\"."
criterio_aceite: "tests/dominios-permitidos.test.ts passa com ao menos 15 casos, incluindo porta, curinga, esquema removido, entrada invalida e limite de 20."
depende_de: ["T-01.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.03
titulo: "Modulo de cor e tokens sobre cor do agente"
objetivo: "Escrever contraste, cor do texto por luminancia, validacao de hex e amostras por trios RGB, e os tokens de texto sobre cor."
arquivos:
  cria: ["src/lib/cor.ts", "tests/cor.test.ts"]
  altera: ["src/estilos/tokens.css"]
teste_integracao: "tests/tokens.test.ts continua verde com os tokens novos e nenhum arquivo de src tem hex literal."
teste_funcional: "corDoTextoSobre escolhe texto escuro sobre amarelo claro e claro sobre azul escuro, razaoDeContraste dessa escolha e pelo menos 4,5 para todas as amostras, e normalizarCor('#ABC') devolve o hex de seis digitos em minusculas."
criterio_aceite: "tests/cor.test.ts e tests/tokens.test.ts passam."
depende_de: ["T-01.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.04
titulo: "Leitura de APP_URL publica"
objetivo: "Acrescentar ambiente.appUrlPublica (opcional, sem padrao) e documentar no .env.example."
arquivos:
  cria: []
  altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts"]
teste_integracao: "tests/projeto.test.ts confere que o .env.example documenta APP_URL e o teste de ambiente le a variavel do processo."
teste_funcional: "Com APP_URL='https://x.com/' appUrlPublica devolve 'https://x.com' e sem a variavel devolve undefined, enquanto appUrl segue com o padrao localhost."
criterio_aceite: "tests/ambiente.test.ts e tests/projeto.test.ts passam."
depende_de: ["T-01.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.05
titulo: "happy-dom e apoio de teste de DOM"
objetivo: "Adicionar happy-dom de versao fixa e um apoio que monta a pagina de teste com o script."
arquivos:
  cria: ["tests/apoio/dom.ts", "tests/ambiente-dom.test.ts"]
  altera: ["package.json", "package-lock.json"]
teste_integracao: "Um arquivo de teste com '@vitest-environment happy-dom' roda na mesma suite que os de ambiente node e npm audit --audit-level=high devolve 0."
teste_funcional: "No apoio, montar uma pagina com um elemento com Shadow DOM e disparar um postMessage com origin conhecido faz o ouvinte receber event.origin igual ao informado."
criterio_aceite: "tests/ambiente-dom.test.ts passa e npm audit --audit-level=high termina sem vulnerabilidade alta."
depende_de: ["T-01.04"]
paralelizavel: false
status: pendente
```
