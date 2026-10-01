---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
casos: 24
atualizado_em: 2026-10-01
---

# Pacote de QA — Privacidade e auditoria (FT-10)

## 1. O que mudou

O administrador ganha duas telas novas em **Configurações**: **Auditoria**, uma lista só para leitura de quem trocou a chave do OpenRouter, criou, desativou ou excluiu usuários, excluiu agentes, conectou ou desconectou o Telegram, apagou conversas, mudou a retenção e quando a limpeza automática rodou; e **Privacidade**, onde ele escolhe por quantos dias as conversas ficam guardadas (o sistema passa a apagar sozinho as mais antigas, 90 dias por padrão), escreve o aviso de privacidade padrão, lê o que o sistema guarda das pessoas e atende o pedido de uma pessoa: buscar, baixar uma cópia ou apagar tudo dela.

Em **Usuários**, o administrador pode **Excluir definitivamente** alguém da equipe (os agentes dessa pessoa continuam e passam a ser de quem excluiu). No chat embutido no site, quem conversa ganha um ícone de lixeira, **Apagar minha conversa**, que apaga só a conversa dela. Se houver um aviso de privacidade padrão, ele aparece no chat dos agentes que não têm aviso próprio e junto da primeira mensagem do bot do Telegram.

## 2. Roteiro de teste

Os casos partem de uma instalação preparada como na seção 5. O OpenRouter e o Telegram são de mentira (nenhum serviço real é usado e nenhuma resposta de inteligência artificial é necessária). Use **sempre a conta de administradora de demonstração**, exceto onde o caso pede a conta de usuário comum. Anote a hora de cada ação: a tela de Auditoria mostra data e hora.

**Caso 1 — Os itens novos no menu**
1. Entre como administradora e olhe o grupo "Configurações" do menu lateral. Saia, entre como usuário comum e olhe de novo.
- Deve acontecer: para a administradora, a ordem é Usuários, Integrações, Privacidade, Auditoria, Meu perfil. Para o usuário comum aparece só "Meu perfil".
- Falha se: o usuário comum vê "Privacidade" ou "Auditoria", ou os itens aparecem em outra ordem.

**Caso 2 — Usuário comum não entra por endereço digitado**
1. Entre como usuário comum. Na barra de endereço do navegador, troque o final do endereço por "/configuracoes/privacidade" e aperte Enter. Repita com "/configuracoes/auditoria".
- Deve acontecer: nas duas vezes o sistema leva de volta à tela inicial, sem mostrar nada das telas de administração.
- Falha se: qualquer parte da tela aparece, mesmo por um instante.

**Caso 3 — Auditoria antes de qualquer ação**
1. Entre como administradora e abra Configurações, Auditoria numa instalação recém-preparada.
- Deve acontecer: aparece a mensagem "Nenhum registro ainda", os filtros (Ação, Quem fez, De, Até) e nenhum botão de editar ou apagar.
- Falha se: aparece uma lista de registros antes de qualquer ação, ou há botão para apagar um registro.

**Caso 4 — Trocar a chave do OpenRouter e o modelo de transcrição**
1. Abra Configurações, Integrações. No campo da chave escreva "chave-ficticia-de-teste-0001" e clique em "Salvar chave".
2. Mais abaixo, em "Modelo de transcrição", escreva "google/gemini-2.5-pro" e clique em "Salvar modelo".
3. Abra Auditoria.
- Deve acontecer: no topo há dois registros com a data e a hora de agora, o nome e o e-mail da administradora e as frases "Trocou a chave do OpenRouter." e "Alterou o modelo de transcrição para google/gemini-2.5-pro.".
- Falha se: o texto "chave-ficticia-de-teste-0001", qualquer pedaço dela ou os últimos caracteres aparecem em qualquer lugar da tela de Auditoria, ou falta um dos dois registros.

**Caso 5 — Criar e desativar um usuário**
1. Em Usuários, crie "Teste Auditoria" com o e-mail "teste.auditoria@exemplo.local", uma senha provisória de pelo menos 8 caracteres e papel Usuário. Em outra linha qualquer de usuário comum, clique em "Desativar".
2. Abra Auditoria.
- Deve acontecer: aparecem "Criou o usuário Teste Auditoria com o papel Usuário." e "Desativou o usuário" seguido do nome de quem foi desativado. Nenhuma senha aparece.
- Falha se: aparece senha, ou o registro mostra o e-mail do usuário criado em vez do nome, ou falta um dos dois.

**Caso 6 — Excluir definitivamente: a confirmação**
1. Em Usuários, escolha uma pessoa que seja dona de pelo menos um agente (use a "Pessoa Para Excluir" da preparação) e clique em "Excluir definitivamente" na linha dela.
- Deve acontecer: abre, na própria tela (não numa janela do navegador), um quadro vermelho que diz que a exclusão é irreversível, que agentes, conversas e base de conhecimento continuam na empresa e que "Desativar" é a alternativa que pode ser desfeita. Há um campo para digitar o e-mail da pessoa, o botão "Confirmar exclusão" está desabilitado e existe o botão "Cancelar".
2. Digite só o começo do e-mail. Depois digite o e-mail inteiro com letras maiúsculas e um espaço no final.
- Deve acontecer: com o e-mail incompleto o botão continua desabilitado; com o e-mail completo (mesmo com maiúsculas e espaço) ele habilita.
- Falha se: o botão habilita antes de o e-mail estar completo, ou aparece uma janela nativa do navegador pedindo confirmação.
3. Clique em "Cancelar".
- Deve acontecer: o quadro fecha e a pessoa continua na lista.

**Caso 7 — Excluir definitivamente: o efeito**
1. Repita o passo de abrir a confirmação, digite o e-mail correto e clique em "Confirmar exclusão".
2. Confira a lista de Usuários, depois "Agentes" e "Conversas". Tente entrar com a conta excluída em outra janela anônima do navegador.
3. Abra Auditoria.
- Deve acontecer: a pessoa some de Usuários; o agente dela continua em Agentes e as conversas continuam em Conversas; a conta excluída não consegue entrar ("E-mail ou senha incorretos."); a Auditoria mostra "Excluiu definitivamente o usuário" com o nome e o e-mail da pessoa e "1 agente passou para quem excluiu.".
- Falha se: o agente ou as conversas somem, a conta excluída ainda entra, ou falta o registro.

**Caso 8 — Não dá para excluir a si mesma**
1. Em Usuários, olhe a linha da própria administradora ("Você").
- Deve acontecer: a linha tem "Desativar" mas não tem "Excluir definitivamente".
- Falha se: o botão aparece na própria linha.

**Caso 9 — Telegram: cinco ações, cinco registros**
1. Abra o "Assistente de exemplo", aba "Canais". Cole o token do Telegram de mentira e clique em "Conectar".
2. Clique em "Pausar", depois em "Retomar". Troque o limite diário para 300 e clique em "Salvar limite". Clique em "Desconectar" e em "Confirmar desconexão".
3. Abra Auditoria.
- Deve acontecer: cinco registros, na ordem: "Conectou o bot do Telegram ao agente "Assistente de exemplo".", "Pausou…", "Retomou…", "Alterou o limite diário do bot do Telegram do agente…" e "Desconectou…". O token não aparece.
- Falha se: falta algum dos cinco, ou o token ou parte dele aparece.

**Caso 10 — Apagar uma conversa**
1. Abra Conversas, entre numa conversa de visitante e clique em "Apagar" e depois em "Confirmar exclusão".
2. Abra Auditoria.
- Deve acontecer: você volta à lista de Conversas sem aquela conversa; a Auditoria mostra "Apagou uma conversa do chat embutido" seguido do número de mensagens. O texto da conversa não aparece.
- Falha se: o texto da conversa ou o código do visitante aparece na Auditoria.

**Caso 11 — Retenção: valores e confirmação de risco**
1. Abra Configurações, Privacidade. Veja o quadro "Retenção das conversas".
- Deve acontecer: aparece "Atualmente: 90 dias" na primeira vez, com a opção "Apagar depois de [90] dias sem atividade" marcada e a explicação de que a limpeza roda 1 minuto depois de o sistema subir e a cada 6 horas.
2. Troque o número por 5 e clique em "Salvar retenção".
- Deve acontecer: aparece uma mensagem de erro dizendo que a retenção vai de 7 a 3650 dias, e nada muda.
3. Troque o número por 60 e salve.
- Deve acontecer: aparece "Retenção salva" e a Auditoria mostra "Alterou a retenção das conversas de 90 dias para 60 dias.".
4. Marque "Sem expurgo automático".
- Deve acontecer: aparece um aviso de risco (as conversas ficam guardadas para sempre), uma caixa "Entendo o risco…" e o botão "Salvar retenção" fica desabilitado até a caixa ser marcada. Volte para "Apagar depois de" 60 dias sem salvar.
- Falha se: dá para salvar "Sem expurgo" sem marcar a caixa, ou 5 dias é aceito.

**Caso 12 — A limpeza automática apaga só o que passou do prazo**
1. Com a instalação preparada como na seção 5 (que traz conversas de 120 e de 100 dias atrás e outras de 10 e de 3 dias atrás) e a retenção em 60 dias, abra Conversas logo depois de o sistema subir e anote quais conversas existem. Espere 2 minutos e recarregue.
2. Abra Auditoria.
- Deve acontecer: as conversas de 120 e de 100 dias sumiram e as de 10 e de 3 dias continuam; a Auditoria mostra, em nome de "Sistema", "O expurgo automático apagou 2 conversas (6 mensagens)…" e "Retenção das conversas: 60 dias.". Nenhum texto de conversa aparece.
- Falha se: uma conversa recente some, uma conversa antiga continua, ou o registro cita texto de conversa.

**Caso 13 — Aviso de privacidade padrão**
1. Em Privacidade, no quadro "Aviso de privacidade padrão", escreva "Suas mensagens são guardadas para atendimento." no texto, "https://exemplo.com.br/privacidade" no link e clique em "Salvar aviso".
- Deve acontecer: aparece "Aviso de privacidade padrão salvo." e o contador de caracteres acompanha o que você digita (máximo 300).
2. Escreva um link que não comece com http nem https (por exemplo "ftp://x.com") e salve.
- Deve acontecer: aparece um erro dizendo que o link precisa ser http ou https.
3. Abra o chat embutido de um agente que não tem aviso próprio (aba "Publicar" do agente, com o campo de aviso em branco) e olhe o rodapé.
- Deve acontecer: o rodapé mostra o aviso padrão com o link "Saiba mais". Num agente que tem aviso próprio, aparece o do agente.
4. Conecte o Telegram de mentira ao agente e, pelo simulador (seção 5), mande ao bot a mensagem "/start".
- Deve acontecer: a resposta do bot traz a mensagem de boas-vindas do agente, uma linha em branco, o aviso padrão e, na linha de baixo, o endereço.
- Falha se: o aviso do agente é trocado pelo padrão, o aviso padrão não aparece em nenhum dos dois canais, ou o link não é mostrado.

**Caso 14 — Painel "Dados pessoais tratados"**
1. Em Privacidade, role até "Dados pessoais tratados".
- Deve acontecer: aparecem três blocos (Chat embutido, Telegram, Painel) com os dados de cada canal (por exemplo, o identificador anônimo do visitante, o nome público do chat do Telegram e o texto das mensagens) e os itens Finalidade, Retenção (com o prazo atual), Onde ficam, Quem acessa e Base legal, que diz "Legítimo interesse, a confirmar pela empresa.". Não há campo nem botão nesse quadro.
- Falha se: o quadro tem campo ou botão, a retenção mostrada difere da configurada, ou o texto afirma que o sistema "está de acordo com a lei" ou traz um parecer jurídico.

**Caso 15 — Buscar uma pessoa: vários resultados**
1. Em Privacidade, no quadro "Direitos do titular", deixe o canal "Chat embutido", escreva os 6 primeiros caracteres do identificador de um visitante que apareça em Conversas ("Visitante" seguido de seis caracteres; use os dois visitantes da preparação, que começam igual) e clique em "Buscar".
- Deve acontecer: aparece o aviso "Mais de um titular combina…" com uma pequena lista de códigos curtos (o começo do identificador de cada um), com a quantidade de conversas e de mensagens de cada. Não aparecem os botões de exportar nem de apagar.
- Falha se: aparece o identificador inteiro de alguém, ou os botões de exportar e apagar aparecem com mais de uma pessoa na lista.

**Caso 16 — Buscar uma pessoa e baixar a cópia**
1. Digite mais caracteres do identificador (use os códigos mostrados no caso anterior até restar uma pessoa) e clique em "Buscar".
- Deve acontecer: aparece o resumo ("Visitante …", número de conversas e mensagens, última atividade, agentes) e os botões "Exportar em JSON", "Exportar em TXT" e "Apagar tudo". O identificador completo não aparece.
2. Clique em "Exportar em JSON" e depois em "Exportar em TXT". Abra os dois arquivos baixados.
- Deve acontecer: os nomes dos arquivos são "titular-widget-" seguido da data de hoje e ".json" / ".txt", sem o código do visitante; o conteúdo traz as conversas e mensagens daquela pessoa (e só dela), com data e hora; o código completo do visitante não está dentro dos arquivos.
3. Abra Auditoria.
- Deve acontecer: dois registros "Exportou os dados de um titular do chat embutido…" com as quantidades, sem nenhum texto de conversa.
- Falha se: o arquivo traz conversa de outra pessoa, o nome do arquivo ou o conteúdo tem o código completo do visitante, ou falta o registro.

**Caso 17 — Apagar tudo de uma pessoa**
1. Com a pessoa do caso anterior na tela, clique em "Apagar tudo".
- Deve acontecer: abre, na própria tela, um quadro vermelho que diz que é irreversível e pede para digitar APAGAR; o botão "Confirmar exclusão" está desabilitado.
2. Digite "apagar" em letras minúsculas e depois "APAGAR".
- Deve acontecer: com minúsculas continua desabilitado; com "APAGAR" habilita.
3. Clique em "Confirmar exclusão". Depois abra Conversas e Auditoria.
- Deve acontecer: aparece "Apagadas N conversas e M mensagens do titular."; em Conversas só as conversas dessa pessoa sumiram; a Auditoria mostra "Apagou os dados de um titular do chat embutido: N conversas e M mensagens." (um único registro, sem um por conversa).
- Falha se: conversas de outra pessoa somem, o botão habilita sem a palavra, ou aparecem vários registros para a mesma exclusão.

**Caso 18 — Titular do Telegram**
1. Pelo simulador, gere uma conversa do Telegram (seção 5) e anote o número do chat que o simulador usa. Em Privacidade, escolha o canal "Telegram", digite esse número e clique em "Buscar".
- Deve acontecer: aparece o nome público do chat ("Telegram: …") com as contagens e os mesmos três botões. O número do chat não é repetido na tela.
2. Digite um número que não existe e busque.
- Deve acontecer: "Nenhum titular encontrado com esse identificador neste canal.".
- Falha se: com o número errado aparece alguma conversa.

**Caso 19 — Apagar minha conversa no chat do site**
1. Abra o chat embutido do agente de exemplo (endereço na seção 5), escreva "Vocês aceitam Pix?" e envie. Feche e abra de novo a página: a conversa volta.
2. No cabeçalho do chat clique no ícone de lixeira ("Apagar minha conversa").
- Deve acontecer: abre um quadro com "Apagar minha conversa?", o aviso de que as mensagens serão apagadas de vez e que não pode ser desfeito, e os botões "Apagar tudo" e "Cancelar". Nada foi apagado ainda.
3. Clique em "Cancelar".
- Deve acontecer: o quadro fecha e a conversa continua.
4. Clique de novo na lixeira e em "Apagar tudo".
- Deve acontecer: o chat volta ao começo (só a mensagem de boas-vindas), aparece "Conversa apagada. Você pode começar uma nova quando quiser." e, ao recarregar a página, a conversa antiga não volta.
5. Em Conversas (como administradora) procure essa conversa e depois abra Auditoria.
- Deve acontecer: a conversa não está mais na lista; a Auditoria mostra, em nome de "Visitante (chat embutido)", "O visitante apagou a própria conversa do chat embutido (2 mensagens).".
- Falha se: a conversa continua em Conversas, volta ao recarregar, ou a Auditoria mostra um nome de usuário ou o código do visitante.

**Caso 20 — Um visitante não apaga a conversa de outro**
1. Em uma janela comum do navegador, converse com o chat do agente de exemplo. Em uma janela anônima (outro visitante), converse com o mesmo chat.
2. Na janela anônima, use "Apagar minha conversa" e confirme.
3. Volte à janela comum e recarregue o chat.
- Deve acontecer: a conversa da janela comum continua lá; em Conversas, só a conversa da janela anônima sumiu.
- Falha se: a conversa da outra pessoa some, ou o botão de apagar aparece na prévia do chat que a administradora vê na aba "Publicar" do agente.

**Caso 21 — Filtros e leitura da Auditoria**
1. Em Auditoria, escolha em "Ação" a opção "Usuário excluído" e clique em "Filtrar". Depois limpe e filtre por uma pessoa em "Quem fez". Depois informe em "De" uma data posterior à data em "Até".
- Deve acontecer: o primeiro filtro mostra só as exclusões de usuário; o segundo, só as ações daquela pessoa; o terceiro mostra o aviso "Confira os filtros" dizendo que a data final vem antes da inicial. O endereço da página guarda o filtro (recarregar mantém o resultado) e "Limpar filtros" volta à lista completa.
- Falha se: aparece registro que não casa com o filtro, ou a página quebra com o período invertido.
2. Se houver mais de 25 registros, confira a paginação ("1 a 25 de N registros", botões Próxima e Anterior).
- Deve acontecer: 25 por página, do mais recente ao mais antigo.

**Caso 22 — Nada sensível na Auditoria**
1. Percorra todos os registros que você gerou nos casos anteriores.
- Deve acontecer: nenhum registro mostra a chave do OpenRouter, o token do Telegram, senha, texto de conversa ou o código de visitante. O e-mail aparece só em "Quem fez" (e no registro da exclusão do usuário).
- Falha se: qualquer um dos itens proibidos aparece.

**Caso 23 — Celular (375 de largura) e temas**
1. Reduza a largura da janela do navegador para 375 pontos (ou use o modo celular das ferramentas do navegador) e abra Auditoria, Privacidade, Usuários e o chat embutido. Repita no tema escuro (ícone de lua ou sol no alto).
- Deve acontecer: nada força rolagem para o lado; a Auditoria vira cartões com os rótulos Quando, Quem, Ação e Detalhes em cada um; os campos e botões são fáceis de tocar; os textos continuam legíveis nos dois temas; a lista de Usuários rola dentro do próprio quadro, não a página inteira.
- Falha se: a página rola para o lado, um texto fica cortado ou ilegível, ou um botão fica pequeno demais.

**Caso 24 — Rodar a instalação de novo mantém os registros**
1. Peça a quem preparou o ambiente que reinicie o sistema (sem apagar o banco) e abra Auditoria de novo.
- Deve acontecer: todos os registros anteriores continuam, e uma limpeza automática 1 minuto depois da subida não apaga registros recentes.
- Falha se: registros recentes somem depois do reinício.

## 3. O que observar de colateral

- **Conversas:** a lista continua mostrando os três canais com o interlocutor mascarado ("Visitante" mais seis caracteres, "Telegram: Nome"); apagar uma ou várias conversas continua funcionando e continua pedindo confirmação na tela.
- **Painel inicial:** os números de conversas e mensagens dos últimos 7 dias caem depois de apagar conversas ou de a limpeza automática rodar; o gráfico de 14 dias continua legível.
- **Usuários:** "Desativar" continua funcionando como antes (a pessoa desativada não entra e o botão pode ser desfeito reativando); a criação de usuário continua igual. A lista de Usuários no celular rola dentro do quadro.
- **Integrações:** salvar e remover a chave e testar a conexão continuam funcionando; a chave nunca aparece inteira.
- **Agentes:** excluir um agente continua pedindo confirmação e passou a gerar um registro de auditoria "Excluiu o agente…" com as quantidades de conversas e fontes apagadas junto.
- **Aba Publicar e chat embutido:** o aviso de privacidade do agente continua valendo quando preenchido; o texto de ajuda do campo agora diz que, em branco, vale o aviso padrão do workspace. O chat continua respondendo, mostrando fontes e retomando a conversa ao reabrir.
- **Aba Canais (Telegram):** conectar, pausar, retomar, trocar o limite e desconectar continuam funcionando como antes.
- Esta lista foi derivada das telas que dividem dados com as novas; não há mapa de impacto formal, então ela pode estar incompleta.

## 4. Dado de teste sugerido

Tudo fictício, preparado por um comando de semeadura (seção 5):
- Dois visitantes do chat embutido cujos códigos começam com os mesmos caracteres (para testar a busca com vários resultados), cada um com uma conversa recente (de 10 e de 3 dias atrás).
- Uma conversa de visitante de 120 dias atrás e uma conversa do Telegram, de uma pessoa chamada "Joana Exemplo", de 100 dias atrás (para a limpeza automática apagar).
- Um usuário comum chamado "Pessoa Para Excluir" (e-mail terminado em "@exemplo.local") dono de um agente, e um segundo usuário "Colega de Equipe" para desativar.
- Uma chave do OpenRouter fictícia ("chave-ficticia-de-teste-0001") e o token do Telegram de mentira que o simulador mostra.
- Nenhum dado de cliente real; não digite e-mails, telefones ou nomes reais nas conversas.

## 5. Ambiente e estado inicial

**Onde testar:** numa instalação de homologação ou na máquina de desenvolvimento, preparada por quem desenvolve; o endereço do sistema e do chat embutido do agente de exemplo é passado por essa pessoa. As contas de demonstração (uma administradora e um usuário comum) estão descritas no manual de instalação, na seção "Contas de demonstração"; as senhas não ficam neste arquivo.

**O que precisa existir antes:** o sistema instalado e semeado com as contas de demonstração e o "Assistente de exemplo"; a semeadura de dados de privacidade descrita na seção "Privacidade e auditoria" do manual de instalação (cria as conversas de 120, 100, 10 e 3 dias, os dois usuários e o agente extra); o chat embutido do agente de exemplo publicado. Deixe a retenção em 90 dias ao começar o caso 11 e em 60 dias ao começar o caso 12 (o caso 12 só funciona se o sistema acabou de subir; peça para reiniciá-lo antes dele).

**O que precisa estar ligado:** o OpenRouter de mentira e o Telegram de mentira, com o endereço do segundo informado ao sistema; o simulador do Telegram dispõe de uma porta de controle para "ENVIAR" mensagens ao bot (nome, número do chat e texto) e para ler o que o bot respondeu; quem prepara o ambiente mostra como usá-lo. O sistema precisa ter um endereço público seguro (HTTPS) configurado para conectar o Telegram.

## 6. Critério de aprovação

**APROVADO quando:** os 24 casos passam; cada ação dos casos 4, 5, 7, 9, 10, 11, 12, 16, 17 e 19 aparece na Auditoria com a frase e o autor esperados; nenhum registro mostra chave, token, senha, texto de conversa nem o código do visitante; a limpeza do caso 12 apaga as duas conversas antigas e nenhuma recente; um usuário comum nunca vê as telas de Privacidade e Auditoria; e nenhuma das telas novas força rolagem lateral a 375 pontos de largura nos dois temas.

**REPROVADO quando:** qualquer caso falha; ou um registro de auditoria pode ser editado ou apagado pela tela; ou a exclusão de usuário apaga agentes ou conversas; ou o código completo de um visitante aparece em tela, nome de arquivo exportado ou registro; ou alguma tela vizinha da lista de colaterais mudou de comportamento.

## 7. O que NÃO faz parte desta entrega

- Backup, restauração de dados e tela de saúde do sistema: são de uma entrega seguinte (a ação "Restauração de dados" só existe como tipo de registro, ainda sem uso).
- Pedir aceite do visitante antes da primeira mensagem (consentimento) e transferência para atendente humano.
- Parecer jurídico sobre a base legal: o painel diz "a confirmar pela empresa" de propósito, e a decisão é da empresa.
- Retenção diferente por agente ou por canal: há um prazo só para toda a instalação.
- Editar ou apagar registros de auditoria, e auditoria de leitura (quem abriu qual conversa).
- Teste com o Telegram real, com aparelho celular real e com leitor de tela: a verificação foi em simulador e em janela de navegador reduzida.
- Idiomas além do português do Brasil.
