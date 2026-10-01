# O que cada canal guarda de dado pessoal e o rótulo do interlocutor (modo INTERNO)

## 1. Contrato de entrada

- Widget: `canal = 'widget'`, `identificadorExterno` = `visitanteId` (16 a 64 caracteres `[A-Za-z0-9_-]`, gerado no navegador), `criadoPorId` nulo, `titulo` com os 60 primeiros caracteres da primeira mensagem (`docs/chat-embutido/RELATORIO-FEATURE.md`, seção "o que a próxima feature precisa saber"; `src/servicos/chat-publico.ts:175`).
- Telegram: `canal = 'telegram'`, `identificadorExterno` = `String(chat.id)`, `titulo` = `Telegram: <nome público>` (até 60 caracteres) ou `Telegram: contato`; sem `@usuario` (`docs/canal-telegram/RELATORIO-FEATURE.md`; `src/servicos/telegram-atendimento.ts:80-95`).
- Painel: `canal = 'painel'`, `criadoPorId` = usuário logado, `titulo` da primeira mensagem (`src/servicos/chat.ts`, via `criar`).

## 2. Contrato de saída

- Rótulo do interlocutor pedido pelo briefing: widget "Visitante " + 6 primeiros caracteres do `visitanteId`; telegram = `titulo`; painel = nome do usuário (`Usuario.nome`, `prisma/schema.prisma:16`). Conversa de painel cujo usuário foi removido (`SetNull`) não tem nome: o rótulo da feature será "Usuário removido" (decisão da F2).
- Pontos de extensão que a FT-10 liga: `aoAlterarCanal(ouvinte)` em `src/servicos/canal-telegram.ts:29` recebe `{ acao: 'conectar'|'desconectar'|'pausar'|'retomar'|'limite', agenteId, usuarioId }`, nunca token nem conteúdo (`docs/stack/CONVENCOES.md`, linha "Canal por agente e segredo do webhook").

## 3. Limites e cotas

- Teto diário por agente e canal, 10 mensagens por minuto por chat e 60 por conversa: `src/servicos/chat-publico-limites.ts`, `src/servicos/telegram-limites.ts` (não mudam nesta feature).

## 4. Erros conhecidos e tratamento

- Desconectar o bot do Telegram não apaga conversas (`docs/canal-telegram/RELATORIO-FEATURE.md`); o histórico continua legível e o link para o agente continua válido enquanto o agente existir.

## 5. Riscos para a nossa implementação

- Dado pessoal: `visitanteId` completo e o id do chat do Telegram não devem aparecer na interface nem no nome do arquivo exportado (PR-18, `docs/projeto/PREMISSAS.md:250`); só o rótulo mascarado aparece. Texto livre das mensagens pode ter dado pessoal por natureza; o histórico é visível a qualquer usuário autenticado (PR-12).
- A FT-10 precisará apagar por `identificadorExterno` (visitante ou chat): a exclusão por conversa desta feature não cobre "todas as conversas deste visitante".
- Conteúdo de visitante é não confiável: `<script>` e `<img onerror>` precisam sair como texto.

## 6. Fonte

`docs/chat-embutido/RELATORIO-FEATURE.md`, `docs/canal-telegram/RELATORIO-FEATURE.md`, `src/servicos/chat-publico.ts`, `src/servicos/telegram-atendimento.ts`, `src/servicos/canal-telegram.ts`, `docs/projeto/PREMISSAS.md` (acesso em 2026-10-01).
