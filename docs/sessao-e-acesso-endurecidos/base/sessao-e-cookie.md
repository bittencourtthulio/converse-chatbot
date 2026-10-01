# Sessão por JWT e cookie hoje

## Contrato de entrada

`assinarSessao(usuarioId, papel, emitidoEm = agora)` assina um JWT HS256 com `sub`, `papel`, `iat = emitidoEm` e `exp = emitidoEm + JWT_TTL_SEGUNDOS`; não há `jti` nem outro identificador de sessão (`src/lib/sessao.ts:16-33`). `lerSessao(token)` verifica a assinatura e a expiração e devolve `{usuarioId, papel, emitidoEm}`; qualquer falha vira `naoAutenticado()` (`src/lib/sessao.ts:35-50`). `entrar` confere e-mail e senha e devolve `{token, usuario}` com a mesma mensagem para e-mail inexistente, senha errada e conta desativada (`src/servicos/autenticacao.ts:62-88`). `usuarioDaSessao(token)` lê a sessão, busca o usuário (existe, ativo) e derruba o token cujo `iat` é menor que `sessoesValidasDesde` em segundos (`src/servicos/autenticacao.ts:95-113`). O papel é lido do banco, não do token. `ambiente.jwtTtlSegundos` vale 900 por padrão (`src/lib/ambiente.ts`, getter `jwtTtlSegundos`, `inteiroComPadrao('JWT_TTL_SEGUNDOS', 900)`).

## Contrato de saída

O cookie `expx_sessao` é gravado por `gravarCookieDeSessao(token)` com `opcoesDoCookie()`: `httpOnly: true`, `secure: ambiente.ehProducao`, `sameSite: 'lax'`, `path: '/'`, `maxAge: jwtTtlSegundos` (`src/lib/sessao.ts:52-62`, `src/app/sessao-servidor.ts:37-39`). O cookie só é gravado no login (`autenticar`, `src/app/acoes.ts:70`) e na troca de senha (`salvarSenha`, `src/app/acoes.ts:275`). `sair` apaga o cookie e redireciona para `/entrar`; não toca em nada no servidor (`src/app/acoes.ts:77-80`). Não existe renovação: o cookie some 900 s depois do login mesmo com uso.

## Limites e cotas

`JWT_TTL_SEGUNDOS` padrão 900 (`src/lib/ambiente.ts`); `INTEIROS_OPCIONAIS` do `validarAmbiente` lista as variáveis opcionais numéricas conferidas no start de produção (`src/lib/ambiente.ts`, lista `INTEIROS_OPCIONAIS`). Limite absoluto de duração de sessão: NÃO DOCUMENTADO (não existe).

## Erros conhecidos e tratamento

Token expirado, adulterado ou de outro segredo: 401 por `naoAutenticado` (`tests/autenticacao.test.ts`, `tests/rotas.test.ts`). Sessão derrubada por troca de senha: mensagem "Sessão encerrada por troca de senha." (`src/servicos/autenticacao.ts:111`).

## Riscos para a nossa implementação

(1) Token roubado vale até expirar mesmo depois de `sair` (achado A-04). (2) Sem renovação, o uso contínuo é interrompido a cada 15 minutos. (3) O `iat` tem resolução de segundos. (4) Nenhum teste afirma os atributos do cookie: `tests/` não contém `httpOnly`, `sameSite` nem `set-cookie` (achado A-02); as ações são testadas com `gravarCookieDeSessao` simulado.

## Fonte

`src/lib/sessao.ts`, `src/servicos/autenticacao.ts`, `src/app/sessao-servidor.ts`, `src/app/acoes.ts`, `src/lib/ambiente.ts`, `docs/projeto/validacao/premissas-01-34.md` (A-02, A-04) — acessado em 2026-10-01
