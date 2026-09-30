# Serviços, sessão, guardas e primeiro handler HTTP

## Contrato de entrada

Serviços recebem `UsuarioAutenticado` (`src/servicos/autenticacao.ts:53-58`: id, nome, email, papel) e entrada bruta validada por zod (`src/servicos/agentes.ts:15-75`). `obterChaveDoOpenrouter()` (`src/servicos/integracoes.ts:132-138`) devolve a chave em claro ou `null`; lança `ErroDeAplicacao` se ilegível. A sessão de página vem de `exigirUsuario()` (redireciona ao login) e `usuarioAtual()` (devolve `null`), ambos em `src/app/sessao-servidor.ts:8-26`. Não existe `proxy.ts` nem `middleware.ts`: a proteção é por layout e por guarda em cada rota (`src/app/(sistema)/agentes/[id]/layout.tsx`).

## Contrato de saída

`ErroDeAplicacao(mensagem, status, codigo)` (`src/lib/erros.ts:4-13`). Ações de servidor convertem erro em texto para a tela (`src/app/acoes.ts:29-33`), e erro inesperado vira frase genérica com `console.error` (`src/app/acoes.ts:31`). Ainda não há identificador de correlação (PR-21, FT-11; `docs/stack/LACUNAS.md`, lacunas 6 e 7).

## Limites e cotas

Route Handler do App Router: `POST(request, { params })`, com `params` como `Promise` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md:82-89`). Streaming por `Response` com `ReadableStream` (mesmo arquivo, linhas 367-440). Proxy reverso bufferiza a resposta, e o cabeçalho `X-Accel-Buffering: no` desliga isso (`node_modules/next/dist/docs/01-app/02-guides/streaming.md:693-703`). Tamanho máximo de corpo em Route Handler: `NÃO DOCUMENTADO` no trecho lido.

## Erros conhecidos e tratamento

Não há handler em `src/app/api`: `docs/stack/CONVENCOES.md` seção 5 marca "decidido_pelo_buildx (ainda não existe)" e `docs/stack/LACUNAS.md` lacuna 7. O `layout.tsx` do agente chama `carregarAgente` que dá `notFound()` em 404 (`src/app/(sistema)/agentes/[id]/carregar-agente.ts`): rota de API precisa devolver 404 em JSON, não página. Camadas: serviço não importa `next/*` (`eslint.config.mjs:8-60`), então o gerador do serviço não pode conhecer `Response`; a rota faz a conversão para SSE.

## Riscos para a nossa implementação

- Log de erro sem conteúdo da conversa: o `console.error(erro)` genérico de `acoes.ts` imprimiria o objeto de erro (o erro do Prisma imprime argumentos). O serviço de chat deve registrar só código e correlação.
- Rota `POST` com resposta em stream não deve ser estática nem cacheada: `Cache-Control: no-store` e `export const dynamic = 'force-dynamic'`.
- Cancelamento do navegador chega como `request.signal` abortado; precisa ser repassado ao `sinal` do serviço.
- Sem limite de uso nesta feature (PR-16 é FT-06/07); o painel é autenticado.

## Fonte

`src/servicos/`, `src/app/sessao-servidor.ts`, `src/app/acoes.ts`, `src/lib/erros.ts`, `eslint.config.mjs`, `docs/stack/CONVENCOES.md`, `docs/stack/LACUNAS.md`, `node_modules/next/dist/docs/01-app/` — acessados em 2026-09-30.
