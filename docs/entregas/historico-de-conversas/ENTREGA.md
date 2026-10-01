---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
entregue_por: mergex
titulo: Historico de conversas e painel
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/historico-de-conversas
branch_base: feat/conhecimento-em-video
commits:
- task: T-01.01
  commit: fe8f5ca
- task: T-01.02
  commit: 755aa8d
- task: T-01.03
  commit: '9618974'
- task: T-01.04
  commit: 6f203d7
- task: T-02.01
  commit: 5a3c559
- task: T-02.02
  commit: 8ead643
- task: T-02.03
  commit: 880b4bf
- task: T-02.04
  commit: b18df6e
- task: T-02.05
  commit: 1369b13
- task: T-03.01
  commit: 46c8682
- task: T-03.02
  commit: 80d8865
- task: T-03.03
  commit: 1297c0e
- task: T-04.01
  commit: 5b06c01
- task: T-04.02
  commit: 0824a95
- task: T-04.03
  commit: 3a0be5c
- task: T-04.04
  commit: f67bc10
- task: T-05.01
  commit: b026532
- task: T-05.02
  commit: 47290c7
- task: T-05.03
  commit: '4458931'
- task: T-05.04
  commit: 451f2a3
- task: T-06.01
  commit: f599666
- task: T-06.02
  commit: 371a1c8
- task: T-06.03
  commit: 96752da
- task: T-06.04
  commit: fd23b20
modulo_afetado:
- apresentacao
- aplicacao
- banco
- testes
- documentacao
arquivos_alterados:
- .env.example
- .gitignore
- README.md
- docs/entregas/historico-de-conversas/ATENCAO.md
- docs/entregas/historico-de-conversas/ENTREGA.md
- docs/entregas/historico-de-conversas/PR.md
- docs/entregas/historico-de-conversas/QA-PACOTE.md
- docs/historico-de-conversas/00-AUDITORIA.md
- docs/historico-de-conversas/00-BLOQUEIOS.md
- docs/historico-de-conversas/00-DECISOES.md
- docs/historico-de-conversas/BRIEFING-BUILDX.md
- docs/historico-de-conversas/FECHAMENTO.md
- docs/historico-de-conversas/ORQUESTRADOR.md
- docs/historico-de-conversas/RELATORIO-FEATURE.md
- docs/historico-de-conversas/VERIFICACAO-VISUAL.md
- docs/historico-de-conversas/base/00-INDICE.md
- docs/historico-de-conversas/base/00-LACUNAS.md
- docs/historico-de-conversas/base/canais-e-rotulos.md
- docs/historico-de-conversas/base/conversas-e-modelo.md
- docs/historico-de-conversas/base/painel-e-agregacao.md
- docs/historico-de-conversas/base/seed-testes-e-ci.md
- docs/historico-de-conversas/base/telas-menu-e-componentes.md
- docs/historico-de-conversas/sprint-01/fases.md
- docs/historico-de-conversas/sprint-01/sprint.md
- docs/historico-de-conversas/sprint-01/tasks.md
- docs/historico-de-conversas/sprint-02/fases.md
- docs/historico-de-conversas/sprint-02/sprint.md
- docs/historico-de-conversas/sprint-02/tasks.md
- docs/historico-de-conversas/sprint-03/fases.md
- docs/historico-de-conversas/sprint-03/sprint.md
- docs/historico-de-conversas/sprint-03/tasks.md
- docs/historico-de-conversas/sprint-04/fases.md
- docs/historico-de-conversas/sprint-04/sprint.md
- docs/historico-de-conversas/sprint-04/tasks.md
- docs/historico-de-conversas/sprint-05/fases.md
- docs/historico-de-conversas/sprint-05/sprint.md
- docs/historico-de-conversas/sprint-05/tasks.md
- docs/historico-de-conversas/sprint-06/fases.md
- docs/historico-de-conversas/sprint-06/sprint.md
- docs/historico-de-conversas/sprint-06/tasks.md
- docs/projeto/MAPA.md
- docs/projeto/PREMISSAS.md
- docs/projeto/PROJETO.md
- docs/projeto/RECURSAO.md
- docs/stack/CONVENCOES.md
- docs/stack/LACUNAS.md
- package-lock.json
- package.json
- prisma/seed.ts
- src/app/(sistema)/(painel)/loading.tsx
- src/app/(sistema)/(painel)/page.tsx
- src/app/(sistema)/conversas/(lista)/loading.tsx
- src/app/(sistema)/conversas/(lista)/page.tsx
- src/app/(sistema)/conversas/[id]/carregar-conversa.ts
- src/app/(sistema)/conversas/[id]/layout.tsx
- src/app/(sistema)/conversas/[id]/loading.tsx
- src/app/(sistema)/conversas/[id]/not-found.tsx
- src/app/(sistema)/conversas/[id]/page.tsx
- src/app/(sistema)/page.tsx
- src/app/api/conversas/[id]/exportar/route.ts
- src/app/api/conversas/[id]/route.ts
- src/app/api/conversas/apagar/route.ts
- src/app/api/conversas/resposta.ts
- src/componentes/AcoesDaConversa.tsx
- src/componentes/BadgeDeCanal.tsx
- src/componentes/CartoesDoPainel.tsx
- src/componentes/ConversasRecentes.tsx
- src/componentes/FiltrosDeConversas.tsx
- src/componentes/GraficoDeMensagens.tsx
- src/componentes/ListaComSelecao.tsx
- src/componentes/ListaDeConversas.tsx
- src/componentes/PrimeirosPassos.tsx
- src/componentes/TranscricaoDaConversa.tsx
- src/componentes/apagar-conversas.ts
- src/componentes/conversas-logica.ts
- src/componentes/itens-de-menu.ts
- src/componentes/painel-logica.ts
- src/estilos/global.css
- src/estilos/tokens.css
- src/servicos/historico-logica.ts
- src/servicos/historico.ts
- src/servicos/painel.ts
- tests/apoio/contador-de-consultas.ts
- tests/apoio/historico.ts
- tests/apoio/servir-falso.ts
- tests/apoio/servir-telegram-falso.ts
- tests/contador-de-consultas.test.ts
- tests/conversas-apagar-rota.test.ts
- tests/conversas-detalhe-rota.test.ts
- tests/conversas-detalhe-ui.test.tsx
- tests/conversas-exportar-rota.test.ts
- tests/conversas-lista-estilos.test.ts
- tests/conversas-lista-ui.test.tsx
- tests/conversas-logica.test.ts
- tests/conversas-lote-ui.test.tsx
- tests/grafico-de-mensagens.test.tsx
- tests/historico-apagar.test.ts
- tests/historico-apoio.test.ts
- tests/historico-consultas.test.ts
- tests/historico-listar.test.ts
- tests/historico-logica.test.ts
- tests/historico-obter.test.ts
- tests/historico-texto.test.ts
- tests/menu.test.ts
- tests/painel-logica.test.ts
- tests/painel-numeros.test.ts
- tests/painel-passos.test.ts
- tests/painel-serie.test.ts
- tests/painel-ui.test.tsx
- tests/projeto.test.ts
- tests/rotas.test.ts
- tests/seed-conversas.test.ts
- tests/seed.test.ts
- tests/sqlite-formatos.test.ts
- tests/tokens-historico.test.ts
faixa_atencao:
- arquivo: src/app/(sistema)/(painel)/page.tsx
  faixa: alta
- arquivo: src/app/(sistema)/conversas/(lista)/page.tsx
  faixa: alta
- arquivo: src/app/(sistema)/conversas/[id]/carregar-conversa.ts
  faixa: alta
- arquivo: src/app/(sistema)/conversas/[id]/layout.tsx
  faixa: alta
- arquivo: src/app/(sistema)/conversas/[id]/page.tsx
  faixa: alta
- arquivo: src/app/api/conversas/[id]/exportar/route.ts
  faixa: alta
- arquivo: src/app/api/conversas/[id]/route.ts
  faixa: alta
- arquivo: src/app/api/conversas/apagar/route.ts
  faixa: alta
- arquivo: src/app/api/conversas/resposta.ts
  faixa: alta
- arquivo: src/componentes/AcoesDaConversa.tsx
  faixa: alta
- arquivo: src/componentes/ListaComSelecao.tsx
  faixa: alta
- arquivo: src/componentes/TranscricaoDaConversa.tsx
  faixa: alta
- arquivo: src/servicos/historico-logica.ts
  faixa: alta
- arquivo: src/servicos/historico.ts
  faixa: alta
- arquivo: src/servicos/painel.ts
  faixa: alta
- arquivo: README.md
  faixa: media
- arquivo: docs/projeto/MAPA.md
  faixa: media
- arquivo: docs/projeto/PREMISSAS.md
  faixa: media
- arquivo: docs/projeto/PROJETO.md
  faixa: media
- arquivo: docs/projeto/RECURSAO.md
  faixa: media
- arquivo: docs/stack/CONVENCOES.md
  faixa: media
- arquivo: docs/stack/LACUNAS.md
  faixa: media
- arquivo: prisma/seed.ts
  faixa: media
- arquivo: src/app/(sistema)/(painel)/loading.tsx
  faixa: media
- arquivo: src/app/(sistema)/conversas/(lista)/loading.tsx
  faixa: media
- arquivo: src/app/(sistema)/conversas/[id]/loading.tsx
  faixa: media
- arquivo: src/app/(sistema)/conversas/[id]/not-found.tsx
  faixa: media
- arquivo: src/componentes/BadgeDeCanal.tsx
  faixa: media
- arquivo: src/componentes/CartoesDoPainel.tsx
  faixa: media
- arquivo: src/componentes/ConversasRecentes.tsx
  faixa: media
- arquivo: src/componentes/FiltrosDeConversas.tsx
  faixa: media
- arquivo: src/componentes/GraficoDeMensagens.tsx
  faixa: media
- arquivo: src/componentes/ListaDeConversas.tsx
  faixa: media
- arquivo: src/componentes/PrimeirosPassos.tsx
  faixa: media
- arquivo: src/componentes/apagar-conversas.ts
  faixa: media
- arquivo: src/componentes/conversas-logica.ts
  faixa: media
- arquivo: src/componentes/itens-de-menu.ts
  faixa: media
- arquivo: src/componentes/painel-logica.ts
  faixa: media
- arquivo: src/estilos/global.css
  faixa: media
- arquivo: src/estilos/tokens.css
  faixa: media
- arquivo: tests/apoio/contador-de-consultas.ts
  faixa: media
- arquivo: tests/apoio/historico.ts
  faixa: media
- arquivo: tests/menu.test.ts
  faixa: media
- arquivo: tests/rotas.test.ts
  faixa: media
- arquivo: docs/entregas/historico-de-conversas/ENTREGA.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/00-AUDITORIA.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/00-BLOQUEIOS.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/00-DECISOES.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/BRIEFING-BUILDX.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/FECHAMENTO.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/ORQUESTRADOR.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/RELATORIO-FEATURE.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/VERIFICACAO-VISUAL.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/base/00-INDICE.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/base/00-LACUNAS.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/base/canais-e-rotulos.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/base/conversas-e-modelo.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/base/painel-e-agregacao.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/base/seed-testes-e-ci.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/base/telas-menu-e-componentes.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-01/fases.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-01/sprint.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-01/tasks.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-02/fases.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-02/sprint.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-02/tasks.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-03/fases.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-03/sprint.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-03/tasks.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-04/fases.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-04/sprint.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-04/tasks.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-05/fases.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-05/sprint.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-05/tasks.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-06/fases.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-06/sprint.md
  faixa: baixa
- arquivo: docs/historico-de-conversas/sprint-06/tasks.md
  faixa: baixa
- arquivo: src/app/(sistema)/page.tsx
  faixa: baixa
- arquivo: tests/contador-de-consultas.test.ts
  faixa: baixa
- arquivo: tests/conversas-apagar-rota.test.ts
  faixa: baixa
- arquivo: tests/conversas-detalhe-rota.test.ts
  faixa: baixa
- arquivo: tests/conversas-detalhe-ui.test.tsx
  faixa: baixa
- arquivo: tests/conversas-exportar-rota.test.ts
  faixa: baixa
- arquivo: tests/conversas-lista-estilos.test.ts
  faixa: baixa
- arquivo: tests/conversas-lista-ui.test.tsx
  faixa: baixa
- arquivo: tests/conversas-logica.test.ts
  faixa: baixa
- arquivo: tests/conversas-lote-ui.test.tsx
  faixa: baixa
- arquivo: tests/grafico-de-mensagens.test.tsx
  faixa: baixa
- arquivo: tests/historico-apagar.test.ts
  faixa: baixa
- arquivo: tests/historico-apoio.test.ts
  faixa: baixa
- arquivo: tests/historico-consultas.test.ts
  faixa: baixa
- arquivo: tests/historico-listar.test.ts
  faixa: baixa
- arquivo: tests/historico-logica.test.ts
  faixa: baixa
- arquivo: tests/historico-obter.test.ts
  faixa: baixa
- arquivo: tests/historico-texto.test.ts
  faixa: baixa
- arquivo: tests/painel-logica.test.ts
  faixa: baixa
- arquivo: tests/painel-numeros.test.ts
  faixa: baixa
- arquivo: tests/painel-passos.test.ts
  faixa: baixa
- arquivo: tests/painel-serie.test.ts
  faixa: baixa
- arquivo: tests/painel-ui.test.tsx
  faixa: baixa
- arquivo: tests/projeto.test.ts
  faixa: baixa
- arquivo: tests/seed-conversas.test.ts
  faixa: baixa
- arquivo: tests/sqlite-formatos.test.ts
  faixa: baixa
- arquivo: tests/tokens-historico.test.ts
  faixa: baixa
- arquivo: docs/entregas/historico-de-conversas/ATENCAO.md
  faixa: baixa
- arquivo: docs/entregas/historico-de-conversas/PR.md
  faixa: baixa
- arquivo: docs/entregas/historico-de-conversas/QA-PACOTE.md
  faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 15
  leitura_rapida: 29
  dispensavel: 64
portao: pronto
desvios:
- 'suite: as tasks guardam parcial (subconjunto da task, declarado na linha da task); a suite inteira rodou verde ao fechar cada sprint (2046, 2103, 2115, 2173, 2218 e 2251 testes) e no estado final do HEAD, 2251 testes em 176 arquivos; so a T-06.04 guarda verde'
- 'commits: T-06.04 foi fechada no commit fd23b20 (fechamento da sprint 06, com MAPA, PREMISSAS, RECURSAO, FECHAMENTO e RELATORIO); as demais tasks tem um commit proprio; ATENCAO, QA-PACOTE e PR tem commits proprios depois do portao'
- 'T-03.01: src/app/api/conversas/resposta.ts nasceu (erro em JSON e sessao 401 proprios das rotas de conversas, com rota: ''conversas'' no log)'
- 'T-04.02: a pagina da lista mora em src/app/(sistema)/conversas/(lista)/ (page.tsx e loading.tsx) e nao em conversas/, para o loading nao envolver o [id] e o 404 nao sair 200'
- 'T-04.03: src/app/(sistema)/conversas/(lista)/page.tsx passou a usar ListaComSelecao e a redirecionar para a ultima pagina quando a atual esvazia'
- 'T-04.04: nasceram src/app/(sistema)/conversas/[id]/layout.tsx e carregar-conversa.ts (o 404 sai do layout, acima do loading) e tests/conversas-detalhe-rota.test.ts; o bloco de detalhe previsto em tests/rotas.test.ts virou arquivo proprio'
- 'T-05.04: a pagina do painel foi movida de src/app/(sistema)/page.tsx para src/app/(sistema)/(painel)/page.tsx, com o loading.tsx no grupo (um loading em (sistema) faria o notFound das outras rotas sair 200); tests/rotas.test.ts teve asercoes do painel trocadas de proposito'
- 'T-06.02: src/servicos/historico-logica.ts (previa sem markdown) e tests/historico-logica.test.ts alterados, e a largura maxima do grafico em global.css passou a 480 px, por achados da verificacao no navegador; a verificacao usou um Chrome sem janela por CDP porque a extensao do Chrome nao conectou'
- 'T-06.03: a documentacao e o teste de tests/projeto.test.ts foram escritos no mesmo passo (sem vermelho primeiro); nas demais tasks de codigo o teste rodou vermelho antes'
- 'T-01.03: o formato do DateTime no SQLite era texto ISO em UTC (a hipotese de inteiro nao se confirmou); o strftime do painel foi escrito sobre o formato provado'
push_feito: false
pr_url: null
pr_estado: null
criado_em: '2026-10-01'
atualizado_em: '2026-10-01'
entregue_em: '2026-10-01'
---

# Entrega — FT-09 historico-de-conversas

Branch `feat/historico-de-conversas`, aberta em 2026-10-01 pela mergex a partir de `feat/conhecimento-em-video` (PRs empilhados, convenção `feat/<slug>` do repositório). Portão de prontidão: PRONTO. Sem remoto configurado (`git remote -v` vazio, PEND-05): o push e a abertura do PR não foram feitos; a descrição está em `PR.md` e o pacote de QA em `QA-PACOTE.md`. Nada foi mesclado.

## Registro da entrega

- Tasks: 24 em 6 sprints, todas `concluida`; commits por task na lista `commits`.
- Suíte: `parcial` por task, com a suíte inteira verde ao fechar cada sprint e 2251 testes verdes no estado final; `tsc`, `lint`, `build` e `npm audit --audit-level=high` (0) verdes.
- Atenção humana: 15 arquivos em olho obrigatório, 29 em leitura rápida e 64 dispensáveis (`ATENCAO.md`).
- Desvios: lista `desvios` do frontmatter.
