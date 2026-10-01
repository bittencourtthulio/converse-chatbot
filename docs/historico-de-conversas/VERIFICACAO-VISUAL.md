# Verificação no navegador — FT-09 Histórico de conversas e painel

Data: 2026-10-01. Ferramenta: a extensão do Chrome da sessão não conectou ("Browser extension is not connected"), então a verificação foi feita com um Chrome sem janela controlado por CDP (script avulso, fora do repositório), com capturas de tela. O OpenRouter e o Telegram reais não foram usados.

## Como foi montado

- Aplicativo de produção (`npm run build` e `next start`) na porta 3110, com banco e armazenamento próprios de verificação (migrado e semeado, fora do repositório), `JWT_SECRET` e `ENCRYPTION_KEY` descartáveis passados na linha de comando (nenhum segredo em arquivo) e `APP_URL` HTTPS de fachada.
- OpenRouter simulado (`npx tsx tests/apoio/servir-falso.ts`) com a chave de teste cadastrada pela tela Configurações, Integrações; Telegram simulado (`npx tsx tests/apoio/servir-telegram-falso.ts`) com o token fictício que ele imprime, conectado na aba Canais do agente de exemplo.
- Conta de demonstração do admin (seed). Conversas geradas: uma pela aba Testar (canal painel), uma pela página do chat embutido `/embed/<agente>` (canal widget, visitante novo), duas pelo webhook do Telegram simulado (`POST /enviar` da porta de controle), mais as duas conversas fictícias da seed.

## O que foi verificado e funcionou

| Passo | Resultado |
|---|---|
| Menu | item "Conversas" no grupo principal, logo abaixo de Agentes, ativo na lista e no detalhe |
| Lista com os três canais | 6 conversas (4 geradas, 2 da seed): rótulo mascarado ("Visitante 952370", "Telegram: Maria", nome do usuário no painel), agente, badge de canal em texto (Painel, Chat embutido, Telegram), nº de mensagens, última atividade e prévia da última mensagem; paginação "1 a 6 de 6 conversas" |
| Filtros | canal telegram e widget (2 cada), texto "trocar" (2), agente mais canal painel (2), texto inexistente (estado vazio "Nenhuma conversa encontrada") |
| Detalhe | transcrição em bolhas na ordem, horário de cada mensagem, modelo na resposta, metadados (agente com link, canal, interlocutor, início, última atividade, mensagens), Exportar e Apagar; markdown da resposta renderizado pelo renderizador seguro; a seção Fontes mostra a fonte consultada |
| Exportar | `200`, `text/plain; charset=utf-8`, `attachment; filename="conversa-<id>.txt"` sem rótulo nem identificador; o texto traz agente, canal, rótulo mascarado, horários e mensagens, e os títulos das fontes |
| Apagar uma | o primeiro clique só abre "Apagar esta conversa?"; Cancelar fecha; Confirmar apaga e volta à lista |
| Apagar em lote | duas caixas marcadas, "2 selecionadas", "Apagar selecionadas" abre "Apagar 2 conversas?" na própria tela (sem janela do navegador); Confirmar apaga e a lista recarrega com as restantes |
| Painel | cartões (agentes, fontes prontas e com erro, conversas e mensagens dos 7 dias, quebra por canal), gráfico de 14 dias com o valor sobre cada barra, "Ver os dados em tabela", conversas recentes com link; os números caíram de 6 para 3 conversas e de 16 para 10 mensagens depois de apagar; primeiros passos com "3 de 4" antes de cadastrar a chave e a lista sumindo depois |
| Tema escuro | painel, lista e detalhe legíveis, badges e barras nos tokens do tema |
| 375 px | `scrollWidth - clientWidth` igual a 0 no painel, na lista e no detalhe, nos dois temas (janela emulada por `Emulation.setDeviceMetricsOverride`); a tabela vira cartões com rótulos por célula, a caixa de seleção no canto do cartão e os filtros em uma coluna |
| Log do servidor | nenhuma linha com texto de conversa, identificador do visitante ou do chat |

## Achados da verificação, já corrigidos

- A prévia mostrava a marcação de markdown crua ("**uma resposta**", "[a documentação](...)"). `previaDaMensagem` (`src/servicos/historico-logica.ts`) agora tira negrito, código, link, item de lista e título; o teste está em `tests/historico-logica.test.ts`.
- O gráfico, com largura máxima de 640 px, escalava os rótulos para cerca de 21 px na tela larga. A largura máxima passou a 480 px (`src/estilos/global.css`).

## O que ficou sem verificar

- **O script `widget.js` num site de terceiro.** O canal widget foi exercitado pela página `/embed/<agente>`, que é o que o iframe do script abre; o script em si (botão flutuante, Shadow DOM) já foi visto na FT-06 e não foi repetido aqui.
- **Extensão do Chrome e celular real.** Os 375 px são os da emulação por CDP, sem o teclado e a barra do navegador de um aparelho: segue na PEND-07.
- **Leitor de tela real.** O gráfico (`role="img"` com rótulo e tabela equivalente) e as confirmações (`alertdialog`) têm teste de marcação, não foram ouvidos.
- **Conteúdo hostil na tela.** Script e `<img onerror>` de visitante foram provados por teste (marcação e DOM simulado) e pela página do servidor de produção, não com uma mensagem hostil digitada no navegador.
- **Volume.** Nenhuma lista com centenas de conversas foi aberta; o custo da busca por texto sem índice só foi medido em teste com 250 conversas.
