# Verificação visual — aba Testar (FT-03)

Data: 2026-09-30. Ferramenta: navegador Chrome da sessão (extensão de automação), contra o servidor de produção local (`next start`) com um banco descartável (migrations aplicadas e seed de demonstração) e o OpenRouter simulado de `tests/apoio/openrouter-falso.ts` rodando local, com pausa de 350 ms entre os trechos para a resposta poder ser vista chegando. Nenhuma chamada à rede real; segredos passados por variável de ambiente no comando. O banco descartável foi apagado ao fim.

## O que foi visto

| Verificação | Tema | Resultado |
|---|---|---|
| Aba Testar em `/agentes/<id>/testar`: abas "Configurações" e "Testar" (a segunda marcada), mensagem inicial do agente como primeira bolha, sugestão de estado vazio, campo com dica de Enter e botão Enviar desabilitado | claro | visto |
| Enviar com Enter: bolha do usuário à direita, bolha do agente à esquerda, resposta com lista, negrito, link, código em linha e bloco de código renderizados | claro e escuro | visto |
| Resposta chegando trecho a trecho, com o botão Parar no lugar de Enviar durante o stream | escuro | visto (captura no meio do stream) |
| Parar no meio (acionado por script, porque o stream é curto para o clique manual): a bolha fica com o texto parcial e a nota "Resposta interrompida.", sem Alerta, e o botão volta a ser Enviar | escuro | visto (texto lido da página) |
| Recarregar a página: a conversa é retomada (três bolhas de agente: a inicial e as duas respostas completas); a resposta interrompida não volta | escuro | visto (texto lido da página) |
| Falha do provedor (servidor simulado desligado): Alerta de erro na conversa com "O OpenRouter está indisponível no momento. Tente de novo em instantes." e a pergunta permanece | escuro | visto |
| Alternar o tema pelo botão do cabeçalho: superfícies, bolhas, código e Alerta trocam por tokens | claro e escuro | visto |

## O que NÃO foi verificado

- **375 px de largura.** A janela do navegador da sessão não reduz a largura (`innerWidth` continuou 1920 depois do redimensionamento), o iframe de teste é barrado pelo cabeçalho `X-Frame-Options: DENY` (PR-37) e a janela auxiliar foi bloqueada. O layout estreito (bolhas a 92%, área de mensagens em 55% da altura, alvos de toque de 44 px, texto de 16 px no campo) tem regras em `src/estilos/global.css` mas não foi visto; a pendência PEND-07 de `docs/projeto/RECURSAO.md` segue aberta e ganhou a aba Testar.
- Botão Parar por clique manual e rolagem automática ao subir e descer a conversa: cobertos só pela lógica dos módulos puros (`tests/estado-da-conversa.test.ts`).
- Contador de caracteres (só aparece a partir de 3500) e foco por teclado: sem verificação em navegador.
- Mensagem sem chave cadastrada e link para Integrações: coberto por `tests/rotas.test.ts` e `tests/chat-de-teste.test.tsx`, não visto.

## Ajuste feito por causa da verificação

A altura do quadro de mensagens passou de `min(60vh, 560px)` para `clamp(280px, 50vh, 520px)`, para o campo de envio caber inteiro numa janela de 929 px de altura (`src/estilos/global.css`).
