---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
entregue_por: mergex
titulo: Respostas com base no conhecimento
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/respostas-com-conhecimento
branch_base: feat/conhecimento-arquivos-e-texto
commits:
  - task: T-01.01
    commit: 3c7d167
  - task: T-01.02
    commit: 29ba70c
  - task: T-01.03
    commit: e375e41
  - task: T-02.01
    commit: 7786747
  - task: T-02.02
    commit: 9059275
  - task: T-02.03
    commit: 2a34e17
  - task: T-02.04
    commit: 9cd84a8
  - task: T-03.01
    commit: 67b2aba
  - task: T-03.02
    commit: d3a6b8a
  - task: T-03.03
    commit: 465b3f0
  - task: T-03.04
    commit: 785bbfb
  - task: T-03.05
    commit: c3dd984
  - task: T-04.01
    commit: d2d5d62
  - task: T-04.02
    commit: 40d5bcd
  - task: T-04.03
    commit: cca78ea
  - task: T-05.01
    commit: 6da2f48
  - task: T-05.02
    commit: be607f9
  - task: T-05.03
    commit: 7d8e23a
  - task: T-05.04
    commit: 40164c4
  - task: T-06.01
    commit: 17251ad
  - task: T-06.02
    commit: da7d31f
  - task: T-06.03
    commit: 8d966e8
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: ["README.md", "docs/entregas/respostas-com-conhecimento/ATENCAO.md", "docs/entregas/respostas-com-conhecimento/ENTREGA.md", "docs/entregas/respostas-com-conhecimento/PR.md", "docs/entregas/respostas-com-conhecimento/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/respostas-com-conhecimento/00-AUDITORIA.md", "docs/respostas-com-conhecimento/00-BLOQUEIOS.md", "docs/respostas-com-conhecimento/00-DECISOES.md", "docs/respostas-com-conhecimento/BRIEFING-BUILDX.md", "docs/respostas-com-conhecimento/FECHAMENTO.md", "docs/respostas-com-conhecimento/ORQUESTRADOR.md", "docs/respostas-com-conhecimento/RELATORIO-FEATURE.md", "docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md", "docs/respostas-com-conhecimento/base/00-INDICE.md", "docs/respostas-com-conhecimento/base/00-LACUNAS.md", "docs/respostas-com-conhecimento/base/fts5-e-migration.md", "docs/respostas-com-conhecimento/base/interface-testar-e-conhecimento.md", "docs/respostas-com-conhecimento/base/turno-de-chat-e-sse.md", "docs/respostas-com-conhecimento/sprint-01/fases.md", "docs/respostas-com-conhecimento/sprint-01/sprint.md", "docs/respostas-com-conhecimento/sprint-01/tasks.md", "docs/respostas-com-conhecimento/sprint-02/fases.md", "docs/respostas-com-conhecimento/sprint-02/sprint.md", "docs/respostas-com-conhecimento/sprint-02/tasks.md", "docs/respostas-com-conhecimento/sprint-03/fases.md", "docs/respostas-com-conhecimento/sprint-03/sprint.md", "docs/respostas-com-conhecimento/sprint-03/tasks.md", "docs/respostas-com-conhecimento/sprint-04/fases.md", "docs/respostas-com-conhecimento/sprint-04/sprint.md", "docs/respostas-com-conhecimento/sprint-04/tasks.md", "docs/respostas-com-conhecimento/sprint-05/fases.md", "docs/respostas-com-conhecimento/sprint-05/sprint.md", "docs/respostas-com-conhecimento/sprint-05/tasks.md", "docs/respostas-com-conhecimento/sprint-06/fases.md", "docs/respostas-com-conhecimento/sprint-06/sprint.md", "docs/respostas-com-conhecimento/sprint-06/tasks.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20260930190000_busca_fts5/migration.sql", "src/app/api/agentes/[id]/buscar/route.ts", "src/app/eventos-sse.ts", "src/componentes/ChatDeTeste.tsx", "src/componentes/FontesDaResposta.tsx", "src/componentes/PainelDeConhecimento.tsx", "src/componentes/TestarBusca.tsx", "src/componentes/TextoDoModelo.tsx", "src/componentes/busca-logica.ts", "src/componentes/estado-da-conversa.ts", "src/componentes/fontes-da-resposta-logica.ts", "src/componentes/leitor-de-sse.ts", "src/componentes/texto-seguro.ts", "src/estilos/global.css", "src/servicos/chat-prompt.ts", "src/servicos/chat.ts", "src/servicos/conversas.ts", "src/servicos/fontes-da-resposta.ts", "src/servicos/recuperacao-termos.ts", "src/servicos/recuperacao.ts", "tests/apoio-conhecimento.test.ts", "tests/apoio/conhecimento.ts", "tests/busca-logica.test.ts", "tests/buscar-rota.test.ts", "tests/chat-fontes.test.ts", "tests/chat-fundamentado.test.ts", "tests/chat-prompt-fundamentado.test.ts", "tests/conversar-rota.test.ts", "tests/conversas.test.ts", "tests/estado-da-conversa.test.ts", "tests/eventos-sse.test.ts", "tests/fontes-da-resposta-ui.test.tsx", "tests/fontes-da-resposta.test.ts", "tests/indice-fts5-cascata.test.ts", "tests/indice-fts5.test.ts", "tests/leitor-de-sse.test.ts", "tests/painel-de-conhecimento.test.tsx", "tests/projeto.test.ts", "tests/recuperacao-desempenho.test.ts", "tests/recuperacao-termos.test.ts", "tests/recuperacao.test.ts", "tests/seed.test.ts", "tests/texto-seguro.test.tsx"]
faixa_atencao:
  - arquivo: "prisma/migrations/20260930190000_busca_fts5/migration.sql"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/buscar/route.ts"
    faixa: alta
  - arquivo: "src/app/eventos-sse.ts"
    faixa: alta
  - arquivo: "src/componentes/TextoDoModelo.tsx"
    faixa: alta
  - arquivo: "src/componentes/leitor-de-sse.ts"
    faixa: alta
  - arquivo: "src/componentes/texto-seguro.ts"
    faixa: alta
  - arquivo: "src/servicos/chat-prompt.ts"
    faixa: alta
  - arquivo: "src/servicos/chat.ts"
    faixa: alta
  - arquivo: "src/servicos/conversas.ts"
    faixa: alta
  - arquivo: "src/servicos/fontes-da-resposta.ts"
    faixa: alta
  - arquivo: "src/servicos/recuperacao-termos.ts"
    faixa: alta
  - arquivo: "src/servicos/recuperacao.ts"
    faixa: alta
  - arquivo: "docs/projeto/PREMISSAS.md"
    faixa: media
  - arquivo: "src/componentes/ChatDeTeste.tsx"
    faixa: media
  - arquivo: "src/componentes/FontesDaResposta.tsx"
    faixa: media
  - arquivo: "src/componentes/PainelDeConhecimento.tsx"
    faixa: media
  - arquivo: "src/componentes/TestarBusca.tsx"
    faixa: media
  - arquivo: "src/componentes/busca-logica.ts"
    faixa: media
  - arquivo: "src/componentes/estado-da-conversa.ts"
    faixa: media
  - arquivo: "src/componentes/fontes-da-resposta-logica.ts"
    faixa: media
  - arquivo: "src/estilos/global.css"
    faixa: media
  - arquivo: "README.md"
    faixa: baixa
  - arquivo: "docs/entregas/respostas-com-conhecimento/ATENCAO.md"
    faixa: baixa
  - arquivo: "docs/entregas/respostas-com-conhecimento/ENTREGA.md"
    faixa: baixa
  - arquivo: "docs/entregas/respostas-com-conhecimento/PR.md"
    faixa: baixa
  - arquivo: "docs/entregas/respostas-com-conhecimento/QA-PACOTE.md"
    faixa: baixa
  - arquivo: "docs/projeto/MAPA.md"
    faixa: baixa
  - arquivo: "docs/projeto/PROJETO.md"
    faixa: baixa
  - arquivo: "docs/projeto/RECURSAO.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/00-AUDITORIA.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/00-BLOQUEIOS.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/00-DECISOES.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/BRIEFING-BUILDX.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/FECHAMENTO.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/ORQUESTRADOR.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/RELATORIO-FEATURE.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/base/00-INDICE.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/base/00-LACUNAS.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/base/fts5-e-migration.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/base/interface-testar-e-conhecimento.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/base/turno-de-chat-e-sse.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-01/fases.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-01/sprint.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-01/tasks.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-02/fases.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-02/sprint.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-02/tasks.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-03/fases.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-03/sprint.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-03/tasks.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-04/fases.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-04/sprint.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-04/tasks.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-05/fases.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-05/sprint.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-05/tasks.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-06/fases.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-06/sprint.md"
    faixa: baixa
  - arquivo: "docs/respostas-com-conhecimento/sprint-06/tasks.md"
    faixa: baixa
  - arquivo: "docs/stack/CONVENCOES.md"
    faixa: baixa
  - arquivo: "docs/stack/LACUNAS.md"
    faixa: baixa
  - arquivo: "tests/apoio-conhecimento.test.ts"
    faixa: baixa
  - arquivo: "tests/apoio/conhecimento.ts"
    faixa: baixa
  - arquivo: "tests/busca-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/buscar-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/chat-fontes.test.ts"
    faixa: baixa
  - arquivo: "tests/chat-fundamentado.test.ts"
    faixa: baixa
  - arquivo: "tests/chat-prompt-fundamentado.test.ts"
    faixa: baixa
  - arquivo: "tests/conversar-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas.test.ts"
    faixa: baixa
  - arquivo: "tests/estado-da-conversa.test.ts"
    faixa: baixa
  - arquivo: "tests/eventos-sse.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-da-resposta-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/fontes-da-resposta.test.ts"
    faixa: baixa
  - arquivo: "tests/indice-fts5-cascata.test.ts"
    faixa: baixa
  - arquivo: "tests/indice-fts5.test.ts"
    faixa: baixa
  - arquivo: "tests/leitor-de-sse.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-de-conhecimento.test.tsx"
    faixa: baixa
  - arquivo: "tests/projeto.test.ts"
    faixa: baixa
  - arquivo: "tests/recuperacao-desempenho.test.ts"
    faixa: baixa
  - arquivo: "tests/recuperacao-termos.test.ts"
    faixa: baixa
  - arquivo: "tests/recuperacao.test.ts"
    faixa: baixa
  - arquivo: "tests/seed.test.ts"
    faixa: baixa
  - arquivo: "tests/texto-seguro.test.tsx"
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 12
  leitura_rapida: 9
  dispensavel: 64
portao: pronto
desvios:
  - "A linha suite das tasks foi trocada de parcial para verde (cada task rodou o subconjunto afetado; a suite inteira rodou verde no fim de cada sprint e no estado final, 1065 testes); a prosa de cada task descreve o subconjunto que rodou"
  - "docs/projeto/PROJETO.md (features_entregues) editado sem constar numa task; declarado na T-06.03"
  - "src/componentes/ChatDeTeste.tsx recebeu um else if na T-04.01 (o tipo novo de evento quebrava o tsc), antes da T-05.03 que o previa"
  - "src/estilos/global.css corrigido tambem na T-06.02 (alinhamento do chip de fonte, achado da verificacao visual)"
  - "Previstos e nao alterados: prisma/seed.ts, tests/rotas.test.ts, tests/apoio/servidor.ts, src/app/(sistema)/agentes/[id]/testar/page.tsx"
  - "Em varias tasks o teste e o codigo nasceram no mesmo passo, sem o vermelho primeiro (T-01.03, T-03.05, T-04.03, T-05.04)"
  - "Limite conhecido: o comportamento do modelo real diante do prompt fundamentado nao e testavel sem o provedor; so a estrutura do prompt e provada"
  - "Sem remoto configurado: push e PR nao feitos (PEND-05)"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: 2026-09-30
---

# Entrega: Respostas com base no conhecimento (FT-05)

Branch `feat/respostas-com-conhecimento`, aberta em 2026-09-30 a partir de `feat/conhecimento-arquivos-e-texto` (PRs empilhados). Portão de prontidão: PRONTO. Suíte inteira: 1065 testes verdes; `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes.

**Push e PR não foram feitos: o repositório não tem remoto configurado** (PEND-05 em `docs/projeto/RECURSAO.md`). A descrição do PR está em `docs/entregas/respostas-com-conhecimento/PR.md`, o pacote de QA em `QA-PACOTE.md` e a classificação de atenção em `ATENCAO.md`, nesta pasta.
