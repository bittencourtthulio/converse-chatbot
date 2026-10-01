---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
raio: null
olho_obrigatorio: 19
leitura_rapida: 21
dispensavel: 77
atualizado_em: 2026-09-30
---

# Atenção humana — chat-embutido

Branch `feat/chat-embutido` -> `feat/respostas-com-conhecimento`. Data: 2026-09-30.

**117 arquivos — 19 olho obrigatório, 21 leitura rápida, 77 dispensável**

Sem modo legado e sem raio calculado: a classificação vem do tipo de arquivo e da evidência das tasks (não há agente `revisor-diff` neste harness; a conferência foi feita pelo executor com os critérios do E3, e o autor do código não é imparcial: o revisor deve ler a faixa OLHO OBRIGATÓRIO sem confiar na justificativa). Tudo que decide **quem pode usar o chat e quanto ele custa** fica em OLHO OBRIGATÓRIO: as rotas públicas sem sessão, o `proxy.ts` e os cabeçalhos de segurança, as regras de domínio, os limites de uso, o turno do visitante, o script que roda em site de terceiro e o `postMessage`. Componentes, lógica pura, estilos e a seed, já cobertos por teste, em LEITURA RÁPIDA; testes e documentos em DISPENSÁVEL, porque a suíte de 1481 testes exerce os primeiros. O tamanho do diff não entrou no critério. O memox não estava instalado neste projeto, então o critério O9 (histórico do arquivo) não se aplica. O que a revisão humana não substitui: o widget a 375 px, em site com HTTPS e com CSP própria (PEND-07) e o comportamento do modelo real diante do prompt. Os três últimos arquivos (`ATENCAO.md`, `PR.md`, `QA-PACOTE.md`) entram na conta porque são criados logo depois desta classificação.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `next.config.ts` | M | +11/-5 | O1 cabeçalhos de segurança: `X-Frame-Options: DENY` sai só de /embed por expressão regular; provado em tests/embed-cabecalhos.test.ts e tests/rotas.test.ts |
| `prisma/migrations/20260930210000_configuracao_do_chat/migration.sql` | A | +16/-0 | O3 migração de banco: só `CREATE TABLE` com padrões (ativo desligado, limite 500); provada do zero por tests/migracoes.test.ts e tests/configuracao-do-chat-modelo.test.ts |
| `prisma/schema.prisma` | M | +25/-0 | O3 modelo novo `ConfiguracaoDoChat` (1:1 com o agente, cascata); tem de bater com a migration; provado por tests/configuracao-do-chat-modelo.test.ts |
| `src/app/acoes.ts` | M | +34/-0 | O2 ação de servidor `salvarChat`: sessão no servidor, qualquer usuário autenticado (PR-12), campo ausente vira desligado; provada por tests/publicar-acao.test.ts |
| `src/app/api/publico/agentes/[id]/config/route.ts` | A | +42/-0 | O4 contrato público (config e OPTIONS): só campos visuais, 404 idêntico, CORS pela lista de domínios; provado em tests/publico-config-rota.test.ts |
| `src/app/api/publico/agentes/[id]/conversa/route.ts` | A | +18/-0 | O4 contrato público: o visitante vem no cabeçalho, nunca na URL; só as últimas 50 mensagens do próprio visitante; provado em tests/publico-conversa-rota.test.ts |
| `src/app/api/publico/agentes/[id]/conversar/route.ts` | A | +71/-0 | O4 e O2 primeiro handler público SEM sessão e com SSE: confere `Origin`, limita o corpo, devolve erro só como frase do visitante; provado contra o servidor de produção em tests/publico-conversar-rota.test.ts |
| `src/app/api/publico/resposta.ts` | A | +56/-0 | O1 CORS, `Retry-After` e conferência de `Origin` da plataforma, usados por todas as rotas públicas |
| `src/app/embed/[id]/not-found.tsx` | A | +14/-0 | O1 a mesma mensagem neutra para agente inativo e inexistente, sem nenhum dado; provado em tests/embed-pagina.test.ts |
| `src/app/embed/[id]/page.tsx` | A | +49/-0 | O1 página pública sem login: nada interno no HTML, 404 neutro igual para inativo e inexistente, prévia só com sessão; provada em tests/embed-pagina.test.ts |
| `src/app/eventos-sse.ts` | M | +16/-4 | O4 protocolo SSE: `mapearErro` opcional para o canal público; sem ele o comportamento do painel não muda; provado por tests/eventos-sse.test.ts |
| `src/app/widget.js/route.ts` | A | +23/-0 | O4 contrato do script servido a outros sites: CORS aberto, CORP cross-origin e cache de 5 minutos; provado em tests/widget-rota.test.ts |
| `src/componentes/embed-mensagens.ts` | A | +105/-0 | O1 `postMessage` entre iframe e página: só aceita prévia da mesma origem e saneia cada campo; provado por tests/embed-mensagens.test.ts |
| `src/lib/dominios-permitidos.ts` | A | +113/-0 | O1 decide quem pode emoldurar o chat e receber CORS: sintaxe do host, curinga, porta padrão, cabeçalho `frame-ancestors` que nunca leva texto inválido; provado por tests/dominios-permitidos.test.ts |
| `src/proxy.ts` | A | +28/-0 | O1 primeiro `proxy.ts`: define o `frame-ancestors` por agente e falha fechando (`self`); consulta o banco a cada carregamento de /embed; provado contra o servidor de produção em tests/embed-cabecalhos.test.ts |
| `src/servicos/chat-publico-config.ts` | A | +350/-0 | O1 validação de tudo que o usuário configura (cor, URL do aviso, domínios, limites) e visão pública que nunca traz instruções nem modelo; provado por tests/chat-publico-config.test.ts e tests/chat-publico-config-publica.test.ts |
| `src/servicos/chat-publico-limites.ts` | A | +92/-0 | O1 custo de IA (PR-16): 10 e 30 por minuto, 60 por conversa e teto diário no banco; provado por tests/chat-publico-limites.test.ts |
| `src/servicos/chat-publico.ts` | A | +191/-0 | O1 canal anônimo: posse da conversa (404 igual), agente inativo, validação, limites antes do provedor, fontes reduzidas (o trecho interno não sai) e erro sempre genérico; provado por tests/chat-publico.test.ts |
| `src/widget/widget.js` | A | +277/-0 | O1 script que roda em site de terceiro: Shadow DOM, silêncio sem chat, `postMessage` só de `event.origin` da plataforma e `event.source` do próprio iframe, sem global além de `window.Converse`; provado em happy-dom (tests/widget-*.test.ts) e visto no Chrome |

## LEITURA RÁPIDA — conferir intenção, não implementação

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.env.example` | M | +5/-3 | L3 `APP_URL` passa a vir vazia: copiar o exemplo sem editar não fixa a URL pública em localhost |
| `docs/projeto/PREMISSAS.md` | M | +106/-2 | L3 oito premissas novas (PR-55 a PR-62) que registram decisões em nome do humano: conferir o campo "O que invalida" de cada uma |
| `docs/stack/CONVENCOES.md` | M | +18/-7 | L3 regras novas com `arquivo:linha` conferidas por tests/projeto.test.ts, inclusive a exceção declarada à cor literal do script |
| `package-lock.json` | M | +95/-0 | L3 lockfile da devDependência `happy-dom` |
| `package.json` | M | +1/-0 | L3 devDependência nova `happy-dom` 20.14.5, versão fixa; `npm audit` em 0 |
| `prisma/seed.ts` | M | +23/-0 | L2 agente de exemplo com o chat publicado, idempotente e sem desfazer edição; provado por tests/seed.test.ts |
| `src/app/(sistema)/agentes/[id]/publicar/loading.tsx` | A | +17/-0 | L1 estado de carregamento da aba |
| `src/app/(sistema)/agentes/[id]/publicar/page.tsx` | A | +62/-0 | L2 página da aba: carrega configuração, origem, chave e fontes; provada em tests/publicar-rota.test.ts |
| `src/componentes/AvatarDoChat.tsx` | A | +74/-0 | L2 avatar predefinido (iniciais ou ícone), decorativo; coberto por tests/chat-embutido-ui.test.tsx |
| `src/componentes/ChatEmbutido.tsx` | A | +426/-0 | L2 interface do chat compacto: estado e rede em módulos puros já testados; cobertura de markup em tests/chat-embutido-ui.test.tsx; a interação foi vista no Chrome |
| `src/componentes/CodigoParaIncorporar.tsx` | A | +68/-0 | L2 trecho para colar e Copiar com reserva; lógica em publicar-logica.ts (testada) |
| `src/componentes/FormularioDoChat.tsx` | A | +300/-0 | L2 formulário da aba Publicar; conferir textos e os estados; coberto por tests/publicar-ui.test.tsx |
| `src/componentes/PainelDePublicacao.tsx` | A | +56/-0 | L2 liga formulário, prévia, código e avisos; coberto por tests/publicar-ui.test.tsx |
| `src/componentes/PreviaDoChat.tsx` | A | +70/-0 | L2 iframe da prévia e postMessage da mesma origem; coberto por tests/publicar-ui.test.tsx |
| `src/componentes/abas-do-agente.ts` | M | +2/-1 | L1 aba Publicar na lista única; coberta por tests/abas-do-agente.test.tsx |
| `src/componentes/embed-logica.ts` | A | +227/-0 | L1 lógica pura (visitante em `localStorage` com try/catch, endereços, erros, retomada); coberta por tests/embed-logica.test.ts |
| `src/componentes/publicar-logica.ts` | A | +160/-0 | L1 origem do trecho, rascunho, avisos e copiar; coberta por tests/publicar-logica.test.ts |
| `src/estilos/global.css` | M | +270/-2 | L2 estilos do embed e da aba Publicar só com tokens (tests/tokens.test.ts); conferir contraste e a 375 px na tela (PEND-07) |
| `src/estilos/tokens.css` | M | +3/-0 | L2 dois tokens novos de texto sobre a cor do agente (preto e branco); provados por tests/cor.test.ts e tests/tokens.test.ts |
| `src/lib/ambiente.ts` | M | +19/-0 | L3 leitura nova `appUrlPublica` (sem padrão, recusa o que não é URL http(s)); provada por tests/ambiente.test.ts |
| `src/lib/cor.ts` | A | +102/-0 | L1 contraste WCAG, texto por luminância e amostras por trios RGB; provado por tests/cor.test.ts |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `README.md` | M | +11/-2 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/00-AUDITORIA.md` | A | +18/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/00-BLOQUEIOS.md` | A | +14/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/00-DECISOES.md` | A | +181/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/BRIEFING-BUILDX.md` | A | +43/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/FECHAMENTO.md` | A | +36/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/ORQUESTRADOR.md` | A | +104/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/RELATORIO-FEATURE.md` | A | +55/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/VERIFICACAO-VISUAL.md` | A | +36/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/base/00-INDICE.md` | A | +33/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/base/00-LACUNAS.md` | A | +20/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/base/api-publica-e-limites.md` | A | +35/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/base/configuracao-e-painel.md` | A | +32/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/base/embed-e-csp.md` | A | +30/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/base/widget-e-script.md` | A | +30/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-01/fases.md` | A | +84/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-01/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-01/tasks.md` | A | +175/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-02/fases.md` | A | +84/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-02/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-02/tasks.md` | A | +175/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-03/fases.md` | A | +81/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-03/sprint.md` | A | +40/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-03/tasks.md` | A | +143/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-04/fases.md` | A | +81/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-04/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-04/tasks.md` | A | +143/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-05/fases.md` | A | +78/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-05/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-05/tasks.md` | A | +111/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-06/fases.md` | A | +81/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-06/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-06/tasks.md` | A | +143/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-07/fases.md` | A | +78/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-07/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/chat-embutido/sprint-07/tasks.md` | A | +111/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/chat-embutido/ATENCAO.md` | A | novo (criado depois) | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/chat-embutido/ENTREGA.md` | A | +104/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/chat-embutido/PR.md` | A | novo (criado depois) | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/chat-embutido/QA-PACOTE.md` | A | novo (criado depois) | D3 documento (artefato do método ou texto): não executa |
| `docs/projeto/MAPA.md` | M | +7/-4 | D3 documento (artefato do método ou texto): não executa |
| `docs/projeto/PROJETO.md` | M | +1/-1 | D3 documento (artefato do método ou texto): não executa |
| `docs/projeto/RECURSAO.md` | M | +2/-2 | D3 documento (artefato do método ou texto): não executa |
| `docs/stack/LACUNAS.md` | M | +2/-0 | D3 documento (artefato do método ou texto): não executa |
| `tests/abas-do-agente.test.tsx` | M | +14/-4 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/ajuda.ts` | M | +1/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/ambiente-dom.test.ts` | A | +52/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/ambiente.test.ts` | M | +18/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/apoio/dom.ts` | A | +74/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/apoio/publico.ts` | A | +36/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/apoio/servir-site-de-teste.ts` | A | +83/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/chat-embutido-ui.test.tsx` | A | +160/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/chat-publico-config-publica.test.ts` | A | +169/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/chat-publico-config.test.ts` | A | +157/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/chat-publico-limites.test.ts` | A | +183/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/chat-publico.test.ts` | A | +260/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/configuracao-do-chat-modelo.test.ts` | A | +69/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/cor.test.ts` | A | +123/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/dominios-permitidos.test.ts` | A | +154/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/embed-cabecalhos.test.ts` | A | +102/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/embed-logica.test.ts` | A | +271/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/embed-mensagens.test.ts` | A | +119/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/embed-pagina.test.ts` | A | +153/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/eventos-sse.test.ts` | M | +47/-1 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/projeto.test.ts` | M | +65/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/publicar-acao.test.ts` | A | +128/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/publicar-logica.test.ts` | A | +173/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/publicar-rota.test.ts` | A | +109/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/publicar-ui.test.tsx` | A | +220/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/publico-config-rota.test.ts` | A | +121/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/publico-conversa-rota.test.ts` | A | +113/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/publico-conversar-rota.test.ts` | A | +275/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/rotas.test.ts` | M | +2/-1 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/seed.test.ts` | M | +42/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/widget-interacao.test.ts` | A | +280/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/widget-montagem.test.ts` | A | +217/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
| `tests/widget-rota.test.ts` | A | +52/-0 | D1 teste ou apoio de teste: a suíte inteira exerce |
