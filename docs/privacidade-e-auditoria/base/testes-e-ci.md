# Testes, apoio e CI

## Contrato de entrada

Vitest 4 em `tests/`, um banco SQLite por arquivo (`tests/setup.ts:31-38`), `fileParallelism: false` (`vitest.config.ts:14`). Apoio: `criarUsuario`, `criarAdmin`, `limparBanco` (`tests/ajuda.ts:10-52`); `limparBanco` apaga em ordem de dependência e terá de incluir a tabela nova. Servidor de produção para teste: `subirServidor` (`tests/apoio/servidor.ts:15`); Telegram simulado (`tests/apoio/telegram-falso.ts:91`); fixtures de conversa (`tests/apoio/historico.ts`).

## Contrato de saída

Suíte inteira: 2251 testes na FT-09 (`docs/historico-de-conversas/RELATORIO-FEATURE.md`). Comandos: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm audit --audit-level=high` (`docs/stack/CONVENCOES.md` seção 2).

## Limites e cotas

`testTimeout` 30 s e `hookTimeout` 180 s (`vitest.config.ts:9-10`). Testes de rota usam o `.next` do último `npm run build` (`docs/stack/LACUNAS.md`, lacuna 17).

## Erros conhecidos e tratamento

`database is locked` por carga alheia: esperar. `tests/projeto.test.ts` e `tests/menu.test.ts` quebram ao acrescentar variável ou item de menu e devem ser atualizados e declarados.

## Riscos para a nossa implementação

Testes que contam itens de menu e `tests/rotas.test.ts` (rotas protegidas) precisam das rotas novas. Teste com relógio exige injeção (`src/lib/limite-de-uso.ts:46`).

## Fonte

`tests/`, `vitest.config.ts`, `docs/stack/CONVENCOES.md` — acessado em 2026-10-01
