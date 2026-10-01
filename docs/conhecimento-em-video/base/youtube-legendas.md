# YouTube: legendas pela página do vídeo (modo EXTERNO)

## 1. Contrato de entrada

- URLs de vídeo aceitas pelo briefing: `youtube.com/watch?v=ID`, `youtu.be/ID`, `/shorts/ID`, `/embed/ID`. O formato do id (11 caracteres de `[A-Za-z0-9_-]`): conhecimento comum, NÃO DOCUMENTADO em fonte oficial consultada.
- Não há API oficial usada. A YouTube Data API v3 exige chave e, para baixar legenda (`captions.download`), autorização do dono do vídeo; por isso a premissa PR-09 e o briefing pedem as legendas da própria página. Esta afirmação sobre a API não foi verificada em fonte nesta sessão (a documentação do Google não foi consultada): NÃO DOCUMENTADO.
- Mecanismo previsto (não oficial): a página `watch?v=ID` traz o objeto `ytInitialPlayerResponse` com `captions.playerCaptionsTracklistRenderer.captionTracks[]` (campos `baseUrl`, `languageCode`, `kind` = `asr` para automática, `name.simpleText`) e `videoDetails.title`; a `baseUrl` devolve a legenda (XML `<text start dur>` ou, com `fmt=json3`, `events[].segs[].utf8`). Nenhuma fonte oficial afirma isto: NÃO DOCUMENTADO; é engenharia reversa do site, por isso frágil. A página real não foi acessada nesta sessão (testes nunca usam a rede real).

## 2. Contrato de saída

- O projeto precisa de: título do vídeo (título sugerido), lista de faixas (idioma, manual ou automática) e o texto da faixa escolhida com o tempo de início de cada fala.
- Formato exato do XML/JSON real: NÃO DOCUMENTADO; o `youtube-falso` usará fixtures que imitam o formato descrito acima.

## 3. Limites e cotas

- Limites de taxa do site e bloqueio por IP/consentimento (página de consentimento da UE, captcha): NÃO DOCUMENTADO.
- Limites do projeto, por decisão do briefing: só hosts `youtube.com` e `www.youtube.com`; seguir `baseUrl` só se o host for `*.youtube.com`; no máximo uma volta de redirect; timeout e teto de tamanho da resposta (valores a decidir na F2).

## 4. Erros conhecidos e tratamento

- Vídeo sem legendas: erro claro `Este vídeo não tem legendas disponíveis. Baixe o vídeo e envie o arquivo para transcrever.` (texto do briefing).
- Vídeo privado, removido, restrito por idade ou região: comportamento da página NÃO DOCUMENTADO; tratar como "não foi possível ler o vídeo".
- Mudança de formato: a análise falha; o erro deve ser claro e a fragilidade registrada como lacuna e premissa.

## 5. Riscos para a nossa implementação

- SSRF: a URL é do usuário e o servidor faz a requisição; é o maior risco de segurança da feature. Controle por host exato antes de qualquer conexão, e conferência do host da `baseUrl` da legenda e de cada redirect (briefing).
- A base do simulado de teste (`YOUTUBE_BASE`) não pode afrouxar a regra em produção: só vale fora de produção, como `TELEGRAM_PERMITIR_URL_NAO_HTTPS` (`src/lib/ambiente.ts:117-120`).
- O texto das legendas é conteúdo de terceiros: já entra no chunking como dado e no prompt dentro do bloco higienizado (`src/servicos/chat-prompt.ts`, PR-52).
- Legenda automática traz repetições e sem pontuação; o recorte em trechos por tempo ajuda a busca.

## 6. Fonte

Briefing `docs/conhecimento-em-video/BRIEFING-BUILDX.md`; `docs/projeto/PREMISSAS.md` PR-09; padrão de SSRF/ambiente de `src/lib/ambiente.ts`. Nenhuma documentação oficial do YouTube acessada (2026-09-30).
