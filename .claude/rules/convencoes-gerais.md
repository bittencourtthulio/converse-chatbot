# Convenções gerais

Origem: `docs/stack/CONVENCOES.md` (cada item tem arquivo:linha lá).

- **Idioma:** código de domínio, testes e mensagens em português; nome de arquivo de componente em PascalCase (`Formulario.tsx`), demais em kebab-case (`limite-de-uso.ts`).
- **TypeScript 5.9 estrito, ESM, Node 22.** Dependências com versão fixa; lockfile v3 versionado.
- **TDD sempre:** teste antes da implementação. Uma task só termina com teste de integração e teste funcional passando.
- **Testes:** `tests/<assunto>.test.ts` (`.test.tsx` para componente), casos em frase em português (`it('recusa senha errada', ...)`), Vitest 4, `fileParallelism: false`, banco `prisma/test.db` por arquivo, dados por `tests/ajuda.ts` (`criarUsuario`, `criarAdmin`, `limparBanco`). Relógio e armazenamento são injetados.
- **Teste de rota exige `npm run build` antes** (usa o `.next` existente).
- **Comandos reais:** `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` (precisa de `DATABASE_URL` e `JWT_SECRET`), `npm audit --audit-level=high`. Um teste só: `npx vitest run tests/<arquivo>.test.ts`.
- **Onde entra código novo:** caso de uso em `src/servicos/<assunto>.ts`; adaptador externo em `src/lib/<provedor>.ts`; handler em `src/app/api/<recurso>/route.ts`; componente em `src/componentes/<Nome>.tsx`; ação de formulário em `src/app/acoes.ts`.
- **Erro:** `ErroDeAplicacao` (`src/lib/erros.ts`); erro de provedor por `erroDoProvedor`.
- **Estilo:** tokens em `src/estilos/tokens.css`, nenhum valor literal fora dele.
- **Lacunas conhecidas:** sem formatador, sem cobertura, sem reversão de migração, sem `engines` (`docs/stack/LACUNAS.md`). Não "resolva" no meio de outra tarefa.
- Relacionadas: [[restricoes-inviolaveis]]
