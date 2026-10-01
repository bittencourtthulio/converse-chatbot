---
expx_schema: 1
expx_tool: buildx
kind: validacao_parte
projeto_id: plataforma-chatbot-ia
parte: pedido-aceite-entregas
data: 2026-10-01
atendidos: 62
parciais: 8
nao_atendidos: 0
descartados: 11
---

# Validação B6 — pedido, aceite e entregas

Auditoria independente de `docs/projeto/PROJETO.md` e `docs/projeto/MAPA.md` contra o repositório (ponta `feat/operacao-e-backup`, árvore limpa). Nada foi alterado fora deste arquivo. Os testes não foram executados por mim; conferi que cada teste citado existe e o que ele assevera. Prova de execução fica com os registros de cada `ENTREGA.md` (suíte inteira verde: 2863 testes no fechamento).

Convenção das citações: `arquivo:linha` é da implementação; o teste vai com o nome do `it` e a linha.

## 1. "O que foi pedido" (P-01 a P-09)

| ID | Enunciado | Conclusão | Evidência (impl; teste) | Observação |
|---|---|---|---|---|
| P-01 | Chatbot com IA que responde em linguagem natural | atendido | `src/servicos/chat.ts:131` (`responderMensagem`); `tests/conversar-rota.test.ts:181` (200 text/event-stream com eventos na ordem) | Resposta real nunca exercida: só contra OpenRouter simulado (PEND-06) |
| P-02 | Modelo acessado pelo OpenRouter | atendido | `src/lib/openrouter.ts:162` (`conversar`, `stream: true` em :176), `:95` (`listarModelos`); `tests/openrouter.test.ts` (`it` "devolve id e nome dos modelos ordenados por nome", :34) e `tests/chat-falhas.test.ts:38` | Único provedor, como declarado em PR-06 |
| P-03 | Atende por bot do Telegram | atendido | `src/app/api/telegram/[agenteId]/webhook/route.ts:11`, `src/servicos/telegram-atendimento.ts:105`, `src/servicos/canal-telegram.ts:178`; `tests/telegram-webhook-rota.test.ts:90`, `tests/telegram-resposta.test.ts:59` | Só contra Telegram simulado (`tests/apoio/servir-telegram-falso.ts`) |
| P-04 | Chat embutido em site por script | atendido | `src/widget/widget.js`, `src/app/widget.js/route.ts:12`, `src/app/embed/[id]/page.tsx`, `src/app/api/publico/agentes/[id]/conversar/route.ts:35`; `tests/widget-montagem.test.ts:73`, `tests/widget-interacao.test.ts:67`, `tests/publico-conversar-rota.test.ts:90` | Verificação no navegador em outra origem registrada em `docs/chat-embutido/VERIFICACAO-VISUAL.md` |
| P-05 | Subir arquivos para a base | atendido | `src/app/api/agentes/[id]/fontes/route.ts:28`, `src/servicos/fontes.ts:314`; `tests/fontes-rota-upload.test.ts:52` (PDF, DOCX, CSV reais chegam a pronto) | |
| P-06 | Subir textos para a base | atendido | `src/app/api/agentes/[id]/fontes/texto/route.ts:11`, `src/servicos/fontes.ts:143`; `tests/fontes-rota.test.ts:69` | |
| P-07 | Subir vídeos para a base | atendido | `src/app/api/agentes/[id]/fontes/video/route.ts:35`, `.../youtube/route.ts:13`, `src/servicos/fontes.ts:376,447`; `tests/video-rota.test.ts:52`, `tests/fontes-video-fim-a-fim.test.ts:67`, `tests/youtube-rota.test.ts:48` | Transcrição real nunca chamada (simulado); YouTube depende de página não documentada (lacuna 11) |
| P-08 | Interface amigável | parcial | Estados vazio/carregando/erro: `src/componentes/EstadoVazio.tsx`, `Esqueleto.tsx`, `PaginaDeErro.tsx`; `tests/componentes.test.tsx` (`describe` EstadoVazio, EsqueletoDePagina), `tests/erro-paginas.test.tsx` | "Amigável" é julgamento humano: só há verificação visual por emulação de largura, sem celular real nem usuário (PEND-07) |
| P-09 | Estilo de SaaS padrão | atendido | `src/estilos/tokens.css`, `src/componentes/CascaDoSistema.tsx`, `BarraLateral.tsx`; `tests/tokens.test.ts:81` (temas), `:133` (nenhuma cor literal fora de tokens), `tests/menu.test.ts:50` | |

## 2. "O que foi descoberto" (PR-01 a PR-27, linha a linha)

| ID | Requisito | Conclusão | Evidência (impl; teste) | Observação |
|---|---|---|---|---|
| PR-01 | Vários agentes por instalação | atendido | `src/servicos/agentes.ts:98` (`listar`), `prisma/schema.prisma:62`; `tests/agentes.test.ts:86` | |
| PR-02 | Uma instalação, um workspace, sem cadastro público, planos ou cobrança | atendido | `prisma/schema.prisma:36` (singleton), `src/app/entrar/page.tsx` sem rota de cadastro; `tests/usuarios.test.ts:21` (comum não cria) | Ausência de rota pública de cadastro conferida por busca no código (sem `signup`, `stripe`, `cobrança`); nenhum teste afirma a ausência |
| PR-03 | Nome "Converse" por `APP_NAME` | atendido | `src/lib/ambiente.ts:146`; `tests/ambiente.test.ts` (grep `APP_NAME`), `tests/projeto.test.ts:34` | |
| PR-04 | Recuperação por FTS5 | atendido | `src/servicos/recuperacao.ts:67`, migration `prisma/migrations/20260930190000_busca_fts5`; `tests/indice-fts5.test.ts:83`, `tests/recuperacao.test.ts` | |
| PR-05 | Processamento em segundo plano no servidor | atendido | `src/servicos/fontes-fila.ts:81`; `tests/fontes-fila-execucao.test.ts:32` (concorrência máx. 2), `:71` (falha não derruba a fila) | |
| PR-06 | OpenRouter único, chave do workspace, modelo por agente | atendido | `src/servicos/integracoes.ts:78,139`, `src/servicos/agentes.ts:16`; `tests/integracoes.test.ts:51`, `tests/seletor-de-modelo.test.tsx:13` | |
| PR-07 | Telegram por webhook, um bot por agente | atendido | `src/servicos/canal-telegram.ts:178`, `src/servicos/telegram-webhook.ts:30`; `tests/canal-telegram-conectar.test.ts:57`, `tests/telegram-webhook-rota.test.ts:68` | |
| PR-08 | Chat embutido por script e iframe | atendido | ver P-04; `src/proxy.ts:25-39` | |
| PR-09 | Vídeo como transcrição de fala | atendido | `src/servicos/transcricao-de-midia.ts`, `src/lib/midia.ts:1`; `tests/transcricao-de-midia.test.ts:74`, `tests/fontes-video-fim-a-fim.test.ts:67` | Sem análise de imagem, como declarado |
| PR-10 | Formatos e limites, sem OCR | atendido | `src/lib/midia-formatos.ts:18`, `src/lib/extracao/conteudo.ts`; `tests/midia-formatos.test.ts:55`, `tests/fontes-arquivos.test.ts:96` (PDF escaneado vira erro de OCR), `tests/fontes-rota-upload.test.ts:101` (limite de tamanho) | |
| PR-11 | Arquivos em disco local | atendido | `src/lib/armazenamento.ts:30`; `tests/armazenamento.test.ts:22,35` | |
| PR-12 | Papéis admin e usuário verificados no servidor | atendido | `src/servicos/autenticacao.ts:117` (`exigirAdmin`); `tests/autenticacao.test.ts:122` (403), `tests/usuarios.test.ts:16,21,32` | SEGURANCA: sim (provada) |
| PR-13 | Validação de entrada no servidor, tipo real e tamanho do upload | atendido | `zod` nos serviços (ex.: `src/servicos/autenticacao.ts:22`), `src/lib/midia-formatos.ts:15` (assinatura); `tests/midia-formatos.test.ts:55`, `tests/fontes-rota.test.ts:93`, `tests/fontes-rota-upload.test.ts:101`, `tests/video-rota.test.ts:149` | SEGURANCA: sim (provada) |
| PR-14 | Chave do OpenRouter e token do Telegram cifrados e nunca devolvidos | atendido | `src/lib/cripto.ts:35,47,72`; `tests/cripto.test.ts:23`, `tests/integracoes.test.ts:51`, `tests/canal-telegram-conectar.test.ts:78`, `tests/telegram-token-nao-vaza.test.ts` | SEGURANCA: sim (provada) |
| PR-15 | Conteúdo recuperado é dado; resposta honesta sem cobertura | atendido | `src/servicos/chat-prompt.ts:65,126,135`; `tests/chat-fundamentado.test.ts:91` (trecho malicioso), `:132` (fora da base) | SEGURANCA: sim. A prova é sobre o prompt montado e o delimitador; o comportamento do modelo real não é testável nem foi observado |
| PR-16 | Limite de uso (login, chat público, Telegram, teto diário) | atendido | `src/lib/limite-de-uso.ts:46`, `src/servicos/chat-publico-limites.ts`, `src/servicos/telegram-limites.ts`; `tests/limite-de-login.test.ts:23`, `tests/chat-publico-limites.test.ts:53,73`, `tests/telegram-limites.test.ts` | SEGURANCA: sim (provada). Limitador em memória de um processo, coerente com PR-05 |
| PR-17 | Embed só em domínios permitidos; CORS e frame-ancestors | atendido | `src/lib/dominios-permitidos.ts:13,51`, `src/proxy.ts:25`; `tests/embed-cabecalhos.test.ts:42,54`, `tests/publico-config-rota.test.ts:117`, `tests/dominios-permitidos.test.ts` | SEGURANCA: sim (provada) |
| PR-18 | Retenção, exclusão de conversa e de conta | atendido | `src/servicos/expurgo.ts:64`, `src/servicos/historico.ts:294,318`, `src/servicos/usuarios.ts` (excluir), `src/servicos/titular.ts`; `tests/expurgo.test.ts:48`, `tests/historico-apagar.test.ts:32`, `tests/usuarios-excluir.test.ts`, `tests/titular.test.ts:79` | SEGURANCA: sim (LGPD, provada). Base legal e prazo dependem de decisão humana (PEND-08) |
| PR-19 | Trilha de auditoria de ações críticas | atendido | `src/servicos/auditoria-acoes.ts:10` (conjunto fechado), `src/servicos/auditoria.ts`; `tests/auditoria-somente-acrescimo.test.ts:29,52`, `tests/auditoria-usuarios.test.ts:42` (sem auditoria, sem alteração) | SEGURANCA: sim (provada) |
| PR-20 | Backup com restauração testada | atendido | `src/lib/backup.ts`, `src/servicos/backup.ts`, `src/lib/restauracao.ts:300`, `scripts/backup.ts`, `scripts/restore.ts`; `tests/backup-lib.test.ts:53`, `tests/restauracao-fim-a-fim.test.ts:40`, `tests/restauracao-comando.test.ts:58` | Restauração é por linha de comando, não por tela |
| PR-21 | Log estruturado, correlação, saúde, configuração validada | atendido | `src/lib/log.ts:25,110`, `src/proxy.ts:25`, `src/servicos/saude.ts`, `src/lib/ambiente.ts:38`; `tests/log.test.ts:38`, `tests/saude-rota.test.ts:28,34`, `tests/ambiente-start.test.ts:42,50`, `tests/correlacao.test.ts` | |
| PR-22 | Falha do provedor tratada, sem vazar detalhe | atendido | `src/servicos/chat-erros.ts:8`; `tests/chat-erros.test.ts:21`, `tests/chat-falhas.test.ts:38,75`, `tests/publico-conversar-rota.test.ts:133` | |
| PR-23 | Design SaaS sobre tokens, claro/escuro, estados, responsivo, acessível | parcial | `src/estilos/tokens.css:164`, `src/estilos/global.css:206,526,997`, `src/componentes/AlternadorDeTema.tsx:11`; `tests/tokens.test.ts:81,116,133`, `tests/conhecimento-estilos.test.ts:49` | Responsivo e tema provados por texto do CSS e contraste; nenhum teste exerce o alternador de tema nem layout real. Ver achado A-03 |
| PR-24 | Deploy por contêiner com volume persistente | parcial | `Dockerfile:14,24,36`, `docker-compose.yml`, `docker-entrypoint.sh`; `tests/conteiner.test.ts:26` (estático), `tests/conteiner-imagem.test.ts:106,138,146` | Os testes que sobem a imagem ficam atrás de `describe.skipIf(!VERIFICAR_CONTEINER)` (`:19,:106`), logo não rodam na suíte padrão. Imagem exercitada só em máquina arm64 de desenvolvimento (PEND-09). Ver A-02 |
| PR-25 | Dados de demonstração | atendido | `prisma/seed.ts:16-24,174`; `tests/seed.test.ts:32,47` (idempotente, recusa produção), `:84`, `:178` | Credenciais de demonstração fictícias, listadas na seção 7 |
| PR-26 | TDD, lint, pipeline, auditoria de dependências | parcial | `.github/workflows/ci.yml:35,41,44,47,57`, `eslint.config.mjs:3-16`; `tests/camadas.test.ts:20-55` (lint das camadas) | A pipeline nunca rodou: não há remoto (PEND-05). `npm audit` só existe no CI. Ver A-04 |
| PR-27 | Autenticação, painel inicial, usuários, perfil e troca de senha | atendido | `src/app/acoes.ts:60,82,262`, `src/app/(sistema)/layout.tsx:11`, `src/app/(sistema)/(painel)/page.tsx:19`; `tests/autenticacao.test.ts:10,35,49`, `tests/usuarios.test.ts:41,65`, `tests/perfil.test.ts:65,81`, `tests/painel-numeros.test.ts:19` | |

## 3. "Considerado e descartado"

Conferência: `package.json` não traz biblioteca de i18n, de tracing ou de pagamento (dependências: `@prisma/*`, `bcryptjs`, `better-sqlite3`, `dotenv`, `jose`, `mammoth`, `next`, `parse5`, `react*`, `tar`, `tsx`, `unpdf`, `zod`); busca em `src`, `prisma` e `scripts` por `next-intl`, `i18next`, `opentelemetry`, `stripe`, `whatsapp`, `tesseract`, `embedding` não encontra nada.

| ID | Descarte | Conclusão | Evidência | Observação |
|---|---|---|---|---|
| D-1 | L31 Internacionalização (`PROJETO.md:84`) | descartado | `src/app/layout.tsx:23` (`lang="pt-BR"`), nenhuma lib de i18n | Coerente: interface só em pt-BR |
| D-2 | L19 Métrica e tracing distribuído (`PROJETO.md:85`) | descartado | nenhuma lib de telemetria; mínimo existente: `src/lib/log.ts`, `src/servicos/saude.ts` | Coerente com PR-21 |
| D-3 | Auditoria de leitura (`PROJETO.md:86`) | descartado | `src/servicos/auditoria-acoes.ts:10-29`: só ações que alteram estado, mais `dados_do_titular_exportados` e `backup_gerado`; nenhuma ação de consulta | Coerente. A exportação de dados do titular é auditada por ser ato de privacidade, não leitura rotineira |

Nada descartado virou escopo.

## 4. Critérios de aceite de negócio (11)

| # | Critério | Conclusão | Fluxo de ponta a ponta (impl) e teste | Observação |
|---|---|---|---|---|
| C-01 | Entro com a conta de demonstração, chego ao painel e ao menu de agentes | atendido | `prisma/seed.ts:16`, `src/app/acoes.ts:60-72` (login, cookie, `redirect('/')`), `src/app/(sistema)/layout.tsx:11` (`exigirUsuario`), `src/app/(sistema)/(painel)/page.tsx:19`; `tests/seed.test.ts:32`, `tests/autenticacao.test.ts:10`, `tests/rotas.test.ts:112` (painel abre), `tests/menu.test.ts:50` (Painel, Agentes, Conversas) | Não há um único teste que encadeie seed, login e menu; a cadeia é provada por três |
| C-02 | Crio um agente, escolho o modelo do OpenRouter e converso no painel | atendido | `src/app/acoes.ts:351`, `src/componentes/FormularioDeAgente.tsx:106`, `src/app/(sistema)/agentes/[id]/testar/page.tsx:22`, `src/app/api/agentes/[id]/conversar/route.ts:29`; `tests/acoes-de-agente.test.ts:49`, `tests/seletor-de-modelo.test.tsx:13`, `tests/conversar-rota.test.ts:181` | OpenRouter simulado |
| C-03 | Subo arquivo, texto colado e vídeo e vejo "processando" até "pronto" | atendido | `src/servicos/fontes.ts:143,314,376`, `src/servicos/fontes-fila.ts:81`; `tests/fontes-rota-upload.test.ts:52`, `tests/fontes-rota.test.ts:69`, `tests/fontes-video-fim-a-fim.test.ts:67`, `tests/fontes-fila-video.test.ts:35` (etapa e progresso) | Vídeo com transcritor simulado |
| C-04 | O agente responde com base no que subi e mostra as fontes | atendido | `src/servicos/recuperacao.ts:67`, `src/servicos/chat-prompt.ts:65`, `src/servicos/fontes-da-resposta.ts`, `src/componentes/FontesDaResposta.tsx`; `tests/chat-fundamentado.test.ts:58`, `tests/chat-fontes.test.ts:35`, `tests/fontes-da-resposta-ui.test.tsx` | |
| C-05 | Sem cobertura da base, diz que não sabe | atendido | `src/servicos/chat-prompt.ts:126,135-139`; `tests/chat-fundamentado.test.ts:132` (instrução sem material), `tests/chat-fontes.test.ts:67` (sem fontes) | Ressalva: a prova é o prompt enviado ao modelo; que o modelo real obedeça não foi nem pode ser provado aqui |
| C-06 | Copio o script, colo no site, o chat aparece e responde | atendido | `src/app/widget.js/route.ts:12`, `src/widget/widget.js`, `src/app/embed/[id]/page.tsx`, `src/app/api/publico/agentes/[id]/conversar/route.ts:35`, `src/componentes/CodigoParaIncorporar.tsx`; `tests/widget-montagem.test.ts:73`, `tests/widget-interacao.test.ts:67`, `tests/publico-conversar-rota.test.ts:90`, `tests/publicar-ui.test.tsx:124` | Fluxo inteiro visto num navegador contra site de outra origem (`docs/chat-embutido/VERIFICACAO-VISUAL.md`), com OpenRouter simulado |
| C-07 | Conecto um bot do Telegram e converso pelo aplicativo | atendido | `src/app/acoes.ts:433`, `src/servicos/canal-telegram.ts:178`, `src/app/api/telegram/[agenteId]/webhook/route.ts:11`, `src/servicos/telegram-atendimento.ts:105`; `tests/canal-telegram-conectar.test.ts:57`, `tests/telegram-webhook-rota.test.ts:90`, `tests/telegram-resposta.test.ts:59` | Nunca com bot nem HTTPS reais (PEND-06, recurso externo) |
| C-08 | Leio as conversas de visitantes e do Telegram, e apago uma | atendido | `src/servicos/historico.ts:94,164,318`, `src/app/api/conversas/[id]/route.ts`, `src/app/(sistema)/conversas/(lista)/page.tsx`; `tests/historico-listar.test.ts:34,97`, `tests/conversas-apagar-rota.test.ts:80`, `tests/historico-apagar.test.ts:32`, `tests/conversas-lista-ui.test.tsx:35` | |
| C-09 | Admin cadastra outro usuário, que entra e troca a própria senha | atendido | `src/app/acoes.ts:82,245,262`, `src/servicos/usuarios.ts`, `src/servicos/perfil.ts`; `tests/usuarios.test.ts:41,65` (criado entra), `tests/perfil.test.ts:65,81` (troca e antiga deixa de valer) | Provado em dois testes de serviço, sem teste único encadeado nem de rota para a troca |
| C-10 | Funciona no celular e nos temas claro e escuro | parcial | `src/estilos/global.css:526,997`, `src/estilos/tokens.css:164`, `src/componentes/AlternadorDeTema.tsx:11`; `tests/tokens.test.ts:81,116`, `tests/conversas-lista-estilos.test.ts:39`, `tests/conhecimento-estilos.test.ts:49` | Ver achado A-03: sem teste de comportamento do alternador, sem celular real (PEND-07) |
| C-11 | Restauro um backup numa instalação limpa e os dados voltam | atendido | `scripts/restore.ts`, `src/lib/restauracao.ts:300`, `src/servicos/backup.ts`; `tests/restauracao-fim-a-fim.test.ts:40` (linha a linha, FTS, original), `:135` (backup sem chave), `tests/restauracao-comando.test.ts:58,168,218` | Em contêiner só com opt-in (`tests/conteiner-imagem.test.ts:209`); em servidor real, nunca (PEND-09) |

## 5. "Fora de escopo": confirmação de que nada foi implementado

| ID | Item fora de escopo | Conclusão | Evidência da ausência | Observação |
|---|---|---|---|---|
| FE-1 | Cadastro público, planos, cobrança, multiempresa | descartado | sem rota de cadastro em `src/app` (login em `src/app/entrar/page.tsx`), sem `stripe`/`cobrança`, `prisma/schema.prisma` sem modelo de conta ou plano (11 modelos, workspace singleton) | `PROJETO.md:112` |
| FE-2 | Transferência a humano, tickets, SLA | descartado | busca por `ticket`, `SLA`, `atendente humano` em `src`: nenhum resultado | `PROJETO.md:113` |
| FE-3 | Outros canais (WhatsApp, Instagram, e-mail) | descartado | `BadgeDeCanal`/`canal` só conhece site e Telegram; busca por `whatsapp`, `instagram`: nada | `PROJETO.md:114` |
| FE-4 | Ajuste fino ou treinamento | descartado | nenhum código de treino; dependências sem biblioteca de ML | `PROJETO.md:115` |
| FE-5 | Análise visual de vídeo e OCR | descartado | `src/lib/midia.ts` só extrai áudio; PDF escaneado é recusado com mensagem (`tests/fontes-arquivos.test.ts:96`); sem `tesseract` | `PROJETO.md:116` |
| FE-6 | Embeddings vetoriais | descartado | busca por FTS5 (`src/servicos/recuperacao.ts:67`); sem `embedding` em `src`, `schema.prisma` ou `package.json` | `PROJETO.md:117` |
| FE-7 | Voz, telefonia, domínio próprio do widget | descartado | sem TTS nem telefonia; o widget serve da origem da plataforma (`src/app/widget.js/route.ts`) | `PROJETO.md:118`. A transcrição de áudio de vídeo é a PR-09, dentro do escopo |
| FE-8 | Tradução da interface | descartado | ver D-1 | `PROJETO.md:119` |

## 6. As 11 features do `MAPA.md`

Para cada uma: branch `feat/<slug>` existe (`git branch --list`), é ancestral da ponta `feat/operacao-e-backup` (pilha íntegra), `docs/entregas/<slug>/ENTREGA.md` registra `portao: pronto` (conferido também via `git show feat/<slug>:...`, ou seja, o registro está na própria branch), e `PR.md`, `QA-PACOTE.md` e `ATENCAO.md` existem.

| Feature | Conclusão | Entrega verificável no código (impl; teste) | Branch / ENTREGA |
|---|---|---|---|
| FT-01 Fundação | atendido | login, painel, cadastro de usuário, troca de senha: `src/app/acoes.ts:60,82,262`, `src/app/(sistema)/configuracoes/usuarios/page.tsx`; `tests/autenticacao.test.ts:10`, `tests/usuarios.test.ts:41`, `tests/perfil.test.ts:65`, `tests/rotas.test.ts:92,112` | `b82ab00`, pronto |
| FT-02 Agentes e chave | atendido | `src/app/acoes.ts:282,351,367,382`, `src/servicos/integracoes.ts:78`; `tests/acoes-de-agente.test.ts:49`, `tests/integracoes.test.ts:51` | `2032e2d`, pronto |
| FT-03 Conversa de teste | atendido | `src/app/api/agentes/[id]/conversar/route.ts:29`, `src/servicos/chat.ts:131`, `src/componentes/ChatDeTeste.tsx`; `tests/conversar-rota.test.ts:181`, `tests/chat-de-teste.test.tsx`, `tests/chat-falhas.test.ts:38` | `0a72970`, pronto |
| FT-04 Arquivos e textos | atendido | `src/servicos/fontes.ts:143,314`, `src/servicos/fontes-fila.ts:81`; `tests/fontes-rota-upload.test.ts:52`, `tests/fontes-rota.test.ts:69` | `56ac9ec`, pronto |
| FT-05 Respostas com a base | atendido | `src/servicos/recuperacao.ts:67`, `src/servicos/chat-prompt.ts:65`; `tests/chat-fundamentado.test.ts:58,132`, `tests/chat-fontes.test.ts:35` | `8df748a`, pronto |
| FT-06 Chat embutido | atendido | `src/widget/widget.js`, `src/proxy.ts:25`, `src/servicos/chat-publico.ts:116`; `tests/widget-montagem.test.ts:73`, `tests/embed-cabecalhos.test.ts:42`, `tests/chat-publico-limites.test.ts:53` | `ebfb21b`, pronto |
| FT-07 Telegram | atendido | `src/servicos/canal-telegram.ts:178`, `src/servicos/telegram-webhook.ts:157`; `tests/telegram-webhook-rota.test.ts:90`, `tests/canal-telegram-conectar.test.ts:57` | `cd09aee`, pronto |
| FT-08 Vídeo | atendido | `src/servicos/fontes.ts:376,447`, `src/servicos/transcricao-de-midia.ts`; `tests/video-rota.test.ts:52`, `tests/fontes-video-fim-a-fim.test.ts:67`, `tests/youtube-rota.test.ts:48` | `4e0eff4`, pronto |
| FT-09 Histórico e painel | atendido | `src/servicos/historico.ts:94,294`, `src/servicos/painel.ts`; `tests/historico-listar.test.ts:34`, `tests/historico-apagar.test.ts:32`, `tests/painel-numeros.test.ts:35` | `b322bee`, pronto |
| FT-10 Privacidade e auditoria | atendido | `src/app/acoes.ts:138,158`, `src/servicos/expurgo.ts:64`, `src/servicos/auditoria.ts`; `tests/expurgo.test.ts:48`, `tests/usuarios-excluir.test.ts`, `tests/auditoria-ui.test.tsx` | `6508842`, pronto |
| FT-11 Operação e backup | atendido | `Dockerfile`, `src/app/(sistema)/configuracoes/sistema/page.tsx`, `src/app/acoes.ts:537`, `scripts/backup.ts`, `scripts/restore.ts`; `tests/painel-do-sistema.test.tsx`, `tests/backup-acao.test.ts`, `tests/restauracao-fim-a-fim.test.ts:40` | `8c38b83`, pronto |

Os `docs/<slug>/` referenciados pelo mapa existem para as 11 features. O mapa diz "PR: local" porque não há remoto; nenhum PR foi aberto (PEND-05, recurso externo).

### Ressalva honesta: `suite: parcial` e o portão da mergex

A maioria das tasks guarda `suite: parcial` (só o subconjunto da task rodou); a suíte inteira verde foi registrada ao fechar cada sprint e no estado final de cada feature. Os `ENTREGA.md` declaram isso (FT-02 linha 289; FT-07 linha 259; FT-08 linha 339; FT-09 linha 411; FT-10 linha 490; FT-11 linha 457: 22 tasks parciais e 16 verdes). O portão da mergex foi lido com a interpretação "V2 é aviso, não bloqueio": o `pronto` de cada feature significa suíte inteira verde no fechamento, não em cada task. Esta auditoria aceita a interpretação porque o estado final está registrado, mas não a trata como prova de que cada task isolada passou com a suíte inteira.

Dois desvios de rigor, registrados como parcial: (a) FT-05 trocou a linha `suite` das tasks de `parcial` para `verde` sem ter rodado a suíte inteira em cada task (`docs/entregas/respostas-com-conhecimento/ENTREGA.md:241`); (b) FT-03 mostra 17 linhas `verde` em `docs/conversa-de-teste` sem nota equivalente. O resultado final (1065 e 573 testes verdes) não é posto em dúvida; o campo é que perdeu significado nessas duas features.

| Item | Conclusão | Observação |
|---|---|---|
| Convenção `suite` coerente entre features | parcial | Ver acima; achado A-05 |

## 7. Higiene dos artefatos do buildx

| Item | Conclusão | Evidência | Observação |
|---|---|---|---|
| Frontmatter `expx-schema v1` válido em `docs/projeto/*.md` | atendido | `MAPA.md`, `PREMISSAS.md`, `PROJETO.md`, `RECURSAO.md`: `expx_schema: 1`, `expx_tool: buildx`, `kind`, `projeto_id: plataforma-chatbot-ia`, `atualizado_em`; chaves em snake_case sem acento | Nenhuma chave omitida nos quatro |
| `total` e `por_origem` de `PREMISSAS.md` | atendido | `total: 100`; contei 100 blocos `### PR-NN`, sequência PR-01 a PR-100 sem lacuna nem repetição; origens contadas: `catalogo_lacunas` 27, `decisao_de_stack` 7, `f2_autonoma` 66, `briefing` 0, `recursao` 0 (soma 100); etapas batem (b1 27, b2 7, b4 66); todos os blocos têm os 8 campos | |
| Contadores do `MAPA.md` | atendido | `total_features: 11`, `entregues: 11`, demais 0; 11 painéis e 11 `**Status:** entregue`; `RECURSAO.md`: 9 pendências (PEND-01 a PEND-09), `pendencias_abertas: 9` | |
| Nenhum caminho absoluto em `docs/` | atendido | busca de `/Users/`, `/private/`, `/tmp/` em `docs/` (inclui `docs/eventos`, ignorado pelo Git), `README.md`, `.github`, `Dockerfile`, `docker-compose.yml`: zero ocorrências | |
| Premissas órfãs (premissa sem feature; feature que não a realiza) | parcial | Nenhuma premissa sem feature (todas têm `Realizada em`; as de PR-01 a PR-34 aparecem em "Premissas que realiza" de alguma feature). Divergências de rastreabilidade: (i) o mapa só lista PR-01 a PR-34, e PR-35 a PR-100 (66 premissas de detalhe) não aparecem em nenhuma lista de feature, apesar de o comentário do mapa dizer que toda premissa aparece; (ii) PR-10 e PR-11 dizem `FT-04, FT-08` e o mapa lista só FT-04; PR-25 diz `FT-01, FT-04, FT-06, FT-09` e o mapa só FT-01; PR-27 diz `FT-01, FT-09` e o mapa só FT-01; (iii) PR-16 diz `FT-06, FT-07` e o mapa acrescenta FT-01 (o limite de login existe em `tests/limite-de-login.test.ts`, de FT-01, e PR-36 o registra em FT-01). Nenhuma "Realizada em" aponta para feature que de fato não a realize | Baixa; ver A-06 |
| Estado de `PROJETO.md` e textos de apoio | parcial | `PROJETO.md` frontmatter `etapa: b4` e `ciclos_recursao: 0` enquanto `RECURSAO.md` tem `ciclo_atual: 1`; `PREMISSAS.md` diz "PR-01 a PR-11 provisórias" mas há 14 (também PR-24, PR-91, PR-99); `RECURSAO.md` PEND-05 cita `docs/<slug>/PR.md`, mas os PR estão em `docs/entregas/<slug>/PR.md` | Baixa; ver A-06 |

## 8. Varredura de segredos

Escopo: árvore rastreada da ponta, histórico de todas as 11 branches `feat/*` e de `main` (`git log -p` completo, linhas adicionadas; sem stash e sem outras refs; sem remoto), e nomes de todos os arquivos já adicionados em qualquer commit.

| Item | Conclusão | Evidência | Observação |
|---|---|---|---|
| Chaves de API reais (`sk-or-`, `sk-`, `AKIA`, `ghp_`, `xox`, `AIza`) | atendido | todas as ocorrências são fictícias (listadas abaixo); nenhuma chave `sk-or-v1-` com 40+ hexadecimais; nenhum `sk-` longo | |
| Tokens de bot do Telegram válidos | atendido | só `123456789:AAHteste_token-0000...`, `987654321:AAHoutro_token-0000...`, `555555555:AAHdesconhecido_0000...`, `123456789:token-de-teste-nao-real-abcdefghijklmnop` | Fictícios, em testes e no instalador de teste (`tests/apoio/instalacao.ts`) |
| Chaves privadas | atendido | `BEGIN ... PRIVATE KEY` só aparece como texto de teste do hook de segredos da suíte Expx (`.expx/marketplace/plugins/expx/hooks/testes/testar.sh:165`) e em tabela de documentação | |
| Arquivo de ambiente, `.db`, `storage/` versionados | atendido | nenhum arquivo de ambiente real, `.db`, `.sqlite`, `.pem`, `.key`, `storage/`, `backups/` ou `.tar.gz` em qualquer commit de qualquer branch; só `.env.example` (e as cópias da suíte e do template do buildx), com `JWT_SECRET=""` e `ENCRYPTION_KEY=""` vazios; `.gitignore` cobre `.env`, `*.db`, `prisma/dev.db*`, `storage/`, `/backups/`. Existem no disco, ignorados e não rastreados: `prisma/dev.db` (24 KB) e `storage/fontes/agente-de-exemplo` | |
| `JWT_SECRET=`, `ENCRYPTION_KEY=` com valor | atendido | valores só fictícios: `Dockerfile:31` (`segredo-de-construcao-descartavel-...`, valor de build descartável), `.github/workflows/ci.yml:14`, `tests/setup.ts` e testes (`00112233...ff`, `'x'.repeat(40)`); `docker-compose.yml:3` só instrui a preencher | Os demais hexadecimais de 64 caracteres no histórico são hashes SHA-256 de fixtures e de `.expx/expx-lock.json` |

Valores fictícios encontrados (não contam): `sk-or-v1-chave-de-teste-0000`, `sk-or-v1-abcdef1234`, `sk-or-v1-segredo-4321`, `sk-or-v1-muito-secreta-9999` e variantes de teste (vazamento em log, chave errada, recusada); tokens de Telegram acima; `AKIAIOSFODNN7EXAMPLE` (exemplo público da AWS) e `AKIAQY7RZ3LKMNBVCXZQ`, `ghp_A1b2C3d4...` nos testes do hook de segredos da suíte Expx (`.expx/marketplace/plugins/expx/hooks/testes/`, código de terceiros que o projeto trouxe, não do sistema); contas de demonstração `admin@exemplo.local` e uma conta de usuário, senha `demo1234` (`prisma/seed.ts:16-24`; a seed recusa rodar em produção, `:174`, com teste em `tests/seed.test.ts:47`).

Conclusão da varredura: nenhum segredo real.

## Achados

| ID | Item | Severidade | Segurança | Resolvível por trabalho novo? | O que fazer |
|---|---|---|---|---|---|
| A-01 | P-08 Interface amigável | baixa | não | depende de decisão humana | Pedir a uma pessoa que percorra os fluxos em celular real e confirme; "amigável" não é verificável por máquina (PEND-07). |
| A-02 | PR-24 Deploy por contêiner | média | não | depende de recurso externo | A prova de que a imagem sobe e é saudável está atrás de `VERIFICAR_CONTEINER=1` (`tests/conteiner-imagem.test.ts:19`) e só foi rodada numa máquina arm64; rodar numa máquina limpa com Docker e registrar, ou habilitar o teste no CI (PEND-09). |
| A-03 | PR-23 e C-10 Celular e temas claro e escuro | média | não | resolvível por trabalho novo, em parte | Nenhum teste exerce `AlternadorDeTema` (`src/componentes/AlternadorDeTema.tsx:11`: grava `localStorage`, alterna o tema); acrescentar teste de comportamento. A parte "celular real" depende de recurso externo (PEND-07); hoje há só teste de texto do CSS e verificação com largura emulada. |
| A-04 | PR-26 Pipeline e `npm audit` | baixa | não | depende de recurso externo | O CI (`.github/workflows/ci.yml`) nunca rodou por falta de remoto (PEND-05); `npm audit --audit-level=high` só existe lá. Rodar `npm audit` uma vez localmente e registrar o resultado, ou publicar o repositório. |
| A-05 | Convenção `suite` e portão da mergex | baixa | não | depende de decisão humana | Aceitar formalmente a leitura "V2 é aviso" ou exigir a suíte inteira por task; corrigir o rótulo `verde` das tasks da FT-05 (e conferir as da FT-03), que contradiz a convenção `verde = suíte inteira`. |
| A-06 | Higiene de rastreabilidade (premissas e estado) | baixa | não | resolvível por trabalho novo (edição de documento) | Listar PR-35 a PR-100 em "Premissas que realiza" das features, alinhar PR-10, PR-11, PR-16, PR-25 e PR-27 entre mapa e premissas, atualizar `etapa` e `ciclos_recursao` no `PROJETO.md`, o texto de "provisórias" e o caminho do PR em PEND-05. |

Sem achado de severidade alta. Nenhuma premissa de segurança ficou sem código e teste.

### Ressalvas que não são achados

- Toda prova de integração com OpenRouter, Telegram e YouTube usa servidores simulados; nenhuma chamada real foi feita (PEND-06, recurso externo). O que "responder com base na fonte" e "dizer que não sabe" provam é o prompt e a recuperação, não o comportamento de um modelo real.
- Não executei a suíte. As contagens de testes vêm dos `ENTREGA.md` e do `MAPA.md`; conferi apenas a existência e o conteúdo dos testes citados.
