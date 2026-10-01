---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
entregue_por: mergex
titulo: Base de conhecimento - video
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/conhecimento-em-video
branch_base: feat/canal-telegram
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
  - "T-03.03: src/lib/midia-formatos.ts (mimeDeMidia) alterado depois da T-02.03, e tests/conhecimento-paginas.test.tsx e tests/painel-de-conhecimento.test.tsx ganharam os quatro campos novos de FonteVisivel para o tsc passar"
  - "T-04.03: src/lib/armazenamento.ts ganhou apagarAudio (apaga só audio/), usado ao fim da transcricao para limpar o audio e manter os segmentos"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: null
---

# Entrega - Base de conhecimento: video

Branch `feat/conhecimento-em-video`, aberta em 2026-09-30 a partir de `feat/canal-telegram` (PRs empilhados; sem remoto configurado).

## Onde esta o que

| O que | Onde |
|---|---|
| Descricao do pull request | PR.md (a gerar) |
| Pacote de QA | QA-PACOTE.md (a gerar) |
| Trabalho de origem | [conhecimento-em-video](../../conhecimento-em-video/) |

## Avisos

- Base `feat/canal-telegram` (ponta da pilha FT-01 a FT-07), embora a FT-08 dependa funcionalmente so da FT-04 (e da FT-02 para a chave do OpenRouter): empilha na ponta para nao haver conflito em arquivos compartilhados (`abas-do-agente`, `ambiente.ts`, `.env.example`, `fontes-fila.ts`, `AdicionarFontes.tsx`, CI).
- `ORQUESTRADOR.md` ainda nao existe (F4 do sprintx); a linha da branch sera acrescentada quando ele for gerado.

## Desvios

- T-03.03: src/lib/midia-formatos.ts (mimeDeMidia) alterado depois da T-02.03, e tests/conhecimento-paginas.test.tsx e tests/painel-de-conhecimento.test.tsx ganharam os quatro campos novos de FonteVisivel para o tsc passar
- T-04.03: src/lib/armazenamento.ts ganhou apagarAudio (apaga só audio/), usado ao fim da transcricao para limpar o audio e manter os segmentos
