# Lacunas

- schema-e-migracoes: NÃO se sabe se tornar `Agente.criadoPorId` anulável gera migration destrutiva no Prisma 7 com SQLite; procurado em `prisma/migrations/` (nenhuma migration anterior altera nulidade) e em `docs/stack/CONVENCOES.md` seção 4.
- canais-e-conversas: não há prova de que os `Set` de ouvintes são compartilhados entre `instrumentation.ts` e os handlers em `next start`; procurado em `tests/instrumentacao.test.ts` e `tests/rotas.test.ts`.
- segundo-plano-e-ambiente: não há medida de lote seguro para `deleteMany` no SQLite; procurado em `src/servicos/` (nenhum lote em massa fora do máximo de 50 ids).
- telas-menu-e-publico: regra de `Origin` para `DELETE` público não documentada; procurado em `src/app/api/publico/resposta.ts`.
