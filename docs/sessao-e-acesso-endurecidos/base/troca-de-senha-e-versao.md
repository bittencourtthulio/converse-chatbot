# Troca de senha e invalidação de outras sessões

## Contrato de entrada

`trocarSenha(usuario, {senhaAtual, senhaNova, confirmacao})` valida (nova com 8 ou mais caracteres, confirmação igual, diferente da atual), confere a senha atual por bcrypt e grava `senhaHash` novo e `sessoesValidasDesde = (agora em segundos + 1) * 1000` (`src/servicos/perfil.ts:88-124`). O modelo `Usuario` tem `sessoesValidasDesde DateTime @default(now())` (`prisma/schema.prisma:21-23`).

## Contrato de saída

Devolve `{token}` assinado com `emitidoEm = corte` (`assinarSessao(atual.id, atual.papel, corteEmSegundos)`, `src/servicos/perfil.ts:123`), para o token novo nascer no corte e a comparação `iat < corte` não o derrubar. A ação `salvarSenha` grava esse token no cookie (`src/app/acoes.ts:259-278`).

## Limites e cotas

A comparação é em segundos inteiros. Um login feito no MESMO segundo da troca recebe `iat = agora`, que é menor que o corte `agora + 1`, e cai (achado A-1 de `docs/projeto/validacao/sistema-de-pe.md`: login 303 e `/perfil` 307 logo depois da troca; com 70 s de espera funcionou). Um token do segundo seguinte à troca, emitido antes do corte, também seria derrubado.

## Erros conhecidos e tratamento

Senha atual errada: 422 "A senha atual está incorreta." sem trocar nada (`tests/perfil.test.ts:150-160`). Provas existentes: sessão aberta antes da troca deixa de valer e quem trocou continua com o token devolvido (`tests/perfil.test.ts:162,181`).

## Riscos para a nossa implementação

O corte baseado em relógio não distingue login imediatamente posterior da sessão antiga; a troca para um contador inteiro de versão no usuário e uma claim no token elimina a ambiguidade. A coluna `sessoesValidasDesde` é referenciada por `tests/restauracao-comando.test.ts:142` (INSERT com a coluna explícita) e pela migration inicial; migration só acrescenta (`tests/migracoes.test.ts`), então a coluna antiga não pode ser removida. Usuários existentes terão a versão nova com o padrão 0 e tokens antigos sem claim de versão precisam valer como versão 0.

## Fonte

`src/servicos/perfil.ts`, `prisma/schema.prisma`, `tests/perfil.test.ts`, `docs/projeto/validacao/sistema-de-pe.md` (A-1) — acessado em 2026-10-01
