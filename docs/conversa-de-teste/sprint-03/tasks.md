---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
sprint_id: sprint-03
atualizado_em: 2026-09-30
sprint:
  titulo: "Turno de conversa com o provedor"
  status: pendente
  criterio_saida: "npm test termina com 0 failed; tests/chat.test.ts e tests/chat-falhas.test.ts passam contra o OpenRouter falso; lint e tsc com codigo 0."
  riscos: ["resposta parcial nunca pode ser gravada como completa (PR-41)", "log de erro nao pode conter conteudo da conversa (PR-42): o teste espia console.error"]
  fora_de_escopo: ["formato SSE do navegador - sprint 04", "limites de uso de canal publico - FT-06"]
fases:
  - id: F-03.1
    titulo: "Turno de conversa"
    status: pendente
    criterio_saida: "responderMensagem cobre o caminho feliz, a validacao, a retomada, as falhas do provedor e o cancelamento"
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02]
tasks:
  - id: T-03.01
    titulo: "responderMensagem: caminho feliz e validacoes"
    fase: F-03.1
    status: concluida
    objetivo: "Gerador de eventos que valida, grava a mensagem do usuario, chama o provedor, emite trechos e grava a resposta no fim."
    arquivos:
      cria: ["src/servicos/chat.ts", "tests/chat.test.ts", "tests/apoio/chat.ts"]
      altera: []
    teste_integracao: "tests/chat.test.ts usa o banco de teste, o OpenRouter falso de tests/apoio/openrouter-falso.ts por OPENROUTER_BASE_URL e a chave gravada por salvarChaveDoOpenrouter."
    teste_funcional: "com o falso emite inicio, trechos na ordem e fim com conversaId, mensagemId e tamanho, grava usuario e assistente com o modelo do agente, a requisicao ao falso traz o sistema, o historico e max_tokens 1024, mensagem vazia, so de espacos ou acima de 4000 e recusada antes de gravar, agente inexistente lanca 404, sem chave lanca chat_sem_chave sem gravar, retomar conversa usa o historico, conversa alheia lanca 404."
    criterio_aceite: "O teste passa e o corpo enviado ao falso contem a linha de conduta e no maximo 20 mensagens de historico."
    depende_de: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.02
    titulo: "responderMensagem: falhas e cancelamento"
    fase: F-03.1
    status: pendente
    objetivo: "Tratar erro do provedor, erro no meio do stream, prazo e cancelamento sem gravar resposta parcial e com log correlacionado."
    arquivos:
      cria: ["tests/chat-falhas.test.ts"]
      altera: ["src/servicos/chat.ts"]
    teste_integracao: "tests/chat-falhas.test.ts usa o OpenRouter falso com erroHttp, erroNoMeioApos e intervaloEntreTrechosMs, e espia console.error."
    teste_funcional: "chave invalida, saldo e modelo invalido do provedor lancam o codigo provedor_* correspondente e a mensagem do operador nao contem o corpo do falso, erro apos dois trechos entrega os dois trechos e lanca sem gravar a resposta do assistente, cancelar o sinal no meio termina sem erro e sem gravar (e o falso registra o cancelamento), a mensagem do usuario permanece gravada, e o log e uma linha JSON com correlacao e codigo sem o texto da mensagem."
    criterio_aceite: "O teste passa e nenhuma chamada de console.error contem o texto enviado pelo usuario nem a chave."
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 03 — Turno de conversa com o provedor

## Critério de saída da sprint

npm test termina com 0 failed; tests/chat.test.ts e tests/chat-falhas.test.ts passam contra o OpenRouter falso; lint e tsc com codigo 0.

## Riscos conhecidos

- resposta parcial nunca pode ser gravada como completa (PR-41)
- log de erro nao pode conter conteudo da conversa (PR-42): o teste espia console.error

## Fora de escopo

- formato SSE do navegador - sprint 04
- limites de uso de canal publico - FT-06

## Fase F-03.1 — Turno de conversa

**Tasks:** T-03.01, T-03.02

**Critério de saída:** responderMensagem cobre o caminho feliz, a validacao, a retomada, as falhas do provedor e o cancelamento

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-03 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_03_1["F-03.1 responderMensagem"]
    T_03_01["T-03.01<br/>responderMensagem: caminho f"]
    T_03_02["T-03.02<br/>responderMensagem: falhas e "]
  end
  T_03_01 --> T_03_02
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_03_01 concluida
  class T_03_02 pendente
```

## Tasks

---

```yaml
id: T-03.01
titulo: responderMensagem: caminho feliz e validacoes
objetivo: Gerador de eventos que valida, grava a mensagem do usuario, chama o provedor, emite trechos e grava a resposta no fim.
arquivos:
  cria: [src/servicos/chat.ts, tests/chat.test.ts, tests/apoio/chat.ts]
  altera: []
teste_integracao: tests/chat.test.ts usa o banco de teste, o OpenRouter falso de tests/apoio/openrouter-falso.ts por OPENROUTER_BASE_URL e a chave gravada por salvarChaveDoOpenrouter.
teste_funcional: com o falso emite inicio, trechos na ordem e fim com conversaId, mensagemId e tamanho, grava usuario e assistente com o modelo do agente, a requisicao ao falso traz o sistema, o historico e max_tokens 1024, mensagem vazia, so de espacos ou acima de 4000 e recusada antes de gravar, agente inexistente lanca 404, sem chave lanca chat_sem_chave sem gravar, retomar conversa usa o historico, conversa alheia lanca 404.
criterio_aceite: O teste passa e o corpo enviado ao falso contem a linha de conduta e no maximo 20 mensagens de historico.
depende_de: [T-01.01, T-01.02, T-02.01, T-02.02, T-02.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: chat 15 testes contra o OpenRouter falso; suite 464 verdes; tsc e lint 0
```

---

```yaml
id: T-03.02
titulo: responderMensagem: falhas e cancelamento
objetivo: Tratar erro do provedor, erro no meio do stream, prazo e cancelamento sem gravar resposta parcial e com log correlacionado.
arquivos:
  cria: [tests/chat-falhas.test.ts]
  altera: [src/servicos/chat.ts]
teste_integracao: tests/chat-falhas.test.ts usa o OpenRouter falso com erroHttp, erroNoMeioApos e intervaloEntreTrechosMs, e espia console.error.
teste_funcional: chave invalida, saldo e modelo invalido do provedor lancam o codigo provedor_* correspondente e a mensagem do operador nao contem o corpo do falso, erro apos dois trechos entrega os dois trechos e lanca sem gravar a resposta do assistente, cancelar o sinal no meio termina sem erro e sem gravar (e o falso registra o cancelamento), a mensagem do usuario permanece gravada, e o log e uma linha JSON com correlacao e codigo sem o texto da mensagem.
criterio_aceite: O teste passa e nenhuma chamada de console.error contem o texto enviado pelo usuario nem a chave.
depende_de: [T-03.01]
paralelizavel: false
status: pendente
```

