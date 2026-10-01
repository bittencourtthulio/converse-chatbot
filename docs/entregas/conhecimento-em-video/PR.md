---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
branch: feat/conhecimento-em-video
branch_base: feat/canal-telegram
atualizado_em: 2026-10-01
---

# FT-08 — Base de conhecimento: vídeo (projeto plataforma-chatbot-ia)

O usuário sobe um vídeo ou áudio, ou cola um link do YouTube, e a fala vira uma fonte da base que o agente passa a usar, na nova opção **Vídeo** da aba Conhecimento. O arquivo chega por stream até o disco e é transcrito em partes de 10 minutos por um modelo do OpenRouter, numa fila própria com andamento visível e retomada por parte; o link do YouTube entra pelas legendas do vídeo. O administrador escolhe o modelo de transcrição em Integrações. A transcrição de arquivo gasta créditos do OpenRouter e a tela avisa; o servidor precisa do ffmpeg.

Este PR está empilhado sobre `feat/canal-telegram` (FT-07) para evitar conflito nos arquivos compartilhados (`ambiente.ts`, `.env.example`, `fontes-fila.ts`, `AdicionarFontes.tsx`, CI); a FT-08 depende funcionalmente só da FT-04 (e da FT-02 para a chave do OpenRouter). Sem remoto configurado: nenhum push nem PR foi feito; a descrição está neste arquivo.

## Arquivos alterados

```
./
  M .env.example
  M README.md
.github/workflows/
  M ci.yml
docs/conhecimento-em-video/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/conhecimento-em-video/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A dados-ambiente-e-integracoes.md
  A fila-fontes-e-armazenamento.md
  A midia-ffmpeg.md
  A openrouter-audio.md
  A upload-testes-e-ci.md
  A youtube-legendas.md
docs/conhecimento-em-video/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-em-video/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-em-video/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-em-video/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-em-video/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-em-video/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-em-video/sprint-07/
  A fases.md
  A sprint.md
  A tasks.md
docs/entregas/conhecimento-em-video/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
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
prisma/migrations/20261001000000_conhecimento_em_video/
  A migration.sql
src/app/
  M acoes.ts
src/app/(sistema)/agentes/[id]/conhecimento/
  M page.tsx
src/app/(sistema)/configuracoes/integracoes/
  M page.tsx
src/app/api/agentes/[id]/fontes/video/
  A route.ts
src/app/api/agentes/[id]/fontes/youtube/
  A route.ts
src/componentes/
  M AdicionarFontes.tsx
  A FormularioDoYoutube.tsx
  M Icones.tsx
  M LinhaDeFonte.tsx
  M ListaDeTrechos.tsx
  M PainelDeConhecimento.tsx
  A PainelDeVideo.tsx
  A PainelDoModeloDeTranscricao.tsx
  A ZonaDeVideo.tsx
  M conhecimento-logica.ts
  A enviar-video.ts
  M itens-de-menu.ts
  M opcoes-de-fonte.ts
  A video-logica.ts
src/estilos/
  M global.css
src/lib/
  M ambiente.ts
  M armazenamento.ts
  A midia-formatos.ts
  A midia.ts
  M openrouter.ts
  A youtube-url.ts
  A youtube.ts
src/servicos/
  M fontes-fila.ts
  M fontes.ts
  M integracoes.ts
  A transcricao-de-midia.ts
  A transcricao-marcadores.ts
tests/
  M adicionar-fontes.test.tsx
  M ambiente.test.ts
  A apoio-ffmpeg.test.ts
  A armazenamento-segmentos.test.ts
  A armazenamento-stream.test.ts
  M conhecimento-estilos.test.ts
  M conhecimento-logica.test.ts
  M conhecimento-paginas.test.tsx
  A fontes-fila-video.test.ts
  A fontes-fila-youtube.test.ts
  M fontes-fila.test.ts
  A fontes-video-fim-a-fim.test.ts
  A fontes-video.test.ts
  A fontes-youtube.test.ts
  A integracoes-transcricao.test.ts
  A linha-de-fonte-video.test.tsx
  A midia-extracao.test.ts
  A midia-formatos.test.ts
  A midia-sonda.test.ts
  A openrouter-falso-audio.test.ts
  A openrouter-transcricao.test.ts
  M painel-de-conhecimento.test.tsx
  A painel-de-video.test.tsx
  A painel-modelo-transcricao.test.tsx
  M projeto.test.ts
  A transcricao-de-midia.test.ts
  A transcricao-marcadores.test.ts
  A video-logica.test.ts
  A video-modelo.test.ts
  A video-rota.test.ts
  A youtube-falso.test.ts
  A youtube-legenda.test.ts
  A youtube-pagina.test.ts
  A youtube-rota.test.ts
  A youtube-url.test.ts
tests/apoio/
  A ffmpeg.ts
  M openrouter-falso.ts
  M servir-falso.ts
  A servir-youtube-falso.ts
  A youtube-falso.ts
```

Total: 124 arquivos.

## Origem

Feature FT-08, `conhecimento-em-video`, do projeto `plataforma-chatbot-ia` (premissa PR-09: vídeo entra como transcrição de fala; sem análise das imagens). Plano em `docs/conhecimento-em-video/` (7 sprints, 31 tasks), decisões em `00-DECISOES.md` (todas respondidas pelo buildx) e premissas novas PR-71 a PR-77 em `docs/projeto/PREMISSAS.md`.

## O que foi testado

- T-01.01 — colunas novas por migration que só acrescenta (ela é lida e aplicada do zero)
- T-01.02 — seis variáveis de ambiente com padrão e erro claro para valor inválido
- T-01.03 — OpenRouter simulado reconhece o áudio, com transcrição, falha e atraso por parte
- T-01.04 — apoio que gera mídia com o ffmpeg e faz a ausência dele falhar no CI
- T-01.05 — YouTube simulado com página, legendas em json3 e XML, redirect e tamanho
- T-02.01 — sonda de duração e áudio, limite de minutos, ffmpeg ausente, sem shell
- T-02.02 — extração (MP3 mono 16 kHz) e divisão em partes, com prazo e sem sobra
- T-02.03 — doze extensões e assinatura dos primeiros bytes, com arquivos gerados pelo ffmpeg
- T-02.04 — transcrição pelo OpenRouter: instrução fixa, erros mapeados, prazo, cancelamento
- T-03.01 — gravar em stream com teto de bytes, conferência do início e limpeza em falha
- T-03.02 — pastas de trabalho e segmentos em disco, só com id de alfabeto fechado
- T-03.03 — serviço de envio de vídeo: extensão, assinatura, vazio, tamanho (413), nada fica em falha
- T-03.04 — rota contra o servidor de produção: stream, 401, 413 cedo e por contagem, 415, 422, 404
- T-04.01 — marcadores `[MM:SS]` e montagem do texto das legendas
- T-04.02 — modelo efetivo (banco, ambiente, constante), só admin salva, qualquer um lê
- T-04.03 — transcrição por parte com retomada, repetição do transitório e exclusão no meio
- T-04.04 — fila de duas raias, andamento e erro de parte sem tocar a fonte excluída
- T-04.05 — áudio de 25 s de ponta a ponta com ffmpeg real, falha de parte e Reprocessar
- T-05.01 — id e validação do host da URL (SSRF)
- T-05.02 — página do vídeo, faixas e preferência de idioma
- T-05.03 — legenda com host conferido, um redirect, teto de tamanho e prazo
- T-05.04 — serviço do link: zod, 422, 404, 401, sem falar com o YouTube
- T-05.05 — rota contra o servidor de produção: 202, 401, 415, 422, 413
- T-05.06 — fila do YouTube: título, duração, marcadores, sem legendas, Reprocessar
- T-06.01 — lógica pura da tela: validação, duração, etapa, resposta do envio
- T-06.02 — painel Vídeo com duas abas, barra de progresso e aviso de créditos
- T-06.03 — linha da lista e Ver conteúdo com barra, etapa, duração, link e marcador em destaque
- T-06.04 — campo do modelo de transcrição em Integrações, só admin
- T-07.01 — verificação no navegador (envio, etapas, YouTube, busca, 375 px, tema claro)
- T-07.02 — convenções, lacunas e README, com as citações de linha conferidas por teste
- T-07.03 — fechamento no mapa, premissas, recursão e projeto

Suíte: 2010 testes passando em 151 arquivos (280 novos), verde a cada fechamento de sprint e no HEAD — `npm test`; `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Os testes que usam o ffmpeg o rodam de verdade (pulam sem ele; o CI o instala e exige). Verificação no navegador em [VERIFICACAO-VISUAL.md](../../conhecimento-em-video/VERIFICACAO-VISUAL.md).

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 22 casos. Colaterais a observar: aba Testar (fontes citadas), resumo do topo da aba Conhecimento, cartão da chave do OpenRouter em Integrações, exclusão de agente com áudio, abas Publicar e Canais.

## Onde eu quero seu olho

### OLHO OBRIGATÓRIO — ler linha a linha

- `.github/workflows/ci.yml` — Sem critério de L1 a L3 que descreva mudança de pipeline: vai para OLHO OBRIGATÓRIO pela regra do desempate. Instala o ffmpeg por `sudo apt-get install -y ffmpeg` e liga `EXIGIR_FFMPEG`; só `tests/projeto.test.ts` lê o texto do arquivo, e o CI de verdade nunca rodou
- `prisma/migrations/20261001000000_conhecimento_em_video/migration.sql` — O3 migração de banco: só `ALTER TABLE ... ADD COLUMN` anuláveis em `fontes` e `configuracao_do_workspace`, sem `DROP` (`tests/migracoes.test.ts` e `tests/video-modelo.test.ts` a leem e a aplicam do zero)
- `prisma/schema.prisma` — O3 campos novos de `Fonte` (`progresso`, `etapa`, `duracaoSegundos`, `urlOrigem`) e `modeloDeTranscricao`; tem de bater com a migration
- `src/app/acoes.ts` — O4 ação de servidor que altera configuração do workspace (modelo de transcrição): só admin, conferido no servidor; provada em `tests/painel-modelo-transcricao.test.tsx`
- `src/app/api/agentes/[id]/fontes/video/route.ts` — O5 contrato público novo (`POST ...?nome=` com corpo bruto) e O4 sessão e recusa de tamanho: 401, 413 por `Content-Length` antes de ler, drenagem do corpo recusado; provado contra o servidor de produção em `tests/video-rota.test.ts`
- `src/app/api/agentes/[id]/fontes/youtube/route.ts` — O5 contrato público novo (`POST {url}`) e O4 entrada de usuário que vira requisição de rede: sessão, JSON, teto de 8 KB, URL só do YouTube; provado em `tests/youtube-rota.test.ts`
- `src/componentes/FormularioDoYoutube.tsx` — O6 o envio do formulário (`fetch`, sucesso, erro, limpeza do campo) não tem teste automatizado: só a renderização e a validação pura estão cobertas; visto no navegador com três links
- `src/componentes/ZonaDeVideo.tsx` — O6 a interação (fila de um arquivo por vez, arrastar e soltar, cancelar, resultado do envio) não tem teste automatizado: só a renderização está coberta (`tests/painel-de-video.test.tsx`); visto no navegador com um arquivo, sem arrastar nem cancelar
- `src/componentes/enviar-video.ts` — O6 sem teste direto: o `XMLHttpRequest` do envio (progresso, cancelamento, cabeçalho e corpo bruto) não roda em nenhum teste automatizado; o contrato do outro lado está provado em `tests/video-rota.test.ts`, e a barra foi vista no navegador (`VERIFICACAO-VISUAL.md`)
- `src/lib/ambiente.ts` — O4 controles de segurança e custo lidos do ambiente: `MAX_VIDEO_MB` (teto de 2000 por causa do inteiro de 32 bits), `MAX_VIDEO_MINUTOS`, `YOUTUBE_BASE` (a única origem das requisições ao YouTube) e os caminhos dos binários; `tests/ambiente.test.ts`
- `src/lib/armazenamento.ts` — O4 arquivo vindo do usuário em disco: `gravarDeStream` escreve por stream com teto de bytes, renomeia só depois da conferência e apaga o parcial em qualquer falha; segmentos e pastas só com id de alfabeto fechado; provado em `tests/armazenamento-stream.test.ts` e `tests/armazenamento-segmentos.test.ts`
- `src/lib/midia-formatos.ts` — O4 validação de upload (PR-13): a assinatura real dos primeiros bytes contra a extensão, para arquivo renomeado não passar; provado em `tests/midia-formatos.test.ts` com arquivos gerados pelo ffmpeg
- `src/lib/midia.ts` — O4 execução de processo externo com entrada do usuário: `spawn` com vetor de argumentos, sem shell, só caminhos absolutos internos, prazo com `SIGKILL`, saída de erro nunca repassada; provado em `tests/midia-sonda.test.ts` e `tests/midia-extracao.test.ts` com ffmpeg de verdade
- `src/lib/openrouter.ts` — O5 contrato com o provedor (`input_audio`, resposta sem stream, prazo próprio de 5 minutos) e O4 a chave do workspace nas chamadas; erros `provedor_*` sem repassar corpo nem chave; `tests/openrouter-transcricao.test.ts`
- `src/lib/youtube-url.ts` — O4 SSRF: a única validação da URL do usuário (lista fechada de hosts, esquema, sem credencial nem porta, id de 11 caracteres); também roda no navegador; `tests/youtube-url.test.ts`
- `src/lib/youtube.ts` — O4 SSRF: o servidor faz requisição a destino derivado de entrada do usuário e de uma página de terceiro; `destinoPermitido` confere cada destino antes de conectar, no máximo um redirect, prazo e teto de tamanho; o formato da página não é documentado (lacuna 11); `tests/youtube-legenda.test.ts` e `tests/youtube-pagina.test.ts` provam que o host proibido não recebe conexão
- `src/servicos/fontes-fila.ts` — O2 regra do processamento e do gasto de crédito: duas raias (vídeo com concorrência 1), andamento por `updateMany` condicional, retomada, fonte excluída durante o trabalho, erro de parte, título provisório do YouTube; `tests/fontes-fila-video.test.ts`, `tests/fontes-fila-youtube.test.ts` e `tests/fontes-video-fim-a-fim.test.ts`
- `src/servicos/fontes.ts` — O4 e O5 entrada de upload e visão pública da fonte: `adicionarVideo` confere nome, extensão, assinatura, tamanho declarado e real e limpa em qualquer falha; `adicionarYoutube` valida a URL; `visaoDaFonte` ganhou quatro campos (nunca o caminho do arquivo); `tests/fontes-video.test.ts` e `tests/fontes-youtube.test.ts`
- `src/servicos/integracoes.ts` — O4 configuração do workspace só do admin: `salvarModeloDeTranscricao` valida o nome, exige admin e não toca a chave cifrada; a leitura do modelo em uso vale para qualquer usuário; `tests/integracoes-transcricao.test.ts`
- `src/servicos/transcricao-de-midia.ts` — O2 regra de custo e retomada: repete só falha transitória (até 2 vezes), confere se a fonte existe antes de cada parte, grava cada parte em `segmentos/NN.txt`, apaga o áudio ao fim; `tests/transcricao-de-midia.test.ts` e o fim a fim com ffmpeg real

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` — L2 documentação das seis variáveis novas, sem valor secreto; conferido por `tests/projeto.test.ts`
- `README.md` — L2 documentação da seção de vídeo e das variáveis, conferida por `tests/projeto.test.ts`
- `docs/projeto/MAPA.md` — L2 FT-08 entregue e contadores
- `docs/projeto/PREMISSAS.md` — L2 premissas PR-71 a PR-77 (decisões tomadas em nome do humano, com o que as invalida) e PR-10 e PR-11 realizadas também na FT-08; é onde o revisor confirma ou rejeita a leitura do pedido
- `docs/projeto/PROJETO.md` — L2 contador de features entregues
- `docs/projeto/RECURSAO.md` — L2 PEND-06 e PEND-07 atualizadas: a transcrição real exige chave com saldo e ffmpeg
- `docs/stack/CONVENCOES.md` — L2 regras novas com `arquivo:linha` conferidas por `tests/projeto.test.ts`, e citações antigas refeitas
- `docs/stack/LACUNAS.md` — L2 lacunas novas, a mais importante a fragilidade do YouTube (11); conferido por `tests/projeto.test.ts`
- `src/app/(sistema)/agentes/[id]/conhecimento/page.tsx` — L2 camada isolada: passa à tela os limites de vídeo e o modelo em uso; `tests/rotas.test.ts` e `tests/conhecimento-paginas.test.tsx` cobrem a aba
- `src/app/(sistema)/configuracoes/integracoes/page.tsx` — L2 camada isolada: acrescenta o painel do modelo atrás da guarda de admin que já existia; `tests/rotas.test.ts` cobre a página
- `src/componentes/AdicionarFontes.tsx` — L2 acrescenta o painel `video` ao mapa de painéis e as props de vídeo; `tests/adicionar-fontes.test.tsx` e `tests/painel-de-video.test.tsx`
- `src/componentes/Icones.tsx` — L2 um ícone novo (`video`) em SVG; coberto por `tests/painel-de-video.test.tsx`
- `src/componentes/LinhaDeFonte.tsx` — L2 mostra barra, etapa, duração e o link do YouTube (só se for host do YouTube); `tests/linha-de-fonte-video.test.tsx` e `tests/painel-de-conhecimento.test.tsx`
- `src/componentes/ListaDeTrechos.tsx` — L2 mostra a duração e destaca o marcador de tempo como texto, nunca HTML; `tests/linha-de-fonte-video.test.tsx`
- `src/componentes/PainelDeConhecimento.tsx` — L2 repassa as props de vídeo; `tests/painel-de-conhecimento.test.tsx`
- `src/componentes/PainelDeVideo.tsx` — L3 arquivo novo com os dois testes verdes (`tests/painel-de-video.test.tsx`); a troca de aba por clique e por seta não é exercida por teste
- `src/componentes/PainelDoModeloDeTranscricao.tsx` — L3 arquivo novo com os dois testes verdes (`tests/painel-modelo-transcricao.test.tsx`); a ação que ele chama está em OLHO OBRIGATÓRIO (`src/app/acoes.ts`)
- `src/componentes/conhecimento-logica.ts` — L2 módulo puro: o ícone de vídeo e YouTube; `tests/conhecimento-logica.test.ts`
- `src/componentes/itens-de-menu.ts` — L2 o nome `video` acrescentado ao tipo dos ícones, na mesma linha; `tests/menu.test.ts` e `tsc`
- `src/componentes/opcoes-de-fonte.ts` — L2 a opção Vídeo na lista única; `tests/painel-de-video.test.tsx`
- `src/componentes/video-logica.ts` — L3 arquivo novo, módulo puro, com os dois testes verdes (`tests/video-logica.test.ts`)
- `src/estilos/global.css` — L2 classes novas só com tokens (`tests/tokens.test.ts`, `tests/conhecimento-estilos.test.ts`); inclui a correção da regra `.fonte-item` da FT-05, que passou a valer só em `.fontes-lista` e muda o layout da lista de fontes, visto no navegador
- `src/servicos/transcricao-marcadores.ts` — L3 arquivo novo, funções puras, com os dois testes verdes (`tests/transcricao-marcadores.test.ts`)
- `tests/apoio/ffmpeg.ts` — L3 apoio de teste novo, com `tests/apoio-ffmpeg.test.ts`: decide quando o teste de ffmpeg pula ou falha (`EXIGIR_FFMPEG`)
- `tests/apoio/openrouter-falso.ts` — L2 o simulado ganhou o reconhecimento de `input_audio`; os testes antigos do simulado seguem verdes e `tests/openrouter-falso-audio.test.ts` cobre o novo
- `tests/apoio/servir-falso.ts` — L2 só acrescenta transcrições por parte e atraso ao processo avulso de QA; não é lido por teste automatizado
- `tests/apoio/servir-youtube-falso.ts` — L3 processo avulso de QA novo; não é lido por teste automatizado, foi usado na verificação no navegador
- `tests/apoio/youtube-falso.ts` — L3 apoio de teste novo, com `tests/youtube-falso.test.ts`: o formato do YouTube que ele imita é suposição (lacuna 11)
- `tests/conhecimento-logica.test.ts` — L2 altera asserções existentes: o ícone do tipo `video` e a lista de opções agora incluem Vídeo
- `tests/projeto.test.ts` — L2 só acrescenta casos (variáveis, CI, citações `arquivo:linha`, README), mas a citação de linha é frágil a mudança nos arquivos citados

### DISPENSÁVEL — a máquina já provou

- `docs/conhecimento-em-video/00-AUDITORIA.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/00-BLOQUEIOS.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/00-DECISOES.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/BRIEFING-BUILDX.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/FECHAMENTO.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/ORQUESTRADOR.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/RELATORIO-FEATURE.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/VERIFICACAO-VISUAL.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/00-INDICE.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/00-LACUNAS.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/dados-ambiente-e-integracoes.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/fila-fontes-e-armazenamento.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/midia-ffmpeg.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/openrouter-audio.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/upload-testes-e-ci.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/base/youtube-legendas.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-01/fases.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-01/sprint.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-01/tasks.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-02/fases.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-02/sprint.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-02/tasks.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-03/fases.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-03/sprint.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-03/tasks.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-04/fases.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-04/sprint.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-04/tasks.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-05/fases.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-05/sprint.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-05/tasks.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-06/fases.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-06/sprint.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-06/tasks.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-07/fases.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-07/sprint.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/conhecimento-em-video/sprint-07/tasks.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/entregas/conhecimento-em-video/ATENCAO.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/entregas/conhecimento-em-video/ENTREGA.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/entregas/conhecimento-em-video/PR.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `docs/entregas/conhecimento-em-video/QA-PACOTE.md` — D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código
- `tests/adicionar-fontes.test.tsx` — D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa
- `tests/ambiente.test.ts` — D1 só acrescenta casos das variáveis novas; nenhuma asserção existente muda
- `tests/apoio-ffmpeg.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/armazenamento-segmentos.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/armazenamento-stream.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/conhecimento-estilos.test.ts` — D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa
- `tests/conhecimento-paginas.test.tsx` — D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa
- `tests/fontes-fila-video.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/fontes-fila-youtube.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/fontes-fila.test.ts` — D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa
- `tests/fontes-video-fim-a-fim.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/fontes-video.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/fontes-youtube.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/integracoes-transcricao.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/linha-de-fonte-video.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/midia-extracao.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/midia-formatos.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/midia-sonda.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/openrouter-falso-audio.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/openrouter-transcricao.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/painel-de-conhecimento.test.tsx` — D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa
- `tests/painel-de-video.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/painel-modelo-transcricao.test.tsx` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/transcricao-de-midia.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/transcricao-marcadores.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/video-logica.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/video-modelo.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/video-rota.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/youtube-falso.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/youtube-legenda.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/youtube-pagina.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/youtube-rota.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
- `tests/youtube-url.test.ts` — D1 arquivo de teste novo, só casos novos; a suíte inteira passa
