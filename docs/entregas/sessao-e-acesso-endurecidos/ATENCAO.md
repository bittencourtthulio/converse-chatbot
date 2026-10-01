---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
raio: null
olho_obrigatorio: 20
leitura_rapida: 11
dispensavel: 63
atualizado_em: 2026-10-01
---

# Onde gastar atenção — sessao-e-acesso-endurecidos

Branch `feat/sessao-e-acesso-endurecidos` -> `buildx/b5-ciclo-2`. Data: 2026-10-01.

**94 arquivos — 20 olho obrigatório, 11 leitura rápida, 63 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação. Tamanho de diff não é critério. Quase todo o código de produção desta feature é autenticação, sessão ou acesso (O4): é natural que o OLHO OBRIGATÓRIO se concentre em 20 arquivos de `src/`, `prisma/` e documentos de decisão.

Sem modo legado, sem raio calculado e sem agente `revisor-diff` neste harness: a classificação veio do tipo de arquivo e da evidência das tasks, aplicada pelo executor, que escreveu o código e não é imparcial. Leia a faixa DISPENSÁVEL com essa ressalva; os testes novos dispensáveis só valem porque cada um tem a mutação que o faz falhar registrada em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/projeto/PREMISSAS.md` | M | +60/-8 | O2: PR-101 a PR-104 são decisões de segurança tomadas em nome do humano (revogação, renovação e limite absoluto, versão de sessão, guarda própria) e a "Realizada em" de seis premissas mudou |
| `docs/projeto/RECURSAO.md` | M | +19/-9 | O2: PEND-31 (`decisao_humana`) registra o risco aceito do cookie roubado sem logout; PEND-12 a PEND-17 movidas para resolvidas, PEND-30 nova |
| `prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/migration.sql` | A | +15/-0 | O3: migração de banco (cria `sessoes_revogadas` e acrescenta `usuarios.versaoDaSessao` com padrão 0; só acrescenta, `tests/migracoes.test.ts` e `tests/sessao-esquema.test.ts` a cobrem) |
| `prisma/schema.prisma` | M | +18/-2 | O3: modelo `SessaoRevogada` e `Usuario.versaoDaSessao`; `sessoesValidasDesde` fica como legado sem leitura (migração só acrescenta) |
| `src/app/(sistema)/configuracoes/auditoria/page.tsx` | M | +1/-1 | O4: passa o ator admin a `listar` (1 linha; tamanho não é critério); T-04.03 |
| `src/app/(sistema)/conversas/[id]/page.tsx` | M | +5/-1 | O4: a página passa a chamar `exigirUsuario()` antes de ler a conversa (1 linha de código; tamanho não é critério); T-04.04 (`tests/conversas-detalhe-guarda.test.tsx`) |
| `src/app/acoes.ts` | M | +15/-1 | O4: a ação `sair` passa a revogar o `jti` antes de apagar o cookie; T-03.01 (`tests/acao-sair.test.ts`) |
| `src/app/api/publico/agentes/[id]/conversa/route.ts` | M | +5/-2 | O5: rota pública; o GET passa a responder 429 com `Retry-After` acima do limite; T-04.02 (`tests/publico-conversa-limite.test.ts`, contra `next start`) |
| `src/app/renovar-sessao.ts` | A | +47/-0 | O4: arquivo novo que reemite o cookie de sessão na resposta do proxy e decide quando NÃO renovar (Server Action, rotas públicas); T-03.03 (`tests/proxy-renovacao.test.ts`) |
| `src/app/sessao-servidor.ts` | M | +5/-0 | O4: `tokenDaSessao()` lê o cookie de sessão (5 linhas; tamanho não é critério); T-03.01 |
| `src/lib/ambiente.ts` | M | +8/-0 | O4: variável de segurança nova `SESSAO_MAXIMA_HORAS` (limite absoluto da sessão), validada no start de produção; T-02.02. Dúvida entre L2 e O4 resolvida para a mais rigorosa |
| `src/lib/limite-de-uso.ts` | M | +4/-1 | O4 (por dúvida): o limitador padrão do login e do chat passa a ler o relógio na hora da chamada; sem o relógio injetado a proteção contra força bruta não é testável; T-01.01. Sobe por dúvida entre L2 e O4 |
| `src/lib/sessao.ts` | M | +67/-25 | O4: o token de sessão (claims `jti`, `v`, `ini`, teto do `exp` pelo limite absoluto, recusa de token sem as claims) e os atributos do cookie; T-02.03 e T-02.04 (`tests/sessao-token.test.ts`, `tests/sessao-cookie.test.ts`) |
| `src/proxy.ts` | M | +6/-1 | O4 e O5: o proxy passa a renovar o cookie de sessão em toda requisição elegível; o `matcher` não mudou, mas é a fronteira por onde passa tudo; T-03.03 |
| `src/servicos/auditoria.ts` | M | +10/-4 | O4 e O5: `listar` passa a receber o ator e exigir admin (assinatura pública do serviço muda); T-04.03 (`tests/auditoria-guarda.test.ts`) |
| `src/servicos/autenticacao.ts` | M | +70/-11 | O4: validação de sessão (revogação, limite absoluto, versão), `revogarSessao` e `renovarSessaoSePreciso`; T-02.05 a T-02.07 (`tests/sessao-revogacao.test.ts`, `tests/sessao-renovacao.test.ts`, `tests/sessao-versao.test.ts`) |
| `src/servicos/chat-publico.ts` | M | +9/-0 | O5: `retomarConversaDoVisitante` exige `{ ip, limitador }` e aplica o limite por IP e agente (contrato do serviço e comportamento da API pública); T-04.02 |
| `src/servicos/expurgo.ts` | M | +9/-2 | O7 (efeito irreversível, sem plano de reversão da legadox: tratado aqui por apagar linhas) e O5: o expurgo apaga `sessoes_revogadas` vencidas e o resultado ganha `sessoesRevogadas`; T-02.08 (`tests/expurgo-sessoes.test.ts`) |
| `src/servicos/perfil.ts` | M | +7/-12 | O4: troca de senha passa a incrementar `versaoDaSessao` em vez do corte por relógio; T-02.06 (`tests/sessao-versao.test.ts`, `tests/perfil.test.ts`) |
| `tests/apoio/guardas.ts` | A | +128/-0 | O4: `ROTAS_PUBLICAS` é a lista que decide quais rotas podem responder sem sessão: política de acesso (arquivo novo de teste, mas é política); T-04.05 |

## LEITURA RÁPIDA — conferir a intenção

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.env.example` | M | +6/-0 | L2: variável nova sem valor secreto (`SESSAO_MAXIMA_HORAS`), conferida por `tests/projeto.test.ts` e `tests/ambiente.test.ts` |
| `README.md` | M | +10/-0 | L2: seção "Sessão e acesso" e a linha da variável, conferidas por `tests/projeto.test.ts`; é o que o operador segue |
| `docs/stack/CONVENCOES.md` | M | +27/-18 | L2: seções novas de sessão e guarda e citações `arquivo:linha` conferidas por `tests/projeto.test.ts` |
| `docs/stack/LACUNAS.md` | M | +5/-3 | L2: lacunas 43 a 51 e citações conferidas por `tests/projeto.test.ts` |
| `tests/ajuda.ts` | M | +1/-0 | L2: `limparBanco` apaga a tabela nova (1 linha), usada por toda a suíte, verde |
| `tests/apoio/login-http.ts` | A | +61/-0 | L3: apoio novo (formulários de Server Action contra `next start`) com `tests/apoio-login-http.test.ts` verde |
| `tests/apoio/next-falso.ts` | A | +85/-0 | L3: apoio novo (cookies, cabeçalhos e redirect do Next simulados) com `tests/apoio-next-falso.test.ts` verde |
| `tests/auditoria.test.ts` | M | +16/-11 | L2: chamadas de `listar` passam o ator admin (assinatura mudou); asserções preservadas, suíte verde |
| `tests/chat-publico.test.ts` | M | +8/-5 | L2: chamadas de `retomarConversaDoVisitante` passam `{ ip, limitador }`; asserções preservadas |
| `tests/perfil.test.ts` | M | +1/-3 | L2: a asserção de "senha errada não altera nada" troca `sessoesValidasDesde` por `versaoDaSessao`; mesma intenção |
| `tests/projeto.test.ts` | M | +138/-24 | L2: o teste do fechamento da FT-11 deixa de fixar o placar do mapa (altera asserção existente) e entram os testes de citações e de fechamento da FT-12 |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/entregas/sessao-e-acesso-endurecidos/ENTREGA.md` | A | +92/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/projeto/MAPA.md` | M | +7/-4 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/projeto/PROJETO.md` | M | +2/-2 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/00-AUDITORIA.md` | A | +28/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/00-BLOQUEIOS.md` | A | +14/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/00-DECISOES.md` | A | +206/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/BRIEFING-BUILDX.md` | A | +48/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/FECHAMENTO.md` | A | +43/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/MUTACOES.md` | A | +48/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/ORQUESTRADOR.md` | A | +103/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md` | A | +54/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md` | A | +49/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md` | A | +23/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/00-INDICE.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/00-LACUNAS.md` | A | +7/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/guardas-de-acesso.md` | A | +29/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/limites-de-uso.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/proxy-e-renovacao.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/sessao-e-cookie.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/testes-expurgo-e-ambiente.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/base/troca-de-senha-e-versao.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-01/fases.md` | A | +78/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-01/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-01/tasks.md` | A | +111/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-02/fases.md` | A | +115/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-02/sprint.md` | A | +40/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-02/tasks.md` | A | +271/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-03/fases.md` | A | +78/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-03/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-03/tasks.md` | A | +111/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-04/fases.md` | A | +84/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-04/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-04/tasks.md` | A | +175/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-05/fases.md` | A | +81/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-05/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-05/tasks.md` | A | +143/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-06/fases.md` | A | +78/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-06/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `docs/sessao-e-acesso-endurecidos/sprint-06/tasks.md` | A | +111/-0 | D3: documento de plano, auditoria, entrega, verificação ou placar gerado pelo fluxo (sprintx, mergex, buildx), sem efeito em execução |
| `tests/acao-autenticar-limite.test.ts` | A | +109/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/acao-sair.test.ts` | A | +94/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/acao-salvar-senha.test.ts` | A | +61/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/ambiente-validar.test.ts` | M | +9/-0 | D1: só acrescenta casos |
| `tests/ambiente.test.ts` | M | +20/-1 | D1: só acrescenta casos |
| `tests/apoio-login-http.test.ts` | A | +50/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/apoio-next-falso.test.ts` | A | +63/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/auditoria-guarda.test.ts` | A | +39/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/conversas-detalhe-guarda.test.tsx` | A | +52/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/expurgo-sessoes.test.ts` | A | +43/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/guardas-arquitetura.test.ts` | A | +119/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/limite-de-uso.test.ts` | M | +41/-2 | D1: só acrescenta casos |
| `tests/proxy-renovacao.test.ts` | A | +128/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/publico-conversa-limite.test.ts` | A | +77/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/sessao-cookie.test.ts` | A | +45/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/sessao-esquema.test.ts` | A | +76/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/sessao-fim-a-fim.test.ts` | A | +131/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/sessao-renovacao.test.ts` | A | +105/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/sessao-revogacao.test.ts` | A | +81/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/sessao-token.test.ts` | A | +116/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `tests/sessao-versao.test.ts` | A | +79/-0 | D1: arquivo de teste que só acrescenta casos (a mutação temporária que prova a proteção está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`) |
| `docs/entregas/sessao-e-acesso-endurecidos/ATENCAO.md` | A | — | D3: documento da entrega gerado pelo fluxo (mergex), sem efeito em execução |
| `docs/entregas/sessao-e-acesso-endurecidos/PR.md` | A | — | D3: documento da entrega gerado pelo fluxo (mergex), sem efeito em execução |
| `docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md` | A | — | D3: documento da entrega gerado pelo fluxo (mergex), sem efeito em execução |

## Fontes consultadas

- `git diff --name-status` e `--numstat` contra `buildx/b5-ciclo-2` (três pontos): tipo e tamanho de cada arquivo.
- `docs/sessao-e-acesso-endurecidos/sprint-0*/tasks.md`: a task que tocou cada arquivo e os dois testes declarados; suíte inteira verde (2993 testes) no estado final, com `tsc`, `lint`, `build` e `npm audit` verdes.
- `docs/sessao-e-acesso-endurecidos/MUTACOES.md`: a mutação temporária de cada proteção.
- `docs/stack/CONVENCOES.md`: camadas e regra de verificação de citações.
- memox (`.claude/skills/memox/assets/memox.py arquivo`): consultado para cada arquivo de código e documento fora de `docs/sessao-e-acesso-endurecidos/`; nenhum devolveu `regressoes`, `reprovacoes_qa` nem `zona_de_risco`, então O9 não subiu nenhum arquivo.

## Fontes ausentes

- `docs/legado/PERFIL.md`: não há zona de risco declarada; a dimensão O1 não foi avaliada.
- Raio de impacto, testes de caracterização e plano de reversão da legadox: ausentes; O7 e O8 não puderam ser avaliados.
- Relatório de cobertura: o repositório não tem provedor de cobertura (lacuna 2); a cobertura veio das tasks e dos testes nomeados.
