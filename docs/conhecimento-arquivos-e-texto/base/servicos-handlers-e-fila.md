# Serviços, handlers, upload e tarefa em segundo plano

## Contrato de entrada

- Serviço: funções em `src/servicos/<assunto>.ts` recebem o autor (`UsuarioAutenticado`) e a entrada crua, validam com zod (`validar` em `src/servicos/agentes.ts`) e lançam `ErroDeAplicacao` (`src/lib/erros.ts`: 401, 403, 404, 409, 422, 429 e `erroDoProvedor`). Nada de `next/*` nem `src/app` (`eslint.config.mjs`, `tests/camadas.test.ts`).
- Handler: `src/app/api/agentes/[id]/conversar/route.ts` é o único existente: `export const dynamic = 'force-dynamic'`, sessão por `usuarioAtual()` (`src/app/sessao-servidor.ts`), 401 em JSON, erro antes de gravar vira JSON com o status do erro.
- Upload: `request.formData()` é o método documentado do Route Handler (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`, seção "Request Body FormData").
- Segundo plano: `src/instrumentation.ts` na raiz de `src` é chamado uma vez ao subir o servidor, e `register` "must complete before the server is ready to handle requests"; `process.env.NEXT_RUNTIME === 'nodejs'` distingue o runtime (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md` e `.../02-guides/instrumentation.md`). O arquivo não existe no repositório.

## Contrato de saída

Serviços devolvem objetos simples (Prisma) e nunca Response. Handler traduz para `Response.json(..., { status })`. O teste de handler sobe o servidor de produção (`next start`) com o OpenRouter simulado (`tests/conversar-rota.test.ts`, `tests/apoio/servir-falso.ts`, `tests/apoio/openrouter-falso.ts`) e exige `npm run build` antes (`docs/stack/CONVENCOES.md` seção 2).

## Limites e cotas

Tamanho máximo do corpo de uma requisição a Route Handler no Next 16: `NÃO DOCUMENTADO` em `route.md` (mesma lacuna da FT-03). O limite `proxyClientMaxBodySize` (10 MB por padrão, `.../05-config/01-next-config-js/proxyClientMaxBodySize.md`) vale só quando existe `proxy` (middleware); o projeto não tem `proxy.ts` (`docs/conversa-de-teste/RELATORIO-FEATURE.md`, desvios). Limite de memória para `formData()` de arquivos grandes: `NÃO DOCUMENTADO`; `request.formData()` carrega o corpo em memória, então o teto de `MAX_UPLOAD_MB` por arquivo e o teto do corpo total precisam ser conferidos por `Content-Length` antes da leitura.

## Erros conhecidos e tratamento

Erro inesperado nunca vaza pilha: identificador de correlação curto e linha JSON em `console.error` (PR-42, `src/servicos/chat-erros.ts`). Concorrência de processamento e servidor recém-subido: `NÃO DOCUMENTADO` (sem exemplo no repositório); `instrumentation.ts` roda também na etapa de build? `NÃO DOCUMENTADO` no trecho lido (o guia diz "quando uma nova instância do servidor é iniciada").

## Riscos para a nossa implementação

- `register()` que não termina bloqueia o servidor: a retomada da fila precisa ser disparada sem `await` do trabalho todo.
- Em `next dev`, hot reload pode chamar `register` de novo e duplicar a fila; a fila precisa ser um singleton protegido por chave no `globalThis`.
- O teste de rota precisa de `STORAGE_DIR` temporário apontado no ambiente do processo `next start` e de banco de teste (mesmo padrão de `DATABASE_URL`).
- Um processo só (PR-05): duas instâncias processariam a mesma fonte; fica declarado como limite da premissa.

## Fonte

`src/servicos/agentes.ts`, `src/lib/erros.ts`, `src/app/api/agentes/[id]/conversar/route.ts`, `src/app/sessao-servidor.ts`, `tests/conversar-rota.test.ts`, `tests/apoio/`, documentação do Next 16 em `node_modules/next/dist/docs/01-app/` — acessados em 2026-09-30.
