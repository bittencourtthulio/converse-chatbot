---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
entregue_por: mergex
titulo: Canal Telegram
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/canal-telegram
branch_base: feat/chat-embutido
commits:
  - task: T-01.01
    commit: 0c280c9
  - task: T-01.02
    commit: 3eac4af
  - task: T-01.03
    commit: 6a7880a
  - task: T-02.01
    commit: d7bc784
  - task: T-02.02
    commit: db902c0
  - task: T-02.03
    commit: db902c0
  - task: T-03.01
    commit: 49699f1
  - task: T-03.02
    commit: ad3ba4d
  - task: T-03.03
    commit: cdfbc1a
  - task: T-04.01
    commit: ec104ef
  - task: T-04.02
    commit: b7ee921
  - task: T-04.03
    commit: 3fef879
  - task: T-04.04
    commit: 01fc026
  - task: T-05.01
    commit: 0502b23
  - task: T-05.02
    commit: c1bd9b4
  - task: T-06.01
    commit: f5440a5
  - task: T-06.02
    commit: 29da8ba
  - task: T-07.01
    commit: 4399316
  - task: T-07.02
    commit: db717c1
  - task: T-07.03
    commit: b1ab740
modulo_afetado: []
arquivos_alterados: [".env.example", "README.md", "docs/canal-telegram/00-AUDITORIA.md", "docs/canal-telegram/00-BLOQUEIOS.md", "docs/canal-telegram/00-DECISOES.md", "docs/canal-telegram/BRIEFING-BUILDX.md", "docs/canal-telegram/FECHAMENTO.md", "docs/canal-telegram/ORQUESTRADOR.md", "docs/canal-telegram/RELATORIO-FEATURE.md", "docs/canal-telegram/VERIFICACAO-VISUAL.md", "docs/canal-telegram/base/00-INDICE.md", "docs/canal-telegram/base/00-LACUNAS.md", "docs/canal-telegram/base/dados-segredo-e-ambiente.md", "docs/canal-telegram/base/rotas-painel-e-testes.md", "docs/canal-telegram/base/telegram-bot-api.md", "docs/canal-telegram/base/turno-e-limites.md", "docs/canal-telegram/sprint-01/fases.md", "docs/canal-telegram/sprint-01/sprint.md", "docs/canal-telegram/sprint-01/tasks.md", "docs/canal-telegram/sprint-02/fases.md", "docs/canal-telegram/sprint-02/sprint.md", "docs/canal-telegram/sprint-02/tasks.md", "docs/canal-telegram/sprint-03/fases.md", "docs/canal-telegram/sprint-03/sprint.md", "docs/canal-telegram/sprint-03/tasks.md", "docs/canal-telegram/sprint-04/fases.md", "docs/canal-telegram/sprint-04/sprint.md", "docs/canal-telegram/sprint-04/tasks.md", "docs/canal-telegram/sprint-05/fases.md", "docs/canal-telegram/sprint-05/sprint.md", "docs/canal-telegram/sprint-05/tasks.md", "docs/canal-telegram/sprint-06/fases.md", "docs/canal-telegram/sprint-06/sprint.md", "docs/canal-telegram/sprint-06/tasks.md", "docs/canal-telegram/sprint-07/fases.md", "docs/canal-telegram/sprint-07/sprint.md", "docs/canal-telegram/sprint-07/tasks.md", "docs/entregas/canal-telegram/ATENCAO.md", "docs/entregas/canal-telegram/ENTREGA.md", "docs/entregas/canal-telegram/PR.md", "docs/entregas/canal-telegram/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20260930220000_canal_telegram/migration.sql", "prisma/schema.prisma", "src/app/(sistema)/agentes/[id]/canais/loading.tsx", "src/app/(sistema)/agentes/[id]/canais/page.tsx", "src/app/acoes.ts", "src/app/api/telegram/[agenteId]/webhook/route.ts", "src/componentes/CartaoTelegram.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/canais-logica.ts", "src/componentes/canais.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/lib/exclusao-mutua.ts", "src/lib/telegram.ts", "src/servicos/canal-telegram.ts", "src/servicos/chat-publico-limites.ts", "src/servicos/conversas.ts", "src/servicos/telegram-atendimento.ts", "src/servicos/telegram-limites.ts", "src/servicos/telegram-webhook.ts", "tests/abas-do-agente.test.tsx", "tests/ajuda.ts", "tests/ambiente.test.ts", "tests/apoio/servidor.ts", "tests/apoio/servir-telegram-falso.ts", "tests/apoio/telegram-falso.ts", "tests/canais-logica.test.ts", "tests/canais-ui.test.tsx", "tests/canal-telegram-ciclo.test.ts", "tests/canal-telegram-conectar.test.ts", "tests/canal-telegram-modelo.test.ts", "tests/chat-publico-limites.test.ts", "tests/conversas.test.ts", "tests/exclusao-mutua.test.ts", "tests/projeto.test.ts", "tests/publicar-rota.test.ts", "tests/rotas.test.ts", "tests/telegram-acoes.test.ts", "tests/telegram-comandos.test.ts", "tests/telegram-envio.test.ts", "tests/telegram-falso.test.ts", "tests/telegram-limites.test.ts", "tests/telegram-resposta.test.ts", "tests/telegram-token-nao-vaza.test.ts", "tests/telegram-webhook-base.test.ts", "tests/telegram-webhook-rota.test.ts", "tests/telegram.test.ts"]
faixa_atencao:
  - arquivo: "prisma/migrations/20260930220000_canal_telegram/migration.sql"
    faixa: alta
  - arquivo: "prisma/schema.prisma"
    faixa: alta
  - arquivo: "src/app/acoes.ts"
    faixa: alta
  - arquivo: "src/app/api/telegram/[agenteId]/webhook/route.ts"
    faixa: alta
  - arquivo: "src/lib/ambiente.ts"
    faixa: alta
  - arquivo: "src/lib/telegram.ts"
    faixa: alta
  - arquivo: "src/servicos/canal-telegram.ts"
    faixa: alta
  - arquivo: "src/servicos/chat-publico-limites.ts"
    faixa: alta
  - arquivo: "src/servicos/conversas.ts"
    faixa: alta
  - arquivo: "src/servicos/telegram-atendimento.ts"
    faixa: alta
  - arquivo: "src/servicos/telegram-limites.ts"
    faixa: alta
  - arquivo: "src/servicos/telegram-webhook.ts"
    faixa: alta
  - arquivo: ".env.example"
    faixa: media
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
  - arquivo: "src/app/(sistema)/agentes/[id]/canais/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/canais/page.tsx"
    faixa: media
  - arquivo: "src/componentes/CartaoTelegram.tsx"
    faixa: media
  - arquivo: "src/componentes/abas-do-agente.ts"
    faixa: media
  - arquivo: "src/componentes/canais-logica.ts"
    faixa: media
  - arquivo: "src/componentes/canais.ts"
    faixa: media
  - arquivo: "src/estilos/global.css"
    faixa: media
  - arquivo: "src/lib/exclusao-mutua.ts"
    faixa: media
  - arquivo: "tests/abas-do-agente.test.tsx"
    faixa: media
  - arquivo: "tests/ajuda.ts"
    faixa: media
  - arquivo: "tests/ambiente.test.ts"
    faixa: media
  - arquivo: "tests/apoio/servidor.ts"
    faixa: media
  - arquivo: "tests/publicar-rota.test.ts"
    faixa: media
  - arquivo: "tests/rotas.test.ts"
    faixa: media
  - arquivo: "docs/canal-telegram/00-AUDITORIA.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/00-BLOQUEIOS.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/00-DECISOES.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/BRIEFING-BUILDX.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/FECHAMENTO.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/ORQUESTRADOR.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/RELATORIO-FEATURE.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/VERIFICACAO-VISUAL.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/base/00-INDICE.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/base/00-LACUNAS.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/base/dados-segredo-e-ambiente.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/base/rotas-painel-e-testes.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/base/telegram-bot-api.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/base/turno-e-limites.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-01/fases.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-01/sprint.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-01/tasks.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-02/fases.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-02/sprint.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-02/tasks.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-03/fases.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-03/sprint.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-03/tasks.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-04/fases.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-04/sprint.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-04/tasks.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-05/fases.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-05/sprint.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-05/tasks.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-06/fases.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-06/sprint.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-06/tasks.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-07/fases.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-07/sprint.md"
    faixa: baixa
  - arquivo: "docs/canal-telegram/sprint-07/tasks.md"
    faixa: baixa
  - arquivo: "docs/entregas/canal-telegram/ATENCAO.md"
    faixa: baixa
  - arquivo: "docs/entregas/canal-telegram/ENTREGA.md"
    faixa: baixa
  - arquivo: "docs/entregas/canal-telegram/PR.md"
    faixa: baixa
  - arquivo: "docs/entregas/canal-telegram/QA-PACOTE.md"
    faixa: baixa
  - arquivo: "tests/apoio/servir-telegram-falso.ts"
    faixa: baixa
  - arquivo: "tests/apoio/telegram-falso.ts"
    faixa: baixa
  - arquivo: "tests/canais-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/canais-ui.test.tsx"
    faixa: baixa
  - arquivo: "tests/canal-telegram-ciclo.test.ts"
    faixa: baixa
  - arquivo: "tests/canal-telegram-conectar.test.ts"
    faixa: baixa
  - arquivo: "tests/canal-telegram-modelo.test.ts"
    faixa: baixa
  - arquivo: "tests/chat-publico-limites.test.ts"
    faixa: baixa
  - arquivo: "tests/conversas.test.ts"
    faixa: baixa
  - arquivo: "tests/exclusao-mutua.test.ts"
    faixa: baixa
  - arquivo: "tests/projeto.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-acoes.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-comandos.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-envio.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-falso.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-limites.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-resposta.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-token-nao-vaza.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-webhook-base.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram-webhook-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/telegram.test.ts"
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 12
  leitura_rapida: 22
  dispensavel: 60
portao: pronto
desvios: []
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: null
---

# Entrega — Canal Telegram

Entrega aberta: o usuário conecta o token de um bot do Telegram a um agente e passa a conversar com ele pelo aplicativo.

## Estado da entrega

- Branch `feat/canal-telegram`, criada a partir de `feat/chat-embutido` (PRs empilhados; a base foi escolhida pelo pedido do laço).
- A FT-07 depende funcionalmente só da FT-05 (respostas com conhecimento); a FT-06 (chat embutido) é irmã e a branch apenas empilha sobre ela para evitar conflito nos arquivos compartilhados (`abas-do-agente.ts`, `ambiente.ts`, `.env.example`, `next.config.ts`, `proxy.ts`, `chat-publico*`).
- Sem remoto configurado: push e PR não serão feitos.

## Avisos

- O `ORQUESTRADOR.md` ainda não existe (a abertura rodou antes da F1); a linha da branch é acrescentada quando a F4 o gerar.
