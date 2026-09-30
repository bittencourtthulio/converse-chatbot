---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
sprint_id: sprint-01
atualizado_em: 2026-09-30
sprint:
  titulo: "Capacidade de testar: cripto, servidor simulado e regra de migracao"
  status: concluido
  criterio_saida: "npm test termina com 0 failed; tests/cripto.test.ts, tests/migracoes.test.ts e tests/openrouter-falso.test.ts passam; lint e tsc com codigo 0."
  riscos: ["ENCRYPTION_KEY lida por getter preguicoso: ler no import derrubaria login e painel (base/ambiente-e-segredos.md)", "o servidor simulado e reutilizado por FT-03 e FT-05: a API precisa ficar limpa e documentada"]
  fora_de_escopo: ["uso do adaptador em tela ou servico - sprints 02 e 03", "chamada a rede real - proibida em qualquer teste"]
fases:
  - id: F-01.1
    titulo: "Fundacoes de teste"
    status: concluido
    criterio_saida: "cripto, regra de migracao e servidor simulado verdes na suite"
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03, T-01.04]
tasks:
  - id: T-01.01
    titulo: "Cripto de segredo AES-256-GCM"
    fase: F-01.1
    status: concluida
    objetivo: "Cifrar e decifrar segredo com ENCRYPTION_KEY validada so no uso e documentar a variavel."
    arquivos:
      cria: ["src/lib/cripto.ts", "tests/cripto.test.ts"]
      altera: ["src/lib/ambiente.ts", "tests/setup.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts"]
    teste_integracao: "tests/cripto.test.ts usa a chave de teste de tests/setup.ts lida por ambiente.chaveDeCriptografia."
    teste_funcional: "cifrar e decifrar devolvem o texto original, dois cifrar do mesmo texto diferem, texto adulterado, prefixo desconhecido e chave errada lancam erro, chave ausente ou curta so falha ao cifrar, e mascararSegredo de sk-or-v1-abcdef1234 devolve sk-or-…1234."
    criterio_aceite: "O teste de cripto passa, o teste de ambiente prova que importar ambiente sem ENCRYPTION_KEY nao lanca, e o .env.example lista ENCRYPTION_KEY vazio com o comando de geracao."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-01.02
    titulo: "Teste das migracoes contra remocao sem marca"
    fase: F-01.1
    status: concluida
    objetivo: "Falhar quando uma migration tiver DROP TABLE ou DROP COLUMN sem a marca destrutiva-autorizada (lacuna 9)."
    arquivos:
      cria: ["tests/migracoes.test.ts"]
      altera: []
    teste_integracao: "tests/migracoes.test.ts le os arquivos prisma/migrations/*/migration.sql reais."
    teste_funcional: "SQL de amostra com DROP TABLE sem a marca -- destrutiva-autorizada falha, com a marca passa, DROP COLUMN idem, e as migrations existentes passam."
    criterio_aceite: "O teste passa e uma amostra com DROP COLUMN sem marca e recusada pela funcao verificadora."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-01.03
    titulo: "Servidor OpenRouter simulado: rotas e erros"
    fase: F-01.1
    status: concluida
    objetivo: "Servidor HTTP local em porta livre com /models, /key, /auth/key e /chat/completions sem stream, erros e latencia configuraveis."
    arquivos:
      cria: ["tests/apoio/openrouter-falso.ts", "tests/openrouter-falso.test.ts"]
      altera: []
    teste_integracao: "tests/openrouter-falso.test.ts sobe o servidor e o consulta com fetch real de Node em localhost."
    teste_funcional: "iniciarOpenRouterFalso devolve url de porta livre, /models lista modelos, /key devolve 401 com chave invalida, 402 no modo sem saldo, /chat/completions devolve texto e registra cabecalhos e corpo em requisicoes, e a latencia configurada atrasa a resposta."
    criterio_aceite: "O teste passa e fechar() libera a porta (nova conexao recusada)."
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-01.04
    titulo: "Servidor OpenRouter simulado: stream"
    fase: F-01.1
    status: concluida
    objetivo: "Acrescentar o modo stream: SSE com comentario, chunks partidos, [DONE], erro no meio do stream e stream lento."
    arquivos:
      cria: []
      altera: ["tests/apoio/openrouter-falso.ts", "tests/openrouter-falso.test.ts"]
    teste_integracao: "tests/openrouter-falso.test.ts le a resposta stream do servidor com fetch real."
    teste_funcional: "com stream true o corpo traz linhas data: com delta.content, comentario : OPENROUTER PROCESSING, termina em [DONE]; o modo erro-no-meio emite evento com error e finish_reason error apos dois trechos; o modo chunks-partidos divide um JSON em dois pacotes."
    criterio_aceite: "O teste passa e a API do servidor esta documentada em comentario no topo do arquivo."
    depende_de: [T-01.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Plano — Sprint 01 — Capacidade de testar: cripto, servidor simulado e regra de migracao

## Critério de saída da sprint

npm test termina com 0 failed; tests/cripto.test.ts, tests/migracoes.test.ts e tests/openrouter-falso.test.ts passam; lint e tsc com codigo 0.

## Riscos conhecidos

- ENCRYPTION_KEY lida por getter preguicoso: ler no import derrubaria login e painel (base/ambiente-e-segredos.md)
- o servidor simulado e reutilizado por FT-03 e FT-05: a API precisa ficar limpa e documentada

## Fora de escopo

- uso do adaptador em tela ou servico - sprints 02 e 03
- chamada a rede real - proibida em qualquer teste

## Fase F-01.1 — Fundacoes de teste

**Tasks:** T-01.01, T-01.02, T-01.03, T-01.04

**Critério de saída:** cripto, regra de migracao e servidor simulado verdes na suite

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-01 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_01_1["F-01.1 Fundacoes de teste"]
    T_01_01["T-01.01<br/>Cripto de segredo AES-256-GC"]
    T_01_02["T-01.02<br/>Teste das migracoes contra r"]
    T_01_03["T-01.03<br/>Servidor OpenRouter simulado"]
    T_01_04["T-01.04<br/>Servidor OpenRouter simulado"]
  end
  T_01_01 --> T_01_03
  T_01_03 --> T_01_04
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_01_01 concluida
  class T_01_02 concluida
  class T_01_03 concluida
  class T_01_04 concluida
```

## Tasks

---

```yaml
id: T-01.01
titulo: Cripto de segredo AES-256-GCM
objetivo: Cifrar e decifrar segredo com ENCRYPTION_KEY validada so no uso e documentar a variavel.
arquivos:
  cria: [src/lib/cripto.ts, tests/cripto.test.ts]
  altera: [src/lib/ambiente.ts, tests/setup.ts, .env.example, tests/ambiente.test.ts, tests/projeto.test.ts]
teste_integracao: tests/cripto.test.ts usa a chave de teste de tests/setup.ts lida por ambiente.chaveDeCriptografia.
teste_funcional: cifrar e decifrar devolvem o texto original, dois cifrar do mesmo texto diferem, texto adulterado, prefixo desconhecido e chave errada lancam erro, chave ausente ou curta so falha ao cifrar, e mascararSegredo de sk-or-v1-abcdef1234 devolve sk-or-…1234.
criterio_aceite: O teste de cripto passa, o teste de ambiente prova que importar ambiente sem ENCRYPTION_KEY nao lanca, e o .env.example lista ENCRYPTION_KEY vazio com o comando de geracao.
depende_de: []
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: cripto 16, ambiente e projeto verdes; tsc e lint 0
```

---

```yaml
id: T-01.02
titulo: Teste das migracoes contra remocao sem marca
objetivo: Falhar quando uma migration tiver DROP TABLE ou DROP COLUMN sem a marca destrutiva-autorizada (lacuna 9).
arquivos:
  cria: [tests/migracoes.test.ts]
  altera: []
teste_integracao: tests/migracoes.test.ts le os arquivos prisma/migrations/*/migration.sql reais.
teste_funcional: SQL de amostra com DROP TABLE sem a marca -- destrutiva-autorizada falha, com a marca passa, DROP COLUMN idem, e as migrations existentes passam.
criterio_aceite: O teste passa e uma amostra com DROP COLUMN sem marca e recusada pela funcao verificadora.
depende_de: []
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: migracoes 6 passed; tsc e lint 0
```

---

```yaml
id: T-01.03
titulo: Servidor OpenRouter simulado: rotas e erros
objetivo: Servidor HTTP local em porta livre com /models, /key, /auth/key e /chat/completions sem stream, erros e latencia configuraveis.
arquivos:
  cria: [tests/apoio/openrouter-falso.ts, tests/openrouter-falso.test.ts]
  altera: []
teste_integracao: tests/openrouter-falso.test.ts sobe o servidor e o consulta com fetch real de Node em localhost.
teste_funcional: iniciarOpenRouterFalso devolve url de porta livre, /models lista modelos, /key devolve 401 com chave invalida, 402 no modo sem saldo, /chat/completions devolve texto e registra cabecalhos e corpo em requisicoes, e a latencia configurada atrasa a resposta.
criterio_aceite: O teste passa e fechar() libera a porta (nova conexao recusada).
depende_de: [T-01.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: openrouter-falso 14 passed; tsc e lint 0
```

---

```yaml
id: T-01.04
titulo: Servidor OpenRouter simulado: stream
objetivo: Acrescentar o modo stream: SSE com comentario, chunks partidos, [DONE], erro no meio do stream e stream lento.
arquivos:
  cria: []
  altera: [tests/apoio/openrouter-falso.ts, tests/openrouter-falso.test.ts]
teste_integracao: tests/openrouter-falso.test.ts le a resposta stream do servidor com fetch real.
teste_funcional: com stream true o corpo traz linhas data: com delta.content, comentario : OPENROUTER PROCESSING, termina em [DONE]; o modo erro-no-meio emite evento com error e finish_reason error apos dois trechos; o modo chunks-partidos divide um JSON em dois pacotes.
criterio_aceite: O teste passa e a API do servidor esta documentada em comentario no topo do arquivo.
depende_de: [T-01.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: openrouter-falso 19 passed; tsc e lint 0
```

