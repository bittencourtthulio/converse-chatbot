---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
entregue_por: mergex
titulo: Chat embutido por script
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/chat-embutido
branch_base: feat/respostas-com-conhecimento
commits:
  - task: T-01.01
    commit: d41df4f
  - task: T-01.02
    commit: a56b9e9
  - task: T-01.03
    commit: 3b4fc0e
  - task: T-01.04
    commit: e84a8ae
  - task: T-01.05
    commit: 1341290
  - task: T-02.01
    commit: 2412997
  - task: T-02.02
    commit: 38a1ef0
  - task: T-02.03
    commit: 5722244
  - task: T-02.04
    commit: 3db43d7
  - task: T-02.05
    commit: 9182dc1
  - task: T-03.01
    commit: 12da817
  - task: T-03.02
    commit: a6ad99a
  - task: T-03.03
    commit: 409f023
  - task: T-03.04
    commit: aa686ec
  - task: T-04.01
    commit: ef2e9fc
  - task: T-04.02
    commit: 466b4c2
  - task: T-04.03
    commit: 0b24293
  - task: T-04.04
    commit: 9710299
  - task: T-05.01
    commit: 817fcf1
  - task: T-05.02
    commit: f0973f4
  - task: T-05.03
    commit: 65e147f
  - task: T-06.01
    commit: 5e9fb3b
  - task: T-06.02
    commit: 2302fbb
  - task: T-06.03
    commit: a3f7fc7
  - task: T-06.04
    commit: 7b06f2d
  - task: T-07.02
    commit: c1d70c3
  - task: T-07.01
    commit: 135e023
  - task: T-07.03
    commit: 221e873
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", "README.md", "docs/chat-embutido/00-AUDITORIA.md", "docs/chat-embutido/00-BLOQUEIOS.md", "docs/chat-embutido/00-DECISOES.md", "docs/chat-embutido/BRIEFING-BUILDX.md", "docs/chat-embutido/FECHAMENTO.md", "docs/chat-embutido/ORQUESTRADOR.md", "docs/chat-embutido/RELATORIO-FEATURE.md", "docs/chat-embutido/VERIFICACAO-VISUAL.md", "docs/chat-embutido/base/00-INDICE.md", "docs/chat-embutido/base/00-LACUNAS.md", "docs/chat-embutido/base/api-publica-e-limites.md", "docs/chat-embutido/base/configuracao-e-painel.md", "docs/chat-embutido/base/embed-e-csp.md", "docs/chat-embutido/base/widget-e-script.md", "docs/chat-embutido/sprint-01/fases.md", "docs/chat-embutido/sprint-01/sprint.md", "docs/chat-embutido/sprint-01/tasks.md", "docs/chat-embutido/sprint-02/fases.md", "docs/chat-embutido/sprint-02/sprint.md", "docs/chat-embutido/sprint-02/tasks.md", "docs/chat-embutido/sprint-03/fases.md", "docs/chat-embutido/sprint-03/sprint.md", "docs/chat-embutido/sprint-03/tasks.md", "docs/chat-embutido/sprint-04/fases.md", "docs/chat-embutido/sprint-04/sprint.md", "docs/chat-embutido/sprint-04/tasks.md", "docs/chat-embutido/sprint-05/fases.md", "docs/chat-embutido/sprint-05/sprint.md", "docs/chat-embutido/sprint-05/tasks.md", "docs/chat-embutido/sprint-06/fases.md", "docs/chat-embutido/sprint-06/sprint.md", "docs/chat-embutido/sprint-06/tasks.md", "docs/chat-embutido/sprint-07/fases.md", "docs/chat-embutido/sprint-07/sprint.md", "docs/chat-embutido/sprint-07/tasks.md", "docs/entregas/chat-embutido/ATENCAO.md", "docs/entregas/chat-embutido/ENTREGA.md", "docs/entregas/chat-embutido/PR.md", "docs/entregas/chat-embutido/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "next.config.ts", "package-lock.json", "package.json", "prisma/migrations/20260930210000_configuracao_do_chat/migration.sql", "prisma/schema.prisma", "prisma/seed.ts", "src/app/(sistema)/agentes/[id]/publicar/loading.tsx", "src/app/(sistema)/agentes/[id]/publicar/page.tsx", "src/app/acoes.ts", "src/app/api/publico/agentes/[id]/config/route.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts", "src/app/api/publico/agentes/[id]/conversar/route.ts", "src/app/api/publico/resposta.ts", "src/app/embed/[id]/not-found.tsx", "src/app/embed/[id]/page.tsx", "src/app/eventos-sse.ts", "src/app/widget.js/route.ts", "src/componentes/AvatarDoChat.tsx", "src/componentes/ChatEmbutido.tsx", "src/componentes/CodigoParaIncorporar.tsx", "src/componentes/FormularioDoChat.tsx", "src/componentes/PainelDePublicacao.tsx", "src/componentes/PreviaDoChat.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/embed-logica.ts", "src/componentes/embed-mensagens.ts", "src/componentes/publicar-logica.ts", "src/estilos/global.css", "src/estilos/tokens.css", "src/lib/ambiente.ts", "src/lib/cor.ts", "src/lib/dominios-permitidos.ts", "src/proxy.ts", "src/servicos/chat-publico-config.ts", "src/servicos/chat-publico-limites.ts", "src/servicos/chat-publico.ts", "src/widget/widget.js", "tests/abas-do-agente.test.tsx", "tests/ajuda.ts", "tests/ambiente-dom.test.ts", "tests/ambiente.test.ts", "tests/apoio/dom.ts", "tests/apoio/publico.ts", "tests/apoio/servir-site-de-teste.ts", "tests/chat-embutido-ui.test.tsx", "tests/chat-publico-config-publica.test.ts", "tests/chat-publico-config.test.ts", "tests/chat-publico-limites.test.ts", "tests/chat-publico.test.ts", "tests/configuracao-do-chat-modelo.test.ts", "tests/cor.test.ts", "tests/dominios-permitidos.test.ts", "tests/embed-cabecalhos.test.ts", "tests/embed-logica.test.ts", "tests/embed-mensagens.test.ts", "tests/embed-pagina.test.ts", "tests/eventos-sse.test.ts", "tests/projeto.test.ts", "tests/publicar-acao.test.ts", "tests/publicar-logica.test.ts", "tests/publicar-rota.test.ts", "tests/publicar-ui.test.tsx", "tests/publico-config-rota.test.ts", "tests/publico-conversa-rota.test.ts", "tests/publico-conversar-rota.test.ts", "tests/rotas.test.ts", "tests/seed.test.ts", "tests/widget-interacao.test.ts", "tests/widget-montagem.test.ts", "tests/widget-rota.test.ts"]
faixa_atencao:
  - arquivo: "next.config.ts"
    faixa: alta
  - arquivo: "prisma/migrations/20260930210000_configuracao_do_chat/migration.sql"
    faixa: alta
  - arquivo: "prisma/schema.prisma"
    faixa: alta
  - arquivo: "src/app/acoes.ts"
    faixa: alta
  - arquivo: "src/app/api/publico/agentes/[id]/config/route.ts"
    faixa: alta
  - arquivo: "src/app/api/publico/agentes/[id]/conversa/route.ts"
    faixa: alta
  - arquivo: "src/app/api/publico/agentes/[id]/conversar/route.ts"
    faixa: alta
  - arquivo: "src/app/api/publico/resposta.ts"
    faixa: alta
  - arquivo: "src/app/embed/[id]/not-found.tsx"
    faixa: alta
  - arquivo: "src/app/embed/[id]/page.tsx"
    faixa: alta
  - arquivo: "src/app/eventos-sse.ts"
    faixa: alta
  - arquivo: "src/app/widget.js/route.ts"
    faixa: alta
  - arquivo: "src/componentes/embed-mensagens.ts"
    faixa: alta
  - arquivo: "src/lib/dominios-permitidos.ts"
    faixa: alta
  - arquivo: "src/proxy.ts"
    faixa: alta
  - arquivo: "src/servicos/chat-publico-config.ts"
    faixa: alta
  - arquivo: "src/servicos/chat-publico-limites.ts"
    faixa: alta
  - arquivo: "src/servicos/chat-publico.ts"
    faixa: alta
  - arquivo: "src/widget/widget.js"
    faixa: alta
  - arquivo: ".env.example"
    faixa: media
  - arquivo: "docs/projeto/PREMISSAS.md"
    faixa: media
  - arquivo: "docs/stack/CONVENCOES.md"
    faixa: media
  - arquivo: "package-lock.json"
    faixa: media
  - arquivo: "package.json"
    faixa: media
  - arquivo: "prisma/seed.ts"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/publicar/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/publicar/page.tsx"
    faixa: media
  - arquivo: "src/componentes/AvatarDoChat.tsx"
    faixa: media
  - arquivo: "src/componentes/ChatEmbutido.tsx"
    faixa: media
  - arquivo: "src/componentes/CodigoParaIncorporar.tsx"
    faixa: media
  - arquivo: "src/componentes/FormularioDoChat.tsx"
    faixa: media
  - arquivo: "src/componentes/PainelDePublicacao.tsx"
    faixa: media
  - arquivo: "src/componentes/PreviaDoChat.tsx"
    faixa: media
  - arquivo: "src/componentes/abas-do-agente.ts"
    faixa: media
  - arquivo: "src/componentes/embed-logica.ts"
    faixa: media
  - arquivo: "src/componentes/publicar-logica.ts"
    faixa: media
  - arquivo: "src/estilos/global.css"
    faixa: media
  - arquivo: "src/estilos/tokens.css"
    faixa: media
  - arquivo: "src/lib/ambiente.ts"
    faixa: media
  - arquivo: "src/lib/cor.ts"
    faixa: media
  - arquivo: "README.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/00-AUDITORIA.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/00-BLOQUEIOS.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/00-DECISOES.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/BRIEFING-BUILDX.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/FECHAMENTO.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/ORQUESTRADOR.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/RELATORIO-FEATURE.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/VERIFICACAO-VISUAL.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/base/00-INDICE.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/base/00-LACUNAS.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/base/api-publica-e-limites.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/base/configuracao-e-painel.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/base/embed-e-csp.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/base/widget-e-script.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-01/fases.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-01/sprint.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-01/tasks.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-02/fases.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-02/sprint.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-02/tasks.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-03/fases.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-03/sprint.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-03/tasks.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-04/fases.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-04/sprint.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-04/tasks.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-05/fases.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-05/sprint.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-05/tasks.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-06/fases.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-06/sprint.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-06/tasks.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-07/fases.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-07/sprint.md"
    faixa: baixa
  - arquivo: "docs/chat-embutido/sprint-07/tasks.md"
    faixa: baixa
  - arquivo: "docs/entregas/chat-embutido/ATENCAO.md"
    faixa: baixa
  - arquivo: "docs/entregas/chat-embutido/ENTREGA.md"
    faixa: baixa
  - arquivo: "docs/entregas/chat-embutido/PR.md"
    faixa: baixa
  - arquivo: "docs/entregas/chat-embutido/QA-PACOTE.md"
    faixa: baixa
  - arquivo: "docs/projeto/MAPA.md"
    faixa: baixa
  - arquivo: "docs/projeto/PROJETO.md"
    faixa: baixa
  - arquivo: "docs/projeto/RECURSAO.md"
    faixa: baixa
  - arquivo: "docs/stack/LACUNAS.md"
    faixa: baixa
  - arquivo: "tests/abas-do-agente.test.tsx"
    faixa: baixa
  - arquivo: "tests/ajuda.ts"
    faixa: baixa
  - arquivo: "tests/ambiente-dom.test.ts"
    faixa: baixa
  - arquivo: "tests/ambiente.test.ts"
    faixa: baixa
  - arquivo: "tests/apoio/dom.ts"
    faixa: baixa
  - arquivo: "tests/apoio/publico.ts"
    faixa: baixa
  - arquivo: "tests/apoio/servir-site-de-teste.ts"
    faixa: baixa
  - arquivo: "tests/chat-embutido-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/chat-publico-config-publica.test.ts"
    faixa: baixa
  - arquivo: "tests/chat-publico-config.test.ts"
    faixa: baixa
  - arquivo: "tests/chat-publico-limites.test.ts"
    faixa: baixa
  - arquivo: "tests/chat-publico.test.ts"
    faixa: baixa
  - arquivo: "tests/configuracao-do-chat-modelo.test.ts"
    faixa: baixa
  - arquivo: "tests/cor.test.ts"
    faixa: baixa
  - arquivo: "tests/dominios-permitidos.test.ts"
    faixa: baixa
  - arquivo: "tests/embed-cabecalhos.test.ts"
    faixa: baixa
  - arquivo: "tests/embed-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/embed-mensagens.test.ts"
    faixa: baixa
  - arquivo: "tests/embed-pagina.test.ts"
    faixa: baixa
  - arquivo: "tests/eventos-sse.test.ts"
    faixa: baixa
  - arquivo: "tests/projeto.test.ts"
    faixa: baixa
  - arquivo: "tests/publicar-acao.test.ts"
    faixa: baixa
  - arquivo: "tests/publicar-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/publicar-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/publicar-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/publico-config-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/publico-conversa-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/publico-conversar-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/rotas.test.ts"
    faixa: baixa
  - arquivo: "tests/seed.test.ts"
    faixa: baixa
  - arquivo: "tests/widget-interacao.test.ts"
    faixa: baixa
  - arquivo: "tests/widget-montagem.test.ts"
    faixa: baixa
  - arquivo: "tests/widget-rota.test.ts"
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 19
  leitura_rapida: 21
  dispensavel: 77
portao: pronto
desvios:
  - "Arquivos alem da lista inicial das tasks declarados nelas quando surgiram (detalhe na secao Desvios): tests/projeto.test.ts, chat-publico.ts, AvatarDoChat.tsx, embed-logica.ts, not-found.tsx, chat-publico-config.ts, global.css, tests/apoio/dom.ts, publicar-logica.ts movido para a T-06.01, PainelDePublicacao.tsx, embed-mensagens.ts, ChatEmbutido.tsx, tests/rotas.test.ts"
  - "loading.tsx previsto para /embed/[id] descartado: com ele a pagina indisponivel sairia com status 200"
  - "ordem das tasks T-07.01 e T-07.02 trocada"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: 2026-09-30
---

# Entrega — Chat embutido por script

Entregue na branch `feat/chat-embutido` (base `feat/respostas-com-conhecimento`, PRs empilhados): 28 tasks em 7 sprints, 1481 testes verdes. Sem remoto configurado: nenhum push nem PR foi feito; a descrição é o `PR.md`.

## Onde está o quê

| O quê | Onde |
|---|---|
| Descrição do pull request | [PR.md](PR.md) |
| Pacote de QA | [QA-PACOTE.md](QA-PACOTE.md) |
| Classificação da atenção | [ATENCAO.md](ATENCAO.md) |
| Trabalho de origem | [chat-embutido](../../chat-embutido/) |
| Relatório da feature | [RELATORIO-FEATURE.md](../../chat-embutido/RELATORIO-FEATURE.md) |
| Verificação no navegador | [VERIFICACAO-VISUAL.md](../../chat-embutido/VERIFICACAO-VISUAL.md) |
| Pull request | não aberto (sem remoto) |

## Estado da entrega

- Portão de prontidão: PRONTO
- Commits: 28, um por task
- Atenção humana: 19 olho obrigatório, 21 leitura rápida, 77 dispensável
- Push: não feito — não há remoto configurado
- Pull request: não aberto — basta abrir manualmente depois de configurar o remoto, usando o `PR.md`
- Falta para o merge: revisão humana, execução do pacote de QA (casos 2 e 16 cobrem o que o desenvolvimento não viu) e o repositório remoto

## Avisos

- A linha da branch está no `ORQUESTRADOR.md` (gerado na F4).
- Convenção de desvios: `suite: verde` só quando a suíte inteira rodou; subconjunto é `parcial` com o subconjunto declarado.

## Desvios

Arquivos além da lista inicial das tasks, declarados nelas quando surgiram (detalhe em `docs/chat-embutido/RELATORIO-FEATURE.md`): `tests/projeto.test.ts` (T-01.04), `src/servicos/chat-publico.ts` (T-03.02), `src/componentes/AvatarDoChat.tsx`, `src/componentes/embed-logica.ts`, `tests/embed-logica.test.ts` (T-04.02), `src/app/embed/[id]/not-found.tsx` e `src/servicos/chat-publico-config.ts` (T-04.04; o `loading.tsx` previsto foi descartado), `tests/apoio/dom.ts` (T-05.02), `src/componentes/publicar-logica.ts` movido para a T-06.01, `src/componentes/PainelDePublicacao.tsx`, `src/componentes/embed-mensagens.ts`, `src/componentes/ChatEmbutido.tsx` (T-06.02), `tests/rotas.test.ts` (T-06.04), `src/estilos/global.css` (T-07.02). A ordem das tasks T-07.01 e T-07.02 foi trocada.

Convenção de `suite`: `verde` só com a suíte inteira rodada na task. Os testes de rota usam o `.next` que existir; a rodada final, depois de `npm run build`, validou a feature inteira (1481 testes).
