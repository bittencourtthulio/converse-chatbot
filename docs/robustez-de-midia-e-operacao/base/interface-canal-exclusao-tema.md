# Interface: badge de canal, aviso de exclusão do agente e alternador de tema

## Contrato de entrada

`BadgeDeCanal({canal})` renderiza `<span class="badge-de-canal badge-de-canal-<canal>">` com o rótulo (`src/componentes/BadgeDeCanal.tsx:7-9`, `rotuloDoCanal` em `src/servicos/historico-logica.ts:152-153`). As cores vêm de `--canal-{painel,widget,telegram}-{bg,fg,borda}` em `src/estilos/tokens.css:64-72` (claro), `:146-154` (escuro explícito) e `:208-216` (escuro por preferência); a classe está em `src/estilos/global.css:1466-1479`. `BotaoExcluirAgente({agente:{id,nome}, acao, confirmandoInicial})` mostra "O agente e as configurações dele serão apagados de vez. Isso não pode ser desfeito." (`src/componentes/BotaoExcluirAgente.tsx:71-73`); a página só passa `id` e `nome` (`src/app/(sistema)/agentes/[id]/page.tsx:48`). `AlternadorDeTema()` alterna `document.documentElement.dataset.theme`, lê `matchMedia('(prefers-color-scheme: dark)')` quando falta o dataset e grava `localStorage.tema` em `try/catch` (`src/componentes/AlternadorDeTema.tsx:11-24`); o botão tem `aria-label="Alternar tema"` fixo e nenhum `aria-pressed` (`:27-35`). O script anti-flash é a constante `SCRIPT_DO_TEMA` dentro de `src/app/layout.tsx:17`.

## Contrato de saída

A badge só tem cor e texto, sem padrão; o gráfico `GraficoDeMensagens` tem uma série só (`src/componentes/GraficoDeMensagens.tsx:22-86`). O aviso de exclusão não cita conversas, mensagens, fontes, arquivos, canal Telegram nem configuração do chat embutido. O alternador não tem teste: `grep -rn AlternadorDeTema tests` não encontra nenhum arquivo.

## Limites e cotas

Contraste 4,5:1 e ausência de cor literal em componente já são conferidos por `tests/tokens.test.ts:81,105-122` e `tests/tokens-historico.test.ts:55-76`. Alvos de toque de 44 px (PR-23). happy-dom 20.14.5 está nas dependências de desenvolvimento (`package.json`); `tests/formulario-de-agente.test.tsx:79-110` e `tests/embed-apagar-ui.test.tsx` mostram o padrão de teste de componente (renderToStaticMarkup e DOM simulado).

## Erros conhecidos e tratamento

PR-85 diz "rótulo e hachura" (`docs/projeto/PREMISSAS.md`, PR-85) e só o rótulo existe (achado 2 de `premissas-71-100.md`). PR-44 diz que "a tela de exclusão avisa" da cascata (achado 2 de `premissas-35-70.md`; cascata em `prisma/schema.prisma:89,112,134`). PR-23 e C-10 pedem teste de comportamento do alternador (A-03 de `pedido-aceite-entregas.md`).

## Riscos para a nossa implementação

(1) Padrão por CSS puro (`repeating-linear-gradient`) com `var(--canal-*-borda)`: nenhum valor de cor literal e legível nos dois temas; texto sobre o padrão não pode perder o contraste (padrão fino e de baixa opacidade, ou só na borda inferior). (2) O mapeamento canal para padrão deve ser função pura testável. (3) Contagens do aviso de exclusão precisam de leitura de serviço (conversas, mensagens, fontes, canal, config) com guarda de usuário: a página é de servidor e pode passar as contagens; `src/app` só chama `src/servicos`. (4) `aria-pressed` num botão renderizado no servidor não conhece o tema: ajustar depois da montagem (`useEffect`) evita divergência de hidratação (o comentário do componente garante HTML igual no servidor e no cliente). (5) Para testar o script anti-flash é preciso exportá-lo de um módulo que o layout e o teste importem.

## Fonte

`src/componentes/BadgeDeCanal.tsx`, `BotaoExcluirAgente.tsx`, `AlternadorDeTema.tsx`, `GraficoDeMensagens.tsx`, `src/app/layout.tsx`, `src/app/(sistema)/agentes/[id]/page.tsx`, `src/estilos/tokens.css`, `src/estilos/global.css`, `tests/formulario-de-agente.test.tsx`, `docs/projeto/validacao/` — acessado em 2026-10-01
