---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
sprint_id: sprint-04
atualizado_em: 2026-09-30
sprint:
  titulo: "Handler de streaming"
  status: pendente
  criterio_saida: "npm test termina com 0 failed; tests/eventos-sse.test.ts e tests/conversar-rota.test.ts passam com o servidor de producao; npm run build verde; lint e tsc com codigo 0."
  riscos: ["o teste de rota exige npm run build antes (base/interface-do-agente.md)", "stream em Route Handler: cancelamento chega por request.signal e precisa abortar o provedor"]
  fora_de_escopo: ["tela Testar - sprints 05 e 06", "limite de uso e origem - FT-06"]
fases:
  - id: F-04.1
    titulo: "Rota conversar"
    status: pendente
    criterio_saida: "POST /api/agentes/[id]/conversar responde 401, 404, 422, 409 e o stream com os eventos definidos em PR-43"
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02]
tasks:
  - id: T-04.01
    titulo: "Formatacao dos eventos SSE"
    fase: F-04.1
    status: concluida
    objetivo: "Converter os eventos do servico em texto SSE (trecho, fim, erro) na camada de apresentacao."
    arquivos:
      cria: ["src/app/eventos-sse.ts", "tests/eventos-sse.test.ts"]
      altera: []
    teste_integracao: "tests/eventos-sse.test.ts consome um AsyncGenerator de eventos do servico e le o ReadableStream resultante com TextDecoder."
    teste_funcional: "trecho vira 'event: trecho' com data JSON de texto, fim vira 'event: fim' com ids e tamanho e encerra, erro do gerador vira 'event: erro' com codigo, mensagem do operador e correlacao e encerra, quebras de linha e aspas no texto sobrevivem ao JSON, e cancelar o stream aborta o gerador."
    criterio_aceite: "O teste passa e o arquivo importa next apenas se necessario (nenhum import de next e esperado)."
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-04.02
    titulo: "Rota POST /api/agentes/[id]/conversar"
    fase: F-04.1
    status: concluida
    objetivo: "Handler fino com sessao no servidor, erro pre-stream em JSON e stream SSE com os cabecalhos definidos."
    arquivos:
      cria: ["src/app/api/agentes/[id]/conversar/route.ts", "tests/conversar-rota.test.ts"]
      altera: []
    teste_integracao: "tests/conversar-rota.test.ts sobe next start em porta propria com o OpenRouter falso e o banco de teste, e chama a rota com fetch e cookie de sessao real."
    teste_funcional: "sem sessao 401, agente inexistente 404, mensagem invalida 422, sem chave 409 com codigo chat_sem_chave, stream completo com cabecalhos text/event-stream, no-store, X-Accel-Buffering no e X-Conversa-Id, eventos trecho e fim e resposta gravada, erro no meio do stream com evento erro e nada gravado do assistente, chave invalida do provedor com evento erro em pt-BR sem o corpo bruto, conversa de outro usuario 404, e abortar a leitura aumenta os cancelamentos do falso."
    criterio_aceite: "O teste passa depois de npm run build e o handler tem menos de 80 linhas, sem regra de negocio."
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
---

# Plano — Sprint 04 — Handler de streaming

## Critério de saída da sprint

npm test termina com 0 failed; tests/eventos-sse.test.ts e tests/conversar-rota.test.ts passam com o servidor de producao; npm run build verde; lint e tsc com codigo 0.

## Riscos conhecidos

- o teste de rota exige npm run build antes (base/interface-do-agente.md)
- stream em Route Handler: cancelamento chega por request.signal e precisa abortar o provedor

## Fora de escopo

- tela Testar - sprints 05 e 06
- limite de uso e origem - FT-06

## Fase F-04.1 — Rota conversar

**Tasks:** T-04.01, T-04.02

**Critério de saída:** POST /api/agentes/[id]/conversar responde 401, 404, 422, 409 e o stream com os eventos definidos em PR-43

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-04 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_04_1["F-04.1 SSE e rota"]
    T_04_01["T-04.01<br/>Formatacao dos eventos SSE"]
    T_04_02["T-04.02<br/>Rota POST /api/agentes/[id]/"]
  end
  T_04_01 --> T_04_02
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_04_01 concluida
  class T_04_02 concluida
```

## Tasks

---

```yaml
id: T-04.01
titulo: Formatacao dos eventos SSE
objetivo: Converter os eventos do servico em texto SSE (trecho, fim, erro) na camada de apresentacao.
arquivos:
  cria: [src/app/eventos-sse.ts, tests/eventos-sse.test.ts]
  altera: []
teste_integracao: tests/eventos-sse.test.ts consome um AsyncGenerator de eventos do servico e le o ReadableStream resultante com TextDecoder.
teste_funcional: trecho vira 'event: trecho' com data JSON de texto, fim vira 'event: fim' com ids e tamanho e encerra, erro do gerador vira 'event: erro' com codigo, mensagem do operador e correlacao e encerra, quebras de linha e aspas no texto sobrevivem ao JSON, e cancelar o stream aborta o gerador.
criterio_aceite: O teste passa e o arquivo importa next apenas se necessario (nenhum import de next e esperado).
depende_de: [T-03.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: eventos-sse 8 testes; suite 502 verdes; tsc e lint 0
```

---

```yaml
id: T-04.02
titulo: Rota POST /api/agentes/[id]/conversar
objetivo: Handler fino com sessao no servidor, erro pre-stream em JSON e stream SSE com os cabecalhos definidos.
arquivos:
  cria: [src/app/api/agentes/[id]/conversar/route.ts, tests/conversar-rota.test.ts]
  altera: []
teste_integracao: tests/conversar-rota.test.ts sobe next start em porta propria com o OpenRouter falso e o banco de teste, e chama a rota com fetch e cookie de sessao real.
teste_funcional: sem sessao 401, agente inexistente 404, mensagem invalida 422, sem chave 409 com codigo chat_sem_chave, stream completo com cabecalhos text/event-stream, no-store, X-Accel-Buffering no e X-Conversa-Id, eventos trecho e fim e resposta gravada, erro no meio do stream com evento erro e nada gravado do assistente, chave invalida do provedor com evento erro em pt-BR sem o corpo bruto, conversa de outro usuario 404, e abortar a leitura aumenta os cancelamentos do falso.
criterio_aceite: O teste passa depois de npm run build e o handler tem menos de 80 linhas, sem regra de negocio.
depende_de: [T-04.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: conversar-rota 16 testes contra next start; build verde; suite 518 verdes; tsc e lint 0
```

