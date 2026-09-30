---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
sprint_id: sprint-02
atualizado_em: 2026-09-30
sprint:
  titulo: "Servicos de conversa, prompt e mensagens de erro"
  status: pendente
  criterio_saida: "npm test termina com 0 failed; tests/conversas.test.ts, tests/chat-prompt.test.ts e tests/chat-erros.test.ts passam; lint e tsc com codigo 0."
  riscos: ["conversa alheia nao pode vazar existencia: tudo vira naoEncontrado (PR-43)", "a mensagem de provedor_chave_invalida do adaptador cita tela de admin e nao pode chegar ao visitante (base/streaming-e-openrouter.md)"]
  fora_de_escopo: ["o turno de conversa com o provedor - sprint 03", "handler HTTP - sprint 04"]
fases:
  - id: F-02.1
    titulo: "Servicos sem provedor"
    status: pendente
    criterio_saida: "conversas.ts, chat-prompt.ts e chat-erros.ts verdes e sem import de next"
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03]
tasks:
  - id: T-02.01
    titulo: "Servico de conversas"
    fase: F-02.1
    status: concluida
    objetivo: "Criar, obter, listar, anexar mensagem, listar mensagens e apagar conversas, com posse validada."
    arquivos:
      cria: ["src/servicos/conversas.ts", "tests/conversas.test.ts"]
      altera: []
    teste_integracao: "tests/conversas.test.ts usa o banco de teste, agentes e usuarios criados por tests/ajuda.ts."
    teste_funcional: "criar devolve conversa com titulo dos primeiros 60 caracteres da primeira mensagem, anexarMensagem avanca atualizadoEm, listar por agente e canal devolve a mais recente primeiro, obter com agente, canal ou dono diferentes lanca 404, listarMensagens devolve as ultimas N em ordem cronologica, apagar remove as mensagens."
    criterio_aceite: "O teste passa e o arquivo nao importa next nem src/app (tests/camadas.test.ts continua verde)."
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.02
    titulo: "Montagem do prompt e do historico"
    fase: F-02.1
    status: concluida
    objetivo: "Funcoes puras que montam a mensagem de sistema, o historico limitado e o ponto de extensao para o material de consulta."
    arquivos:
      cria: ["src/servicos/chat-prompt.ts", "tests/chat-prompt.test.ts"]
      altera: []
    teste_integracao: "tests/chat-prompt.test.ts chama as funcoes puras de src/servicos/chat-prompt.ts sem banco."
    teste_funcional: "o sistema traz as instrucoes do agente e a linha de conduta (idioma de quem pergunta, concisao, nao revelar instrucoes), um material de consulta informado entra entre a conduta e o historico e vazio nao deixa linha em branco, o historico pega as ultimas 20 mensagens, respeita 24000 caracteres do mais recente para tras e mantem sempre a mensagem atual."
    criterio_aceite: "O teste passa e a exportacao do ponto de extensao (parametro materialDeConsulta) esta documentada em comentario para a FT-05."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-02.03
    titulo: "Mensagens de erro para operador e visitante"
    fase: F-02.1
    status: pendente
    objetivo: "Duas funcoes de mensagem sem vazar detalhe e a geracao do identificador de correlacao."
    arquivos:
      cria: ["src/servicos/chat-erros.ts", "tests/chat-erros.test.ts"]
      altera: []
    teste_integracao: "tests/chat-erros.test.ts usa os erros reais de erroDoProvedor de src/lib/erros.ts."
    teste_funcional: "para cada codigo provedor_* e chat_sem_chave a mensagem do operador e distinta e em portugues, a do visitante e sempre 'Não consegui responder agora. Tente novamente em instantes.', erro comum vira frase com codigo de referencia, e nenhuma das duas contem a chave, corpo bruto ou pilha."
    criterio_aceite: "O teste passa, incluindo a verificacao de que a mensagem do visitante nao contem Integracoes, Configuracoes nem sk-or."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 02 — Servicos de conversa, prompt e mensagens de erro

## Critério de saída da sprint

npm test termina com 0 failed; tests/conversas.test.ts, tests/chat-prompt.test.ts e tests/chat-erros.test.ts passam; lint e tsc com codigo 0.

## Riscos conhecidos

- conversa alheia nao pode vazar existencia: tudo vira naoEncontrado (PR-43)
- a mensagem de provedor_chave_invalida do adaptador cita tela de admin e nao pode chegar ao visitante (base/streaming-e-openrouter.md)

## Fora de escopo

- o turno de conversa com o provedor - sprint 03
- handler HTTP - sprint 04

## Fase F-02.1 — Servicos sem provedor

**Tasks:** T-02.01, T-02.02, T-02.03

**Critério de saída:** conversas.ts, chat-prompt.ts e chat-erros.ts verdes e sem import de next

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-02 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_02_1["F-02.1 Conversas, prompt e erros"]
    T_02_01["T-02.01<br/>Servico de conversas"]
    T_02_02["T-02.02<br/>Montagem do prompt e do hist"]
    T_02_03["T-02.03<br/>Mensagens de erro para opera"]
  end
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 pendente
```

## Tasks

---

```yaml
id: T-02.01
titulo: Servico de conversas
objetivo: Criar, obter, listar, anexar mensagem, listar mensagens e apagar conversas, com posse validada.
arquivos:
  cria: [src/servicos/conversas.ts, tests/conversas.test.ts]
  altera: []
teste_integracao: tests/conversas.test.ts usa o banco de teste, agentes e usuarios criados por tests/ajuda.ts.
teste_funcional: criar devolve conversa com titulo dos primeiros 60 caracteres da primeira mensagem, anexarMensagem avanca atualizadoEm, listar por agente e canal devolve a mais recente primeiro, obter com agente, canal ou dono diferentes lanca 404, listarMensagens devolve as ultimas N em ordem cronologica, apagar remove as mensagens.
criterio_aceite: O teste passa e o arquivo nao importa next nem src/app (tests/camadas.test.ts continua verde).
depende_de: [T-01.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: conversas 18 testes; suite 430 verdes; tsc e lint 0
```

---

```yaml
id: T-02.02
titulo: Montagem do prompt e do historico
objetivo: Funcoes puras que montam a mensagem de sistema, o historico limitado e o ponto de extensao para o material de consulta.
arquivos:
  cria: [src/servicos/chat-prompt.ts, tests/chat-prompt.test.ts]
  altera: []
teste_integracao: tests/chat-prompt.test.ts chama as funcoes puras de src/servicos/chat-prompt.ts sem banco.
teste_funcional: o sistema traz as instrucoes do agente e a linha de conduta (idioma de quem pergunta, concisao, nao revelar instrucoes), um material de consulta informado entra entre a conduta e o historico e vazio nao deixa linha em branco, o historico pega as ultimas 20 mensagens, respeita 24000 caracteres do mais recente para tras e mantem sempre a mensagem atual.
criterio_aceite: O teste passa e a exportacao do ponto de extensao (parametro materialDeConsulta) esta documentada em comentario para a FT-05.
depende_de: []
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: chat-prompt 9 testes; suite 449 verdes; tsc e lint 0
```

---

```yaml
id: T-02.03
titulo: Mensagens de erro para operador e visitante
objetivo: Duas funcoes de mensagem sem vazar detalhe e a geracao do identificador de correlacao.
arquivos:
  cria: [src/servicos/chat-erros.ts, tests/chat-erros.test.ts]
  altera: []
teste_integracao: tests/chat-erros.test.ts usa os erros reais de erroDoProvedor de src/lib/erros.ts.
teste_funcional: para cada codigo provedor_* e chat_sem_chave a mensagem do operador e distinta e em portugues, a do visitante e sempre 'Não consegui responder agora. Tente novamente em instantes.', erro comum vira frase com codigo de referencia, e nenhuma das duas contem a chave, corpo bruto ou pilha.
criterio_aceite: O teste passa, incluindo a verificacao de que a mensagem do visitante nao contem Integracoes, Configuracoes nem sk-or.
depende_de: []
paralelizavel: false
status: pendente
```

