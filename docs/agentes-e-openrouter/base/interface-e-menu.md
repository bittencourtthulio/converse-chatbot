# Interface, menu, guardas e componentes

## Contrato de entrada

- Menu: `src/componentes/itens-de-menu.ts:35-58` (`GRUPOS_DE_MENU`: grupo sem título com Painel; grupo Configurações com Usuários, `somenteAdmin`, e Meu perfil). `NomeDeIcone` é união fechada (linha 8-21): ícone novo precisa entrar ali e em `src/componentes/Icones.tsx`. `migalhasDaRota` e `rotaEstaAtiva` (linhas 78-90) alimentam cabeçalho e barra; `rotaEstaAtiva('/agentes/x', '/agentes')` já casa por prefixo.
- Guarda de admin em pasta: `src/app/(sistema)/configuracoes/usuarios/layout.tsx` chama `exigirUsuarioAdmin()`; `loading.tsx` fica na pasta (não no nível do sistema) para o 307 ser verdadeiro. `src/app/sessao-servidor.ts:22-37`: `exigirUsuario`, `exigirUsuarioAdmin`.
- Formulários: `src/componentes/Formulario.tsx` (`Formulario` com `useActionState`, `Campo` só `<input>`), ações em `src/app/acoes.ts` (arquivo único, `'use server'`, tipo `EstadoDoFormulario {erro, sucesso, email}`). Componentes de estado: `EstadoVazio`, `EsqueletoDePagina`, `Alerta`, `Badge`, `CabecalhoDaPagina`.

## Contrato de saída

Tokens semânticos em `src/estilos/tokens.css`; classes de `src/estilos/global.css` (`cartao`, `pilha`, `linha`, `botao primario|secundario`, `campo`, `tabela-envoltorio`, `badge-*`). Nenhum valor de cor literal fora de `tokens.css` (`tests/tokens.test.ts`).

## Limites e cotas

Alvos de toque 44px; largura mínima 375px; contraste 4,5:1 provado por teste (`docs/fundacao-e-esqueleto/RELATORIO-FEATURE.md`).

## Erros conhecidos e tratamento

`src/app/(sistema)/error.tsx` é a tela de erro do sistema. Ação devolve `{erro}` no estado; erro de aplicação vira mensagem, outro vira frase genérica.

## Riscos para a nossa implementação

- `Campo` não tem `textarea`, `select` nem contador: precisam de componentes novos (`CampoDeTexto`, seletor de modelo) sobre as classes existentes.
- Ação de formulário que redireciona depois de criar (`redirect`) precisa ficar fora do `try/catch` (como `autenticar` em `src/app/acoes.ts:39-53`).
- O teste de rotas exige `npm run build` antes (`tests/rotas.test.ts:59`); páginas novas entram lá.
- A guarda em `layout.tsx` da pasta é exigência de `usuarios/`: repetir para `integracoes/`.

## Fonte

`src/componentes/*`, `src/app/**`, `src/estilos/*`, `docs/fundacao-e-esqueleto/RELATORIO-FEATURE.md` — acessados em 2026-09-30.
