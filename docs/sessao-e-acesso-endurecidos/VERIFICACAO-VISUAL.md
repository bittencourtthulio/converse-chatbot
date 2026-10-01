# Verificação no navegador — FT-12 sessao-e-acesso-endurecidos

Verificação feita num Chrome próprio (modo sem janela, perfil novo em diretório temporário, `--remote-debugging-port=0` com a porta livre lida do próprio Chrome), controlado por CDP. Um servidor de produção (`next start`) também próprio, em porta livre, com banco, `storage` e backups temporários só desta verificação e segredos descartáveis passados inline; `JWT_TTL_SEGUNDOS=30` (a metade da vida é 15 s) para ver a renovação sem esperar 15 minutos. Antes de cada navegação a URL do alvo foi conferida contra o endereço do servidor próprio; nenhuma janela, aba ou aplicativo de outro projeto foi tocado, e o Chrome, o servidor e os temporários foram encerrados e apagados no fim. As capturas de tela não são versionadas.

## O que foi visto

- **Login e o cookie do navegador:** a conta de demonstração entrou e chegou ao Painel. O cookie `expx_sessao` no navegador era `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` e expirava em 28 s (a vida de 30 s do teste).
- **Uso depois da metade da vida:** aos 18 s, uma navegação a Agentes renovou o cookie (a expiração foi de 31 s para 29 s à frente, ou seja, ganhou vida nova), e aos 34 s, depois do instante em que o token original teria expirado, a navegação seguiu logada.
- **Sair e o cookie antigo:** o botão Sair levou a `/entrar` e apagou o cookie. O cookie copiado antes do logout, recolocado no navegador, foi barrado: abrir `/perfil` voltou ao login.
- **Troca de senha e login imediato:** a troca em `/perfil/senha` mostrou "Senha alterada"; sem esperar, o login com a senha nova entrou em `/` (2,5 s depois, incluindo a digitação).
- **Bloqueio de tentativas:** seis tentativas erradas seguidas no mesmo e-mail; a sexta mostrou "Muitas tentativas de entrada. Tente de novo em 7 segundos." no cartão de erro do formulário.
- **Temas e largura:** a tela de login, o Painel e o bloqueio nos temas claro e escuro a 1280 px e a 375 px (largura emulada, `scrollWidth` igual a 375 nas telas de login e de bloqueio nos dois temas): a mensagem de bloqueio quebra em duas linhas sem rolagem lateral e o campo de senha mantém o foco visível.

## Defeitos achados

Nenhum defeito visual ou funcional. `src/estilos/global.css` não precisou de alteração; nenhuma tela nova foi criada (a mensagem de bloqueio e o login são os componentes que já existiam).

## O que não foi visto

- Telefone real, leitor de tela e outros navegadores além do Chrome (a largura de 375 px é emulada).
- A vida real de 15 minutos: a renovação foi vista com `JWT_TTL_SEGUNDOS=30`. O limite absoluto de 12 horas (`SESSAO_MAXIMA_HORAS`) não cabe numa verificação manual: está provado no serviço com relógio injetado (`tests/sessao-renovacao.test.ts`).
- Uma mensagem de "sessão expirada" na tela de login: não existe; quem tem a sessão encerrada, expirada ou revogada é levado a `/entrar` sem texto (comportamento anterior, mantido).
- A tela de Sair em celular (o botão Sair fica no menu do usuário; nesta verificação foi acionado pelo botão do menu a 1280 px).
