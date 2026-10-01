---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
entregue_por: mergex
titulo: Privacidade e auditoria
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/privacidade-e-auditoria
branch_base: feat/historico-de-conversas
commits: []
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
criado_em: 2026-10-01
atualizado_em: 2026-10-01
entregue_em: null
---

# Entrega — Privacidade e auditoria

Branch aberta a partir de `feat/historico-de-conversas` (PRs empilhados, convenção `feat/<slug>` do repositório). Sem remoto: push e PR não serão feitos.

## Avisos

- O `ORQUESTRADOR.md` foi gerado na F4 com a linha da branch.
- Branch base determinada pelo pedido do laço do buildx (a base é a branch da feature de que FT-10 depende).

## Critério da suíte

`suite: parcial` quando a task rodou só os testes do seu assunto e `suite: verde` quando a suíte inteira (`npm test`, depois de `npm run build`) rodou verde; a suíte inteira roda ao fechar toda task que mexe em código compartilhado (serviços, `acoes.ts`, `global.css`, `instrumentation.ts`, esquema) e no fechamento.
