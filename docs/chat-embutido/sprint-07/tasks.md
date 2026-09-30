---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-07
atualizado_em: 2026-09-30
tasks:
  - id: T-07.01
    titulo: "Convencoes, lacunas e README"
    fase: F-07.1
    status: concluida
    objetivo: "Converter as lacunas de handler publico, CSP dinamico e proxy em regras com arquivo:linha e atualizar o README."
    arquivos:
      cria: ["docs/chat-embutido/sprint-07/sprint.md", "docs/chat-embutido/sprint-07/fases.md"]
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
    teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
    teste_funcional: "CONVENCOES.md traz as regras de rota publica sem sessao, CSP por proxy.ts, excecao de cor literal do widget e APP_URL, e o README mostra o snippet e o fluxo de publicar."
    criterio_aceite: "tests/projeto.test.ts passa e o grep de proxy.ts em CONVENCOES.md devolve a regra."
    depende_de: ["T-06.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-07.02
    titulo: "Verificacao ponta a ponta no navegador"
    fase: F-07.1
    status: concluida
    objetivo: "Subir app de producao, OpenRouter falso e um site estatico em outra porta e verificar botao, stream, limite e bloqueio por dominio."
    arquivos:
      cria: ["tests/apoio/servir-site-de-teste.ts", "docs/chat-embutido/VERIFICACAO-VISUAL.md"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "O site estatico numa porta diferente carrega o widget.js do app e o botao abre o painel com o iframe do app, ou o registro diz que a ferramenta de navegador nao estava disponivel."
    teste_funcional: "A resposta chega em stream, o excesso de mensagens mostra a mensagem amigavel, o site fora da lista de dominios tem o iframe bloqueado pelo navegador, e o que nao foi visto (375px, por exemplo) esta listado."
    criterio_aceite: "docs/chat-embutido/VERIFICACAO-VISUAL.md existe com o que foi verificado e o que ficou sem verificar."
    depende_de: ["T-07.01"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-07.03
    titulo: "Fechamento no laco do buildx"
    fase: F-07.2
    status: pendente
    objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias e ambiente."
    arquivos:
      cria: ["docs/chat-embutido/ORQUESTRADOR.md", "docs/chat-embutido/00-AUDITORIA.md", "docs/chat-embutido/FECHAMENTO.md", "docs/chat-embutido/RELATORIO-FEATURE.md", "docs/chat-embutido/BRIEFING-BUILDX.md", "docs/chat-embutido/00-DECISOES.md", "docs/chat-embutido/00-BLOQUEIOS.md", "docs/chat-embutido/VERIFICACAO-VISUAL.md", "docs/chat-embutido/base/00-INDICE.md", "docs/chat-embutido/base/00-LACUNAS.md", "docs/chat-embutido/base/api-publica-e-limites.md", "docs/chat-embutido/base/embed-e-csp.md", "docs/chat-embutido/base/widget-e-script.md", "docs/chat-embutido/base/configuracao-e-painel.md", "docs/entregas/chat-embutido/ENTREGA.md", "docs/entregas/chat-embutido/PR.md", "docs/entregas/chat-embutido/QA-PACOTE.md", "docs/entregas/chat-embutido/ATENCAO.md", "docs/chat-embutido/sprint-07/tasks.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "docs/chat-embutido/sprint-01/tasks.md", "docs/chat-embutido/sprint-02/tasks.md", "docs/chat-embutido/sprint-03/tasks.md", "docs/chat-embutido/sprint-04/tasks.md", "docs/chat-embutido/sprint-05/tasks.md", "docs/chat-embutido/sprint-06/tasks.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra a FT-06 entregue com sprints, testes e PR local, PREMISSAS.md tem total 62 e PR-08, PR-16 e PR-17 realizadas em FT-06."
    criterio_aceite: "grep de FT-06 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 62 e tests/projeto.test.ts passa."
    depende_de: ["T-07.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 07

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task (declarada desde o início, repetida no ENTREGA.md).

---

```yaml
id: T-07.01
titulo: "Convencoes, lacunas e README"
objetivo: "Converter as lacunas de handler publico, CSP dinamico e proxy em regras com arquivo:linha e atualizar o README."
arquivos:
  cria: ["docs/chat-embutido/sprint-07/sprint.md", "docs/chat-embutido/sprint-07/fases.md"]
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
teste_funcional: "CONVENCOES.md traz as regras de rota publica sem sessao, CSP por proxy.ts, excecao de cor literal do widget e APP_URL, e o README mostra o snippet e o fluxo de publicar."
criterio_aceite: "tests/projeto.test.ts passa e o grep de proxy.ts em CONVENCOES.md devolve a regra."
depende_de: ["T-06.04"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1481 passed
```

---

```yaml
id: T-07.02
titulo: "Verificacao ponta a ponta no navegador"
objetivo: "Subir app de producao, OpenRouter falso e um site estatico em outra porta e verificar botao, stream, limite e bloqueio por dominio."
arquivos:
  cria: ["tests/apoio/servir-site-de-teste.ts", "docs/chat-embutido/VERIFICACAO-VISUAL.md"]
  altera: ["src/estilos/global.css"]
teste_integracao: "O site estatico numa porta diferente carrega o widget.js do app e o botao abre o painel com o iframe do app, ou o registro diz que a ferramenta de navegador nao estava disponivel."
teste_funcional: "A resposta chega em stream, o excesso de mensagens mostra a mensagem amigavel, o site fora da lista de dominios tem o iframe bloqueado pelo navegador, e o que nao foi visto (375px, por exemplo) esta listado."
criterio_aceite: "docs/chat-embutido/VERIFICACAO-VISUAL.md existe com o que foi verificado e o que ficou sem verificar."
depende_de: ["T-07.01"]
paralelizavel: false
status: concluida   # 2026-09-30 · suíte: verde — 1458 passed
```

---

```yaml
id: T-07.03
titulo: "Fechamento no laco do buildx"
objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias e ambiente."
arquivos:
  cria: ["docs/chat-embutido/ORQUESTRADOR.md", "docs/chat-embutido/00-AUDITORIA.md", "docs/chat-embutido/FECHAMENTO.md", "docs/chat-embutido/RELATORIO-FEATURE.md", "docs/chat-embutido/BRIEFING-BUILDX.md", "docs/chat-embutido/00-DECISOES.md", "docs/chat-embutido/00-BLOQUEIOS.md", "docs/chat-embutido/VERIFICACAO-VISUAL.md", "docs/chat-embutido/base/00-INDICE.md", "docs/chat-embutido/base/00-LACUNAS.md", "docs/chat-embutido/base/api-publica-e-limites.md", "docs/chat-embutido/base/embed-e-csp.md", "docs/chat-embutido/base/widget-e-script.md", "docs/chat-embutido/base/configuracao-e-painel.md", "docs/entregas/chat-embutido/ENTREGA.md", "docs/entregas/chat-embutido/PR.md", "docs/entregas/chat-embutido/QA-PACOTE.md", "docs/entregas/chat-embutido/ATENCAO.md", "docs/chat-embutido/sprint-07/tasks.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "docs/chat-embutido/sprint-01/tasks.md", "docs/chat-embutido/sprint-02/tasks.md", "docs/chat-embutido/sprint-03/tasks.md", "docs/chat-embutido/sprint-04/tasks.md", "docs/chat-embutido/sprint-05/tasks.md", "docs/chat-embutido/sprint-06/tasks.md"]
teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
teste_funcional: "O MAPA.md mostra a FT-06 entregue com sprints, testes e PR local, PREMISSAS.md tem total 62 e PR-08, PR-16 e PR-17 realizadas em FT-06."
criterio_aceite: "grep de FT-06 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 62 e tests/projeto.test.ts passa."
depende_de: ["T-07.02"]
paralelizavel: false
status: pendente
```
