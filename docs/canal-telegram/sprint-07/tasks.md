---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-07
atualizado_em: 2026-09-30
tasks:
  - id: T-07.01
    titulo: "Verificacao ponta a ponta no navegador"
    fase: F-07.1
    status: pendente
    objetivo: "Subir o app de producao, o OpenRouter falso e o Telegram falso, conectar um bot pela tela, disparar updates por curl e registrar o resultado."
    arquivos:
      cria: ["tests/apoio/servir-telegram-falso.ts", "docs/canal-telegram/VERIFICACAO-VISUAL.md", "docs/canal-telegram/sprint-07/sprint.md", "docs/canal-telegram/sprint-07/fases.md", "docs/canal-telegram/sprint-07/tasks.md"]
      altera: []
    teste_integracao: "O roteiro roda contra o app de producao e o Telegram falso e o simulado registra a sendMessage da resposta, o dedupe, /start, /novo, o limite e o 401 de segredo errado."
    teste_funcional: "A tela conecta o bot falso e mostra nome, usuario e selo, e a varredura dos logs do servidor nao encontra o token de teste."
    criterio_aceite: "docs/canal-telegram/VERIFICACAO-VISUAL.md lista o que foi visto e o que nao pode ser visto e o grep do token nos logs devolve zero linhas."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-07.02
    titulo: "Convencoes, lacunas e README"
    fase: F-07.1
    status: pendente
    objetivo: "Converter as lacunas do Telegram em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md e documentar o canal e as variaveis no README."
    arquivos:
      cria: []
      altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
    teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
    teste_funcional: "CONVENCOES.md traz as regras de webhook de terceiro com segredo, token na URL com redacao, processamento apos a resposta e simulado do Telegram, e o README explica o passo a passo e as duas variaveis."
    criterio_aceite: "tests/projeto.test.ts passa e o grep de telegram em CONVENCOES.md devolve as regras."
    depende_de: ["T-07.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-07.03
    titulo: "Fechamento no laco do buildx"
    fase: F-07.2
    status: pendente
    objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias e ambiente."
    arquivos:
      cria: ["docs/canal-telegram/ORQUESTRADOR.md", "docs/canal-telegram/00-AUDITORIA.md", "docs/canal-telegram/FECHAMENTO.md", "docs/canal-telegram/RELATORIO-FEATURE.md", "docs/canal-telegram/BRIEFING-BUILDX.md", "docs/canal-telegram/00-DECISOES.md", "docs/canal-telegram/00-BLOQUEIOS.md", "docs/canal-telegram/base/00-INDICE.md", "docs/canal-telegram/base/00-LACUNAS.md", "docs/canal-telegram/base/telegram-bot-api.md", "docs/canal-telegram/base/turno-e-limites.md", "docs/canal-telegram/base/dados-segredo-e-ambiente.md", "docs/canal-telegram/base/rotas-painel-e-testes.md", "docs/entregas/canal-telegram/ENTREGA.md", "docs/entregas/canal-telegram/PR.md", "docs/entregas/canal-telegram/QA-PACOTE.md", "docs/entregas/canal-telegram/ATENCAO.md"]
      altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "docs/canal-telegram/sprint-01/tasks.md", "docs/canal-telegram/sprint-02/tasks.md", "docs/canal-telegram/sprint-03/tasks.md", "docs/canal-telegram/sprint-04/tasks.md", "docs/canal-telegram/sprint-05/tasks.md", "docs/canal-telegram/sprint-06/tasks.md"]
    teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
    teste_funcional: "O MAPA.md mostra a FT-07 entregue com sprints, testes e PR local, PREMISSAS.md tem total 70 e PR-07, PR-14 e PR-16 realizadas tambem em FT-07."
    criterio_aceite: "grep de FT-07 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 70 e tests/projeto.test.ts passa."
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
titulo: "Verificacao ponta a ponta no navegador"
objetivo: "Subir o app de producao, o OpenRouter falso e o Telegram falso, conectar um bot pela tela, disparar updates por curl e registrar o resultado."
arquivos:
  cria: ["tests/apoio/servir-telegram-falso.ts", "docs/canal-telegram/VERIFICACAO-VISUAL.md", "docs/canal-telegram/sprint-07/sprint.md", "docs/canal-telegram/sprint-07/fases.md", "docs/canal-telegram/sprint-07/tasks.md"]
  altera: []
teste_integracao: "O roteiro roda contra o app de producao e o Telegram falso e o simulado registra a sendMessage da resposta, o dedupe, /start, /novo, o limite e o 401 de segredo errado."
teste_funcional: "A tela conecta o bot falso e mostra nome, usuario e selo, e a varredura dos logs do servidor nao encontra o token de teste."
criterio_aceite: "docs/canal-telegram/VERIFICACAO-VISUAL.md lista o que foi visto e o que nao pode ser visto e o grep do token nos logs devolve zero linhas."
depende_de: ["T-06.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-07.02
titulo: "Convencoes, lacunas e README"
objetivo: "Converter as lacunas do Telegram em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md e documentar o canal e as variaveis no README."
arquivos:
  cria: []
  altera: ["docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "README.md", "tests/projeto.test.ts"]
teste_integracao: "Cada arquivo:linha citado nas convencoes novas existe e a linha contem o trecho descrito."
teste_funcional: "CONVENCOES.md traz as regras de webhook de terceiro com segredo, token na URL com redacao, processamento apos a resposta e simulado do Telegram, e o README explica o passo a passo e as duas variaveis."
criterio_aceite: "tests/projeto.test.ts passa e o grep de telegram em CONVENCOES.md devolve as regras."
depende_de: ["T-07.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-07.03
titulo: "Fechamento no laco do buildx"
objetivo: "Registrar a feature no mapa, nas premissas, na recursao e no projeto e conferir dependencias e ambiente."
arquivos:
  cria: ["docs/canal-telegram/ORQUESTRADOR.md", "docs/canal-telegram/00-AUDITORIA.md", "docs/canal-telegram/FECHAMENTO.md", "docs/canal-telegram/RELATORIO-FEATURE.md", "docs/canal-telegram/BRIEFING-BUILDX.md", "docs/canal-telegram/00-DECISOES.md", "docs/canal-telegram/00-BLOQUEIOS.md", "docs/canal-telegram/base/00-INDICE.md", "docs/canal-telegram/base/00-LACUNAS.md", "docs/canal-telegram/base/telegram-bot-api.md", "docs/canal-telegram/base/turno-e-limites.md", "docs/canal-telegram/base/dados-segredo-e-ambiente.md", "docs/canal-telegram/base/rotas-painel-e-testes.md", "docs/entregas/canal-telegram/ENTREGA.md", "docs/entregas/canal-telegram/PR.md", "docs/entregas/canal-telegram/QA-PACOTE.md", "docs/entregas/canal-telegram/ATENCAO.md"]
  altera: ["docs/projeto/MAPA.md", "docs/projeto/PROJETO.md", "docs/projeto/PREMISSAS.md", "docs/projeto/RECURSAO.md", ".gitignore", ".env.example", "package.json", "package-lock.json", "docs/canal-telegram/sprint-01/tasks.md", "docs/canal-telegram/sprint-02/tasks.md", "docs/canal-telegram/sprint-03/tasks.md", "docs/canal-telegram/sprint-04/tasks.md", "docs/canal-telegram/sprint-05/tasks.md", "docs/canal-telegram/sprint-06/tasks.md"]
teste_integracao: "Os arquivos de estado do projeto abrem com frontmatter valido e os contadores do MAPA.md batem com a tabela do painel."
teste_funcional: "O MAPA.md mostra a FT-07 entregue com sprints, testes e PR local, PREMISSAS.md tem total 70 e PR-07, PR-14 e PR-16 realizadas tambem em FT-07."
criterio_aceite: "grep de FT-07 no painel do MAPA.md devolve entregue, o total de premissas do frontmatter e 70 e tests/projeto.test.ts passa."
depende_de: ["T-07.02"]
paralelizavel: false
status: pendente
```
