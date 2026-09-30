# API pública, turno de chat, limites e conversas

## Contrato de entrada

- `responderMensagem(entrada)` (`src/servicos/chat.ts`) aceita `canal: 'widget'`, `identificadorExterno` (visitante), `conversaId?`, `mensagem` (1 a 4000, validada no serviço), `sinal`. Emite `inicio`, `trecho`, `fontes`, `fim`; lança `ErroDeAplicacao` antes do `inicio` (validação, agente inexistente, sem chave 409) e depois dele a pergunta já está gravada (PR-41).
- Conversa: `obter(id, dono)` em `src/servicos/conversas.ts` só entrega a conversa se `agenteId`, `canal` e `identificadorExterno` conferem; senão `naoEncontrado` (404 sem revelar a existência, PR-43). `criar` grava canal e `identificadorExterno` (até 200). `listar({agenteId, canal, identificadorExterno, limite})` ordena por `atualizadoEm` desc; `listarMensagens(conversaId, limite)` devolve as últimas N em ordem cronológica; `lerFontesGravadas` (`src/servicos/fontes-da-resposta.ts`) lê `Mensagem.fontes`.
- Tradução SSE: `fluxoDeEventos(gerador)` (`src/app/eventos-sse.ts`) repassa `trecho`/`fontes`/`fim`, descarta `inicio`, converte exceção em evento `erro` **com a mensagem do operador** (`mensagemParaOperador`): o canal público precisa de outro mapeador de erro.
- `mensagemParaVisitante(_erro?)` (`src/servicos/chat-erros.ts`) devolve sempre "Não consegui responder agora. Tente novamente em instantes."
- Limite de uso: `criarLimitador(relogio)` e `verificarLimite(chave, {max, janelaMs})` (`src/lib/limite-de-uso.ts`), janela deslizante em memória; só chamada permitida entra na lista; devolve `{permitido, restante, reiniciaEmMs}`. `limiteExcedido(acao, ms)` em `src/lib/erros.ts` monta 429 com mensagem de login (não serve ao visitante).
- IP: `ipDoCliente()` (`src/lib/requisicao.ts`) lê `headers()` do Next; `X-Forwarded-For` só com `TRUST_PROXY=1` (PR-36), senão `desconhecido`.

## Contrato de saída

- Handler existente `src/app/api/agentes/[id]/conversar/route.ts`: erro antes do `inicio` vira JSON com status; depois, `text/event-stream` com `Cache-Control: no-store, no-transform`, `X-Accel-Buffering: no`, `X-Conversa-Id` (PR-43). O evento `fontes` leva `[{fonteId, titulo, trechos:[{n,posicao,trechoTexto}], citada}]` (PR-53), incluindo trecho interno: o canal público deve reduzir.
- `Mensagem` tem `papel` `user|assistant`, `criadoEm`, índice `(conversaId, criadoEm)`; `Conversa` tem `canal`, `identificadorExterno`, `agenteId`, índice `(agenteId, atualizadoEm)` (`prisma/schema.prisma`). O teto diário conta `Mensagem` `papel='user'` de conversas `canal='widget'` do agente no dia.

## Limites e cotas

- Mensagem do painel até 4000; a pedida para o visitante é 1000. Histórico do prompt 20 mensagens e 24000 caracteres (PR-41). `maxTokens` 1024. Limite de login 5/min por IP e e-mail, 20/min por IP (PR-36). Pedido da FT-06: 10/min por IP e agente, 30/min por IP, 60 mensagens por conversa, teto diário configurável.

## Erros conhecidos e tratamento

- 404 para agente inexistente e para conversa de outro dono, sem distinção. Erro inesperado nunca vaza pilha; o erro do provedor vira frase fixa ao visitante. Sem chave do OpenRouter o turno lança 409 `chat_sem_chave`: ao visitante vira a mesma frase genérica.

## Riscos para a nossa implementação

- Sem `TRUST_PROXY=1` todos os visitantes compartilham o IP `desconhecido` e o limite de 10/min por agente vale para o site inteiro; precisa constar na tela Publicar e na documentação.
- O limite em memória vale por processo (PR-05, PR-36).
- A pergunta do visitante é gravada antes da chamada ao provedor: o teto diário conta tentativas que falharam.
- Corrida: duas requisições simultâneas podem passar pelo teto diário por uma mensagem; aceitável e registrado.
- `visitanteId` é opaco e sem autenticação: quem o conhece lê a conversa; 16 a 64 caracteres aleatórios tornam-no inadivinhável, mas não é credencial.

## Fonte

`src/servicos/chat.ts`, `src/servicos/conversas.ts`, `src/servicos/chat-erros.ts`, `src/servicos/fontes-da-resposta.ts`, `src/app/eventos-sse.ts`, `src/app/api/agentes/[id]/conversar/route.ts`, `src/lib/limite-de-uso.ts`, `src/lib/requisicao.ts`, `src/lib/erros.ts`, `prisma/schema.prisma`, `docs/projeto/PREMISSAS.md` (PR-16, PR-36, PR-41, PR-43, PR-53) — acessados em 2026-09-30.
