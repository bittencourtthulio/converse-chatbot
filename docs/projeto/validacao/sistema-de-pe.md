---
expx_schema: 1
expx_tool: buildx
kind: validacao_parte
projeto_id: plataforma-chatbot-ia
parte: sistema-de-pe
data: 2026-10-01
atendidos: 23
parciais: 1
nao_atendidos: 0
descartados: 0
---

# Validação B6: o sistema de pé (clone limpo)

Ambiente: clone limpo de `feat/operacao-e-backup` (commit 8c38b83) em diretório temporário, `DATABASE_URL` para arquivo dentro do clone, `JWT_SECRET` e `ENCRYPTION_KEY` gerados na hora e passados inline, `NODE_ENV=production` no servidor (`next start` em porta livre), OpenRouter simulado do projeto (`tests/apoio/servir-falso.ts`) em `OPENROUTER_BASE_URL`. Toda a verificação HTTP foi feita com `fetch` e jarra de cookies, enviando os formulários das server actions sem JavaScript (campos ocultos `$ACTION_*` lidos do HTML). Nenhum segredo foi gravado em arquivo. O clone e os temporários foram apagados ao final.

## Passo 3.1: construção e suíte

| ID | Item | Conclusão | Comando e resposta observada | Observação |
|---|---|---|---|---|
| S-01 | `npm ci` | atendido | `npm ci`: 0 vulnerabilidades, sai 0 | |
| S-02 | `npx prisma generate` | atendido | `Generated Prisma Client (7.10.0)` | |
| S-03 | `npx prisma migrate deploy` | atendido | `All migrations have been successfully applied` (inclui `20261002000000_privacidade_e_auditoria`) | |
| S-04 | `npm run db:seed` | atendido | cria admin, usuário, agente de exemplo, fonte processada, chat publicado e 2 conversas | |
| S-05 | `npx tsc --noEmit` | atendido | sem saída, sem erro | |
| S-06 | `npm run lint` | atendido | `eslint .` sem saída de erro | |
| S-07 | `npm run build` | atendido | build Next 16.3.8 concluído, rotas listadas (`/widget.js` estática, o resto dinâmico) | |
| S-08 | `npm audit --audit-level=high` | atendido | `found 0 vulnerabilities` | |
| S-09 | `npm test` (uma vez, sozinho) | atendido | `Test Files 243 passed (243); Tests 2863 passed, 9 skipped; 632 s`, sem `database is locked` nem estouro de tempo, apesar da carga alheia (load 13 a 15). O stderr traz só ruído do happy-dom ("Iframe page loading is disabled") dos testes do widget | |

## Passo 3.2: HTTP no servidor de produção

| ID | Item | Conclusão | Comando e resposta observada | Observação |
|---|---|---|---|---|
| S-10 | (a) login do admin leva ao painel com título e subtítulo | atendido | POST `/entrar` com `admin@exemplo.local`: 303 para `/`, cookie `expx_sessao`; `GET /` 200 com "Painel" e "Visão geral da sua conta." | |
| S-11 | (b) admin cadastra segundo usuário e ele entra | atendido | form de `/configuracoes/usuarios`: 200 e a lista passa a ter `maria@exemplo.local`; login da Maria: 303 para `/`, `GET /` 200 | |
| S-12 | (c) usuário comum sem acesso às 5 telas, pelo servidor | atendido | com o cookie da Maria, `GET /configuracoes/{usuarios,integracoes,privacidade,auditoria,sistema}`: todas `307` para `/` (o admin recebe `200` nas cinco). A navegação da Maria é "Painel, Agentes, Conversas, Configurações, Meu perfil" e não traz os cinco itens | SEGURANCA: sim. Negação vem do servidor (redirecionamento), não do menu |
| S-13 | (d) `/perfil` edita nome e e-mail | atendido | form de `/perfil`: 200 "atualizado"; releitura mostra "Maria Editada" e `maria2@exemplo.local`; novo login com o e-mail novo funciona | |
| S-14 | (e) `/perfil/senha` exige a atual, troca, entra com a nova, sessão antiga invalidada (L4) | atendido | senha atual errada: 200 "incorreta" (não troca); troca correta: 200; cookie anterior: `/perfil` 307 para `/entrar`, `/` 307 para `/entrar`, API 401; login com a senha antiga: "incorretos"; login com a nova: 303 para `/` e `/perfil` 200 | SEGURANCA: sim. Ver achado A-1 (janela de 1 s) |
| S-15 | (f) limite de tentativas no login | atendido | 9 tentativas erradas seguidas para o mesmo e-mail: 2 respostas "incorretos", da 3ª em diante "Muitas tentativas de entrada"; a senha certa durante o bloqueio também é recusada ("Muitas tentativas"); após cerca de 70 s volta a entrar (303) | SEGURANCA: sim |
| S-16 | (g) `/api/saude` | atendido | `200 {"status":"ok"}` (mínimo, sem detalhes) | |
| S-17 | (h) `GET /widget.js` | atendido | `200`, `content-type: application/javascript; charset=utf-8`, `cache-control: public, max-age=300`, `access-control-allow-origin: *`, `nosniff` | |
| S-18 | (h) `/embed/<id>` com CSP `frame-ancestors` | atendido | `/embed/agente-de-exemplo`: 200 com `content-security-policy: frame-ancestors *`, sem `X-Frame-Options` (para poder ser embutido) | SEGURANCA: sim. Com a lista de domínios vazia a política é `*`; o POST público com `Origin: https://evil.example` devolve 403 |
| S-19 | (h) página de agente inexistente neutra | atendido | `/embed/nao-existe`: 404 com `frame-ancestors 'self'` e corpo só "Converse"; `/agentes/nao-existe` (admin): 404 com corpo só "Converse"; `/api/publico/agentes/nao-existe/config`: 404 "Este assistente não está disponível." | |
| S-20 | (i) APIs protegidas sem sessão: 401; chat público de agente inativo: 404 | atendido | sem cookie, 401 em POST `/api/agentes/:id/conversar`, GET e POST `.../fontes`, POST `.../buscar`, POST `.../fontes/texto`, GET `/api/conversas/:id/exportar`, POST `/api/titulares/exportar`, GET `/api/backups/:nome` (os 405 são método errado). Agente criado e sem chat publicado: `POST /api/publico/agentes/:id/conversar`, `GET .../config` e `/embed/:id` dão 404 | SEGURANCA: sim |
| S-21 | (j) cabeçalhos de segurança nas páginas | atendido | `/entrar` e `/api/saude`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restritiva | |

## Passo 3.3: fluxo de IA (OpenRouter simulado)

| ID | Item | Conclusão | Comando e resposta observada | Observação |
|---|---|---|---|---|
| S-22 | salvar chave em Integrações (mascarada) e conversar com o agente de exemplo (stream, fontes) | atendido | form de `/configuracoes/integracoes` com a chave de teste: a tela passa a mostrar só `sk-or-…0000`, sem a chave inteira no HTML. `POST /api/agentes/agente-de-exemplo/conversar`: 200 `text/event-stream` com 7 eventos `trecho`, evento `fontes` (fonte "Política de troca e horário da Loja Exemplo", trechos) | |
| S-23 | chat público do agente de exemplo responde | atendido | `POST /api/publico/agentes/agente-de-exemplo/conversar` com `visitanteId` UUID: 200 SSE com `trecho`, `fontes` e `fim` (`conversaId`) | |
| S-24 | Chrome: painel e login nos dois temas e a 375 px | parcial | não verificado: não abri navegador (máquina compartilhada com carga alta e a verificação de navegador é opcional); a verificação visual não foi feita | |

## Achados

| ID | Severidade | Segurança | Resolvível por trabalho novo | O que fazer |
|---|---|---|---|---|
| A-1 | baixa | não (é falha de usabilidade na troca de senha, a invalidação em si funciona) | sim | `trocarSenha` (`src/servicos/perfil.ts`, linhas 88 a 105) fixa o corte em `agora + 1 s`; um login feito no mesmo segundo da troca (observado: login 303 e `/perfil` 307 para `/entrar` logo depois da troca) nasce com `iat` menor que o corte e é derrubado. Repetido após 70 s, o login com a senha nova funcionou normalmente. Corrigir emitindo o token do login com `iat` não menor que o corte vigente, ou comparando com `<=` somente quando o token for posterior à troca |
| A-2 | baixa | não | depende de recurso externo | Verificação visual no Chrome (dois temas e 375 px) não foi executada nesta rodada; fica como não verificada |
