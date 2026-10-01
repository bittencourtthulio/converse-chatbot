---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
entregue_por: mergex
titulo: Sessao e acesso endurecidos
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/sessao-e-acesso-endurecidos
branch_base: buildx/b5-ciclo-2
commits:
  - task: T-01.01
    commit: 5fbd3af
  - task: T-01.02
    commit: 29bbcea
  - task: T-01.03
    commit: a0f9dce
  - task: T-02.01
    commit: a1951b7
  - task: T-02.02
    commit: 2e5fe98
  - task: T-02.03
    commit: 8761cd5
  - task: T-02.04
    commit: 4f4076d
  - task: T-02.05
    commit: 9822a38
  - task: T-02.06
    commit: ffd9c0b
  - task: T-02.07
    commit: 06fa941
  - task: T-02.08
    commit: 26212bf
  - task: T-03.01
    commit: 272f5d4
  - task: T-03.02
    commit: 4837452
  - task: T-03.03
    commit: a4869a6
  - task: T-04.01
    commit: fd89230
  - task: T-04.02
    commit: aed84fb
  - task: T-04.03
    commit: 1d9d43e
  - task: T-04.04
    commit: 06a89ce
  - task: T-04.05
    commit: 4a94a55
  - task: T-05.01
    commit: abcdbe1
  - task: T-05.02
    commit: 38aa45c
  - task: T-05.03
    commit: c32e9e2
  - task: T-05.04
    commit: 2eb33de
  - task: T-06.01
    commit: a92f464
  - task: T-06.02
    commit: 5d8b66d
  - task: T-06.03
    commit: 499e686

modulo_afetado: [apresentacao, aplicacao, infraestrutura, testes, documentacao]
arquivos_alterados:
  - .env.example
  - README.md
  - docs/entregas/sessao-e-acesso-endurecidos/ATENCAO.md
  - docs/entregas/sessao-e-acesso-endurecidos/ENTREGA.md
  - docs/entregas/sessao-e-acesso-endurecidos/PR.md
  - docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md
  - docs/projeto/MAPA.md
  - docs/projeto/PREMISSAS.md
  - docs/projeto/PROJETO.md
  - docs/projeto/RECURSAO.md
  - docs/sessao-e-acesso-endurecidos/00-AUDITORIA.md
  - docs/sessao-e-acesso-endurecidos/00-BLOQUEIOS.md
  - docs/sessao-e-acesso-endurecidos/00-DECISOES.md
  - docs/sessao-e-acesso-endurecidos/BRIEFING-BUILDX.md
  - docs/sessao-e-acesso-endurecidos/FECHAMENTO.md
  - docs/sessao-e-acesso-endurecidos/MUTACOES.md
  - docs/sessao-e-acesso-endurecidos/ORQUESTRADOR.md
  - docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md
  - docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md
  - docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md
  - docs/sessao-e-acesso-endurecidos/base/00-INDICE.md
  - docs/sessao-e-acesso-endurecidos/base/00-LACUNAS.md
  - docs/sessao-e-acesso-endurecidos/base/guardas-de-acesso.md
  - docs/sessao-e-acesso-endurecidos/base/limites-de-uso.md
  - docs/sessao-e-acesso-endurecidos/base/proxy-e-renovacao.md
  - docs/sessao-e-acesso-endurecidos/base/sessao-e-cookie.md
  - docs/sessao-e-acesso-endurecidos/base/testes-expurgo-e-ambiente.md
  - docs/sessao-e-acesso-endurecidos/base/troca-de-senha-e-versao.md
  - docs/sessao-e-acesso-endurecidos/sprint-01/fases.md
  - docs/sessao-e-acesso-endurecidos/sprint-01/sprint.md
  - docs/sessao-e-acesso-endurecidos/sprint-01/tasks.md
  - docs/sessao-e-acesso-endurecidos/sprint-02/fases.md
  - docs/sessao-e-acesso-endurecidos/sprint-02/sprint.md
  - docs/sessao-e-acesso-endurecidos/sprint-02/tasks.md
  - docs/sessao-e-acesso-endurecidos/sprint-03/fases.md
  - docs/sessao-e-acesso-endurecidos/sprint-03/sprint.md
  - docs/sessao-e-acesso-endurecidos/sprint-03/tasks.md
  - docs/sessao-e-acesso-endurecidos/sprint-04/fases.md
  - docs/sessao-e-acesso-endurecidos/sprint-04/sprint.md
  - docs/sessao-e-acesso-endurecidos/sprint-04/tasks.md
  - docs/sessao-e-acesso-endurecidos/sprint-05/fases.md
  - docs/sessao-e-acesso-endurecidos/sprint-05/sprint.md
  - docs/sessao-e-acesso-endurecidos/sprint-05/tasks.md
  - docs/sessao-e-acesso-endurecidos/sprint-06/fases.md
  - docs/sessao-e-acesso-endurecidos/sprint-06/sprint.md
  - docs/sessao-e-acesso-endurecidos/sprint-06/tasks.md
  - docs/stack/CONVENCOES.md
  - docs/stack/LACUNAS.md
  - prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/migration.sql
  - prisma/schema.prisma
  - src/app/(sistema)/configuracoes/auditoria/page.tsx
  - src/app/(sistema)/conversas/[id]/page.tsx
  - src/app/acoes.ts
  - src/app/api/publico/agentes/[id]/conversa/route.ts
  - src/app/renovar-sessao.ts
  - src/app/sessao-servidor.ts
  - src/lib/ambiente.ts
  - src/lib/limite-de-uso.ts
  - src/lib/sessao.ts
  - src/proxy.ts
  - src/servicos/auditoria.ts
  - src/servicos/autenticacao.ts
  - src/servicos/chat-publico.ts
  - src/servicos/expurgo.ts
  - src/servicos/perfil.ts
  - tests/acao-autenticar-limite.test.ts
  - tests/acao-sair.test.ts
  - tests/acao-salvar-senha.test.ts
  - tests/ajuda.ts
  - tests/ambiente-validar.test.ts
  - tests/ambiente.test.ts
  - tests/apoio-login-http.test.ts
  - tests/apoio-next-falso.test.ts
  - tests/apoio/guardas.ts
  - tests/apoio/login-http.ts
  - tests/apoio/next-falso.ts
  - tests/auditoria-guarda.test.ts
  - tests/auditoria.test.ts
  - tests/chat-publico.test.ts
  - tests/conversas-detalhe-guarda.test.tsx
  - tests/expurgo-sessoes.test.ts
  - tests/guardas-arquitetura.test.ts
  - tests/limite-de-uso.test.ts
  - tests/perfil.test.ts
  - tests/projeto.test.ts
  - tests/proxy-renovacao.test.ts
  - tests/publico-conversa-limite.test.ts
  - tests/sessao-cookie.test.ts
  - tests/sessao-esquema.test.ts
  - tests/sessao-fim-a-fim.test.ts
  - tests/sessao-renovacao.test.ts
  - tests/sessao-revogacao.test.ts
  - tests/sessao-token.test.ts
  - tests/sessao-versao.test.ts
faixa_atencao:
  - arquivo: docs/projeto/PREMISSAS.md
    faixa: alta
  - arquivo: docs/projeto/RECURSAO.md
    faixa: alta
  - arquivo: prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/migration.sql
    faixa: alta
  - arquivo: prisma/schema.prisma
    faixa: alta
  - arquivo: src/app/(sistema)/configuracoes/auditoria/page.tsx
    faixa: alta
  - arquivo: src/app/(sistema)/conversas/[id]/page.tsx
    faixa: alta
  - arquivo: src/app/acoes.ts
    faixa: alta
  - arquivo: src/app/api/publico/agentes/[id]/conversa/route.ts
    faixa: alta
  - arquivo: src/app/renovar-sessao.ts
    faixa: alta
  - arquivo: src/app/sessao-servidor.ts
    faixa: alta
  - arquivo: src/lib/ambiente.ts
    faixa: alta
  - arquivo: src/lib/limite-de-uso.ts
    faixa: alta
  - arquivo: src/lib/sessao.ts
    faixa: alta
  - arquivo: src/proxy.ts
    faixa: alta
  - arquivo: src/servicos/auditoria.ts
    faixa: alta
  - arquivo: src/servicos/autenticacao.ts
    faixa: alta
  - arquivo: src/servicos/chat-publico.ts
    faixa: alta
  - arquivo: src/servicos/expurgo.ts
    faixa: alta
  - arquivo: src/servicos/perfil.ts
    faixa: alta
  - arquivo: tests/apoio/guardas.ts
    faixa: alta
  - arquivo: .env.example
    faixa: media
  - arquivo: README.md
    faixa: media
  - arquivo: docs/stack/CONVENCOES.md
    faixa: media
  - arquivo: docs/stack/LACUNAS.md
    faixa: media
  - arquivo: tests/ajuda.ts
    faixa: media
  - arquivo: tests/apoio/login-http.ts
    faixa: media
  - arquivo: tests/apoio/next-falso.ts
    faixa: media
  - arquivo: tests/auditoria.test.ts
    faixa: media
  - arquivo: tests/chat-publico.test.ts
    faixa: media
  - arquivo: tests/perfil.test.ts
    faixa: media
  - arquivo: tests/projeto.test.ts
    faixa: media
  - arquivo: docs/entregas/sessao-e-acesso-endurecidos/ENTREGA.md
    faixa: baixa
  - arquivo: docs/projeto/MAPA.md
    faixa: baixa
  - arquivo: docs/projeto/PROJETO.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/00-AUDITORIA.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/00-BLOQUEIOS.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/00-DECISOES.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/BRIEFING-BUILDX.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/FECHAMENTO.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/MUTACOES.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/ORQUESTRADOR.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/00-INDICE.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/00-LACUNAS.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/guardas-de-acesso.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/limites-de-uso.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/proxy-e-renovacao.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/sessao-e-cookie.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/testes-expurgo-e-ambiente.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/base/troca-de-senha-e-versao.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-01/fases.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-01/sprint.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-01/tasks.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-02/fases.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-02/sprint.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-02/tasks.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-03/fases.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-03/sprint.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-03/tasks.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-04/fases.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-04/sprint.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-04/tasks.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-05/fases.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-05/sprint.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-05/tasks.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-06/fases.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-06/sprint.md
    faixa: baixa
  - arquivo: docs/sessao-e-acesso-endurecidos/sprint-06/tasks.md
    faixa: baixa
  - arquivo: tests/acao-autenticar-limite.test.ts
    faixa: baixa
  - arquivo: tests/acao-sair.test.ts
    faixa: baixa
  - arquivo: tests/acao-salvar-senha.test.ts
    faixa: baixa
  - arquivo: tests/ambiente-validar.test.ts
    faixa: baixa
  - arquivo: tests/ambiente.test.ts
    faixa: baixa
  - arquivo: tests/apoio-login-http.test.ts
    faixa: baixa
  - arquivo: tests/apoio-next-falso.test.ts
    faixa: baixa
  - arquivo: tests/auditoria-guarda.test.ts
    faixa: baixa
  - arquivo: tests/conversas-detalhe-guarda.test.tsx
    faixa: baixa
  - arquivo: tests/expurgo-sessoes.test.ts
    faixa: baixa
  - arquivo: tests/guardas-arquitetura.test.ts
    faixa: baixa
  - arquivo: tests/limite-de-uso.test.ts
    faixa: baixa
  - arquivo: tests/proxy-renovacao.test.ts
    faixa: baixa
  - arquivo: tests/publico-conversa-limite.test.ts
    faixa: baixa
  - arquivo: tests/sessao-cookie.test.ts
    faixa: baixa
  - arquivo: tests/sessao-esquema.test.ts
    faixa: baixa
  - arquivo: tests/sessao-fim-a-fim.test.ts
    faixa: baixa
  - arquivo: tests/sessao-renovacao.test.ts
    faixa: baixa
  - arquivo: tests/sessao-revogacao.test.ts
    faixa: baixa
  - arquivo: tests/sessao-token.test.ts
    faixa: baixa
  - arquivo: tests/sessao-versao.test.ts
    faixa: baixa
  - arquivo: docs/entregas/sessao-e-acesso-endurecidos/ATENCAO.md
    faixa: baixa
  - arquivo: docs/entregas/sessao-e-acesso-endurecidos/PR.md
    faixa: baixa
  - arquivo: docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 20
  leitura_rapida: 11
  dispensavel: 63
portao: pronto
desvios:
  - "convencao PEND-10: suite por task registrada como parcial (subconjunto) ou verde (suite inteira); suite inteira verde no fechamento: 261 arquivos, 2993 passed, 9 skipped, 0 failed"
  - "T-02.03 ficou parcial: uma suite inteira teve falha intermitente alheia (tests/embed-pagina.test.ts, PEND-30); reexecutada na T-02.05"
  - "tests/projeto.test.ts alterado na T-01.01 para nao fixar o placar do mapa da FT-11"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-01
atualizado_em: 2026-10-01
entregue_em: 2026-10-01
---

# Entrega: Sessão e acesso endurecidos

Sair encerra a sessão de verdade, quem usa o sistema é renovado até o limite de 12 horas, o login logo depois da troca de senha funciona e o excesso de tentativas de login e de leituras públicas é barrado. Branch `feat/sessao-e-acesso-endurecidos`, a partir de `buildx/b5-ciclo-2`.

## Onde está o quê

| O quê | Onde |
|---|---|
| Descrição do pull request | [PR.md](PR.md) |
| Pacote de QA | [QA-PACOTE.md](QA-PACOTE.md) |
| Classificação da atenção | [ATENCAO.md](ATENCAO.md) |
| Trabalho de origem | [docs/sessao-e-acesso-endurecidos](../../sessao-e-acesso-endurecidos) |
| Pull request | não aberto (sem remoto) |

## Estado da entrega

- Portão de prontidão: PRONTO (V2 lido como aviso pela convenção PEND-10)
- Commits: 26 tasks, um por task, mais os de abertura, plano e fechamento
- Atenção humana: 20 olho obrigatório, 11 leitura rápida, 63 dispensável
- Push: não feito — sem remoto configurado (PEND-05); nada foi empurrado nem forçado
- Pull request: não aberto (sem ferramenta de PR nem remoto; a descrição está em `PR.md`)
- Falta para o merge: revisão humana, execução do pacote de QA e a decisão de abrir o PR quando houver remoto

## Avisos

- `docs/legado/PERFIL.md` não existe: sem zona de risco nem raio; a classificação veio do tipo de arquivo e da evidência das tasks.
- O agente `revisor-diff` não existe neste harness: a classificação foi feita pelo executor.
- PEND-30 (teste intermitente alheio, `tests/embed-pagina.test.ts`) é da FT-13; PEND-31 (cookie roubado sem logout) é decisão humana.

## Desvios

Ver o campo `desvios` acima e a seção seguinte.

## Desvios: suíte por task (convenção PEND-10)

Registro `suite` de cada task, como gravado em `tasks.md` (parcial = rodou o subconjunto afetado; verde = rodou a suíte inteira):

- **verde (14 tasks, suíte inteira):** T-01.01, T-02.01, T-02.02, T-02.05, T-02.06, T-02.07, T-02.08, T-03.01, T-03.03, T-04.02, T-04.03, T-04.04, T-05.04, T-06.03.
- **parcial (12 tasks, só teste, documento ou subconjunto):** T-01.02, T-01.03, T-02.03, T-02.04, T-03.02, T-04.01, T-04.05, T-05.01, T-05.02, T-05.03, T-06.01, T-06.02.

A suíte inteira foi executada e ficou verde no fechamento de cada sprint e na T-06.03: 261 arquivos, 2993 passed, 9 skipped, 0 failed. Nenhum `parcial` foi reescrito para `verde`. O V2 do portão foi lido como aviso (PEND-10, opção a). Outros desvios: a T-02.03 ficou `parcial` porque uma execução da suíte inteira teve uma falha intermitente alheia (`tests/embed-pagina.test.ts`, PEND-30, para a FT-13); o teste de fechamento da FT-11 em `tests/projeto.test.ts` foi relaxado na T-01.01.
