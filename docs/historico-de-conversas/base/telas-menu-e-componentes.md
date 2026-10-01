# Menu, páginas, componentes e tokens existentes (modo INTERNO)

## 1. Contrato de entrada

- Menu: lista única `GRUPOS_DE_MENU` em `src/componentes/itens-de-menu.ts:46-70`; o grupo sem título tem `Painel` e `Agentes`; `migalhasDaRota` (`:84-98`) herda o título do pai para `/<item>/<id>` por prefixo; `NomeDeIcone` (`:5-34`) lista os ícones aceitos (há `conversa`, `lixeira`, `alerta`, `agentes`, `painel`). Teste que fixa o grupo: `tests/menu.test.ts:30-39` (espera exatamente Painel e Agentes).
- Páginas do sistema em `src/app/(sistema)/`: `page.tsx` (painel com estado vazio fixo, `src/app/(sistema)/page.tsx:1-40`), `agentes/(lista)/page.tsx` (modelo de página de lista: `exigirUsuario`, `CabecalhoDaPagina`, `EstadoVazio`, `loading.tsx` ao lado), `error.tsx` do sistema. O teste `tests/rotas.test.ts:111-122` espera no painel "Ainda não há o que mostrar", `estado-vazio` e ausência de "Cadastrar usuário" para usuário comum: precisará mudar.
- Componentes reutilizáveis: `Badge` (variantes neutro, acento, sucesso, perigo, aviso; `src/componentes/Badge.tsx`), `Alerta` (`Alerta.tsx`), `EstadoVazio`, `CabecalhoDaPagina`, `Esqueleto`, `CartoesDeResumo` (modelo de cartões de número, classes `.cartoes-de-resumo`, `.cartao-resumo*`, `src/estilos/global.css:814-817`), `FontesDaResposta` (props `fontes`, `idBase`, `abertas`, `aoAlternar`; controlado, `src/componentes/FontesDaResposta.tsx:7-12`), `TextoDoModelo` (renderizador seguro, nunca `dangerouslySetInnerHTML`, `src/componentes/TextoDoModelo.tsx`), `texto-seguro.ts`.
- Handler HTTP: `src/app/api/<recurso>/route.ts`, `export const dynamic = 'force-dynamic'`, sessão por `usuarioAtual()` (401 em JSON), erro de serviço traduzido (`src/app/api/agentes/[id]/conversar/route.ts:10-50`).
- Tokens: `src/estilos/tokens.css` (claro e dois blocos escuros idênticos, conferidos por `tests/tokens.test.ts`); tokens de estado `--success-*`, `--warning-*`, `--danger-*`, `--info-*`, `--accent-*`. Não há token de série de gráfico nem de badge de canal: a F3 decide se cria.

## 2. Contrato de saída

- Pasta de rota nova: `src/app/(sistema)/conversas/page.tsx` e `[id]/page.tsx`, `loading.tsx` ao lado, erro pelo `error.tsx` do sistema. Estilos em `src/estilos/global.css` (1424 linhas na data de acesso), classes em português com hífen.

## 3. Limites e cotas

- Alvo de toque 44px (`--alvo-toque`), largura do conteúdo 1120px, gaveta abaixo de 768px (`docs/stack/CONVENCOES.md`, seção Interface).

## 4. Erros conhecidos e tratamento

- Estados vazio, carregando e erro obrigatórios em tela que busca dado (PR-23).

## 5. Riscos para a nossa implementação

- Qualquer cor literal em `.ts`, `.tsx` ou `.css` fora de `tokens.css` reprova `tests/tokens.test.ts`; token novo precisa dos dois blocos escuros idênticos e contraste 4,5:1 conferido pelo teste.
- A barra lateral, a gaveta e o título do cabeçalho leem a mesma lista; trocar a ordem do grupo quebra `tests/menu.test.ts` e talvez outros testes que contam itens.
- `src/app/(sistema)/page.tsx` é a E-1 do template: o título "Painel" e o subtítulo "Visão geral da sua conta." devem ficar (briefing).

## 6. Fonte

Arquivos citados (acesso em 2026-10-01).
