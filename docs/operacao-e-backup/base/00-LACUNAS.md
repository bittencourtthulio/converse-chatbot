# Lacunas

- log-e-erros: NÃO DOCUMENTADO se o Next 16 em `next start` encadeia o `digest` do erro de página com a correlação da requisição; procurado em `node_modules/next/dist/docs` (instrumentation.md, error handling) e em `src/app/(sistema)/error.tsx:6-12`. A F2 decide: o código de referência da página é o `digest`, e o hook `onRequestError` o grava no log junto da correlação.
- log-e-erros: não há prova de que um `AsyncLocalStorage` aberto no `proxy.ts` chega ao handler da rota (processos e runtimes distintos); procurado em `src/proxy.ts` (só define cabeçalho) e em `tests/embed-cabecalhos.test.ts`. A correlação pode ir por cabeçalho de requisição.
- ambiente-e-start: NÃO DOCUMENTADO o que o Next faz se `register()` lança em `next start` (derruba ou segue); procurado em `node_modules/next/dist/docs/01-app/02-guides/instrumentation.md`.
- banco-e-armazenamento: o caminho relativo de `DATABASE_URL` não tem regra única: o adaptador do Prisma abre relativo ao diretório de execução (`src/lib/prisma.ts:13`) e o Prisma CLI relativo ao esquema (`prisma.config.ts:14`); procurado em `.env.example:5` e `tests/setup.ts:10` (que usa caminho absoluto).
- banco-e-armazenamento: NÃO DOCUMENTADO se a API de backup online do `better-sqlite3` preserva o `rowid` das linhas (premissa: sim, copia páginas); procurado em `node_modules/better-sqlite3/lib/methods/backup.js:8-36`. A prova é um teste desta feature.
- conteiner-e-ferramentas: o pacote `tar` não está instalado (`ls node_modules`): versão 7.5.22 é a `latest` do registro (`npm view tar`); a ausência de vulnerabilidade `high` só se sabe depois de `npm audit`.
- conteiner-e-ferramentas: o Dockerfile e o compose não existem no repositório (`git ls-files`), nem `.dockerignore`.
