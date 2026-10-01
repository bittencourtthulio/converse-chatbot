# Verificação no navegador — FT-08 Base de conhecimento: vídeo

Data: 2026-10-01. Ferramenta: Chrome controlado por CDP (o `browser-harness` do ambiente, ligado a um Chrome sem janela iniciado só para esta verificação, com perfil descartável). A extensão do Chrome da sessão não estava conectada e o `browser-harness` no Chrome do usuário não recebeu aprovação, por isso a verificação foi feita nesse Chrome próprio. O OpenRouter e o YouTube reais não foram usados: tudo correu contra os servidores simulados.

## Como foi montado

- Aplicativo de produção (`npm run build` e `next start`) numa porta própria, com banco SQLite e `STORAGE_DIR` fora do repositório (migrado e semeado), `JWT_SECRET` e `ENCRYPTION_KEY` descartáveis passados na linha de comando (nenhum segredo em arquivo), `TRUST_PROXY=1`.
- OpenRouter simulado (`npx tsx tests/apoio/servir-falso.ts`): uma frase por parte do áudio (reembolso, atendimento, entregas), com 3 s de atraso por parte. Chave de teste cadastrada pela tela Configurações > Integrações, logado com a conta de demonstração do admin.
- YouTube simulado (`npx tsx tests/apoio/servir-youtube-falso.ts`), com `YOUTUBE_BASE` apontando para ele: um vídeo com legendas em inglês (manual) e português (automática), um com legenda manual em português sobre garantia e um sem legendas.
- Um MP3 de 25 minutos (5,7 MB, ruído gerado com o ffmpeg) anexado ao campo de arquivo pelo CDP (`DOM.setFileInputFiles`): são 3 partes de 10, 10 e 5 minutos.

## O que foi verificado e funcionou

| Passo | Resultado |
|---|---|
| Configurações > Integrações | painel "Modelo de transcrição" com "Em uso" e "padrão" (`google/gemini-2.5-flash`), selo "Padrão", campo, aviso de créditos e "Salvar modelo" |
| Aba Conhecimento, opção Vídeo | terceira aba "Vídeo" ao lado de Arquivos e Texto, com duas abas internas "Enviar arquivo" e "Link do YouTube", aviso de que a transcrição consome créditos do OpenRouter com o modelo em uso, formatos aceitos, limite de 500 MB e 180 minutos |
| Envio do MP3 | barra de progresso real do envio, medida por um `MutationObserver` no elemento `progress`: 0, 14, 35 e 100 por cento, depois "Enviado. Ele aparece na lista e a transcrição começa em instantes." |
| Fila | a linha nova entrou como "Processando" com a barra e as etapas "Verificando o arquivo · 2%", "Extraindo áudio · 5%", "Transcrevendo parte 1 de 3 · 15%", "parte 2 de 3 · 41%", "parte 3 de 3 · 68%" e depois "Pronto"; a lista atualizou sozinha |
| Resultado do áudio | duração "25min 00s", um trecho que começa em `[00:00]` e traz `[10:00]` e `[20:00]`; em disco ficou só `original` (áudio extraído e segmentos apagados) |
| Link do YouTube | link de outro host mostra o erro na hora, sem enviar; os links válidos viram fontes "Pronto" com o título do vídeo, duração ("1min 15s", "2min 10s") e "Abrir no YouTube"; o vídeo sem legendas fica em "Erro" com a frase "Este vídeo não tem legendas disponíveis. Baixe o vídeo e envie o arquivo para transcrever.", com Reprocessar |
| Testar busca | "qual o prazo do reembolso?" acha o trecho do áudio (`[00:00] A política de reembolso…`) e "por quanto tempo vale a garantia contra defeito?" acha o trecho do YouTube sobre garantia |
| Ver conteúdo | duração no cabeçalho e marcador de tempo em destaque no começo do trecho |
| 375 px | emulação de largura 375 px: a página não ganha rolagem horizontal (`scrollWidth` 375), as abas quebram em linhas, o aviso de créditos, a zona de soltar e os botões da lista (Ver conteúdo, Reprocessar, Excluir) cabem e empilham |
| Tema claro | "Ver conteúdo" de um vídeo a 375 px legível, com selo, marcador e cabeçalho nos tokens do tema |
| Varredura do log do servidor | `grep` da chave do OpenRouter, do cabeçalho de autorização e do texto transcrito: zero ocorrências |

## Achados da verificação, já corrigidos

- A lista de fontes aparecia com os itens empilhados e centralizados (ícone, título, selo e botões um sob o outro). A regra `.fonte-item` da FT-05 (chips das fontes da resposta) vencia a regra da lista da FT-04 por vir depois. Agora a regra da FT-05 vale só dentro de `.fontes-lista`, e a lista volta a ser uma linha por fonte. O defeito já existia na aba Conhecimento desde a FT-05.

## O que ficou sem verificar

- **Transcrição real e YouTube real.** Só com chave do OpenRouter com saldo e um modelo com entrada de áudio, e com acesso ao YouTube (PEND-06). A fragilidade do formato do YouTube (lacuna 1 da base) segue: a fixture imita o formato por suposição.
- **ffmpeg do contêiner.** Verificado só com o ffmpeg da máquina de desenvolvimento.
- **Tempo de envio de um arquivo grande.** O envio de 5,7 MB local é instantâneo; a barra foi vista andando (0 a 100), mas o comportamento com 500 MB por uma rede lenta e o corte por `MAX_VIDEO_MB` estão provados só por teste de rota (`tests/video-rota.test.ts`).
- **Arrastar e soltar** e o **teclado em leitor de tela**: o arquivo entrou pelo campo de arquivo, não arrastado.
- **Celular real:** a emulação de 375 px de um Chrome sem janela não substitui um aparelho (PEND-07).
- A emulação móvel com densidade 2 travou o Chrome sem janela; os quadros de 375 px usam largura 375 e densidade 1.
