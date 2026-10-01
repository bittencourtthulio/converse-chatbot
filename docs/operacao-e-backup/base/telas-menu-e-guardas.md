# Telas de Configurações, menu e guardas

## Contrato de entrada

O menu é a lista única `GRUPOS_DE_MENU` (`src/componentes/itens-de-menu.ts:46-77`) com o grupo "Configurações": Usuários, Integrações, Privacidade, Auditoria (todos `somenteAdmin`) e Meu perfil; o tipo `NomeDeIcone` limita os ícones (`src/componentes/itens-de-menu.ts:7-31`) e a lista de ícones é `src/componentes/Icones.tsx`. Cada tela de Configurações tem `layout.tsx` com `await exigirUsuarioAdmin()` acima do `loading.tsx` e a página confere de novo (`src/app/(sistema)/configuracoes/auditoria/layout.tsx:3-15`, `.../page.tsx:21-29`; `exigirUsuarioAdmin` em `src/app/sessao-servidor.ts:31-35`). Componentes de tela existentes: `CabecalhoDaPagina`, `Alerta` (variantes `erro`, `aviso`), `Esqueleto`/`EsqueletoDePagina` (`src/app/(sistema)/configuracoes/auditoria/loading.tsx:1-5`), classes `cartao`, `pilha`, `primario`, `tabela-envoltorio` em `src/estilos/global.css`. O `error.tsx` do sistema mostra `digest` (`src/app/(sistema)/error.tsx:6-27`).

## Contrato de saída

Rota de arquivo para baixar já existe para a exportação de conversa: `text/plain`, `attachment`, `no-store`, `nosniff` (`src/app/api/conversas/[id]/exportar/route.ts:9`). Handler fino com `export const dynamic = 'force-dynamic'` e sessão por `usuarioAtual()` com 401 em JSON (CONVENCOES seção 5, "Handler HTTP"). Ações de formulário são ações de servidor em `src/app/acoes.ts` (`mensagemDe` e `mensagemSemSegredo`, `src/app/acoes.ts:48-63`).

## Limites e cotas

Os testes que contam itens de menu: `tests/menu.test.ts:15-16` (itens comuns e de admin), `tests/rotas.test.ts` (menu do admin) e testes de `tests/projeto.test.ts` que citam `itens-de-menu.ts`; acrescentar o item "Sistema" muda esses números. Largura mínima 375 px, alvo de toque 44 px, tokens sem cor literal (`tests/tokens.test.ts`).

## Erros conhecidos e tratamento

`loading.tsx` acima de quem chama `notFound()` faz o 404 sair como 200 (CONVENCOES seção 5, FT-09): a guarda do `layout.tsx` fica acima do `loading.tsx`. Tabela que vira cartões abaixo de 768 px usa `data-rotulo` em cada célula (`src/estilos/global.css:1525`).

## Riscos para a nossa implementação

Gerar backup é uma ação demorada (cópia do banco e compactação do `storage/`): a tela precisa de estado de "gerando" e a rota não pode estourar prazo. Download do backup é arquivo grande e com dado pessoal: só admin, só dentro de `BACKUP_DIR`, nome sem travessia. Páginas de erro de raiz não existem (`ls src/app`).

## Fonte

`src/componentes/itens-de-menu.ts`, `src/app/(sistema)/configuracoes/`, `src/app/sessao-servidor.ts`, `src/app/acoes.ts`, `src/estilos/global.css`, `tests/menu.test.ts` — acessado em 2026-10-01
