# Turno de conversa, conversas e limites reutilizáveis (modo INTERNO)

## 1. Contrato de entrada

- `responderMensagem(entrada)` em `src/servicos/chat.ts:112`: `EntradaDoTurno` (`chat.ts:54-66`) com `agenteId`, `conversaId?`, `canal` (`'painel' | 'widget' | 'telegram'`, `src/servicos/conversas.ts:12`), `identificadorExterno?` ("Visitante (widget) ou chat (Telegram)", `chat.ts:60`), `criadoPorId?`, `mensagem` (1 a 4000, `chat.ts:46`), `sinal?`.
- `conversas.criar` aceita `identificadorExterno` até 200 caracteres e só deriva `titulo` da `primeiraMensagem` (`conversas.ts:72-90`); não há parâmetro de título explícito: para "Telegram: Nome" a feature precisa atualizar o título depois, ou acrescentar o parâmetro (decisão da F2).
- `listar({agenteId, canal, identificadorExterno, limite})` (`conversas.ts:121-138`), ordenado por `atualizadoEm` decrescente; `obter(id, dono)` confere agente, canal e identificador (`conversas.ts:107-118`).
- `exigirLimiteDeIp` (`src/servicos/chat-publico-limites.ts:41`) usa chaves `chat:ip-agente:` e `chat:ip:` fixas no código (não parametrizável por balde hoje); `criarLimitador(relogio)` em `src/lib/limite-de-uso.ts:46`, `Limitador.verificarLimite(chave, {max, janelaMs})`.
- `exigirLimiteDaConversa(conversaId)` conta mensagens `user` (60, `chat-publico-limites.ts:62`); `exigirTetoDiario` conta só `conversa.canal = 'widget'` (`chat-publico-limites.ts:84-86`): não serve ao Telegram sem parametrizar o canal.

## 2. Contrato de saída

- Eventos `inicio`, `trecho`, `fontes`, `fim` (`chat.ts:41-48`); `fontes` = `FonteDaResposta[]` (`fonteId`, `titulo`, `citada`, `trechos[{n, posicao, trechoTexto}]`).
- Erros: `ErroDeAplicacao` com `status` e `codigo`; `mensagemParaVisitante()` é a frase única "Não consegui responder agora. Tente novamente em instantes." (`src/servicos/chat-erros.ts:11`).
- `ErroDeLimite` (`chat-publico-limites.ts:21`) com `retryAfterSegundos`.

## 3. Limites e cotas

- Mensagem: 4000 no turno; o canal público do widget usa 1000 (`chat-publico.ts:30`). Histórico: 20 mensagens (`chat-prompt.ts:7`). Limites do widget: 10/min por IP e agente, 30/min por IP, 60 por conversa (`chat-publico-limites.ts:14-19`).
- Resposta do modelo até `MAX_TOKENS_RESPOSTA` (padrão 1024, `src/lib/ambiente.ts:81`); logo cabe em 4096 caracteres quase sempre, mas a divisão em pedaços é exigida pelo escopo.

## 4. Erros conhecidos e tratamento

- Antes do evento `inicio` nada foi gravado; depois, a pergunta está gravada e a resposta não (`chat.ts:112-117`). Erro do provedor, sem chave: lançam `ErroDeAplicacao`; o canal do Telegram deve responder `mensagemParaVisitante`, nunca o texto do operador.
- `erroParaVisitante` (`chat-publico.ts:84`) mantém 404/413/422 com a mensagem própria; para o Telegram só a frase única serve (o usuário não vê 4xx de formulário).

## 5. Riscos para a nossa implementação

- `exigirTetoDiario` e `exigirLimiteDeIp` são presos ao widget; reuso exige parametrizar (balde e canal) sem mudar o comportamento atual do widget (testes `tests/chat-publico-limites.test.ts` devem seguir verdes).
- Limitador em memória vale por processo (PR-05); a exclusão mútua por chat também será por processo.
- O turno grava a pergunta antes do provedor: reenvio do mesmo update sem dedupe duplicaria pergunta e resposta.
- `Conversa.titulo` vem da primeira mensagem (conteúdo do usuário); gravar o nome público ("Telegram: Nome") exige cuidado de privacidade (PR-18: nada além do nome público).

## 6. Fonte

`src/servicos/chat.ts`, `src/servicos/conversas.ts`, `src/servicos/chat-publico.ts`, `src/servicos/chat-publico-limites.ts`, `src/servicos/chat-erros.ts`, `src/lib/limite-de-uso.ts`, acesso em 2026-09-30.
