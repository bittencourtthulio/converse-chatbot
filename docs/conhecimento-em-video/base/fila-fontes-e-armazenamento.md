# Fila de fontes, serviço, armazenamento e extração (modo INTERNO)

## 1. Contrato de entrada

- `criarFila(opcoes)` com `relogio`, `armazenamento`, `concorrencia` (padrão 2, `src/servicos/fontes-fila.ts:133`) e `extrair` (só teste); `Fila` expõe `processarUma`, `processarPendentes`, `retomar`, `iniciar`, `acordar`, `ocioso` (`fontes-fila.ts:22-40`).
- `formatoDaFonte` só conhece `texto` (txt) e `arquivo` (pela extensão) e lança `tipo_nao_suportado` para o resto (`fontes-fila.ts:43-51`): `video` e `youtube` entram aqui.
- `processar` lê o original por `armazenamento().ler(caminhoArquivo)`, chama `extrair({formato, bytes})`, normaliza, divide e grava em transação (`fontes-fila.ts:98-130`); `gravarResultado` apaga trechos, cria em lotes de 500 e marca `pronto` (`fontes-fila.ts:66-96`); o `trabalhador` pega a próxima `pendente` por `criadoEm` (`:140-152`).
- `retomar()` devolve `processando` a `pendente` (`fontes-fila.ts:190-196`), chamado por `src/instrumentation.ts` na subida.
- `Armazenamento` grava só `<raiz>/fontes/<agenteId>/<fonteId>/original`, lê com regex de caminho fechado e apaga fonte ou agente (`src/lib/armazenamento.ts:30-95`); `gravar` recebe `Uint8Array` inteiro (`:35`): não serve para vídeo de 500 MB.
- `adicionarTexto` e `adicionarArquivos` criam a linha `pendente` e chamam `obterFila().acordar()` (`src/servicos/fontes.ts:111-141`, `:285-300`); `excluir` apaga linha e diretório (`:305-315`); `reprocessar` só de `erro` (`:318-333`); `visaoDaFonte` lista os campos visíveis (`:89-106`, hoje sem `etapa`, `progresso`, `duracaoSegundos`, `urlOrigem`).

## 2. Contrato de saída

- O handler devolve JSON `{fontes, resumo}` (GET) e `{resultados}` (POST multipart); erro `{codigo, mensagem}` com `Cache-Control: no-store` (`src/app/api/agentes/[id]/fontes/resposta.ts:12-20`).
- `gravarResultado` define `totalTrechos`, `caracteres`, `status: 'pronto'`, `processadoEm`.
- A tela lê `FonteDaTela` por `serializarFonte` (`src/componentes/fonte-da-tela.ts:15-25`), que copia o objeto inteiro: campos novos passam, mas o tipo vem de `FonteVisivel`.

## 3. Limites e cotas

- `MAX_UPLOAD_MB` 25 (`src/lib/ambiente.ts:95-97`); `LIMITES` (`src/lib/extracao/limites.ts`): 5 milhões de caracteres, 120 s de extração, 10 arquivos por envio, 200 caracteres de nome.
- O handler de arquivos usa `request.formData()` (`src/app/api/agentes/[id]/fontes/route.ts:40`), que carrega tudo em memória: proibido para vídeo (briefing).
- Fila: concorrência 2 e singleton em `globalThis` (`fontes-fila.ts:202-212`); só roda no mesmo processo (PR-05, PR-48).

## 4. Erros conhecidos e tratamento

- `ErroDeAplicacao` vira `erro` com a mensagem; qualquer outra exceção vira frase genérica com correlação no log, sem conteúdo (`fontes-fila.ts:112-129`, PR-48).
- Excluir durante o processamento: o resultado é descartado (`fontes-fila.ts:68-70`); atualizações de progresso devem usar `updateMany` para o mesmo efeito.
- Falha ao apagar arquivo vai ao log e não desfaz a exclusão (`fontes.ts:309-314`, PR-47).

## 5. Riscos para a nossa implementação

- Concorrência: a fila tem `concorrencia` único para todos os tipos; o briefing exige vídeo com concorrência 1 sem bloquear texto e arquivos: precisa de dois baldes (ou limite por tipo) no `trabalhador`.
- `processar` carrega o original inteiro (`ler`): vídeo nunca pode passar por aí; o fluxo de vídeo trabalha só com caminhos de disco e o ffmpeg.
- `retomar` volta a `pendente` e o reprocesso recomeça; sem os parciais em disco a retomada pagaria tudo de novo (por isso `segmentos/NN.txt`).
- Excluir fonte durante o trabalho de vídeo precisa parar de gastar crédito: a checagem de existência da linha entre partes é necessária.
- `Fonte.tamanhoBytes` é `Int` do SQLite: 500 MB cabe (limite de 2 GB do inteiro de 32 bits do Prisma `Int`: 2 147 483 647 bytes; fonte: tipo `Int` do Prisma, conhecimento comum, NÃO DOCUMENTADO em arquivo do projeto).
- `limparBanco` (`tests/ajuda.ts:39-49`) já cobre `fonte`; sem tabela nova nesta feature.

## 6. Fonte

`src/servicos/fontes-fila.ts`, `src/servicos/fontes.ts`, `src/lib/armazenamento.ts`, `src/lib/extracao/limites.ts`, `src/app/api/agentes/[id]/fontes/route.ts`, `docs/conhecimento-arquivos-e-texto/RELATORIO-FEATURE.md`, `docs/projeto/PREMISSAS.md` (PR-45 a PR-49), lidos em 2026-09-30.
