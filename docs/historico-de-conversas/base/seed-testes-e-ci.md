# Seed, apoio de teste, build e CI (modo INTERNO)

## 1. Contrato de entrada

- `prisma/seed.ts`: recusa `NODE_ENV=production` (`prisma/seed.ts:77`), cria duas contas de demonstração (`admin@exemplo.local`, `usuario@exemplo.local`, senha de demonstração), o agente `agente-de-exemplo`, o chat publicado e a fonte `fonte-de-exemplo` com id fixo e criação só se ausente (idempotente). O módulo usa imports com extensão `.js` e sem alias `@/`.
- `tests/seed.test.ts` roda a seed contra o banco de teste; o texto da fonte de exemplo cita horário, troca, entrega e pagamento (`prisma/seed.ts`, constante `FONTE_DE_EXEMPLO`), base plausível para as fontes das duas conversas fictícias.
- Apoio de teste: `tests/ajuda.ts` (`criarUsuario`, `criarAdmin`, `limparBanco`), `tests/setup.ts` (um `prisma/test.db` por arquivo de teste, migrations aplicadas), `tests/apoio/servidor.ts` (`subirServidor`, sobe `next start`), `tests/apoio/openrouter-falso.ts`, `tests/apoio/telegram-falso.ts`, `tests/apoio/servir-telegram-falso.ts`, `tests/apoio/servir-falso.ts`, `tests/apoio/servir-site-de-teste.ts`.
- Ambiente de teste `node`; componente renderiza por `renderToStaticMarkup`; interação só em módulo puro; `happy-dom` por arquivo (`// @vitest-environment happy-dom`).
- Comandos: `npx tsc --noEmit`, `npm run lint`, `npm run build` (exige `DATABASE_URL` e `JWT_SECRET`), `npm test` (rotas exigem build antes), `npm audit --audit-level=high` (`docs/stack/CONVENCOES.md`, seção 2).

## 2. Contrato de saída

- Total de testes da suíte antes desta feature: 2010 (`docs/projeto/MAPA.md`, FT-08).

## 3. Limites e cotas

- `testTimeout` 30 s e `hookTimeout` 180 s; `fileParallelism: false` (`vitest.config.ts`).

## 4. Erros conhecidos e tratamento

- Contar consultas ao banco num teste: o repositório não tem exemplo; há `tests/recuperacao-desempenho.test.ts` para desempenho de busca (a F3 deve ler antes de decidir o método).

## 5. Riscos para a nossa implementação

- Alterar a seed com conversas novas muda o que `tests/seed.test.ts` conta; atualizar e declarar.
- `tests/rotas.test.ts` sobe o servidor de produção do último `npm run build`: rodar o build antes dos testes de rota.
- Agregação por dia no fuso do servidor depende de `TZ`; testes de borda precisam fixar `TZ` ou injetar o instante (o repositório injeta relógio por parâmetro: `docs/stack/CONVENCOES.md`, linha "Relógio").

## 6. Fonte

`prisma/seed.ts`, `tests/ajuda.ts`, `tests/seed.test.ts`, `tests/apoio/`, `vitest.config.ts`, `docs/stack/CONVENCOES.md` (acesso em 2026-10-01).
