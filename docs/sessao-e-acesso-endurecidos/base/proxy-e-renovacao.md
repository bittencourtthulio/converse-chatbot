# Proxy do Next 16, cookies e onde a sessão pode ser reemitida

## Contrato de entrada

`src/proxy.ts` exporta `proxy(request)`: gera a correlação (cabeçalho de requisição `x-correlacao`), define o `frame-ancestors` em `/embed/*` e devolve `NextResponse.next({request: {headers}})` com `X-Correlacao` (`src/proxy.ts:34-45`). Roda em Node e já consulta o banco (`dominiosDoEmbed`, `src/proxy.ts:19-30`). O `matcher` constante exclui `_next/static`, `_next/image`, `favicon.ico` e `api/agentes/[id]/fontes...` (uploads: com proxy o Next copia o corpo em memória, até 10 MB) (`src/proxy.ts:47-56`).

## Contrato de saída

Documentação do Next 16: o proxy pode ler cookies da requisição (`request.cookies`) e gravar cookies na resposta (`response.cookies.set`), "to pass information from Proxy to your application, use headers, cookies, rewrites, redirects, or the URL" (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, seções "Using Cookies" e "Good to know"). O mesmo texto avisa que o proxy deve ser invocado separadamente do código de renderização e que não se deve depender de módulos ou globais compartilhados. Em componente de servidor não se grava cookie; `cookies().set` só vale em Server Action e Route Handler (`node_modules/next/dist/docs/01-app/02-guides/authentication.md`, "Setting cookies").

## Limites e cotas

A rota de upload fica fora do matcher, então não renovaria a sessão (o uso por upload não estende o cookie; as demais requisições do mesmo uso estendem). NÃO DOCUMENTADO se, numa Server Action que apaga o cookie (`cookies().delete`), um `Set-Cookie` já definido pelo proxy na mesma resposta é sobrescrito ou coexiste; a prova é um teste de ponta a ponta desta feature.

## Erros conhecidos e tratamento

Falha na consulta no proxy do embed fecha (`FRAME_ANCESTORS_SOMENTE_EU`, `src/proxy.ts:23-30`): a renovação também deve falhar aberta para o usuário, isto é, sem renovar e sem derrubar (o handler continua decidindo por `exigirUsuario`).

## Riscos para a nossa implementação

(1) O proxy não deve ser a fronteira de autenticação: as guardas continuam nos handlers. (2) O proxy roda em toda navegação e consultar o banco por requisição tem custo (SQLite local, aceitável; só quando há cookie de sessão). (3) Matcher novo não pode quebrar a exclusão do upload (testada em `tests/video-rota.test.ts` e `tests/fontes-rota-upload.test.ts`). (4) Se o proxy reemitir o cookie na mesma requisição da ação `sair`, a sessão revogada poderia ser ressuscitada: a renovação só ocorre para sessão válida e não revogada, e o teste de ponta a ponta cobre o caso.

## Fonte

`src/proxy.ts`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, `node_modules/next/dist/docs/01-app/02-guides/authentication.md` — acessado em 2026-10-01
