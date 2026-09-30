---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
casos: 10
atualizado_em: 2026-09-30
---

# Pacote de QA — Fundação e esqueleto (FT-01)

## 1. O que mudou

O sistema ganhou a aparência de um aplicativo web moderno: menu lateral, faixa superior com o nome da tela, tema claro e escuro e, no celular, um menu que abre por cima da tela. A tela de entrada virou um cartão no centro com o nome do produto. Depois de cinco tentativas de entrada em um minuto com o mesmo e-mail, o sistema pede para esperar. O que já existia continua igual: entrar, ver o painel, cadastrar usuários (só administrador), editar o próprio perfil e trocar a senha.

## 2. Roteiro de teste manual

Os casos partem de uma instalação recém-preparada (ver seção 5).

**Caso 1 — Entrar e chegar ao painel**
1. Abra o endereço do sistema. Deve aparecer o cartão "Entrar" com o nome do produto no topo.
2. Preencha o e-mail `admin@exemplo.local` e a senha `demo1234` e toque em "Entrar".
- Deve acontecer: o painel abre, com o menu lateral (Painel, Usuários, Meu perfil), o título "Painel" e o aviso "Ainda não há o que mostrar" com o botão "Cadastrar usuário".
- Falha: mensagem de erro, tela em branco ou volta ao cartão de entrada.

**Caso 2 — Entrada com senha errada**
1. Na tela de entrada, use `admin@exemplo.local` e uma senha qualquer errada.
- Deve acontecer: aparece uma faixa vermelha "E-mail ou senha incorretos." e o e-mail continua preenchido.
- Falha: nenhuma mensagem, ou o e-mail some do campo.

**Caso 3 — Excesso de tentativas**
1. Na tela de entrada, tente entrar seis vezes seguidas, em menos de um minuto, com o mesmo e-mail e senha errada.
- Deve acontecer: da sexta tentativa em diante a faixa vermelha diz "Muitas tentativas de entrada. Tente de novo em N segundos." Depois de esperar esse tempo, a entrada com a senha certa funciona.
- Falha: o sistema continua respondendo "E-mail ou senha incorretos." sem pedir espera.

**Caso 4 — Cadastrar um usuário (administrador)**
1. Entrada como administrador. No menu, toque em "Usuários".
2. Confira a tabela com as duas contas de demonstração, com etiquetas "Administrador", "Usuário" e "Ativo".
3. No formulário "Novo usuário", preencha nome "Maria QA", e-mail `maria.qa@exemplo.local`, senha provisória `senha-de-teste-1`, papel "Usuário", e toque em "Criar usuário".
- Deve acontecer: mensagem verde "Usuário criado." e Maria aparece na tabela.
- Falha: erro, ou Maria não aparece.

**Caso 5 — O novo usuário entra e troca a própria senha**
1. Toque no seu nome no canto superior direito e em "Sair". Deve voltar à tela de entrada.
2. Entre com `maria.qa@exemplo.local` e `senha-de-teste-1`. No menu lateral não deve existir "Usuários".
3. Abra "Meu perfil" e toque em "Trocar minha senha". Informe a senha atual, uma nova de 8 ou mais caracteres, confirme e toque em "Trocar senha".
- Deve acontecer: mensagem verde "Senha alterada." Ao sair e entrar de novo, só a senha nova funciona.
- Falha: a senha antiga continua valendo.

**Caso 6 — Usuário comum não acessa a área de administração**
1. Com Maria (ou `usuario@exemplo.local`, senha `demo1234`), digite no navegador o endereço do sistema seguido de `/configuracoes/usuarios`.
- Deve acontecer: o sistema leva de volta ao painel, sem mostrar a lista de usuários.
- Falha: a lista de usuários aparece.

**Caso 7 — Editar o perfil**
1. Em "Meu perfil", troque o nome, toque em "Salvar alterações".
- Deve acontecer: mensagem verde "Perfil atualizado." e o novo nome aparece no canto superior direito e nas iniciais.
- Falha: o nome antigo continua.

**Caso 8 — Tema claro e escuro**
1. Toque no ícone de sol ou lua ao lado do seu nome.
2. Recarregue a página.
- Deve acontecer: as cores trocam na hora e a escolha continua depois de recarregar, sem piscar na cor errada. Em uma aba nova, sem escolha salva, o tema segue o do computador.
- Falha: volta ao tema anterior ao recarregar, ou a tela pisca.

**Caso 9 — Celular**
1. Abra o sistema num celular (ou reduza a janela do navegador até ficar estreita, menos de 768 pixels).
2. Toque no ícone de três linhas no canto superior esquerdo.
- Deve acontecer: o menu lateral desliza por cima da tela com o fundo escurecido; tocar em um item, no fundo ou em "Fechar menu" fecha o menu. Todos os botões e campos são fáceis de tocar e não há rolagem para os lados.
- Falha: o menu não abre, não fecha, ou algum botão é pequeno demais para tocar.

**Caso 10 — Teclado**
1. Na tela de entrada, use a tecla Tab para percorrer os campos e o botão.
- Deve acontecer: cada elemento recebe um contorno visível, nos dois temas.
- Falha: não se percebe onde está o foco.

## 3. O que observar de colateral

Todas as telas mudaram de visual: confira "Painel", "Usuários", "Meu perfil" e "Trocar senha" nos dois temas. Observe a faixa superior, que mostra a tela atual ("Configurações / Usuários" no computador, só "Usuários" no celular). Verifique que "Sair" leva sempre à tela de entrada.

## 4. Dado de teste sugerido

Somente contas fictícias: as duas de demonstração (`admin@exemplo.local` e `usuario@exemplo.local`, senha `demo1234`) e as que o próprio teste cadastrar com e-mails `@exemplo.local`. Nenhum dado real de cliente.

## 5. Ambiente e como chegar ao estado inicial

- **Onde testar:** instalação local. Quem prepara o ambiente roda `npm install`, copia o exemplo de configuração para o arquivo de configuração e preenche o segredo de sessão (instruções no `README.md`), depois `npm run setup` e `npm run dev`, e abre `http://localhost:3000`. Segredos vêm de quem prepara o ambiente; não estão neste arquivo.
- **Estado inicial:** `npm run setup` cria as duas contas de demonstração. Para repetir o caso 3, reinicie o servidor (o contador de tentativas fica na memória) ou espere um minuto.
- **O que precisa estar ligado:** nada além do servidor. Não há integração externa nesta entrega.

## 6. Aprovação e reprovação

**APROVADO quando:** os dez casos passam, os dois temas estão legíveis e o menu do celular abre e fecha.

**REPROVADO quando:** qualquer caso falha, um usuário comum vê a lista de usuários, a senha antiga de um usuário continua valendo depois da troca, ou alguma tela vizinha da seção 3 ficou quebrada.

## 7. O que NÃO faz parte desta entrega

Agentes, chave do OpenRouter, base de conhecimento, chat embutido, Telegram, histórico de conversas, privacidade, auditoria, contêiner e backup (features FT-02 a FT-11). O painel está vazio de propósito: as próximas features o preenchem.
