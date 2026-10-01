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
commits:
- task: T-01.01
  commit: f9b1271
- task: T-01.02
  commit: 7684f1c
- task: T-01.03
  commit: 163283d
- task: T-02.01
  commit: 34365b4
- task: T-02.02
  commit: 43f94ab
- task: T-02.03
  commit: f875967
- task: T-02.04
  commit: 2fc852b
- task: T-02.05
  commit: 506d5db
- task: T-02.06
  commit: 1f77f42
- task: T-03.01
  commit: de9489b
- task: T-03.02
  commit: e6f7c05
- task: T-03.03
  commit: c6187ca
- task: T-03.04
  commit: 7b77658
- task: T-04.01
  commit: 2e453d8
- task: T-04.02
  commit: 324fc26
- task: T-05.01
  commit: 0219e4e
- task: T-05.02
  commit: 61575c1
- task: T-05.03
  commit: b75a640
- task: T-05.04
  commit: d2719c3
- task: T-06.01
  commit: eb8bd6c
- task: T-06.02
  commit: f1640b1
- task: T-06.03
  commit: f3efdc0
- task: T-06.04
  commit: '9521266'
- task: T-06.05
  commit: 653116b
- task: T-07.01
  commit: b37eebb
- task: T-07.02
  commit: 36dffbd
- task: T-07.03
  commit: 5cc8fac
- task: T-07.04
  commit: b4c5490
modulo_afetado: []
arquivos_alterados: []
faixa_atencao: []
raio: null
atencao:
  olho_obrigatorio: 0
  leitura_rapida: 0
  dispensavel: 0
portao: pronto
desvios:
- "suite por task: 18 tasks guardam parcial (subconjunto declarado na linha da task) e 10 guardam verde (T-01.01, T-01.03, T-02.03, T-02.06, T-03.04, T-04.02, T-05.04, T-06.05, T-07.02, T-07.04); a suite inteira rodou verde ao fechar cada sprint e no estado final (2544 testes em 208 arquivos); o portao tratou V2 como aviso, como na FT-09"
- "arquivos alem da lista inicial das tasks, declarados nelas quando surgiram: tests/usuarios-excluir-acao.test.ts, tests/privacidade-acoes.test.ts, tests/titular-acoes.test.ts, src/componentes/exportar-titular.ts, paginas esqueleto da T-06.01, citacoes de linha em tests/projeto.test.ts e docs/stack/CONVENCOES.md"
- "T-01.02 e T-07.01 sem vermelho previo; Apagar minha conversa mantem o id do visitante; verificacao no navegador corrigiu tres defeitos (estouro de Usuarios a 375 px, campo de dias, prefixo de desambiguacao); detalhes em docs/privacidade-e-auditoria/FECHAMENTO.md"
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
