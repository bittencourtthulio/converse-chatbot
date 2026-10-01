# Verificação no navegador — FT-10 Privacidade e auditoria

Data: 2026-10-01. Ferramenta: a extensão do Chrome da sessão não conectou ("Browser extension is not connected"), então a verificação foi feita com um Chrome sem janela controlado por CDP (script avulso, fora do repositório), com capturas de tela. O OpenRouter e o Telegram reais não foram usados.

**Ocorrência na primeira tentativa.** O primeiro Chrome foi aberto na porta de depuração 9333, que já estava em uso por outro aplicativo da máquina (um Electron, não deste projeto); o script se conectou a esse aplicativo em vez de ao Chrome novo e navegou e preencheu a conta de demonstração numa das páginas dele. Nada foi gravado fora do banco de verificação deste projeto, mas a página que o outro aplicativo mostrava foi trocada. Tudo o que está abaixo foi **refeito do zero** num Chrome próprio, em outra porta (`HeadlessChrome` confirmado na versão do navegador), com banco novo.

## Como foi montado

- Aplicativo de produção (`npm run build` e `next start`) na porta 3120, com banco e armazenamento próprios de verificação (migrado, com a seed e com `tests/apoio/semear-privacidade.ts`, tudo fora do repositório), `JWT_SECRET` e `ENCRYPTION_KEY` descartáveis na linha de comando (nenhum segredo em arquivo, o arquivo de segredos não foi tocado) e `APP_URL` HTTPS de fachada.
- Telegram simulado (`npx tsx tests/apoio/servir-telegram-falso.ts`) com o token fictício que ele imprime. O OpenRouter não foi necessário: a chave cadastrada é fictícia e nenhuma resposta de IA foi pedida.
- Conta de demonstração do admin (seed). Semeadura: 4 conversas (uma de widget com 120 dias e uma de Telegram com 100 dias, para o expurgo apagar; duas de widget recentes, de visitantes com prefixo igual), um usuário para excluir (dono de um agente) e um colega.

## O que foi verificado e funcionou

| Passo | Resultado |
|---|---|
| Menu | Privacidade e Auditoria no grupo Configurações, entre Integrações e Meu perfil, só para o admin |
| Trocar a chave do OpenRouter e o modelo de transcrição | cada ação apareceu na Auditoria ("Trocou a chave do OpenRouter.", "Alterou o modelo de transcrição para google/gemini-2.5-pro."), sem valor de chave, máscara nem texto cifrado |
| Criar e desativar usuário | "Criou o usuário Teste Auditoria com o papel Usuário." e "Desativou o usuário Colega de Equipe." |
| Excluir definitivamente | a confirmação abre na própria tela, o botão de confirmar fica desabilitado até digitar o e-mail (aceita caixa diferente e espaço nas pontas); depois de excluir, "Excluiu definitivamente o usuário Pessoa Para Excluir <e-mail>. 1 agente passou para quem excluiu."; o agente continuou existindo; a própria linha do admin não oferece a ação |
| Telegram (simulado) | conectar, pausar, retomar, mudar o limite e desconectar: cinco registros, cada um com o nome do agente e sem token |
| Apagar conversa | pelo detalhe da conversa: volta à lista e grava "Apagou uma conversa do chat embutido (4 mensagens)." |
| Retenção | 90 para 60 dias gravou "Alterou a retenção das conversas de 90 dias para 60 dias."; escolher "Sem expurgo automático" mostra o aviso de risco e deixa o botão de salvar desabilitado até marcar a confirmação |
| Aviso padrão | texto e link salvos com a mensagem de sucesso |
| Expurgo automático | rodou sozinho 1 minuto depois da subida: apagou as 2 conversas antigas (6 mensagens), manteve as recentes e gravou "O expurgo automático apagou 2 conversas (6 mensagens), 0 registros de controle do Telegram e 0 registros de auditoria antigos. Retenção das conversas: 60 dias." como Sistema |
| Auditoria | tabela só leitura, 25 por página, do mais recente ao mais antigo, com o rótulo de quem fez; filtro por ação (um registro), período invertido mostra "Confira os filtros" na tela; nenhum botão de editar ou apagar |
| Ferramentas do titular | busca ambígua por "visitantealfa" lista os dois com o prefixo que os distingue; busca única mostra o resumo sem o identificador completo; Exportar em JSON e em TXT baixaram `titular-widget-AAAA-MM-DD.json` e `.txt` (conteúdo conferido, sem o identificador); Apagar tudo exige digitar APAGAR e devolveu "Apagadas 1 conversa e 2 mensagens do titular." |
| Apagar minha conversa (widget) | no `/embed/<agente>` com o visitante e a conversa guardados, o ícone de lixeira abre a confirmação na tela; "Apagar tudo" apagou a conversa no banco, voltou ao estado inicial e limpou a conversa guardada no navegador (o id do visitante fica); a auditoria registrou "Visitante (chat embutido)" sem usuário e sem o id dele |
| Dois temas e 375 px | Auditoria, Privacidade, Usuários, Conversas, Agentes e o chat embutido nos dois temas; `scrollWidth - clientWidth` igual a 0 em todos a 375 px (janela emulada por `Emulation.setDeviceMetricsOverride`); a tabela de Auditoria vira cartões com o rótulo de cada célula |
| Log do servidor | nenhuma linha com texto de conversa, identificador, token ou chave |

## Achados da verificação, já corrigidos

- **Usuários a 375 px estourava 514 px na horizontal** (já existia desde a FT-09: a regra que tira a rolagem das tabelas que viram cartões valia para toda `.tabela-envoltorio`, e a tabela de Usuários não vira cartões). A regra agora vale só para as tabelas de Conversas e de Auditoria, e o envoltório ganhou `position: relative` para o texto só para leitor não escapar da rolagem (`src/estilos/global.css`, `tests/privacidade-estilos.test.ts`).
- **O campo de dias da retenção aparecia com 18 px**, herdando a regra do botão de rádio; agora tem 7rem (`src/estilos/global.css`).
- **A desambiguação mostrava o mesmo prefixo para dois visitantes** quando eles diferem depois do décimo caractere; o prefixo agora cresce até distinguir (`tamanhoDoPrefixoQueDistingue` em `src/servicos/titular.ts`, `tests/titular.test.ts`).

## O que ficou sem verificar

- **Telegram real e o `/start` com o aviso padrão no aplicativo.** O `/start` com aviso foi provado contra o Telegram simulado (`tests/privacidade-aviso-canais.test.ts`), não visto no navegador nem no aplicativo.
- **O aviso padrão no rodapé do chat embutido.** O agente de exemplo tem aviso próprio, então o aviso do workspace só foi provado por teste.
- **Extensão do Chrome, celular real e leitor de tela.** Os 375 px são os da emulação por CDP, sem o teclado e a barra de um aparelho: segue na PEND-07. As confirmações (`alertdialog`) têm teste de marcação, não foram ouvidas.
- **`widget.js` num site de terceiro.** O botão de apagar foi visto na página `/embed/<agente>`, que é o que o iframe do script abre.
- **Volume.** Nenhuma lista de auditoria com centenas de registros foi aberta; o expurgo em lotes de 500 foi provado por teste com 1230 conversas.
