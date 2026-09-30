---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
sprint_id: sprint-05
atualizado_em: 2026-09-30
sprint:
  titulo: "Documentacao e verificacao final: README, copia limpa e convencoes"
  status: concluido
  criterio_saida: "A copia limpa passa npm ci, prisma generate, migrate deploy, lint, tsc, build, test e audit, e CONVENCOES.md tem commit-referencia preenchido."
  riscos: ["a copia limpa so vale sobre o estado commitado: tudo precisa estar commitado antes (base/testes-e-banco.md)"]
  fora_de_escopo: ["Dockerfile e docker-compose - FT-11"]
fases:
  - id: F-05.1
    titulo: "Documentacao e verificacao"
    status: concluido
    criterio_saida: "os tres artefatos existem e a copia limpa esta verde"
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01, T-05.02, T-05.03]
tasks:
  - id: T-05.01
    titulo: "README do projeto"
    fase: F-05.1
    status: concluida
    objetivo: "Substituir o README do template pelo do Converse."
    arquivos:
      cria: []
      altera: ["README.md", "tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts le README.md e os scripts do package.json."
    teste_funcional: "O README cita Node 22, o cp do exemplo de ambiente como instrucao ao leitor, npm install, npm run setup, npm run dev, as contas admin@exemplo.local e usuario@exemplo.local, cada script do package.json e as tres camadas."
    criterio_aceite: "O teste de projeto passa e o README nao menciona template do buildx."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-05.02
    titulo: "Verificacao em copia limpa"
    fase: F-05.1
    status: concluida
    objetivo: "Provar a suite herdada e a nova num clone do estado commitado fora do repositorio."
    arquivos:
      cria: ["docs/fundacao-e-esqueleto/VERIFICACAO-COPIA-LIMPA.md"]
      altera: []
    teste_integracao: "Num clone limpo em diretorio temporario, npm ci, prisma generate, migrate deploy, lint, tsc, build, test e audit executam de verdade."
    teste_funcional: "Todos os comandos terminam com codigo 0 e a contagem de testes do clone e igual a da arvore de trabalho."
    criterio_aceite: "O arquivo de verificacao lista cada comando com o resultado e a contagem de testes."
    depende_de: [T-05.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-05.03
    titulo: "Conversao das convencoes"
    fase: F-05.1
    status: concluida
    objetivo: "Rodar stackx-detectar e transformar cada regra decidida pelo buildx em evidencia ou achado."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "stackx-detectar varre o codigo real e cada evidencia citada aponta para arquivo e linha existentes."
    teste_funcional: "Nenhuma regra restante em CONVENCOES.md fica marcada decidido_pelo_buildx sem evidencia ou achado, e o commit-referencia e o hash do commit verificado."
    criterio_aceite: "grep por decidido_pelo_buildx em CONVENCOES.md lista so regras sem codigo ainda existente, cada uma marcada como pendente de feature."
    depende_de: [T-05.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
---

# Plano — Sprint 05 — Documentacao e verificacao final: README, copia limpa e convencoes

## Objetivo da sprint

Entrega o README do produto, prova a suite numa copia limpa do estado commitado e converte as convencoes do buildx em evidencia.

## Critério de saída da sprint

A copia limpa passa npm ci, prisma generate, migrate deploy, lint, tsc, build, test e audit, e CONVENCOES.md tem commit-referencia preenchido.

## Riscos conhecidos

- a copia limpa so vale sobre o estado commitado: tudo precisa estar commitado antes (base/testes-e-banco.md)

## Fora de escopo

- Dockerfile e docker-compose - FT-11

## Fase F-05.1 — Documentacao e verificacao

**Objetivo:** README, copia limpa e convencoes.

**Tasks:** T-05.01, T-05.02, T-05.03

**Critério de saída:** os tres artefatos existem e a copia limpa esta verde

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-05 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_05_1["F-05.1 Documentacao e verificacao"]
    T_05_01["T-05.01<br/>README do projeto"]
    T_05_02["T-05.02<br/>Verificacao em copia limpa"]
    T_05_03["T-05.03<br/>Conversao das convencoes"]
  end
  T_05_01 --> T_05_02
  T_05_02 --> T_05_03
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_05_01 concluida
  class T_05_02 concluida
  class T_05_03 concluida
```

## Tasks

---

```yaml
id: T-05.01
titulo: README do projeto
objetivo: Substituir o README do template pelo do Converse.
arquivos:
  cria: []
  altera: [README.md, tests/projeto.test.ts]
teste_integracao: tests/projeto.test.ts le README.md e os scripts do package.json.
teste_funcional: O README cita Node 22, o cp do exemplo de ambiente como instrucao ao leitor, npm install, npm run setup, npm run dev, as contas admin@exemplo.local e usuario@exemplo.local, cada script do package.json e as tres camadas.
criterio_aceite: O teste de projeto passa e o README nao menciona template do buildx.
depende_de: []
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: projeto.test 10 passed
```

---

```yaml
id: T-05.02
titulo: Verificacao em copia limpa
objetivo: Provar a suite herdada e a nova num clone do estado commitado fora do repositorio.
arquivos:
  cria: [docs/fundacao-e-esqueleto/VERIFICACAO-COPIA-LIMPA.md]
  altera: []
teste_integracao: Num clone limpo em diretorio temporario, npm ci, prisma generate, migrate deploy, lint, tsc, build, test e audit executam de verdade.
teste_funcional: Todos os comandos terminam com codigo 0 e a contagem de testes do clone e igual a da arvore de trabalho.
criterio_aceite: O arquivo de verificacao lista cada comando com o resultado e a contagem de testes.
depende_de: [T-05.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: clone limpo: npm ci, generate, migrate, lint, tsc, build, test 184, audit, setup: todos codigo 0
```

---

```yaml
id: T-05.03
titulo: Conversao das convencoes
objetivo: Rodar stackx-detectar e transformar cada regra decidida pelo buildx em evidencia ou achado.
arquivos:
  cria: []
  altera: [docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md]
teste_integracao: stackx-detectar varre o codigo real e cada evidencia citada aponta para arquivo e linha existentes.
teste_funcional: Nenhuma regra restante em CONVENCOES.md fica marcada decidido_pelo_buildx sem evidencia ou achado, e o commit-referencia e o hash do commit verificado.
criterio_aceite: grep por decidido_pelo_buildx em CONVENCOES.md lista so regras sem codigo ainda existente, cada uma marcada como pendente de feature.
depende_de: [T-05.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: citacoes conferidas por arquivo e linha; regras restantes decidido_pelo_buildx nomeiam a feature
```

