# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Formato real da legenda e da página do YouTube (`ytInitialPlayerResponse`, `captionTracks`, XML e `json3`): `NÃO DOCUMENTADO` em fonte oficial; nenhuma página real foi acessada. Será fixado em fixture e registrado como fragilidade (lacuna de convenção e premissa). (youtube-legendas)
2. API oficial do YouTube para baixar legendas: documentação do Google não consultada; `NÃO DOCUMENTADO`. (youtube-legendas)
3. Limite de duração, de tamanho do corpo e formatos de áudio aceitos por modelo no OpenRouter: `NÃO DOCUMENTADO` na página consultada; o projeto escolhe MP3 de segmentos de 10 minutos. (openrouter-audio)
4. Como identificar, pela lista de modelos do OpenRouter (`GET /models`), quais aceitam entrada de áudio: o adaptador só lê `id`, `name`, `context_length`; `NÃO DOCUMENTADO`; o seletor de modelo de transcrição será livre com padrão e aviso. (openrouter-audio)
5. Status devolvido por modelo sem suporte a áudio e resposta vazia: `NÃO DOCUMENTADO`. (openrouter-audio)
6. Comportamento de corpo de requisição em stream de grande tamanho em `next start` (Next 16.3.8): `NÃO DOCUMENTADO` nos arquivos do projeto; será provado por teste. (upload-testes-e-ci)
7. Versão do ffmpeg que o `ubuntu-latest` instala: `NÃO DOCUMENTADO`. (midia-ffmpeg)
8. Contexto histórico do `memox`: não consultado; a ausência não é lacuna.
