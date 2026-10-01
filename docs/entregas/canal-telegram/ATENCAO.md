---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
raio: null
olho_obrigatorio: 12
leitura_rapida: 22
dispensavel: 60
atualizado_em: 2026-09-30
---

# Onde gastar atenção — canal-telegram

Branch `feat/canal-telegram` -> `feat/chat-embutido`. Data: 2026-09-30.

**94 arquivos — 12 olho obrigatório, 22 leitura rápida, 60 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação. Tamanho de diff não é critério.

Sem modo legado e sem raio calculado, e sem agente `revisor-diff` neste harness: a classificação veio do tipo de arquivo e da evidência das tasks, aplicada pelo executor, que escreveu o código e não é imparcial. Leia a faixa OLHO OBRIGATÓRIO sem confiar na justificativa. Tudo que decide **quem consegue falar com o bot, o que acontece com o token e quanto custa uma mensagem** está em OLHO OBRIGATÓRIO: o adaptador que carrega o token na URL, o serviço de conexão, a autenticação do webhook, o atendimento, os limites, o handler sem sessão, as ações de servidor, a migration e o `exigirTetoDiario`, que o chat embutido (FT-06) também usa. Componentes novos e documentos de convenção em LEITURA RÁPIDA; testes que só acrescentam e artefatos do método em DISPENSÁVEL, porque a suíte de 1730 testes exerce os primeiros e os segundos não são código. Os artefatos do método não casam com D1 a D3 ao pé da letra: D3 foi estendido a documentos gerados pelo próprio método, e isso é uma escolha do executor. O memox não está instalado, então O9 não se aplica. O que a revisão humana não substitui: o Telegram real (PEND-06), a aba Canais a 375 px (PEND-07) e o comportamento do modelo real. Os três últimos arquivos (`ATENCAO.md`, `PR.md`, `QA-PACOTE.md`) entram na conta porque são criados logo depois desta classificação.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `prisma/migrations/20260930220000_canal_telegram/migration.sql` | A | +39/-0 | O3 migração de banco: só `CREATE TABLE` e índices únicos (agente, bot, canal+update); provada do zero por `tests/canal-telegram-modelo.test.ts` e `tests/migracoes.test.ts` |
| `prisma/schema.prisma` | M | +42/-0 | O3 modelos novos `CanalTelegram` e `AtualizacaoTelegram` (cascata com o agente, `botId` único); tem de bater com a migration (`prisma migrate diff` não mostrou diferença) |
| `src/app/acoes.ts` | M | +112/-0 | O4 ações de servidor que lidam com token: `mensagemSemSegredo`, nenhum retorno leva segredo, sessão no servidor; provado por `tests/telegram-acoes.test.ts` |
| `src/app/api/telegram/[agenteId]/webhook/route.ts` | A | +23/-0 | O5 contrato público novo e O4 sem sessão: `POST` do Telegram, 401 sem corpo, 413 acima de 64 KB, 200 imediato e atendimento em `after()`; provado contra o servidor de produção em `tests/telegram-webhook-rota.test.ts` |
| `src/lib/ambiente.ts` | M | +13/-0 | O4 controle de segurança: `TELEGRAM_PERMITIR_URL_NAO_HTTPS` só vale fora de produção; provado por `tests/ambiente.test.ts` |
| `src/lib/telegram.ts` | A | +274/-0 | O4 credencial: o token vai no caminho da URL do Telegram; todo erro nasce de texto fixo, `chamar` descarta o erro original, `redigirToken` e a divisão do texto; provado por `tests/telegram-token-nao-vaza.test.ts` (50 combinações) e `tests/telegram-envio.test.ts` |
| `src/servicos/canal-telegram.ts` | A | +330/-0 | O4 credencial e autorização: formato do token, `APP_URL` HTTPS, token cifrado antes do `setWebhook`, segredo de 32 bytes só em hash, bot único, reconexão gira o segredo, `aoAlterarCanal`; provado por `tests/canal-telegram-conectar.test.ts` e `tests/canal-telegram-ciclo.test.ts` |
| `src/servicos/chat-publico-limites.ts` | M | +4/-3 | O2 mexe numa regra de custo já em produção do chat embutido: `exigirTetoDiario` ganhou o parâmetro de canal (padrão `widget`); os testes antigos passam sem mudar a chamada (`tests/chat-publico-limites.test.ts`) |
| `src/servicos/conversas.ts` | M | +4/-1 | O4 dado pessoal e serviço compartilhado: `criar` ganhou `titulo` opcional (nome público do Telegram); sem ele o título segue derivado da primeira mensagem; provado por `tests/conversas.test.ts` |
| `src/servicos/telegram-atendimento.ts` | A | +235/-0 | O4 e O2 dado pessoal e regra do canal: nome público no título (PR-18), só chat privado, comandos, resposta em texto puro com fontes, falha vira frase única, `ultimoErro` seguro; provado por `tests/telegram-comandos.test.ts`, `tests/telegram-resposta.test.ts` e `tests/telegram-limites.test.ts` |
| `src/servicos/telegram-limites.ts` | A | +52/-0 | O2 regra de limites de uso (PR-16): 10 por minuto por chat, 60 por conversa, teto diário do canal; frases amigáveis; provado por `tests/telegram-limites.test.ts` |
| `src/servicos/telegram-webhook.ts` | A | +190/-0 | O4 autenticação: segredo em tempo constante contra o hash, 401 igual para tudo que não autentica, dedupe por `update_id`, 200 para ilegível; provado por `tests/telegram-webhook-base.test.ts` e contra o servidor de produção em `tests/telegram-webhook-rota.test.ts` |

## LEITURA RÁPIDA — conferir intenção, não implementação

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.env.example` | M | +10/-0 | L2 documentação de ambiente sem valor secreto: `tests/projeto.test.ts` confere as duas variáveis e que a exceção de HTTP vem vazia |
| `README.md` | M | +11/-0 | L2 documentação conferida por `tests/projeto.test.ts` (variáveis, aba Canais, passo a passo, túnel, simulado) |
| `docs/projeto/MAPA.md` | M | +7/-4 | L2 estado da feature no mapa; contadores do frontmatter batem com o painel |
| `docs/projeto/PREMISSAS.md` | M | +108/-4 | L2 premissas PR-63 a PR-70 e as realizações; o campo "O que invalida" é a leitura útil; frontmatter válido |
| `docs/projeto/PROJETO.md` | M | +1/-1 | L2 contador de features entregues |
| `docs/projeto/RECURSAO.md` | M | +3/-3 | L2 PEND-06 e PEND-07 ganharam o Telegram e a aba Canais; sem pendência nova |
| `docs/stack/CONVENCOES.md` | M | +12/-4 | L2 convenções com `arquivo:linha`: cada citação nova é conferida por `tests/projeto.test.ts` |
| `docs/stack/LACUNAS.md` | M | +2/-0 | L2 lacunas conferidas por `tests/projeto.test.ts` (Telegram real, reinício, 375 px) |
| `src/app/(sistema)/agentes/[id]/canais/loading.tsx` | A | +14/-0 | L3 código novo em arquivo novo com os dois testes verdes (estado carregando; coberto pelo roteamento em `tests/rotas.test.ts`) |
| `src/app/(sistema)/agentes/[id]/canais/page.tsx` | A | +58/-0 | L3 código novo em arquivo novo com os dois testes verdes (`tests/rotas.test.ts`, bloco da aba Canais); o estado que chega ao navegador não leva token nem segredo |
| `src/componentes/CartaoTelegram.tsx` | A | +300/-0 | L3 código novo em arquivo novo com os dois testes verdes (`tests/canais-ui.test.tsx`); formulário com token em senha nunca preenchido, conferido também na verificação do navegador |
| `src/componentes/abas-do-agente.ts` | M | +2/-1 | L2 camada isolada com cobertura existente: uma entrada na lista única; `tests/abas-do-agente.test.tsx` e `tests/rotas.test.ts` |
| `src/componentes/canais-logica.ts` | A | +96/-0 | L3 código novo em arquivo novo com os dois testes verdes (`tests/canais-logica.test.ts`); módulo puro sem serviço de valor |
| `src/componentes/canais.ts` | A | +19/-0 | L3 código novo em arquivo novo com os dois testes verdes (`tests/canais-logica.test.ts`) |
| `src/estilos/global.css` | M | +34/-0 | L2 estilos do cartão só com tokens: `tests/tokens.test.ts` (sem cor literal) e `tests/canais-ui.test.tsx` (alvo de 44 px e uma coluna a 480 px) |
| `src/lib/exclusao-mutua.ts` | A | +34/-0 | L3 código novo em arquivo novo com os dois testes verdes (`tests/exclusao-mutua.test.ts`; a fila por chat não decide segurança, só ordem) |
| `tests/abas-do-agente.test.tsx` | M | +8/-7 | L2 altera asserções existentes (a lista passa de quatro para cinco abas); não é só acréscimo |
| `tests/ajuda.ts` | M | +2/-0 | L2 apoio compartilhado por quase todos os testes: `limparBanco` apaga as tabelas novas antes do agente |
| `tests/ambiente.test.ts` | M | +21/-1 | L2 acrescenta casos e alterou a lista de variáveis limpas no `afterEach` |
| `tests/apoio/servidor.ts` | M | +12/-3 | L2 apoio compartilhado dos testes de rota: `capturarLogs` e `logs()` opcionais, sem mudar o uso existente |
| `tests/publicar-rota.test.ts` | M | +2/-2 | L2 altera uma asserção existente (cinco abas), achada pela suíte inteira |
| `tests/rotas.test.ts` | M | +39/-2 | L2 altera uma asserção existente (cinco abas) e acrescenta o bloco da aba Canais |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/canal-telegram/00-AUDITORIA.md` | A | +17/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/00-BLOQUEIOS.md` | A | +14/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/00-DECISOES.md` | A | +103/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/BRIEFING-BUILDX.md` | A | +44/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/FECHAMENTO.md` | A | +36/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/ORQUESTRADOR.md` | A | +104/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/RELATORIO-FEATURE.md` | A | +54/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/VERIFICACAO-VISUAL.md` | A | +42/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/base/00-INDICE.md` | A | +33/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/base/00-LACUNAS.md` | A | +20/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/base/dados-segredo-e-ambiente.md` | A | +34/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/base/rotas-painel-e-testes.md` | A | +36/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/base/telegram-bot-api.md` | A | +43/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/base/turno-e-limites.md` | A | +36/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-01/fases.md` | A | +80/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-01/sprint.md` | A | +39/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-01/tasks.md` | A | +111/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-02/fases.md` | A | +80/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-02/sprint.md` | A | +39/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-02/tasks.md` | A | +111/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-03/fases.md` | A | +80/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-03/sprint.md` | A | +39/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-03/tasks.md` | A | +111/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-04/fases.md` | A | +83/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-04/sprint.md` | A | +39/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-04/tasks.md` | A | +143/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-05/fases.md` | A | +77/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-05/sprint.md` | A | +39/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-05/tasks.md` | A | +79/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-06/fases.md` | A | +77/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-06/sprint.md` | A | +39/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-06/tasks.md` | A | +79/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-07/fases.md` | A | +80/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-07/sprint.md` | A | +39/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/canal-telegram/sprint-07/tasks.md` | A | +111/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/entregas/canal-telegram/ATENCAO.md` | A | a gerar | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/entregas/canal-telegram/ENTREGA.md` | A | +87/-0 | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/entregas/canal-telegram/PR.md` | A | a gerar | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `docs/entregas/canal-telegram/QA-PACOTE.md` | A | a gerar | D3 artefato do método (sprintx, buildx ou mergex) gerado para a entrega, com frontmatter conferido; não é código nem contrato |
| `tests/apoio/servir-telegram-falso.ts` | A | +57/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/apoio/telegram-falso.ts` | A | +280/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/canais-logica.test.ts` | A | +112/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/canais-ui.test.tsx` | A | +201/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/canal-telegram-ciclo.test.ts` | A | +180/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/canal-telegram-conectar.test.ts` | A | +202/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/canal-telegram-modelo.test.ts` | A | +81/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/chat-publico-limites.test.ts` | M | +18/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/conversas.test.ts` | M | +17/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/exclusao-mutua.test.ts` | A | +63/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/projeto.test.ts` | M | +78/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-acoes.test.ts` | A | +202/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-comandos.test.ts` | A | +167/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-envio.test.ts` | A | +116/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-falso.test.ts` | A | +112/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-limites.test.ts` | A | +155/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-resposta.test.ts` | A | +200/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-token-nao-vaza.test.ts` | A | +111/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-webhook-base.test.ts` | A | +163/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram-webhook-rota.test.ts` | A | +174/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |
| `tests/telegram.test.ts` | A | +129/-0 | D1 arquivo de teste que só acrescenta casos ou apoio novo; a suíte inteira (1730) o exercita |

## Fontes consultadas

- `git diff --name-status` e `--numstat` contra `feat/chat-embutido` (três pontos) — arquivos, tipo e tamanho.
- `docs/canal-telegram/sprint-*/tasks.md` — qual task tocou cada arquivo e os dois testes dela.
- `docs/stack/CONVENCOES.md` — camadas, regra de segredo, handler fino.
- Suíte inteira verde no HEAD (1730 testes), `tsc`, `lint`, `build` e `npm audit` — o que a máquina já provou.

## Fontes ausentes

- `docs/legado/PERFIL.md`, raio de impacto, testes de caracterização e plano de reversão (não há modo legado): zonas de risco, O1 por perfil, O7 e O8 não foram avaliados.
- Relatório de cobertura (o projeto não tem provedor de cobertura, lacuna 2 de `docs/stack/LACUNAS.md`): O6 foi avaliado só pelos testes declarados nas tasks.
- memox (não instalado): O9 não foi avaliado.
