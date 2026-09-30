# Turno de chat, prompt e protocolo SSE

## Contrato de entrada

- `responderMensagem(entrada)` (`src/servicos/chat.ts:82`) é um `AsyncGenerator<EventoDoChat>`; eventos `inicio`, `trecho`, `fim` (`chat.ts:32-36`). Valida a mensagem (1 a 4000), lê o agente, exige a chave do OpenRouter, cria ou obtém a conversa, grava a pergunta, emite `inicio`, monta o histórico (`listarMensagens`) e chama `conversar` do adaptador (`src/lib/openrouter.ts`).
- Prompt: `montarPrompt({instrucoes, historico})` em `src/servicos/chat-prompt.ts:48`; `montarMensagemDeSistema` junta instruções, `LINHA_DE_CONDUTA` e `materialDeConsulta` (ponto de extensão da FT-05, `chat-prompt.ts:15-22`). Histórico: até 20 mensagens e 24000 caracteres (`chat-prompt.ts:5-8`, PR-41).
- Handler: `src/app/api/agentes/[id]/conversar/route.ts` traduz o gerador com `fluxoDeEventos` (`src/app/eventos-sse.ts:29`): repassa `trecho` e `fim`, descarta `inicio`, converte exceção em evento `erro`.
- Leitor do navegador: `lerEventos` (`src/componentes/leitor-de-sse.ts:62`) só aceita `trecho`, `fim` e `erro`; evento de nome desconhecido é ignorado (`interpretar` devolve `'ignorar'`, `leitor-de-sse.ts:29`), o que torna um evento novo `fontes` compatível com clientes antigos.
- `Mensagem.fontes` é `String?` (`prisma/schema.prisma`, modelo `Mensagem`); `anexarMensagem` aceita `fontes` (`src/servicos/conversas.ts:66`) e `MensagemVisivel.fontes` o devolve.

## Contrato de saída

- Hoje a resposta do assistente é gravada só quando o stream termina (PR-41) e o `fim` leva `{conversaId, mensagemId, tamanho}`. `retomarDoPainel` devolve as mensagens como `{id, papel, conteudo}`, sem `fontes` (`conversas.ts:170-185`); a retomada de fontes exige estendê-la.
- Testes do turno reutilizam `tests/apoio/chat.ts` (`cenarioDeChat`, `coletar`) e o OpenRouter falso (`tests/apoio/openrouter-falso.ts`), que registra as requisições (`requisicoes[].corpo`), permitindo capturar a mensagem de sistema enviada.

## Limites e cotas

- `maxTokens` 1024 (`MAX_TOKENS_RESPOSTA`), mensagem 4000, histórico 20 e 24000 caracteres; material de consulta: sem orçamento hoje (a FT-05 define; o brief sugere 6.000 caracteres e 6 trechos).

## Erros conhecidos e tratamento

- Erro de aplicação com status abaixo de 500 (exceto 429) antes do `inicio` é relançado sem log; os demais vão ao log em uma linha JSON com correlação (`chat.ts:70-85`, PR-42). Falha ao gravar as fontes não pode virar erro do turno (brief, item 4).

## Riscos para a nossa implementação

- O evento `fontes` tem de sair antes do `fim`, e o `fim` encerra o stream (`eventos-sse.ts:47-52`): o tradutor precisa repassar o novo evento sem encerrar.
- `citada` depende de a resposta final conter `[n]`; só é conhecida ao fim do stream.
- O conteúdo dos trechos vem de arquivos de terceiros (PR-15): a injeção é vetor real; o prompt precisa de marcador com identificador aleatório e higienização do marcador de fechamento.
- O comportamento do modelo real não é testável (testes nunca chamam a rede real, PR-26): só a estrutura do prompt.
- Pergunta de continuação ("e o preço?") não tem termos: precisa da pergunta anterior, que está no histórico da conversa (`listarMensagens`).

## Fonte

`src/servicos/chat.ts`, `src/servicos/chat-prompt.ts`, `src/servicos/conversas.ts`, `src/app/eventos-sse.ts`, `src/componentes/leitor-de-sse.ts`, `src/app/api/agentes/[id]/conversar/route.ts`, `tests/apoio/chat.ts`, `tests/apoio/openrouter-falso.ts` — acessados em 2026-09-30.
