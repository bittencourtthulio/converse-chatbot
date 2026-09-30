# Script `widget.js`, testes de DOM e ferramentas de verificação

## Contrato de entrada

- O script é servido por rota do Next (`src/app/widget.js/route.ts`), lendo um arquivo-fonte legível versionado; `Content-Type: application/javascript`, `Cache-Control: public, max-age=300`, `Access-Control-Allow-Origin: *`, `Cross-Origin-Resource-Policy: cross-origin` (pedido da feature).
- Entrada do script na página do cliente: atributo `data-agent` (id), `data-position` e `data-color` opcionais; a origem da plataforma vem de `new URL(script.src).origin`.
- Testes: o ambiente do Vitest é `node` (`vitest.config.ts`), sem jsdom (`docs/stack/CONVENCOES.md`, seção 5, "Lógica de tela sem navegador"); o teste do script precisa de `happy-dom` (ou jsdom) por arquivo, com `// @vitest-environment`.

## Contrato de saída

- O script cria um botão flutuante e o painel em Shadow DOM, carrega `<iframe src="{origem}/embed/{id}">` ao abrir, expõe no máximo `window.Converse` (`abrir`, `fechar`).

## Limites e cotas

- `Cache-Control` de 300 segundos no script: uma correção do script demora até 5 minutos para chegar a quem já o carregou.

## Erros conhecidos e tratamento

- Agente inativo ou inexistente: `GET config` devolve 404 e o script não mostra nada nem escreve no console do site hospedeiro.

## Riscos para a nossa implementação

- Cores literais: o script roda em site de terceiro e não lê os tokens do sistema; o teste `tests/tokens.test.ts` só varre `.ts`, `.tsx` e `.css` de `src`, e a exceção do script precisa ser declarada em `CONVENCOES.md`.
- Sites com CSP própria podem bloquear o iframe, o script ou os estilos inline do Shadow DOM: invalida o PR-08 nesses sites (texto de "O que invalida" do PR-08).
- Mensagem `postMessage` sem verificação de `event.origin` permitiria que outra janela fechasse ou redimensionasse o painel.
- As ferramentas de navegador (Chrome via ToolSearch) podem não estar disponíveis; nesse caso a verificação de ponta a ponta fica sem ser feita e é registrada.

## Fonte

`vitest.config.ts`, `package.json`, `tests/tokens.test.ts`, `docs/stack/CONVENCOES.md`, `docs/projeto/PREMISSAS.md` (PR-08) — acessados em 2026-09-30.
