# Interface: aba Testar, aba Conhecimento e seed

## Contrato de entrada

- `ChatDeTeste` (`src/componentes/ChatDeTeste.tsx`) é o único componente de chat; estado no reducer puro `src/componentes/estado-da-conversa.ts` (`Bolha {id, papel, texto, estado}`, ações `enviar`, `trecho`, `fim`, `erro`...); recebe `retomada.mensagens` como `{id, papel, conteudo}` da página `src/app/(sistema)/agentes/[id]/testar/page.tsx`.
- Renderização segura de texto do modelo: `analisarTexto` (`src/componentes/texto-seguro.ts`) produz árvore (parágrafo, lista, código, negrito, link http/https) e `TextoDoModelo.tsx` a vira em elementos React; nunca HTML cru (`docs/stack/CONVENCOES.md` seção 5). Marcadores `[n]` hoje viram texto comum; o regex `INLINE` não os conhece e um `[1](url)` seria link.
- Aba Conhecimento: `src/app/(sistema)/agentes/[id]/conhecimento/page.tsx` monta `PainelDeConhecimento` (cartões de resumo, `AdicionarFontes`, lista de fontes); abas em `src/componentes/abas-do-agente.ts`.
- Estilos: tokens em `src/estilos/tokens.css` e classes em `src/estilos/global.css`; `tests/tokens.test.ts` proíbe cor literal; ambiente de teste de componente é `node` (sem jsdom), então a lógica de tela mora em módulos puros.
- Seed (`prisma/seed.ts`): o agente `agente-de-exemplo` ganha a fonte `fonte-de-exemplo` (texto de política de troca, horário, entrega, pagamento), com trechos criados por `prisma.trecho.createMany` — passam pelos gatilhos do índice, sem código extra de seed.

## Contrato de saída

- `POST /api/agentes/[id]/buscar` é novo; segue o padrão dos handlers finos de `fontes/` (sessão por `usuarioAtual()`, 401/404/422, `force-dynamic`).

## Limites e cotas

- Alvos de toque de 44 px, 375 px de largura, foco visível, estados vazio/carregando/erro (PR-23); `fetch` só em componente cliente de `src/componentes`.

## Erros conhecidos e tratamento

- Sem chave do OpenRouter a aba Testar avisa (`Alerta`); o cartão "Testar busca" não usa o OpenRouter e funciona sem chave.

## Riscos para a nossa implementação

- O contrato de `retomada` e de `Bolha` não tem fontes; ambos crescem de forma compatível (campo opcional) para não quebrar `tests/chat-de-teste.test.tsx` e `tests/estado-da-conversa.test.ts`.
- Sem jsdom nem janela de 375 px, o comportamento interativo é provado por módulos puros e verificação visual parcial (`docs/stack/LACUNAS.md`).

## Fonte

`src/componentes/ChatDeTeste.tsx`, `src/componentes/estado-da-conversa.ts`, `src/componentes/TextoDoModelo.tsx`, `src/componentes/texto-seguro.ts`, `src/app/(sistema)/agentes/[id]/testar/page.tsx`, `src/app/(sistema)/agentes/[id]/conhecimento/page.tsx`, `prisma/seed.ts`, `docs/stack/CONVENCOES.md`, `docs/stack/LACUNAS.md` — acessados em 2026-09-30.
