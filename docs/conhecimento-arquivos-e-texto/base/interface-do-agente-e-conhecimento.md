# Interface do agente: abas, componentes, estilos e testes

## Contrato de entrada

`src/componentes/abas-do-agente.ts` tem a lista `ABAS_DO_AGENTE` (Configurações, Testar); o comentário do arquivo cita "Conhecimento (FT-04)" como a próxima. A aba é acrescentada na lista e a subrota fica em `src/app/(sistema)/agentes/[id]/<caminho>` (`layout.tsx` do agente carrega o agente e desenha as abas; a aba ativa considera subrotas por `startsWith`, o que serve a `conhecimento/[fonteId]`). Cada aba tem `page.tsx` e `loading.tsx` (`testar/`). Componentes reutilizáveis: `Badge` (variantes `neutro|acento|sucesso|perigo|aviso`), `Alerta`, `EstadoVazio`, `Esqueleto`, `CabecalhoDaPagina`, `Icone` (SVG inline, nomes em `NomeDeIcone`, definido em `src/componentes/itens-de-menu.ts`), `BotaoExcluirAgente` (confirmação na tela, máquina de estados pura exportada). Ícones existentes incluem `caixa-vazia`, `alerta`, `sucesso`, `enviar`, `parar`; não há ícone de arquivo, texto, lixeira, upload nem relógio.

## Contrato de saída

Estilos em `src/estilos/global.css` com classes em português (`.cartao`, `.tabela-envoltorio`, `.badge`, `.botao` com `.primario|.secundario|.perigo|.botao-pequeno`, `.abas`, `.campo`, `.pilha`, `.linha`, `.estado-vazio`, `.esqueleto`, `.confirmacao-de-exclusao`, `.grade-de-agentes`); cores só por tokens de `src/estilos/tokens.css` (`--bg-*`, `--fg-*`, `--accent*`, `--danger*`, `--success-*`, `--warning-*`, `--info-*`, `--raio-*`, `--alvo-toque` 44px). `tests/tokens.test.ts` proíbe valor de cor literal fora de `tokens.css` e confere contraste 4,5:1.

## Limites e cotas

Ambiente de teste de componente é `node`, sem jsdom (`vitest.config.ts`): a lógica de tela vai em módulos puros (reducer, funções) e o componente só liga ao DOM; `tests/*.test.tsx` renderizam a string do componente (`tests/abas-do-agente.test.tsx`, `tests/formulario-de-agente.test.tsx`). Polling e `fetch` só no componente cliente (`docs/stack/CONVENCOES.md` seção 5, "Resposta em stream"). Largura mínima de layout: 375px (PR-23). Recursos como `input type=file` com arrastar-e-soltar: `NÃO DOCUMENTADO` no repositório (sem exemplo).

## Erros conhecidos e tratamento

Toda tela que busca dado tem estado vazio, carregando (`loading.tsx`) e erro (`error.tsx` em `src/app/(sistema)/error.tsx`); ação de servidor em `src/app/acoes.ts` converte `ErroDeAplicacao` em mensagem; texto do usuário nunca via `dangerouslySetInnerHTML` (`src/componentes/texto-seguro.ts`, `tests/texto-seguro.test.tsx`). Texto de fonte extraído é conteúdo de terceiros: exibir como texto puro.

## Riscos para a nossa implementação

- A tela de fontes atualiza sozinha: polling cliente precisa parar quando não há fonte pendente e não empilhar requisições.
- Excluir com confirmação sem `window.confirm` (padrão de `BotaoExcluirAgente`).
- Ferramenta de navegador para a verificação visual: disponibilidade `NÃO DOCUMENTADO` até a task de verificação; a FT-03 conseguiu ver temas claro e escuro, não os 375px (`docs/conversa-de-teste/VERIFICACAO-VISUAL.md`).
- Arrastar e soltar depende de eventos de DOM sem teste automatizado: a lógica de aceitar/recusar por extensão e tamanho vai para módulo puro testável.

## Fonte

`src/componentes/`, `src/estilos/`, `src/app/(sistema)/agentes/[id]/`, `tests/`, `vitest.config.ts` — acessados em 2026-09-30.
