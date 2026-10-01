# Handlers, painel, abas e apoio de teste (modo INTERNO)

## 1. Contrato de entrada

- Handler público: `src/app/api/publico/agentes/[id]/conversar/route.ts` (fino, `dynamic = 'force-dynamic'`, corpo limitado a 8 KB, `route.ts:14-31`); erro público: `src/app/api/publico/resposta.ts:11`.
- Ordem do webhook: a rota recebe `POST` do Telegram (sem sessão, sem `Origin` de navegador); precisa ler o corpo bruto, conferir o cabeçalho, validar com zod no serviço.
- `after` do Next: `import { after } from 'next/server'`, roda depois que a resposta termina, "mesmo se a resposta não completou"; usável em route handlers; duração limitada pela plataforma (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md:8-12,45-48`). Chamadas a `cookies()`/`headers()` dentro dele valem em route handlers (`after.md:60-85`).
- Aba: lista única `src/componentes/abas-do-agente.ts:12-17` ("Canais (FT-07)" já prevista no comentário, `abas-do-agente.ts:3`); subrota em `src/app/(sistema)/agentes/[id]/<caminho>`; exemplo de página servidor: `src/app/(sistema)/agentes/[id]/publicar/page.tsx` (usa `exigirUsuario`, `carregarAgente`, ação de servidor de `src/app/acoes.ts`, `loading.tsx` ao lado).
- IP: `ipDoCliente` (`src/lib/requisicao.ts:27`) só serve a Server Actions e rotas com `headers()`; não se aplica ao Telegram (PR-16 no briefing).
- Cabeçalhos: `next.config.ts:24-27` aplica `X-Frame-Options: DENY` a tudo exceto `/embed`; o webhook não é emoldurado, sem efeito.
- Teste de servidor: `tests/apoio/servidor.ts:15` (`subirServidor(porta, env)` usa `next start`, `NODE_ENV=production`, exige `npm run build`); simulado do OpenRouter: `tests/apoio/openrouter-falso.ts:90` (`iniciarOpenRouterFalso`, `configurar`, `requisicoes`, `fechar`), `CHAVE_VALIDA` (`openrouter-falso.ts:30`); `tests/apoio/chat.ts:12` (`cenarioDeChat`) monta agente e chave para os testes do turno.

## 2. Contrato de saída

- O handler do Telegram deve responder 200 vazio rápido; 401 sem corpo informativo para segredo ausente/errado. Telegram não lê o corpo da resposta de sucesso.

## 3. Limites e cotas

- Testes: `testTimeout` 30 s, `hookTimeout` 180 s, `fileParallelism: false` (`vitest.config.ts:9-14`, citado em `docs/stack/CONVENCOES.md`); um `next start` por arquivo de rota.
- `after` herda o limite de duração da plataforma; `NÃO DOCUMENTADO` o limite em `next start` (processo Node de longa vida: sem limite prático conhecido).

## 4. Erros conhecidos e tratamento

- Erro dentro de `after` não vira resposta HTTP: precisa de captura própria e log sem conteúdo (PR-42).
- Handler: erro inesperado nunca vaza pilha (`docs/stack/CONVENCOES.md` seção 6, sinalização de erro).

## 5. Riscos para a nossa implementação

- O servidor de produção do teste roda `after` de verdade: o teste de rota deve esperar a chamada ao Telegram simulado (`esperar` em `tests/apoio/servidor.ts:39`).
- A resposta pós-200 compete com reinício do processo: update perdido se o servidor cai entre o 200 e o envio; o Telegram não reenvia (já recebeu 200). Limite conhecido a registrar.
- `src/proxy.ts` roda só em `/embed/:path*` (`proxy.ts:28`): não intercepta `/api/telegram`.
- Tema e estados: toda tela busca-dado tem vazio, carregando e erro; tokens em `src/estilos/tokens.css`, sem cor literal (`tests/tokens.test.ts`).

## 6. Fonte

`src/app/api/publico/`, `src/componentes/abas-do-agente.ts`, `src/app/(sistema)/agentes/[id]/publicar/page.tsx`, `src/lib/requisicao.ts`, `next.config.ts`, `src/proxy.ts`, `tests/apoio/`, `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md`, acesso em 2026-09-30.
