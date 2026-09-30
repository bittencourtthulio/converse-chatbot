---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
entregue_por: mergex
titulo: Conversa de teste com o agente
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/conversa-de-teste
branch_base: feat/agentes-e-openrouter
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
desvios:
  - "T-06.01: src/componentes/itens-de-menu.ts (tipo NomeDeIcone ganhou enviar e parar), src/componentes/estado-da-conversa.ts e tests/estado-da-conversa.test.ts (acao recusada: envio recusado antes do stream desfaz as duas bolhas) — nao previstos"
  - "T-05.01: o criterio de dangerouslySetInnerHTML admite o script constante do tema em src/app/layout.tsx (preexistente)"
  - "T-03.01: tests/apoio/chat.ts (arquivo novo: cenario e coletor de eventos reutilizaveis pelos testes do chat, FT-06 e FT-07, nao previsto)"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: null
---

# Entrega — Conversa de teste com o agente

Trabalho aberto. Branch `feat/conversa-de-teste`, a partir de `feat/agentes-e-openrouter` (PRs empilhados; convenção `feat/` do repositório vence o padrão `feature/`).

## Avisos

- A base da branch foi determinada pelo pedido do buildx (branch da feature de que depende), não por `origin/HEAD` (não há remoto).
- O `ORQUESTRADOR.md` ainda não existe na abertura (o laço do buildx abre a branch antes da F1); a linha da branch entra nele na F4.
