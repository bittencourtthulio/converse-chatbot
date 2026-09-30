---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
sprint_id: sprint-06
atualizado_em: 2026-09-30
sprint:
  titulo: "Verificacao e fechamento"
  status: pendente
  criterio_saida: "A verificacao visual esta registrada, CONVENCOES.md e LACUNAS.md citam a evidencia nova e o MAPA.md mostra FT-02 com os contadores corretos."
  riscos: ["a ferramenta de navegador pode nao estar disponivel: registrar como nao feito, sem declarar verificado"]
  fora_de_escopo: ["Dockerfile e backup - FT-11"]
fases:
  - id: F-06.1
    titulo: "Fechamento"
    status: pendente
    criterio_saida: "verificacao registrada, convencoes atualizadas, feature registrada no laco do buildx"
    paralelizavel: false
    paralela_com: []
    tasks: [T-06.01, T-06.02, T-06.03]
tasks:
  - id: T-06.01
    titulo: "Verificacao visual"
    fase: F-06.1
    status: concluida
    objetivo: "Abrir /agentes e /configuracoes/integracoes nos dois temas e a 375px, ou registrar que nao foi possivel."
    arquivos:
      cria: ["docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "O app roda com segredos inline e a ferramenta de navegador da sessao abre as duas paginas."
    teste_funcional: "O registro traz, por pagina e tema, o que foi visto ou a razao de nao ter sido possivel, sem declarar verificado o que nao se viu."
    criterio_aceite: "O arquivo existe, cita as duas rotas e os dois temas e a largura de 375px."
    depende_de: [T-05.07, T-03.05]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-06.02
    titulo: "Convencoes e lacunas com a evidencia nova"
    fase: F-06.1
    status: concluida
    objetivo: "Converter regras que agora tem codigo e atualizar as lacunas 5 e 9."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Cada evidencia citada em CONVENCOES.md aponta para arquivo e linha existentes."
    teste_funcional: "A regra de HTTP de saida simulado cita tests/apoio/openrouter-falso.ts, o adaptador cita src/lib/openrouter.ts, a lacuna 9 aparece resolvida com tests/migracoes.test.ts e a 5 so com a parte de armazenamento."
    criterio_aceite: "grep das linhas citadas confirma cada referencia e o commit-referencia e atualizado."
    depende_de: [T-06.01]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: parcial
  - id: T-06.03
    titulo: "Fechamento no laco do buildx"
    fase: F-06.1
    status: pendente
    objetivo: "Registrar a feature no mapa, premissas e recursao e conferir arquivos de ambiente e dependencias."
    arquivos:
      cria: []
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", "docs/projeto/PROJETO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "README.md", "tests/projeto.test.ts"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra FT-02 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-38 a PR-40 com total 40, e o README documenta ENCRYPTION_KEY, OPENROUTER_BASE_URL e APP_URL."
    criterio_aceite: "grep de FT-02 no painel do MAPA.md devolve entregue e o total de premissas do frontmatter e 40."
    depende_de: [T-06.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 06 — Verificacao e fechamento

## Critério de saída da sprint

A verificacao visual esta registrada, CONVENCOES.md e LACUNAS.md citam a evidencia nova e o MAPA.md mostra FT-02 com os contadores corretos.

## Riscos conhecidos

- a ferramenta de navegador pode nao estar disponivel: registrar como nao feito, sem declarar verificado

## Fora de escopo

- Dockerfile e backup - FT-11

## Fase F-06.1 — Fechamento

**Tasks:** T-06.01, T-06.02, T-06.03

**Critério de saída:** verificacao registrada, convencoes atualizadas, feature registrada no laco do buildx

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-06 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_06_1["F-06.1 Fechamento"]
    T_06_01["T-06.01<br/>Verificacao visual"]
    T_06_02["T-06.02<br/>Convencoes e lacunas com a e"]
    T_06_03["T-06.03<br/>Fechamento no laco do buildx"]
  end
  T_06_01 --> T_06_02
  T_06_02 --> T_06_03
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_06_01 concluida
  class T_06_02 concluida
  class T_06_03 pendente
```

## Tasks

---

```yaml
id: T-06.01
titulo: Verificacao visual
objetivo: Abrir /agentes e /configuracoes/integracoes nos dois temas e a 375px, ou registrar que nao foi possivel.
arquivos:
  cria: [docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md]
  altera: [src/estilos/global.css]
teste_integracao: O app roda com segredos inline e a ferramenta de navegador da sessao abre as duas paginas.
teste_funcional: O registro traz, por pagina e tema, o que foi visto ou a razao de nao ter sido possivel, sem declarar verificado o que nao se viu.
criterio_aceite: O arquivo existe, cita as duas rotas e os dois temas e a largura de 375px.
depende_de: [T-05.07, T-03.05]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: verificacao registrada; achado do botao corrigido; tokens ok
```

---

```yaml
id: T-06.02
titulo: Convencoes e lacunas com a evidencia nova
objetivo: Converter regras que agora tem codigo e atualizar as lacunas 5 e 9.
arquivos:
  cria: []
  altera: [docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md]
teste_integracao: Cada evidencia citada em CONVENCOES.md aponta para arquivo e linha existentes.
teste_funcional: A regra de HTTP de saida simulado cita tests/apoio/openrouter-falso.ts, o adaptador cita src/lib/openrouter.ts, a lacuna 9 aparece resolvida com tests/migracoes.test.ts e a 5 so com a parte de armazenamento.
criterio_aceite: grep das linhas citadas confirma cada referencia e o commit-referencia e atualizado.
depende_de: [T-06.01]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: parcial
resultado: referencias conferidas por grep; commit-referencia 0e0fda1
```

---

```yaml
id: T-06.03
titulo: Fechamento no laco do buildx
objetivo: Registrar a feature no mapa, premissas e recursao e conferir arquivos de ambiente e dependencias.
arquivos:
  cria: []
  altera: [docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/projeto/RECURSAO.md, docs/projeto/PROJETO.md, .gitignore, .env.example, package.json, package-lock.json, README.md, tests/projeto.test.ts]
teste_integracao: Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel.
teste_funcional: O MAPA.md mostra FT-02 entregue com sprints, testes e PR local, PREMISSAS.md traz PR-38 a PR-40 com total 40, e o README documenta ENCRYPTION_KEY, OPENROUTER_BASE_URL e APP_URL.
criterio_aceite: grep de FT-02 no painel do MAPA.md devolve entregue e o total de premissas do frontmatter e 40.
depende_de: [T-06.02]
paralelizavel: false
status: pendente
```

