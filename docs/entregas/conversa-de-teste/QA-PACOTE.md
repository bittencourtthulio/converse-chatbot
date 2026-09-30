---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
casos: 10
atualizado_em: 2026-09-30
---

# Pacote de QA — Conversa de teste com o agente (FT-03)

## 1. O que mudou

Cada agente ganhou uma aba nova, "Testar", ao lado de "Configurações". Nela a pessoa conversa com o agente como num chat: escreve a pergunta, e a resposta vai aparecendo aos poucos, palavra por palavra. Dá para interromper a resposta, recomeçar a conversa e, ao recarregar a página, a última conversa continua onde estava. Quando o serviço de IA falha (chave errada, sem saldo, fora do ar), a própria conversa mostra um aviso claro em português. A tela de exclusão de agente agora avisa que as conversas dele também são apagadas.

## 2. Roteiro de teste manual

Os casos partem de uma instalação preparada como na seção 5 (com o serviço de IA de mentira, sem custo). As contas são as de demonstração.

**Caso 1 — Abrir a aba Testar**
1. Entre com `usuario@exemplo.local` e a senha `demo1234`. Abra "Agentes" e toque no "Assistente de exemplo".
2. Toque na aba "Testar".
- Deve acontecer: a aba "Testar" fica destacada; aparece uma bolha branca à esquerda com "Olá! Sou o assistente da Loja Exemplo. Como posso ajudar?", um texto de apoio pedindo para fazer uma pergunta, o botão "Nova conversa" (apagado, sem uso ainda) e, embaixo, o campo de mensagem com o botão "Enviar" também apagado.
- Falha: a aba não existe, a bolha inicial não aparece, ou o botão "Enviar" já está ativo com o campo vazio.

**Caso 2 — Aviso quando não há chave cadastrada**
1. Como administrador (`admin@exemplo.local`, `demo1234`), em "Configurações", "Integrações", confirme que a chave não está cadastrada (ou remova-a). Abra a aba "Testar" do agente.
2. Depois entre como `usuario@exemplo.local` e abra a mesma aba.
- Deve acontecer: aparece uma faixa amarela dizendo que o agente ainda não consegue responder. Para o administrador ela traz o link "Configurações > Integrações"; para o usuário comum pede que procure um administrador, sem link.
- Falha: a faixa não aparece, ou o usuário comum recebe o link de Integrações.

**Caso 3 — Conversar e ver a resposta chegando**
1. Como administrador, cadastre a chave de teste em "Integrações" (seção 5). Abra a aba "Testar" do agente.
2. Clique no campo, escreva "Quais são os horários de atendimento?" e aperte Enter.
- Deve acontecer: sua mensagem aparece numa bolha roxa à direita; logo abaixo surge uma bolha à esquerda com três pontinhos e, em seguida, o texto da resposta é preenchido aos poucos. Durante a resposta, o botão "Enviar" vira "Parar". Ao terminar, volta a ser "Enviar" e o cursor volta ao campo.
- Falha: a resposta só aparece de uma vez no fim, a página recarrega, ou o botão não volta a "Enviar".

**Caso 4 — Enter envia, Shift+Enter quebra a linha**
1. No campo, escreva "linha 1", aperte Shift+Enter e escreva "linha 2".
2. Confira que o campo passou a ter duas linhas e que nada foi enviado. Aperte Enter.
- Deve acontecer: com Shift+Enter a linha só quebra; com Enter a mensagem é enviada com as duas linhas, e a bolha mostra as duas linhas.
- Falha: Shift+Enter envia a mensagem, ou Enter quebra a linha.

**Caso 5 — Parar a resposta**
1. Envie uma pergunta e, com a resposta ainda chegando, toque em "Parar".
- Deve acontecer: a resposta para onde estava, a bolha ganha a nota "Resposta interrompida." e o botão volta a ser "Enviar". Nenhuma faixa vermelha aparece.
- Falha: a resposta continua chegando, aparece erro, ou o botão fica preso em "Parar".

**Caso 6 — Recarregar retoma a conversa; Nova conversa recomeça**
1. Depois de trocar duas ou três mensagens (a resposta interrompida do caso 5 não conta), recarregue a página.
2. Toque em "Nova conversa".
3. Envie uma mensagem nova e recarregue de novo.
- Deve acontecer: ao recarregar, aparecem a bolha inicial e todas as mensagens completas, na mesma ordem (a resposta que foi interrompida não volta). Depois de "Nova conversa" só a bolha inicial e o texto de apoio ficam na tela; ao recarregar depois da mensagem nova, aparece só a conversa nova.
- Falha: a conversa some ao recarregar, a resposta interrompida reaparece pela metade, ou "Nova conversa" mantém mensagens antigas.

**Caso 7 — A formatação da resposta**
1. Envie qualquer pergunta com o serviço de mentira do roteiro.
- Deve acontecer: a resposta mostra "uma resposta" em negrito, uma lista com dois itens, o link "a documentação" sublinhado, a palavra `codigo` numa caixinha e um bloco de código separado. Ao tocar no link, ele abre numa aba nova. Nada da resposta vira botão ou imagem, e textos parecidos com código de página (como `<b>`) aparecem escritos, sem efeito.
- Falha: aparecem asteriscos ou hifens crus, o link abre na mesma aba, ou algum texto executa algo.

**Caso 8 — Mensagem clara quando o serviço de IA falha**
1. Como administrador, em "Integrações", cadastre uma chave qualquer diferente da chave de teste (por exemplo `sk-or-v1-chave-errada-1234`). Volte à aba "Testar" e envie uma pergunta.
2. Repita como `usuario@exemplo.local`.
3. Restaure a chave de teste ao final.
- Deve acontecer: aparece uma faixa vermelha na conversa dizendo, em português, que o OpenRouter recusou a chave. Para o administrador há o link "Abrir Integrações"; para o usuário comum não há. A pergunta continua na tela, e nada de código técnico, inglês ou a chave aparece.
- Falha: mensagem em inglês, código de erro, chave visível, ou a tela trava.

**Caso 9 — Contador e limite de caracteres**
1. Cole no campo um texto com mais de 3500 caracteres (qualquer texto repetido serve).
2. Continue até 4000 caracteres.
- Deve acontecer: a partir de 3500 aparece embaixo, à esquerda do botão, "N de 4000 caracteres"; o campo não aceita passar de 4000.
- Falha: o contador aparece desde o começo, ou o campo aceita mais de 4000.

**Caso 10 — Conversa é de cada pessoa, e excluir avisa das conversas**
1. Como `usuario@exemplo.local`, tenha uma conversa com o agente. Saia e entre como `admin@exemplo.local`; abra a aba "Testar" do mesmo agente.
2. Abra a aba "Configurações" do agente e leia o texto do bloco "Excluir agente" (sem excluir).
3. Alterne o tema pelo ícone no alto (sol ou lua) e repita o caso 3 no tema escuro. Repita numa janela estreita (ou no celular).
- Deve acontecer: o administrador não vê as mensagens do usuário (começa vazio). O texto de exclusão diz que apaga "as conversas de teste". A conversa fica legível nos dois temas e, no celular, nada fica cortado na horizontal e os botões são fáceis de tocar.
- Falha: as conversas aparecem para a outra pessoa, o aviso de exclusão não cita as conversas, ou o texto fica ilegível em algum tema.

## 3. O que observar de colateral

- **Aba "Configurações" do agente:** conferir que continua abrindo e salvando como antes e que só o texto do bloco de exclusão mudou.
- **Lista de agentes e criação de agente:** o menu do agente ganhou uma aba; a lista e o formulário de novo agente não deveriam mudar.
- **Configurações, Integrações:** cadastrar, testar e remover a chave continuam iguais; agora a chave também decide se o chat responde.
- **Excluir um agente que já tem conversas:** as conversas dele deixam de existir (não há tela para vê-las ainda; conferir só que a exclusão funciona sem erro).
- A lista pode estar incompleta: não há raio de impacto calculado, e os colaterais vieram dos arquivos alterados.

## 4. Dado de teste sugerido

Valores fictícios. Mensagens de pergunta: "Quais são os horários de atendimento?", "Me passe uma lista de três itens", uma mensagem de 3600 caracteres (um parágrafo repetido) e uma de 4000. Chave do serviço de IA de mentira: a impressa pelo comando da seção 5. Chave "errada" para o caso 8: qualquer texto de 10 ou mais caracteres começando com `sk-or-`. Contas: as duas de demonstração. Nenhum dado real de cliente.

## 5. Ambiente e como chegar ao estado inicial

- **Onde testar:** instalação local. A chave real do OpenRouter não é necessária e não deve ser usada aqui; se a equipe quiser testar com a chave real, é ela quem a fornece, e há cobrança por resposta.
- **Preparação:** `npm install`; copiar o exemplo de configuração para o arquivo de configuração local e preencher `JWT_SECRET` e `ENCRYPTION_KEY` (o comando para gerar cada um está no exemplo); `npm run setup` (cria as contas e o agente de exemplo).
- **Serviço de IA de mentira:** num terminal, `npx tsx tests/apoio/servir-falso.ts`. Ele imprime uma linha `OPENROUTER_BASE_URL=...` e a chave de teste a cadastrar. Em outro terminal, `OPENROUTER_BASE_URL=<o endereço impresso> npm run dev` e abra `http://localhost:3000`. Com o serviço de mentira, a resposta é sempre a mesma (lista, negrito, link e código) e chega em cerca de dois segundos.
- **Estado inicial:** a chave de teste cadastrada em "Integrações" (administrador), exceto nos casos 2 e 8, que pedem outro estado.

## 6. Critério objetivo de aprovação e de reprovação

APROVADO quando: todos os 10 casos passam; a resposta aparece aos poucos e não de uma vez (caso 3); Parar interrompe sem erro (caso 5); recarregar retoma a conversa e Nova conversa a zera (caso 6); a falha do serviço de IA aparece como faixa vermelha em português, sem código, inglês nem chave (caso 8); e as telas vizinhas da seção 3 se comportam como antes.

REPROVADO quando: qualquer caso falha, a chave ou um detalhe técnico do provedor aparece na tela, uma pessoa vê a conversa de outra, ou alguma tela vizinha da seção 3 mudou de comportamento.

## 7. O que NÃO faz parte desta entrega

Respostas com base em arquivos e textos e a indicação das fontes (features seguintes); o chat embutido em sites e o Telegram (o visitante ainda não conversa); a lista de conversas, a leitura por outras pessoas e o apagamento de conversas pela tela (histórico, feature posterior); o registro do consumo de tokens; testar com a chave real. A conversa de teste também não guarda respostas interrompidas.
