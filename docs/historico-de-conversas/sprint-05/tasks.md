---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-05
atualizado_em: 2026-10-01
tasks:
  - id: T-05.01
    titulo: "Numeros e serie de 14 dias"
    fase: F-05.1
    status: concluida
    objetivo: "Implementar a agregacao SQL dos numeros e da serie diaria com dias vazios em zero e instante injetavel."
    arquivos:
      cria: ["src/servicos/painel.ts", "tests/painel-numeros.test.ts", "tests/painel-serie.test.ts", "docs/historico-de-conversas/sprint-05/sprint.md", "docs/historico-de-conversas/sprint-05/fases.md", "docs/historico-de-conversas/sprint-05/tasks.md"]
      altera: []
    teste_integracao: "Contra o banco de teste, o painel devolve agentes, fontes prontas e com erro, conversas e mensagens de 7 dias por canal e a serie de 14 dias por consulta parametrizada."
    teste_funcional: "Sem dados tudo e zero e a serie tem 14 dias em zero, uma mensagem as 23:59 e outra as 00:01 locais caem em dias diferentes, o TZ muda o dia agrupado e mensagens com 15 dias ficam fora."
    criterio_aceite: "tests/painel-numeros.test.ts e tests/painel-serie.test.ts passam."
    depende_de: ["T-04.04"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.02
    titulo: "Recentes, alerta e primeiros passos"
    fase: F-05.1
    status: concluida
    objetivo: "Acrescentar ao painel as 5 conversas recentes, as fontes com erro e a lista de primeiros passos."
    arquivos:
      cria: ["tests/painel-passos.test.ts"]
      altera: ["src/servicos/painel.ts"]
    teste_integracao: "Contra o banco de teste, o painel devolve as 5 conversas mais recentes com rotulo mascarado, as fontes com erro e o estado de cada passo."
    teste_funcional: "Sem nada feito os quatro passos aparecem pendentes, com tudo feito a lista vem completa, o passo da chave para usuario comum vem sem link e a chave nunca aparece no retorno."
    criterio_aceite: "tests/painel-passos.test.ts passa."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.03
    titulo: "Grafico de mensagens por dia acessivel"
    fase: F-05.2
    status: concluida
    objetivo: "Criar o grafico SVG com role img, rotulo e tabela equivalente, com a logica de escala em modulo puro."
    arquivos:
      cria: ["src/componentes/GraficoDeMensagens.tsx", "src/componentes/painel-logica.ts", "tests/painel-logica.test.ts", "tests/grafico-de-mensagens.test.tsx"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "A renderizacao do grafico com 14 dias traz um svg com role img e aria-label e uma tabela com os 14 dias e os valores."
    teste_funcional: "A escala da logica pura devolve altura zero para zero, a maior barra com a altura maxima, os rotulos de data em pt-BR e o grafico sem dados mostra a mensagem em vez de barras."
    criterio_aceite: "tests/painel-logica.test.ts e tests/grafico-de-mensagens.test.tsx passam."
    depende_de: ["T-05.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-05.04
    titulo: "Pagina do painel com cartoes, listas e estados"
    fase: F-05.2
    status: concluida
    objetivo: "Preencher a pagina inicial mantendo titulo e subtitulo, com cartoes, recentes, alerta, primeiros passos, carregando e erro."
    arquivos:
      cria: ["src/app/(sistema)/(painel)/loading.tsx", "src/app/(sistema)/(painel)/page.tsx", "src/componentes/CartoesDoPainel.tsx", "src/componentes/PrimeirosPassos.tsx", "src/componentes/ConversasRecentes.tsx", "tests/painel-ui.test.tsx"]
      altera: ["src/app/(sistema)/page.tsx", "src/estilos/global.css", "tests/rotas.test.ts"]
    teste_integracao: "A pagina inicial renderizada contra o servidor de producao do teste com dados traz os cartoes, o grafico, as conversas recentes e o alerta de fontes com erro."
    teste_funcional: "O titulo Painel e o subtitulo Visao geral da sua conta continuam, a instalacao vazia mostra os primeiros passos e a lista some quando os passos estao completos, e usuario comum nao ve o link de Integrações."
    criterio_aceite: "tests/painel-ui.test.tsx e o bloco do painel de tests/rotas.test.ts passam."
    depende_de: ["T-05.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
---

# Tasks — Sprint 05

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-05.01
titulo: "Numeros e serie de 14 dias"
objetivo: "Implementar a agregacao SQL dos numeros e da serie diaria com dias vazios em zero e instante injetavel."
arquivos:
  cria: ["src/servicos/painel.ts", "tests/painel-numeros.test.ts", "tests/painel-serie.test.ts", "docs/historico-de-conversas/sprint-05/sprint.md", "docs/historico-de-conversas/sprint-05/fases.md", "docs/historico-de-conversas/sprint-05/tasks.md"]
  altera: []
teste_integracao: "Contra o banco de teste, o painel devolve agentes, fontes prontas e com erro, conversas e mensagens de 7 dias por canal e a serie de 14 dias por consulta parametrizada."
teste_funcional: "Sem dados tudo e zero e a serie tem 14 dias em zero, uma mensagem as 23:59 e outra as 00:01 locais caem em dias diferentes, o TZ muda o dia agrupado e mensagens com 15 dias ficam fora."
criterio_aceite: "tests/painel-numeros.test.ts e tests/painel-serie.test.ts passam."
depende_de: ["T-04.04"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/painel-numeros e painel-serie 12 passed; DateTime e texto ISO
```

---

```yaml
id: T-05.02
titulo: "Recentes, alerta e primeiros passos"
objetivo: "Acrescentar ao painel as 5 conversas recentes, as fontes com erro e a lista de primeiros passos."
arquivos:
  cria: ["tests/painel-passos.test.ts"]
  altera: ["src/servicos/painel.ts"]
teste_integracao: "Contra o banco de teste, o painel devolve as 5 conversas mais recentes com rotulo mascarado, as fontes com erro e o estado de cada passo."
teste_funcional: "Sem nada feito os quatro passos aparecem pendentes, com tudo feito a lista vem completa, o passo da chave para usuario comum vem sem link e a chave nunca aparece no retorno."
criterio_aceite: "tests/painel-passos.test.ts passa."
depende_de: ["T-05.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/painel-passos.test.ts 8 passed
```

---

```yaml
id: T-05.03
titulo: "Grafico de mensagens por dia acessivel"
objetivo: "Criar o grafico SVG com role img, rotulo e tabela equivalente, com a logica de escala em modulo puro."
arquivos:
  cria: ["src/componentes/GraficoDeMensagens.tsx", "src/componentes/painel-logica.ts", "tests/painel-logica.test.ts", "tests/grafico-de-mensagens.test.tsx"]
  altera: ["src/estilos/global.css"]
teste_integracao: "A renderizacao do grafico com 14 dias traz um svg com role img e aria-label e uma tabela com os 14 dias e os valores."
teste_funcional: "A escala da logica pura devolve altura zero para zero, a maior barra com a altura maxima, os rotulos de data em pt-BR e o grafico sem dados mostra a mensagem em vez de barras."
criterio_aceite: "tests/painel-logica.test.ts e tests/grafico-de-mensagens.test.tsx passam."
depende_de: ["T-05.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/painel-logica, grafico-de-mensagens e tokens 62 passed
```

---

```yaml
id: T-05.04
titulo: "Pagina do painel com cartoes, listas e estados"
objetivo: "Preencher a pagina inicial mantendo titulo e subtitulo, com cartoes, recentes, alerta, primeiros passos, carregando e erro."
arquivos:
  cria: ["src/app/(sistema)/(painel)/loading.tsx", "src/app/(sistema)/(painel)/page.tsx", "src/componentes/CartoesDoPainel.tsx", "src/componentes/PrimeirosPassos.tsx", "src/componentes/ConversasRecentes.tsx", "tests/painel-ui.test.tsx"]
  altera: ["src/app/(sistema)/page.tsx", "src/estilos/global.css", "tests/rotas.test.ts"]
teste_integracao: "A pagina inicial renderizada contra o servidor de producao do teste com dados traz os cartoes, o grafico, as conversas recentes e o alerta de fontes com erro."
teste_funcional: "O titulo Painel e o subtitulo Visao geral da sua conta continuam, a instalacao vazia mostra os primeiros passos e a lista some quando os passos estao completos, e usuario comum nao ve o link de Integrações."
criterio_aceite: "tests/painel-ui.test.tsx e o bloco do painel de tests/rotas.test.ts passam."
depende_de: ["T-05.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/painel-ui, rotas e tokens 113 passed; desvio: pagina movida para (sistema)/(painel) para o loading nao envolver as outras rotas
```

