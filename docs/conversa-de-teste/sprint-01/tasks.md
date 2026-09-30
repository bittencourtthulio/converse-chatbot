---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
sprint_id: sprint-01
atualizado_em: 2026-09-30
sprint:
  titulo: "Capacidade de testar: dados de conversa e configuracao"
  status: pendente
  criterio_saida: "npm test termina com 0 failed; tests/conversas-modelo.test.ts e tests/ambiente.test.ts passam; tests/migracoes.test.ts aceita a migration nova; lint e tsc com codigo 0."
  riscos: ["a cascata do agente para conversa e mensagem depende de foreign_keys ligado no SQLite (base/00-LACUNAS.md, lacuna 2): a primeira task a prova, e se falhar o servico de agentes apaga as conversas na mesma transacao", "migration escrita a partir de prisma migrate diff: nao usar db push (apaga tabelas FTS5)"]
  fora_de_escopo: ["servicos de conversa e de chat - sprints 02 e 03", "qualquer tela - sprints 05 e 06"]
fases:
  - id: F-01.1
    titulo: "Dados e configuracao"
    status: pendente
    criterio_saida: "tabelas de conversa aplicadas por migrate deploy, cascata provada e MAX_TOKENS_RESPOSTA lida em ambiente.ts"
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
tasks:
  - id: T-01.01
    titulo: "Tabelas Conversa e Mensagem com cascata"
    fase: F-01.1
    status: pendente
    objetivo: "Acrescentar os modelos Conversa e Mensagem, a migration aditiva e a limpeza de teste, provando a cascata do agente."
    arquivos:
      cria: ["tests/conversas-modelo.test.ts", "prisma/migrations/20260930170000_conversas/migration.sql"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts", "src/servicos/agentes.ts", "tests/agentes.test.ts"]
    teste_integracao: "tests/conversas-modelo.test.ts usa o banco de teste criado por prisma migrate deploy com a migration nova e o Prisma real."
    teste_funcional: "criar agente, conversa e duas mensagens e excluir o agente apaga conversa e mensagens; excluir a conversa apaga as mensagens; excluir o usuario criador nao e testado (FT-10); os indices existem no SQL da migration; src/servicos/agentes.ts so muda se a cascata do SQLite nao valer."
    criterio_aceite: "O teste passa, tests/migracoes.test.ts continua verde sem a marca destrutiva-autorizada e limparBanco apaga mensagens e conversas antes dos agentes."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: "MAX_TOKENS_RESPOSTA na configuracao"
    fase: F-01.1
    status: pendente
    objetivo: "Ler MAX_TOKENS_RESPOSTA (padrao 1024) so em ambiente.ts e documentar no .env.example."
    arquivos:
      cria: []
      altera: ["src/lib/ambiente.ts", ".env.example", "tests/ambiente.test.ts", "tests/projeto.test.ts"]
    teste_integracao: "tests/ambiente.test.ts le ambiente.maxTokensDaResposta com process.env alterado e restaurado no teste."
    teste_funcional: "sem a variavel devolve 1024, com 512 devolve 512, com texto ou zero lanca o erro de inteiro positivo, importar ambiente sem a variavel nao lanca, e o .env.example lista MAX_TOKENS_RESPOSTA."
    criterio_aceite: "O teste de ambiente e o de projeto passam e o .env.example traz MAX_TOKENS_RESPOSTA com comentario e sem valor secreto."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 01 — Capacidade de testar: dados de conversa e configuracao

## Critério de saída da sprint

npm test termina com 0 failed; tests/conversas-modelo.test.ts e tests/ambiente.test.ts passam; tests/migracoes.test.ts aceita a migration nova; lint e tsc com codigo 0.

## Riscos conhecidos

- a cascata do agente para conversa e mensagem depende de foreign_keys ligado no SQLite (base/00-LACUNAS.md, lacuna 2): a primeira task a prova, e se falhar o servico de agentes apaga as conversas na mesma transacao
- migration escrita a partir de prisma migrate diff: nao usar db push (apaga tabelas FTS5)

## Fora de escopo

- servicos de conversa e de chat - sprints 02 e 03
- qualquer tela - sprints 05 e 06

## Fase F-01.1 — Dados e configuracao

**Tasks:** T-01.01, T-01.02

**Critério de saída:** tabelas de conversa aplicadas por migrate deploy, cascata provada e MAX_TOKENS_RESPOSTA lida em ambiente.ts

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-01 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_01_1["F-01.1 Fundacoes de teste"]
    T_01_01["T-01.01<br/>Tabelas Conversa e Mensagem "]
    T_01_02["T-01.02<br/>MAX_TOKENS_RESPOSTA na confi"]
  end
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_01_01 pendente
  class T_01_02 pendente
```

## Tasks

---

```yaml
id: T-01.01
titulo: Tabelas Conversa e Mensagem com cascata
objetivo: Acrescentar os modelos Conversa e Mensagem, a migration aditiva e a limpeza de teste, provando a cascata do agente.
arquivos:
  cria: [tests/conversas-modelo.test.ts, prisma/migrations/20260930170000_conversas/migration.sql]
  altera: [prisma/schema.prisma, tests/ajuda.ts, src/servicos/agentes.ts, tests/agentes.test.ts]
teste_integracao: tests/conversas-modelo.test.ts usa o banco de teste criado por prisma migrate deploy com a migration nova e o Prisma real.
teste_funcional: criar agente, conversa e duas mensagens e excluir o agente apaga conversa e mensagens; excluir a conversa apaga as mensagens; excluir o usuario criador nao e testado (FT-10); os indices existem no SQL da migration; src/servicos/agentes.ts so muda se a cascata do SQLite nao valer.
criterio_aceite: O teste passa, tests/migracoes.test.ts continua verde sem a marca destrutiva-autorizada e limparBanco apaga mensagens e conversas antes dos agentes.
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.02
titulo: MAX_TOKENS_RESPOSTA na configuracao
objetivo: Ler MAX_TOKENS_RESPOSTA (padrao 1024) so em ambiente.ts e documentar no .env.example.
arquivos:
  cria: []
  altera: [src/lib/ambiente.ts, .env.example, tests/ambiente.test.ts, tests/projeto.test.ts]
teste_integracao: tests/ambiente.test.ts le ambiente.maxTokensDaResposta com process.env alterado e restaurado no teste.
teste_funcional: sem a variavel devolve 1024, com 512 devolve 512, com texto ou zero lanca o erro de inteiro positivo, importar ambiente sem a variavel nao lanca, e o .env.example lista MAX_TOKENS_RESPOSTA.
criterio_aceite: O teste de ambiente e o de projeto passam e o .env.example traz MAX_TOKENS_RESPOSTA com comentario e sem valor secreto.
depende_de: []
paralelizavel: false
status: pendente
```

