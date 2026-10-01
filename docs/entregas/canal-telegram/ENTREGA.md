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
arquivos_alterados: []
faixa_atencao: []
raio: null
atencao:
  olho_obrigatorio: 0
  leitura_rapida: 0
  dispensavel: 0
portao: null
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
