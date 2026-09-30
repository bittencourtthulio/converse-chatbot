# Testes e banco

## Contrato de entrada

Vitest 4.1.11 (`package.json`), `include: tests/**/*.test.ts`, `setupFiles: tests/setup.ts`, `fileParallelism: false`, `testTimeout: 30000`, `hookTimeout: 180000` (`vitest.config.ts:5-15`). `tests/setup.ts` define `DATABASE_URL`, `JWT_SECRET` e `JWT_TTL_SEGUNDOS` de teste; `beforeAll` roda `npx prisma migrate deploy` num arquivo `prisma/test.db`, apagado ao fim. Ajudantes em `tests/ajuda.ts`: `criarUsuario`, `criarAdmin`, `limparBanco`.

## Contrato de saída

61 testes na suíte, 4 arquivos: `autenticacao` (13 `it`), `perfil` (14), `usuarios` (21), `rotas` (9 blocos `it`/`it.each`, que se expandem em mais casos). Contagem oficial do B2: 61 passaram (`docs/stack/CONVENCOES.md:40`).

## Limites e cotas

Porta do servidor de produção nos testes: 3178 (`tests/rotas.test.ts:20`). Espera de subida: 60 tentativas de 500 ms (`tests/rotas.test.ts:24-32`).

## Erros conhecidos e tratamento

`tests/rotas.test.ts` sobe `next start`, que precisa de build prévio (`.next`); o `spawn` só chama `next start` (linhas 47-51) e não faz build. No CI, `npm run build` roda antes de `npm test`.

## Riscos para a nossa implementação

- Testes de rota dependem de texto da interface (ver `interface-atual.md`).
- O módulo de limite de uso, com relógio injetável, é testado sem servidor, em `tests/limite-de-uso.test.ts` (convenção `<assunto>.test.ts`).
- A ação de login depende de `next/headers`; o teste do limite no login deve ir por função pura ou pelo serviço, não pela ação.
- Teste de cabeçalhos fica em `tests/rotas.test.ts` para aproveitar o servidor que já sobe.

## Fonte

`vitest.config.ts`, `tests/setup.ts`, `tests/rotas.test.ts`, `tests/ajuda.ts`, `tests/autenticacao.test.ts` — acessados em 2026-09-30
