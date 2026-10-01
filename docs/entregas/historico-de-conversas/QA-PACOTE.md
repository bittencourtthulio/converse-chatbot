---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
casos: 26
atualizado_em: 2026-10-01
---

# Pacote de QA — Histórico de conversas e painel inicial (FT-09)

## 1. O que mudou

O menu ganha o item **Conversas**, logo abaixo de **Agentes**. Ali a pessoa lê tudo o que foi conversado com os agentes, nos três lugares onde se conversa (a aba "Testar" do painel, o chat embutido num site e o Telegram), filtra por agente, canal, palavra e período, abre uma conversa para ver as mensagens, com o horário e as fontes que o agente usou em cada resposta, baixa a conversa em arquivo de texto e apaga uma conversa ou várias de uma vez, sempre com uma pergunta de confirmação na própria tela. Quem conversou aparece só de forma resumida: o visitante do site como "Visitante" e as 6 primeiras letras do código dele, a pessoa do Telegram pelo nome público ("Telegram: Maria") e o usuário do painel pelo nome.

A tela inicial (**Painel**) deixa de ser uma tela vazia: mostra quantos agentes, fontes prontas e fontes com erro existem, quantas conversas e mensagens houve nos últimos 7 dias (por canal), um gráfico das mensagens por dia nos últimos 14 dias, as 5 conversas mais recentes, um aviso quando há fontes com erro e uma lista de "Primeiros passos" que some sozinha quando tudo está feito. O agente de exemplo agora já vem com duas conversas de mentira (uma do painel e outra do chat embutido) para as telas não nascerem vazias.

## 2. Roteiro de teste

Os casos partem de uma instalação preparada como na seção 5, com o **OpenRouter de mentira** (a resposta dele é sempre a mesma frase de exemplo, com uma lista, um trecho de código e um link) e o **Telegram de mentira** (um aplicativo de teste que imita o Telegram, porque o de verdade só funciona com uma conta e um endereço público do dono do sistema). Use as contas de demonstração (seção 5). Salvo quando o caso disser outra coisa, entre como **administrador**.

**Caso 1 — O item Conversas no menu**
1. Entre como administrador e olhe o menu lateral. Saia, entre como usuário comum e olhe de novo.
- Deve acontecer: nos dois casos o menu mostra, nesta ordem, "Painel", "Agentes" e "Conversas", sem divisória entre eles; "Conversas" tem um ícone de balão e fica destacado quando a página dele está aberta.
- Falha se: o item some para o usuário comum, aparece em outra ordem ou abre uma página que não é a das conversas.

**Caso 2 — As duas conversas de exemplo**
1. Clique em "Conversas".
- Deve acontecer: aparece a lista com (pelo menos) duas conversas do "Assistente de exemplo": uma de "Usuário de demonstração" com o selo "Painel" e 4 mensagens, outra de "Visitante visita" com o selo "Chat embutido" e 4 mensagens. Cada linha mostra o interlocutor, o agente, o canal, o número de mensagens, a data e a hora da última atividade e o começo da última mensagem. Embaixo aparece "1 a 2 de 2 conversas" (ou o total correto). Acima da lista há os filtros Agente, Canal, "Buscar no texto", De e Até.
- Falha se: faltam colunas, o selo do canal só tem cor e nenhuma palavra, ou a prévia aparece com símbolos de formatação soltos (asteriscos, colchetes).

**Caso 3 — Gerar uma conversa pela aba Testar (canal Painel)**
1. Em "Agentes", abra o "Assistente de exemplo", aba "Testar", escreva "Qual o horário de atendimento da loja?" e envie. Espere a resposta terminar.
2. Volte para "Conversas".
- Deve acontecer: no topo da lista há uma conversa nova com o selo "Painel", o seu nome como interlocutor, 2 mensagens e a hora de agora.
- Falha se: a conversa não aparece, aparece duplicada ou com outro canal.

**Caso 4 — Gerar uma conversa pelo chat embutido (canal Chat embutido)**
1. Em outra aba do navegador, abra a página do chat embutido do agente de exemplo (endereço na seção 5), escreva "Vocês entregam em outras cidades?" e envie. Espere a resposta.
2. Volte para "Conversas" e atualize a página.
- Deve acontecer: aparece uma conversa nova com o selo "Chat embutido", interlocutor "Visitante" seguido de seis caracteres, 2 mensagens.
- Falha se: não aparece, ou o interlocutor mostra o código inteiro do visitante em vez de só seis caracteres.

**Caso 5 — Gerar conversas pelo Telegram (canal Telegram)**
1. No agente de exemplo, aba "Canais", cole o token de teste do Telegram de mentira e clique em "Conectar".
2. No terminal, use ENVIAR (seção 5) duas vezes: com o nome "Maria" e o texto "Quero trocar um produto", e com o nome "Joao" (outro número de chat) e o texto "Qual o horário de atendimento?". Espere alguns segundos.
3. Volte para "Conversas" e atualize.
- Deve acontecer: aparecem duas conversas com o selo "Telegram", com interlocutor "Telegram: Maria" e "Telegram: Joao", 2 mensagens cada.
- Falha se: aparece o número do chat do Telegram em qualquer lugar da tela, ou as duas mensagens caem na mesma conversa.

**Caso 6 — Filtrar por canal**
1. Em "Conversas", escolha "Telegram" no filtro "Canal" e clique em "Filtrar". Depois repita com "Chat embutido" e com "Painel".
- Deve acontecer: a lista mostra só as conversas do canal escolhido, e o endereço da página guarda o filtro (recarregar mantém o resultado). Aparece o botão "Limpar filtros"; ao clicar, a lista volta inteira.
- Falha se: aparece conversa de outro canal, o filtro se perde ao recarregar ou "Limpar filtros" não limpa.

**Caso 7 — Filtrar por agente**
1. Crie um segundo agente em "Agentes", "Novo agente" (nome "Agente B", pode deixar o resto como está), abra a aba "Testar" dele e converse uma vez.
2. Em "Conversas", escolha "Agente B" no filtro "Agente" e filtre. Depois escolha o agente de exemplo.
- Deve acontecer: com "Agente B" aparece só a conversa dele; com o agente de exemplo aparecem as demais, nenhuma do "Agente B". Combinar agente e canal reduz mais a lista.
- Falha se: aparece conversa do agente errado.

**Caso 8 — Buscar no texto**
1. Digite "entregam" em "Buscar no texto" e filtre. Depois digite "ENTREGAM" (maiúsculas). Depois digite "palavra-que-ninguem-escreveu".
- Deve acontecer: com "entregam" (e com "ENTREGAM") aparece a conversa do Caso 4, mesmo a palavra estando numa mensagem que não é a última; com a palavra inexistente aparece o aviso "Nenhuma conversa encontrada" e o botão "Limpar filtros".
- Falha se: a busca ignora mensagens que não são a última, diferencia maiúsculas de minúsculas em letras sem acento, ou a lista fica vazia sem aviso.

**Caso 9 — Símbolos na busca valem como texto**
1. Digite "%" e filtre. Depois digite "_" e filtre. Depois digite "100%" e filtre.
- Deve acontecer: nenhuma busca devolve "tudo": "%" e "_" só acham conversas que de fato tenham esses sinais escritos (provavelmente nenhuma, com o aviso "Nenhuma conversa encontrada"), e a página não dá erro.
- Falha se: "%" ou "_" listam todas as conversas, ou a página mostra erro.

**Caso 10 — Filtrar por período**
1. Escolha como "De" e "Até" o dia de hoje e filtre. Depois escolha "Até" ontem e filtre. Depois escolha "De" amanhã e "Até" ontem (datas invertidas) e filtre.
- Deve acontecer: com hoje aparecem todas as conversas geradas nesta sessão (a de exemplo do painel foi criada 3 horas antes da preparação e a do chat embutido 27 horas antes, então elas aparecem ou não conforme a hora em que a instalação foi preparada: confira pela data mostrada na lista); com "Até" ontem não aparece nenhuma conversa gerada nesta sessão; com as datas invertidas aparece um aviso amarelo "Confira os filtros" explicando que o período é inválido, sem derrubar a página.
- Falha se: o dia de hoje some do resultado de "hoje", ou as datas invertidas dão erro técnico.

**Caso 11 — Paginação**
1. No terminal, use ENVIAR 26 vezes, cada vez com um número de chat diferente (o comando em laço está na seção 5). Espere terminar e abra "Conversas".
- Deve acontecer: a primeira página mostra 25 conversas, as mais recentes primeiro, e embaixo "1 a 25 de N conversas" com os botões "Anterior" (desabilitado), números de página e "Próxima". Clicar em "Próxima" mostra o resto, "Próxima" fica desabilitada e o número da página atual aparece destacado.
- Falha se: a página mostra mais de 25 linhas, a mesma conversa aparece nas duas páginas ou a ordem não é da mais recente para a mais antiga.

**Caso 12 — Abrir uma conversa**
1. Em "Conversas", clique na linha da conversa de exemplo "Visitante visita" (clicar em qualquer ponto da linha deve funcionar).
- Deve acontecer: abre a página da conversa com o link "Voltar para as conversas", o título "Visitante visita", "Conversa com o agente Assistente de exemplo", uma caixa com agente (um link), canal, interlocutor, início, última atividade e número de mensagens, e as mensagens em balões: as do visitante à direita, as do agente à esquerda, cada uma com data e hora logo abaixo, e o nome do modelo nas respostas.
- Falha se: os balões estão fora de ordem, faltam os horários ou a linha só abre se clicar no nome.

**Caso 13 — Fontes de cada resposta**
1. Na conversa do Caso 12, olhe as respostas do agente. Clique no nome de uma fonte citada e depois no sinal "[1]" dentro da resposta.
- Deve acontecer: cada resposta do agente tem a seção "Fontes" com a fonte "Política de troca e horário da Loja Exemplo" destacada como citada; clicar nela mostra o trecho usado ("Trecho N · [1]"); clicar no "[1]" do texto abre a fonte correspondente. Mensagens do visitante não têm fontes.
- Falha se: a resposta não mostra fontes, o trecho aparece vazio ou o "[1]" não faz nada.

**Caso 14 — Texto malicioso vira só texto**
1. Na página do chat embutido, escreva exatamente `<script>alert(1)</script><img src=x onerror=alert(2)> teste` e envie. Abra essa conversa em "Conversas" (o visitante é o mesmo do Caso 4, então ela aparece como "Visitante" de seis caracteres).
- Deve acontecer: na lista e na página da conversa o texto aparece escrito, com os sinais de menor e maior, tal como foi digitado; nenhuma janelinha de alerta abre, nenhuma imagem quebrada aparece.
- Falha se: aparece qualquer janelinha de alerta ou imagem quebrada, ou o texto some.

**Caso 15 — Exportar em arquivo de texto**
1. Na página de uma conversa, clique em "Exportar (.txt)".
- Deve acontecer: o navegador baixa um arquivo `.txt` cujo nome começa com "conversa-" seguido de letras e números, sem o nome do visitante nem do usuário. Dentro, em texto simples: o agente, o canal, o interlocutor (resumido, como na tela), as datas, o número de mensagens e todas as mensagens em ordem, com a hora de cada uma e, nas respostas, a linha "Fontes:" com o nome das fontes.
- Falha se: o nome do arquivo ou o conteúdo traz o código inteiro do visitante ou o número do chat do Telegram, ou o arquivo abre como página em vez de baixar.

**Caso 16 — Apagar uma conversa (com a confirmação)**
1. Na página de uma conversa gerada por você (não a de exemplo), clique em "Apagar". Leia a pergunta e clique em "Cancelar".
2. Clique em "Apagar" de novo e agora em "Confirmar exclusão".
- Deve acontecer: no passo 1 aparece, na própria página (não numa janelinha do navegador), "Apagar esta conversa?" com o aviso de que não pode ser desfeito e os botões "Confirmar exclusão" e "Cancelar"; "Cancelar" fecha a pergunta e a conversa continua. No passo 2 a conversa é apagada e a página volta para a lista, onde ela não aparece mais.
- Falha se: a pergunta abre numa janelinha do navegador, "Cancelar" apaga mesmo assim, ou a conversa continua na lista depois de confirmar.

**Caso 17 — Apagar várias conversas de uma vez**
1. Em "Conversas", marque as caixas de duas conversas. Olhe a barra acima da lista e clique em "Apagar selecionadas".
2. Clique em "Cancelar". Clique em "Apagar selecionadas" de novo e em "Confirmar exclusão".
- Deve acontecer: a barra mostra "2 selecionadas" e os botões "Apagar selecionadas" e "Limpar seleção"; a pergunta "Apagar 2 conversas?" aparece na tela; "Cancelar" a fecha e mantém a seleção; "Confirmar exclusão" apaga as duas e a lista recarrega sem elas.
- Falha se: apaga sem perguntar, apaga uma só ou as que não estavam marcadas.

**Caso 18 — Selecionar todas e o limite de 50**
1. Em "Conversas" (com mais de 25 conversas, do Caso 11), clique em "Selecionar todas desta página". Depois "Desmarcar todas desta página". Depois use "Limpar seleção" se houver.
2. (Opcional, para ver o limite) Use ENVIAR para ter mais de 50 conversas, mude para a página seguinte e marque conversas até passar de 50 em uma mesma seleção (ou use "Selecionar todas" em duas páginas seguidas).
- Deve acontecer: "Selecionar todas desta página" marca todas as linhas da página e mostra a contagem; "Desmarcar todas desta página" tira as marcações; ao tentar passar de 50 selecionadas, a barra avisa "Você pode selecionar até 50 conversas por vez." e não passa de 50.
- Falha se: seleciona de uma página que não é a atual, ou permite apagar mais de 50 de uma vez.

**Caso 19 — Conversa que não existe e quem não entrou**
1. Digite no endereço do navegador `/conversas/codigo-que-nao-existe` (depois do endereço do sistema).
2. Saia do sistema e tente abrir `/conversas` diretamente.
- Deve acontecer: no passo 1 aparece a página "Conversa não encontrada" com o botão "Voltar para as conversas" (e o navegador trata como página inexistente); no passo 2 o sistema leva para a tela de entrar.
- Falha se: aparece erro técnico, uma tela em branco ou a lista sem entrar.

**Caso 20 — Usuário comum também lê e apaga**
1. Entre como usuário comum de demonstração, abra "Conversas" e a conversa de exemplo do painel.
- Deve acontecer: o usuário comum vê todas as conversas de todos os canais (inclusive as geradas pelo administrador) e tem os botões "Exportar (.txt)" e "Apagar".
- Falha se: a lista vem vazia ou falta algum botão.

**Caso 21 — O Painel preenchido**
1. Entre como administrador e abra "Painel". Anote os números. Depois apague uma conversa (Caso 16) e volte ao "Painel".
- Deve acontecer: o título "Painel" e o texto "Visão geral da sua conta." continuam; cartões "Agentes", "Fontes prontas", "Fontes com erro", "Conversas" e "Mensagens" (os dois últimos "nos últimos 7 dias"); uma linha "Por canal, nos últimos 7 dias" com os três canais (selo e "N conversas · M mensagens"); depois de apagar, os números de conversas e mensagens diminuem.
- Falha se: faltam cartões, os números não mudam depois de apagar ou a soma por canal não bate com o total.

**Caso 22 — O gráfico de mensagens por dia**
1. No "Painel", olhe "Mensagens por dia". Clique em "Ver os dados em tabela".
- Deve acontecer: um gráfico de barras com 14 dias (o último é hoje), o número escrito em cima de cada barra com mensagem e o dia do mês embaixo; dias sem mensagem não têm barra. A tabela mostra os 14 dias com a data completa e a quantidade, e a soma bate com os números das mensagens do gráfico. Se não houver nenhuma mensagem em 14 dias, em vez do gráfico aparece "Nenhuma mensagem nos últimos 14 dias".
- Falha se: o gráfico depende só de cor para mostrar o valor (sem número), a tabela não bate com as barras ou os dias estão fora de ordem.

**Caso 23 — Conversas recentes no Painel**
1. No "Painel", olhe "Conversas recentes" e clique em uma delas e depois em "Ver todas as conversas".
- Deve acontecer: aparecem até 5 conversas, da mais recente para a mais antiga, cada uma com interlocutor (resumido), selo do canal, começo da última mensagem, agente e data; clicar abre a conversa; "Ver todas as conversas" abre a lista.
- Falha se: aparece mais de 5, o interlocutor sai por extenso ou o clique não abre a conversa certa.

**Caso 24 — Primeiros passos e quem vê o link da chave**
1. Entre como administrador, com a instalação ainda sem a chave do OpenRouter cadastrada (instalação nova), e olhe o "Painel". Saia e entre como usuário comum.
2. Como administrador, cadastre a chave de teste em "Configurações", "Integrações" e volte ao "Painel".
- Deve acontecer: no passo 1 aparece "Primeiros passos" com "3 de 4 concluídos" (chave pendente; agente, fonte e chat publicado feitos pelo exemplo), cada passo com "Feito" ou "Pendente" escrito; o administrador vê o botão "Abrir Integrações"; o usuário comum vê o passo da chave com a orientação de pedir a um administrador e **sem** botão para Integrações. No passo 2, com os quatro passos feitos, a lista "Primeiros passos" desaparece do "Painel".
- Falha se: o usuário comum recebe o link das Integrações, o estado dos passos só se distingue pela cor ou a lista continua depois de tudo feito.

**Caso 25 — Alerta de fontes com erro (exige o programa ffmpeg instalado)**
1. No agente de exemplo, aba "Conhecimento", opção "Vídeo", envie um arquivo de áudio de teste (como gerar está no README, seção do vídeo) com o OpenRouter de mentira configurado para falhar a primeira parte (comando "FALHAR" na seção 5). Espere a fonte ficar em "Erro". Abra o "Painel".
- Deve acontecer: aparece um aviso amarelo "1 fonte com erro" com o nome da fonte (um link para a aba "Conhecimento" do agente), o nome do agente e a mensagem do erro; o cartão "Fontes com erro" mostra 1 e a nota "precisam de atenção". Depois de excluir a fonte, o aviso some.
- Falha se: o aviso não aparece, o link leva a outro lugar, ou o aviso continua depois de excluir a fonte. (Sem o ffmpeg, pule este caso e registre como "não executado".)

**Caso 26 — Celular e tema escuro**
1. Abra o sistema numa janela estreita (cerca de 375 pixels de largura, ou num celular), entre e visite "Painel", "Conversas" e uma conversa. Depois mude para o tema escuro (ícone de lua no alto) e repita.
- Deve acontecer: nada obriga a rolar para o lado; na lista, cada conversa vira um cartão com os rótulos ao lado de cada informação, com a caixa de seleção no canto; os filtros ocupam uma coluna; botões e caixas são fáceis de tocar; no tema escuro, fundo escuro, textos legíveis, selos e barras do gráfico visíveis.
- Falha se: surge barra de rolagem lateral, texto cortado ou sobreposto, ou algum elemento fica ilegível no tema escuro.

## 3. O que observar de colateral

- **Aba "Testar" do agente:** apagar a conversa do painel faz a aba "Testar" começar vazia na próxima visita (ela retoma a conversa mais recente). Confira que uma conversa nova funciona e que as fontes continuam aparecendo nas respostas.
- **Chat embutido (aba "Publicar") e página do chat:** conversar não mudou; confira que depois de apagar a conversa de um visitante, ele consegue conversar de novo e uma conversa nova aparece.
- **Aba "Canais" (Telegram):** desconectar o bot não apaga as conversas do Telegram, que continuam na lista de "Conversas". Pausar o bot não faz sumir o histórico.
- **Aba "Conhecimento":** uma fonte excluída continua aparecendo pelo nome nas respostas antigas (o nome fica gravado na conversa).
- **Menu e título:** o item "Conversas" aparece também no menu do celular (o botão de três linhas) e o título do cabeçalho muda para "Conversas" na lista e na página de uma conversa; as outras páginas (Agentes, Usuários, Integrações, Meu perfil) abrem como antes.
- **Painel:** o atalho "Cadastrar usuário" continua só para o administrador; o título e o subtítulo continuam os mesmos.
- A lista de colaterais pode estar incompleta: não houve como medir tudo o que lê as mesmas conversas.

## 4. Dado de teste sugerido

Tudo fictício, criado durante o teste:
- as duas conversas de exemplo que já vêm com o sistema (do painel, de "Usuário de demonstração", e do chat embutido, de "Visitante visita");
- uma conversa de cada canal gerada por você (Casos 3, 4 e 5), incluindo uma em que uma mensagem (não a última) contenha a palavra "entregam";
- uma mensagem com sinais de programação (`<script>` e `<img onerror>`) no chat embutido (Caso 14);
- um nome de pessoa do Telegram com acento (por exemplo "João") para conferir que o nome aparece inteiro;
- pelo menos 26 conversas do Telegram, cada uma de um chat de número diferente (Caso 11);
- um segundo agente ("Agente B") com ao menos uma conversa (Caso 7);
- um arquivo de áudio de teste gerado pelo programa ffmpeg, para o Caso 25.

## 5. Ambiente e estado inicial

**Onde testar:** num computador de desenvolvimento, com o sistema rodando localmente. Use as contas de demonstração, administrador `admin@exemplo.local` e usuário comum `usuario@exemplo.local`; a senha de demonstração está no README do projeto. Nenhuma credencial real é necessária ou deve ser usada.

**O que precisa existir antes:** o sistema preparado com `npm run setup` (que cria as contas e as duas conversas de exemplo) e `npm run build`; a chave do OpenRouter de teste cadastrada em "Configurações", "Integrações" (o OpenRouter de mentira imprime a chave de teste ao iniciar). Para o Caso 24, comece com uma instalação nova, sem a chave cadastrada.

**O que precisa estar ligado (três terminais):**
1. OpenRouter de mentira: `npx tsx tests/apoio/servir-falso.ts` (anote o endereço que ele imprime).
2. Telegram de mentira: `npx tsx tests/apoio/servir-telegram-falso.ts` (anote o endereço e o token de teste que ele imprime; ele escuta os comandos em `localhost:4400`).
3. O sistema: `npm run start` com as variáveis `OPENROUTER_BASE_URL` (endereço do passo 1), `TELEGRAM_API_BASE` (endereço do passo 2), `APP_URL` igual a um endereço HTTPS qualquer, como `https://converse-teste.exemplo.invalid`, e `TRUST_PROXY=1`.
- **ENVIAR:** `curl -s -X POST localhost:4400/enviar -d '{"texto":"oi","nome":"Maria","chatId":4242}'`. Cada `chatId` diferente é uma pessoa (e uma conversa) diferente.
- **26 conversas de uma vez (Caso 11):** `for i in $(seq 1 26); do curl -s -X POST localhost:4400/enviar -d "{\"texto\":\"mensagem $i\",\"nome\":\"Pessoa $i\",\"chatId\":$((9000+i))}"; done` (espere alguns segundos para o agente de mentira responder a todas).
- **VER RESPOSTAS:** `curl -s localhost:4400/estado`.
- **FALHAR (Caso 25):** `curl -s -X POST localhost:4401/configurar -d '{"falhasPorParte":{"0":402}}'` (para desfazer, `{"falhasPorParte":{}}`).
- **Página do chat embutido:** o endereço do sistema seguido de `/embed/agente-de-exemplo`.

## 6. Critério de aprovação

**APROVADO quando:** os 26 casos passam (o Caso 25 pode ficar "não executado" só se o programa ffmpeg não estiver instalado), nenhuma tela mostra o código inteiro do visitante nem o número do chat do Telegram, nenhum texto digitado por um visitante vira elemento da página ou abre alerta, apagar sempre pede confirmação na própria tela, e nenhuma tela vizinha da seção 3 mudou de comportamento.

**REPROVADO quando:** qualquer caso falha, uma conversa é apagada sem confirmação ou a que não estava marcada some, o gráfico ou os números do Painel não batem com as conversas, o usuário comum recebe o link das Integrações, ou algum texto técnico (nome de erro, código, inglês) chega à tela.

## 7. O que NÃO faz parte desta entrega

- **A guarda automática (retenção por dias), a exclusão definitiva de um usuário da equipe, o aviso de privacidade e o registro de quem apagou uma conversa:** entrega seguinte, de privacidade e auditoria. Nesta entrega, apagar não deixa registro de quem apagou.
- **Apagar todas as conversas de um mesmo visitante ou de um mesmo chat do Telegram de uma vez:** só se apaga por conversa (ou em lote escolhido na lista).
- **Desfazer uma exclusão:** apagar é definitivo.
- **Busca que ignore acentos:** a busca ignora maiúsculas só nas letras sem acento; "ação" e "AÇÃO" são buscas diferentes. Também não há busca por relevância.
- **Exportar em outros formatos** (planilha, PDF) ou exportar várias conversas de uma vez.
- **Chat embutido num site de terceiros:** o botão flutuante do script foi visto numa entrega anterior; aqui o chat foi aberto pela própria página do chat.
- **Celular de verdade e leitor de tela:** só foram conferidos numa janela estreita simulada; o Caso 26 e a leitura do gráfico por leitor de tela dependem de olhos e ouvidos humanos.
- **Volume grande:** não foi medido o tempo da busca com muitas centenas de milhares de mensagens.
- Backup, contêiner e endereço público definitivo (entrega de operação).
