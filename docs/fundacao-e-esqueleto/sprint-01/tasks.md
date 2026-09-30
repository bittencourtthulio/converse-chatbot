---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
sprint_id: sprint-01
atualizado_em: 2026-09-30
sprint:
  titulo: "Rede de protecao: camadas, scripts, pipeline e seed verificados"
  status: nao_iniciado
  criterio_saida: "npm test termina com 0 failed, npm run lint e npx tsc --noEmit terminam com codigo 0 e o teste de camadas prova as quatro direcoes proibidas."
  riscos: ["src/lib/sessao-servidor.ts viola a direcao das camadas e precisa mudar de pasta (base/camadas-e-lint.md, D-12)", "o teste de rotas sobe o servidor de producao e exige build previo (base/testes-e-banco.md)"]
  fora_de_escopo: ["regras de lint de estilo alem da direcao das camadas - fora do briefing"]
fases:
  - id: F-01.1
    titulo: "Rede de protecao"
    status: nao_iniciado
    criterio_saida: "lint, tsc e a suite inteira verdes com os quatro arquivos de teste novos"
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03, T-01.04]
tasks:
  - id: T-01.01
    titulo: "Regra de camadas no lint e sessao-servidor movido"
    fase: F-01.1
    status: pendente
    objetivo: "Tornar a direcao das camadas uma regra de lint e corrigir a unica violacao existente."
    arquivos:
      cria: ["tests/camadas.test.ts", "src/app/sessao-servidor.ts"]
      altera: ["eslint.config.mjs", "src/app/acoes.ts", "src/app/entrar/page.tsx", "src/app/(sistema)/layout.tsx", "src/app/(sistema)/page.tsx", "src/app/(sistema)/perfil/page.tsx", "src/app/(sistema)/perfil/senha/page.tsx", "src/app/(sistema)/configuracoes/usuarios/page.tsx"]
    teste_integracao: "tests/camadas.test.ts chama a API do ESLint com o eslint.config.mjs real sobre texto de amostra e um caminho de cada camada."
    teste_funcional: "Amostra de src/servicos importando next/headers, amostra de src/lib importando @/servicos, e amostra de src/app importando @/lib/prisma devolvem erro no-restricted-imports; amostra valida devolve zero erros."
    criterio_aceite: "npm run lint termina com codigo 0 no repositorio e os tres casos proibidos do teste falham como esperado."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: "Script setup com migrate deploy e exemplo de ambiente"
    fase: F-01.1
    status: pendente
    objetivo: "Trocar db push por migrate deploy no setup e documentar APP_NAME e TRUST_PROXY no exemplo de ambiente."
    arquivos:
      cria: ["tests/projeto.test.ts"]
      altera: ["package.json", ".env.example"]
    teste_integracao: "tests/projeto.test.ts le o package.json e o .env.example reais do repositorio."
    teste_funcional: "O script setup e igual a prisma generate && prisma migrate deploy && npm run db:seed, o script db:push nao existe, e o .env.example lista APP_NAME e TRUST_PROXY, com JWT_SECRET vazio."
    criterio_aceite: "O teste de projeto passa e o package.json nao contem prisma db push."
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: "Pipeline de CI"
    fase: F-01.1
    status: pendente
    objetivo: "Criar o fluxo de verificacao de PR-26 com Node 22."
    arquivos:
      cria: [".github/workflows/ci.yml"]
      altera: ["tests/projeto.test.ts"]
    teste_integracao: "tests/projeto.test.ts le .github/workflows/ci.yml e confere a versao do Node e a ordem dos passos."
    teste_funcional: "O arquivo tem node-version 22 e, nesta ordem, npm ci, npx prisma generate, npm run lint, npx tsc --noEmit, npm run build, npm test e npm audit --audit-level=high, com DATABASE_URL e JWT_SECRET de CI no passo de build."
    criterio_aceite: "O teste de projeto passa e nenhum valor de segredo real aparece no arquivo."
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.04
    titulo: "Seed de demonstracao coberta por teste"
    fase: F-01.1
    status: pendente
    objetivo: "Provar que a seed cria as duas contas, e idempotente e recusa producao."
    arquivos:
      cria: ["tests/seed.test.ts"]
      altera: []
    teste_integracao: "tests/seed.test.ts executa prisma/seed.ts com tsx contra o banco de teste migrado."
    teste_funcional: "Duas execucoes seguidas deixam exatamente as contas admin@exemplo.local e usuario@exemplo.local, com senha demo1234 confere no hash; com NODE_ENV=production o processo sai com codigo diferente de 0 e nada e gravado."
    criterio_aceite: "O teste da seed passa e a tabela de usuarios tem 2 linhas apos duas execucoes."
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 01 — Rede de protecao: camadas, scripts, pipeline e seed verificados

## Objetivo da sprint

Entrega a capacidade de verificar a feature: regra de lint da direcao das camadas, scripts e exemplo de ambiente corretos, pipeline de CI e a seed coberta por teste. Nenhuma funcionalidade nova de negocio.

## Critério de saída da sprint

npm test termina com 0 failed, npm run lint e npx tsc --noEmit terminam com codigo 0 e o teste de camadas prova as quatro direcoes proibidas.

## Riscos conhecidos

- src/lib/sessao-servidor.ts viola a direcao das camadas e precisa mudar de pasta (base/camadas-e-lint.md, D-12)
- o teste de rotas sobe o servidor de producao e exige build previo (base/testes-e-banco.md)

## Fora de escopo

- regras de lint de estilo alem da direcao das camadas - fora do briefing

## Fase F-01.1 — Rede de protecao

**Objetivo:** Camadas, scripts, CI e seed passam a ser verificaveis por comando.

**Tasks:** T-01.01, T-01.02, T-01.03, T-01.04

**Critério de saída:** lint, tsc e a suite inteira verdes com os quatro arquivos de teste novos

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-01 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_01_1["F-01.1 Rede de protecao"]
    T_01_01["T-01.01<br/>Regra de camadas no lint e s"]
    T_01_02["T-01.02<br/>Script setup com migrate dep"]
    T_01_03["T-01.03<br/>Pipeline de CI"]
    T_01_04["T-01.04<br/>Seed de demonstracao coberta"]
  end
  T_01_01 --> T_01_02
  T_01_02 --> T_01_03
  T_01_02 --> T_01_04
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_01_01 pendente
  class T_01_02 pendente
  class T_01_03 pendente
  class T_01_04 pendente
```

## Tasks

---

```yaml
id: T-01.01
titulo: Regra de camadas no lint e sessao-servidor movido
objetivo: Tornar a direcao das camadas uma regra de lint e corrigir a unica violacao existente.
arquivos:
  cria: [tests/camadas.test.ts, src/app/sessao-servidor.ts]
  altera: [eslint.config.mjs, src/app/acoes.ts, src/app/entrar/page.tsx, src/app/(sistema)/layout.tsx, src/app/(sistema)/page.tsx, src/app/(sistema)/perfil/page.tsx, src/app/(sistema)/perfil/senha/page.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx]
teste_integracao: tests/camadas.test.ts chama a API do ESLint com o eslint.config.mjs real sobre texto de amostra e um caminho de cada camada.
teste_funcional: Amostra de src/servicos importando next/headers, amostra de src/lib importando @/servicos, e amostra de src/app importando @/lib/prisma devolvem erro no-restricted-imports; amostra valida devolve zero erros.
criterio_aceite: npm run lint termina com codigo 0 no repositorio e os tres casos proibidos do teste falham como esperado.
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.02
titulo: Script setup com migrate deploy e exemplo de ambiente
objetivo: Trocar db push por migrate deploy no setup e documentar APP_NAME e TRUST_PROXY no exemplo de ambiente.
arquivos:
  cria: [tests/projeto.test.ts]
  altera: [package.json, .env.example]
teste_integracao: tests/projeto.test.ts le o package.json e o .env.example reais do repositorio.
teste_funcional: O script setup e igual a prisma generate && prisma migrate deploy && npm run db:seed, o script db:push nao existe, e o .env.example lista APP_NAME e TRUST_PROXY, com JWT_SECRET vazio.
criterio_aceite: O teste de projeto passa e o package.json nao contem prisma db push.
depende_de: [T-01.01]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.03
titulo: Pipeline de CI
objetivo: Criar o fluxo de verificacao de PR-26 com Node 22.
arquivos:
  cria: [.github/workflows/ci.yml]
  altera: [tests/projeto.test.ts]
teste_integracao: tests/projeto.test.ts le .github/workflows/ci.yml e confere a versao do Node e a ordem dos passos.
teste_funcional: O arquivo tem node-version 22 e, nesta ordem, npm ci, npx prisma generate, npm run lint, npx tsc --noEmit, npm run build, npm test e npm audit --audit-level=high, com DATABASE_URL e JWT_SECRET de CI no passo de build.
criterio_aceite: O teste de projeto passa e nenhum valor de segredo real aparece no arquivo.
depende_de: [T-01.02]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.04
titulo: Seed de demonstracao coberta por teste
objetivo: Provar que a seed cria as duas contas, e idempotente e recusa producao.
arquivos:
  cria: [tests/seed.test.ts]
  altera: []
teste_integracao: tests/seed.test.ts executa prisma/seed.ts com tsx contra o banco de teste migrado.
teste_funcional: Duas execucoes seguidas deixam exatamente as contas admin@exemplo.local e usuario@exemplo.local, com senha demo1234 confere no hash; com NODE_ENV=production o processo sai com codigo diferente de 0 e nada e gravado.
criterio_aceite: O teste da seed passa e a tabela de usuarios tem 2 linhas apos duas execucoes.
depende_de: [T-01.02]
paralelizavel: false
status: pendente
```

