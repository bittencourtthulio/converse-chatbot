---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-05
atualizado_em: 2026-09-30
tasks:
  - id: T-05.01
    titulo: "Handler do webhook com resposta rapida"
    fase: F-05.1
    status: concluida
    objetivo: "Criar POST /api/telegram/[agenteId]/webhook fino (tratarWebhook no servico, 200 imediato e after com captura de erro)."
    arquivos:
      cria: ["src/app/api/telegram/[agenteId]/webhook/route.ts", "tests/telegram-webhook-rota.test.ts", "docs/canal-telegram/sprint-05/sprint.md", "docs/canal-telegram/sprint-05/fases.md", "docs/canal-telegram/sprint-05/tasks.md"]
      altera: ["src/servicos/telegram-webhook.ts", "tests/apoio/servidor.ts"]
    teste_integracao: "Contra o servidor de producao com OpenRouter e Telegram falsos, um update valido com o segredo certo recebe 200 vazio antes da resposta e a sendMessage chega ao simulado depois."
    teste_funcional: "Segredo ausente ou errado e agente sem canal dao 401 sem corpo informativo, o reenvio do mesmo update_id nao gera segunda resposta, canal pausado da 200 sem enviar nada e corpo acima de 64 KB da 413."
    criterio_aceite: "tests/telegram-webhook-rota.test.ts passa depois de npm run build e o log do servidor de teste nao contem o token."
    depende_de: ["T-04.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.02
    titulo: "Acoes de servidor do canal"
    fase: F-05.2
    status: pendente
    objetivo: "Acrescentar em src/app/acoes.ts as acoes conectarTelegram, desconectarTelegram, pausarTelegram, retomarTelegram, verificarTelegram e salvarLimiteTelegram, sem token no retorno."
    arquivos:
      cria: ["tests/telegram-acoes.test.ts"]
      altera: ["src/app/acoes.ts"]
    teste_integracao: "Chamadas as acoes com a sessao de um usuario, o estado do canal muda no banco e sem sessao a acao recusa."
    teste_funcional: "O retorno de conectarTelegram com sucesso nao contem o token enviado, erro de token invalido volta em portugues sem o token e verificarTelegram devolve a mensagem de URL que nao confere."
    criterio_aceite: "tests/telegram-acoes.test.ts passa e o retorno serializado de cada acao nao contem o token de teste."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 05

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-05.01
titulo: "Handler do webhook com resposta rapida"
objetivo: "Criar POST /api/telegram/[agenteId]/webhook fino (tratarWebhook no servico, 200 imediato e after com captura de erro)."
arquivos:
  cria: ["src/app/api/telegram/[agenteId]/webhook/route.ts", "tests/telegram-webhook-rota.test.ts", "docs/canal-telegram/sprint-05/sprint.md", "docs/canal-telegram/sprint-05/fases.md", "docs/canal-telegram/sprint-05/tasks.md"]
  altera: ["src/servicos/telegram-webhook.ts", "tests/apoio/servidor.ts"]
teste_integracao: "Contra o servidor de producao com OpenRouter e Telegram falsos, um update valido com o segredo certo recebe 200 vazio antes da resposta e a sendMessage chega ao simulado depois."
teste_funcional: "Segredo ausente ou errado e agente sem canal dao 401 sem corpo informativo, o reenvio do mesmo update_id nao gera segunda resposta, canal pausado da 200 sem enviar nada e corpo acima de 64 KB da 413."
criterio_aceite: "tests/telegram-webhook-rota.test.ts passa depois de npm run build e o log do servidor de teste nao contem o token."
depende_de: ["T-04.04"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: parcial — tests/telegram-webhook-rota.test.ts, 9 passed depois de npm run build; tsc e eslint limpos
```

---

```yaml
id: T-05.02
titulo: "Acoes de servidor do canal"
objetivo: "Acrescentar em src/app/acoes.ts as acoes conectarTelegram, desconectarTelegram, pausarTelegram, retomarTelegram, verificarTelegram e salvarLimiteTelegram, sem token no retorno."
arquivos:
  cria: ["tests/telegram-acoes.test.ts"]
  altera: ["src/app/acoes.ts"]
teste_integracao: "Chamadas as acoes com a sessao de um usuario, o estado do canal muda no banco e sem sessao a acao recusa."
teste_funcional: "O retorno de conectarTelegram com sucesso nao contem o token enviado, erro de token invalido volta em portugues sem o token e verificarTelegram devolve a mensagem de URL que nao confere."
criterio_aceite: "tests/telegram-acoes.test.ts passa e o retorno serializado de cada acao nao contem o token de teste."
depende_de: ["T-05.01"]
paralelizavel: false
status: pendente
```
