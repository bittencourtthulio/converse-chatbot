---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
sprint_id: sprint-02
atualizado_em: 2026-09-30
sprint:
  titulo: "Adaptador OpenRouter em src/lib"
  status: pendente
  criterio_saida: "tests/sse.test.ts, tests/openrouter.test.ts e tests/openrouter-conversar.test.ts passam contra o servidor simulado; suite, lint e tsc verdes."
  riscos: ["JSON partido entre chunks e comentarios SSE quebram JSON.parse (base/openrouter-api.md)", "erro do provedor nao pode vazar corpo bruto nem a chave"]
  fora_de_escopo: ["persistencia da chave - sprint 03", "tela de conversa - FT-03"]
fases:
  - id: F-02.1
    titulo: "Adaptador"
    status: pendente
    criterio_saida: "listarModelos, verificarChave e conversar verdes contra o servidor simulado"
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03, T-02.04]
tasks:
  - id: T-02.01
    titulo: "Ambiente do OpenRouter e erros do provedor"
    fase: F-02.1
    status: concluida
    objetivo: "Ler OPENROUTER_BASE_URL e APP_URL em ambiente.ts e criar erroDoProvedor com mensagens em pt-BR."
    arquivos:
      cria: ["tests/erros.test.ts"]
      altera: ["src/lib/ambiente.ts", "src/lib/erros.ts", "tests/ambiente.test.ts", ".env.example", "tests/projeto.test.ts"]
    teste_integracao: "tests/ambiente.test.ts le ambiente com variaveis alteradas em process.env."
    teste_funcional: "openrouterBaseUrl tem padrao https://openrouter.ai/api/v1 e remove barra final, appUrl tem padrao http://localhost:3000, erroDoProvedor mapeia 401, 402, 400, 404, 429, 500 e timeout para ErroDeAplicacao 502 ou 504 com codigos provedor_* e mensagem sem o texto do corpo."
    criterio_aceite: "O teste de ambiente passa e o .env.example documenta OPENROUTER_BASE_URL e APP_URL sem valor secreto."
    depende_de: [T-01.04]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.02
    titulo: "Parser SSE"
    fase: F-02.1
    status: concluida
    objetivo: "Ler trechos de texto de um fluxo SSE com buffer por linha."
    arquivos:
      cria: ["src/lib/sse.ts", "tests/sse.test.ts"]
      altera: []
    teste_integracao: "tests/sse.test.ts alimenta lerTrechosDeSSE com ReadableStream de pedacos de bytes."
    teste_funcional: "linhas data: com JSON rendem delta.content, comentario iniciado por dois pontos e ignorado, [DONE] encerra, JSON partido entre pacotes e reunido, evento com error ou finish_reason error lanca ErroDeAplicacao provedor_indisponivel."
    criterio_aceite: "O teste passa e nenhuma chamada de JSON.parse recebe linha de comentario."
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.03
    titulo: "Cliente: listarModelos e verificarChave"
    fase: F-02.1
    status: concluida
    objetivo: "Listar modelos com cache curto e reserva e verificar a chave por GET /key."
    arquivos:
      cria: ["src/lib/openrouter.ts", "tests/openrouter.test.ts"]
      altera: []
    teste_integracao: "tests/openrouter.test.ts aponta OPENROUTER_BASE_URL para o servidor simulado."
    teste_funcional: "listarModelos devolve ids e nomes ordenados e usa cache na segunda chamada, cai na lista de reserva com reserva true quando o servidor falha, verificarChave aceita chave valida e lanca provedor_chave_invalida no 401, e as requisicoes levam Authorization, HTTP-Referer e X-Title."
    criterio_aceite: "O teste passa e o texto da chave nao aparece em nenhuma mensagem de erro capturada."
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-02.04
    titulo: "Cliente: conversar em stream"
    fase: F-02.1
    status: concluida
    objetivo: "Devolver AsyncIterable de trechos com timeout e cancelamento."
    arquivos:
      cria: []
      altera: ["src/lib/openrouter.ts", "tests/openrouter-conversar.test.ts"]
    teste_integracao: "tests/openrouter-conversar.test.ts consome conversar contra o servidor simulado com stream."
    teste_funcional: "conversar entrega os trechos na ordem e o corpo enviado tem model, messages, temperature, max_tokens e stream true, erro no meio do stream lanca depois dos trechos ja entregues, 402 vira provedor_sem_saldo, AbortSignal encerra a leitura, e primeiro byte lento alem do limite lanca provedor_tempo_esgotado."
    criterio_aceite: "O teste passa e o limite de tempo e injetavel por parametro para o teste nao esperar 30 s."
    depende_de: [T-02.02, T-02.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Plano — Sprint 02 — Adaptador OpenRouter em src/lib

## Critério de saída da sprint

tests/sse.test.ts, tests/openrouter.test.ts e tests/openrouter-conversar.test.ts passam contra o servidor simulado; suite, lint e tsc verdes.

## Riscos conhecidos

- JSON partido entre chunks e comentarios SSE quebram JSON.parse (base/openrouter-api.md)
- erro do provedor nao pode vazar corpo bruto nem a chave

## Fora de escopo

- persistencia da chave - sprint 03
- tela de conversa - FT-03

## Fase F-02.1 — Adaptador

**Tasks:** T-02.01, T-02.02, T-02.03, T-02.04

**Critério de saída:** listarModelos, verificarChave e conversar verdes contra o servidor simulado

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-02 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_02_1["F-02.1 Adaptador"]
    T_02_01["T-02.01<br/>Ambiente do OpenRouter e err"]
    T_02_02["T-02.02<br/>Parser SSE"]
    T_02_03["T-02.03<br/>Cliente: listarModelos e ver"]
    T_02_04["T-02.04<br/>Cliente: conversar em stream"]
  end
  T_02_01 --> T_02_02
  T_02_01 --> T_02_03
  T_02_02 --> T_02_04
  T_02_03 --> T_02_04
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 concluida
  class T_02_04 concluida
```

## Tasks

---

```yaml
id: T-02.01
titulo: Ambiente do OpenRouter e erros do provedor
objetivo: Ler OPENROUTER_BASE_URL e APP_URL em ambiente.ts e criar erroDoProvedor com mensagens em pt-BR.
arquivos:
  cria: [tests/erros.test.ts]
  altera: [src/lib/ambiente.ts, src/lib/erros.ts, tests/ambiente.test.ts, .env.example, tests/projeto.test.ts]
teste_integracao: tests/ambiente.test.ts le ambiente com variaveis alteradas em process.env.
teste_funcional: openrouterBaseUrl tem padrao https://openrouter.ai/api/v1 e remove barra final, appUrl tem padrao http://localhost:3000, erroDoProvedor mapeia 401, 402, 400, 404, 429, 500 e timeout para ErroDeAplicacao 502 ou 504 com codigos provedor_* e mensagem sem o texto do corpo.
criterio_aceite: O teste de ambiente passa e o .env.example documenta OPENROUTER_BASE_URL e APP_URL sem valor secreto.
depende_de: [T-01.04]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: ambiente, erros e projeto 34 passed; tsc e lint 0
```

---

```yaml
id: T-02.02
titulo: Parser SSE
objetivo: Ler trechos de texto de um fluxo SSE com buffer por linha.
arquivos:
  cria: [src/lib/sse.ts, tests/sse.test.ts]
  altera: []
teste_integracao: tests/sse.test.ts alimenta lerTrechosDeSSE com ReadableStream de pedacos de bytes.
teste_funcional: linhas data: com JSON rendem delta.content, comentario iniciado por dois pontos e ignorado, [DONE] encerra, JSON partido entre pacotes e reunido, evento com error ou finish_reason error lanca ErroDeAplicacao provedor_indisponivel.
criterio_aceite: O teste passa e nenhuma chamada de JSON.parse recebe linha de comentario.
depende_de: [T-02.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: sse 14 passed; tsc e lint 0
```

---

```yaml
id: T-02.03
titulo: Cliente: listarModelos e verificarChave
objetivo: Listar modelos com cache curto e reserva e verificar a chave por GET /key.
arquivos:
  cria: [src/lib/openrouter.ts, tests/openrouter.test.ts]
  altera: []
teste_integracao: tests/openrouter.test.ts aponta OPENROUTER_BASE_URL para o servidor simulado.
teste_funcional: listarModelos devolve ids e nomes ordenados e usa cache na segunda chamada, cai na lista de reserva com reserva true quando o servidor falha, verificarChave aceita chave valida e lanca provedor_chave_invalida no 401, e as requisicoes levam Authorization, HTTP-Referer e X-Title.
criterio_aceite: O teste passa e o texto da chave nao aparece em nenhuma mensagem de erro capturada.
depende_de: [T-02.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: openrouter 12 passed; tsc e lint 0
```

---

```yaml
id: T-02.04
titulo: Cliente: conversar em stream
objetivo: Devolver AsyncIterable de trechos com timeout e cancelamento.
arquivos:
  cria: []
  altera: [src/lib/openrouter.ts, tests/openrouter-conversar.test.ts]
teste_integracao: tests/openrouter-conversar.test.ts consome conversar contra o servidor simulado com stream.
teste_funcional: conversar entrega os trechos na ordem e o corpo enviado tem model, messages, temperature, max_tokens e stream true, erro no meio do stream lanca depois dos trechos ja entregues, 402 vira provedor_sem_saldo, AbortSignal encerra a leitura, e primeiro byte lento alem do limite lanca provedor_tempo_esgotado.
criterio_aceite: O teste passa e o limite de tempo e injetavel por parametro para o teste nao esperar 30 s.
depende_de: [T-02.02, T-02.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: openrouter-conversar 12 passed; tsc e lint 0
```

