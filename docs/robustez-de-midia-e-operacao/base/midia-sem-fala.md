# Transcrição de vídeo: trecho sem fala

## Contrato de entrada

`transcreverMidia(pedido)` sonda o original, divide o áudio em partes de 600 s (`src/lib/midia.ts:175`) e chama `transcreverParte` para cada parte sem segmento em disco (`src/servicos/transcricao-de-midia.ts:81-129`). `transcreverParte` repete a chamada de `transcreverAudio` até 2 vezes (`:138`, `repeticoes` padrão 2) quando o erro é transitório, e o conjunto de códigos transitórios **inclui `transcricao_vazia`** (`:62`). `transcreverAudio` lança `transcricao_vazia` (502, "O modelo não devolveu texto para este trecho do áudio.") quando o texto devolvido é vazio depois de `trim` (`src/lib/openrouter.ts:249-266`).

## Contrato de saída

Cada parte gravada vai para `segmentos/NN.txt` por `gravarSegmento` (`src/lib/armazenamento.ts:109-116`, nome com dois dígitos `:210-215`); a retomada pula os índices já em `listarSegmentos` (`:127-135`; `transcricao-de-midia.ts:96-97,113`). A montagem lê cada segmento e chama `juntarPartes`, que **descarta parte vazia** e põe `[MM:SS]` no começo das demais (`src/servicos/transcricao-marcadores.ts:24-31`). Se tudo ficar vazio, a fila lança `Não encontrei fala neste arquivo para transcrever.` (422, `transcricao_vazia`) (`src/servicos/fontes-fila.ts:168-171`).

## Limites e cotas

Partes de 600 s (`src/lib/midia.ts:175`); repetições 2 e espera 2000 ms por tentativa (`transcricao-de-midia.ts:138-139`); prazo por chamada 5 minutos (`TEMPO_DA_TRANSCRICAO_MS`, `src/lib/openrouter.ts`). Todo número da ressalva "10 minutos" vem de `midia.ts:175`.

## Erros conhecidos e tratamento

Hoje um trecho mudo repete 3 vezes (gasta crédito) e então lança `Falha na parte N de M: O modelo não devolveu texto para este trecho do áudio.` (`transcricao-de-midia.ts:165-166`), e a fonte inteira vira `erro` (lacuna 13 de `docs/stack/LACUNAS.md`). O Reprocessar retoma, mas bate de novo na mesma parte. Testes existentes: `tests/transcricao-de-midia.test.ts:74`, `tests/fontes-video-fim-a-fim.test.ts:67`, `tests/fontes-fila-video.test.ts`, `tests/video-modelo.test.ts`; o OpenRouter falso devolve "Transcrição simulada da parte N." quando `transcricoes` não define o índice (`tests/apoio/openrouter-falso.ts:284`) e não tem como devolver texto vazio hoje.

## Riscos para a nossa implementação

(1) Gravar `[sem fala]` como segmento muda `juntarPartes`, que hoje ignora vazio: o marcador de tempo precisa aparecer mesmo assim para o segmento mudo. (2) O texto final entra em `normalizarTexto` e `dividirEmTrechos`, que indexam no FTS5 (`src/servicos/recuperacao.ts`): um trecho só com `[00:10:00] [sem fala]` viraria resultado de busca inútil; a decisão (excluir do índice ou aceitar de modo inofensivo) precisa de teste. (3) A fonte só deve falhar se **nenhum** segmento tiver fala. (4) A retomada reaproveita segmentos: um segmento `[sem fala]` já gravado não pode ser repetido (nem pago de novo) e não pode contar como fala. (5) `repeticoes` com `transcricao_vazia` hoje gasta crédito em trecho sabidamente mudo; mexer nisso muda testes de repetição.

## Fonte

`src/servicos/transcricao-de-midia.ts`, `src/servicos/transcricao-marcadores.ts`, `src/servicos/fontes-fila.ts`, `src/lib/openrouter.ts`, `src/lib/armazenamento.ts`, `src/lib/midia.ts`, `tests/apoio/openrouter-falso.ts`, `docs/conhecimento-em-video/`, `docs/stack/LACUNAS.md` (lacuna 13) — acessado em 2026-10-01
