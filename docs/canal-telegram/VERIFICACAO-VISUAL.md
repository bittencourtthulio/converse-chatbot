# Verificação no navegador — FT-07 Canal Telegram

Data: 2026-09-30. Ferramenta: Chrome controlado pela extensão da sessão (captura de tela, cliques e digitação). O Telegram real não foi usado: o canal foi exercitado contra o Telegram simulado.

## Como foi montado

- Aplicativo de produção (`npm run build` e `next start`) na porta 3107, com banco próprio de verificação (migrado e semeado, fora do repositório), `JWT_SECRET` e `ENCRYPTION_KEY` descartáveis passados na linha de comando (nenhum segredo em arquivo) e `TRUST_PROXY=1`.
- OpenRouter simulado (`npx tsx tests/apoio/servir-falso.ts`), com a chave de teste cadastrada pela tela Configurações, Integrações, logado com a conta de demonstração do admin (seed).
- Telegram simulado como processo avulso (`npx tsx tests/apoio/servir-telegram-falso.ts 4400`), com o token fictício que ele imprime; `TELEGRAM_API_BASE` apontando para ele e `APP_URL` HTTPS de fachada (`https://converse-verificacao.exemplo.invalid`). O simulado aceita o `setWebhook` e nunca chama o app de volta; quem disparou os updates foi `curl` direto em `localhost`, com o `secret_token` lido da porta de controle do simulado.

## O que foi verificado e funcionou

| Passo | Resultado |
|---|---|
| Aba Canais, agente de exemplo, sem bot | cartão Telegram com selo "Não conectado", passo a passo (@BotFather, `/newbot`, token, Conectar), campo de token em senha vazio e botão Conectar |
| Colar o token de teste e Conectar | cartão passa a "Conectado": nome e `@bot_de_teste_bot` com link, última mensagem "Nenhuma ainda", conectado em, URL do webhook, Verificar, Pausar, Desconectar, limite diário 500 e "Trocar o token do bot"; o token não aparece em lugar nenhum da tela |
| Verificar | "O webhook está correto." (o primeiro clique logo depois do carregamento foi perdido por falta de hidratação; o segundo funcionou) |
| `curl` com segredo errado e sem segredo | 401, corpo de zero bytes |
| `curl` `/start` | 200; o simulado recebeu a mensagem inicial do agente no chat certo |
| `curl` pergunta com a base | 200 imediato; o simulado recebeu a resposta do agente em texto puro (o markdown da resposta não foi interpretado) |
| Reenvio do mesmo `update_id` | 200 e nenhuma segunda resposta (duas mensagens ao todo) |
| `/novo` | conversa nova e vazia, título "Telegram: Joao", confirmação enviada |
| Foto em chat privado | "Só consigo ler mensagens de texto por enquanto." |
| Mensagem de grupo | 200 e nada enviado |
| 12 mensagens seguidas do mesmo chat | atendidas em ordem; as 10 primeiras responderam, as 2 últimas receberam "Você enviou muitas mensagens em pouco tempo…" e só 10 perguntas foram gravadas |
| Pausar | selo "Pausado", botão vira Retomar; com o canal pausado, um update recebeu 200 e o simulado não recebeu nada |
| Tema claro | o cartão abre legível, com selos e alertas nos tokens do tema |
| Desconectar | o primeiro clique só abre a confirmação ("Desconectar o bot?", Confirmar desconexão, Cancelar); confirmar volta ao estado "Não conectado", o simulado recebeu `deleteWebhook`, canal e atualizações sumiram do banco e as 3 conversas do Telegram continuaram |
| Varredura do log do servidor | `grep` do token, do segredo do webhook e do texto das conversas: zero ocorrências; só 11 linhas `recuperacao` (sem conteúdo) |

## Achados da verificação, já corrigidos

- Os botões de ação esticavam até a largura da mensagem de retorno (Verificar e Retomar ficavam enormes). `.canal-acao` agora alinha ao início e o retorno tem largura máxima.
- A mensagem "Bot pausado…" ficava abaixo do botão Retomar depois de pausar, porque o mesmo formulário era reaproveitado. O formulário de Pausar e o de Retomar agora têm `key` próprios.

## O que ficou sem verificar

- **Telegram real.** Só com token e URL pública HTTPS do usuário (PEND-06). O comportamento do `secret_token` e do reenvio pelo Telegram de verdade está provado só contra o simulado e pela documentação.
- **375 px.** A janela do navegador da sessão aceitou o pedido de redimensionamento, mas a área visível continuou larga (o mesmo limite das verificações anteriores). O CSS de uma coluna abaixo de 480 px e o alvo de 44 px estão provados só por teste (`tests/canais-ui.test.tsx`), não vistos. Continua na PEND-07.
- A mensagem de sucesso "Bot conectado: @…" logo depois de Conectar não aparece: a revalidação troca o cartão para o estado conectado e o retorno da ação some junto; a mudança de estado é o próprio aviso.
- O aviso de `APP_URL` sem HTTPS e o selo "Com erro" foram vistos só em teste de renderização e de rota, não no navegador.
- Teclado em leitor de tela real.
