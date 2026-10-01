# Testes, CI e documentação de projeto

## Contrato de entrada

Vitest 4.1.11, `fileParallelism: false`, `testTimeout` 30 s e `hookTimeout` 180 s (`vitest.config.ts:6-14`). `tests/setup.ts` cria `prisma/test.db` por `prisma migrate deploy` e um diretório temporário de `STORAGE_DIR` por arquivo (`tests/setup.ts:9-36`) e define `JWT_SECRET`, `ENCRYPTION_KEY` e `NODE_ENV=test`. Apoio: `tests/ajuda.ts` (`criarUsuario`, `criarAdmin`, `limparBanco`), `tests/apoio/servidor.ts:15-38` (`subirServidor` com `next start` e `capturarLogs`), `tests/apoio/openrouter-falso.ts`, `tests/apoio/ffmpeg.ts` (`descreverComFfmpeg`, `EXIGIR_FFMPEG`). CI: `.github/workflows/ci.yml` com um job `verificar` (ffmpeg, `npm ci`, `prisma generate`, lint, tsc, build, testes, `npm audit --audit-level=high`).

## Contrato de saída

`tests/projeto.test.ts` (616 linhas) confere scripts, `.env.example`, CI, README e as citações `arquivo:linha` de CONVENCOES e LACUNAS por blocos `CITACOES` (`tests/projeto.test.ts:542-582` para a FT-10): editar um arquivo citado desloca linhas e exige refazer a citação. O README tem as seções de cada feature e `## Configuração` com as variáveis (`README.md:107-133`) e `## Comandos` (`README.md:134-151`).

## Limites e cotas

A suíte inteira tem 2544 testes e leva cerca de 7,5 minutos (`docs/privacidade-e-auditoria/RELATORIO-FEATURE.md`); só um `vitest` por vez, e o teste de rotas exige `npm run build` antes. `tests/rotas.test.ts` sobe o servidor de produção com `NODE_ENV: 'production'`.

## Erros conhecidos e tratamento

`database is locked` aparece com carga alheia na máquina (não é defeito do código). Nenhum teste pode tocar `prisma/dev.db` nem `./storage` do desenvolvedor (cada arquivo de teste tem banco e storage próprios).

## Riscos para a nossa implementação

O teste da restauração precisa de diretórios temporários próprios e de um banco montado por `migrate deploy`, como o setup. `tsx` está em `devDependencies` e `prisma` também (`package.json:33-42`): no contêiner de produção, `npm run restore`, `npm run backup` e `prisma migrate deploy` exigem as duas ferramentas na imagem. Lacuna 4 já registra que não há `engines`.

## Fonte

`vitest.config.ts`, `tests/setup.ts`, `tests/apoio/servidor.ts`, `tests/projeto.test.ts`, `.github/workflows/ci.yml`, `README.md`, `package.json` — acessado em 2026-10-01
