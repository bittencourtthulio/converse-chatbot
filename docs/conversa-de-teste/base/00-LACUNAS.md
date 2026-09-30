# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Uso de tokens (`usage`) do stream: o adaptador não o devolve (`src/lib/sse.ts:9-14`); o servidor simulado o emite no evento final (`tests/apoio/openrouter-falso.ts`). Como o provedor real reporta `usage` no stream: `NÃO DOCUMENTADO` nesta base (não relido em `docs/agentes-e-openrouter/base/openrouter-api.md`). (streaming-e-openrouter)
2. Se o adaptador better-sqlite3 do Prisma 7 liga `foreign_keys` por padrão, condição de a cascata funcionar: `NÃO DOCUMENTADO`; procurado em `tests/setup.ts`, `src/lib/prisma.ts`, `prisma/migrations/`. Será provado por teste na primeira task do banco. (banco-e-testes)
3. Tamanho máximo do corpo de uma requisição a Route Handler no Next 16: `NÃO DOCUMENTADO` em `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`. (servicos-handlers-e-sessao)
4. Teste de componente com interação (jsdom ou similar): não instalado (`package.json`); procurado em `vitest.config.ts` e `package.json`. (interface-do-agente)
5. Ferramentas de navegador para a verificação visual: disponibilidade `NÃO DOCUMENTADO` até a task de verificação. (interface-do-agente)
6. Contexto histórico do `memox` para os arquivos tocados: não consultado (índice em `.expx/memoria/`, não versionado); a ausência não é lacuna.
