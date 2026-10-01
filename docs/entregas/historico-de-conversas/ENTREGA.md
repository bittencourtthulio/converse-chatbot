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
estado: aberto
versionado: true
branch: feat/historico-de-conversas
branch_base: feat/conhecimento-em-video
commits: []
raio: null
atencao:
  olho_obrigatorio: 15
  leitura_rapida: 29
  dispensavel: 64
faixa_atencao:
  - arquivo: "src/app/(sistema)/(painel)/page.tsx"
    faixa: alta
  - arquivo: "src/app/(sistema)/conversas/(lista)/page.tsx"
    faixa: alta
  - arquivo: "src/app/(sistema)/conversas/[id]/carregar-conversa.ts"
    faixa: alta
  - arquivo: "src/app/(sistema)/conversas/[id]/layout.tsx"
    faixa: alta
  - arquivo: "src/app/(sistema)/conversas/[id]/page.tsx"
    faixa: alta
  - arquivo: "src/app/api/conversas/[id]/exportar/route.ts"
    faixa: alta
  - arquivo: "src/app/api/conversas/[id]/route.ts"
    faixa: alta
  - arquivo: "src/app/api/conversas/apagar/route.ts"
    faixa: alta
  - arquivo: "src/app/api/conversas/resposta.ts"
    faixa: alta
  - arquivo: "src/componentes/AcoesDaConversa.tsx"
    faixa: alta
  - arquivo: "src/componentes/ListaComSelecao.tsx"
    faixa: alta
  - arquivo: "src/componentes/TranscricaoDaConversa.tsx"
    faixa: alta
  - arquivo: "src/servicos/historico-logica.ts"
    faixa: alta
  - arquivo: "src/servicos/historico.ts"
    faixa: alta
  - arquivo: "src/servicos/painel.ts"
    faixa: alta
  - arquivo: "README.md"
    faixa: media
  - arquivo: "docs/projeto/MAPA.md"
    faixa: media
  - arquivo: "docs/projeto/PREMISSAS.md"
    faixa: media
  - arquivo: "docs/projeto/PROJETO.md"
    faixa: media
  - arquivo: "docs/projeto/RECURSAO.md"
    faixa: media
  - arquivo: "docs/stack/CONVENCOES.md"
    faixa: media
  - arquivo: "docs/stack/LACUNAS.md"
    faixa: media
  - arquivo: "prisma/seed.ts"
    faixa: media
  - arquivo: "src/app/(sistema)/(painel)/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/conversas/(lista)/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/conversas/[id]/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/conversas/[id]/not-found.tsx"
    faixa: media
  - arquivo: "src/componentes/BadgeDeCanal.tsx"
    faixa: media
  - arquivo: "src/componentes/CartoesDoPainel.tsx"
    faixa: media
  - arquivo: "src/componentes/ConversasRecentes.tsx"
    faixa: media
  - arquivo: "src/componentes/FiltrosDeConversas.tsx"
    faixa: media
  - arquivo: "src/componentes/GraficoDeMensagens.tsx"
    faixa: media
  - arquivo: "src/componentes/ListaDeConversas.tsx"
    faixa: media
  - arquivo: "src/componentes/PrimeirosPassos.tsx"
    faixa: media
  - arquivo: "src/componentes/apagar-conversas.ts"
    faixa: media
  - arquivo: "src/componentes/conversas-logica.ts"
    faixa: media
  - arquivo: "src/componentes/itens-de-menu.ts"
    faixa: media
  - arquivo: "src/componentes/painel-logica.ts"
    faixa: media
  - arquivo: "src/estilos/global.css"
    faixa: media
  - arquivo: "src/estilos/tokens.css"
    faixa: media
  - arquivo: "tests/apoio/contador-de-consultas.ts"
    faixa: media
  - arquivo: "tests/apoio/historico.ts"
    faixa: media
  - arquivo: "tests/menu.test.ts"
    faixa: media
  - arquivo: "tests/rotas.test.ts"
    faixa: media
  - arquivo: "docs/entregas/historico-de-conversas/ENTREGA.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/00-AUDITORIA.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/00-BLOQUEIOS.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/00-DECISOES.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/BRIEFING-BUILDX.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/FECHAMENTO.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/ORQUESTRADOR.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/RELATORIO-FEATURE.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/VERIFICACAO-VISUAL.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/base/00-INDICE.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/base/00-LACUNAS.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/base/canais-e-rotulos.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/base/conversas-e-modelo.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/base/painel-e-agregacao.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/base/seed-testes-e-ci.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/base/telas-menu-e-componentes.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-01/fases.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-01/sprint.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-01/tasks.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-02/fases.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-02/sprint.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-02/tasks.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-03/fases.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-03/sprint.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-03/tasks.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-04/fases.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-04/sprint.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-04/tasks.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-05/fases.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-05/sprint.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-05/tasks.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-06/fases.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-06/sprint.md"
    faixa: baixa
  - arquivo: "docs/historico-de-conversas/sprint-06/tasks.md"
    faixa: baixa
  - arquivo: "src/app/(sistema)/page.tsx"
    faixa: baixa
  - arquivo: "tests/contador-de-consultas.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas-apagar-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas-detalhe-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas-detalhe-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/conversas-exportar-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas-lista-estilos.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas-lista-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/conversas-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas-lote-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/grafico-de-mensagens.test.tsx"
    faixa: baixa
  - arquivo: "tests/historico-apagar.test.ts"
    faixa: baixa
  - arquivo: "tests/historico-apoio.test.ts"
    faixa: baixa
  - arquivo: "tests/historico-consultas.test.ts"
    faixa: baixa
  - arquivo: "tests/historico-listar.test.ts"
    faixa: baixa
  - arquivo: "tests/historico-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/historico-obter.test.ts"
    faixa: baixa
  - arquivo: "tests/historico-texto.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-numeros.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-passos.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-serie.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/projeto.test.ts"
    faixa: baixa
  - arquivo: "tests/seed-conversas.test.ts"
    faixa: baixa
  - arquivo: "tests/sqlite-formatos.test.ts"
    faixa: baixa
  - arquivo: "tests/tokens-historico.test.ts"
    faixa: baixa
  - arquivo: "docs/entregas/historico-de-conversas/ATENCAO.md"
    faixa: baixa
  - arquivo: "docs/entregas/historico-de-conversas/PR.md"
    faixa: baixa
  - arquivo: "docs/entregas/historico-de-conversas/QA-PACOTE.md"
    faixa: baixa
portao: pronto
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-01
atualizado_em: 2026-10-01
---

# Entrega — FT-09 historico-de-conversas

Branch aberta em 2026-10-01 pela mergex (E0) a partir de `feat/conhecimento-em-video` (PRs empilhados, convencao `feat/<slug>` do repositorio). Base determinada pela convencao do projeto (cada feature nasce da branch da anterior). O `ORQUESTRADOR.md` ainda nao existe (F4); a linha da branch sera acrescentada quando ele for criado.
