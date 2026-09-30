# Bibliotecas de extração (PDF, DOCX, HTML, ZIP)

## Contrato de entrada

- `unpdf` 1.8.1, licença MIT, zero dependências, `engines.node >=22`, 2.1 MB desempacotado (`npm view unpdf`, 2026-09-30). Uso documentado: `getDocumentProxy(new Uint8Array(buffer))` e `extractText(pdf, { mergePages: true })`, que devolve `{ totalPages, text }` (README do pacote, seção de uso). Embute uma build "serverless" do PDF.js 5.6.205 com polyfill de `Promise.withResolvers` (README).
- `mammoth` 1.13.0, BSD-2-Clause (`npm view mammoth`). `mammoth.extractRawText({ buffer })` devolve `{ value, messages }` (README, seção `extractRawText`). Dependências diretas: `lop`, `jszip ^3.7.1`, `argparse`, `base64-js`, `underscore`, `xmlbuilder`, `@xmldom/xmldom ^0.8.6`, `dingbat-to-unicode`.
- `parse5` 8.0.1, MIT, ESM (`type: module`), única dependência `entities` (`npm view parse5`). Parser HTML conforme a especificação WHATWG; não executa script. Alternativas vistas: `node-html-parser` 9.0.4 (depende de `css-select`), `htmlparser2` 12.0.0 (4 dependências).
- `jszip` 3.10.2, licença "MIT OR GPL-3.0-or-later" (`npm view jszip`); já entra transitivamente por `mammoth`.

## Contrato de saída

`unpdf`: texto por página ou mesclado; PDF sem camada de texto devolve texto vazio ou só espaço: comportamento exato para PDF escaneado `NÃO DOCUMENTADO` no README lido (será provado por fixture). `mammoth.extractRawText`: texto bruto, `messages` com avisos. Contagem de páginas: `totalPages` (README). Estrutura do resultado de `parse5` (`parse` devolve documento, árvore com `childNodes`, `nodeName`, `tagName`, `value` para texto): `NÃO DOCUMENTADO` nesta base (não lido), será conferido pelo teste do adaptador.

## Limites e cotas

Nenhum limite de páginas, de tamanho ou de descompactação é imposto pelas bibliotecas: `NÃO DOCUMENTADO` no README de `unpdf` e de `mammoth`. Os limites são do projeto (`docs/conhecimento-arquivos-e-texto/BRIEFING-BUILDX.md`, itens 3 e 4): 500 páginas, 5 milhões de caracteres, tamanho descompactado do DOCX, `MAX_UPLOAD_MB` 25 (`docs/projeto/PREMISSAS.md`, PR-10).

## Erros conhecidos e tratamento

PDF corrompido, cifrado ou DOCX que não é ZIP: a exceção lançada por cada biblioteca `NÃO DOCUMENTADO`; o adaptador precisa converter qualquer exceção em `ErroDeAplicacao` amigável sem repassar a mensagem interna. PDF.js 5 exige `Promise.withResolvers`, presente no Node 22 (`README` de `unpdf`, aviso sobre Node < 22; o projeto roda Node 22, `docs/stack/CONVENCOES.md` seção 1).

## Riscos para a nossa implementação

- PDF.js pode ler `fetch` de fontes ou recursos externos: `NÃO DOCUMENTADO` na build serverless; testar que a extração funciona sem rede.
- Zip bomb no DOCX: `mammoth` descompacta tudo sem limite conhecido; é preciso inspecionar o ZIP antes (tamanho declarado no diretório central e descompactação com teto) e recusar antes de chamar `mammoth`.
- A licença dupla de `jszip` exige escolher MIT; como a dependência é transitiva, o projeto não a importa diretamente se possível (usar leitura própria do diretório central do ZIP ou a API do próprio `jszip` só para conferir).
- `next build` e pacotes ESM/WASM com worker embutido: se o bundler do Next 16 quebrar o `unpdf`, é preciso `serverExternalPackages` em `next.config.ts` (efeito `NÃO DOCUMENTADO`; provar com `npm run build` e o teste de rota).
- Superfície de ataque: PDF e DOCX de terceiros chegam a um parser em JS no mesmo processo do servidor; tempo de extração precisa ter teto.

## Fonte

`npm view` de cada pacote e README dos pacotes `unpdf` e `mammoth` no registro npm — acessados em 2026-09-30.
