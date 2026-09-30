# Verificação no navegador — FT-06 Chat embutido por script

Data: 2026-09-30. Ferramenta: Chrome controlado pela extensão da sessão (captura de tela, cliques e digitação; a execução de JavaScript na página foi negada, então nada foi inspecionado pelo console do navegador).

## Como foi montado

- Aplicativo de produção (`npm run build` e `next start`) na porta 3100, com banco próprio de verificação (migrado e semeado, apagado ao fim), `JWT_SECRET` e `ENCRYPTION_KEY` descartáveis passados na linha de comando (nenhum segredo em arquivo) e `TRUST_PROXY=1`.
- OpenRouter simulado (`npx tsx tests/apoio/servir-falso.ts`), com a chave de teste cadastrada pela tela Configurações, Integrações, logado com a conta de demonstração do admin (seed).
- "Site do cliente" de mentira em **outra origem e outra porta** (`npx tsx tests/apoio/servir-site-de-teste.ts 4321 http://localhost:3100 agente-de-exemplo`), com CSS hostil (botões vermelhos, fonte forçada) e o trecho de uma linha no fim do `<body>`.

## O que foi verificado e funcionou

| Passo | Resultado |
|---|---|
| Botão flutuante no site de outra origem | aparece no canto direito, redondo, na cor do agente; o CSS hostil do site (botão vermelho, fonte forçada) não o afetou: Shadow DOM isolou o estilo |
| Clique no botão | abre o painel com o iframe da plataforma; cabeçalho com avatar, título, nova conversa e fechar; mensagem inicial, três sugestões e o aviso de privacidade no rodapé; foco no campo |
| Clicar numa sugestão | a pergunta vira bolha do visitante, o indicador de digitação aparece e a resposta chega **em stream** (lista, negrito, link e código renderizados pelo renderizador seguro); a fonte consultada aparece como chip só com o título |
| Esc com o foco dentro do painel | fecha o painel e o botão volta a ser "abrir" |
| Recarregar a página do site e reabrir | a conversa volta (retomada pelo `visitanteId` do `localStorage` e pelo `GET conversa`) |
| Excesso de mensagens (chamadas de outro cliente esgotam os 10 por minuto do IP) | a próxima mensagem do painel mostra "Você enviou muitas mensagens em pouco tempo. Aguarde alguns instantes e tente de novo.", o texto digitado volta ao campo |
| `data-position="esquerda"` e `data-color` na tag do script | o botão vai para o canto esquerdo e assume a cor laranja do atributo |
| Aba Publicar | formulário com chave "Publicar chat", título, amostras de cor, posição, avatar, sugestões, aviso, link, domínios e limite; bloco "Código para incorporar" com o trecho; pré-visualização ao vivo (chat de verdade com selo "Prévia"); salvar mostra "Configuração do chat salva." e recarrega a prévia |
| Domínio não permitido (`exemplo.com` como única entrada, site de teste em `localhost:4321`) | o widget não mostra botão nenhum (o CORS do `config` não libera a origem) e a página do chat emoldurada direto no site (`/iframe-direto`) é **recusada pelo navegador** por `frame-ancestors 'self' exemplo.com`; limpando a lista o botão volta |

## Achado da verificação, já corrigido

O campo "Link do aviso de privacidade" (`type="url"`) saía pequeno e sem estilo, porque a regra global de campos não incluía `input[type='url']`. Corrigido em `src/estilos/global.css` (regra geral e as duas regras de tela estreita).

## O que ficou sem verificar

- **375 px.** A janela do navegador da sessão aceitou o pedido de redimensionamento, mas a área visível continuou larga (o mesmo limite das verificações das features anteriores). O comportamento de tela cheia abaixo de 480 px está provado só por teste do CSS do script (`tests/widget-interacao.test.ts`) e do embed (`tests/chat-embutido-ui.test.tsx`), não visto. Continua na PEND-07.
- Tema **claro** do chat embutido e da aba Publicar (o sistema estava no tema escuro); os tokens têm contraste provado por `tests/tokens.test.ts`.
- O botão **Copiar código** e o fallback quando `navigator.clipboard` falta (provados por `tests/publicar-logica.test.ts`; não foi clicado).
- O botão de ampliar o painel (`redimensionar`) e o foco devolvido ao botão ao fechar por clique (provados em happy-dom).
- Site de cliente com HTTPS e com CSP própria que bloqueie iframe ou script (o PR-08 declara que isso invalida o embed nesses sites).
- Teclado em leitor de tela real.
