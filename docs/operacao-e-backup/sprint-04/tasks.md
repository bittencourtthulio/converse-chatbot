---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-04
atualizado_em: 2026-10-01
tasks:
  - id: T-04.01
    titulo: "Item de menu, guarda de admin e esqueleto da tela Sistema"
    fase: F-04.1
    status: concluida
    objetivo: "Criar a rota /configuracoes/sistema com guarda no layout, loading e pagina com o estado geral, e o item Sistema no menu so para admin."
    arquivos:
      cria: ["src/app/(sistema)/configuracoes/sistema/layout.tsx", "src/app/(sistema)/configuracoes/sistema/loading.tsx", "src/app/(sistema)/configuracoes/sistema/page.tsx", "tests/sistema-pagina.test.tsx", "docs/operacao-e-backup/sprint-04/sprint.md", "docs/operacao-e-backup/sprint-04/fases.md", "docs/operacao-e-backup/sprint-04/tasks.md"]
      altera: ["src/componentes/itens-de-menu.ts", "src/componentes/Icones.tsx", "tests/menu.test.ts", "tests/rotas.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "Contra o servidor de producao, GET /configuracoes/sistema sem sessao redireciona ao login, com usuario comum redireciona ao painel com 307 e com admin devolve 200 com o titulo Sistema."
    teste_funcional: "itensVisiveis(true) tem o item Sistema com href /configuracoes/sistema e itensVisiveis(false) nao tem, e a migalha da rota e Configuracoes e Sistema."
    criterio_aceite: "tests/menu.test.ts, tests/sistema-pagina.test.tsx e tests/rotas.test.ts passam com as contagens de menu atualizadas."
    depende_de: ["T-03.04"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-04.02
    titulo: "Cartoes de detalhe do sistema"
    fase: F-04.2
    status: concluida
    objetivo: "Criar o painel de detalhe com a logica pura de formatacao e os cartoes por assunto, sem nunca mostrar valor de segredo."
    arquivos:
      cria: ["src/componentes/PainelDoSistema.tsx", "src/componentes/sistema-logica.ts", "tests/sistema-logica.test.ts", "tests/painel-do-sistema.test.tsx"]
      altera: ["src/app/(sistema)/configuracoes/sistema/page.tsx"]
    teste_integracao: "A pagina com um admin e os dados reais mostra os cartoes Aplicacao, Dados, Midia, Segundo plano, Configuracao e Backup com versao, esquema, uptime, tamanhos, fila e agendador."
    teste_funcional: "Bytes, tempo de atividade e a situacao ok, degradado e falha viram texto em portugues, ENCRYPTION_KEY e chave do OpenRouter aparecem como Sim ou Nao, e backup sem arquivos mostra Nenhum backup ainda."
    criterio_aceite: "tests/sistema-logica.test.ts e tests/painel-do-sistema.test.tsx passam e o HTML renderizado nao contem valor de segredo."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-04.03
    titulo: "Estilos e responsividade da tela Sistema"
    fase: F-04.2
    status: pendente
    objetivo: "Dar acabamento SaaS aos cartoes sobre os tokens, com cartoes em coluna unica a 375 px, alvos de 44 px e foco visivel."
    arquivos:
      cria: ["tests/sistema-estilos.test.ts"]
      altera: ["src/estilos/global.css", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
    teste_integracao: "O CSS tem as regras do painel do sistema dentro de media query para telas estreitas e usa so variaveis de tokens.css."
    teste_funcional: "tests/tokens.test.ts continua passando sem cor literal e os alvos interativos novos tem altura minima de 44 px."
    criterio_aceite: "tests/sistema-estilos.test.ts e tests/tokens.test.ts passam."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: "Item de menu, guarda de admin e esqueleto da tela Sistema"
objetivo: "Criar a rota /configuracoes/sistema com guarda no layout, loading e pagina com o estado geral, e o item Sistema no menu so para admin."
arquivos:
  cria: ["src/app/(sistema)/configuracoes/sistema/layout.tsx", "src/app/(sistema)/configuracoes/sistema/loading.tsx", "src/app/(sistema)/configuracoes/sistema/page.tsx", "tests/sistema-pagina.test.tsx", "docs/operacao-e-backup/sprint-04/sprint.md", "docs/operacao-e-backup/sprint-04/fases.md", "docs/operacao-e-backup/sprint-04/tasks.md"]
  altera: ["src/componentes/itens-de-menu.ts", "src/componentes/Icones.tsx", "tests/menu.test.ts", "tests/rotas.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "Contra o servidor de producao, GET /configuracoes/sistema sem sessao redireciona ao login, com usuario comum redireciona ao painel com 307 e com admin devolve 200 com o titulo Sistema."
teste_funcional: "itensVisiveis(true) tem o item Sistema com href /configuracoes/sistema e itensVisiveis(false) nao tem, e a migalha da rota e Configuracoes e Sistema."
criterio_aceite: "tests/menu.test.ts, tests/sistema-pagina.test.tsx e tests/rotas.test.ts passam com as contagens de menu atualizadas."
depende_de: ["T-03.04"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 2674 passed, 0 failed (224 arquivos); build antes
```

---

```yaml
id: T-04.02
titulo: "Cartoes de detalhe do sistema"
objetivo: "Criar o painel de detalhe com a logica pura de formatacao e os cartoes por assunto, sem nunca mostrar valor de segredo."
arquivos:
  cria: ["src/componentes/PainelDoSistema.tsx", "src/componentes/sistema-logica.ts", "tests/sistema-logica.test.ts", "tests/painel-do-sistema.test.tsx"]
  altera: ["src/app/(sistema)/configuracoes/sistema/page.tsx"]
teste_integracao: "A pagina com um admin e os dados reais mostra os cartoes Aplicacao, Dados, Midia, Segundo plano, Configuracao e Backup com versao, esquema, uptime, tamanhos, fila e agendador."
teste_funcional: "Bytes, tempo de atividade e a situacao ok, degradado e falha viram texto em portugues, ENCRYPTION_KEY e chave do OpenRouter aparecem como Sim ou Nao, e backup sem arquivos mostra Nenhum backup ainda."
criterio_aceite: "tests/sistema-logica.test.ts e tests/painel-do-sistema.test.tsx passam e o HTML renderizado nao contem valor de segredo."
depende_de: ["T-04.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/sistema-logica.test.ts, tests/painel-do-sistema.test.tsx e tests/sistema-pagina.test.tsx passam (build antes)
```

---

```yaml
id: T-04.03
titulo: "Estilos e responsividade da tela Sistema"
objetivo: "Dar acabamento SaaS aos cartoes sobre os tokens, com cartoes em coluna unica a 375 px, alvos de 44 px e foco visivel."
arquivos:
  cria: ["tests/sistema-estilos.test.ts"]
  altera: ["src/estilos/global.css", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md"]
teste_integracao: "O CSS tem as regras do painel do sistema dentro de media query para telas estreitas e usa so variaveis de tokens.css."
teste_funcional: "tests/tokens.test.ts continua passando sem cor literal e os alvos interativos novos tem altura minima de 44 px."
criterio_aceite: "tests/sistema-estilos.test.ts e tests/tokens.test.ts passam."
depende_de: ["T-04.02"]
paralelizavel: false
status: pendente
```

