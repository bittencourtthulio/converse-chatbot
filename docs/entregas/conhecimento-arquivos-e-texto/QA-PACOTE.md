---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
casos: 10
atualizado_em: 2026-09-30
---

# Pacote de QA — Base de conhecimento: arquivos e textos (FT-04)

## 1. O que mudou

Cada agente ganhou uma aba nova, "Conhecimento", entre "Configurações" e "Testar". Nela a pessoa manda arquivos (PDF, Word, texto, Markdown, planilha CSV, página HTML, JSON e legendas) ou cola um texto, e acompanha cada item: ele entra "Na fila", fica "Processando" e termina "Pronto" ou com "Erro" e o motivo em português. Dá para ver o texto que foi lido de cada item, refazer um que falhou e apagar o que não serve mais. Nesta entrega o agente ainda não usa esse conteúdo para responder: isso vem na próxima entrega.

## 2. Roteiro de teste manual

Os casos partem de uma instalação preparada como na seção 5. Use uma das contas de demonstração criadas pela instalação (o e-mail e a senha estão no arquivo de instruções do projeto).

**Caso 1 — Abrir a aba Conhecimento**
1. Entre no sistema, abra "Agentes" e escolha o "Assistente de exemplo".
2. Toque na aba "Conhecimento".
- Deve acontecer: a aba fica destacada; no topo aparecem três cartões, "Fontes", "Prontas" e "Caracteres", com 1, 1 e um número acima de 1.000; abaixo, a área "Adicionar ao conhecimento" com duas opções, "Arquivos" (selecionada) e "Texto"; a zona tracejada diz "Arraste arquivos aqui ou clique para escolher" e lista os formatos aceitos, o limite de 25 MB por arquivo e "10 arquivos por vez"; mais abaixo, a lista "Fontes" com uma fonte, "Política de troca e horário da Loja Exemplo", marcada "Pronto".
- Falha se: a aba não existe, os cartões não aparecem, a fonte de exemplo não está na lista ou aparece com outro status.

**Caso 2 — Colar um texto**
1. Toque em "Texto". Escreva o título "Promoção de maio" e, no campo de texto, "Em maio, todos os cadernos da Loja Exemplo têm 10% de desconto."
2. Confira o contador abaixo do campo e toque em "Adicionar texto".
- Deve acontecer: o contador mostra "63 de 200.000" (ou o número de caracteres que você digitou) e muda enquanto você escreve; depois do envio, uma faixa verde diz "Texto adicionado" e os campos esvaziam; a fonte "Promoção de maio" aparece no topo da lista e vira "Pronto" sozinha, sem recarregar a página; os cartões sobem para 2 fontes.
- Falha se: aparece erro, a fonte não entra na lista, fica "Na fila" ou "Processando" para sempre, ou é preciso recarregar a página para ela mudar.

**Caso 3 — Campos obrigatórios e limites do texto**
1. Na opção "Texto", toque em "Adicionar texto" sem preencher nada.
2. Preencha só o título e toque de novo. Depois preencha só o texto (sem título).
3. Cole um texto com mais de 200.000 caracteres (veja a seção 4).
- Deve acontecer: cada tentativa mostra uma faixa vermelha pedindo o título ou o texto, e o texto grande demais recusa dizendo que o limite é de 200.000 caracteres; nada é adicionado à lista.
- Falha se: uma fonte vazia ou enorme é criada, ou a mensagem não explica o que fazer.

**Caso 4 — Enviar vários arquivos de uma vez**
1. Toque em "Arquivos". Escolha, de uma vez, um PDF com texto, um documento Word e uma planilha CSV (arquivos de exemplo na seção 4).
- Deve acontecer: aparece uma lista de envios com os três nomes e o tamanho de cada um; cada um mostra "Enviado" (durante o envio, uma barra de progresso); a frase acima da lista diz "3 arquivos enviados"; os três entram na lista de fontes e chegam a "Pronto" sozinhos.
- Falha se: algum arquivo fica parado na lista de envios, some sem entrar nas fontes, ou a página precisa ser recarregada.

**Caso 5 — Arquivo que não serve**
1. Tente enviar, juntos: um arquivo vazio, um arquivo de programa (por exemplo, terminado em ".exe"), um PDF escaneado (só imagem) e um arquivo de texto comum.
- Deve acontecer: o vazio e o ".exe" aparecem na lista de envios em vermelho, com o motivo ("O arquivo está vazio." e "Formato não aceito…" com os formatos aceitos); o arquivo de texto entra normalmente; o PDF escaneado é enviado, entra na lista de fontes e termina com o selo vermelho "Erro" e o motivo "Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado."; só nessa linha há o botão "Reprocessar".
- Falha se: o arquivo inválido é aceito, o motivo aparece técnico (nome de pasta, código), ou um arquivo bom é recusado junto com os ruins.

**Caso 6 — Reprocessar**
1. Na fonte em "Erro" do caso anterior, toque em "Reprocessar".
- Deve acontecer: a linha volta a "Na fila"/"Processando" e termina em "Erro" de novo, com o mesmo motivo (o arquivo continua sendo um PDF escaneado); o botão some enquanto processa.
- Falha se: aparece erro técnico, a fonte duplica, ou o botão aparece em fontes que não estão em "Erro".

**Caso 7 — Ver conteúdo e paginação**
1. Na fonte "Promoção de maio", toque em "Ver conteúdo".
2. Volte e adicione um texto longo (cerca de 30.000 caracteres, veja a seção 4); abra o "Ver conteúdo" dele.
- Deve acontecer: a primeira página mostra o nome, o selo "Pronto", o tamanho, os caracteres e os trechos numerados ("Trecho 1"…) com o texto lido; no texto longo há vários trechos de cerca de 1.000 caracteres, 20 por página, com "Página 1 de 2", "Próxima" e depois "Anterior"; na primeira página "Anterior" fica apagado; "Voltar para o conhecimento" volta à aba.
- Falha se: o texto aparece com símbolos estranhos, trechos passam de 1.000 caracteres, ou a segunda página repete a primeira.

**Caso 8 — Excluir com confirmação**
1. Numa fonte qualquer (por exemplo, "Promoção de maio"), toque em "Excluir".
2. Toque em "Cancelar". Toque em "Excluir" de novo e em "Confirmar exclusão".
- Deve acontecer: o primeiro toque abre, na própria linha, a pergunta `Excluir "Promoção de maio"?` com "Confirmar exclusão" e "Cancelar" (sem janela do navegador); "Cancelar" fecha a pergunta e nada muda; "Confirmar exclusão" remove a fonte da lista e os cartões diminuem.
- Falha se: a fonte some sem pedir confirmação, a confirmação é uma janela do navegador, ou a fonte volta ao recarregar a página.

**Caso 9 — Sem sessão e sem agente**
1. Saia do sistema e tente abrir o endereço da aba Conhecimento de um agente.
2. Entre de novo e abra o endereço de um agente que não existe (troque o final do endereço por letras quaisquer).
- Deve acontecer: sem entrar, o sistema leva para a tela de login; com um agente inexistente aparece a página "não encontrado".
- Falha se: a aba abre sem login, ou mostra uma tela quebrada ou técnica.

**Caso 10 — Temas claro e escuro e celular**
1. Alterne entre o tema claro e o escuro pelo botão do cabeçalho, na aba Conhecimento e em "Ver conteúdo".
2. Abra a aba num celular (ou com a janela estreita, cerca de 375 pixels de largura).
- Deve acontecer: textos legíveis nos dois temas, selos de status com o texto escrito (não só cor); no celular os cartões ficam um embaixo do outro, cada fonte mostra título, tamanho, data, selo e botões em linhas empilhadas, os botões têm tamanho confortável para o toque e a página não rola para o lado.
- Falha se: texto ilegível, cartões cortados, rolagem horizontal da página, ou botão pequeno demais para tocar.

## 3. O que observar de colateral

- Aba "Configurações" do agente: editar e salvar o agente continua igual. Ao excluir um agente (texto de aviso existente), os arquivos que ele tinha enviados também são apagados; isso não aparece na tela, mas o agente não pode deixar rastro na lista de outros agentes.
- Aba "Testar": a conversa continua funcionando como antes (a aba mudou de lugar: agora é a terceira).
- Menu "Agentes": a lista e a criação de agentes seguem iguais.
- Outro agente: as fontes de um agente não aparecem na aba Conhecimento de outro.
- Lista de fontes com muitos itens (mais de 10): a tela continua legível.
- Lista de derivação: esta lista foi feita a partir dos arquivos alterados, sem análise de impacto formal; pode estar incompleta.

## 4. Dado de teste sugerido

Tudo fictício, da "Loja Exemplo".

- Arquivos de exemplo já prontos na pasta `tests/fixtures` do projeto: `exemplo.pdf` (PDF com texto), `exemplo.docx` (Word), `exemplo.csv` (planilha), `exemplo.html`, `exemplo.json`, `exemplo.srt` e `exemplo.vtt` (legendas), `exemplo.txt` e `exemplo.md`, e `escaneado.pdf` (PDF só com imagem, que deve dar erro de OCR).
- Um arquivo vazio (0 bytes) e um arquivo qualquer com final ".exe" (pode ser um arquivo de texto renomeado).
- Um texto de cerca de 30.000 caracteres: repita muitas vezes um parágrafo curto, como "A Loja Exemplo vende material de escritório e atende de segunda a sexta." até passar de 30.000 caracteres.
- Um texto com mais de 200.000 caracteres, repetindo o mesmo parágrafo, para o caso 3.
- Um arquivo de texto maior que o limite (mais de 25 MB) para conferir a recusa por tamanho, se a instalação permitir criar um.

## 5. Ambiente e estado inicial

- **Onde testar:** instalação local. Não é preciso chave do OpenRouter nem internet para este pacote.
- **Preparação:** `npm install`; copiar o exemplo de configuração para o arquivo de configuração local e preencher `JWT_SECRET` e `ENCRYPTION_KEY` (o comando para gerar cada um está no exemplo); `npm run setup` (cria as contas e o agente de exemplo com a fonte de exemplo); `npm run build` e `npm run start` (o processamento em segundo plano só liga no servidor de produção) ou `npm run dev`. As pastas de arquivos enviados ficam em `storage/` (ou no caminho de `STORAGE_DIR`).
- **Estado inicial:** as contas de demonstração existem; o agente "Assistente de exemplo" tem uma fonte já processada.
- **O que precisa estar ligado:** só o próprio sistema; o processamento das fontes roda dentro dele.

## 6. Critério objetivo de aprovação e de reprovação

APROVADO quando: os 10 casos passam; cada arquivo ou texto válido chega a "Pronto" sozinho (casos 2 e 4); o PDF escaneado termina em "Erro" com a mensagem de OCR (caso 5); o vazio e o ".exe" são recusados com motivo (caso 5); "Ver conteúdo" mostra trechos de até 1.000 caracteres, 20 por página (caso 7); excluir só acontece depois de confirmar na própria linha (caso 8); e nenhuma tela vizinha da seção 3 mudou de comportamento.

REPROVADO quando: qualquer caso falha, um caminho de pasta do servidor ou um texto técnico aparece na tela, um arquivo inválido é aceito, uma fonte de um agente aparece em outro, ou a aba deixa a página rolar para o lado no celular.

## 7. O que NÃO faz parte desta entrega

- O agente responder usando esse conteúdo, mostrar de qual fonte tirou a resposta ou dizer que não sabe: é a próxima entrega (busca e respostas com a base).
- Vídeo, áudio e link do YouTube como fonte: entrega própria (já há espaço reservado na lista de opções).
- Ler PDF escaneado por OCR e planilhas XLSX: fora do escopo do projeto.
- Busca dentro da base, edição do texto de uma fonte e substituir um arquivo por outro: não existem; para trocar, exclua e envie de novo.
- Mais de uma instalação ao mesmo tempo atendendo a mesma base: o processamento em segundo plano foi feito para um servidor só.
- Backup dos arquivos enviados e exclusão de usuários: entregas de operação e de privacidade.
- Verificação visual a 375 pixels reais, o spinner de "Processando" e o arrastar-e-soltar com o mouse: não puderam ser vistos na verificação do desenvolvimento (estão registrados como pendência de revisão visual); vale conferi-los neste pacote, nos casos 4 e 10.
