---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
sprint_id: sprint-04
atualizado_em: 2026-09-30
sprint:
  titulo: "Agentes: modelo, servico e seed"
  status: pendente
  criterio_saida: "tests/agentes.test.ts e tests/seed.test.ts passam; suite, lint e tsc verdes."
  riscos: ["tests/ajuda.ts precisa apagar agentes antes de usuarios (chave estrangeira)", "exclusao definitiva de usuario e da FT-10; agente de usuario desativado permanece"]
  fora_de_escopo: ["telas de agentes - sprint 05", "base de conhecimento e canais por agente - FT-04 a FT-08"]
fases:
  - id: F-04.1
    titulo: "Agentes"
    status: pendente
    criterio_saida: "CRUD de agente no servico com validacao e seed do exemplo"
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02, T-04.03]
tasks:
  - id: T-04.01
    titulo: "Modelo Agente e servico: listar, obter e criar"
    fase: F-04.1
    status: concluida
    objetivo: "Criar a tabela de agentes e as tres primeiras operacoes com zod."
    arquivos:
      cria: ["prisma/migrations/20260930150122_agentes/migration.sql", "src/servicos/agentes.ts", "tests/agentes.test.ts"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
    teste_integracao: "tests/agentes.test.ts usa o banco de teste e usuarios de tests/ajuda.ts."
    teste_funcional: "criar grava nome, instrucoes, modelo, temperatura padrao 0.7 e criadoPorId, listar devolve todos por criadoEm decrescente para qualquer usuario, obter de id inexistente lanca 404, e nome vazio, nome acima de 80, instrucoes acima de 8000, temperatura fora de 0 a 2, modelo vazio e mensagem inicial acima de 500 lancam 422."
    criterio_aceite: "O teste passa e a migration so contem CREATE TABLE."
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.02
    titulo: "Servico de agentes: editar e excluir"
    fase: F-04.1
    status: concluida
    objetivo: "Editar e excluir agente com a mesma validacao."
    arquivos:
      cria: []
      altera: ["src/servicos/agentes.ts", "tests/agentes.test.ts"]
    teste_integracao: "tests/agentes.test.ts usa o servico com o banco de teste."
    teste_funcional: "editar altera so os campos validos e atualiza atualizadoEm, editar com entrada invalida nao grava, editar e excluir de id inexistente lancam 404, e excluir remove o agente da lista."
    criterio_aceite: "O teste passa e um segundo usuario consegue editar e excluir agente criado pelo primeiro."
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-04.03
    titulo: "Seed do agente de exemplo"
    fase: F-04.1
    status: concluida
    objetivo: "Semear o Assistente de exemplo, sem chave, mantendo a recusa em producao."
    arquivos:
      cria: []
      altera: ["prisma/seed.ts", "tests/seed.test.ts"]
    teste_integracao: "tests/seed.test.ts executa a seed com tsx contra o banco de teste migrado."
    teste_funcional: "duas execucoes deixam exatamente um agente chamado Assistente de exemplo com modelo openai/gpt-4o-mini e instrucoes em portugues, a tabela de configuracao fica sem chave, e em producao nada e gravado."
    criterio_aceite: "O teste passa e a seed continua saindo com codigo diferente de 0 em producao."
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Plano — Sprint 04 — Agentes: modelo, servico e seed

## Critério de saída da sprint

tests/agentes.test.ts e tests/seed.test.ts passam; suite, lint e tsc verdes.

## Riscos conhecidos

- tests/ajuda.ts precisa apagar agentes antes de usuarios (chave estrangeira)
- exclusao definitiva de usuario e da FT-10; agente de usuario desativado permanece

## Fora de escopo

- telas de agentes - sprint 05
- base de conhecimento e canais por agente - FT-04 a FT-08

## Fase F-04.1 — Agentes

**Tasks:** T-04.01, T-04.02, T-04.03

**Critério de saída:** CRUD de agente no servico com validacao e seed do exemplo

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-04 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_04_1["F-04.1 Agentes"]
    T_04_01["T-04.01<br/>Modelo Agente e servico: lis"]
    T_04_02["T-04.02<br/>Servico de agentes: editar e"]
    T_04_03["T-04.03<br/>Seed do agente de exemplo"]
  end
  T_04_01 --> T_04_02
  T_04_01 --> T_04_03
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_04_01 concluida
  class T_04_02 concluida
  class T_04_03 concluida
```

## Tasks

---

```yaml
id: T-04.01
titulo: Modelo Agente e servico: listar, obter e criar
objetivo: Criar a tabela de agentes e as tres primeiras operacoes com zod.
arquivos:
  cria: [prisma/migrations/20260930150122_agentes/migration.sql, src/servicos/agentes.ts, tests/agentes.test.ts]
  altera: [prisma/schema.prisma, tests/ajuda.ts]
teste_integracao: tests/agentes.test.ts usa o banco de teste e usuarios de tests/ajuda.ts.
teste_funcional: criar grava nome, instrucoes, modelo, temperatura padrao 0.7 e criadoPorId, listar devolve todos por criadoEm decrescente para qualquer usuario, obter de id inexistente lanca 404, e nome vazio, nome acima de 80, instrucoes acima de 8000, temperatura fora de 0 a 2, modelo vazio e mensagem inicial acima de 500 lancam 422.
criterio_aceite: O teste passa e a migration so contem CREATE TABLE.
depende_de: [T-01.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: agentes 18 e migracoes 8 passed; tsc e lint 0
```

---

```yaml
id: T-04.02
titulo: Servico de agentes: editar e excluir
objetivo: Editar e excluir agente com a mesma validacao.
arquivos:
  cria: []
  altera: [src/servicos/agentes.ts, tests/agentes.test.ts]
teste_integracao: tests/agentes.test.ts usa o servico com o banco de teste.
teste_funcional: editar altera so os campos validos e atualiza atualizadoEm, editar com entrada invalida nao grava, editar e excluir de id inexistente lancam 404, e excluir remove o agente da lista.
criterio_aceite: O teste passa e um segundo usuario consegue editar e excluir agente criado pelo primeiro.
depende_de: [T-04.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: agentes 30 passed; tsc e lint 0
```

---

```yaml
id: T-04.03
titulo: Seed do agente de exemplo
objetivo: Semear o Assistente de exemplo, sem chave, mantendo a recusa em producao.
arquivos:
  cria: []
  altera: [prisma/seed.ts, tests/seed.test.ts]
teste_integracao: tests/seed.test.ts executa a seed com tsx contra o banco de teste migrado.
teste_funcional: duas execucoes deixam exatamente um agente chamado Assistente de exemplo com modelo openai/gpt-4o-mini e instrucoes em portugues, a tabela de configuracao fica sem chave, e em producao nada e gravado.
criterio_aceite: O teste passa e a seed continua saindo com codigo diferente de 0 em producao.
depende_de: [T-04.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: seed 4 passed; tsc e lint 0
```

