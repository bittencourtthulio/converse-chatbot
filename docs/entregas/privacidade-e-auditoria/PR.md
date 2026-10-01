---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
branch: feat/privacidade-e-auditoria
branch_base: feat/historico-de-conversas
atualizado_em: 2026-10-01
---

# FT-10 — Privacidade e auditoria (projeto plataforma-chatbot-ia)

O admin passa a definir por quantos dias as conversas ficam guardadas (um expurgo automático apaga as mais antigas, 90 dias por padrão), a excluir definitivamente um usuário da equipe e a consultar um registro, só de leitura, de quem alterou a chave, os usuários, os agentes e os canais. Também atende o titular dos dados (buscar, exportar, apagar), o visitante apaga a própria conversa no chat embutido e um aviso de privacidade padrão vale no chat e no `/start` do Telegram. Isso cumpre PR-18 (dado pessoal) e PR-19 (auditoria) do projeto: sem a trilha ninguém responde "quem mexeu" e sem retenção o dado pessoal fica guardado para sempre.

Este PR está empilhado sobre `feat/historico-de-conversas` (FT-09), como todos os anteriores. Sem remoto configurado: o push e a abertura do PR não foram feitos (`git remote -v` vazio, PEND-05).

## Arquivos alterados

```
./
  M .env.example
  M README.md
docs/entregas/privacidade-e-auditoria/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/privacidade-e-auditoria/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/privacidade-e-auditoria/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A canais-e-conversas.md
  A integracoes-e-agentes.md
  A schema-e-migracoes.md
  A segundo-plano-e-ambiente.md
  A telas-menu-e-publico.md
  A testes-e-ci.md
  A usuarios-e-sessao.md
docs/privacidade-e-auditoria/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/privacidade-e-auditoria/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/privacidade-e-auditoria/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/privacidade-e-auditoria/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/privacidade-e-auditoria/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/privacidade-e-auditoria/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/privacidade-e-auditoria/sprint-07/
  A fases.md
  A sprint.md
  A tasks.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/
  M schema.prisma
prisma/migrations/20261002000000_privacidade_e_auditoria/
  A migration.sql
src/
  M instrumentation.ts
src/app/
  M acoes.ts
src/app/(sistema)/configuracoes/auditoria/
  A layout.tsx
  A loading.tsx
  A page.tsx
src/app/(sistema)/configuracoes/privacidade/
  A layout.tsx
  A loading.tsx
  A page.tsx
src/app/(sistema)/configuracoes/usuarios/
  M LinhaDeUsuario.tsx
src/app/api/publico/agentes/[id]/conversa/
  M route.ts
src/app/api/titulares/exportar/
  A route.ts
src/componentes/
  M ChatEmbutido.tsx
  A FerramentasDoTitular.tsx
  A FiltrosDeAuditoria.tsx
  A FormularioDeRetencao.tsx
  A FormularioDoAvisoPadrao.tsx
  M FormularioDoChat.tsx
  A ListaDeAuditoria.tsx
  A PainelDeDadosPessoais.tsx
  A auditoria-logica.ts
  M embed-logica.ts
  A excluir-usuario-logica.ts
  A exportar-titular.ts
  M itens-de-menu.ts
  A privacidade-logica.ts
src/estilos/
  M global.css
src/lib/
  M ambiente.ts
src/servicos/
  M agentes.ts
  A auditoria-acoes.ts
  A auditoria-ouvintes.ts
  A auditoria.ts
  M canal-telegram.ts
  M chat-publico-config.ts
  M chat-publico.ts
  A expurgo.ts
  M historico.ts
  M integracoes.ts
  A privacidade.ts
  M telegram-atendimento.ts
  A titular.ts
  M usuarios.ts
tests/
  M ajuda.ts
  M ambiente.test.ts
  A auditoria-acoes.test.ts
  A auditoria-agentes.test.ts
  A auditoria-integracoes.test.ts
  A auditoria-logica.test.ts
  A auditoria-ouvintes.test.ts
  A auditoria-somente-acrescimo.test.ts
  A auditoria-ui.test.tsx
  A auditoria-usuarios.test.ts
  A auditoria.test.ts
  A embed-apagar-logica.test.ts
  A embed-apagar-ui.test.tsx
  M embed-logica.test.ts
  A excluir-usuario-logica.test.ts
  A expurgo-agendador.test.ts
  A expurgo.test.ts
  M instrumentacao.test.ts
  M menu.test.ts
  A privacidade-acoes.test.ts
  A privacidade-apoio.test.ts
  A privacidade-aviso-canais.test.ts
  A privacidade-estilos.test.ts
  A privacidade-fim-a-fim.test.ts
  A privacidade-logica.test.ts
  A privacidade-modelo.test.ts
  A privacidade-ui.test.tsx
  A privacidade.test.ts
  M projeto.test.ts
  A publico-apagar-rota.test.ts
  A publico-apagar.test.ts
  M rotas.test.ts
  A titular-acoes.test.ts
  A titular-ui.test.tsx
  A titular.test.ts
  A titulares-exportar-rota.test.ts
  A usuarios-excluir-acao.test.ts
  A usuarios-excluir-ui.test.tsx
  A usuarios-excluir.test.ts
tests/apoio/
  A privacidade.ts
  A semear-privacidade.ts
```

Total: 134 arquivos (97 adicionados, 34 modificados mais os 3 desta entrega: `ATENCAO.md`, `PR.md` e `QA-PACOTE.md`; as contagens por pasta estão na lista).

## Origem

Feature FT-10 `privacidade-e-auditoria` do mapa do projeto (`docs/projeto/MAPA.md`), origem `premissa` (PR-18 e PR-19), planejada em 7 sprints e 28 tasks (`docs/privacidade-e-auditoria/ORQUESTRADOR.md`). Decisões D-00 a D-25 em `docs/privacidade-e-auditoria/00-DECISOES.md`; premissas novas PR-86 a PR-91 e a pendência PEND-08 (base legal e prazos, decisão da empresa).

## O que foi testado

- Auditoria: serviço somente-acréscimo (18 ações fechadas, detalhes sem segredo), ouvintes ligados pela subida, gravação na mesma transação para chave, usuário e exclusão de agente (rollback provado com a auditoria forçada a falhar) e de melhor esforço para o resto; varredura que prova que nada além da purga por idade remove registro.
- Exclusão definitiva de usuário (transação, agentes ao admin, sessão cai, recusas) e sua tela; retenção e aviso padrão; expurgo com testes de fronteira (corte exato, lotes de 500, 1230 conversas, sem expurgo, idempotência) e agendador com relógio injetado.
- Titular (busca por prefixo, exportação, exclusão), rota de exportação e `DELETE` público do visitante contra o servidor de produção, botão do chat embutido, telas de Auditoria e Privacidade.
- Prova ponta a ponta no servidor de produção (`tests/privacidade-fim-a-fim.test.ts`) e verificação no navegador (`docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md`): cada ação aparece na Auditoria, o expurgo rodou sozinho, dois temas e 375 px sem rolagem lateral; achou e corrigiu três defeitos.
- Suíte: 2544 testes em 208 arquivos (293 novos), verde no estado final — `npm test` (os testes de rota exigem `npm run build` antes). Cada task registra `suite: parcial` (subconjunto) ou `verde` (suíte inteira); a suíte inteira rodou verde ao fechar cada sprint. `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes.

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 24 casos, com as contas de demonstração.
Colaterais a observar: Conversas, Painel inicial, Usuários (Desativar), Integrações, exclusão de agente, aba Publicar e o chat embutido, aba Canais.

## Onde eu quero seu olho

Classificação por evidência (sem modo legado, sem raio, sem `revisor-diff`: aplicada pelo executor, que escreveu o código; leia a primeira faixa sem confiar na justificativa). Detalhe de cada arquivo em [ATENCAO.md](ATENCAO.md).

### OLHO OBRIGATÓRIO — ler linha a linha (32 arquivos)

- `docs/projeto/PREMISSAS.md` — O2 regra de negócio: PR-86 a PR-91 (retenção de 90 dias, falha de auditoria, exclusão de usuário, titular, aviso e base legal provisória) são decisões tomadas em nome do 
- `prisma/migrations/20261002000000_privacidade_e_auditoria/migration.sql` — O3 migração de banco: só acrescenta (sem DROP, provado por `tests/migracoes.test.ts`)
- `prisma/schema.prisma` — O3 migração de banco: tabela `registros_de_auditoria` e três colunas novas em `configuracao_do_workspace`
- `src/app/(sistema)/configuracoes/auditoria/layout.tsx` — O4 autorização: a guarda de admin da tela fica aqui, acima do `loading.tsx` (307 verdadeiro)
- `src/app/(sistema)/configuracoes/auditoria/page.tsx` — O4: página só de admin com dado pessoal (rótulos "Nome <e-mail>")
- `src/app/(sistema)/configuracoes/privacidade/layout.tsx` — O4 autorização: a guarda de admin da tela fica aqui, acima do `loading.tsx` (307 verdadeiro)
- `src/app/(sistema)/configuracoes/privacidade/page.tsx` — O4: página só de admin que monta retenção, aviso, painel e ferramentas do titular
- `src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx` — O4 e efeito irreversível: o botão e a confirmação (digitar o e-mail) da exclusão definitiva
- `src/app/acoes.ts` — O4 autorização: ações de servidor novas (excluir usuário, retenção, aviso, busca e apagar titular), todas com guarda de admin
- `src/app/api/publico/agentes/[id]/conversa/route.ts` — O5 contrato público: método `DELETE` novo sem sessão, protegido por `X-Visitante-Id`, `Origin` e limite de uso
- `src/app/api/titulares/exportar/route.ts` — O5 contrato público e O4: rota nova que entrega dados pessoais
- `src/componentes/ChatEmbutido.tsx` — O4 dado pessoal: o visitante apaga a própria conversa (confirmação em dois passos, DELETE, limpa o estado local)
- `src/componentes/FerramentasDoTitular.tsx` — O4 e efeito irreversível: busca, exporta e apaga os dados de uma pessoa
- `src/componentes/PainelDeDadosPessoais.tsx` — O4: texto de privacidade mostrado ao admin (campos por canal, finalidade, base legal "a confirmar")
- `src/componentes/embed-logica.ts` — O4 e O5: endereço e chamada `DELETE` com o id do visitante no cabeçalho, máquina de confirmação e tradução de erro
- `src/componentes/exportar-titular.ts` — O4 dado pessoal: baixa a exportação por `fetch` e blob
- `src/componentes/privacidade-logica.ts` — O4: texto fixo do painel de dados pessoais e a base legal, mais as regras de retenção e de confirmação do titular
- `src/instrumentation.ts` — O2: a subida do servidor passa a ligar a auditoria e a iniciar o expurgo, que apaga dados
- `src/servicos/agentes.ts` — O2 e efeito irreversível: a exclusão de agente agora é transacional com a auditoria (lê nome e contagens antes de apagar)
- `src/servicos/auditoria-acoes.ts` — O4: define o que pode ou não entrar nos detalhes (nenhum segredo, texto de conversa nem identificador) e recusa valor que parece segredo
- `src/servicos/auditoria-ouvintes.ts` — O4: liga a auditoria aos pontos de extensão (idempotente, `globalThis`)
- `src/servicos/auditoria.ts` — O4 dado pessoal e autorização: grava o rótulo "Nome <e-mail>"
- `src/servicos/canal-telegram.ts` — O4: ouvintes de canal em `globalThis`
- `src/servicos/chat-publico-config.ts` — O5 contrato público: o aviso de privacidade entregue ao visitante agora cai no padrão do workspace
- `src/servicos/chat-publico.ts` — O5 contrato público e O4: o visitante apaga a própria conversa (só as dele, agente ativo, limite de uso, erro sanitizado)
- `src/servicos/expurgo.ts` — O2 e efeito irreversível: apaga conversas, dedupe do Telegram e auditoria em lotes
- `src/servicos/historico.ts` — O4 dado pessoal e efeito irreversível: `apagarConversasDe` (titular e visitante), ouvintes em `globalThis`, `origem` e `usuarioId` anulável no evento
- `src/servicos/integracoes.ts` — O4 segredo: troca e remoção da chave do OpenRouter na mesma transação da auditoria, que nunca recebe chave, máscara nem texto cifrado
- `src/servicos/privacidade.ts` — O2 regra de negócio e O4: retenção (7 a 3650 dias, nulo = sem expurgo) e aviso padrão, só admin, com confirmação de risco
- `src/servicos/telegram-atendimento.ts` — O5 e O4: o `/start` do Telegram passa a anexar o aviso padrão e o link à resposta enviada ao usuário
- `src/servicos/titular.ts` — O4 dado pessoal: busca, exporta e apaga os dados de uma pessoa
- `src/servicos/usuarios.ts` — O4 autorização e efeito irreversível: `excluirDefinitivamente` (só admin ativo, nunca a si mesmo nem o último admin) transfere agentes, apaga a conta e derruba sessões

### LEITURA RÁPIDA — conferir intenção, não implementação (27 arquivos)

- `.env.example` — L2: documenta a variável nova, sem valor secreto (`tests/projeto.test.ts` confere)
- `README.md` — L2: seção "Privacidade e auditoria" e a variável nova, conferidas por `tests/projeto.test.ts`
- `docs/projeto/MAPA.md` — L2: FT-10 entregue e contadores (documento do laço do buildx)
- `docs/projeto/PROJETO.md` — L2: só o contador de features entregues
- `docs/projeto/RECURSAO.md` — L2: PEND-08 (base legal e prazos) e a PEND-07 com as telas da FT-10
- `docs/stack/CONVENCOES.md` — L2: oito linhas novas com arquivo e linha, conferidas por `tests/projeto.test.ts`, e citações de linha refeitas
- `docs/stack/LACUNAS.md` — L2: lacunas 28 a 33 e a resolução da 25, conferidas por teste
- `src/app/(sistema)/configuracoes/auditoria/loading.tsx` — L3: estado de carregamento, arquivo novo igual ao das outras telas
- `src/app/(sistema)/configuracoes/privacidade/loading.tsx` — L3: estado de carregamento, arquivo novo igual ao das outras telas
- `src/componentes/FiltrosDeAuditoria.tsx` — L3: formulário GET novo
- `src/componentes/FormularioDeRetencao.tsx` — L3: componente novo
- `src/componentes/FormularioDoAvisoPadrao.tsx` — L3: componente novo com teste de marcação
- `src/componentes/FormularioDoChat.tsx` — L2: só o texto de ajuda do aviso do agente ("em branco vale o padrão do workspace")
- `src/componentes/ListaDeAuditoria.tsx` — L3: componente novo, só leitura, texto escapado pelo React, sem controle de editar ou apagar (`tests/auditoria-ui.test.tsx`)
- `src/componentes/auditoria-logica.ts` — L3: módulo puro novo (frases em português por ação), coberto por `tests/auditoria-logica.test.ts`
- `src/componentes/excluir-usuario-logica.ts` — L3: regra pura da confirmação do e-mail, coberta por teste
- `src/componentes/itens-de-menu.ts` — L2: dois itens somente-admin
- `src/estilos/global.css` — L2: seção nova de privacidade e auditoria e o ajuste que tira o estouro lateral de Usuários a 375 px
- `src/lib/ambiente.ts` — L2: getter novo `auditoriaRetencaoDias` (padrão 365) numa camada com cobertura (`tests/ambiente.test.ts`)
- `tests/ajuda.ts` — L2: `limparBanco` passa a apagar a tabela nova antes das demais
- `tests/apoio/privacidade.ts` — L3: apoio de teste novo (conversas em lote com instante exato e registros de auditoria)
- `tests/apoio/semear-privacidade.ts` — L3: script novo de semeadura fictícia para a verificação
- `tests/embed-logica.test.ts` — L2: muda uma asserção existente (o campo novo `apagar` em `enderecosDoEmbed`), de propósito
- `tests/instrumentacao.test.ts` — L2: acrescenta casos da subida (auditoria e expurgo) e ajusta o `afterEach`
- `tests/menu.test.ts` — L2: acrescenta casos e atualiza a lista esperada do grupo Configurações
- `tests/projeto.test.ts` — L2: acrescenta o bloco da FT-10 e refaz citações de linha existentes (mudam asserções existentes porque as linhas se deslocaram)
- `tests/rotas.test.ts` — L2: acrescenta as duas rotas à lista sem sessão e casos de usuário comum e admin

### DISPENSÁVEL — a máquina já provou (75 arquivos)

- 33 arquivos de teste novos (ou que só acrescentam casos): nenhuma asserção existente alterada.
- 42 artefatos do método (plano, base, decisões, relatórios e a própria entrega), não são código.
