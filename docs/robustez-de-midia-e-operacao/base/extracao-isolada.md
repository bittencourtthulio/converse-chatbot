# Extração de texto: prazo que não interrompe CPU e limite de páginas

## Contrato de entrada

`extrairTexto({formato, bytes}, {prazoMs, maxCaracteres, extratores})` escolhe o extrator do formato (`src/lib/extracao/index.ts:32-42`) e corre contra um temporizador de 120 s (`LIMITES.prazoDaExtracaoMs`, `src/lib/extracao/limites.ts:14`) com `Promise.race` (`index.ts:76`). A fila chama `extrair({formato, bytes})` (`src/servicos/fontes-fila.ts:222`). O PDF abre com `getDocumentProxy(copia)`, confere `numPages > 500` (`src/lib/extracao/pdf.ts:20-27`, `LIMITES.paginasDoPdf`, `limites.ts:6`) e só depois chama `extractText` (`pdf.ts:28`). O DOCX passa por `conferirDocx` (zip bomb, 100 MB e razão 100, `limites.ts:10-12`) e `mammoth.extractRawText` (`src/lib/extracao/docx.ts:11`).

## Contrato de saída

Texto, ou `ErroDeAplicacao` 422 (`extracao_demorou`, `extracao_falhou`, `extracao_vazia`, `texto_grande_demais`, `pdf_paginas_demais`, `pdf_sem_texto`, `conteudo_invalido`) com frase nossa (`index.ts:63-98`, `pdf.ts:21-51`). A fila grava a mensagem do `ErroDeAplicacao` na fonte (`fontes-fila.ts:229-232`).

## Limites e cotas

120 s, 500 páginas, 5.000.000 caracteres (`limites.ts:6,8,14`). `Promise.race` não cancela o extrator: se ele consome CPU de forma síncrona o laço de eventos nem chega a disparar o temporizador, e o trabalho continua depois da recusa (achado 5 de `premissas-35-70.md`).

## Erros conhecidos e tratamento

`getDocumentProxy` já lê o índice do PDF (xref) e devolve `numPages` sem extrair texto; o limite de páginas é conferido **antes** de `extractText`, então o "só depois de abrir" é sobre abrir o documento (um PDF malicioso pode ser caro de abrir). Testes: `tests/extracao.test.ts`, `tests/extracao-pdf.test.ts`, `tests/extracao-docx.test.ts`, `tests/extracao-html.test.ts`, `tests/dependencias-extracao.test.ts`.

## Riscos para a nossa implementação

(1) Rodar o extrator num processo filho (`spawn(process.execPath, ['--import','tsx', arquivo.ts])`) que possa receber `SIGKILL` ao estourar o prazo é a opção que não depende do bundler do Next: a imagem tem `src/`, `scripts/` e o `tsx` em `dependencies` (`Dockerfile:55-62`, `package.json`, `scripts/*.ts` já rodam por `tsx`). `worker_threads` com `new Worker(new URL(...))` depende do Turbopack empacotar o arquivo (NÃO DOCUMENTADO aqui). (2) Os extratores usam só importações relativas e bibliotecas (`unpdf`, `mammoth`, `parse5`), sem `@/`, sem `next/*` (`index.ts:4`), então o filho pode importá-los. (3) Os bytes (até 25 MB) precisam chegar ao filho por `stdin` e o texto voltar por `stdout` com teto, ou por arquivo temporário; o erro volta como código e mensagem nossa. (4) Custo de partida do `tsx` por fonte (centenas de milissegundos): isolar só os formatos pesados (PDF, DOCX, HTML). (5) A memória do filho pode ser limitada por `--max-old-space-size`. (6) Se não for viável sob o build ou o contêiner, registrar o motivo com evidência e reclassificar PEND-27 como `decisao_humana`.

## Fonte

`src/lib/extracao/index.ts`, `pdf.ts`, `docx.ts`, `limites.ts`, `src/servicos/fontes-fila.ts`, `Dockerfile`, `package.json`, `docs/projeto/validacao/premissas-35-70.md` (achado 5) — acessado em 2026-10-01
