# Página do iframe, cabeçalhos de segurança e proxy do Next

## Contrato de entrada

- Cabeçalhos globais em `next.config.ts` (função `headers()`, `source: '/:path*'`): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` restritiva (PR-37). A `Content-Security-Policy` e o `frame-ancestors` foram adiados para a FT-06 (comentário em `next.config.ts` e PR-37).
- `proxy.ts` do Next 16 (antigo middleware): arquivo na raiz de `src`, exporta `proxy(request)` e `config.matcher`; runtime Node.js por padrão; `runtime` não pode ser configurado (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:253-255`); o `matcher` precisa ser constante (mesmo arquivo, seção Matcher); não deve depender de módulos compartilhados ou globais (mesmo arquivo, "Good to know").
- Layout raiz `src/app/layout.tsx` já define `html lang="pt-BR"`, `head` com o script de tema e `body`; o grupo `(sistema)` tem a casca com sessão (`src/app/(sistema)/layout.tsx`). Uma página `src/app/embed/[id]/page.tsx` fora do grupo não herda a casca nem `loading.tsx` do sistema.

## Contrato de saída

- A resposta de `/embed/*` precisa trazer `Content-Security-Policy: frame-ancestors 'self' <domínios>` (lista vazia: `*`) e não trazer `X-Frame-Options`, pois este último, se presente, prevalece sobre o navegador em alguns casos e bloquearia o iframe.

## Limites e cotas

- Sintaxe de host-source do CSP (valores de fonte `frame-ancestors`): `NÃO DOCUMENTADO` neste repositório; o projeto usa o que a especificação do CSP define (host com curinga `*.exemplo.com`, porta opcional, esquema opcional); a premissa da feature registra que a entrada sem esquema acompanha o esquema do documento emoldurado e que entrada sem porta vale só para a porta padrão.

## Erros conhecidos e tratamento

- Agente inexistente ou inativo: a página mostra mensagem neutra; o cabeçalho usa `frame-ancestors 'self'` (nenhum site externo emoldura algo que não existe) e a resposta não distingue inexistente de inativo.

## Riscos para a nossa implementação

- `X-Frame-Options: DENY` global impede o iframe: a regra precisa excluir `/embed` e a exclusão precisa ser provada em produção.
- Se o Prisma não rodar dentro do `proxy.ts`, o CSP dinâmico precisa de outra rota (lacuna 1).
- Um CSP só com `frame-ancestors` não protege o resto; é o escopo de PR-17, a política completa não é pedida.
- Página do iframe em `localStorage` de terceiro: navegadores com armazenamento particionado ou bloqueado lançam exceção; o acesso leva try/catch (pedido da feature).

## Fonte

`next.config.ts`, `src/app/layout.tsx`, `src/app/(sistema)/layout.tsx`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`, `docs/projeto/PREMISSAS.md` (PR-17, PR-37) — acessados em 2026-09-30.
