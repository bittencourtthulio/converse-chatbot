# Ambiente e configuração

## Contrato de entrada

`src/lib/ambiente.ts:25-35` expõe `jwtSecret` (obrigatória), `jwtTtlSegundos` (padrão 900) e `ehProducao`; funções `obrigatoria` e `inteiroComPadrao` (linhas 4-23). `.env.example` documenta `DATABASE_URL`, `JWT_SECRET`, `JWT_TTL_SEGUNDOS`. `next.config.ts` só define `reactStrictMode: true`. Seed: `prisma/seed.ts` cria `admin@exemplo.local` e `usuario@exemplo.local` com senha `demo1234` por `upsert` com `update: {}`; recusa rodar com `NODE_ENV=production`. `.gitignore` ignora o arquivo de segredos, `*.db`, `storage/`, `backups/`, `src/gerado/`.

## Contrato de saída

`ambiente.jwtSecret` lança `Error` com o nome da variável quando ausente ou vazia (`ambiente.ts:4-12`). A seed imprime as contas de demonstração.

## Limites e cotas

`inteiroComPadrao` exige inteiro positivo (`ambiente.ts:14-21`). Demais limites: `NÃO DOCUMENTADO`.

## Erros conhecidos e tratamento

Ausência de `DATABASE_URL` lança em `src/lib/prisma.ts:8-12` e na seed. O build exige `DATABASE_URL` e `JWT_SECRET` no ambiente (`docs/stack/CONVENCOES.md:47`).

## Riscos para a nossa implementação

- `APP_NAME` é lido em `src/lib/ambiente.ts` e usado na metadata do `layout.tsx`, que roda no build: o padrão "Converse" precisa existir sem a variável, para o build não falhar.
- Cabeçalhos de segurança entram em `next.config.ts` (`headers()`); `X-Frame-Options: DENY` será sobrescrito na FT-06 para o iframe do chat.
- O teste de cabeçalhos usa o servidor de produção que `tests/rotas.test.ts:47-53` já sobe.
- `.github/` não existe; o CI é arquivo novo. O `README.md` atual descreve o template, não o produto.
- Um hook do ambiente bloqueia comandos Bash que mencionem o arquivo de segredos; segredos vão inline e o `.env.example` é editado com a ferramenta Edit.

## Fonte

`src/lib/ambiente.ts`, `.env.example`, `next.config.ts`, `prisma/seed.ts`, `.gitignore`, `src/lib/prisma.ts`, `README.md` — acessados em 2026-09-30
