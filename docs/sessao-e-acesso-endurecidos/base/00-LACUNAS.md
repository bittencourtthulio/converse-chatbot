# Lacunas

- proxy-e-renovacao: NÃO DOCUMENTADO se um `Set-Cookie` definido pelo proxy na mesma resposta de uma Server Action que apaga o cookie (`sair`) coexiste ou é sobrescrito; procurado em `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` e `.../02-guides/authentication.md`. A F2 decide: o proxy não renova requisição de Server Action (cabeçalho `next-action`), e o teste de ponta a ponta prova o logout.
- proxy-e-renovacao: NÃO DOCUMENTADO se `request.cookies` alterado no proxy chega ao `cookies()` do componente de servidor na mesma requisição (para o handler ver o cookie novo); procurado em `proxy.md` (seção Using Cookies mostra só `response.cookies.set`). Não é necessário: o cookie antigo ainda é válido na requisição atual.
- sessao-e-cookie: NÃO DOCUMENTADO qualquer limite absoluto de sessão ou renovação no código existente; procurado em `src/lib/sessao.ts`, `src/servicos/autenticacao.ts`, `src/lib/ambiente.ts`.
- guardas-de-acesso: NÃO DOCUMENTADO teste de arquitetura que enumere telas e rotas; procurado em `tests/camadas.test.ts`, `tests/log-arquitetura.test.ts`, `tests/rotas.test.ts`.
- limites-de-uso: o relógio padrão de `criarLimitador` (`Date.now` por referência) não é alcançável por `vi.useFakeTimers`; procurado em `src/lib/limite-de-uso.ts:46`. A F2 decide trocar o padrão por `() => Date.now()`.
