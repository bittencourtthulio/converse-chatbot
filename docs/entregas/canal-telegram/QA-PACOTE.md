---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
casos: 20
atualizado_em: 2026-09-30
---

# Pacote de QA — Canal Telegram (FT-07)

## 1. O que mudou

Cada agente ganha uma aba nova, **Canais**. Ali a pessoa cola o código (token) de um bot que criou no aplicativo Telegram, clica em **Conectar** e, a partir daí, quem conversa com esse bot no Telegram conversa com o agente, com as respostas do próprio agente (e as fontes, quando ele cita). A aba mostra o estado do bot (conectado, pausado ou com erro), quando foi a última mensagem e o último erro, e permite verificar a conexão, pausar, retomar, trocar o código, definir quantas mensagens por dia o bot atende e desconectar. O bot só atende conversas privadas de texto, tem limites de uso e nunca mostra ao usuário do Telegram um detalhe técnico quando algo dá errado.

## 2. Roteiro de teste

Os casos partem de uma instalação preparada como na seção 5, com um **Telegram de mentira** (o aplicativo de teste que imita o Telegram, porque o Telegram de verdade só funciona com uma conta e um endereço público do dono do sistema) e o **OpenRouter de mentira** (a resposta dele é sempre a mesma frase de exemplo: o que se confere aqui é a tela e o comportamento, não a qualidade da resposta). Use a conta de administrador de demonstração e o agente "Assistente de exemplo", salvo onde o caso disser outra coisa. Chamamos de **ENVIAR** o comando de escrever ao bot e de **VER RESPOSTAS** o comando de ler o que o bot respondeu, ambos descritos na seção 5.

**Caso 1 — Estado inicial da aba Canais**
1. Entre, abra "Agentes", o "Assistente de exemplo" e a aba "Canais".
- Deve acontecer: aparece o cartão "Telegram" com o selo "Não conectado", três passos numerados (abrir o @BotFather, copiar o token, clicar em Conectar), um campo "Token do bot" em branco que esconde o que é digitado e o botão "Conectar" habilitado.
- Falha se: o campo vem preenchido, mostra o que se digita ou o botão está desabilitado com o sistema configurado corretamente.

**Caso 2 — Aviso quando o endereço público não serve ao Telegram**
1. Suba o sistema uma segunda vez, sem o endereço público configurado (seção 5, "variação sem endereço"), entre e abra a aba "Canais".
- Deve acontecer: um aviso destacado explica que o Telegram só entrega mensagens em endereço HTTPS público, que se deve definir o endereço do sistema e, em desenvolvimento, usar um túnel; o botão "Conectar" fica desabilitado.
- Falha se: não há aviso, o texto não explica o que fazer, ou o botão está habilitado.

**Caso 3 — Token com formato errado**
1. Volte ao sistema configurado. Na aba "Canais", digite `isto-nao-e-um-token` e clique em "Conectar".
- Deve acontecer: aparece uma mensagem vermelha em português dizendo que o token não parece válido e como ele é; nada fica conectado; a mensagem não repete o que foi digitado.
- Falha se: aparece erro técnico, a mensagem repete o texto digitado, ou o bot aparece como conectado.

**Caso 4 — Token que o Telegram não conhece**
1. Digite `555555555:AAHdesconhecido_0000000000000000000` e clique em "Conectar".
- Deve acontecer: mensagem vermelha dizendo que o Telegram recusou o token e que se deve conferir se foi copiado inteiro; nada fica conectado.
- Falha se: a conexão é aceita, ou a mensagem traz texto técnico em inglês.

**Caso 5 — Conectar o bot**
1. Digite o token de teste que o Telegram de mentira imprime ao iniciar e clique em "Conectar".
- Deve acontecer: o cartão passa a "Conectado" e mostra o nome do bot, o @usuário dele como link para o Telegram, "Nenhuma ainda" em "Última mensagem", a data de conexão, o endereço usado pelo Telegram para entregar mensagens, e os botões "Verificar", "Pausar" e "Desconectar", o limite diário (500) e "Trocar o token do bot".
- Falha se: aparece erro, ou o token digitado aparece em qualquer lugar da tela.

**Caso 6 — O token não vaza**
1. Com o bot conectado, recarregue a página, use a opção do navegador "Exibir código-fonte da página" e procure (Ctrl+F) por uma parte do token de teste.
- Deve acontecer: nenhuma ocorrência. Abra também "Trocar o token do bot": o campo está vazio.
- Falha se: o token (inteiro ou em parte) aparece na página ou no campo.

**Caso 7 — Verificar a conexão**
1. Clique em "Verificar".
- Deve acontecer: aparece uma faixa verde "O webhook está correto."
- Falha se: aparece erro, ou nada acontece depois de alguns segundos.

**Caso 8 — Conversar com o bot**
1. Use ENVIAR com o texto "Qual o prazo de troca?". Aguarde alguns segundos e use VER RESPOSTAS.
2. Recarregue a aba "Canais".
- Deve acontecer: o bot respondeu ao mesmo chat com a frase de exemplo do agente, em texto simples (asteriscos e símbolos aparecem como foram escritos, sem formatação); depois de recarregar, "Última mensagem" mostra a data e a hora de agora.
- Falha se: não há resposta, a resposta vem duplicada, ou "Última mensagem" continua "Nenhuma ainda".

**Caso 9 — Mensagem inicial**
1. Use ENVIAR com o texto "/start".
- Deve acontecer: o bot responde a mensagem inicial do agente ("Olá! Sou o assistente da Loja Exemplo. Como posso ajudar?").
- Falha se: responde outra coisa, ou não responde.

**Caso 10 — Começar uma conversa nova**
1. Use ENVIAR com o texto "/novo". Depois ENVIAR "oi de novo".
- Deve acontecer: o bot confirma "Certo, começamos uma nova conversa. Pode perguntar." e responde ao "oi de novo". O mesmo vale para "/reiniciar".
- Falha se: não confirma, ou a conversa antiga continua sendo usada (o histórico das conversas só passa a aparecer no sistema numa próxima entrega, então aqui se confere só a confirmação e a resposta).

**Caso 11 — Mensagem que não é texto**
1. Use ENVIAR com `semTexto` (uma foto, seção 5).
- Deve acontecer: o bot responde "Só consigo ler mensagens de texto por enquanto."
- Falha se: não responde, ou responde como se fosse texto.

**Caso 12 — Grupos são ignorados**
1. Use ENVIAR com `tipoDoChat` igual a `group` e o texto "oi grupo".
- Deve acontecer: o bot não responde nada.
- Falha se: responde.

**Caso 13 — Reenvio da mesma mensagem**
1. Use ENVIAR duas vezes seguidas com o mesmo `updateId` (por exemplo 777) e o texto "uma vez só". Aguarde e use VER RESPOSTAS.
- Deve acontecer: o bot responde uma única vez.
- Falha se: responde duas vezes.

**Caso 14 — Muitas mensagens em pouco tempo**
1. Use ENVIAR doze vezes seguidas, com o mesmo chat, textos "pergunta 1" a "pergunta 12". Aguarde cerca de 40 segundos e use VER RESPOSTAS.
- Deve acontecer: as dez primeiras recebem resposta; as duas últimas recebem "Você enviou muitas mensagens em pouco tempo. Aguarde um instante e tente de novo."; outro chat (use `chatId` 99) continua sendo atendido.
- Falha se: todas respondem, ou o limite atinge o outro chat, ou a frase traz número ou texto técnico.

**Caso 15 — Limite diário**
1. Na aba "Canais", altere o "Limite diário de mensagens" para 1 e clique em "Salvar limite" (aparece "Limite diário salvo."). Use ENVIAR com um chat novo (`chatId` 123) duas vezes, com textos diferentes.
2. Volte o limite para 500.
- Deve acontecer: a primeira mensagem do dia é respondida (ou, se já houver mensagens hoje, as duas recebem "Este assistente atingiu o limite de mensagens de hoje. Tente novamente amanhã."); com 500 o bot volta a responder. Valores como 0 ou 100001 mostram erro pedindo número inteiro de 1 a 100000.
- Falha se: o limite não é respeitado, ou valores inválidos são aceitos.

**Caso 16 — Pausar e retomar**
1. Clique em "Pausar". Use ENVIAR "oi" e depois VER RESPOSTAS. Clique em "Retomar" e ENVIAR "oi" de novo.
- Deve acontecer: com o bot pausado, o selo é "Pausado", o botão vira "Retomar" e o bot não responde; as mensagens enviadas na pausa não são respondidas depois; ao retomar, o bot volta a responder.
- Falha se: responde estando pausado, ou não volta ao retomar.

**Caso 17 — Trocar o token**
1. Abra "Trocar o token do bot", cole o segundo token de teste (o do "Outro Bot", seção 5) e clique em "Trocar token".
- Deve acontecer: o cartão passa a mostrar o outro bot; o "Verificar" continua com "O webhook está correto."
- Falha se: aparece erro, ou continua mostrando o bot antigo.

**Caso 18 — O mesmo bot em dois agentes**
1. Crie outro agente (qualquer nome). Na aba "Canais" dele, cole o token do bot que já está conectado no "Assistente de exemplo".
- Deve acontecer: mensagem vermelha dizendo que o bot já está conectado ao agente "Assistente de exemplo" e que é preciso desconectá-lo lá antes.
- Falha se: o bot é conectado nos dois agentes.

**Caso 19 — Desconectar com confirmação**
1. No "Assistente de exemplo", clique em "Desconectar". Clique em "Cancelar". Clique em "Desconectar" de novo e depois em "Confirmar desconexão".
- Deve acontecer: o primeiro clique só abre um aviso vermelho ("Desconectar o bot?") dizendo que o bot deixa de responder, que o token é apagado e que o histórico é mantido; "Cancelar" fecha o aviso sem mudar nada; "Confirmar desconexão" volta o cartão a "Não conectado" com o campo de token em branco. Depois disso, ENVIAR não faz o bot responder.
- Falha se: desconecta sem confirmar, ou o bot continua respondendo depois de desconectar.

**Caso 20 — Aparência no celular e nos temas**
1. Abra a aba "Canais" com o bot conectado no celular (ou com a janela do navegador estreita, cerca de 375 pixels de largura) e alterne entre o tema escuro e o claro no ícone do topo.
- Deve acontecer: nada transborda para o lado; os dados do bot ficam em uma coluna; os botões ficam empilhados e fáceis de tocar; o texto é legível nos dois temas; o selo muda de cor conforme o estado.
- Falha se: aparece barra de rolagem horizontal, botões cortados ou texto ilegível em algum tema.

## 3. O que observar de colateral

- **Aba "Publicar" do mesmo agente:** confira que o chat embutido segue como antes (ligar, prévia, código para incorporar). O limite diário do Telegram é separado do limite diário do chat embutido: mensagens de um não contam para o outro.
- **Aba "Testar":** confira que a conversa de teste do painel continua funcionando e que as conversas do Telegram não aparecem nela.
- **Aba "Conhecimento":** confira que as fontes do agente continuam listadas e que o bot responde usando a base quando há fonte pronta.
- **Excluir um agente com bot conectado:** o agente some e o bot deixa de ser atendido (o bot pode ser conectado de novo em outro agente).
- **Configurações, Integrações:** sem a chave do OpenRouter, o bot responde ao usuário a frase "Não consegui responder agora. Tente novamente em instantes." e o cartão mostra o motivo em "Último erro".
- A lista de colaterais pode estar incompleta: não há mapa de impacto calculado para este trabalho.

## 4. Dado de teste sugerido

- Um agente com mensagem inicial preenchida (o "Assistente de exemplo" já vem assim) e, para o caso 8, uma fonte de conhecimento pronta (a política de troca de exemplo já vem pronta).
- Dois tokens de teste fictícios impressos pelo Telegram de mentira: um de um bot válido e outro de um segundo bot; mais um token bem formado que o Telegram de mentira não conhece (caso 4).
- Chats fictícios com números diferentes (42, 99, 123) e nomes inventados. Nenhum dado de pessoa real.

## 5. Ambiente e estado inicial

**Onde testar:** num computador de desenvolvimento, com o sistema rodando localmente. Use a conta de administrador de demonstração (as credenciais de demonstração estão no README do projeto; nenhuma credencial real é necessária ou deve ser usada).

**O que precisa existir antes:** o sistema preparado com `npm run setup` e `npm run build`; a chave do OpenRouter de teste cadastrada em Configurações, Integrações (o OpenRouter de mentira imprime a chave de teste ao iniciar).

**O que precisa estar ligado (três terminais):**
1. OpenRouter de mentira: `npx tsx tests/apoio/servir-falso.ts` (anote o endereço que ele imprime).
2. Telegram de mentira: `npx tsx tests/apoio/servir-telegram-falso.ts` (anote o endereço e o token de teste que ele imprime; ele escuta os comandos em `localhost:4400`).
3. O sistema: `npm run start` com as variáveis `OPENROUTER_BASE_URL` (endereço do passo 1), `TELEGRAM_API_BASE` (endereço do passo 2), `APP_URL` igual a um endereço HTTPS qualquer, como `https://converse-teste.exemplo.invalid`, e `TRUST_PROXY=1`. O Telegram de mentira aceita esse endereço porque nunca o chama de volta.
- **Variação sem endereço (caso 2):** o mesmo comando, sem `APP_URL`, em outra porta (`-p 3001`).
- **ENVIAR:** `curl -s -X POST localhost:4400/enviar -d '{"texto":"oi"}'`. Campos opcionais no mesmo JSON: `chatId`, `nome`, `updateId`, `tipoDoChat` (`private`, `group`), `semTexto` (`true` simula uma foto).
- **VER RESPOSTAS:** `curl -s localhost:4400/estado`; o campo das mensagens enviadas mostra, em ordem, o que o bot respondeu a cada chat.
- O segundo token de teste (do "Outro Bot") é `987654321:AAHoutro_token-000000000000000000000`; é fictício e só existe no Telegram de mentira.

## 6. Critério de aprovação

**APROVADO quando:** todos os 20 casos passam, o bot responde ao chat certo uma única vez por mensagem, nenhum token aparece em tela nem no código-fonte da página, e nenhuma tela vizinha da seção 3 mudou de comportamento.

**REPROVADO quando:** qualquer caso falha, o bot responde duplicado, responde estando pausado ou desconectado, algum limite não é respeitado, ou algum texto técnico (nome de erro, código, inglês) chega ao usuário do Telegram ou à tela.

## 7. O que NÃO faz parte desta entrega

- **Telegram de verdade:** só funciona com um token do BotFather e um endereço HTTPS público do dono do sistema; aqui tudo é conferido contra o Telegram de mentira.
- Ler, filtrar ou apagar as conversas do Telegram no sistema (próxima entrega, histórico de conversas) e a retenção e o registro de quem alterou o canal (entrega de privacidade e auditoria).
- Grupos e canais do Telegram, fotos, voz e documentos, vários bots por agente, atendimento por humano.
- Backup, deploy e endereço público definitivo (entrega de operação).
- Mensagens enviadas ao bot durante a pausa ou com o sistema fora do ar não são atendidas depois.
- Não foi possível conferir a aparência a 375 pixels no navegador da automação: o caso 20 é o único ponto visual que depende de olhos humanos.
