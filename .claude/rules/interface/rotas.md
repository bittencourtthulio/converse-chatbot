---
paths:
  - "src/app/**"
  - "src/componentes/**"
  - "src/proxy.ts"
---
# Rotas, telas e componentes

- **Handler fino:** `usuarioAtual()` (401 em JSON, sem redirecionar) → corpo validado por zod → serviço → status do `ErroDeAplicacao`. `export const dynamic = 'force-dynamic'`.
- **Upload:** tipo de conteúdo (415), teto por `Content-Length` antes de ler o corpo (413) e conferência do tamanho real depois. As rotas de fontes ficam fora do `matcher` do proxy.
- **Rota pública** (`api/publico/**`): sem sessão nem cookie; 404 igual para agente inexistente e inativo; 429 com `Retry-After`; `POST` recusa `Origin` de navegador fora da plataforma; `config` leva CORS pela lista de domínios e `Vary: Origin`.
- **Landing** em `src/app/inicio/page.tsx`, fora de `(sistema)`, sem banco nem sessão; o `src/proxy.ts` reescreve `/` para `/inicio` quando não há cookie de sessão.
- **`/embed`** é a única página sem `X-Frame-Options: DENY`; o proxy consulta o banco a cada carregamento.
- **Ação de servidor** em `src/app/acoes.ts`; guarda em `src/app/sessao-servidor.ts`.
- **Tema:** claro e escuro por tokens. Fontes Geist e Inter por `next/font/local`; a serifa itálica é só do título do hero.
- **Verificação visual:** a 375 px só foi vista em Chrome sem janela emulado; diga o que viu e o que não viu.
