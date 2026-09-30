---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-06
atualizado_em: 2026-09-30
tasks:
  - id: T-06.01
    titulo: "Aba, subrota e acao de salvar"
    fase: F-06.1
    status: pendente
    objetivo: "Acrescentar a aba Publicar, a subrota com formulario e a Server Action salvarChat."
    arquivos:
      cria: ["src/app/(sistema)/agentes/[id]/publicar/page.tsx", "src/app/(sistema)/agentes/[id]/publicar/loading.tsx", "src/componentes/FormularioDoChat.tsx", "tests/publicar-acao.test.ts", "docs/chat-embutido/sprint-06/sprint.md", "docs/chat-embutido/sprint-06/fases.md", "docs/chat-embutido/sprint-06/tasks.md"]
      altera: ["src/componentes/abas-do-agente.ts", "src/app/acoes.ts", "tests/abas-do-agente.test.tsx"]
    teste_integracao: "Contra o banco, a acao salvarChat grava a configuracao do agente e recusa entrada invalida com a mensagem do servico."
    teste_funcional: "A lista de abas tem Publicar depois de Testar, salvar com ativo ligado e cor valida devolve sucesso, com cor 'azul' devolve o erro de cor e a pagina nao exibe chave do OpenRouter."
    criterio_aceite: "tests/publicar-acao.test.ts e tests/abas-do-agente.test.tsx passam."
    depende_de: ["T-05.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.02
    titulo: "Codigo para incorporar, previa e avisos"
    fase: F-06.1
    status: pendente
    objetivo: "Criar o bloco do script com Copiar e fallback, a previa em iframe, a amostra de cor com aviso de contraste e os avisos."
    arquivos:
      cria: ["src/componentes/CodigoParaIncorporar.tsx", "src/componentes/PreviaDoChat.tsx", "src/componentes/publicar-logica.ts", "tests/publicar-ui.test.tsx"]
      altera: ["src/app/(sistema)/agentes/[id]/publicar/page.tsx", "src/estilos/global.css"]
    teste_integracao: "Renderizado no servidor, o bloco mostra o snippet com a origem informada e o id do agente e a previa aponta para /embed/<id>?previa=1."
    teste_funcional: "O snippet usa APP_URL quando definida e senao a origem da requisicao, cor clara demais gera o aviso de baixo contraste, sem navigator.clipboard o botao seleciona o texto, e os avisos de HTTPS, TRUST_PROXY, fonte pronta e chave aparecem."
    criterio_aceite: "tests/publicar-ui.test.tsx e tests/tokens.test.ts passam."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.03
    titulo: "Seed com o chat publicado"
    fase: F-06.2
    status: pendente
    objetivo: "Fazer a seed criar a configuracao do chat do agente de exemplo, ativa e idempotente."
    arquivos:
      cria: []
      altera: ["prisma/seed.ts", "tests/seed.test.ts"]
    teste_integracao: "Rodada duas vezes contra o banco de teste, a seed deixa uma configuracao ativa do agente de exemplo e nao sobrescreve edicao."
    teste_funcional: "configuracaoPublica do agente de exemplo devolve ativo true, titulo, 3 sugestoes e aviso de privacidade, e dominiosDoEmbed devolve lista vazia."
    criterio_aceite: "tests/seed.test.ts passa."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.04
    titulo: "Rota da aba Publicar em producao"
    fase: F-06.2
    status: pendente
    objetivo: "Provar por HTTP real a aba Publicar e o acesso."
    arquivos:
      cria: ["tests/publicar-rota.test.ts"]
      altera: []
    teste_integracao: "Contra next start, a aba Publicar sem sessao manda para o login e com sessao de usuario comum abre com o formulario preenchido."
    teste_funcional: "A pagina traz o snippet com data-agent igual ao id, a previa com /embed/<id>?previa=1, agente inexistente devolve 404 e a aba Publicar aparece marcada."
    criterio_aceite: "tests/publicar-rota.test.ts passa."
    depende_de: ["T-06.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-06.01
titulo: "Aba, subrota e acao de salvar"
objetivo: "Acrescentar a aba Publicar, a subrota com formulario e a Server Action salvarChat."
arquivos:
  cria: ["src/app/(sistema)/agentes/[id]/publicar/page.tsx", "src/app/(sistema)/agentes/[id]/publicar/loading.tsx", "src/componentes/FormularioDoChat.tsx", "tests/publicar-acao.test.ts", "docs/chat-embutido/sprint-06/sprint.md", "docs/chat-embutido/sprint-06/fases.md", "docs/chat-embutido/sprint-06/tasks.md"]
  altera: ["src/componentes/abas-do-agente.ts", "src/app/acoes.ts", "tests/abas-do-agente.test.tsx"]
teste_integracao: "Contra o banco, a acao salvarChat grava a configuracao do agente e recusa entrada invalida com a mensagem do servico."
teste_funcional: "A lista de abas tem Publicar depois de Testar, salvar com ativo ligado e cor valida devolve sucesso, com cor 'azul' devolve o erro de cor e a pagina nao exibe chave do OpenRouter."
criterio_aceite: "tests/publicar-acao.test.ts e tests/abas-do-agente.test.tsx passam."
depende_de: ["T-05.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.02
titulo: "Codigo para incorporar, previa e avisos"
objetivo: "Criar o bloco do script com Copiar e fallback, a previa em iframe, a amostra de cor com aviso de contraste e os avisos."
arquivos:
  cria: ["src/componentes/CodigoParaIncorporar.tsx", "src/componentes/PreviaDoChat.tsx", "src/componentes/publicar-logica.ts", "tests/publicar-ui.test.tsx"]
  altera: ["src/app/(sistema)/agentes/[id]/publicar/page.tsx", "src/estilos/global.css"]
teste_integracao: "Renderizado no servidor, o bloco mostra o snippet com a origem informada e o id do agente e a previa aponta para /embed/<id>?previa=1."
teste_funcional: "O snippet usa APP_URL quando definida e senao a origem da requisicao, cor clara demais gera o aviso de baixo contraste, sem navigator.clipboard o botao seleciona o texto, e os avisos de HTTPS, TRUST_PROXY, fonte pronta e chave aparecem."
criterio_aceite: "tests/publicar-ui.test.tsx e tests/tokens.test.ts passam."
depende_de: ["T-06.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.03
titulo: "Seed com o chat publicado"
objetivo: "Fazer a seed criar a configuracao do chat do agente de exemplo, ativa e idempotente."
arquivos:
  cria: []
  altera: ["prisma/seed.ts", "tests/seed.test.ts"]
teste_integracao: "Rodada duas vezes contra o banco de teste, a seed deixa uma configuracao ativa do agente de exemplo e nao sobrescreve edicao."
teste_funcional: "configuracaoPublica do agente de exemplo devolve ativo true, titulo, 3 sugestoes e aviso de privacidade, e dominiosDoEmbed devolve lista vazia."
criterio_aceite: "tests/seed.test.ts passa."
depende_de: ["T-06.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.04
titulo: "Rota da aba Publicar em producao"
objetivo: "Provar por HTTP real a aba Publicar e o acesso."
arquivos:
  cria: ["tests/publicar-rota.test.ts"]
  altera: []
teste_integracao: "Contra next start, a aba Publicar sem sessao manda para o login e com sessao de usuario comum abre com o formulario preenchido."
teste_funcional: "A pagina traz o snippet com data-agent igual ao id, a previa com /embed/<id>?previa=1, agente inexistente devolve 404 e a aba Publicar aparece marcada."
criterio_aceite: "tests/publicar-rota.test.ts passa."
depende_de: ["T-06.03"]
paralelizavel: false
status: pendente
```
