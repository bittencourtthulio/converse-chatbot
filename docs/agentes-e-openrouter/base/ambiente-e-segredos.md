# Ambiente, erros e segredos existentes

## Contrato de entrada

`src/lib/ambiente.ts:24-43` é o ponto único de leitura de variável: objeto `ambiente` com getters (`jwtSecret` obrigatória por `obrigatoria()`, `jwtTtlSegundos`, `nomeDoProduto`, `confiarNoProxy`, `ehProducao`). Nenhuma variável de cripto nem de OpenRouter existe. `.env.example` (versionado, sem valor real) documenta `DATABASE_URL`, `JWT_SECRET`, `JWT_TTL_SEGUNDOS`, `APP_NAME`, `TRUST_PROXY`. `tests/setup.ts:12-18` define `DATABASE_URL`, `JWT_SECRET`, `JWT_TTL_SEGUNDOS`, `NODE_ENV=test` por `process.env`.

## Contrato de saída

`src/lib/erros.ts:5-46`: `ErroDeAplicacao(message, status, codigo)` e fábricas `naoAutenticado` 401, `naoAutorizado` 403, `naoEncontrado` 404, `entradaInvalida` 422, `conflito` 409, `limiteExcedido` 429. Ação de formulário converte em mensagem (`src/app/acoes.ts:29-33`); erro inesperado vira frase genérica e vai a `console.error`.

## Limites e cotas

`NÃO DOCUMENTADO` para segredo. `ErroDeAplicacao` não tem fábrica para 502 nem 504.

## Erros conhecidos e tratamento

`obrigatoria()` lança `Error` simples com o nome da variável (`src/lib/ambiente.ts:5-13`); nenhum ponto trata `ENCRYPTION_KEY`. A convenção pede: "obrigatória ausente falha no start só quando o recurso é usado" (instruções do B4; `docs/stack/CONVENCOES.md`, seção Configuração).

## Riscos para a nossa implementação

- `ENCRYPTION_KEY` deve ser lida por getter (lazy) para a ausência não derrubar login e painel.
- `console.error(erro)` em `src/app/acoes.ts:31` imprime o objeto de erro inteiro: um erro que contenha a chave vazaria em log. O adaptador deve construir erros sem a chave e sem o corpo bruto do provedor.
- O hook de segurança do ambiente bloqueia comandos que citem o arquivo de segredos: segredos de execução vão inline.

## Fonte

`src/lib/ambiente.ts`, `src/lib/erros.ts`, `src/app/acoes.ts`, `.env.example`, `tests/setup.ts` — acessados em 2026-09-30.
