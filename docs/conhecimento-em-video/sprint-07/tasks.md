---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-07
atualizado_em: 2026-10-01
tasks:
  - id: T-07.01
    titulo: "Verificacao ponta a ponta no navegador"
    fase: F-07.1
    status: concluida
    objetivo: "Subir o app de producao, o OpenRouter falso e o YouTube falso, enviar uma midia gerada com ffmpeg e um link do YouTube falso, ver barra, etapa e pronto e achar o trecho na busca."
    arquivos:
      cria: ["tests/apoio/servir-youtube-falso.ts", "docs/conhecimento-em-video/VERIFICACAO-VISUAL.md", "docs/conhecimento-em-video/sprint-07/sprint.md", "docs/conhecimento-em-video/sprint-07/fases.md", "docs/conhecimento-em-video/sprint-07/tasks.md"]
      altera: ["tests/apoio/servir-falso.ts", "src/estilos/global.css"]
    teste_integracao: "O roteiro roda contra o app de producao e os dois simulados e o OpenRouter falso registra um pedido por parte com input_audio e o YouTube falso registra a pagina e a legenda."
    teste_funcional: "A tela mostra a barra de envio, a etapa de transcricao e o selo Pronto das duas fontes, Testar busca acha uma frase da transcricao e do YouTube e a varredura dos logs do servidor nao acha texto transcrito."
    criterio_aceite: "docs/conhecimento-em-video/VERIFICACAO-VISUAL.md lista o que foi visto e o que nao pode ser visto."
    depende_de: ["T-06.04", "T-05.06", "T-04.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-07.02
    titulo: "Convencoes, lacunas e README"
    fase: F-07.1
    status: concluida
    objetivo: "Converter as lacunas de video em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md e documentar as variaveis, o ffmpeg e o YouTube no README."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
    teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
    teste_funcional: "CONVENCOES.md traz as regras de upload em stream, processo externo sem shell, fila de duas raias com retomada por segmento e YouTube com SSRF, LACUNAS.md registra a fragilidade do YouTube e o README explica o ffmpeg e as seis variaveis."
    criterio_aceite: "tests/projeto.test.ts passa e o grep de ffmpeg em CONVENCOES.md e README.md devolve as regras."
    depende_de: ["T-07.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-07.03
    titulo: "Fechamento no laco do buildx"
    fase: F-07.2
    status: pendente
    objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias, ambiente e CI."
    arquivos:
      cria: ["docs/conhecimento-em-video/ORQUESTRADOR.md", "docs/conhecimento-em-video/00-AUDITORIA.md", "docs/conhecimento-em-video/FECHAMENTO.md", "docs/conhecimento-em-video/RELATORIO-FEATURE.md", "docs/conhecimento-em-video/BRIEFING-BUILDX.md", "docs/conhecimento-em-video/00-DECISOES.md", "docs/conhecimento-em-video/00-BLOQUEIOS.md", "docs/conhecimento-em-video/base/00-INDICE.md", "docs/conhecimento-em-video/base/00-LACUNAS.md", "docs/conhecimento-em-video/base/openrouter-audio.md", "docs/conhecimento-em-video/base/youtube-legendas.md", "docs/conhecimento-em-video/base/midia-ffmpeg.md", "docs/conhecimento-em-video/base/fila-fontes-e-armazenamento.md", "docs/conhecimento-em-video/base/dados-ambiente-e-integracoes.md", "docs/conhecimento-em-video/base/upload-testes-e-ci.md", "docs/entregas/conhecimento-em-video/ENTREGA.md", "docs/entregas/conhecimento-em-video/PR.md", "docs/entregas/conhecimento-em-video/QA-PACOTE.md", "docs/entregas/conhecimento-em-video/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", ".github/workflows/ci.yml", "README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "docs/conhecimento-em-video/sprint-01/tasks.md", "docs/conhecimento-em-video/sprint-02/tasks.md", "docs/conhecimento-em-video/sprint-03/tasks.md", "docs/conhecimento-em-video/sprint-04/tasks.md", "docs/conhecimento-em-video/sprint-05/tasks.md", "docs/conhecimento-em-video/sprint-06/tasks.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra a FT-08 entregue com sprints, testes e PR local, PREMISSAS.md tem total 77 e PR-09 realizada em FT-08 e o RECURSAO.md registra no PEND-06 a exigencia de chave com saldo e ffmpeg."
    criterio_aceite: "grep de FT-08 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 77 e tests/projeto.test.ts passa."
    depende_de: ["T-07.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 07

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-07.01
titulo: "Verificacao ponta a ponta no navegador"
objetivo: "Subir o app de producao, o OpenRouter falso e o YouTube falso, enviar uma midia gerada com ffmpeg e um link do YouTube falso, ver barra, etapa e pronto e achar o trecho na busca."
arquivos:
  cria: ["tests/apoio/servir-youtube-falso.ts", "docs/conhecimento-em-video/VERIFICACAO-VISUAL.md", "docs/conhecimento-em-video/sprint-07/sprint.md", "docs/conhecimento-em-video/sprint-07/fases.md", "docs/conhecimento-em-video/sprint-07/tasks.md"]
  altera: ["tests/apoio/servir-falso.ts", "src/estilos/global.css"]
teste_integracao: "O roteiro roda contra o app de producao e os dois simulados e o OpenRouter falso registra um pedido por parte com input_audio e o YouTube falso registra a pagina e a legenda."
teste_funcional: "A tela mostra a barra de envio, a etapa de transcricao e o selo Pronto das duas fontes, Testar busca acha uma frase da transcricao e do YouTube e a varredura dos logs do servidor nao acha texto transcrito."
criterio_aceite: "docs/conhecimento-em-video/VERIFICACAO-VISUAL.md lista o que foi visto e o que nao pode ser visto."
depende_de: ["T-06.04", "T-05.06", "T-04.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/conhecimento-estilos.test.ts, tests/fontes-da-resposta.test.tsx e tests/tokens.test.ts, 56 passed; verificação manual no navegador registrada
```

---

```yaml
id: T-07.02
titulo: "Convencoes, lacunas e README"
objetivo: "Converter as lacunas de video em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md e documentar as variaveis, o ffmpeg e o YouTube no README."
arquivos:
  cria: []
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
teste_funcional: "CONVENCOES.md traz as regras de upload em stream, processo externo sem shell, fila de duas raias com retomada por segmento e YouTube com SSRF, LACUNAS.md registra a fragilidade do YouTube e o README explica o ffmpeg e as seis variaveis."
criterio_aceite: "tests/projeto.test.ts passa e o grep de ffmpeg em CONVENCOES.md e README.md devolve as regras."
depende_de: ["T-07.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/projeto.test.ts, 119 passed
```

---

```yaml
id: T-07.03
titulo: "Fechamento no laco do buildx"
objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias, ambiente e CI."
arquivos:
  cria: ["docs/conhecimento-em-video/ORQUESTRADOR.md", "docs/conhecimento-em-video/00-AUDITORIA.md", "docs/conhecimento-em-video/FECHAMENTO.md", "docs/conhecimento-em-video/RELATORIO-FEATURE.md", "docs/conhecimento-em-video/BRIEFING-BUILDX.md", "docs/conhecimento-em-video/00-DECISOES.md", "docs/conhecimento-em-video/00-BLOQUEIOS.md", "docs/conhecimento-em-video/base/00-INDICE.md", "docs/conhecimento-em-video/base/00-LACUNAS.md", "docs/conhecimento-em-video/base/openrouter-audio.md", "docs/conhecimento-em-video/base/youtube-legendas.md", "docs/conhecimento-em-video/base/midia-ffmpeg.md", "docs/conhecimento-em-video/base/fila-fontes-e-armazenamento.md", "docs/conhecimento-em-video/base/dados-ambiente-e-integracoes.md", "docs/conhecimento-em-video/base/upload-testes-e-ci.md", "docs/entregas/conhecimento-em-video/ENTREGA.md", "docs/entregas/conhecimento-em-video/PR.md", "docs/entregas/conhecimento-em-video/QA-PACOTE.md", "docs/entregas/conhecimento-em-video/ATENCAO.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", ".github/workflows/ci.yml", "README.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "docs/conhecimento-em-video/sprint-01/tasks.md", "docs/conhecimento-em-video/sprint-02/tasks.md", "docs/conhecimento-em-video/sprint-03/tasks.md", "docs/conhecimento-em-video/sprint-04/tasks.md", "docs/conhecimento-em-video/sprint-05/tasks.md", "docs/conhecimento-em-video/sprint-06/tasks.md"]
teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
teste_funcional: "O MAPA.md mostra a FT-08 entregue com sprints, testes e PR local, PREMISSAS.md tem total 77 e PR-09 realizada em FT-08 e o RECURSAO.md registra no PEND-06 a exigencia de chave com saldo e ffmpeg."
criterio_aceite: "grep de FT-08 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 77 e tests/projeto.test.ts passa."
depende_de: ["T-07.02"]
paralelizavel: false
status: pendente
```

---

