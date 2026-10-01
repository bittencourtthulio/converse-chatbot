---
expx_schema: 1
expx_tool: buildx
kind: design_verificacao
projeto_id: plataforma-chatbot-ia
data: 2026-10-01
feature: FT-14
---

# Verificação visual da FT-14

## Como foi feito

Build de produção do próprio repositório, banco novo e descartável (migrado e semeado), servidor `next start` numa porta livre e segredos gerados na linha de comando. Chrome sem janela (`--headless=new`, perfil temporário, depuração por porta aleatória, sem tocar em navegador aberto) controlado por um roteiro pequeno que faz login pela tela, emula `prefers-color-scheme` e o tamanho da janela, captura PNG e registra qualquer requisição que saia da origem do servidor. O servidor e os arquivos temporários foram encerrados por PID depois. As capturas ficam em `docs/design/capturas/`.

## O que foi visto

| Tela | Claro | Escuro | 375px |
|---|---|---|---|
| Landing `/` (anônimo) | sim, 1440 inteira e hero | sim, 1440 inteira | sim, inteira, claro e escuro |
| Login | sim | sim | sim (escuro) |
| Painel | sim | sim | sim |
| Lista de agentes | sim | não | não |
| Aba Testar | sim | sim | não |
| Conversas | sim | sim | não |
| Configurações > Usuários | sim | não | não |
| Chat embutido `/embed/agente-de-exemplo` | sim | sim | 420px de largura |
| Página não encontrada | sim | não | não |

Em todas as capturas medidas, `scrollWidth` igual a `clientWidth` (sem rolagem lateral) em 1440, 420 e 375px. Nenhuma requisição saiu da origem do servidor (lista de externos vazia em todas as execuções), inclusive fontes.

## O que a crítica achou e foi corrigido

1. **Botão "Entrar" do hero sumia** (texto preto sobre fundo preto): `.lp a { color: inherit }` vencia `.primario` por especificidade. Corrigido com `.lp a:not(.botao)`.
2. **O cartão do hero ficava solto dentro do painel**: sem relação com a borda. Agora invade o painel pela esquerda (`left: -56px`, painel sem `overflow: hidden`), o que liga as duas colunas, e a ousadia do hero ficou mais clara.
3. **Cubos pequenos demais para a célula** (34 de lado num quadro de 220): subiram para 40.
4. **Seções consecutivas sem linha** (canais e conhecimento, como funciona e segurança) pareciam um bloco só: `.lp-faixa + .lp-faixa` ganhou a linha fina.
5. **Item ativo do menu lateral em azul sobre zinc** perdia força: ficou texto forte sobre zinc; o azul ficou para link, foco e seleção.
6. **Grade do login com máscara na tela toda** apagaria o cartão: a máscara foi para um `::before`, e o cartão fica acima.

## O que não pôde ser visto

- Resposta do agente em streaming (aba Testar com bolhas de resposta reais e fontes citadas) e o chat embutido conversando: exigiriam uma chave do OpenRouter ou o simulado de testes; vi só a tela vazia e as bolhas de boas-vindas. As bolhas do usuário e do agente foram conferidas na landing (mesma lógica de tokens) e nos testes de componente.
- Estados de passar o mouse e de foco por teclado nas telas autenticadas: só nos testes e na leitura do CSS; o anel de foco azul aparece no campo de mensagem da aba Testar.
- Telas de Configurações além de Usuários (Integrações, Privacidade, Auditoria, Sistema), editar agente, Conhecimento, Canais, Publicar em 375px e as demais telas no escuro: usam os mesmos componentes e tokens das capturas, mas não foram abertas uma a uma. A página Publicar (claro) foi capturada só para conferir amostras e prévia durante o trabalho e não foi guardada.
- Safari, Firefox e aparelho físico: só Chrome sem janela.
- `prefers-reduced-motion`: provado por teste do CSS, não por captura.
- A cor do chat embutido do agente de exemplo é a índigo já salva no banco (escolha do usuário), por isso o cabeçalho do chat nas capturas é roxo-azulado e não o azul novo.
