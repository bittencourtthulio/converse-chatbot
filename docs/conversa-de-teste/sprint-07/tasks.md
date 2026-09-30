---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
sprint_id: sprint-07
atualizado_em: 2026-09-30
sprint:
  titulo: "Verificacao, convencoes e fechamento"
  status: pendente
  criterio_saida: "suite, tsc, lint, build e audit verdes; VERIFICACAO-VISUAL.md registra o que foi visto; convencoes com evidencia; MAPA.md com FT-03 entregue."
  riscos: ["a verificacao visual depende de ferramenta de navegador (disponibilidade NAO DOCUMENTADO na base): se ausente, registrar a limitacao sem declarar verificado"]
  fora_de_escopo: ["merge e revisao humana"]
fases:
  - id: F-07.1
    titulo: "Fechamento"
    status: pendente
    criterio_saida: "verificacao visual registrada, convencoes atualizadas e a feature registrada no laco do buildx"
    paralelizavel: false
    paralela_com: []
    tasks: [T-07.01, T-07.02, T-07.03]
tasks:
  - id: T-07.01
    titulo: "Verificacao visual da aba Testar"
    fase: F-07.1
    status: concluida
    objetivo: "Abrir a aba Testar com o OpenRouter falso local nos dois temas e a 375px, ou registrar que nao foi possivel."
    arquivos:
      cria: ["docs/conversa-de-teste/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "O app roda com segredos inline e OPENROUTER_BASE_URL apontando para o falso local, e a ferramenta de navegador da sessao abre a aba."
    teste_funcional: "O registro traz, por tema e por largura, o que foi visto ou a razao de nao ter sido possivel, sem declarar verificado o que nao se viu."
    criterio_aceite: "O arquivo existe e cita os temas claro e escuro, a largura de 375px e o resultado do envio de uma mensagem."
    depende_de: [T-06.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-07.02
    titulo: "Convencoes e lacunas com a evidencia nova"
    fase: F-07.1
    status: pendente
    objetivo: "Converter as lacunas do handler HTTP e do stream em regras com arquivo e linha."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Cada evidencia citada em CONVENCOES.md aponta para arquivo e linha existentes."
    teste_funcional: "a linha de Handler HTTP cita src/app/api/agentes/[id]/conversar/route.ts, eventos SSE citam src/app/eventos-sse.ts, a leitura de SSE do navegador cita src/componentes/leitor-de-sse.ts, a lacuna 7 aparece resolvida e MAX_TOKENS_RESPOSTA consta em Configuracao."
    criterio_aceite: "grep das linhas citadas confirma cada referencia e o commit-referencia e atualizado."
    depende_de: [T-07.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-07.03
    titulo: "Fechamento no laco do buildx"
    fase: F-07.1
    status: pendente
    objetivo: "Registrar a feature no mapa, premissas e recursao e conferir arquivos de ambiente e dependencias."
    arquivos:
      cria: ["docs/conversa-de-teste/FECHAMENTO.md", "docs/conversa-de-teste/RELATORIO-FEATURE.md", "docs/conversa-de-teste/00-AUDITORIA.md", "docs/conversa-de-teste/ORQUESTRADOR.md", "docs/conversa-de-teste/BRIEFING-BUILDX.md", "docs/conversa-de-teste/00-DECISOES.md", "docs/conversa-de-teste/00-BLOQUEIOS.md", "docs/conversa-de-teste/base/00-INDICE.md", "docs/conversa-de-teste/base/00-LACUNAS.md", "docs/conversa-de-teste/base/streaming-e-openrouter.md", "docs/conversa-de-teste/base/banco-e-testes.md", "docs/conversa-de-teste/base/servicos-handlers-e-sessao.md", "docs/conversa-de-teste/base/interface-do-agente.md", "docs/entregas/conversa-de-teste/ENTREGA.md", "docs/entregas/conversa-de-teste/PR.md", "docs/entregas/conversa-de-teste/QA-PACOTE.md", "docs/entregas/conversa-de-teste/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts", "docs/conversa-de-teste/sprint-01/tasks.md", "docs/conversa-de-teste/sprint-02/tasks.md", "docs/conversa-de-teste/sprint-03/tasks.md", "docs/conversa-de-teste/sprint-04/tasks.md", "docs/conversa-de-teste/sprint-05/tasks.md", "docs/conversa-de-teste/sprint-06/tasks.md", "docs/conversa-de-teste/sprint-07/tasks.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra FT-03 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-41 a PR-44 com total 44, e o README documenta MAX_TOKENS_RESPOSTA e a aba Testar."
    criterio_aceite: "grep de FT-03 no painel do MAPA.md devolve entregue e o total de premissas do frontmatter e 44."
    depende_de: [T-07.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 07 — Verificacao, convencoes e fechamento

## Critério de saída da sprint

suite, tsc, lint, build e audit verdes; VERIFICACAO-VISUAL.md registra o que foi visto; convencoes com evidencia; MAPA.md com FT-03 entregue.

## Riscos conhecidos

- a verificacao visual depende de ferramenta de navegador (disponibilidade NAO DOCUMENTADO na base): se ausente, registrar a limitacao sem declarar verificado

## Fora de escopo

- merge e revisao humana

## Fase F-07.1 — Fechamento

**Tasks:** T-07.01, T-07.02, T-07.03

**Critério de saída:** verificacao visual registrada, convencoes atualizadas e a feature registrada no laco do buildx

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-07 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_07_1["F-07.1 Verificar e fechar"]
    T_07_01["T-07.01<br/>Verificacao visual da aba Te"]
    T_07_02["T-07.02<br/>Convencoes e lacunas com a e"]
    T_07_03["T-07.03<br/>Fechamento no laco do buildx"]
  end
  T_07_01 --> T_07_02
  T_07_02 --> T_07_03
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_07_01 concluida
  class T_07_02 pendente
  class T_07_03 pendente
```

## Tasks

---

```yaml
id: T-07.01
titulo: Verificacao visual da aba Testar
objetivo: Abrir a aba Testar com o OpenRouter falso local nos dois temas e a 375px, ou registrar que nao foi possivel.
arquivos:
  cria: [docs/conversa-de-teste/VERIFICACAO-VISUAL.md]
  altera: [src/estilos/global.css]
teste_integracao: O app roda com segredos inline e OPENROUTER_BASE_URL apontando para o falso local, e a ferramenta de navegador da sessao abre a aba.
teste_funcional: O registro traz, por tema e por largura, o que foi visto ou a razao de nao ter sido possivel, sem declarar verificado o que nao se viu.
criterio_aceite: O arquivo existe e cita os temas claro e escuro, a largura de 375px e o resultado do envio de uma mensagem.
depende_de: [T-06.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: verificacao visual registrada (claro e escuro vistos; 375px nao verificado e declarado); suite 572 verdes
```

---

```yaml
id: T-07.02
titulo: Convencoes e lacunas com a evidencia nova
objetivo: Converter as lacunas do handler HTTP e do stream em regras com arquivo e linha.
arquivos:
  cria: []
  altera: [docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md]
teste_integracao: Cada evidencia citada em CONVENCOES.md aponta para arquivo e linha existentes.
teste_funcional: a linha de Handler HTTP cita src/app/api/agentes/[id]/conversar/route.ts, eventos SSE citam src/app/eventos-sse.ts, a leitura de SSE do navegador cita src/componentes/leitor-de-sse.ts, a lacuna 7 aparece resolvida e MAX_TOKENS_RESPOSTA consta em Configuracao.
criterio_aceite: grep das linhas citadas confirma cada referencia e o commit-referencia e atualizado.
depende_de: [T-07.01]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-07.03
titulo: Fechamento no laco do buildx
objetivo: Registrar a feature no mapa, premissas e recursao e conferir arquivos de ambiente e dependencias.
arquivos:
  cria: [docs/conversa-de-teste/FECHAMENTO.md, docs/conversa-de-teste/RELATORIO-FEATURE.md, docs/conversa-de-teste/00-AUDITORIA.md, docs/conversa-de-teste/ORQUESTRADOR.md, docs/conversa-de-teste/BRIEFING-BUILDX.md, docs/conversa-de-teste/00-DECISOES.md, docs/conversa-de-teste/00-BLOQUEIOS.md, docs/conversa-de-teste/base/00-INDICE.md, docs/conversa-de-teste/base/00-LACUNAS.md, docs/conversa-de-teste/base/streaming-e-openrouter.md, docs/conversa-de-teste/base/banco-e-testes.md, docs/conversa-de-teste/base/servicos-handlers-e-sessao.md, docs/conversa-de-teste/base/interface-do-agente.md, docs/entregas/conversa-de-teste/ENTREGA.md, docs/entregas/conversa-de-teste/PR.md, docs/entregas/conversa-de-teste/QA-PACOTE.md, docs/entregas/conversa-de-teste/ATENCAO.md]
  altera: [docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/projeto/RECURSAO.md, docs/projeto/PROJETO.md, .gitignore, .env.example, package.json, package-lock.json, README.md, tests/projeto.test.ts, docs/conversa-de-teste/sprint-01/tasks.md, docs/conversa-de-teste/sprint-02/tasks.md, docs/conversa-de-teste/sprint-03/tasks.md, docs/conversa-de-teste/sprint-04/tasks.md, docs/conversa-de-teste/sprint-05/tasks.md, docs/conversa-de-teste/sprint-06/tasks.md, docs/conversa-de-teste/sprint-07/tasks.md]
teste_integracao: Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel.
teste_funcional: O MAPA.md mostra FT-03 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-41 a PR-44 com total 44, e o README documenta MAX_TOKENS_RESPOSTA e a aba Testar.
criterio_aceite: grep de FT-03 no painel do MAPA.md devolve entregue e o total de premissas do frontmatter e 44.
depende_de: [T-07.02]
paralelizavel: false
status: pendente
```

