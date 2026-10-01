---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-05
atualizado_em: 2026-10-01
tasks:
  - id: T-05.01
    titulo: "Rotas de fontes devolvem X-Correlacao"
    fase: F-05.1
    status: pendente
    objetivo: "Fazer todas as rotas de fontes devolverem X-Correlacao em toda resposta pelo mesmo helper do proxy (PR-109)."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/sprint-05/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-05/fases.md", "docs/robustez-de-midia-e-operacao/sprint-05/tasks.md", "tests/fontes-correlacao.test.ts"]
      altera: ["src/lib/log.ts", "src/proxy.ts", "src/app/correlacao-servidor.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "src/app/api/agentes/[id]/fontes/route.ts", "src/app/api/agentes/[id]/fontes/texto/route.ts", "src/app/api/agentes/[id]/fontes/video/route.ts", "src/app/api/agentes/[id]/fontes/youtube/route.ts", "src/app/api/agentes/[id]/fontes/[fonteId]/route.ts", "src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/route.ts", "tests/correlacao.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/fontes-correlacao.test.ts contra next start confere X-Correlacao com 8 hexadecimais no sucesso e no erro das rotas de documento, vídeo, YouTube e texto, e nos 401, 413 e 415."
    teste_funcional: "O Código de referência do corpo de um erro 500 simulado é igual ao X-Correlacao da mesma resposta e o valor de x-correlacao enviado pelo cliente é ignorado (o helper sempre gera código novo)."
    criterio_aceite: "Os testes passam depois de npm run build e falham quando uma rota deixa de usar o helper (mutação registrada); a constante exportada de log.ts fica no fim do arquivo para não deslocar as citações de linha."
    depende_de: ["T-03.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.02
    titulo: "Badge de canal com padrão além da cor"
    fase: F-05.2
    status: pendente
    objetivo: "Dar a cada canal um padrão de fundo por tokens e a função pura do mapeamento (PR-110)."
    arquivos:
      cria: ["src/componentes/padrao-de-canal.ts", "tests/padrao-de-canal.test.ts"]
      altera: ["src/componentes/BadgeDeCanal.tsx", "src/estilos/global.css", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/padrao-de-canal.test.ts renderiza BadgeDeCanal para os três canais e confere a classe de padrão de cada um, e cada classe de padrão existe em src/estilos/global.css."
    teste_funcional: "padraoDoCanal devolve três padrões distintos para painel, widget e telegram, liso para canal desconhecido, e as regras de padrão do CSS só usam var(--canal-...-borda), transparent e color-mix com percentual fixo (opacidade limitada), sem cor literal."
    criterio_aceite: "Os testes passam, os de tokens e de contraste existentes seguem verdes e falham quando o mapeamento perde um canal (mutação registrada)."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.03
    titulo: "Aviso de exclusão do agente com o que também é apagado"
    fase: F-05.2
    status: pendente
    objetivo: "Fazer BotaoExcluirAgente avisar o que mais é apagado, com contagens do servidor (PR-44)."
    arquivos:
      cria: ["src/componentes/excluir-agente-logica.ts", "tests/excluir-agente-aviso.test.tsx", "tests/agentes-contagens-exclusao.test.ts"]
      altera: ["src/componentes/BotaoExcluirAgente.tsx", "src/servicos/agentes.ts", "src/app/(sistema)/agentes/[id]/page.tsx", "tests/formulario-de-agente.test.tsx", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/agentes-contagens-exclusao.test.ts com banco real: contagensParaExclusao devolve as conversas, mensagens, fontes e arquivos, canal Telegram e chat embutido do agente e exige usuário autenticado."
    teste_funcional: "tests/excluir-agente-aviso.test.tsx com happy-dom: com confirmandoInicial o aviso cita conversas, mensagens, fontes e arquivos, canal Telegram e configuração do chat embutido, diz que não pode ser desfeito e mostra as contagens recebidas."
    criterio_aceite: "Os testes passam e falham quando o aviso volta ao texto antigo (mutação registrada)."
    depende_de: ["T-05.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.04
    titulo: "Alternador de tema provado por comportamento"
    fase: F-05.2
    status: pendente
    objetivo: "Extrair o script de tema e provar o AlternadorDeTema com happy-dom, com aria-pressed (PR-23)."
    arquivos:
      cria: ["src/lib/tema.ts", "tests/alternador-de-tema.test.tsx"]
      altera: ["src/componentes/AlternadorDeTema.tsx", "src/app/layout.tsx", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/alternador-de-tema.test.tsx com happy-dom: o clique alterna data-theme entre claro e escuro, grava localStorage.tema, segue funcionando quando setItem lança e usa prefers-color-scheme quando não há escolha salva."
    teste_funcional: "O SCRIPT_DO_TEMA executado num documento simulado define data-theme antes do clique, o botão tem aria-label e aria-pressed true no escuro e false no claro."
    criterio_aceite: "Os testes passam e falham quando a gravação em localStorage ou a leitura da preferência do sistema é removida (mutações registradas)."
    depende_de: ["T-05.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 05

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-05.01
titulo: "Rotas de fontes devolvem X-Correlacao"
objetivo: "Fazer todas as rotas de fontes devolverem X-Correlacao em toda resposta pelo mesmo helper do proxy (PR-109)."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/sprint-05/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-05/fases.md", "docs/robustez-de-midia-e-operacao/sprint-05/tasks.md", "tests/fontes-correlacao.test.ts"]
  altera: ["src/lib/log.ts", "src/proxy.ts", "src/app/correlacao-servidor.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "src/app/api/agentes/[id]/fontes/route.ts", "src/app/api/agentes/[id]/fontes/texto/route.ts", "src/app/api/agentes/[id]/fontes/video/route.ts", "src/app/api/agentes/[id]/fontes/youtube/route.ts", "src/app/api/agentes/[id]/fontes/[fonteId]/route.ts", "src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/route.ts", "tests/correlacao.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/fontes-correlacao.test.ts contra next start confere X-Correlacao com 8 hexadecimais no sucesso e no erro das rotas de documento, vídeo, YouTube e texto, e nos 401, 413 e 415."
teste_funcional: "O Código de referência do corpo de um erro 500 simulado é igual ao X-Correlacao da mesma resposta e o valor de x-correlacao enviado pelo cliente é ignorado (o helper sempre gera código novo)."
criterio_aceite: "Os testes passam depois de npm run build e falham quando uma rota deixa de usar o helper (mutação registrada); a constante exportada de log.ts fica no fim do arquivo para não deslocar as citações de linha."
depende_de: ["T-03.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.02
titulo: "Badge de canal com padrão além da cor"
objetivo: "Dar a cada canal um padrão de fundo por tokens e a função pura do mapeamento (PR-110)."
arquivos:
  cria: ["src/componentes/padrao-de-canal.ts", "tests/padrao-de-canal.test.ts"]
  altera: ["src/componentes/BadgeDeCanal.tsx", "src/estilos/global.css", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/padrao-de-canal.test.ts renderiza BadgeDeCanal para os três canais e confere a classe de padrão de cada um, e cada classe de padrão existe em src/estilos/global.css."
teste_funcional: "padraoDoCanal devolve três padrões distintos para painel, widget e telegram, liso para canal desconhecido, e as regras de padrão do CSS só usam var(--canal-...-borda), transparent e color-mix com percentual fixo (opacidade limitada), sem cor literal."
criterio_aceite: "Os testes passam, os de tokens e de contraste existentes seguem verdes e falham quando o mapeamento perde um canal (mutação registrada)."
depende_de: ["T-05.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.03
titulo: "Aviso de exclusão do agente com o que também é apagado"
objetivo: "Fazer BotaoExcluirAgente avisar o que mais é apagado, com contagens do servidor (PR-44)."
arquivos:
  cria: ["src/componentes/excluir-agente-logica.ts", "tests/excluir-agente-aviso.test.tsx", "tests/agentes-contagens-exclusao.test.ts"]
  altera: ["src/componentes/BotaoExcluirAgente.tsx", "src/servicos/agentes.ts", "src/app/(sistema)/agentes/[id]/page.tsx", "tests/formulario-de-agente.test.tsx", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/agentes-contagens-exclusao.test.ts com banco real: contagensParaExclusao devolve as conversas, mensagens, fontes e arquivos, canal Telegram e chat embutido do agente e exige usuário autenticado."
teste_funcional: "tests/excluir-agente-aviso.test.tsx com happy-dom: com confirmandoInicial o aviso cita conversas, mensagens, fontes e arquivos, canal Telegram e configuração do chat embutido, diz que não pode ser desfeito e mostra as contagens recebidas."
criterio_aceite: "Os testes passam e falham quando o aviso volta ao texto antigo (mutação registrada)."
depende_de: ["T-05.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.04
titulo: "Alternador de tema provado por comportamento"
objetivo: "Extrair o script de tema e provar o AlternadorDeTema com happy-dom, com aria-pressed (PR-23)."
arquivos:
  cria: ["src/lib/tema.ts", "tests/alternador-de-tema.test.tsx"]
  altera: ["src/componentes/AlternadorDeTema.tsx", "src/app/layout.tsx", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/alternador-de-tema.test.tsx com happy-dom: o clique alterna data-theme entre claro e escuro, grava localStorage.tema, segue funcionando quando setItem lança e usa prefers-color-scheme quando não há escolha salva."
teste_funcional: "O SCRIPT_DO_TEMA executado num documento simulado define data-theme antes do clique, o botão tem aria-label e aria-pressed true no escuro e false no claro."
criterio_aceite: "Os testes passam e falham quando a gravação em localStorage ou a leitura da preferência do sistema é removida (mutações registradas)."
depende_de: ["T-05.03"]
paralelizavel: false
status: pendente
```

