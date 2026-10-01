---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-08 Base de conhecimento: vídeo

## Problema

O usuário sobe um vídeo ou áudio, ou cola um link do YouTube, e a fala vira uma fonte da base que o agente passa a usar.

## Escopo

1. Modelo: migration só acrescenta em `Fonte` (`progresso` 0–100 opcional, `etapa` texto curto, `duracaoSegundos` opcional, `urlOrigem`) e em `ConfiguracaoDoWorkspace` (`modeloDeTranscricao`, com padrão por constante e `OPENROUTER_MODELO_TRANSCRICAO` como padrão de ambiente). Os tipos `video` e `youtube` de `Fonte` já estão reservados.
2. Upload de vídeo/áudio em streaming: `POST /api/agentes/[id]/fontes/video?nome=…` (sessão obrigatória), corpo bruto escrito em disco por stream (temporário, depois move), contagem de bytes com abortar acima de `MAX_VIDEO_MB` (padrão 500), `Content-Length` acima do limite recusado cedo (413); extensões `.mp4 .mov .m4v .webm .mkv .avi .mp3 .wav .m4a .ogg .aac .flac` com conferência da assinatura real dos primeiros bytes; vazio ou incoerente 415/422; nome só no banco, sanitizado; limpeza do temporário em qualquer falha. Cliente com barra de progresso real do envio.
3. Pipeline de áudio `src/lib/midia.ts` (spawn com vetor de argumentos, nunca shell; `FFMPEG_PATH`/`FFPROBE_PATH`): `sondar` (duração, faixa de áudio, `MAX_VIDEO_MINUTOS` padrão 180), `extrairAudio` (mono, 16 kHz, MP3 ~32 kbps), divisão em segmentos de 10 minutos, timeout por processo, erro claro com binário ausente, limpeza de temporários. CI instala ffmpeg e exige (`EXIGIR_FFMPEG=1`).
4. Transcrição pelo OpenRouter: `transcreverAudio` em `src/lib/openrouter.ts` (`input_audio`, sem stream, timeout longo, erros `provedor_*`); extensão do servidor simulado `tests/apoio/openrouter-falso.ts`.
5. Fila e retomada em `src/servicos/fontes-fila.ts`: `video` e `youtube`, concorrência 1 para vídeo sem bloquear texto e arquivos, `etapa` e `progresso` no banco, parciais por segmento em disco para retomar, junção com marcador de tempo `[00:00]`, mesmo chunking e índice FTS5, falha de parte vira `erro` com a parte indicada, Reprocessar retoma.
6. YouTube por legendas em `src/lib/youtube.ts` (ids de `watch?v=`, `youtu.be/`, `/shorts/`, `/embed/`; preferência de faixa; título sugerido; proteção SSRF por host; um redirect; timeout e limite de resposta; erro claro sem legendas) e `tests/apoio/youtube-falso.ts`; `POST /api/agentes/[id]/fontes/youtube` (`{url}`, zod, host estranho 422). Fragilidade registrada como lacuna e premissa.
7. UI: opção Vídeo com abas "Enviar arquivo" e "Link do YouTube", aviso de consumo de créditos, lista com ícone, barra de progresso e etapa, duração, link de origem, erro, Reprocessar e Excluir; "Ver conteúdo" com marcadores de tempo; campo Modelo de transcrição em Configurações > Integrações (admin); estados vazio/carregando/erro, acessível, 375px, tokens, temas claro e escuro.
8. Operação: README e `.env.example` com `MAX_VIDEO_MB`, `MAX_VIDEO_MINUTOS`, `FFMPEG_PATH`, `FFPROBE_PATH`, `OPENROUTER_MODELO_TRANSCRICAO` e o requisito de ffmpeg; premissas novas; lacunas e convenções; PEND-06 no RECURSAO.
9. Verificação ponta a ponta no navegador (app de produção, OpenRouter falso, YouTube falso).

## Não-objetivos

Análise das imagens do vídeo e OCR (fora de escopo do projeto); histórico de conversas (FT-09); privacidade e auditoria (FT-10); contêiner, saúde e backup (FT-11, que só recebe a nota de dependência de ffmpeg); chat embutido (FT-06) e Telegram (FT-07), já entregues; download de vídeo do YouTube e transcrição do áudio dele; busca semântica; novos canais.

## Critérios de aceite de negócio cobertos

- Subo um vídeo e vejo passar de "processando" para "pronto".
- O agente responde com base no que subi e mostra de quais fontes tirou a resposta.
- A interface funciona no celular e nos temas claro e escuro.

## Premissas aplicáveis

PR-09 (realiza); PR-05, PR-10, PR-11, PR-13, PR-14 (reaproveita); PR-12, PR-22, PR-23, PR-26, PR-38, PR-45 a PR-49 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
