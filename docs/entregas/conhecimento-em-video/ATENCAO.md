---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
raio: null
olho_obrigatorio: 20
leitura_rapida: 30
dispensavel: 74
atualizado_em: 2026-10-01
---

# Onde gastar atenção — conhecimento-em-video

Branch `feat/conhecimento-em-video` -> `feat/canal-telegram`. Data: 2026-10-01.

**124 arquivos — 20 olho obrigatório, 30 leitura rápida, 74 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação. Tamanho de diff não é critério.

Sem modo legado e sem raio calculado, e sem agente `revisor-diff` neste harness: a classificação veio do tipo de arquivo e da evidência das tasks, aplicada pelo executor, que escreveu o código e não é imparcial. Leia a faixa OLHO OBRIGATÓRIO sem confiar na justificativa. O que decide **o que o servidor aceita do usuário e o que ele executa ou busca por conta própria** está em OLHO OBRIGATÓRIO: o upload em stream e a conferência da assinatura, o processo `ffmpeg` por `spawn`, a leitura do YouTube com a proteção contra SSRF (`destinoPermitido`), o contrato novo com o OpenRouter, a fila (regra de custo, retomada e exclusão no meio do trabalho), a configuração do modelo só pelo admin, a migration e o CI que passa a instalar o ffmpeg. Três arquivos de tela estão ali por O6 e não por risco de segurança: o envio por `XMLHttpRequest` e as interações de `ZonaDeVideo` e `FormularioDoYoutube` não têm teste automatizado, só foram vistos no navegador. Componentes puros e arquivos novos testados em LEITURA RÁPIDA; testes novos e artefatos do método em DISPENSÁVEL, porque a suíte de 2010 testes exerce os primeiros e os segundos não são código. Os artefatos do método não casam com D1 a D3 ao pé da letra: D3 foi estendido a documentos produzidos pelo próprio método, escolha do executor. O memox está instalado e foi consultado em cada arquivo do diff: nenhum tem regressão, reprovação de QA, zona de risco nem dívida registradas (o histórico é de uma feature anterior que tocou `fontes-fila.ts` e arquivos vizinhos), então O9 não subiu faixa nenhuma. O que a revisão humana não substitui: a transcrição real e o YouTube real (PEND-06), a aba Vídeo num celular de verdade (PEND-07), o formato real da página do YouTube (lacuna 11) e o comportamento do modelo real. Os últimos arquivos (`ATENCAO.md`, `PR.md`, `QA-PACOTE.md`) entram na conta porque são criados logo depois desta classificação.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.github/workflows/ci.yml` | M | +5/-0 | Sem critério de L1 a L3 que descreva mudança de pipeline: vai para OLHO OBRIGATÓRIO pela regra do desempate. Instala o ffmpeg por `sudo apt-get install -y ffmpeg` e liga `EXIGIR_FFMPEG`; só `tests/projeto.test.ts` lê o texto do arquivo, e o CI de verdade nunca rodou |
| `prisma/migrations/20261001000000_conhecimento_em_video/migration.sql` | A | +11/-0 | O3 migração de banco: só `ALTER TABLE ... ADD COLUMN` anuláveis em `fontes` e `configuracao_do_workspace`, sem `DROP` (`tests/migracoes.test.ts` e `tests/video-modelo.test.ts` a leem e a aplicam do zero) |
| `prisma/schema.prisma` | M | +10/-0 | O3 campos novos de `Fonte` (`progresso`, `etapa`, `duracaoSegundos`, `urlOrigem`) e `modeloDeTranscricao`; tem de bater com a migration |
| `src/app/acoes.ts` | M | +19/-0 | O4 ação de servidor que altera configuração do workspace (modelo de transcrição): só admin, conferido no servidor; provada em `tests/painel-modelo-transcricao.test.tsx` |
| `src/app/api/agentes/[id]/fontes/video/route.ts` | A | +52/-0 | O5 contrato público novo (`POST ...?nome=` com corpo bruto) e O4 sessão e recusa de tamanho: 401, 413 por `Content-Length` antes de ler, drenagem do corpo recusado; provado contra o servidor de produção em `tests/video-rota.test.ts` |
| `src/app/api/agentes/[id]/fontes/youtube/route.ts` | A | +36/-0 | O5 contrato público novo (`POST {url}`) e O4 entrada de usuário que vira requisição de rede: sessão, JSON, teto de 8 KB, URL só do YouTube; provado em `tests/youtube-rota.test.ts` |
| `src/componentes/FormularioDoYoutube.tsx` | A | +104/-0 | O6 o envio do formulário (`fetch`, sucesso, erro, limpeza do campo) não tem teste automatizado: só a renderização e a validação pura estão cobertas; visto no navegador com três links |
| `src/componentes/ZonaDeVideo.tsx` | A | +202/-0 | O6 a interação (fila de um arquivo por vez, arrastar e soltar, cancelar, resultado do envio) não tem teste automatizado: só a renderização está coberta (`tests/painel-de-video.test.tsx`); visto no navegador com um arquivo, sem arrastar nem cancelar |
| `src/componentes/enviar-video.ts` | A | +26/-0 | O6 sem teste direto: o `XMLHttpRequest` do envio (progresso, cancelamento, cabeçalho e corpo bruto) não roda em nenhum teste automatizado; o contrato do outro lado está provado em `tests/video-rota.test.ts`, e a barra foi vista no navegador (`VERIFICACAO-VISUAL.md`) |
| `src/lib/ambiente.ts` | M | +43/-0 | O4 controles de segurança e custo lidos do ambiente: `MAX_VIDEO_MB` (teto de 2000 por causa do inteiro de 32 bits), `MAX_VIDEO_MINUTOS`, `YOUTUBE_BASE` (a única origem das requisições ao YouTube) e os caminhos dos binários; `tests/ambiente.test.ts` |
| `src/lib/armazenamento.ts` | M | +137/-1 | O4 arquivo vindo do usuário em disco: `gravarDeStream` escreve por stream com teto de bytes, renomeia só depois da conferência e apaga o parcial em qualquer falha; segmentos e pastas só com id de alfabeto fechado; provado em `tests/armazenamento-stream.test.ts` e `tests/armazenamento-segmentos.test.ts` |
| `src/lib/midia-formatos.ts` | A | +71/-0 | O4 validação de upload (PR-13): a assinatura real dos primeiros bytes contra a extensão, para arquivo renomeado não passar; provado em `tests/midia-formatos.test.ts` com arquivos gerados pelo ffmpeg |
| `src/lib/midia.ts` | A | +230/-0 | O4 execução de processo externo com entrada do usuário: `spawn` com vetor de argumentos, sem shell, só caminhos absolutos internos, prazo com `SIGKILL`, saída de erro nunca repassada; provado em `tests/midia-sonda.test.ts` e `tests/midia-extracao.test.ts` com ffmpeg de verdade |
| `src/lib/openrouter.ts` | M | +82/-1 | O5 contrato com o provedor (`input_audio`, resposta sem stream, prazo próprio de 5 minutos) e O4 a chave do workspace nas chamadas; erros `provedor_*` sem repassar corpo nem chave; `tests/openrouter-transcricao.test.ts` |
| `src/lib/youtube-url.ts` | A | +48/-0 | O4 SSRF: a única validação da URL do usuário (lista fechada de hosts, esquema, sem credencial nem porta, id de 11 caracteres); também roda no navegador; `tests/youtube-url.test.ts` |
| `src/lib/youtube.ts` | A | +340/-0 | O4 SSRF: o servidor faz requisição a destino derivado de entrada do usuário e de uma página de terceiro; `destinoPermitido` confere cada destino antes de conectar, no máximo um redirect, prazo e teto de tamanho; o formato da página não é documentado (lacuna 11); `tests/youtube-legenda.test.ts` e `tests/youtube-pagina.test.ts` provam que o host proibido não recebe conexão |
| `src/servicos/fontes-fila.ts` | M | +112/-5 | O2 regra do processamento e do gasto de crédito: duas raias (vídeo com concorrência 1), andamento por `updateMany` condicional, retomada, fonte excluída durante o trabalho, erro de parte, título provisório do YouTube; `tests/fontes-fila-video.test.ts`, `tests/fontes-fila-youtube.test.ts` e `tests/fontes-video-fim-a-fim.test.ts` |
| `src/servicos/fontes.ts` | M | +137/-1 | O4 e O5 entrada de upload e visão pública da fonte: `adicionarVideo` confere nome, extensão, assinatura, tamanho declarado e real e limpa em qualquer falha; `adicionarYoutube` valida a URL; `visaoDaFonte` ganhou quatro campos (nunca o caminho do arquivo); `tests/fontes-video.test.ts` e `tests/fontes-youtube.test.ts` |
| `src/servicos/integracoes.ts` | M | +61/-1 | O4 configuração do workspace só do admin: `salvarModeloDeTranscricao` valida o nome, exige admin e não toca a chave cifrada; a leitura do modelo em uso vale para qualquer usuário; `tests/integracoes-transcricao.test.ts` |
| `src/servicos/transcricao-de-midia.ts` | A | +172/-0 | O2 regra de custo e retomada: repete só falha transitória (até 2 vezes), confere se a fonte existe antes de cada parte, grava cada parte em `segmentos/NN.txt`, apaga o áudio ao fim; `tests/transcricao-de-midia.test.ts` e o fim a fim com ffmpeg real |

## LEITURA RÁPIDA — conferir intenção, não implementação

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.env.example` | M | +24/-0 | L2 documentação das seis variáveis novas, sem valor secreto; conferido por `tests/projeto.test.ts` |
| `README.md` | M | +16/-0 | L2 documentação da seção de vídeo e das variáveis, conferida por `tests/projeto.test.ts` |
| `docs/projeto/MAPA.md` | M | +8/-5 | L2 FT-08 entregue e contadores |
| `docs/projeto/PREMISSAS.md` | M | +96/-5 | L2 premissas PR-71 a PR-77 (decisões tomadas em nome do humano, com o que as invalida) e PR-10 e PR-11 realizadas também na FT-08; é onde o revisor confirma ou rejeita a leitura do pedido |
| `docs/projeto/PROJETO.md` | M | +2/-2 | L2 contador de features entregues |
| `docs/projeto/RECURSAO.md` | M | +5/-5 | L2 PEND-06 e PEND-07 atualizadas: a transcrição real exige chave com saldo e ffmpeg |
| `docs/stack/CONVENCOES.md` | M | +21/-13 | L2 regras novas com `arquivo:linha` conferidas por `tests/projeto.test.ts`, e citações antigas refeitas |
| `docs/stack/LACUNAS.md` | M | +2/-0 | L2 lacunas novas, a mais importante a fragilidade do YouTube (11); conferido por `tests/projeto.test.ts` |
| `src/app/(sistema)/agentes/[id]/conhecimento/page.tsx` | M | +9/-1 | L2 camada isolada: passa à tela os limites de vídeo e o modelo em uso; `tests/rotas.test.ts` e `tests/conhecimento-paginas.test.tsx` cobrem a aba |
| `src/app/(sistema)/configuracoes/integracoes/page.tsx` | M | +5/-2 | L2 camada isolada: acrescenta o painel do modelo atrás da guarda de admin que já existia; `tests/rotas.test.ts` cobre a página |
| `src/componentes/AdicionarFontes.tsx` | M | +16/-3 | L2 acrescenta o painel `video` ao mapa de painéis e as props de vídeo; `tests/adicionar-fontes.test.tsx` e `tests/painel-de-video.test.tsx` |
| `src/componentes/Icones.tsx` | M | +6/-0 | L2 um ícone novo (`video`) em SVG; coberto por `tests/painel-de-video.test.tsx` |
| `src/componentes/LinhaDeFonte.tsx` | M | +22/-1 | L2 mostra barra, etapa, duração e o link do YouTube (só se for host do YouTube); `tests/linha-de-fonte-video.test.tsx` e `tests/painel-de-conhecimento.test.tsx` |
| `src/componentes/ListaDeTrechos.tsx` | M | +23/-1 | L2 mostra a duração e destaca o marcador de tempo como texto, nunca HTML; `tests/linha-de-fonte-video.test.tsx` |
| `src/componentes/PainelDeConhecimento.tsx` | M | +15/-1 | L2 repassa as props de vídeo; `tests/painel-de-conhecimento.test.tsx` |
| `src/componentes/PainelDeVideo.tsx` | A | +68/-0 | L3 arquivo novo com os dois testes verdes (`tests/painel-de-video.test.tsx`); a troca de aba por clique e por seta não é exercida por teste |
| `src/componentes/PainelDoModeloDeTranscricao.tsx` | A | +78/-0 | L3 arquivo novo com os dois testes verdes (`tests/painel-modelo-transcricao.test.tsx`); a ação que ele chama está em OLHO OBRIGATÓRIO (`src/app/acoes.ts`) |
| `src/componentes/conhecimento-logica.ts` | M | +3/-1 | L2 módulo puro: o ícone de vídeo e YouTube; `tests/conhecimento-logica.test.ts` |
| `src/componentes/itens-de-menu.ts` | M | +1/-1 | L2 o nome `video` acrescentado ao tipo dos ícones, na mesma linha; `tests/menu.test.ts` e `tsc` |
| `src/componentes/opcoes-de-fonte.ts` | M | +6/-0 | L2 a opção Vídeo na lista única; `tests/painel-de-video.test.tsx` |
| `src/componentes/video-logica.ts` | A | +98/-0 | L3 arquivo novo, módulo puro, com os dois testes verdes (`tests/video-logica.test.ts`) |
| `src/estilos/global.css` | M | +8/-1 | L2 classes novas só com tokens (`tests/tokens.test.ts`, `tests/conhecimento-estilos.test.ts`); inclui a correção da regra `.fonte-item` da FT-05, que passou a valer só em `.fontes-lista` e muda o layout da lista de fontes, visto no navegador |
| `src/servicos/transcricao-marcadores.ts` | A | +54/-0 | L3 arquivo novo, funções puras, com os dois testes verdes (`tests/transcricao-marcadores.test.ts`) |
| `tests/apoio/ffmpeg.ts` | A | +109/-0 | L3 apoio de teste novo, com `tests/apoio-ffmpeg.test.ts`: decide quando o teste de ffmpeg pula ou falha (`EXIGIR_FFMPEG`) |
| `tests/apoio/openrouter-falso.ts` | M | +67/-1 | L2 o simulado ganhou o reconhecimento de `input_audio`; os testes antigos do simulado seguem verdes e `tests/openrouter-falso-audio.test.ts` cobre o novo |
| `tests/apoio/servir-falso.ts` | M | +11/-0 | L2 só acrescenta transcrições por parte e atraso ao processo avulso de QA; não é lido por teste automatizado |
| `tests/apoio/servir-youtube-falso.ts` | A | +60/-0 | L3 processo avulso de QA novo; não é lido por teste automatizado, foi usado na verificação no navegador |
| `tests/apoio/youtube-falso.ts` | A | +248/-0 | L3 apoio de teste novo, com `tests/youtube-falso.test.ts`: o formato do YouTube que ele imita é suposição (lacuna 11) |
| `tests/conhecimento-logica.test.ts` | M | +4/-4 | L2 altera asserções existentes: o ícone do tipo `video` e a lista de opções agora incluem Vídeo |
| `tests/projeto.test.ts` | M | +111/-0 | L2 só acrescenta casos (variáveis, CI, citações `arquivo:linha`, README), mas a citação de linha é frágil a mudança nos arquivos citados |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/conhecimento-em-video/00-AUDITORIA.md` | A | +21/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/00-BLOQUEIOS.md` | A | +14/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/00-DECISOES.md` | A | +196/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/BRIEFING-BUILDX.md` | A | +46/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/FECHAMENTO.md` | A | +36/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/ORQUESTRADOR.md` | A | +103/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/RELATORIO-FEATURE.md` | A | +44/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/VERIFICACAO-VISUAL.md` | A | +39/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/00-INDICE.md` | A | +41/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/00-LACUNAS.md` | A | +12/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/dados-ambiente-e-integracoes.md` | A | +36/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/fila-fontes-e-armazenamento.md` | A | +41/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/midia-ffmpeg.md` | A | +35/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/openrouter-audio.md` | A | +36/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/upload-testes-e-ci.md` | A | +35/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/base/youtube-legendas.md` | A | +34/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-01/fases.md` | A | +86/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-01/sprint.md` | A | +40/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-01/tasks.md` | A | +178/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-02/fases.md` | A | +81/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-02/sprint.md` | A | +39/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-02/tasks.md` | A | +146/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-03/fases.md` | A | +83/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-03/sprint.md` | A | +39/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-03/tasks.md` | A | +146/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-04/fases.md` | A | +86/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-04/sprint.md` | A | +39/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-04/tasks.md` | A | +178/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-05/fases.md` | A | +90/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-05/sprint.md` | A | +39/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-05/tasks.md` | A | +210/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-06/fases.md` | A | +83/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-06/sprint.md` | A | +39/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-06/tasks.md` | A | +146/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-07/fases.md` | A | +80/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-07/sprint.md` | A | +39/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/conhecimento-em-video/sprint-07/tasks.md` | A | +114/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/entregas/conhecimento-em-video/ATENCAO.md` | A | criado depois | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/entregas/conhecimento-em-video/ENTREGA.md` | A | +137/-0 | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/entregas/conhecimento-em-video/PR.md` | A | criado depois | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `docs/entregas/conhecimento-em-video/QA-PACOTE.md` | A | criado depois | D3 estendido: documento produzido pelo próprio método (plano, base, decisões, auditoria, verificação, registro da entrega), não é código |
| `tests/adicionar-fontes.test.tsx` | M | +3/-2 | D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa |
| `tests/ambiente.test.ts` | M | +44/-2 | D1 só acrescenta casos das variáveis novas; nenhuma asserção existente muda |
| `tests/apoio-ffmpeg.test.ts` | A | +64/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/armazenamento-segmentos.test.ts` | A | +74/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/armazenamento-stream.test.ts` | A | +146/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/conhecimento-estilos.test.ts` | M | +3/-0 | D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa |
| `tests/conhecimento-paginas.test.tsx` | M | +4/-0 | D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa |
| `tests/fontes-fila-video.test.ts` | A | +186/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/fontes-fila-youtube.test.ts` | A | +119/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/fontes-fila.test.ts` | M | +1/-1 | D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa |
| `tests/fontes-video-fim-a-fim.test.ts` | A | +146/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/fontes-video.test.ts` | A | +147/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/fontes-youtube.test.ts` | A | +88/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/integracoes-transcricao.test.ts` | A | +81/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/linha-de-fonte-video.test.tsx` | A | +165/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/midia-extracao.test.ts` | A | +83/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/midia-formatos.test.ts` | A | +92/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/midia-sonda.test.ts` | A | +86/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/openrouter-falso-audio.test.ts` | A | +105/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/openrouter-transcricao.test.ts` | A | +84/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/painel-de-conhecimento.test.tsx` | M | +5/-1 | D2 alteração mecânica em teste existente (props e campos novos nas fábricas, arquivo novo na lista de classes, título de caso), sem mudar asserção; a suíte inteira passa |
| `tests/painel-de-video.test.tsx` | A | +126/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/painel-modelo-transcricao.test.tsx` | A | +112/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/transcricao-de-midia.test.ts` | A | +210/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/transcricao-marcadores.test.ts` | A | +88/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/video-logica.test.ts` | A | +98/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/video-modelo.test.ts` | A | +69/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/video-rota.test.ts` | A | +161/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/youtube-falso.test.ts` | A | +78/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/youtube-legenda.test.ts` | A | +131/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/youtube-pagina.test.ts` | A | +101/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/youtube-rota.test.ts` | A | +100/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |
| `tests/youtube-url.test.ts` | A | +82/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa |

## Fontes consultadas

- `git diff --name-status` e `--numstat` contra `feat/canal-telegram` (três pontos): arquivos, tipo e tamanho.
- `docs/conhecimento-em-video/sprint-*/tasks.md`: que task tocou cada arquivo e os dois testes de cada uma.
- `docs/stack/CONVENCOES.md`: camadas e o que o repositório gera automaticamente (nada gerado entrou no diff: nenhum lockfile, nenhum cliente gerado).
- `.claude/skills/memox/assets/memox.py arquivo`, rodado em cada arquivo do diff: sem sinais que subam faixa.
- Suíte inteira verde no HEAD (2010 testes) e `docs/conhecimento-em-video/VERIFICACAO-VISUAL.md`: o que foi visto no navegador.

## Fontes ausentes

- `docs/legado/PERFIL.md`, raio, caracterização, plano de reversão: o projeto não está em modo legado; O1, O7, O8 e L1 não se aplicam.
- Relatório de cobertura: não há provedor de cobertura (lacuna 2 de `docs/stack/LACUNAS.md`); O6 foi decidido pelas tasks e pelos testes que existem, não por linha coberta.
- Agente `revisor-diff`: não existe neste harness; a classificação não é independente de quem implementou.
