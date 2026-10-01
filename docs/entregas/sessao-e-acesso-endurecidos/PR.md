---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
branch: feat/sessao-e-acesso-endurecidos
branch_base: buildx/b5-ciclo-2
atualizado_em: 2026-10-01
---

# FT-12 — Sessão e acesso endurecidos (projeto plataforma-chatbot-ia)

Sair passa a encerrar a sessão de verdade (o cookie copiado antes do logout deixa de valer), quem usa o sistema não é mais derrubado a cada 15 minutos (a sessão é renovada por atividade, com limite de 12 horas), o login logo depois de trocar a senha funciona, e o excesso de tentativas de login e de leituras públicas da conversa é barrado. Vem dos achados do B6 (PEND-12 a PEND-17): cada proteção tem um teste que falha quando ela é removida.

Este PR está empilhado sobre `buildx/b5-ciclo-2` (que está sobre a FT-11), como os anteriores. Sem remoto configurado: o push e a abertura do PR não foram feitos (`git remote -v` vazio, PEND-05).

## Arquivos alterados

```
./
  M .env.example
  M README.md
docs/entregas/sessao-e-acesso-endurecidos/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/sessao-e-acesso-endurecidos/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A MUTACOES.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VARREDURA-DE-GUARDAS.md
  A VERIFICACAO-VISUAL.md
docs/sessao-e-acesso-endurecidos/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A guardas-de-acesso.md
  A limites-de-uso.md
  A proxy-e-renovacao.md
  A sessao-e-cookie.md
  A testes-expurgo-e-ambiente.md
  A troca-de-senha-e-versao.md
docs/sessao-e-acesso-endurecidos/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/sessao-e-acesso-endurecidos/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/sessao-e-acesso-endurecidos/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/sessao-e-acesso-endurecidos/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/sessao-e-acesso-endurecidos/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/sessao-e-acesso-endurecidos/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/
  M schema.prisma
prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/
  A migration.sql
src/
  M proxy.ts
src/app/
  M acoes.ts
  A renovar-sessao.ts
  M sessao-servidor.ts
src/app/(sistema)/configuracoes/auditoria/
  M page.tsx
src/app/(sistema)/conversas/[id]/
  M page.tsx
src/app/api/publico/agentes/[id]/conversa/
  M route.ts
src/lib/
  M ambiente.ts
  M limite-de-uso.ts
  M sessao.ts
src/servicos/
  M auditoria.ts
  M autenticacao.ts
  M chat-publico.ts
  M expurgo.ts
  M perfil.ts
tests/
  A acao-autenticar-limite.test.ts
  A acao-sair.test.ts
  A acao-salvar-senha.test.ts
  M ajuda.ts
  M ambiente-validar.test.ts
  M ambiente.test.ts
  A apoio-login-http.test.ts
  A apoio-next-falso.test.ts
  A auditoria-guarda.test.ts
  M auditoria.test.ts
  M chat-publico.test.ts
  A conversas-detalhe-guarda.test.tsx
  A expurgo-sessoes.test.ts
  A guardas-arquitetura.test.ts
  M limite-de-uso.test.ts
  M perfil.test.ts
  M projeto.test.ts
  A proxy-renovacao.test.ts
  A publico-conversa-limite.test.ts
  A sessao-cookie.test.ts
  A sessao-esquema.test.ts
  A sessao-fim-a-fim.test.ts
  A sessao-renovacao.test.ts
  A sessao-revogacao.test.ts
  A sessao-token.test.ts
  A sessao-versao.test.ts
tests/apoio/
  A guardas.ts
  A login-http.ts
  A next-falso.ts
```

Total: 94 arquivos.

## Origem

Feature FT-12 `sessao-e-acesso-endurecidos` do projeto `plataforma-chatbot-ia` (origem `recursao`, ciclo 2 do buildx). Realiza PR-12, PR-16, PR-27, PR-31, PR-36 e PR-56; cria PR-101 a PR-104; resolve PEND-12 a PEND-17.

## O que foi testado

- Sessão: token com `jti`, versão e início; `sair` que revoga; renovação com limite absoluto e relógio injetado; troca de senha por contador de versão; cookie (`HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure`, `Max-Age`); expurgo das revogações.
- Borda: ações `sair`, `salvarSenha` e `autenticar` (limite de login), renovação no proxy, limite do GET público da conversa, `auditoria.listar` e página de detalhe com guarda própria, teste de arquitetura das telas e rotas.
- Ponta a ponta contra `next start` (login real, troca de senha e login imediato, logout e cookie roubado, renovação do ativo e queda do inativo).
- 32 mutações temporárias registradas (`docs/sessao-e-acesso-endurecidos/MUTACOES.md`, copiadas no `ENTREGA.md`).
- Suíte inteira: 261 arquivos, 2993 passed, 9 skipped, 0 failed — `npm test`; `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes.
- Desvio (PEND-10): 14 tasks fecharam com a suíte inteira (`suite: verde`) e 12 só com o subconjunto (`suite: parcial`, tasks só de teste ou documento); a suíte inteira do fechamento está verde. Registro por task no `ENTREGA.md`.

## Como reverter

Reverter os commits. A migração `20261003000000_sessao_e_acesso_endurecidos` só acrescenta (tabela `sessoes_revogadas`, coluna `usuarios.versaoDaSessao`); o código antigo ignora ambas. Efeitos que o versionador não desfaz: as sessões emitidas por esta versão têm `jti` e as emitidas antes não (cada pessoa entra uma vez de novo na atualização); revogações já gravadas ficam no banco até o expurgo.

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 10 casos. Colaterais a observar: tela de login e Painel nos dois temas e a 375 px, trocar nome e e-mail do perfil, chat embutido, Conversas e Auditoria, envio de arquivo (só enviar arquivo não renova a sessão).

## Onde eu quero seu olho

Classificação completa e justificada em [ATENCAO.md](ATENCAO.md): 20 em olho obrigatório, 11 em leitura rápida, 63 dispensáveis.

### OLHO OBRIGATÓRIO — ler linha a linha

- `docs/projeto/PREMISSAS.md` — O2: PR-101 a PR-104 são decisões de segurança tomadas em nome do humano (revogação, renovação e limite absoluto, versão de sessão, guarda própria) e a "Realizada em" de…
- `docs/projeto/RECURSAO.md` — O2: PEND-31 (`decisao_humana`) registra o risco aceito do cookie roubado sem logout; PEND-12 a PEND-17 movidas para resolvidas, PEND-30 nova
- `prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/migration.sql` — O3: migração de banco (cria `sessoes_revogadas` e acrescenta `usuarios.versaoDaSessao` com padrão 0; só acrescenta, `tests/migracoes.test.ts` e `tests/sessao-esquema.tes…
- `prisma/schema.prisma` — O3: modelo `SessaoRevogada` e `Usuario.versaoDaSessao`; `sessoesValidasDesde` fica como legado sem leitura (migração só acrescenta)
- `src/app/(sistema)/configuracoes/auditoria/page.tsx` — O4: passa o ator admin a `listar` (1 linha; tamanho não é critério); T-04.03
- `src/app/(sistema)/conversas/[id]/page.tsx` — O4: a página passa a chamar `exigirUsuario()` antes de ler a conversa (1 linha de código; tamanho não é critério); T-04.04 (`tests/conversas-detalhe-guarda.test.tsx`)
- `src/app/acoes.ts` — O4: a ação `sair` passa a revogar o `jti` antes de apagar o cookie; T-03.01 (`tests/acao-sair.test.ts`)
- `src/app/api/publico/agentes/[id]/conversa/route.ts` — O5: rota pública; o GET passa a responder 429 com `Retry-After` acima do limite; T-04.02 (`tests/publico-conversa-limite.test.ts`, contra `next start`)
- `src/app/renovar-sessao.ts` — O4: arquivo novo que reemite o cookie de sessão na resposta do proxy e decide quando NÃO renovar (Server Action, rotas públicas); T-03.03 (`tests/proxy-renovacao.test.ts…
- `src/app/sessao-servidor.ts` — O4: `tokenDaSessao()` lê o cookie de sessão (5 linhas; tamanho não é critério); T-03.01
- `src/lib/ambiente.ts` — O4: variável de segurança nova `SESSAO_MAXIMA_HORAS` (limite absoluto da sessão), validada no start de produção; T-02.02. Dúvida entre L2 e O4 resolvida para a mais rigo…
- `src/lib/limite-de-uso.ts` — O4 (por dúvida): o limitador padrão do login e do chat passa a ler o relógio na hora da chamada; sem o relógio injetado a proteção contra força bruta não é testável; T-0…
- `src/lib/sessao.ts` — O4: o token de sessão (claims `jti`, `v`, `ini`, teto do `exp` pelo limite absoluto, recusa de token sem as claims) e os atributos do cookie; T-02.03 e T-02.04 (`tests/s…
- `src/proxy.ts` — O4 e O5: o proxy passa a renovar o cookie de sessão em toda requisição elegível; o `matcher` não mudou, mas é a fronteira por onde passa tudo; T-03.03
- `src/servicos/auditoria.ts` — O4 e O5: `listar` passa a receber o ator e exigir admin (assinatura pública do serviço muda); T-04.03 (`tests/auditoria-guarda.test.ts`)
- `src/servicos/autenticacao.ts` — O4: validação de sessão (revogação, limite absoluto, versão), `revogarSessao` e `renovarSessaoSePreciso`; T-02.05 a T-02.07 (`tests/sessao-revogacao.test.ts`, `tests/ses…
- `src/servicos/chat-publico.ts` — O5: `retomarConversaDoVisitante` exige `{ ip, limitador }` e aplica o limite por IP e agente (contrato do serviço e comportamento da API pública); T-04.02
- `src/servicos/expurgo.ts` — O7 (efeito irreversível, sem plano de reversão da legadox: tratado aqui por apagar linhas) e O5: o expurgo apaga `sessoes_revogadas` vencidas e o resultado ganha `sessoe…
- `src/servicos/perfil.ts` — O4: troca de senha passa a incrementar `versaoDaSessao` em vez do corte por relógio; T-02.06 (`tests/sessao-versao.test.ts`, `tests/perfil.test.ts`)
- `tests/apoio/guardas.ts` — O4: `ROTAS_PUBLICAS` é a lista que decide quais rotas podem responder sem sessão: política de acesso (arquivo novo de teste, mas é política); T-04.05

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` — L2: variável nova sem valor secreto (`SESSAO_MAXIMA_HORAS`), conferida por `tests/projeto.test.ts` e `tests/a…
- `README.md` — L2: seção "Sessão e acesso" e a linha da variável, conferidas por `tests/projeto.test.ts`; é o que o operador…
- `docs/stack/CONVENCOES.md` — L2: seções novas de sessão e guarda e citações `arquivo:linha` conferidas por `tests/projeto.test.ts`
- `docs/stack/LACUNAS.md` — L2: lacunas 43 a 51 e citações conferidas por `tests/projeto.test.ts`
- `tests/ajuda.ts` — L2: `limparBanco` apaga a tabela nova (1 linha), usada por toda a suíte, verde
- `tests/apoio/login-http.ts` — L3: apoio novo (formulários de Server Action contra `next start`) com `tests/apoio-login-http.test.ts` verde
- `tests/apoio/next-falso.ts` — L3: apoio novo (cookies, cabeçalhos e redirect do Next simulados) com `tests/apoio-next-falso.test.ts` verde
- `tests/auditoria.test.ts` — L2: chamadas de `listar` passam o ator admin (assinatura mudou); asserções preservadas, suíte verde
- `tests/chat-publico.test.ts` — L2: chamadas de `retomarConversaDoVisitante` passam `{ ip, limitador }`; asserções preservadas
- `tests/perfil.test.ts` — L2: a asserção de "senha errada não altera nada" troca `sessoesValidasDesde` por `versaoDaSessao`; mesma inte…
- `tests/projeto.test.ts` — L2: o teste do fechamento da FT-11 deixa de fixar o placar do mapa (altera asserção existente) e entram os te…

### DISPENSÁVEL — a máquina já provou

- `docs/entregas/sessao-e-acesso-endurecidos/` (1 arquivo) — D3: documento do fluxo, sem efeito em execução
- `docs/projeto/` (2 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/` (10 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/base/` (8 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/sprint-01/` (3 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/sprint-02/` (3 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/sprint-03/` (3 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/sprint-04/` (3 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/sprint-05/` (3 arquivos) — D3: documento do fluxo, sem efeito em execução
- `docs/sessao-e-acesso-endurecidos/sprint-06/` (3 arquivos) — D3: documento do fluxo, sem efeito em execução
- `tests/` (21 arquivos) — D1: arquivos de teste que só acrescentam casos; cada proteção tem a mutação que a faz falhar em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`

## Fora de escopo

FT-13 (robustez de mídia, upload e operação; inclui estabilizar `tests/embed-pagina.test.ts`, PEND-30); segundo fator ou ligação da sessão ao IP (PEND-31, decisão humana); confiança no IP atrás de proxy (PEND-11).
