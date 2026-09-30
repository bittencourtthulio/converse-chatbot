---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
entregue_por: mergex
titulo: Agentes e chave do OpenRouter
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/agentes-e-openrouter
branch_base: feat/fundacao-e-esqueleto
commits:
  - task: T-01.01
    commit: 5585c82
  - task: T-01.02
    commit: 4d86e9c
  - task: T-01.03
    commit: df4e549
  - task: T-01.04
    commit: ffd71a9
  - task: T-02.01
    commit: 530af10
  - task: T-02.02
    commit: 743d5c7
  - task: T-02.03
    commit: fc947a9
  - task: T-02.04
    commit: 0b96d59
  - task: T-03.01
    commit: 6c19f81
  - task: T-03.02
    commit: 86acf55
  - task: T-03.03
    commit: d46aaa0
  - task: T-03.04
    commit: 18e1aab
  - task: T-03.05
    commit: 0bd70a3
  - task: T-04.01
    commit: 9462682
  - task: T-04.02
    commit: 0b72cf9
  - task: T-04.03
    commit: ad623e0
  - task: T-05.01
    commit: f7c5b0e
  - task: T-05.02
    commit: 386d7fe
  - task: T-05.03
    commit: 6ab4283
  - task: T-05.04
    commit: a2358a6
  - task: T-05.05
    commit: ff48a7a
  - task: T-05.06
    commit: 13fbd80
  - task: T-05.07
    commit: 3d0a2ee
  - task: T-06.01
    commit: 0e0fda1
  - task: T-06.02
    commit: 6989672
  - task: T-06.03
    commit: e655965
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", "README.md", "docs/agentes-e-openrouter/00-AUDITORIA.md", "docs/agentes-e-openrouter/00-BLOQUEIOS.md", "docs/agentes-e-openrouter/00-DECISOES.md", "docs/agentes-e-openrouter/BRIEFING-BUILDX.md", "docs/agentes-e-openrouter/FECHAMENTO.md", "docs/agentes-e-openrouter/ORQUESTRADOR.md", "docs/agentes-e-openrouter/RELATORIO-FEATURE.md", "docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md", "docs/agentes-e-openrouter/base/00-INDICE.md", "docs/agentes-e-openrouter/base/00-LACUNAS.md", "docs/agentes-e-openrouter/base/ambiente-e-segredos.md", "docs/agentes-e-openrouter/base/banco-e-migrations.md", "docs/agentes-e-openrouter/base/interface-e-menu.md", "docs/agentes-e-openrouter/base/openrouter-api.md", "docs/agentes-e-openrouter/sprint-01/tasks.md", "docs/agentes-e-openrouter/sprint-02/tasks.md", "docs/agentes-e-openrouter/sprint-03/tasks.md", "docs/agentes-e-openrouter/sprint-04/tasks.md", "docs/agentes-e-openrouter/sprint-05/tasks.md", "docs/agentes-e-openrouter/sprint-06/tasks.md", "docs/entregas/agentes-e-openrouter/ENTREGA.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20260930145651_configuracao_do_workspace/migration.sql", "prisma/migrations/20260930150122_agentes/migration.sql", "prisma/schema.prisma", "prisma/seed.ts", "src/app/(sistema)/agentes/(lista)/loading.tsx", "src/app/(sistema)/agentes/(lista)/page.tsx", "src/app/(sistema)/agentes/[id]/carregar-agente.ts", "src/app/(sistema)/agentes/[id]/layout.tsx", "src/app/(sistema)/agentes/[id]/loading.tsx", "src/app/(sistema)/agentes/[id]/page.tsx", "src/app/(sistema)/agentes/novo/loading.tsx", "src/app/(sistema)/agentes/novo/page.tsx", "src/app/(sistema)/configuracoes/integracoes/layout.tsx", "src/app/(sistema)/configuracoes/integracoes/loading.tsx", "src/app/(sistema)/configuracoes/integracoes/page.tsx", "src/app/acoes.ts", "src/componentes/AbasDoAgente.tsx", "src/componentes/BotaoExcluirAgente.tsx", "src/componentes/FormularioDeAgente.tsx", "src/componentes/Icones.tsx", "src/componentes/PainelDaChaveOpenrouter.tsx", "src/componentes/SeletorDeModelo.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/itens-de-menu.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/lib/cripto.ts", "src/lib/erros.ts", "src/lib/openrouter.ts", "src/lib/sse.ts", "src/servicos/agentes.ts", "src/servicos/integracoes.ts", "tests/abas-do-agente.test.tsx", "tests/acoes-de-agente.test.ts", "tests/agentes-modelos.test.ts", "tests/agentes.test.ts", "tests/ajuda.ts", "tests/ambiente.test.ts", "tests/apoio/openrouter-falso.ts", "tests/componentes.test.tsx", "tests/cripto.test.ts", "tests/erros.test.ts", "tests/formulario-de-agente.test.tsx", "tests/integracoes-conexao.test.ts", "tests/integracoes.test.ts", "tests/menu.test.ts", "tests/migracoes.test.ts", "tests/openrouter-conversar.test.ts", "tests/openrouter-falso.test.ts", "tests/openrouter.test.ts", "tests/projeto.test.ts", "tests/rotas.test.ts", "tests/seed.test.ts", "tests/seletor-de-modelo.test.tsx", "tests/setup.ts", "tests/sse.test.ts"]
desvios:
  - "T-06.03: docs/agentes-e-openrouter/RELATORIO-FEATURE.md (relatorio da feature)"
  - "T-06.03: docs/agentes-e-openrouter/FECHAMENTO.md (fechamento do sprintx)"
  - "T-06.01: src/estilos/global.css (correcao do borda dos botoes secundarios achada na verificacao visual)"
  - "T-05.07: src/app/(sistema)/agentes/[id]/carregar-agente.ts (arquivo novo: helper que converte id inexistente em 404, nao previsto)"
  - "T-05.06: src/app/(sistema)/agentes/novo/loading.tsx (arquivo novo: carregando de /agentes/novo (a pagina consulta o OpenRouter), nao previsto)"
  - "T-05.06: page.tsx e loading.tsx da lista ficaram em src/app/(sistema)/agentes/(lista)/ e nao em agentes/ (um loading acima de [id] fazia o 404 de id inexistente sair como 200)"
  - "T-05.06: src/servicos/agentes.ts (modelosParaOSeletor, funcao nova que a pagina consome, nao prevista)"
  - "T-05.06: tests/agentes-modelos.test.ts (arquivo novo: testes do servico modelosParaOSeletor, nao previsto)"
  - "T-05.05: src/estilos/global.css (estilos do bloco de confirmacao, nao previstos na task)"
  - "T-05.04: tests/acoes-de-agente.test.ts (arquivo novo: testes das acoes de servidor de agente, nao previsto)"
  - "T-05.03: src/estilos/global.css (estilos do campo com aviso, nao previstos na task)"
  - "T-02.01: tests/erros.test.ts (arquivo novo nao previsto; os testes de erroDoProvedor nao cabiam em tests/ambiente.test.ts)"
  - "T-03.04: src/estilos/global.css (classes novas do painel da chave, nao previstas na task)"
  - "T-03.01: a migration recebeu o nome real prisma/migrations/20260930145651_configuracao_do_workspace (o plano trazia um carimbo de tempo ilustrativo)"
faixa_atencao:
  - arquivo: "prisma/migrations/20260930145651_configuracao_do_workspace/migration.sql"
    faixa: alta
  - arquivo: "prisma/migrations/20260930150122_agentes/migration.sql"
    faixa: alta
  - arquivo: "prisma/schema.prisma"
    faixa: alta
  - arquivo: "src/app/(sistema)/configuracoes/integracoes/layout.tsx"
    faixa: alta
  - arquivo: "src/app/(sistema)/configuracoes/integracoes/page.tsx"
    faixa: alta
  - arquivo: "src/app/acoes.ts"
    faixa: alta
  - arquivo: "src/lib/ambiente.ts"
    faixa: alta
  - arquivo: "src/lib/cripto.ts"
    faixa: alta
  - arquivo: "src/lib/openrouter.ts"
    faixa: alta
  - arquivo: "src/servicos/agentes.ts"
    faixa: alta
  - arquivo: "src/servicos/integracoes.ts"
    faixa: alta
  - arquivo: ".env.example"
    faixa: media
  - arquivo: "README.md"
    faixa: media
  - arquivo: "prisma/seed.ts"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/(lista)/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/(lista)/page.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/carregar-agente.ts"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/layout.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/page.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/novo/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/novo/page.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/configuracoes/integracoes/loading.tsx"
    faixa: media
  - arquivo: "src/componentes/AbasDoAgente.tsx"
    faixa: media
  - arquivo: "src/componentes/BotaoExcluirAgente.tsx"
    faixa: media
  - arquivo: "src/componentes/FormularioDeAgente.tsx"
    faixa: media
  - arquivo: "src/componentes/Icones.tsx"
    faixa: media
  - arquivo: "src/componentes/PainelDaChaveOpenrouter.tsx"
    faixa: media
  - arquivo: "src/componentes/SeletorDeModelo.tsx"
    faixa: media
  - arquivo: "src/componentes/abas-do-agente.ts"
    faixa: media
  - arquivo: "src/componentes/itens-de-menu.ts"
    faixa: media
  - arquivo: "src/lib/erros.ts"
    faixa: media
  - arquivo: "src/lib/sse.ts"
    faixa: media
  - arquivo: "docs/agentes-e-openrouter/00-AUDITORIA.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/00-BLOQUEIOS.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/00-DECISOES.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/BRIEFING-BUILDX.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/FECHAMENTO.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/ORQUESTRADOR.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/RELATORIO-FEATURE.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/base/00-INDICE.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/base/00-LACUNAS.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/base/ambiente-e-segredos.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/base/banco-e-migrations.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/base/interface-e-menu.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/base/openrouter-api.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/sprint-01/tasks.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/sprint-02/tasks.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/sprint-03/tasks.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/sprint-04/tasks.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/sprint-05/tasks.md"
    faixa: baixa
  - arquivo: "docs/agentes-e-openrouter/sprint-06/tasks.md"
    faixa: baixa
  - arquivo: "docs/entregas/agentes-e-openrouter/ENTREGA.md"
    faixa: baixa
  - arquivo: "docs/projeto/MAPA.md"
    faixa: baixa
  - arquivo: "docs/projeto/PREMISSAS.md"
    faixa: baixa
  - arquivo: "docs/projeto/PROJETO.md"
    faixa: baixa
  - arquivo: "docs/projeto/RECURSAO.md"
    faixa: baixa
  - arquivo: "docs/stack/CONVENCOES.md"
    faixa: baixa
  - arquivo: "docs/stack/LACUNAS.md"
    faixa: baixa
  - arquivo: "src/estilos/global.css"
    faixa: baixa
  - arquivo: "tests/abas-do-agente.test.tsx"
    faixa: baixa
  - arquivo: "tests/acoes-de-agente.test.ts"
    faixa: baixa
  - arquivo: "tests/agentes-modelos.test.ts"
    faixa: baixa
  - arquivo: "tests/agentes.test.ts"
    faixa: baixa
  - arquivo: "tests/ajuda.ts"
    faixa: baixa
  - arquivo: "tests/ambiente.test.ts"
    faixa: baixa
  - arquivo: "tests/apoio/openrouter-falso.ts"
    faixa: baixa
  - arquivo: "tests/componentes.test.tsx"
    faixa: baixa
  - arquivo: "tests/cripto.test.ts"
    faixa: baixa
  - arquivo: "tests/erros.test.ts"
    faixa: baixa
  - arquivo: "tests/formulario-de-agente.test.tsx"
    faixa: baixa
  - arquivo: "tests/integracoes-conexao.test.ts"
    faixa: baixa
  - arquivo: "tests/integracoes.test.ts"
    faixa: baixa
  - arquivo: "tests/menu.test.ts"
    faixa: baixa
  - arquivo: "tests/migracoes.test.ts"
    faixa: baixa
  - arquivo: "tests/openrouter-conversar.test.ts"
    faixa: baixa
  - arquivo: "tests/openrouter-falso.test.ts"
    faixa: baixa
  - arquivo: "tests/openrouter.test.ts"
    faixa: baixa
  - arquivo: "tests/projeto.test.ts"
    faixa: baixa
  - arquivo: "tests/rotas.test.ts"
    faixa: baixa
  - arquivo: "tests/seed.test.ts"
    faixa: baixa
  - arquivo: "tests/seletor-de-modelo.test.tsx"
    faixa: baixa
  - arquivo: "tests/setup.ts"
    faixa: baixa
  - arquivo: "tests/sse.test.ts"
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 11
  leitura_rapida: 22
  dispensavel: 52
portao: pronto
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: 2026-09-30
---

# Entrega — agentes-e-openrouter

Branch aberta em 2026-09-30 a partir de `feat/fundacao-e-esqueleto` (PRs empilhados; base declarada pelo buildx, regra de convencao do repositorio). O `ORQUESTRADOR.md` ainda nao existe: nasce na F4 do sprintx e registra a branch.

# Entrega — Agentes e chave do OpenRouter

Trabalho na branch `feat/agentes-e-openrouter`, a partir de `feat/fundacao-e-esqueleto` (PRs empilhados).

## Estado da entrega

- Atenção humana: 11 olho obrigatório, 22 leitura rápida, 52 dispensável (`ATENCAO.md`)
- Portão de prontidão: PRONTO (V1 a V3, V6, V7, V9 e V10 OK; V4, V5 e V8 n/a)
- Push: não feito — não há remoto configurado (`git remote -v` vazio); descrição em `PR.md`, pacote de QA em `QA-PACOTE.md`
- Pull request: não aberto (sem remoto e sem credencial; a mergex não configura nenhum)
- Falta para o merge: abrir o PR quando houver remoto, revisão humana (11 arquivos de olho obrigatório) e o roteiro do QA

## Avisos

- V2: as 26 tasks estão com `suite: parcial` (o subconjunto de cada task passou); a suíte inteira rodou verde (398 passed) ao fechar cada sprint e ao fim.
- V9: os arquivos de `docs/agentes-e-openrouter/` (plano, decisões, base, orquestrador) e `docs/entregas/agentes-e-openrouter/` são os artefatos do próprio método e não estão em `arquivos` de task, como na FT-01. A declaração da T-05.07 tinha sido truncada pelo colchete de `[id]` e foi corrigida em commit próprio.
- V10: o diff tem chaves de aparência real só em teste (`sk-or-v1-…` fictícias e a chave AES de teste de `tests/setup.ts`, valor sequencial); nenhuma credencial real.
- `.expx/estado.json` não existe: nada gravado.
