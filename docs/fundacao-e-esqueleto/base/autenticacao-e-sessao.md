# Autenticação e sessão

## Contrato de entrada

`autenticar(_estado, form)` em `src/app/acoes.ts:33-46` lê `email` e `senha` do `FormData` e chama `entrar` (`src/servicos/autenticacao.ts:33`). `entradaDeLogin` (zod): e-mail com trim e lowercase, senha com mínimo de 1 caractere (`autenticacao.ts:9-20`).

## Contrato de saída

Sucesso: `{ token, usuario }`, cookie `expx_sessao` httpOnly, sameSite lax, `secure` em produção, `maxAge` igual a `JWT_TTL_SEGUNDOS` (`src/lib/sessao.ts`, função `opcoesDoCookie`); redireciona para `/`. Falha: `ErroDeAplicacao` 401 `nao_autenticado` com "E-mail ou senha incorretos.", igual para e-mail inexistente, senha errada e conta desativada (`autenticacao.ts:46-48`). A ação devolve `{ erro }` ao formulário (`acoes.ts:38-44`).

## Limites e cotas

`JWT_TTL_SEGUNDOS` padrão 900 (`src/lib/ambiente.ts:30`). Limite de tentativas de login: não existe (lacuna 7). O endereço do cliente na ação: `NÃO DOCUMENTADO`; a ação não lê cabeçalhos hoje. `src/lib/sessao-servidor.ts:1` já usa `cookies()` de `next/headers`, do mesmo módulo de onde vem `headers()`.

## Erros conhecidos e tratamento

`mensagemDe` (`acoes.ts:24-28`) converte `ErroDeAplicacao` em mensagem; qualquer outro erro vira "Não foi possível concluir. Tente de novo." e sai em `console.error`. `ErroDeAplicacao(message, status, codigo)` em `src/lib/erros.ts:4-12`; fábricas `naoAutenticado`, `naoAutorizado`, `naoEncontrado`, `entradaInvalida`, `conflito`. Não existe fábrica para "muitas tentativas" (429).

## Riscos para a nossa implementação

- O limite deve viver em `src/lib/limite-de-uso.ts` e ser aplicado na ação ou no serviço, sem que `src/lib` importe serviços.
- Os testes de `entrar` (`tests/autenticacao.test.ts`, 13 casos) chamam `entrar(entrada)` com um argumento: exigir novo parâmetro obrigatório quebraria os 13; um parâmetro opcional preserva.
- Atrás de proxy o IP vem de `x-forwarded-for`, que pode ser forjado se o proxy não o sobrescreve; qual proxy a instalação usará é `NÃO DOCUMENTADO` (PR-24 fala em contêiner e HTTPS, `docs/projeto/PREMISSAS.md`).
- A troca de senha grava cookie novo (`acoes.ts:135`); não é tocada.

## Fonte

`src/app/acoes.ts`, `src/servicos/autenticacao.ts`, `src/lib/sessao.ts`, `src/lib/erros.ts`, `src/lib/sessao-servidor.ts` — acessados em 2026-09-30
