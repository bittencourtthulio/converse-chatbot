# Interface: abas do agente, componentes, estilos e testes de componente

## Contrato de entrada

`ABAS_DO_AGENTE` em `src/componentes/abas-do-agente.ts:12` (`{rotulo, caminho}`); `AbasDoAgente` (`src/componentes/AbasDoAgente.tsx`) renderiza um link por aba e marca `aria-current` pelo caminho. O layout do agente (`src/app/(sistema)/agentes/[id]/layout.tsx`) carrega o agente e mostra `CabecalhoDaPagina` e as abas; a subrota nova mora ao lado, em `agentes/[id]/testar/`. `AgenteVisivel` traz `mensagemInicial` (`src/servicos/agentes.ts`).

## Contrato de saída

Componentes existentes: `Alerta` (variantes `info|erro|sucesso|aviso`; erro é `role="alert"`), `EstadoVazio`, `Esqueleto`/`EsqueletoDePagina`, `Icone` (`src/componentes/Icones.tsx`), `Badge`. Tokens semânticos em `src/estilos/tokens.css:15-121` (superfícies `--bg-*`, texto `--fg-*`, `--accent*`, `--danger-*`, `--border*`, `--raio-*`, `--alvo-toque`, `--sombra-*`, `--font-mono`), tema claro e escuro. Classes em `src/estilos/global.css` (693 linhas): `.cartao`, `.botao`, `.botao-pequeno`, `.campo`, `.campo-ajuda`, `.alerta*`, `.aba*`, `.somente-leitor`, `.pilha`.

## Limites e cotas

Alvos de toque de 44px abaixo de 768px (`src/estilos/global.css:560-568`). Contraste 4,5:1 e ausência de cor literal fora de `tokens.css` são provados por `tests/tokens.test.ts`.

## Erros conhecidos e tratamento

Testes de componente usam `renderToStaticMarkup` (`tests/abas-do-agente.test.tsx`, `tests/formulario-de-agente.test.tsx`), em ambiente `node`: não há jsdom em `package.json`. Comportamento interativo (Enter, Parar, stream) precisa estar em módulos puros testáveis, com o componente cliente fino. Não há ícone de "enviar" nem de "parar" no conjunto de `Icones.tsx` (a conferir na tarefa de interface).

## Riscos para a nossa implementação

- Renderização do texto do modelo: nunca `dangerouslySetInnerHTML`; interpretar markdown mínimo em nós React; link só `http`/`https`.
- Componente cliente é o único a usar `fetch`; a leitura do SSE do navegador precisa de módulo próprio.
- A aba "Testar" precisa carregar a última conversa no servidor (página de servidor) e passá-la ao componente cliente.
- Sem jsdom, a verificação de foco, rolagem e Enter fica na verificação visual (`docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md` tem o padrão).

## Fonte

`src/componentes/`, `src/estilos/`, `src/app/(sistema)/agentes/[id]/`, `tests/` — acessados em 2026-09-30.
