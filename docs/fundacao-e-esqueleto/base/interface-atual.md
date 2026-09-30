# Interface atual herdada do template

## Contrato de entrada

- Tokens: `src/estilos/tokens.css` define a paleta do VS Code Dark+ em `:root`, a Light+ em `:root[data-theme='light']` e um bloco `@media (prefers-color-scheme: light)` que repete os valores quando não há tema escolhido. Tokens de IDE: `--bg-activitybar`, `--statusbar-bg`, `--largura-activitybar`, `--altura-statusbar`; `--texto-base: 13px`; `--raio: 2px`; `--altura-controle: 26px`.
- `src/estilos/global.css`: grade `.aplicacao` com barra de atividade, barra lateral, conteúdo e barra de status (linhas 29-40); gaveta a 768px (linhas 176-190) com classe `.gaveta-aberta`, que nenhum componente aplica; foco por `outline: 1px` (linhas 22-25).
- `src/app/(sistema)/layout.tsx`: casca com `Navegacao`, `AlternadorDeTema` e botão sair no rodapé.
- `src/componentes/Navegacao.tsx`: itens escritos à mão (Painel, Usuários só para admin, Meu perfil).
- `src/componentes/AlternadorDeTema.tsx`: `useSyncExternalStore`, grava `localStorage` na chave `tema`, lê `dataset.theme` no `<html>`.
- `src/app/layout.tsx`: `<title>` fixo `Converse` (linha 5); script inline no `<head>` aplica o `tema` salvo antes da primeira pintura.
- `src/app/entrar/page.tsx`: login com estilos inline, `<h1>Entrar</h1>`, sem nome do produto.
- `src/componentes/Formulario.tsx`: `Formulario` (estados de envio, erro `role="alert"`, sucesso `role="status"`) e `Campo`.
- Painel `src/app/(sistema)/page.tsx`: título "Painel", subtítulo com o nome, parágrafo `.vazio`.

## Contrato de saída

HTML renderizado no servidor. O teste `tests/rotas.test.ts` afirma sobre o texto: login contém "Entrar" (linhas 76-80), painel contém "Painel" e "Esta é a tela inicial do sistema" (linhas 84-91), perfil contém "Meu perfil", troca contém "Trocar senha", navegação contém ou não `/configuracoes/usuarios`.

## Limites e cotas

Breakpoint de celular: 768px (`global.css:176`). Alvo de toque mínimo 44px só sob 768px (`global.css:189`). Contraste 4,5:1: o tema claro documenta um ajuste de `--warning` para 5,06:1 (comentário em `tokens.css`); o valor medido dos demais pares é `NÃO DOCUMENTADO`.

## Erros conhecidos e tratamento

O tema padrão no servidor é escuro (`AlternadorDeTema.tsx:26`), mas o script inicial só aplica o tema salvo: sem tema salvo e com `prefers-color-scheme` claro, a media query do CSS cobre as cores, e o alternador lê `matchMedia` no cliente. Se o rótulo do botão diverge na hidratação é `NÃO DOCUMENTADO`.

## Riscos para a nossa implementação

- Há estilos inline em `usuarios/page.tsx`, `LinhaDeUsuario.tsx`, `perfil/page.tsx` e `entrar/page.tsx`, sem cor literal, mas fora do vocabulário de classes.
- Testes de rota dependem de textos: a nova casca preserva se "Painel", "Meu perfil", "Trocar senha", "Entrar" e o link `/configuracoes/usuarios` (só admin) permanecerem. O texto "Esta é a tela inicial do sistema" mudará com o novo estado vazio, e o teste precisa acompanhar.
- Botão "Sair" hoje é um `form` com server action `sair` (`src/app/acoes.ts:48-51`).

## Fonte

`src/estilos/tokens.css`, `src/estilos/global.css`, `src/app/layout.tsx`, `src/app/(sistema)/layout.tsx`, `src/app/entrar/page.tsx`, `src/componentes/*.tsx`, `tests/rotas.test.ts` — acessados em 2026-09-30
