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
estado: entregue
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
modulo_afetado:
- apresentacao
- aplicacao
- banco
- testes
- documentacao
arquivos_alterados:
- .env.example
- README.md
- docs/entregas/privacidade-e-auditoria/ATENCAO.md
- docs/entregas/privacidade-e-auditoria/ENTREGA.md
- docs/entregas/privacidade-e-auditoria/PR.md
- docs/entregas/privacidade-e-auditoria/QA-PACOTE.md
- docs/privacidade-e-auditoria/00-AUDITORIA.md
- docs/privacidade-e-auditoria/00-BLOQUEIOS.md
- docs/privacidade-e-auditoria/00-DECISOES.md
- docs/privacidade-e-auditoria/BRIEFING-BUILDX.md
- docs/privacidade-e-auditoria/FECHAMENTO.md
- docs/privacidade-e-auditoria/ORQUESTRADOR.md
- docs/privacidade-e-auditoria/RELATORIO-FEATURE.md
- docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md
- docs/privacidade-e-auditoria/base/00-INDICE.md
- docs/privacidade-e-auditoria/base/00-LACUNAS.md
- docs/privacidade-e-auditoria/base/canais-e-conversas.md
- docs/privacidade-e-auditoria/base/integracoes-e-agentes.md
- docs/privacidade-e-auditoria/base/schema-e-migracoes.md
- docs/privacidade-e-auditoria/base/segundo-plano-e-ambiente.md
- docs/privacidade-e-auditoria/base/telas-menu-e-publico.md
- docs/privacidade-e-auditoria/base/testes-e-ci.md
- docs/privacidade-e-auditoria/base/usuarios-e-sessao.md
- docs/privacidade-e-auditoria/sprint-01/fases.md
- docs/privacidade-e-auditoria/sprint-01/sprint.md
- docs/privacidade-e-auditoria/sprint-01/tasks.md
- docs/privacidade-e-auditoria/sprint-02/fases.md
- docs/privacidade-e-auditoria/sprint-02/sprint.md
- docs/privacidade-e-auditoria/sprint-02/tasks.md
- docs/privacidade-e-auditoria/sprint-03/fases.md
- docs/privacidade-e-auditoria/sprint-03/sprint.md
- docs/privacidade-e-auditoria/sprint-03/tasks.md
- docs/privacidade-e-auditoria/sprint-04/fases.md
- docs/privacidade-e-auditoria/sprint-04/sprint.md
- docs/privacidade-e-auditoria/sprint-04/tasks.md
- docs/privacidade-e-auditoria/sprint-05/fases.md
- docs/privacidade-e-auditoria/sprint-05/sprint.md
- docs/privacidade-e-auditoria/sprint-05/tasks.md
- docs/privacidade-e-auditoria/sprint-06/fases.md
- docs/privacidade-e-auditoria/sprint-06/sprint.md
- docs/privacidade-e-auditoria/sprint-06/tasks.md
- docs/privacidade-e-auditoria/sprint-07/fases.md
- docs/privacidade-e-auditoria/sprint-07/sprint.md
- docs/privacidade-e-auditoria/sprint-07/tasks.md
- docs/projeto/MAPA.md
- docs/projeto/PREMISSAS.md
- docs/projeto/PROJETO.md
- docs/projeto/RECURSAO.md
- docs/stack/CONVENCOES.md
- docs/stack/LACUNAS.md
- prisma/migrations/20261002000000_privacidade_e_auditoria/migration.sql
- prisma/schema.prisma
- src/app/(sistema)/configuracoes/auditoria/layout.tsx
- src/app/(sistema)/configuracoes/auditoria/loading.tsx
- src/app/(sistema)/configuracoes/auditoria/page.tsx
- src/app/(sistema)/configuracoes/privacidade/layout.tsx
- src/app/(sistema)/configuracoes/privacidade/loading.tsx
- src/app/(sistema)/configuracoes/privacidade/page.tsx
- src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx
- src/app/acoes.ts
- 'src/app/api/publico/agentes/[id]/conversa/route.ts'
- src/app/api/titulares/exportar/route.ts
- src/componentes/ChatEmbutido.tsx
- src/componentes/FerramentasDoTitular.tsx
- src/componentes/FiltrosDeAuditoria.tsx
- src/componentes/FormularioDeRetencao.tsx
- src/componentes/FormularioDoAvisoPadrao.tsx
- src/componentes/FormularioDoChat.tsx
- src/componentes/ListaDeAuditoria.tsx
- src/componentes/PainelDeDadosPessoais.tsx
- src/componentes/auditoria-logica.ts
- src/componentes/embed-logica.ts
- src/componentes/excluir-usuario-logica.ts
- src/componentes/exportar-titular.ts
- src/componentes/itens-de-menu.ts
- src/componentes/privacidade-logica.ts
- src/estilos/global.css
- src/instrumentation.ts
- src/lib/ambiente.ts
- src/servicos/agentes.ts
- src/servicos/auditoria-acoes.ts
- src/servicos/auditoria-ouvintes.ts
- src/servicos/auditoria.ts
- src/servicos/canal-telegram.ts
- src/servicos/chat-publico-config.ts
- src/servicos/chat-publico.ts
- src/servicos/expurgo.ts
- src/servicos/historico.ts
- src/servicos/integracoes.ts
- src/servicos/privacidade.ts
- src/servicos/telegram-atendimento.ts
- src/servicos/titular.ts
- src/servicos/usuarios.ts
- tests/ajuda.ts
- tests/ambiente.test.ts
- tests/apoio/privacidade.ts
- tests/apoio/semear-privacidade.ts
- tests/auditoria-acoes.test.ts
- tests/auditoria-agentes.test.ts
- tests/auditoria-integracoes.test.ts
- tests/auditoria-logica.test.ts
- tests/auditoria-ouvintes.test.ts
- tests/auditoria-somente-acrescimo.test.ts
- tests/auditoria-ui.test.tsx
- tests/auditoria-usuarios.test.ts
- tests/auditoria.test.ts
- tests/embed-apagar-logica.test.ts
- tests/embed-apagar-ui.test.tsx
- tests/embed-logica.test.ts
- tests/excluir-usuario-logica.test.ts
- tests/expurgo-agendador.test.ts
- tests/expurgo.test.ts
- tests/instrumentacao.test.ts
- tests/menu.test.ts
- tests/privacidade-acoes.test.ts
- tests/privacidade-apoio.test.ts
- tests/privacidade-aviso-canais.test.ts
- tests/privacidade-estilos.test.ts
- tests/privacidade-fim-a-fim.test.ts
- tests/privacidade-logica.test.ts
- tests/privacidade-modelo.test.ts
- tests/privacidade-ui.test.tsx
- tests/privacidade.test.ts
- tests/projeto.test.ts
- tests/publico-apagar-rota.test.ts
- tests/publico-apagar.test.ts
- tests/rotas.test.ts
- tests/titular-acoes.test.ts
- tests/titular-ui.test.tsx
- tests/titular.test.ts
- tests/titulares-exportar-rota.test.ts
- tests/usuarios-excluir-acao.test.ts
- tests/usuarios-excluir-ui.test.tsx
- tests/usuarios-excluir.test.ts
faixa_atencao:
- arquivo: '.env.example'
  faixa: media
- arquivo: 'README.md'
  faixa: media
- arquivo: 'docs/entregas/privacidade-e-auditoria/ATENCAO.md'
  faixa: baixa
- arquivo: 'docs/entregas/privacidade-e-auditoria/ENTREGA.md'
  faixa: baixa
- arquivo: 'docs/entregas/privacidade-e-auditoria/PR.md'
  faixa: baixa
- arquivo: 'docs/entregas/privacidade-e-auditoria/QA-PACOTE.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/00-AUDITORIA.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/00-BLOQUEIOS.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/00-DECISOES.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/BRIEFING-BUILDX.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/FECHAMENTO.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/ORQUESTRADOR.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/RELATORIO-FEATURE.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/00-INDICE.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/00-LACUNAS.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/canais-e-conversas.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/integracoes-e-agentes.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/schema-e-migracoes.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/segundo-plano-e-ambiente.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/telas-menu-e-publico.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/testes-e-ci.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/base/usuarios-e-sessao.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-01/fases.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-01/sprint.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-01/tasks.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-02/fases.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-02/sprint.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-02/tasks.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-03/fases.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-03/sprint.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-03/tasks.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-04/fases.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-04/sprint.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-04/tasks.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-05/fases.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-05/sprint.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-05/tasks.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-06/fases.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-06/sprint.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-06/tasks.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-07/fases.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-07/sprint.md'
  faixa: baixa
- arquivo: 'docs/privacidade-e-auditoria/sprint-07/tasks.md'
  faixa: baixa
- arquivo: 'docs/projeto/MAPA.md'
  faixa: media
- arquivo: 'docs/projeto/PREMISSAS.md'
  faixa: alta
- arquivo: 'docs/projeto/PROJETO.md'
  faixa: media
- arquivo: 'docs/projeto/RECURSAO.md'
  faixa: media
- arquivo: 'docs/stack/CONVENCOES.md'
  faixa: media
- arquivo: 'docs/stack/LACUNAS.md'
  faixa: media
- arquivo: 'prisma/migrations/20261002000000_privacidade_e_auditoria/migration.sql'
  faixa: alta
- arquivo: 'prisma/schema.prisma'
  faixa: alta
- arquivo: 'src/app/(sistema)/configuracoes/auditoria/layout.tsx'
  faixa: alta
- arquivo: 'src/app/(sistema)/configuracoes/auditoria/loading.tsx'
  faixa: media
- arquivo: 'src/app/(sistema)/configuracoes/auditoria/page.tsx'
  faixa: alta
- arquivo: 'src/app/(sistema)/configuracoes/privacidade/layout.tsx'
  faixa: alta
- arquivo: 'src/app/(sistema)/configuracoes/privacidade/loading.tsx'
  faixa: media
- arquivo: 'src/app/(sistema)/configuracoes/privacidade/page.tsx'
  faixa: alta
- arquivo: 'src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx'
  faixa: alta
- arquivo: 'src/app/acoes.ts'
  faixa: alta
- arquivo: 'src/app/api/publico/agentes/[id]/conversa/route.ts'
  faixa: alta
- arquivo: 'src/app/api/titulares/exportar/route.ts'
  faixa: alta
- arquivo: 'src/componentes/ChatEmbutido.tsx'
  faixa: alta
- arquivo: 'src/componentes/FerramentasDoTitular.tsx'
  faixa: alta
- arquivo: 'src/componentes/FiltrosDeAuditoria.tsx'
  faixa: media
- arquivo: 'src/componentes/FormularioDeRetencao.tsx'
  faixa: media
- arquivo: 'src/componentes/FormularioDoAvisoPadrao.tsx'
  faixa: media
- arquivo: 'src/componentes/FormularioDoChat.tsx'
  faixa: media
- arquivo: 'src/componentes/ListaDeAuditoria.tsx'
  faixa: media
- arquivo: 'src/componentes/PainelDeDadosPessoais.tsx'
  faixa: alta
- arquivo: 'src/componentes/auditoria-logica.ts'
  faixa: media
- arquivo: 'src/componentes/embed-logica.ts'
  faixa: alta
- arquivo: 'src/componentes/excluir-usuario-logica.ts'
  faixa: media
- arquivo: 'src/componentes/exportar-titular.ts'
  faixa: alta
- arquivo: 'src/componentes/itens-de-menu.ts'
  faixa: media
- arquivo: 'src/componentes/privacidade-logica.ts'
  faixa: alta
- arquivo: 'src/estilos/global.css'
  faixa: media
- arquivo: 'src/instrumentation.ts'
  faixa: alta
- arquivo: 'src/lib/ambiente.ts'
  faixa: media
- arquivo: 'src/servicos/agentes.ts'
  faixa: alta
- arquivo: 'src/servicos/auditoria-acoes.ts'
  faixa: alta
- arquivo: 'src/servicos/auditoria-ouvintes.ts'
  faixa: alta
- arquivo: 'src/servicos/auditoria.ts'
  faixa: alta
- arquivo: 'src/servicos/canal-telegram.ts'
  faixa: alta
- arquivo: 'src/servicos/chat-publico-config.ts'
  faixa: alta
- arquivo: 'src/servicos/chat-publico.ts'
  faixa: alta
- arquivo: 'src/servicos/expurgo.ts'
  faixa: alta
- arquivo: 'src/servicos/historico.ts'
  faixa: alta
- arquivo: 'src/servicos/integracoes.ts'
  faixa: alta
- arquivo: 'src/servicos/privacidade.ts'
  faixa: alta
- arquivo: 'src/servicos/telegram-atendimento.ts'
  faixa: alta
- arquivo: 'src/servicos/titular.ts'
  faixa: alta
- arquivo: 'src/servicos/usuarios.ts'
  faixa: alta
- arquivo: 'tests/ajuda.ts'
  faixa: media
- arquivo: 'tests/ambiente.test.ts'
  faixa: baixa
- arquivo: 'tests/apoio/privacidade.ts'
  faixa: media
- arquivo: 'tests/apoio/semear-privacidade.ts'
  faixa: media
- arquivo: 'tests/auditoria-acoes.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria-agentes.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria-integracoes.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria-logica.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria-ouvintes.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria-somente-acrescimo.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria-ui.test.tsx'
  faixa: baixa
- arquivo: 'tests/auditoria-usuarios.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria.test.ts'
  faixa: baixa
- arquivo: 'tests/embed-apagar-logica.test.ts'
  faixa: baixa
- arquivo: 'tests/embed-apagar-ui.test.tsx'
  faixa: baixa
- arquivo: 'tests/embed-logica.test.ts'
  faixa: media
- arquivo: 'tests/excluir-usuario-logica.test.ts'
  faixa: baixa
- arquivo: 'tests/expurgo-agendador.test.ts'
  faixa: baixa
- arquivo: 'tests/expurgo.test.ts'
  faixa: baixa
- arquivo: 'tests/instrumentacao.test.ts'
  faixa: media
- arquivo: 'tests/menu.test.ts'
  faixa: media
- arquivo: 'tests/privacidade-acoes.test.ts'
  faixa: baixa
- arquivo: 'tests/privacidade-apoio.test.ts'
  faixa: baixa
- arquivo: 'tests/privacidade-aviso-canais.test.ts'
  faixa: baixa
- arquivo: 'tests/privacidade-estilos.test.ts'
  faixa: baixa
- arquivo: 'tests/privacidade-fim-a-fim.test.ts'
  faixa: baixa
- arquivo: 'tests/privacidade-logica.test.ts'
  faixa: baixa
- arquivo: 'tests/privacidade-modelo.test.ts'
  faixa: baixa
- arquivo: 'tests/privacidade-ui.test.tsx'
  faixa: baixa
- arquivo: 'tests/privacidade.test.ts'
  faixa: baixa
- arquivo: 'tests/projeto.test.ts'
  faixa: media
- arquivo: 'tests/publico-apagar-rota.test.ts'
  faixa: baixa
- arquivo: 'tests/publico-apagar.test.ts'
  faixa: baixa
- arquivo: 'tests/rotas.test.ts'
  faixa: media
- arquivo: 'tests/titular-acoes.test.ts'
  faixa: baixa
- arquivo: 'tests/titular-ui.test.tsx'
  faixa: baixa
- arquivo: 'tests/titular.test.ts'
  faixa: baixa
- arquivo: 'tests/titulares-exportar-rota.test.ts'
  faixa: baixa
- arquivo: 'tests/usuarios-excluir-acao.test.ts'
  faixa: baixa
- arquivo: 'tests/usuarios-excluir-ui.test.tsx'
  faixa: baixa
- arquivo: 'tests/usuarios-excluir.test.ts'
  faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 32
  leitura_rapida: 27
  dispensavel: 75
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
entregue_em: 2026-10-01
---

# Entrega — Privacidade e auditoria

Entregue na branch `feat/privacidade-e-auditoria` (a partir de `feat/historico-de-conversas`), sem remoto: a descrição está em `PR.md` e o pacote de QA em `QA-PACOTE.md`.

## Onde está o quê

| O quê | Onde |
|---|---|
| Descrição do pull request | [PR.md](PR.md) |
| Pacote de QA | [QA-PACOTE.md](QA-PACOTE.md) |
| Classificação da atenção | [ATENCAO.md](ATENCAO.md) |
| Trabalho de origem | [docs/privacidade-e-auditoria](../../privacidade-e-auditoria/ORQUESTRADOR.md) |
| Pull request | não aberto (sem remoto) |

## Estado da entrega

- Portão de prontidão: PRONTO (V2 como aviso: `suite` por task é `parcial` ou `verde`, ver Desvios)
- Commits: 28, um por task, mais os de planejamento, fechamento e registro
- Atenção humana: 32 olho obrigatório, 27 leitura rápida, 75 dispensável
- Push: não feito — `git remote -v` vazio (PEND-05); nenhum repositório remoto foi criado nem credencial pedida
- Pull request: não aberto; a descrição já está em `PR.md`
- Falta para o merge: criar o remoto e abrir o PR a partir de `PR.md`, a revisão humana (leia primeiro a faixa OLHO OBRIGATÓRIO), o QA com o roteiro de 24 casos e a decisão da empresa sobre a base legal e os prazos (PEND-08)

## Critério da suíte

`suite: parcial` quando a task rodou só os testes do seu assunto e `suite: verde` quando a suíte inteira (`npm test`, depois de `npm run build`) rodou verde; a suíte inteira roda ao fechar toda task que mexe em código compartilhado e no fechamento. Estado final: 2544 testes em 208 arquivos, verdes.

## Avisos

- Sem modo legado, sem raio, sem relatório de cobertura e sem agente `revisor-diff`: a classificação de atenção foi aplicada pelo próprio executor.
- A verificação no navegador usou um Chrome sem janela com 375 px emulados (a extensão não conectou); celular real, leitor de tela, Telegram real e o `widget.js` em site de terceiro não foram vistos.
- A primeira tentativa de verificação se conectou por engano a um aplicativo Electron de outro projeto na porta 9333 e foi refeita num Chrome próprio (registrado em `docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md`).

## Desvios

Os desvios, task a task (incluindo `suite: parcial` ou `verde` por task e os arquivos além da lista inicial), estão listados no campo `desvios` acima e em `docs/privacidade-e-auditoria/FECHAMENTO.md`.
