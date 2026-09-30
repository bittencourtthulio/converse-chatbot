# Camadas, lint e scripts

## Contrato de entrada

Pastas: `src/app` e `src/componentes` (apresentação), `src/servicos` (aplicação), `src/lib` (dados e infraestrutura), `src/estilos`. Direção declarada em `docs/stack/CONVENCOES.md:106-110`: apresentação importa serviços; serviços importam `src/lib`; `src/lib` não importa `src/app` nem `src/servicos`; apresentação não importa `src/lib/prisma`. ESLint: `eslint.config.mjs:3-7` ignora `.next`, `node_modules`, `src/gerado` e espalha `eslint-config-next`. Scripts em `package.json:5-16`.

## Contrato de saída

`npm run lint` roda `eslint .` (`package.json:9`). `npm run setup` executa `prisma generate && prisma db push && npm run db:seed` (`package.json:16`). `npm run db:migrate` executa `prisma migrate deploy` (`package.json:13`).

## Limites e cotas

NÃO DOCUMENTADO (não há limite de tamanho de arquivo nem de complexidade no lint).

## Erros conhecidos e tratamento

Violação de direção de camada hoje não gera erro em lugar nenhum (`docs/stack/LACUNAS.md:12`, lacuna 4). `db push` apaga tabelas virtuais FTS5 (`docs/stack/CONVENCOES.md:98`).

## Riscos para a nossa implementação

- `src/lib/sessao-servidor.ts:3-6` importa `@/servicos/autenticacao`, além de `next/headers` e `next/navigation`: uma regra "lib não importa serviços" acusaria esse arquivo. A solução (mover para outra pasta ou abrir exceção) é decisão da F2.
- `src/lib/sessao.ts` só importa `jose`, `@/lib/ambiente` e `@/lib/erros` (`src/lib/sessao.ts:1-3`): não viola.
- `src/componentes/Formulario.tsx:5` importa tipo de `@/app/acoes`; `src/app/acoes.ts:9-13` importa `@/lib/sessao-servidor` (não é `@/lib/prisma`): não viola a regra "apresentação não importa prisma".
- Serviços importam `@/lib/prisma` (`src/servicos/autenticacao.ts:2`) como manda a convenção.

## Fonte

`eslint.config.mjs`, `package.json`, `docs/stack/CONVENCOES.md`, `src/lib/sessao-servidor.ts`, `src/lib/sessao.ts` — acessados em 2026-09-30
