# Usuários, autenticação e sessão

## Contrato de entrada

`criar`, `editar`, `desativar`, `listar` em `src/servicos/usuarios.ts:46-148` recebem `autor: UsuarioAutenticado` (`id`, `nome`, `email`, `papel`) e chamam `exigirAdmin` (`src/servicos/autenticacao.ts:117`). `editar` valida com zod e recusa rebaixar ou desativar o último admin ativo com `conflito` 409 (`src/servicos/usuarios.ts:104-113`). `desativar` é `editar(..., {ativo:false})` (`src/servicos/usuarios.ts:143-148`) e o comentário da função diz que a exclusão definitiva é da feature de LGPD (`src/servicos/usuarios.ts:137-142`).

## Contrato de saída

`UsuarioListado` (`id`, `nome`, `email`, `papel`, `ativo`, `criadoEm`) (`src/servicos/usuarios.ts:29-36`). Erros por `ErroDeAplicacao` (`conflito`, `naoEncontrado`, `entradaInvalida`) de `src/lib/erros.ts`.

## Limites e cotas

Senha mínima de 8 caracteres (`src/servicos/usuarios.ts:8`). A sessão vale enquanto o usuário existir e estiver ativo e `sessao.emitidoEm >= sessoesValidasDesde` (`src/servicos/autenticacao.ts:95-114`): usuário apagado dá `naoAutenticado` na próxima requisição, sem lista de sessões a revogar.

## Erros conhecidos e tratamento

E-mail duplicado: 409. Último admin: 409 (`src/servicos/usuarios.ts:110-112`). A tela `LinhaDeUsuario` só tem a ação Desativar; `editarUsuario` existe em `src/app/acoes.ts:113` mas não há botão (`src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx:1-65`).

## Riscos para a nossa implementação

A auditoria de `usuario_editado` precisa comparar o estado antes e depois para listar só os nomes dos campos alterados. A exclusão de si mesmo e do último admin ativo precisa de guarda própria (a de `editar` é de rebaixar/desativar). Um admin desativado não conta como "admin ativo".

## Fonte

`src/servicos/usuarios.ts`, `src/servicos/autenticacao.ts`, `src/app/acoes.ts`, `src/app/(sistema)/configuracoes/usuarios/` — acessado em 2026-10-01
