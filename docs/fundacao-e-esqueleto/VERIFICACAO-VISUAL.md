# Verificação visual — fundacao-e-esqueleto

Data: 2026-09-30. Ferramenta: navegador da sessão (Chrome). Servidor de produção local (`next start`), com segredos passados por variável de ambiente inline e banco criado por `npm run setup`; entrada com a conta de demonstração do admin.

| Verificação | Resultado |
|---|---|
| Login, tema escuro (preferência do sistema, sem escolha salva) | Cartão centralizado com logotipo, "Entrar", campos e botão índigo. Conforme. |
| Painel, tema escuro, largura desktop | Barra lateral com logotipo e navegação, cabeçalho com título, alternador de tema e menu do usuário; conteúdo com estado vazio "Ainda não há o que mostrar" e o atalho "Cadastrar usuário". Conforme. |
| Painel, tema claro (após o alternador) | Trocou na hora; `data-theme` e `localStorage` ficaram `light`. Conforme. |
| Perfil a 375px, tema claro | Cabeçalho com botão de menu e título; formulário com campos de 44px; sem rolagem horizontal. Conforme. |
| Gaveta a 375px, tema escuro | Barra lateral sobre o conteúdo, com fundo escurecido, botão de fechar e item atual destacado. Conforme. |
| Estado de carregamento a 375px (esqueleto de Usuários) | Esqueleto de título, subtítulo e cartão, nos dois temas. Conforme. |

## Limitações

- A janela do navegador não reduziu a largura da página (a largura interna ficou em 1920 mesmo após o redimensionamento). Os quadros de 375px foram feitos carregando o HTML de cada tela, sem os scripts, em quadros de 375px de largura, o que exercita as regras de CSS do celular. Nesses quadros o JavaScript não roda: o botão de menu e o alternador não foram acionados; a gaveta aberta foi mostrada marcando `data-gaveta="aberta"` no HTML.
- Não foram acionados por clique: abertura do menu do usuário e a mensagem de excesso de tentativas de login. Elas têm cobertura de teste automatizado (`tests/limite-de-login.test.ts`, `tests/rotas.test.ts`, `tests/componentes.test.tsx`), não visual.
- O contraste 4,5:1 e a ausência de cor literal foram provados por `tests/tokens.test.ts`, não por inspeção.
