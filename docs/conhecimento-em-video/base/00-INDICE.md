---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
atualizado_em: 2026-09-30
areas:
  - arquivo: openrouter-audio.md
    titulo: OpenRouter, entrada de áudio para transcrição
    lacunas: 3
  - arquivo: youtube-legendas.md
    titulo: YouTube, legendas pela página do vídeo
    lacunas: 2
  - arquivo: midia-ffmpeg.md
    titulo: ffmpeg e ffprobe, sondar, extrair e dividir áudio
    lacunas: 1
  - arquivo: fila-fontes-e-armazenamento.md
    titulo: Fila de fontes, serviço, armazenamento e extração
    lacunas: 0
  - arquivo: dados-ambiente-e-integracoes.md
    titulo: Dados, ambiente, integrações e tela de configuração
    lacunas: 0
  - arquivo: upload-testes-e-ci.md
    titulo: Handler de upload, apoio de teste e CI
    lacunas: 1
---

# Índice da base — conhecimento-em-video

Modo EXTERNO (OpenRouter áudio, YouTube, ffmpeg) mais INTERNO (código das FT-02 e FT-04). Briefing em `../BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `openrouter-audio.md` | API externa | Parte `input_audio` em base64, formatos, erros mapeados, prazos que não bastam para transcrição. |
| `youtube-legendas.md` | Site externo | Mecanismo não oficial (página e `captionTracks`), risco de SSRF e fragilidade. |
| `midia-ffmpeg.md` | Binário externo | Comandos provados numa senoide, limites, erro de binário ausente, CI sem ffmpeg. |
| `fila-fontes-e-armazenamento.md` | Serviços | `formatoDaFonte`, concorrência, retomada, armazenamento que só grava em memória. |
| `dados-ambiente-e-integracoes.md` | Dados e tela | Campos que faltam em `Fonte` e na configuração, ambiente, opções de fonte e integrações. |
| `upload-testes-e-ci.md` | Borda e testes | Handler de fontes com `formData`, simulados, `subirServidor`, CI. |
