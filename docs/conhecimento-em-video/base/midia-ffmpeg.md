# ffmpeg e ffprobe: sondar, extrair e dividir áudio (modo EXTERNO)

## 1. Contrato de entrada

- Binários externos `ffmpeg` e `ffprobe`, caminhos por `FFMPEG_PATH` e `FFPROBE_PATH` (padrão pelo nome, `PATH`). Versão disponível na máquina de desenvolvimento: ffmpeg 8.0.1 em `/opt/homebrew/bin` (`ffmpeg -version`, 2026-09-30); a do CI será a do pacote `apt` da imagem `ubuntu-latest` (versão NÃO DOCUMENTADA).
- Chamadas previstas, sempre por `spawn` com vetor de argumentos (sem shell): `ffprobe -v error -show_entries format=duration:stream=codec_type -of json <arquivo>`; `ffmpeg -i <arquivo> -vn -ac 1 -ar 16000 -c:a libmp3lame -b:a 32k <saida.mp3>`; divisão com `-f segment -segment_time 600`. Os parâmetros são conhecimento do ffmpeg em uso, não documentação consultada nesta sessão: serão provados por teste com mídia gerada por `lavfi`.
- Mídia de teste: `ffmpeg -f lavfi -i sine=frequency=440:duration=3 ...`; `libmp3lame` presente nesta máquina (provado na T de `midia`; verificação inicial `ffmpeg -encoders` pendente).

## 2. Contrato de saída

- `ffprobe` devolve JSON com `format.duration` (texto em segundos) e a lista de `streams[].codec_type`; arquivo sem faixa de áudio: nenhum stream `audio`.
- `ffmpeg` grava o MP3 e sai com código 0; código diferente de zero em arquivo corrompido, com mensagem em `stderr` (conteúdo NÃO DOCUMENTADO, nunca repassado ao usuário).

## 3. Limites e cotas

- Limites do projeto: duração máxima `MAX_VIDEO_MINUTOS` (padrão 180), segmento de 10 minutos, MP3 mono 16 kHz 32 kbps (briefing); timeout por processo (valor a decidir na F2).
- 180 minutos a 32 kbps dão cerca de 43 MB de MP3 em disco; 18 segmentos de cerca de 2,4 MB (cálculo: 32 000 bit/s x 600 s / 8).

## 4. Erros conhecidos e tratamento

- Binário ausente: `spawn` emite `ENOENT`; mensagem do briefing `Não encontrei o ffmpeg neste servidor. Instale o ffmpeg ou use a imagem de contêiner do projeto.`
- Arquivo corrompido ou sem áudio: erro claro por código de saída e pela sonda; sem repassar `stderr`.
- Processo travado: matar por timeout e limpar temporários.

## 5. Riscos para a nossa implementação

- Injeção de argumento: nome de arquivo do usuário nunca vai ao comando; só caminhos internos gerados pelo servidor (`<STORAGE_DIR>/fontes/<agenteId>/<fonteId>/...`, ids de alfabeto fechado, `src/lib/armazenamento.ts:15-16`); um caminho começando por `-` é impossível porque a raiz é absoluta.
- `stderr` e `stdout` grandes: ler com teto para não estourar a memória.
- O CI hoje não tem ffmpeg (`.github/workflows/ci.yml`); precisa de `sudo apt-get install -y ffmpeg` e de `EXIGIR_FFMPEG=1`.
- Disco: áudio extraído e segmentos são temporários e saem ao concluir.
- `ffprobe` confia no contêiner do arquivo; a assinatura dos primeiros bytes é conferida antes (briefing), não substitui a sonda.

## 6. Fonte

Briefing; `ffmpeg -version` e execução local (2026-09-30); `src/lib/armazenamento.ts`; `.github/workflows/ci.yml`.
