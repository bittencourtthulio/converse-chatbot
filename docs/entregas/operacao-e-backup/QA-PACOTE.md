---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
casos: 14
atualizado_em: 2026-10-01
---

# Pacote de QA — Operação e backup (FT-11)

## 1. O que mudou

O sistema passa a poder ser instalado numa máquina limpa como um contêiner, e quem cuida dele ganha uma tela nova em **Configurações**, chamada **Sistema**, que mostra se tudo está funcionando (banco de dados, espaço para gravar, busca e vídeo), a versão instalada, o tamanho dos dados e o que está configurado (sempre "Sim" ou "Não", nunca o valor de uma senha ou chave). Nessa tela a administradora gera um **backup** com um clique, vê a lista de backups e baixa cada um. A **restauração** de um backup é feita só por quem cuida da instalação, por comando, com o sistema parado.

Quando algo dá errado, as telas de erro e o "Página não encontrada" passam a mostrar um **Código de referência**, que quem cuida da instalação usa para achar o problema nos registros do sistema, sem mostrar nenhum detalhe técnico para quem usa.

## 2. Roteiro de teste

Os casos partem de uma instalação preparada como na seção 5. Use a conta de administradora de demonstração, exceto onde o caso disser outra. Nada aqui usa serviço real: o OpenRouter e o Telegram não são necessários.

**Caso 1 — Item novo no menu e quem pode ver**
1. Entre como administradora e olhe o grupo "Configurações" do menu lateral. Saia, entre como usuário comum e olhe de novo.
- Deve acontecer: para a administradora a ordem é Usuários, Integrações, Privacidade, Auditoria, Sistema, Meu perfil. Para o usuário comum aparece só "Meu perfil".
- Falha se: o usuário comum vê "Sistema", ou o item aparece em outra posição.

**Caso 2 — Usuário comum não entra pelo endereço**
1. Entre como usuário comum. Na barra de endereço do navegador troque o final do endereço por "/configuracoes/sistema" e aperte Enter.
- Deve acontecer: o sistema leva de volta à tela inicial, sem mostrar nada da tela Sistema.
- Falha se: qualquer parte da tela aparece, mesmo por um instante.

**Caso 3 — A tela Sistema com tudo em ordem**
1. Entre como administradora e abra Configurações, Sistema.
- Deve acontecer: o título "Sistema"; o cartão "Estado geral" com o selo verde "Tudo em ordem"; quatro linhas (Banco de dados, Disco, Índice de busca, Vídeo e áudio) cada uma com "Tudo em ordem"; os cartões Aplicação (versão, "10 de 10 migrations aplicadas", tempo de atividade, fuso horário), Dados (tamanho do banco e dos arquivos enviados), Vídeo e áudio, Segundo plano (fila de fontes e limpeza automática) e Configuração (três linhas com Sim ou Não).
- Falha se: aparece qualquer chave, senha, token ou caminho de pasta do servidor; alguma linha mostra "Com falha"; algum cartão fica vazio.

**Caso 4 — A tela Sistema no celular e nos dois temas**
1. Com a janela do navegador reduzida a cerca de 375 pontos de largura (ou num celular), abra a tela Sistema. Troque entre o tema claro e o escuro pelo botão do canto superior.
- Deve acontecer: os cartões ficam um embaixo do outro, o texto é legível nos dois temas, não aparece barra de rolagem lateral na página.
- Falha se: a página rola para o lado, um texto é cortado ou fica ilegível em um dos temas.

**Caso 5 — Gerar um backup**
1. Na tela Sistema, no cartão Backup, leia o aviso amarelo e depois clique em "Gerar backup agora".
- Deve acontecer: o aviso diz que o backup NÃO contém a chave de criptografia e que ela deve ser guardada em local separado. Depois do clique, aparece na lista um arquivo com nome "backup-" seguido de data e hora, com a data e o tamanho dele, e o botão "Baixar".
- Falha se: o aviso não aparece, a lista continua em "Nenhum backup ainda", aparece uma mensagem de erro, ou o botão fica travado.

**Caso 6 — O backup fica registrado na Auditoria**
1. Abra Configurações, Auditoria.
- Deve acontecer: a primeira linha é "Backup gerado", com a administradora como autora e uma frase como "Gerou um backup do banco e dos arquivos pela tela (… e N arquivos)".
- Falha se: não há registro, ou o registro mostra o nome de uma pasta do servidor.

**Caso 7 — Baixar o backup**
1. Na tela Sistema, clique em "Baixar" no backup gerado.
- Deve acontecer: o navegador baixa um arquivo de nome igual ao da lista, terminado em ".tar.gz", com tamanho próximo ao mostrado na lista.
- Falha se: o download não começa, o nome é diferente, ou o arquivo vem vazio.

**Caso 8 — O download exige entrar no sistema**
1. Copie o endereço do botão "Baixar" (clique com o botão direito, copiar endereço do link). Saia do sistema e cole o endereço numa janela do navegador.
- Deve acontecer: o sistema leva para a tela de entrada e não baixa nada. O mesmo vale para um usuário comum que cole esse endereço.
- Falha se: o arquivo é baixado sem entrar, ou por um usuário comum.

**Caso 9 — O endereço de saúde responde sem entrar e sem detalhes**
1. Sem entrar no sistema (numa janela anônima), abra o endereço do sistema terminado em "/api/saude".
- Deve acontecer: aparece uma resposta curta com o estado geral ("ok" quando tudo está em ordem) e mais nada: sem versão, sem nomes de pasta, sem chaves.
- Falha se: pede para entrar, mostra detalhes internos do servidor, ou responde "falha" com tudo em ordem na tela Sistema.

**Caso 10 — Tela de erro com código de referência**
1. Na instalação "quebrada", abra "Conversas".
- Deve acontecer: aparece "Não foi possível carregar esta tela", a orientação de tentar de novo e o "Código de referência" com um número, mais o botão "Tentar de novo". Não aparece mensagem técnica, nome de arquivo nem trecho de código.
- Falha se: aparece texto técnico, ou a tela fica em branco, ou não há código de referência.

**Caso 11 — Página não encontrada**
1. Num sistema em ordem, abra um endereço que não existe, por exemplo acrescentando "/nao-existe" ao final do endereço.
- Deve acontecer: "Página não encontrada", o "Código de referência" e o botão "Ir para o painel".
- Falha se: aparece uma página técnica do navegador ou não há código de referência.

**Caso 12 — Restaurar um backup (feito por quem cuida da instalação)**
1. Gere um backup (caso 5). Depois, na mesma instalação, apague uma conversa e crie um agente novo, chamado "Agente Depois do Backup".
2. Peça a quem prepara o ambiente para parar o sistema, restaurar o backup gerado no passo 1 pelo comando de restauração do manual (seção "Restauração") e subir o sistema de novo.
- Deve acontecer: o comando termina com um resumo sem erro; ao entrar de novo (a sessão é derrubada de propósito) a conversa apagada voltou, o "Agente Depois do Backup" não existe mais, a busca por conhecimento continua respondendo, e a Auditoria mostra "Restauração de dados". Existe também uma cópia "pre-restauracao" do estado anterior ao lado dos backups.
- Falha se: o comando termina sem resumo, a conversa não volta, o agente novo continua lá, ou não há registro "Restauração de dados".

**Caso 13 — O comando recusa um backup estragado**
1. Peça a quem prepara o ambiente para copiar um backup, alterar um byte da cópia e tentar restaurar essa cópia (com o sistema parado).
- Deve acontecer: o comando recusa, diz que o arquivo foi adulterado ou está incompleto, e a instalação continua exatamente como estava (mesmos agentes e conversas ao subir de novo).
- Falha se: o comando aceita o arquivo, ou a instalação muda.

**Caso 14 — Subir e parar o contêiner**
1. Peça a quem prepara o ambiente para subir o sistema do zero numa máquina sem instalação anterior, pelo comando "docker compose up" do manual (seção "Subir com Docker"), criar o primeiro administrador pelo comando do manual e entrar.
2. Peça para reiniciar o contêiner e para parar com "docker compose stop".
- Deve acontecer: o sistema sobe sozinho, a conta de administrador criada entra, a tela Sistema mostra tudo em ordem, os dados (agentes, conversas, backups) continuam depois de reiniciar, e a parada termina em poucos segundos sem erro.
- Falha se: o sistema não sobe sem uma configuração obrigatória (isso é proposital e a mensagem deve dizer qual variável falta, nunca o valor), os dados somem ao reiniciar, ou a parada demora mais de 30 segundos.

## 3. O que observar de colateral

- **Entrada (login) e sessão:** continuam iguais; só a restauração derruba as sessões.
- **Conversas, Painel e Agentes:** a lista, o painel e a edição de agentes continuam funcionando como antes; erros inesperados nessas telas agora mostram o código de referência.
- **Chat de teste e chat embutido:** respondem e mostram fontes como antes; um erro inesperado devolve uma mensagem curta com código, nunca texto técnico. Envio de arquivos e de vídeo grandes (acima de 10 MB) continua funcionando.
- **Auditoria:** as ações antigas continuam aparecendo; a nova é "Backup gerado".
- **Integrações e Telegram:** conectar, trocar a chave e desconectar continuam como antes.
- **Vídeo:** a transcrição de vídeo continua disponível quando o programa de vídeo está instalado; sem ele a tela Sistema mostra "Funcionando com limitações", não "Com falha".
- Esta lista foi derivada das telas que dividem dados com as novas; não há mapa de impacto formal, então ela pode estar incompleta.

## 4. Dado de teste sugerido

Tudo fictício, preparado por quem desenvolve (seção 5):
- A instalação de demonstração com a administradora, o usuário comum e o "Assistente de exemplo".
- Uma conversa de teste para apagar e recuperar no caso 12, e um agente chamado "Agente Depois do Backup".
- Nenhum dado de cliente real; não digite e-mails, telefones ou nomes reais nas conversas.

## 5. Ambiente e estado inicial

**Onde testar:** na máquina de desenvolvimento ou numa instalação de homologação preparada por quem desenvolve, que informa o endereço. As contas de demonstração estão descritas no manual de instalação (seção "Contas de demonstração"); as senhas não ficam neste arquivo.

**O que precisa existir antes:** o sistema instalado e semeado com as contas de demonstração, rodando em modo de produção (o "build" feito); para o caso 10, uma segunda instalação de teste com o banco propositalmente sem as tabelas de conversa, preparada por quem desenvolve; para os casos 12 a 14, acesso de quem desenvolve a um terminal da máquina e o programa Docker instalado. O arquivo de configuração de produção (com as três variáveis obrigatórias: chave de sessão, chave de criptografia e endereço do banco) é preenchido por quem desenvolve; não fica neste arquivo.

**O que precisa estar ligado:** nada externo. Não é preciso OpenRouter nem Telegram.

## 6. Critério de aprovação

**APROVADO quando:** os 14 casos passam; a tela Sistema nunca mostra uma chave, senha, token ou pasta do servidor; o aviso de que o backup não contém a chave de criptografia aparece; o backup gerado aparece na lista, baixa com o mesmo nome e fica registrado na Auditoria; um usuário comum e uma pessoa sem entrar nunca acessam a tela Sistema nem o download; a restauração devolve exatamente o estado do backup e recusa arquivo adulterado sem alterar nada; e nenhuma tela nova força rolagem lateral a 375 pontos de largura nos dois temas.

**REPROVADO quando:** qualquer caso falha; ou aparece texto técnico (pilha de erro, caminho de arquivo, nome de função) em qualquer tela de erro; ou o backup pode ser baixado sem entrar; ou a restauração é oferecida por botão no navegador; ou alguma tela vizinha da lista de colaterais mudou de comportamento.

## 7. O que NÃO faz parte desta entrega

- Restauração pelo navegador: é só por comando, de propósito (o comando troca o banco e exige o sistema parado).
- A chave de criptografia no backup: ela fica de fora de propósito e precisa ser guardada em separado; sem ela, as chaves do OpenRouter e do Telegram guardadas no backup não são lidas depois de restaurar.
- Cópia do backup para fora da máquina, backup agendado pelo próprio sistema e backup incremental: há só a cópia local com retenção, e o agendamento é por cron do operador (exemplo no manual).
- Hospedagem em plataforma serverless, HTTPS embutido (é do proxy do operador) e publicação da imagem num registro.
- Teste em celular real, com leitor de tela, em outro navegador além do Chrome e em computador com arquitetura diferente da de desenvolvimento.
- Idiomas além do português do Brasil.
