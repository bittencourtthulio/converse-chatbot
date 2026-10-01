---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
casos: 10
atualizado_em: 2026-10-01
---

# Pacote de QA — Sessão e acesso endurecidos (FT-12)

## 1. O que mudou

Quem clica em **Sair** agora encerra a sessão de verdade: se alguém tiver copiado o "crachá" de acesso do navegador antes, ele deixa de funcionar na hora. Quem está usando o sistema deixa de ser mandado de volta ao login a cada 15 minutos: enquanto a pessoa navega, o acesso é renovado sozinho (até um limite de 12 horas seguidas); quem deixa a tela parada continua sendo desconectado.

Trocar a senha continua desconectando os outros aparelhos da pessoa, mas entrar de novo logo em seguida, com a senha nova, agora sempre funciona. O excesso de tentativas de entrada continua sendo barrado, e a leitura da conversa no chat embutido do site passou a ter o mesmo limite de uso das mensagens. Nenhuma tela nova foi criada: o que muda é o comportamento ao entrar, usar e sair.

**Depois de atualizar para esta versão, cada pessoa entra uma vez de novo** (as sessões antigas deixam de valer). Isso é esperado.

## 2. Roteiro de teste

Os casos partem de uma instalação preparada como na seção 5. Use as contas de demonstração: a administradora e o usuário comum. Nada aqui usa serviço real. Os casos 4 e 5 dependem de a instalação ter sido ligada com o tempo de vida do acesso reduzido (seção 5); os demais funcionam com a instalação normal. Use dois navegadores (ou uma janela anônima) quando o caso pedir "segundo navegador".

### Caso 1 — Entrar e chegar ao painel

**O que fazer:**
1. Abra a página inicial do sistema. Sem estar logada, você deve ver a tela "Entrar".
2. Entre como administradora.

**O que deve acontecer:**
Você chega ao **Painel**, com o nome do produto no topo e o menu lateral com o seu nome.

**O que indicaria falha:**
Qualquer mensagem de erro, ou voltar à tela "Entrar" depois de digitar a senha certa.

### Caso 2 — Sair e tentar reaproveitar o acesso copiado

**O que fazer:**
1. Entre como administradora no navegador principal.
2. Abra as ferramentas do navegador (tecla F12), vá na aba **Application** (ou **Armazenamento**), em **Cookies**, e escolha o endereço do sistema. Copie o **valor completo** do item chamado `expx_sessao` para um bloco de notas.
3. No menu do usuário (canto da tela), clique em **Sair**. Você volta à tela "Entrar" e o item `expx_sessao` some da lista.
4. Ainda nas ferramentas, crie de novo o item `expx_sessao` com o valor que você copiou (clique duplo numa linha vazia da lista; mantenha o caminho `/`). Atualize a página.
5. Digite no endereço do navegador `/perfil` (depois do endereço do sistema) e aperte Enter.

**O que deve acontecer:**
Você é levada à tela "Entrar". O acesso copiado antes do Sair não abre nenhuma tela. Entrando de novo com a senha, tudo volta ao normal.

**O que indicaria falha:**
A tela "Meu perfil" abrir com o valor antigo, depois de ter clicado em Sair.

### Caso 3 — Sair num aparelho não derruba o outro

**O que fazer:**
1. No navegador principal, entre como **usuário comum**.
2. No segundo navegador (ou janela anônima), entre com a mesma conta de usuário comum.
3. No navegador principal, clique em **Sair**.
4. No segundo navegador, clique em **Agentes** no menu e depois em **Conversas**.

**O que deve acontecer:**
O segundo navegador continua logado e abre as duas telas normalmente. O navegador principal está na tela "Entrar".

**O que indicaria falha:**
O segundo navegador ser mandado para "Entrar" por causa do Sair do primeiro.

### Caso 4 — Quem usa continua logado além do tempo de vida do acesso

Este caso exige a instalação ligada com o tempo de vida do acesso reduzido a 30 segundos (seção 5). Use um relógio ou cronômetro.

**O que fazer:**
1. Entre como administradora e inicie o cronômetro.
2. Mexa na tela de vez em quando, sem deixar mais de 10 segundos entre um clique e outro: alterne entre **Painel**, **Agentes** e **Conversas**, por 70 segundos no total.
3. Aos 70 segundos, clique em mais uma tela.

**O que deve acontecer:**
Você continua logada o tempo todo, mesmo passando bem dos 30 segundos de vida original do acesso. Nenhuma volta à tela "Entrar".

**O que indicaria falha:**
Ser mandada para "Entrar" enquanto está clicando de 10 em 10 segundos.

### Caso 5 — Quem deixa a tela parada é desconectado

Mesma instalação do caso 4 (acesso de 30 segundos).

**O que fazer:**
1. Entre como administradora e inicie o cronômetro.
2. Não mexa em nada por 45 segundos (pode olhar outra janela).
3. Clique em **Agentes**.

**O que deve acontecer:**
Você é levada à tela "Entrar". Entrando de novo, o sistema funciona.

**O que indicaria falha:**
A tela de Agentes abrir normalmente depois de 45 segundos sem uso.

### Caso 6 — Trocar a senha e entrar logo em seguida

**O que fazer:**
1. No segundo navegador, entre como **usuário comum** e deixe a tela aberta.
2. No navegador principal, entre com a mesma conta, abra **Meu perfil** e vá em **Trocar senha**. Troque `demo1234` por `nova-senha-456` (digite a atual, a nova e a confirmação) e confirme. Aparece a mensagem de que a senha foi alterada.
3. **Sem esperar**, abra uma terceira janela anônima e entre com o e-mail do usuário e a senha **nova**.
4. No segundo navegador (aberto no passo 1), clique em **Agentes**.
5. No navegador principal (quem trocou a senha), clique em **Agentes**.

**O que deve acontecer:**
O passo 3 funciona de primeira, sem mensagem de erro, mesmo feito segundos depois da troca. O segundo navegador (passo 4) é levado à tela "Entrar" (a troca de senha encerra as outras sessões). O navegador principal (passo 5) continua logado, sem ser desconectado pela própria troca.

**O que indicaria falha:**
A entrada com a senha nova, logo depois da troca, ser recusada ou voltar para "Entrar"; o navegador principal ser desconectado; ou o segundo navegador continuar logado depois da troca.

**Ao terminar:** troque a senha de volta para `demo1234` (ou peça para refazer a instalação de demonstração), para os outros casos.

### Caso 7 — Excesso de tentativas de entrada

**O que fazer:**
1. Saia do sistema, para ficar na tela "Entrar".
2. Digite o e-mail da administradora e uma senha errada. Repita com senhas erradas diferentes, seis vezes seguidas, rápido.
3. Na sexta tentativa, observe a mensagem. Em seguida digite a senha **certa** (`demo1234`) e tente de novo.
4. Espere pelo tempo que a mensagem indicou (no máximo 1 minuto) e tente de novo com a senha certa.

**O que deve acontecer:**
Nas cinco primeiras, a mensagem "E-mail ou senha incorretos". Na sexta, o aviso "Muitas tentativas de entrada. Tente de novo em N segundos." Com a senha certa **durante** o bloqueio, a mesma mensagem de espera (não entra). Depois de esperar, a senha certa entra normalmente.

**O que indicaria falha:**
A sexta tentativa ainda dizer só "incorretos"; a senha certa entrar durante o bloqueio; ou continuar bloqueada depois de passado o tempo.

### Caso 8 — Quem pode ver cada tela

**O que fazer:**
1. Sem estar logada, digite no endereço do navegador `/configuracoes/auditoria` e depois `/conversas`.
2. Entre como **usuário comum**. Digite no endereço, uma de cada vez: `/configuracoes/usuarios`, `/configuracoes/auditoria`, `/configuracoes/integracoes`, `/configuracoes/privacidade`, `/configuracoes/sistema`.
3. Em **Conversas**, abra uma conversa qualquer (a de demonstração do chat embutido).
4. Entre como **administradora** e abra as mesmas cinco telas de Configurações, e depois **Auditoria**.

**O que deve acontecer:**
Sem login, as duas telas levam a "Entrar". Como usuário comum, as cinco telas de administração levam de volta ao Painel (não mostram nada). A conversa abre normalmente para o usuário comum. A administradora vê as cinco telas, e a Auditoria mostra a lista de registros.

**O que indicaria falha:**
O usuário comum ver o conteúdo de uma tela de administração; a administradora receber erro na Auditoria; ou a conversa não abrir.

### Caso 9 — Leitura limitada da conversa no chat embutido (só com ajuda de quem tem terminal)

Este caso é feito por quem sabe usar um terminal, com o servidor no ar. A leitura da conversa acontece quando o chat embutido de um site é aberto; para simular muitos visitantes abrindo o chat em um minuto, é preciso repetir a chamada rápido. Peça o comando pronto a quem montou o ambiente.

**O que fazer:**
1. Na tela do agente de demonstração, aba **Publicar**, confira que o chat está ativo e anote o código do agente que aparece no endereço da página.
2. Quem tem o terminal repete, onze vezes em menos de um minuto, a leitura da conversa daquele agente, sempre com o mesmo identificador de visitante.
3. Abra o chat embutido (aba Publicar, prévia) e mande uma mensagem normalmente, no minuto seguinte, para ver que o chat continua respondendo.

**O que deve acontecer:**
As dez primeiras leituras respondem normalmente. A décima primeira recebe a resposta de "muitas mensagens em pouco tempo, aguarde" (limite de uso), sem trazer nenhum dado do agente nem da conversa. Depois de cerca de um minuto, a leitura volta a funcionar.

**O que indicaria falha:**
A décima primeira leitura responder com a conversa, ou a resposta de bloqueio mostrar o nome do agente, as instruções ou qualquer conteúdo da conversa.

### Caso 10 — Sessão que dura demais: o limite de 12 horas (não há passo manual)

O sistema nunca deixa uma sessão passar de 12 horas seguidas, mesmo com uso contínuo: depois disso é preciso entrar de novo. Isso não pode ser conferido à mão numa tarde de teste. Está provado por teste automatizado, que simula o passar do tempo, e esse resultado consta do relatório da entrega.

**O que fazer:**
1. Leia, no relatório da entrega, a linha sobre o limite de 12 horas e confirme que o teste automatizado correspondente passou na última execução da suíte.

**O que deve acontecer:**
O relatório afirma suíte inteira verde e cita o teste de renovação com limite absoluto.

**O que indicaria falha:**
Suíte com falha, ou ausência da prova do limite.

## 3. O que observar de colateral

- **Tela "Entrar" e Painel:** conferir nos temas claro e escuro e com a janela estreita (como celular, 375 pixels): sem barra de rolagem lateral e com a mensagem de bloqueio legível.
- **Meu perfil e Trocar senha:** além da troca do caso 6, conferir que trocar o nome e o e-mail continua funcionando e **não** derruba a sessão.
- **Chat embutido:** conversar com o agente de demonstração pelo chat da aba Publicar e pela prévia; deve responder como antes.
- **Conversas:** a lista, os filtros e o detalhe de uma conversa abrem para usuário comum e para administradora.
- **Auditoria:** a lista abre para a administradora, com os filtros por ação e por período funcionando.
- **Envio de arquivos (aba Conhecimento):** enviar um arquivo pequeno continua funcionando. Observação: só enviar arquivos, sem navegar em nenhuma outra tela, não renova a sessão; depois do tempo de vida do acesso, o próximo clique pede para entrar de novo.
- **Cadastro de usuário (Configurações, Usuários):** a administradora ainda cadastra um usuário novo e esse usuário consegue entrar.

## 4. Dado de teste sugerido

Tudo fictício, da instalação de demonstração:

- Duas contas de demonstração: a administradora e o usuário comum, ambas com a senha de demonstração.
- Um agente de exemplo com o chat embutido ativo (já vem na instalação de demonstração).
- Um segundo navegador ou janela anônima, para os casos que pedem duas sessões ao mesmo tempo.
- Senhas erradas inventadas à vontade para o caso 7; senha nova de teste `nova-senha-456` para o caso 6.
- Um relógio ou cronômetro, para os casos 4, 5 e 7.

## 5. Ambiente e estado inicial

**Onde testar:** numa instalação de desenvolvimento ou de homologação, nunca em produção. As contas de demonstração e a senha de teste estão no README do projeto, na seção "Contas de demonstração".

**O que precisa existir antes:** instalação preparada com o comando de preparação do README (`npm run setup`), que cria as contas de demonstração, o agente de exemplo e o chat embutido ativo. O servidor precisa estar rodando a versão desta entrega (construída de novo depois de atualizar o código).

**Para os casos 4 e 5:** quem sobe o servidor precisa ligá-lo com o tempo de vida do acesso reduzido (variável `JWT_TTL_SEGUNDOS` com o valor `30`) e reiniciar. Sem isso, o acesso dura 15 minutos e esses dois casos levariam bem mais tempo. Para os demais casos, a instalação normal serve.

**O que precisa estar ligado:** nada além do servidor. O OpenRouter e o Telegram não são necessários.

**Para repetir o caso 7 sem esperar:** reinicie o servidor (o contador de tentativas fica na memória dele).

## 6. Critério de aprovação

**APROVADO quando:** os casos 1 a 9 acontecem exatamente como descrito em "O que deve acontecer" e o caso 10 confirma a suíte automatizada verde, e nenhum item da seção 3 mostra erro ou tela quebrada.

**REPROVADO quando:** em qualquer caso, acontece qualquer coisa descrita em "O que indicaria falha"; ou o usuário comum vê o conteúdo de uma tela de administração; ou aparece mensagem com detalhe técnico (código de erro, pilha) em vez da mensagem em português.

## 7. O que NÃO faz parte desta entrega

- Não há aviso de "sua sessão expirou": quem perde a sessão é levado à tela "Entrar" sem texto (comportamento anterior, mantido).
- Não há como o administrador encerrar à força as sessões de outra pessoa, nem lista de aparelhos conectados.
- Um acesso roubado e usado **sem** que a pessoa clique em Sair continua valendo até vencer ou até as 12 horas: a defesa é o Sair e a troca de senha. Segundo fator de autenticação não faz parte (decisão pendente registrada).
- O limite de tentativas de entrada e o do chat valem por servidor ligado (um servidor só) e dependem de o sistema estar atrás de um proxy bem configurado para distinguir visitantes; não há teste de vários servidores.
- Telefone real, leitor de tela e outros navegadores além do Chrome não foram verificados.
- Robustez de vídeo, de envio de arquivos grandes e da restauração de backup: é da próxima entrega.
