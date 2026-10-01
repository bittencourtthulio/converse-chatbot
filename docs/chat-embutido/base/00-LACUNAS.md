# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Se o Prisma com o adaptador better-sqlite3 funciona dentro de `src/proxy.ts` do Next 16 (runtime Node por padrão, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:253-255`): `NÃO DOCUMENTADO`; será provado por teste de produção do cabeçalho. (embed-e-csp)
2. Se `headers()` do `next.config.ts` aceita `source` com exclusão por expressão regular para tirar `/embed` do `X-Frame-Options: DENY`: não verificado; será provado por teste de produção. (embed-e-csp)
3. Como o Next 16 serve um route handler em `src/app/widget.js/route.ts` (pasta com ponto) e se `force-static` preserva cabeçalhos próprios: `NÃO DOCUMENTADO` no repositório; provado por teste de produção. (widget-e-script)
4. Biblioteca de DOM para teste do script (happy-dom ou jsdom): não instalada (`package.json`); será acrescentada com versão fixa e `npm audit` em 0. Suporte de happy-dom a Shadow DOM e `postMessage` com `origin`: `NÃO DOCUMENTADO` até a task de teste. (widget-e-script)
5. Se o IP do visitante é distinguível sem proxy: não é (`src/lib/requisicao.ts`, sem `TRUST_PROXY=1` o IP é o valor fixo `desconhecido`), logo todos os visitantes dividem o mesmo balde de limite. Não é lacuna de código, é limite conhecido. (api-publica-e-limites)
6. Ferramentas de navegador para a verificação ponta a ponta: disponibilidade `NÃO DOCUMENTADO` até a task de verificação. (widget-e-script)
7. Contexto histórico do `memox`: não consultado; a ausência não é lacuna.

## Resolução (registrada no fechamento)

1. Resolvida: o Prisma roda no `proxy.ts` do Next 16 (`tests/embed-cabecalhos.test.ts`).
2. Resolvida: a expressão regular de `next.config.ts` exclui `/embed` do `X-Frame-Options: DENY` e mantém `/embedded` negado.
3. Resolvida: a rota `src/app/widget.js/route.ts`, estática, preserva os cabeçalhos próprios (`tests/widget-rota.test.ts`).
4. Resolvida: `happy-dom` 20.14.5 cobre Shadow DOM e `postMessage` com `origin` (a prova de `source` usa um `contentWindow` de teste).
5. Mantida como limite conhecido (lacuna 16 de `docs/stack/LACUNAS.md`).
6. Resolvida em parte: Chrome disponível; 375 px e tema claro sem verificar (`VERIFICACAO-VISUAL.md`).
