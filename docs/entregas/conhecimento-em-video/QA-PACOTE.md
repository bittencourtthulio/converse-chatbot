---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
casos: 22
atualizado_em: 2026-10-01
---

# Pacote de QA — Base de conhecimento: vídeo e áudio (FT-08)

## 1. O que mudou

Na aba **Conhecimento** de cada agente aparece uma terceira opção, **Vídeo**, ao lado de Arquivos e Texto. Ali a pessoa envia um vídeo ou um áudio (acompanhando uma barra de envio) ou cola o link de um vídeo do YouTube, e a fala vira uma fonte da base, que o agente passa a usar como as outras. Enquanto o arquivo é processado, a lista mostra a etapa ("Extraindo áudio", "Transcrevendo parte 2 de 3") e uma barra de andamento; no fim, mostra a duração e os trechos começam com a marcação de tempo (`[00:00]`, `[10:00]`). Em **Configurações, Integrações** o administrador escolhe o modelo que faz a transcrição. A transcrição de arquivo gasta créditos do OpenRouter, e a tela avisa; o link do YouTube usa as legendas do vídeo e não gasta.

## 2. Roteiro de teste

Os casos partem de uma instalação preparada como na seção 5, com um **OpenRouter de mentira** (ele devolve uma frase por parte do áudio: a primeira fala de reembolso em trinta dias, a segunda de atendimento de segunda a sexta, a terceira de entregas em cinco dias úteis; cada parte demora cerca de 3 segundos) e um **YouTube de mentira** (três vídeos de teste). Nenhum serviço de verdade é usado. Use a conta de administrador de demonstração e o agente "Assistente de exemplo", salvo onde o caso disser outra coisa. **ÁUDIO LONGO** é o arquivo de áudio de 25 minutos descrito na seção 4. **CONTROLE** é o comando que fala com o OpenRouter de mentira (seção 5).

**Caso 1 — Escolher o modelo de transcrição (administrador)**
1. Entre como administrador e abra "Configurações", "Integrações".
2. Confira o cartão "Modelo de transcrição". Digite `modelo com espaço` no campo e clique em "Salvar modelo".
3. Troque por `openai/gpt-4o-audio-preview` e clique em "Salvar modelo".
4. Clique em "Restaurar o padrão".
- Deve acontecer: o cartão mostra "Em uso" com o modelo padrão (`google/gemini-2.5-flash`), o selo "Padrão", o campo vazio com o padrão como dica e um texto dizendo que o modelo precisa aceitar áudio e que cada transcrição consome créditos do OpenRouter. O modelo com espaço é recusado com uma frase em português (só letras, números e alguns símbolos) e nada muda. O modelo novo é salvo ("Modelo de transcrição salvo."), o selo vira "Personalizado" e o botão "Restaurar o padrão" aparece. Restaurar volta ao padrão, com a mensagem de modelo restaurado, e o botão some.
- Falha se: o modelo com espaço é aceito, o selo não acompanha o estado, ou o "Em uso" não muda depois de salvar ou restaurar.

**Caso 2 — Só o administrador mexe no modelo**
1. Saia e entre como usuário comum. Abra a aba "Conhecimento" do agente e a opção "Vídeo".
2. Tente abrir a página de Integrações pelo endereço do navegador (a mesma da aba do caso 1).
- Deve acontecer: o usuário comum não vê "Integrações" no menu e, ao abrir o endereço, é levado ao painel inicial. Na aba "Vídeo" ele vê o aviso de créditos com o nome do modelo em uso (o salvo no caso 1, ou o padrão), mas não consegue trocá-lo.
- Falha se: o usuário comum vê ou altera o cartão do modelo.

**Caso 3 — A opção Vídeo e o aviso de custo**
1. Como administrador, abra a aba "Conhecimento" do agente e clique em "Vídeo".
2. Observe as duas abas internas e use as setas esquerda e direita do teclado com o foco numa delas.
- Deve acontecer: aparecem três opções (Arquivos, Texto, Vídeo) e, dentro de Vídeo, as abas "Enviar arquivo" e "Link do YouTube". Em "Enviar arquivo": um aviso amarelo diz que a transcrição consome créditos do OpenRouter e cita o modelo em uso; a área de soltar lista os formatos aceitos (mp4, mov, m4v, webm, mkv, avi, mp3, wav, m4a, ogg, aac, flac) e o limite "Até 500 MB e 180 minutos por arquivo". As setas trocam de aba.
- Falha se: falta alguma aba, o aviso não cita o modelo, ou o limite mostrado não é 500 MB e 180 minutos.

**Caso 4 — Enviar um áudio longo e acompanhar**
1. Em "Vídeo", "Enviar arquivo", escolha o ÁUDIO LONGO (clique na área ou arraste o arquivo).
2. Acompanhe a lista de envios e, logo depois, a lista de "Fontes", sem recarregar a página.
- Deve acontecer: no envio aparece uma barra que enche de 0 a 100% (o arquivo é pequeno e o envio é rápido; o importante é a barra chegar a 100%) e a frase "Enviado. Ele aparece na lista e a transcrição começa em instantes." Na lista de Fontes entra uma linha nova com o ícone de câmera, o selo "Processando" com a roda girando, uma barra de andamento e a etapa mudando sozinha: "Verificando o arquivo", "Extraindo áudio", "Transcrevendo parte 1 de 3", "parte 2 de 3", "parte 3 de 3". Em cerca de 15 segundos o selo vira "Pronto", a barra some e a linha mostra "25min 00s".
- Falha se: a página precisa ser recarregada para ver o andamento, a barra de envio não chega a 100%, o selo nunca vira "Pronto" ou a duração não aparece.

**Caso 5 — O agente acha o que foi dito**
1. Na mesma aba, em "Testar busca", pergunte "qual o prazo do reembolso?".
2. Pergunte "o atendimento funciona no fim de semana?".
- Deve acontecer: a primeira pergunta mostra um trecho do áudio com a frase sobre reembolso em até trinta dias; a segunda mostra o trecho do atendimento de segunda a sexta. O título do trecho é o nome do arquivo.
- Falha se: nenhum trecho do áudio aparece, ou aparece só o texto de exemplo que já vinha no agente.

**Caso 6 — Ver conteúdo mostra as marcações de tempo**
1. Na linha do áudio, clique em "Ver conteúdo".
- Deve acontecer: o cabeçalho mostra o tamanho, o número de trechos e "duração 25min 00s". O texto traz as três falas, cada uma começando com uma marcação em destaque: `[00:00]`, `[10:00]` e `[20:00]`.
- Falha se: as marcações faltam, a duração falta, ou o texto aparece com símbolos estranhos.

**Caso 7 — Falha numa parte e Reprocessar sem pagar de novo**
1. Use CONTROLE para fazer a segunda parte falhar com "sem saldo" (comando na seção 5).
2. Envie o ÁUDIO LONGO de novo.
3. Quando a linha ficar em "Erro", leia a mensagem. Use CONTROLE para ver os pedidos recebidos (comando "ver pedidos").
4. Use CONTROLE para desfazer a falha. Na linha com erro, clique em "Reprocessar" e espere.
5. Use de novo "ver pedidos".
- Deve acontecer: a linha fica em "Erro" com a mensagem "Falha na parte 2 de 3: Saldo insuficiente no OpenRouter…" (em português, sem texto técnico), o botão "Reprocessar" aparece e a barra e a etapa somem. Antes de reprocessar, os pedidos mostram a parte 1 uma vez e a parte 2 uma vez. Depois de reprocessar, a linha fica "Pronta" e os pedidos novos são só a parte 2 (segunda tentativa) e a parte 3: a parte 1 não é transcrita nem paga de novo. O texto final traz as três falas.
- Falha se: a mensagem vem em inglês ou com termos técnicos, "Reprocessar" refaz a parte 1, ou a fonte não chega a "Pronta".

**Caso 8 — Retomada depois de reiniciar o sistema**
1. Use CONTROLE para alongar a primeira parte (comando na seção 5). Envie o ÁUDIO LONGO e, quando a etapa mostrar "Transcrevendo parte 1", pare o sistema (Ctrl+C no terminal dele) e suba de novo.
2. Atualize a página e espere.
- Deve acontecer: depois de subir, a linha volta para "Na fila", depois "Processando" e termina "Pronta", sem ficar parada para sempre em "Processando". Nenhuma duplicata aparece na lista.
- Falha se: a linha fica eternamente em "Processando" ou "Na fila", ou some.

**Caso 9 — Sem chave do OpenRouter**
1. Em "Integrações", remova a chave do OpenRouter ("Remover chave").
2. Envie o ÁUDIO LONGO.
3. Cadastre a chave de teste de novo e, na aba "Conhecimento", clique em "Reprocessar" na linha com erro.
- Deve acontecer: o envio é aceito, mas a linha termina em "Erro" com uma mensagem em português pedindo a um administrador que cadastre a chave em Configurações, Integrações. Depois de cadastrar a chave, "Reprocessar" leva a linha a "Pronta".
- Falha se: a fonte fica em "Processando" para sempre, a mensagem é técnica, ou o reprocesso continua falhando com a chave cadastrada.

**Caso 10 — Link do YouTube com legendas**
1. Em "Vídeo", abra "Link do YouTube". Cole o primeiro link de teste (com legendas em português, seção 4) e clique em "Adicionar vídeo".
2. Faça o mesmo com o segundo link de teste (legendas em inglês e português automática).
- Deve acontecer: aparece "Vídeo adicionado…" e a fonte entra na lista com o título provisório "YouTube: …", depois troca sozinha pelo título do vídeo ("Como funciona a garantia dos produtos" e "Aula de exemplo"), com selo "Pronto", a duração (2min 10s e 1min 15s) e o link "Abrir no YouTube". O tamanho mostrado é pequeno (é só o texto das legendas). A busca "por quanto tempo vale a garantia contra defeito?" acha o trecho da garantia, com `[00:00]` e `[01:00]` no início das partes. O aviso da aba diz que esse caminho não gasta créditos.
- Falha se: o título não troca, o link "Abrir no YouTube" falta, ou a busca não acha o trecho.

**Caso 11 — Link do YouTube sem legendas**
1. Cole o terceiro link de teste (vídeo sem legendas) e adicione.
2. Clique em "Reprocessar" na linha com erro.
- Deve acontecer: a linha vai a "Erro" com a frase "Este vídeo não tem legendas disponíveis. Baixe o vídeo e envie o arquivo para transcrever." Reprocessar tenta de novo e termina na mesma frase, sem travar.
- Falha se: a mensagem é outra ou técnica, ou a fonte fica em "Processando".

**Caso 12 — Link que não é do YouTube**
1. Em "Link do YouTube", digite `https://exemplo.com/watch?v=abcdefghijk`, sem enviar.
2. Troque por `https://www.youtube.com/watch?v=curto`.
3. Troque por `https://youtu.be/abcdefghijk` e apague tudo.
- Deve acontecer: já enquanto digita, uma frase vermelha explica que é preciso informar o link de um vídeo do YouTube (youtube.com ou youtu.be); o campo fica marcado como inválido. O link com identificador curto também é recusado. O link válido não mostra erro. Ao clicar em "Adicionar vídeo" com link inválido, nada é criado na lista. Com o campo vazio a frase pede para colar o link.
- Falha se: o link de outro site é aceito, não há mensagem, ou uma fonte nova aparece na lista.

**Caso 13 — Formato e conteúdo recusados**
1. Em "Enviar arquivo", escolha um arquivo de texto qualquer (`.txt`).
2. Escolha o ARQUIVO FALSO (um texto simples com o nome terminando em `.mp4`).
3. Escolha o ARQUIVO VAZIO (nome terminando em `.mp3`, sem conteúdo).
- Deve acontecer: o `.txt` é recusado na hora, na própria lista de envios, com a frase "Formato não aceito" e a lista dos formatos aceitos. O arquivo falso passa pela conferência do navegador, é enviado, e o sistema o recusa com uma frase dizendo que o conteúdo não parece ser um arquivo MP4 (a extensão não bate com o arquivo). O arquivo vazio é recusado como "O arquivo está vazio." Nenhum dos três cria linha na lista de Fontes.
- Falha se: algum é aceito, a mensagem é técnica, ou uma fonte nasce na lista.

**Caso 14 — Limite de tamanho**
1. Com o sistema subido na variação de limite pequeno (seção 5, "limite de 1 MB"), entre como administrador e envie o ÁUDIO LONGO (5,7 MB).
- Deve acontecer: o arquivo é recusado antes de enviar, com a frase "O arquivo tem 5,7 MB e o limite é de 1 MB." e a área de soltar mostra "Até 1 MB". Nenhuma fonte nasce.
- Falha se: o arquivo é aceito, ou o limite mostrado continua sendo 500 MB.

**Caso 15 — Limite de duração**
1. Com o sistema subido na variação de duração curta (seção 5, "limite de 10 minutos"), envie o ÁUDIO LONGO (25 minutos).
- Deve acontecer: o envio é aceito, mas a fonte termina em "Erro" com a frase "O arquivo tem 25 min e o limite é de 10 min." A área de soltar mostra "10 minutos por arquivo".
- Falha se: a fonte é transcrita, ou o erro é técnico.

**Caso 16 — Servidor sem o programa de áudio**
1. Com o sistema subido na variação sem o ffmpeg (seção 5), envie o ÁUDIO LONGO.
- Deve acontecer: a fonte termina em "Erro" com a frase "Não encontrei o ffmpeg neste servidor. Instale o ffmpeg ou use a imagem de contêiner do projeto." Texto e arquivos comuns continuam funcionando normalmente na mesma instalação.
- Falha se: a fonte fica em "Processando", a mensagem mostra caminhos do servidor, ou texto e arquivos comuns deixam de ser processados.

**Caso 17 — Excluir enquanto processa**
1. Use CONTROLE para alongar a primeira parte. Envie o ÁUDIO LONGO e, com a linha em "Processando", clique em "Excluir" e confirme.
2. Espere cerca de 30 segundos.
- Deve acontecer: a linha some na hora e não volta. Depois do tempo, a lista continua sem ela e o total de fontes não aumenta.
- Falha se: a linha reaparece, vira "Pronta" depois de excluída, ou a lista dá erro.

**Caso 18 — Vários arquivos de uma vez**
1. Em "Enviar arquivo", escolha dois áudios de uma só vez (o ÁUDIO LONGO e uma cópia dele com outro nome).
- Deve acontecer: a lista de envios mostra um "Aguardando a vez…" enquanto o primeiro envia; os dois entram na lista de Fontes; o segundo só começa a transcrever quando o primeiro termina (um vídeo de cada vez); ao final os dois ficam "Prontos". Nesse meio tempo, colar um texto na opção "Texto" fica "Pronto" na hora, sem esperar os áudios.
- Falha se: os dois transcrevem ao mesmo tempo, o texto fica esperando, ou um deles se perde.

**Caso 19 — Os outros jeitos de adicionar continuam funcionando**
1. Em "Arquivos", envie um documento de texto pequeno. Em "Texto", cole um parágrafo com título.
- Deve acontecer: ambos chegam a "Pronto", sem barra de etapa, mostrando tamanho e data como antes (sem duração).
- Falha se: algum não é processado, ou mostra barra ou etapa de vídeo.

**Caso 20 — Celular (375 pixels)**
1. No navegador, abra as ferramentas do desenvolvedor, ative o modo de dispositivo e ponha a largura em 375. Abra a aba "Conhecimento" e a opção "Vídeo".
2. Percorra as duas abas internas, a lista de fontes (com pelo menos uma linha de áudio, uma do YouTube e uma com erro) e "Ver conteúdo".
- Deve acontecer: não surge rolagem para os lados; as abas quebram de linha sem cortar; o aviso, a área de soltar e o campo do link cabem na tela; em cada linha da lista o título, os dados e os botões (Ver conteúdo, Reprocessar, Excluir) ficam um abaixo do outro, e cada botão é fácil de tocar.
- Falha se: algo fica cortado ou sai da tela, ou algum botão é pequeno demais para tocar.

**Caso 21 — Tema claro e escuro**
1. Alterne o tema pelo ícone no topo e repita uma olhada na aba "Vídeo", numa linha "Processando", numa linha com "Erro" e em "Ver conteúdo", nos dois temas.
- Deve acontecer: o aviso amarelo, a barra de andamento, os selos, o link "Abrir no YouTube", a frase de erro e a marcação de tempo ficam legíveis nos dois temas.
- Falha se: algum texto some ou fica quase invisível em um dos temas.

**Caso 22 — A lista de fontes ficou organizada**
1. Na aba "Conhecimento" com várias fontes (texto, áudio, YouTube), olhe a lista de "Fontes" no computador (largura normal).
- Deve acontecer: cada fonte ocupa uma linha, com o ícone à esquerda, título e dados no meio, e selo e botões à direita (antes, a lista aparecia com tudo empilhado e centralizado). Nas respostas do agente na aba "Testar", as fontes citadas continuam aparecendo como etiquetas pequenas.
- Falha se: a lista volta a ficar empilhada e centralizada, ou as etiquetas de fontes da aba "Testar" mudaram de aparência.

## 3. O que observar de colateral

- **Aba "Testar":** converse com o agente depois de ter áudio e YouTube prontos e confira que as fontes citadas aparecem como antes, com os títulos novos (a resposta do OpenRouter de mentira é sempre a mesma frase de exemplo; o que importa é a tela).
- **Aba "Conhecimento", resumo do topo:** os números de fontes, prontas e caracteres somam as fontes novas; "em processamento" aparece enquanto há áudio sendo transcrito.
- **Integrações:** o cartão da chave do OpenRouter continua igual (salvar, testar conexão, remover); o cartão novo vem logo abaixo.
- **Excluir o agente:** apague um agente que tenha áudio enviado e confira que ele some sem erro (os arquivos do áudio saem junto).
- **Aba "Publicar" e "Canais":** abrem como antes.
- **Painel inicial e menu:** sem mudança.

## 4. Dado de teste sugerido

Tudo fictício e gerado na hora; nenhum dado de cliente.

- **ÁUDIO LONGO:** um áudio de 25 minutos, cerca de 6 MB, gerado pelo comando da seção 5. O conteúdo é ruído (não há fala de verdade): o OpenRouter de mentira devolve as frases combinadas, uma por parte de 10 minutos (3 partes: 10, 10 e 5 minutos).
- **ARQUIVO FALSO:** um arquivo de texto simples com o nome terminando em `.mp4`.
- **ARQUIVO VAZIO:** um arquivo sem conteúdo com o nome terminando em `.mp3`.
- **Links do YouTube de teste** (cole-os exatamente assim, com o endereço normal do YouTube: o sistema só aproveita o código do vídeo e lê o YouTube de mentira): `https://www.youtube.com/watch?v=garantia001` (legenda em português, 2min 10s, sobre a garantia de doze meses), `https://www.youtube.com/watch?v=abcdefghijk` (legendas em inglês e português automática, 1min 15s) e `https://www.youtube.com/watch?v=semlegenda1` (sem legendas).
- **Modelo para o caso 1:** `openai/gpt-4o-audio-preview` (fictício aqui, nada é chamado).

## 5. Ambiente e estado inicial

**Onde testar:** num computador de desenvolvimento, com o sistema rodando localmente, no navegador. Use as contas de demonstração (as credenciais estão no README do projeto; nenhuma credencial real é necessária ou deve ser usada).

**O que precisa existir antes:** o sistema preparado com `npm run setup` e `npm run build`; o programa **ffmpeg** instalado no computador (`ffmpeg -version` mostra a versão; no Mac, `brew install ffmpeg`); a chave do OpenRouter de teste cadastrada em Configurações, Integrações (o OpenRouter de mentira imprime a chave de teste ao iniciar).

**O que precisa estar ligado (três terminais):**
1. OpenRouter de mentira: `npx tsx tests/apoio/servir-falso.ts` (anote o endereço `OPENROUTER_BASE_URL` que ele imprime; ele escuta os comandos de controle em `localhost:4401`).
2. YouTube de mentira: `npx tsx tests/apoio/servir-youtube-falso.ts` (anote o endereço `YOUTUBE_BASE` que ele imprime).
3. O sistema: `npm run start` com as variáveis `OPENROUTER_BASE_URL` (endereço do passo 1) e `YOUTUBE_BASE` (endereço do passo 2).

**Variações do sistema** (o mesmo comando do passo 3, em outra porta, com a variável a mais; só uma de cada vez):
- **Limite de 1 MB (caso 14):** `MAX_VIDEO_MB=1`.
- **Limite de 10 minutos (caso 15):** `MAX_VIDEO_MINUTOS=10`.
- **Sem o ffmpeg (caso 16):** `FFMPEG_PATH=/nao/existe/ffmpeg FFPROBE_PATH=/nao/existe/ffprobe`.

**Comandos de controle do OpenRouter de mentira (CONTROLE):**
- **Fazer a segunda parte falhar por falta de saldo:** `curl -s -X POST localhost:4401/configurar -d '{"falhasPorParte":{"1":402}}'`
- **Desfazer a falha:** `curl -s -X POST localhost:4401/configurar -d '{"falhasPorParte":{}}'`
- **Alongar a primeira parte para 20 segundos:** `curl -s -X POST localhost:4401/configurar -d '{"latenciaPorParteMs":{"0":20000}}'`
- **Ver pedidos recebidos:** `curl -s localhost:4401/estado` (lista, em ordem, a parte e a tentativa de cada pedido; parte 0 é a primeira).
- Reiniciar o OpenRouter de mentira apaga a contagem de partes; faça isso entre um caso e outro quando quiser começar do zero.

**Como gerar os arquivos de teste:**
- **ÁUDIO LONGO:** `ffmpeg -f lavfi -i "anoisesrc=color=pink:duration=1500:sample_rate=16000" -ac 1 -c:a libmp3lame -b:a 32k palestra-reembolso.mp3`
- **ARQUIVO FALSO:** `echo "isto e so um texto" > falso.mp4`
- **ARQUIVO VAZIO:** `: > vazio.mp3`
- **Cópia do áudio com outro nome (caso 18):** `cp palestra-reembolso.mp3 palestra-atendimento.mp3` (o OpenRouter de mentira trata um áudio repetido como a mesma parte; use `anoisesrc` de novo, com outro nome, se quiser áudios diferentes).

**Estado inicial:** banco recém-preparado com `npm run setup`, só com o agente de exemplo e a fonte de texto que já vem nele.

## 6. Critério de aprovação

**APROVADO quando:** os 22 casos passam; a barra de envio chega a 100% e a etapa e o andamento aparecem e somem sozinhos, sem recarregar; uma parte que falha mostra a mensagem em português com a parte indicada e o Reprocessar não refaz as partes já transcritas; link que não é do YouTube nunca vira fonte; formato, conteúdo, tamanho e duração fora do permitido são recusados com mensagem em português; o texto, os arquivos comuns e as telas vizinhas da seção 3 continuam como antes; e nenhuma fonte fica parada para sempre em "Processando".

**REPROVADO quando:** qualquer caso falha, uma fonte fica presa em "Processando" ou "Na fila", uma fonte excluída reaparece, dois áudios são transcritos ao mesmo tempo, uma parte já transcrita é paga de novo no Reprocessar, o link de outro site é aceito, o usuário comum consegue trocar o modelo, ou algum texto técnico (código de erro, inglês, caminho do servidor) chega à tela.

## 7. O que NÃO faz parte desta entrega

- **Transcrição de verdade e YouTube de verdade:** só funcionam com uma chave do OpenRouter com saldo, um modelo que aceite áudio e acesso do servidor ao YouTube; aqui tudo é conferido contra os de mentira, então a qualidade da transcrição e o formato real das legendas do YouTube não são avaliados. O YouTube não oferece uma forma oficial de ler legendas e pode mudar a página sem aviso: o recurso pode quebrar, e nesse caso a mensagem pede para enviar o arquivo do vídeo.
- As **imagens do vídeo** não são analisadas: só a fala entra na base.
- Cancelar um envio no meio, com arquivo grande e conexão lenta, e o limite de 500 MB de verdade: o envio local é rápido demais para ver e o corte por tamanho só é conferido com o limite pequeno do caso 14.
- Uma parte de 10 minutos sem nenhuma fala (música, silêncio) pode fazer a fonte falhar; não há como pular só aquela parte.
- Restos de um envio interrompido no disco só saem quando a fonte é excluída ou reprocessada; a limpeza automática e o backup ficam para a entrega de operação.
- Retomar um envio interrompido pela metade, enviar mais de um arquivo ao mesmo tempo e escolher o modelo por agente.
- Histórico de conversas, privacidade, registro de quem alterou e contêiner, que são das próximas entregas.
- Celular de verdade: a largura de 375 pixels do caso 20 é emulada no navegador.
