# Limites de uso: login e leitura pública

## Contrato de entrada

`criarLimitador(relogio = Date.now)` guarda os instantes das chamadas permitidas por chave em memória; a chamada que passaria do máximo é recusada e não entra na janela (`src/lib/limite-de-uso.ts:46-100`). Atenção: o valor padrão `Date.now` é a referência original capturada na definição; um relógio falso de teste (`vi.useFakeTimers`) não o alcança. `limitadorPadrao` é a instância do processo (`src/lib/limite-de-uso.ts:112`). `exigirLimiteDeLogin({ip, email}, limitador = limitadorPadrao)` aplica 20 por minuto por IP e 5 por minuto por IP+e-mail (e-mail normalizado), lança 429 `limite_excedido` com "Muitas tentativas. Tente de novo em N segundos." (`src/servicos/autenticacao.ts:28-48`). `autenticar` o chama com `ipDoCliente()` antes de `entrar` (`src/app/acoes.ts:65`). `ipDoCliente` devolve `desconhecido` sem `TRUST_PROXY=1` e o primeiro valor de `X-Forwarded-For` com ele (`src/lib/requisicao.ts:16-34`).

## Contrato de saída

`exigirLimiteDeIp({ip, agenteId}, limitador)`: 10 por minuto por IP+agente e 30 por minuto por IP, `ErroDeLimite` 429 com frase amigável e `retryAfterSegundos` (`src/servicos/chat-publico-limites.ts:32-52`). Hoje é chamada pelo POST (`conversarComoVisitante`, `src/servicos/chat-publico.ts:~118`) e pelo DELETE (`apagarConversasDoVisitante`, `src/servicos/chat-publico.ts:~207`), não pelo GET. A rota GET de `.../conversa` chama `retomarConversaDoVisitante(id, cabecalho)` sem IP nem limite (`src/app/api/publico/agentes/[id]/conversa/route.ts:14-22`). `erroPublico` traduz o 429 com `Retry-After` e frase única (`src/app/api/publico/resposta.ts:16-27`).

## Limites e cotas

Os números são de PR-36 (login) e PR-57 (chat público); em memória do processo (PR-05). A chave `chat:ip-agente` é compartilhada entre POST, DELETE e o futuro GET.

## Erros conhecidos e tratamento

Tests de função existem: `tests/limite-de-login.test.ts` (só `exigirLimiteDeLogin` com limitador injetado), `tests/chat-publico-limites.test.ts`, `tests/publico-conversar-rota.test.ts:211-247` (429 na rota POST). Nenhum teste executa a ação `autenticar` com o limite (achado A-01), e nenhum cobre o limite do GET da conversa (achado 4 de `premissas-35-70.md`). Os testes de ação existentes simulam as bordas do framework com `vi.mock` de `@/app/sessao-servidor`, `next/navigation` e `next/cache` (`tests/telegram-acoes.test.ts:12-35`).

## Riscos para a nossa implementação

Sem um relógio que o teste alcance, o reinício do limite da ação não é provável sem esperar 60 s reais. Reaproveitar a chave `chat:ip-agente` no GET consome o orçamento de mensagens do mesmo visitante (a abertura do chat conta uma vez por IP+agente por minuto). A resposta de bloqueio do GET precisa seguir `erroPublico`, sem vazar nada do agente.

## Fonte

`src/lib/limite-de-uso.ts`, `src/servicos/autenticacao.ts`, `src/app/acoes.ts`, `src/lib/requisicao.ts`, `src/servicos/chat-publico-limites.ts`, `src/servicos/chat-publico.ts`, `src/app/api/publico/agentes/[id]/conversa/route.ts`, `tests/limite-de-login.test.ts`, `tests/telegram-acoes.test.ts` — acessado em 2026-10-01
