---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
casos: 10
atualizado_em: 2026-09-30
---

# Pacote de QA — Agentes e chave do OpenRouter (FT-02)

## 1. O que mudou

O menu ganhou "Agentes", logo abaixo de "Painel". Qualquer pessoa que entra vê a lista de agentes, cria um novo, edita e exclui, escolhendo o nome, as instruções, o modelo, a temperatura e a mensagem inicial. Quem é administrador também ganhou, em Configurações, a tela "Integrações", onde cadastra a chave do OpenRouter (a chave fica guardada criptografada, a tela mostra só um pedaço dela e nunca a exibe de novo). Ainda não há conversa com o agente: ela chega na próxima feature.

## 2. Roteiro de teste manual

Os casos partem de uma instalação recém-preparada (ver seção 5). As contas são as de demonstração.

**Caso 1 — Ver a lista de agentes**
1. Entre com `usuario@exemplo.local` e a senha `demo1234`.
2. No menu lateral, toque em "Agentes".
- Deve acontecer: aparece um cartão "Assistente de exemplo" com o modelo `openai/gpt-4o-mini` e a data de criação, e o botão "Novo agente" no alto.
- Falha: lista vazia, erro, ou o item "Agentes" não existe no menu.

**Caso 2 — Criar um agente (sem chave cadastrada)**
1. Em "Agentes", toque em "Novo agente".
2. Deve aparecer um aviso amarelo dizendo que não há chave do OpenRouter e que o modelo deve ser digitado; como usuário comum, o aviso pede para procurar um administrador (sem link).
3. Preencha o nome "Suporte QA", as instruções "Responda sempre em português, com cordialidade.", deixe o modelo `openai/gpt-4o-mini` e a temperatura 0,7, escreva a mensagem inicial "Olá! Como posso ajudar?" e toque em "Criar agente".
- Deve acontecer: abre a página do "Suporte QA" com o nome no alto, a aba "Configurações" e os campos preenchidos.
- Falha: erro, ou os campos voltam vazios.

**Caso 3 — Editar o agente e ver o contador**
1. Na página do "Suporte QA", digite mais texto nas instruções e observe o contador "N de 8000 caracteres" mudar.
2. Troque a temperatura para 1,2 e toque em "Salvar alterações".
- Deve acontecer: faixa verde "Alterações salvas." Ao voltar à lista e reabrir o agente, os valores novos estão lá.
- Falha: os valores antigos voltam.

**Caso 4 — Validação dos campos**
1. Na página do agente, apague o nome e toque em "Salvar alterações": o navegador pede o preenchimento.
2. Preencha o nome de volta, coloque a temperatura 3 e salve.
- Deve acontecer: aviso claro de que a temperatura precisa estar entre 0 e 2, e nada é gravado.
- Falha: o valor 3 é aceito.

**Caso 5 — Excluir com confirmação**
1. Na página do "Suporte QA", role até "Excluir agente" e toque no botão.
2. Deve aparecer um bloco vermelho com o nome do agente e os botões "Confirmar exclusão" e "Cancelar". Toque em "Cancelar": o bloco some e o agente continua existindo.
3. Toque em "Excluir agente" de novo e em "Confirmar exclusão".
- Deve acontecer: volta para a lista de agentes e o "Suporte QA" não aparece mais.
- Falha: o navegador abre uma janela de confirmação própria dele, ou o agente continua na lista.

**Caso 6 — Usuário comum não acessa Integrações**
1. Ainda como `usuario@exemplo.local`, confira o menu: não deve existir "Integrações" nem "Usuários".
2. Digite no endereço `/configuracoes/integracoes`.
- Deve acontecer: você é levado de volta ao painel.
- Falha: a tela de Integrações abre.

**Caso 7 — Administrador cadastra a chave**
1. Saia e entre com `admin@exemplo.local` e `demo1234`. Abra "Configurações", "Integrações".
2. Deve aparecer "OpenRouter" com a etiqueta "Não configurada" e um campo de senha vazio.
3. Cole uma chave (real, ou qualquer texto de 10 ou mais caracteres para testar o cadastro, como `sk-or-v1-chave-de-teste-1234`) e toque em "Salvar chave".
- Deve acontecer: a etiqueta muda para "Configurada", aparece "Chave cadastrada: sk-or-…1234" (só o começo e o fim) e o campo continua vazio. A chave completa não aparece em lugar nenhum da tela, nem ao recarregar.
- Falha: a chave inteira aparece na tela, no campo ou depois de recarregar.

**Caso 8 — Testar a conexão**
1. Ainda em Integrações, toque em "Testar conexão".
- Deve acontecer: com uma chave real e válida, faixa verde "Conexão funcionando"; com a chave de mentira do caso anterior, faixa vermelha em português dizendo que o OpenRouter recusou a chave, sem mostrar código técnico nem a chave.
- Falha: mensagem em inglês, código HTTP, ou a chave aparecendo no aviso.

**Caso 9 — Com a chave cadastrada, o modelo tem sugestões**
1. Abra "Agentes", "Novo agente" e clique no campo "Modelo".
- Deve acontecer: o navegador oferece uma lista de modelos do OpenRouter para escolher (com uma chave de mentira a lista pode vir reduzida, com um aviso), e ainda dá para digitar qualquer identificador. Como administrador, sem chave o aviso teria o link "Cadastrar a chave em Integrações".
- Falha: o campo só aceita valores da lista, ou fica sem nenhuma sugestão e sem aviso.

**Caso 10 — Remover a chave, tema escuro e celular**
1. Em Integrações, toque em "Remover chave": a etiqueta volta a "Não configurada".
2. Alterne o tema pelo ícone no alto (sol ou lua) e percorra "Agentes" e "Integrações". Repita com a janela estreita (ou no celular): o menu vira gaveta e nada fica cortado na horizontal.
- Deve acontecer: as duas telas ficam legíveis nos dois temas e no celular.
- Falha: texto ilegível, botão sem borda, ou rolagem para o lado.

## 3. O que já é coberto por teste automático

A suíte tem 398 testes: criptografia da chave, parser do stream, adaptador do OpenRouter (contra um servidor simulado, nunca a rede real), serviço e telas de agentes, e a prova de que a resposta da tela de Integrações nunca contém a chave nem o texto cifrado. O roteiro acima cobre o que só uma pessoa vê: clareza dos avisos, aparência e o fluxo de ponta a ponta.

## 4. Fora do escopo desta entrega

Conversar com o agente (feature seguinte), base de conhecimento, canais e histórico. Teste com chave real do OpenRouter depende de saldo e de uma chave que só a empresa tem.

## 5. Preparação

1. `npm install` e o exemplo de configuração copiado para o arquivo de configuração local, com `JWT_SECRET` e `ENCRYPTION_KEY` preenchidos (o comando para gerar cada um está no exemplo). Sem `ENCRYPTION_KEY`, o cadastro da chave (caso 7) mostra um erro claro e o resto do sistema funciona.
2. `npm run setup` (cria as contas de demonstração e o agente de exemplo) e `npm run dev`.
3. Abra `http://localhost:3000`.
