# OpenRouter: entrada de áudio para transcrição (modo EXTERNO)

## 1. Contrato de entrada

- `POST {OPENROUTER_BASE_URL}/chat/completions` com `messages[].content` como lista de partes: `{type:'text', text}` e `{type:'input_audio', input_audio:{data, format}}` (https://openrouter.ai/docs/guides/overview/multimodal/audio.md, acessado em 2026-09-30).
- `data` é o áudio em base64; "direct URLs are not supported for audio content" (mesma fonte).
- Formatos citados: `wav`, `mp3`, `aiff`, `aac`, `ogg`, `flac`, `m4a`, `pcm16`, `pcm24`; "vary by provider" (mesma fonte). O formato aceito por cada modelo: NÃO DOCUMENTADO além disso.
- Modelo de exemplo da documentação: `google/gemini-2.5-flash` (mesma fonte). Os modelos com entrada de áudio se filtram pela página de modelos (mesma fonte); `GET /models` do projeto devolve só `id`, `name` e `context_length` (`src/lib/openrouter.ts:98-113`), sem modalidade: o projeto não consegue filtrar por áudio.
- Cabeçalhos do projeto: `HTTP-Referer`, `X-Title`, `Authorization` (`src/lib/openrouter.ts:34-41`).

## 2. Contrato de saída

- Sem `stream`, resposta `choices[0].message.content` com o texto (formato já usado pelo servidor simulado, `tests/apoio/openrouter-falso.ts:211-222`).
- Tamanho máximo de resposta (tokens de saída) para uma transcrição longa: NÃO DOCUMENTADO; sem `max_tokens` o provedor usa o padrão do modelo.

## 3. Limites e cotas

- Tamanho máximo do corpo base64 e duração máxima do áudio por modelo: NÃO DOCUMENTADO na página consultada. O projeto divide em segmentos de 10 minutos de MP3 mono 16 kHz a 32 kbps (cerca de 2,4 MB por segmento, 3,2 MB em base64) por decisão do briefing.
- Prazos hoje: 15 s curto, 30 s até o primeiro byte, 120 s total de conversa (`src/lib/openrouter.ts:23`, `:142-160`); uma transcrição não cabe nos 30 s: precisa de timeout longo próprio.

## 4. Erros conhecidos e tratamento

- Status do provedor mapeados por `erroDoProvedor`: 401 chave, 402 saldo, 400/404 modelo, 429 limite, timeout, demais indisponível (`src/lib/erros.ts:45-93`); o corpo do erro é descartado de propósito (`src/lib/openrouter.ts:62-65`).
- Modelo sem suporte a áudio: o status devolvido (400 provável) NÃO DOCUMENTADO; cairia em `provedor_modelo_invalido`.
- Resposta 200 com `content` vazio: NÃO DOCUMENTADO; o projeto deve tratar como falha da parte.

## 5. Riscos para a nossa implementação

- Custo: a transcrição consome créditos da chave do workspace; a interface deve avisar.
- A resposta pode vir com comentários ("Aqui está a transcrição") apesar da instrução; mitigação é a instrução fixa e não limpar o texto agressivamente.
- Modelos diferem em aceitar `mp3`; escolher MP3 (formato citado e universal) e o padrão Gemini Flash.
- `chamarProvedor` já recebe `tempoLimiteMs` e `sinal` (`src/lib/openrouter.ts:49-59`): `transcreverAudio` reutiliza com prazo maior; sem stream, o corpo `json()` é lido depois dos cabeçalhos e o prazo só cobre os cabeçalhos (`:46`): é preciso um prazo total próprio.

## 6. Fonte

https://openrouter.ai/docs/guides/overview/multimodal/audio.md (2026-09-30); `src/lib/openrouter.ts`; `src/lib/erros.ts`; `tests/apoio/openrouter-falso.ts`.
