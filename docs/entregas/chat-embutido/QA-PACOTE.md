---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
casos: 17
atualizado_em: 2026-09-30
---

# Pacote de QA — Chat embutido por script (FT-06)

## 1. O que mudou

Cada agente ganha uma aba nova, **Publicar**. Ali a pessoa liga o chat, escolhe a aparência (título, cor, posição do botão, avatar, perguntas sugeridas, aviso de privacidade), define em que sites o chat pode aparecer e quantas mensagens por dia os visitantes podem mandar, e copia **uma linha de código** para colar no próprio site. Quem visita esse site vê um botão flutuante, abre o chat sem fazer login e conversa com o agente, com a resposta chegando aos poucos. O chat respeita os sites permitidos e os limites de uso, e o visitante nunca vê detalhe técnico quando algo dá errado.

## 2. Roteiro de teste manual

Os casos partem de uma instalação preparada como na seção 5, com o servidor simulado do OpenRouter (a resposta dele é sempre a mesma frase de exemplo: o que se confere aqui é a tela e o comportamento, não a qualidade da resposta) e o **site de teste** aberto em outro endereço, que imita o site de um cliente. Use a conta de administrador de demonstração, salvo onde o caso disser outra.

**Caso 1 — Publicar o chat**
1. Entre, abra "Agentes", o "Assistente de exemplo" e a aba "Publicar".
2. Desmarque "Publicar chat" e toque em "Salvar configuração do chat". Depois marque de novo e salve.
- Deve acontecer: a faixa verde "Configuração do chat salva." aparece nas duas vezes; com o chat desligado a tela mostra o aviso "O chat está desligado…"; ligado, o aviso some.
- Falha se: o salvamento mostra erro, ou o aviso de chat desligado não aparece quando está desligado.

**Caso 2 — Código para incorporar**
1. Na mesma aba, no bloco "Código para incorporar", leia o código e toque em "Copiar código".
2. Cole o conteúdo copiado num campo de texto qualquer.
- Deve acontecer: o código é uma linha que começa com `<script src=` e termina com `</script>`, com o endereço do sistema e a identificação do agente; ao copiar aparece "Código copiado." e o texto colado é igual ao mostrado. Abaixo há as instruções (colar antes do fim da página, usar HTTPS em produção). Se o navegador não deixar copiar sozinho, o código fica selecionado e a mensagem manda copiar com Ctrl+C.
- Falha se: o botão não faz nada e não explica, o código vem sem o endereço, ou o texto colado difere.

**Caso 3 — O botão aparece no site do cliente**
1. Com o chat ligado, abra o site de teste (outro endereço, outra porta).
- Deve acontecer: aparece um botão redondo no canto direito da tela, na cor do agente; o botão do próprio site (vermelho de propósito) continua vermelho e quadrado, sem ser afetado.
- Falha se: o botão não aparece, ou o estilo do site deforma o botão do chat ou o chat deforma o site.

**Caso 4 — Conversar**
1. Toque no botão. O painel abre com o título do agente, a mensagem inicial, três perguntas sugeridas e, no rodapé, o aviso de privacidade.
2. Toque numa pergunta sugerida.
- Deve acontecer: a pergunta aparece como bolha sua, surge o indicador de digitação, a resposta chega aos poucos (lista, negrito, link e código aparecem formatados) e, abaixo dela, um chip com o nome da fonte consultada. As perguntas sugeridas somem depois da primeira mensagem.
- Falha se: a resposta só aparece inteira no fim, aparecem símbolos de formatação soltos, o chip não existe, ou as sugestões continuam.

**Caso 5 — Fechar, reabrir e retomar**
1. Com o painel aberto, feche de três jeitos, um por vez, reabrindo entre eles: o X do cabeçalho, a tecla Esc e o botão redondo.
2. Reabra, recarregue a página do site e abra de novo.
- Deve acontecer: o painel fecha nos três casos e o foco volta ao botão redondo; ao reabrir e depois de recarregar a página, a conversa anterior aparece de novo, com as respostas e as fontes.
- Falha se: algum dos três jeitos não fecha, a conversa some ao recarregar, ou aparecem mensagens de outra pessoa.

**Caso 6 — Nova conversa**
1. Com uma conversa aberta, toque no ícone de recomeçar no cabeçalho.
2. Recarregue a página e abra o chat.
- Deve acontecer: a tela volta ao começo (mensagem inicial e sugestões); depois de recarregar, a conversa antiga não volta.
- Falha se: a conversa antiga reaparece depois de recomeçar.

**Caso 7 — Aviso de privacidade**
1. Na aba "Publicar", preencha "Aviso de privacidade" e o link, salve e recarregue o site de teste.
2. Esvazie o aviso e salve de novo.
- Deve acontecer: o aviso aparece no rodapé do chat, com "Saiba mais" que abre o link em outra aba; sem aviso, o rodapé some. Link sem texto de aviso é recusado com mensagem.
- Falha se: o aviso não aparece, o link abre na própria aba do chat, ou o link é aceito sem o texto.

**Caso 8 — Personalizar com prévia ao vivo**
1. Na aba "Publicar", a coluna da direita mostra a "Pré-visualização" do chat. Mude o título, escolha outra cor numa amostra, troque o avatar e digite uma pergunta sugerida nova, **sem salvar**.
2. Escolha uma cor quase branca (por exemplo, a cor `#fafafa` digitada no campo).
3. Salve e recarregue o site de teste.
- Deve acontecer: a prévia muda na hora a cada ajuste (título, cor, avatar, perguntas); o texto sobre a cor continua legível (claro sobre cor escura, escuro sobre cor clara); a cor quase branca mostra um aviso de pouco contraste; depois de salvar, o site de teste mostra o botão e o chat com a configuração nova.
- Falha se: a prévia só muda depois de salvar, o texto some sobre alguma cor, ou o aviso de contraste não aparece.

**Caso 9 — Posição e cor só naquela página**
1. No site de teste, abra os links "botão à esquerda" e "cor sobrescrita".
- Deve acontecer: no primeiro o botão vai para o canto esquerdo; no segundo fica laranja, mesmo com a cor diferente configurada no agente.
- Falha se: o botão ignora o que está na linha de código.

**Caso 10 — Chat desligado**
1. Na aba "Publicar", desmarque "Publicar chat" e salve. Recarregue o site de teste.
2. Abra o endereço da página do chat diretamente (o endereço do sistema com `/embed/` e a identificação do agente) e depois o de um agente que não existe.
- Deve acontecer: o botão não aparece no site; a página direta mostra "Chat indisponível — Este assistente não está disponível no momento", **igual** para o agente desligado e para o inexistente, sem nome nem detalhe.
- Falha se: o botão aparece, ou as duas páginas diferem, ou alguma mostra o nome do agente.

**Caso 11 — Sites permitidos**
1. Na aba "Publicar", em "Domínios permitidos", escreva `exemplo.com` e salve. Recarregue o site de teste e abra também a página "iframe direto" dele.
2. Esvazie o campo e salve de novo.
- Deve acontecer: com `exemplo.com`, o site de teste (que não está na lista) **não mostra o botão** e a página "iframe direto" mostra o quadro quebrado (o navegador recusa); com o campo vazio, tudo volta a funcionar.
- Falha se: o chat aparece num site fora da lista.

**Caso 12 — Limite por minuto**
1. No site de teste, mande muitas mensagens curtas seguidas (cerca de 12 em menos de um minuto, esperando cada resposta terminar).
- Deve acontecer: depois da décima, o chat mostra, em faixa vermelha, "Você enviou muitas mensagens em pouco tempo. Aguarde alguns instantes e tente de novo." e mantém o texto no campo; passado cerca de um minuto, volta a responder.
- Falha se: não há limite, a mensagem é técnica, ou o texto digitado se perde.

**Caso 13 — Limite diário do agente**
1. Na aba "Publicar", ponha "Limite diário de mensagens" em 2 e salve. No site de teste, mande 3 mensagens (espaçadas).
2. Volte o limite para 500.
- Deve acontecer: a terceira mensagem mostra "Este assistente atingiu o limite de mensagens de hoje. Tente novamente amanhã."; com 500 volta a responder.
- Falha se: o limite não vale, ou o número aceito no campo fica fora de 1 a 100.000 sem aviso.

**Caso 14 — Erro sem detalhe técnico**
1. Como administrador, em Configurações, Integrações, remova a chave do OpenRouter. No site de teste, mande uma mensagem.
2. Cadastre a chave de teste de novo.
- Deve acontecer: o visitante vê só "Não consegui responder agora. Tente novamente em instantes." — nada sobre chave, administrador ou provedor; na aba "Publicar", a faixa de aviso explica que sem a chave o visitante vê essa mensagem genérica.
- Falha se: qualquer palavra técnica ou nome de serviço aparece para o visitante.

**Caso 15 — Validações do formulário**
1. Na aba "Publicar", tente salvar: uma cor que não é hexadecimal; um domínio inválido (por exemplo `nao valido`); quatro perguntas sugeridas; um link de aviso sem o texto do aviso.
- Deve acontecer: cada tentativa mostra uma mensagem clara em português (a cor e o domínio inválidos já são apontados no campo antes de salvar) e **nada é salvo**.
- Falha se: algum valor inválido é aceito.

**Caso 16 — Celular e tema claro**
1. Abra o site de teste e a aba "Publicar" num celular (ou com a janela estreita, 375 px) e também com o sistema no tema claro e no escuro.
- Deve acontecer: no celular o painel do chat ocupa a tela toda, o botão some enquanto está aberto e o X fecha; nenhuma rolagem horizontal; os dois temas ficam legíveis e o foco do teclado é visível.
- Falha se: o painel passa da tela, o texto fica ilegível em algum tema, ou o botão fica atrás do painel. (Este caso **não foi visto** pelo desenvolvimento: faz parte do que o QA precisa confirmar.)

**Caso 17 — Quem pode usar a aba**
1. Entre com a conta de usuário comum (não administrador) e abra a aba "Publicar" do mesmo agente; salve uma mudança de título. Depois saia e tente abrir a aba sem entrar.
- Deve acontecer: o usuário comum abre e salva; sem entrar, o sistema leva à tela de login.
- Falha se: o usuário comum é barrado, ou a aba abre sem login.

## 3. O que observar de colateral

- **Aba "Testar"** do mesmo agente: a conversa de teste do painel continua funcionando e **não** mostra as mensagens que visitantes mandaram pelo site.
- **Aba "Configurações" do agente:** a mensagem inicial que o chat mostra é a mesma desta aba; mudar lá muda no chat. Excluir o agente apaga também a configuração do chat.
- **Aba "Conhecimento":** agente sem fonte pronta responde só com as instruções; com fonte pronta, mostra o chip da fonte no chat.
- **Configurações, Integrações:** remover e recadastrar a chave afeta o chat de todos os agentes.
- **Tela de login e demais telas:** continuam sem poder ser emolduradas por outros sites (só a página do chat pode).
- **Contagem diária:** as mensagens de visitantes somam no limite diário de cada agente; as mensagens da prévia da aba "Publicar" e da aba "Testar" não somam.
- A lista pode estar incompleta: não há mapa de impacto calculado, a lista vem do que a mudança alcança.

## 4. Dado de teste sugerido

Tudo fictício: o "Assistente de exemplo" e a fonte "Política de troca e horário da Loja Exemplo" que já vêm na instalação de demonstração; perguntas como "Qual o horário de atendimento?" e "Como faço uma troca?"; um domínio de mentira (`exemplo.com`) para o caso 11; um aviso de privacidade qualquer ("As conversas podem ser guardadas para melhorar o atendimento"); a cor `#fafafa` no caso 8. Nenhum dado de pessoa real nas mensagens.

## 5. Ambiente e como chegar ao estado inicial

- **Onde testar:** numa máquina local, nunca em produção. Preparação (uma vez): `npm run setup`, depois `npm run build`. Suba o sistema com `npm run start` (porta 3000), passando por variável de ambiente, na mesma linha de comando, um segredo de sessão e uma chave de criptografia de teste e `TRUST_PROXY=1`; **não** coloque nada disso em arquivo do repositório. Quem preparou a máquina informa os valores de teste.
- **OpenRouter simulado:** `npx tsx tests/apoio/servir-falso.ts` imprime o endereço (aponte `OPENROUTER_BASE_URL` para ele ao subir o sistema) e a chave de teste a cadastrar em Configurações, Integrações.
- **Site de teste (outra origem):** `npx tsx tests/apoio/servir-site-de-teste.ts 4321 http://localhost:3000 agente-de-exemplo` e abra `http://localhost:4321/` (variações: `/esquerda`, `/cor`, `/iframe-direto`).
- **Contas:** as contas de demonstração estão no README do projeto (administrador e usuário comum); a senha está lá, não neste arquivo.
- **Estado inicial:** o agente de exemplo já vem com o chat publicado e sem restrição de sites; antes do caso 4, cadastre a chave de teste. Sem `TRUST_PROXY=1` todos os visitantes dividem um único limite por minuto, o que atrapalha os casos 4 a 6 depois do caso 12.

## 6. Critério de aprovação e de reprovação

```
APROVADO quando: os 17 casos passam; o botão aparece no site de teste de outra
origem, o chat responde aos poucos e a conversa volta ao recarregar; fora dos sites
permitidos o botão não aparece e a página do chat não abre no quadro; a décima
primeira mensagem do minuto e a mensagem acima do limite diário mostram as frases
dos casos 12 e 13; em nenhum erro o visitante vê palavra técnica; e as telas
vizinhas da seção 3 continuam como antes.

REPROVADO quando: qualquer caso falha, o chat aparece num site fora da lista,
um valor inválido é salvo, o visitante vê detalhe técnico ou mensagem de outro
visitante, ou alguma tela vizinha da seção 3 mudou de comportamento.
```

## 7. O que NÃO faz parte desta entrega

- O canal do Telegram, a leitura das conversas dos visitantes no painel (histórico), apagar conversas, definir por quanto tempo elas ficam guardadas e o registro de quem alterou o quê: são das próximas features.
- Imagem própria como avatar (só ícones prontos e iniciais), transferência para atendente humano e endereço próprio para o script.
- Distinguir cada visitante sem proxy: sem `TRUST_PROXY=1` o limite por minuto vale para o site inteiro; a aba "Publicar" avisa disso.
- O comportamento do modelo de IA real diante das fontes (a verificação usa um modelo simulado) e site de cliente com regras de segurança próprias que bloqueiem o chat (nesse caso o chat não aparece, e isso é esperado).
- Visual a 375 px, no tema claro e o botão Copiar não foram vistos pelo desenvolvimento: estão nos casos 2 e 16 para o QA.
