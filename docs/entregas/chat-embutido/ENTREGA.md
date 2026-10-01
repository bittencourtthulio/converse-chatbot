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
estado: aberto
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
modulo_afetado: []
arquivos_alterados: []
faixa_atencao: []
raio: null
atencao:
  olho_obrigatorio: 0
  leitura_rapida: 0
  dispensavel: 0
portao: pronto
desvios: []
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: null
---

# Entrega — Chat embutido por script

Branch aberta pela mergex (E0) antes da F1 do sprintx; base `feat/respostas-com-conhecimento` (PRs empilhados, determinada pelo pedido do buildx; o repositório não tem remoto). Árvore estava limpa. Convenção de nome `feat/<slug>` detectada nas branches existentes.

## Avisos

- A linha da branch está no `ORQUESTRADOR.md` (gerado na F4).
- Convenção de desvios: `suite: verde` só quando a suíte inteira rodou; subconjunto é `parcial` com o subconjunto declarado.

## Desvios

Arquivos além da lista inicial das tasks, declarados nelas quando surgiram (detalhe em `docs/chat-embutido/RELATORIO-FEATURE.md`): `tests/projeto.test.ts` (T-01.04), `src/servicos/chat-publico.ts` (T-03.02), `src/componentes/AvatarDoChat.tsx`, `src/componentes/embed-logica.ts`, `tests/embed-logica.test.ts` (T-04.02), `src/app/embed/[id]/not-found.tsx` e `src/servicos/chat-publico-config.ts` (T-04.04; o `loading.tsx` previsto foi descartado), `tests/apoio/dom.ts` (T-05.02), `src/componentes/publicar-logica.ts` movido para a T-06.01, `src/componentes/PainelDePublicacao.tsx`, `src/componentes/embed-mensagens.ts`, `src/componentes/ChatEmbutido.tsx` (T-06.02), `tests/rotas.test.ts` (T-06.04), `src/estilos/global.css` (T-07.02). A ordem das tasks T-07.01 e T-07.02 foi trocada.

Convenção de `suite`: `verde` só com a suíte inteira rodada na task. Os testes de rota usam o `.next` que existir; a rodada final, depois de `npm run build`, validou a feature inteira (1481 testes).
