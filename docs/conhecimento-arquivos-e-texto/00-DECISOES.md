---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-09-30
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: "densidade mvp ou profundo"
    motivo: "respondido por buildx; PR-35 e PROJETO.md (Modo escolhido)"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "tabelas Fonte (@@map fontes) e Trecho (@@map trechos): Fonte com id cuid, agenteId (cascata), tipo texto livre arquivo|texto|video|youtube (so arquivo e texto criados), titulo, nomeOriginal?, tipoMime?, tamanhoBytes Int, caminhoArquivo?, status default pendente, mensagemErro?, totalTrechos default 0, caracteres default 0, criadoPorId? (SetNull), criadoEm, atualizadoEm, processadoEm?; Trecho com id, fonteId (cascata), agenteId (cascata, desnormalizado), indice, texto, caracteres; indice por agenteId em Fonte e indices (fonteId, indice) e (agenteId) em Trecho; migration so acrescenta; limparBanco apaga trecho e fonte antes do agente"
    alternativa_descartada: "enum do banco (SQLite nao tem) e Trecho sem agenteId"
    motivo: "briefing item 1, PR-04, PR-30, PR-46, base/banco-armazenamento-e-ambiente.md"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "o texto colado tambem vira arquivo original em disco (caminhoArquivo preenchido, tipoMime text/plain, extensao logica txt), para a fila e o reprocessar tratarem arquivo e texto pelo mesmo caminho; caminhoArquivo nulo fica reservado para tipos sem arquivo (youtube, FT-08)"
    alternativa_descartada: "guardar o texto colado numa coluna do banco"
    motivo: "briefing item 1 (caminhoArquivo ou nulo), PR-47, PR-05"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "STORAGE_DIR (padrao ./storage, relativo ao cwd) e MAX_UPLOAD_MB (inteiro positivo, padrao 25) em src/lib/ambiente.ts e .env.example; o .gitignore ja ignora storage/; nenhuma leitura de process.env fora de ambiente.ts, com uma excecao declarada: a seed le STORAGE_DIR direto, como ja le DATABASE_URL"
    alternativa_descartada: "ler as variaveis direto nos modulos"
    motivo: "briefing itens 2 e 3, CONVENCOES secao 6 (Configuracao e segredo), PR-47"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "src/lib/armazenamento.ts: criarArmazenamento(raiz) devolve gravar(agenteId, fonteId, bytes) -> caminho relativo, ler(caminhoRelativo), apagarFonte(agenteId, fonteId), apagarAgente(agenteId); ids validados por /^[A-Za-z0-9_-]{1,64}$/ e caminho resolvido conferido dentro da raiz (erro se escapar); gravacao por arquivo temporario e rename; permissao 0o600 no arquivo e 0o700 nos diretorios; sem imports com alias @/ (a seed o importa); o padrao com a raiz de ambiente.storageDir e criado por quem usa"
    alternativa_descartada: "modulo dependente de ambiente.ts por alias"
    motivo: "briefing item 2, PR-47, PR-13"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "agentes.excluir passa a apagar o diretorio do agente em disco depois de excluir a linha; falha ao apagar vai para o log e nao desfaz a exclusao; teste com diretorio temporario"
    alternativa_descartada: "apagar arquivos so por rotina de limpeza depois"
    motivo: "briefing item 2, PR-47, base/banco-armazenamento-e-ambiente.md"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "tipo pela extensao (.pdf .docx .txt .md .csv .html .htm .json .srt .vtt), MIME gravado derivado da extensao, nunca o enviado; ate 10 arquivos por envio; cada um ate MAX_UPLOAD_MB; corpo recusado por Content-Length acima de MAX_UPLOAD_MB x 10 + 1 MB; extensao fora da lista, arquivo vazio ou conteudo que nao bate viram recusa individual com motivo"
    alternativa_descartada: "confiar no Content-Type do navegador"
    motivo: "briefing item 3, PR-10, PR-13, PR-45"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "conferencia de conteudo em src/lib/extracao/conteudo.ts: %PDF- no inicio; DOCX = ZIP com word/document.xml; texto decodifica como UTF-8 (BOM removido) e senao Latin-1 (TextDecoder windows-1252), com byte nulo recusado; .json precisa ser JSON valido; DOCX conferido por leitura propria do diretorio central do ZIP (src/lib/extracao/zip.ts, sem dependencia nova) e descompactacao real com teto (node:zlib inflateRawSync com maxOutputLength) de cada entrada: soma real <= 100 MB, razao <= 100:1, entrada cifrada recusada"
    alternativa_descartada: "usar jszip diretamente (licenca dupla MIT ou GPL) ou confiar no tamanho declarado no cabecalho"
    motivo: "briefing item 3, PR-45, base/extracao-bibliotecas.md (riscos de zip bomb e licenca do jszip)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "extracao em src/lib/extracao/index.ts: extrairTexto({formato, bytes}) devolve texto puro; um adaptador por formato (pdf.ts com unpdf, docx.ts com mammoth extractRawText, texto.ts, csv.ts, html.ts com parse5, json.ts, legenda.ts para srt e vtt); qualquer excecao de biblioteca vira ErroDeAplicacao com mensagem generica em portugues sem repassar a da biblioteca; prazo de 120 s; sem next/* e sem rede"
    alternativa_descartada: "adaptadores dentro de src/servicos"
    motivo: "briefing item 4, CONVENCOES secao 5 (Adaptador de servico externo em src/lib), PR-45"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "dependencias novas com versao fixa: unpdf 1.8.1, mammoth 1.13.0 e parse5 8.0.1, mais npm audit --audit-level=high em 0; se o build do Next quebrar unpdf ou mammoth, serverExternalPackages em next.config.ts, provado por npm run build e teste de rota (lacuna 3 da base)"
    alternativa_descartada: "pdf-parse e htmlparser2 (mais dependencias) ou parser de HTML escrito a mao"
    motivo: "briefing item 4, PR-26, base/extracao-bibliotecas.md"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "regras por formato: PDF (max 500 paginas, texto vazio = erro de PDF escaneado com a mensagem exata da PR-45); DOCX (texto bruto, vazio = erro); TXT e MD (texto); CSV (delimitador , ou ; pelo cabecalho fora de aspas, campos entre aspas, primeira linha = cabecalho, saida 'Colunas: a, b' e uma linha 'coluna: valor; coluna: valor' por registro, valores vazios omitidos); HTML (parse5, ignora script style nav noscript head template iframe svg, titulos como '# ' a '###### ', paragrafos separados por linha em branco, itens de lista com '- ', celulas de tabela separadas por ' | '); JSON (achatado em 'caminho: valor', caminho como a.b[0].c, vazios omitidos); SRT e VTT (sem cabecalho WEBVTT, blocos NOTE, numeracao e linhas de tempo, sem marcas <...>, falas unidas por espaco)"
    alternativa_descartada: "pdf sem aviso de escaneado; html com regex"
    motivo: "briefing item 4, PR-45"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "limites de extracao em constantes de src/lib/extracao/limites.ts: 500 paginas, 5.000.000 caracteres, 100 MB descompactado, razao 100, 120 s; extracao vazia (so espaco) e erro com mensagem propria"
    alternativa_descartada: "limites espalhados"
    motivo: "briefing item 3, PR-45"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "src/servicos/trechos.ts: dividirEmTrechos(texto, opcoes?) com alvo 1000 caracteres (maximo do trecho), sobreposicao 150, normalizacao antes (CRLF, tres quebras ou mais viram duas, trim), corte por paragrafo, depois frase, depois palavra, depois caractere; nunca vazio; deterministica; sem imports com alias @/ (a seed a importa); testes de propriedade: todo trecho <= 1000, nenhum vazio, os trechos em ordem reconstroem o texto normalizado sem lacuna, e o resultado e igual em duas chamadas"
    alternativa_descartada: "biblioteca de chunking externa"
    motivo: "briefing item 5, PR-46"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "fila em src/servicos/fontes-fila.ts: criarFila({relogio, armazenamento, concorrencia=2}) com processarPendentes() aguardavel (roda ate nao haver pendente), reivindicar por updateMany condicional pendente->processando, gravar trechos e pronto numa transacao (deleteMany dos trechos da fonte + createMany em lotes de 500 + update da fonte), erro grava status erro, mensagemErro amigavel e processadoEm, e log JSON com correlacao sem conteudo; retomar() converte processando em pendente; iniciar() liga o acordar automatico; acordar() so agenda trabalho depois de iniciar() (assim os testes de servico controlam a fila por processarPendentes()); singleton no globalThis para o uso real"
    alternativa_descartada: "fila externa (Redis e BullMQ)"
    motivo: "briefing item 6, PR-05, PR-48, CONVENCOES (Tarefa em segundo plano)"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "src/instrumentation.ts: register() so faz algo quando process.env.NEXT_RUNTIME === 'nodejs', importa a fila por import dinamico, chama retomar() e iniciar() sem await do processamento (nao bloqueia a subida); nao inicia durante next build, conferido por teste que sobe o servidor de producao"
    alternativa_descartada: "iniciar a fila dentro de handler na primeira requisicao"
    motivo: "briefing item 6, PR-48, base/servicos-handlers-e-fila.md (riscos de register e de hot reload; lacuna 5 da base)"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "reprocessar so a partir de erro (409 nos outros estados): zera mensagemErro, volta a pendente e acorda a fila; excluir fonte em processamento e seguro: a transacao final confere que a fonte ainda existe e descarta o resultado se nao"
    alternativa_descartada: "permitir reprocessar fonte pronta"
    motivo: "briefing item 6, PR-48"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "src/servicos/fontes.ts: adicionarArquivos(autor, agenteId, arquivos:[{nome, bytes}]) devolve um resultado por arquivo (aceito com a fonte ou recusado com codigo e motivo, sem lancar por arquivo); adicionarTexto(autor, agenteId, {titulo, conteudo}); listar(autor, agenteId); obter(autor, agenteId, fonteId); trechosDaFonte(autor, agenteId, fonteId, {pagina, porPagina=20}); excluir; reprocessar; resumo(autor, agenteId) = {total, prontas, emProcessamento (pendente + processando), comErro, caracteres (soma dos prontos)}; qualquer usuario autenticado gerencia (PR-12); zod na camada de aplicacao; agente inexistente e fonte de outro agente sao 404; a visao devolvida nunca inclui caminhoArquivo"
    alternativa_descartada: "expor o Prisma ao handler"
    motivo: "briefing item 7, PR-12, PR-13, PR-49, CONVENCOES secao 6 (Validacao de entrada)"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "titulo do arquivo = nome sanitizado (ultimo segmento depois de / ou \\\\, sem caracteres de controle, espacos colapsados, ate 200 caracteres, vazio vira 'arquivo'); nomeOriginal guarda o mesmo valor sanitizado; texto colado: titulo 1-120 e conteudo 1-200.000 caracteres, sem ser so espacos"
    alternativa_descartada: "guardar o nome bruto do navegador"
    motivo: "briefing item 3, PR-13, PR-45"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "handlers em src/app/api/agentes/[id]/fontes/: route.ts (POST multipart campo arquivos, 202 com resultado por arquivo, 422 se nenhum aceito; GET lista e resumo com Cache-Control no-store), texto/route.ts (POST JSON, 202), [fonteId]/route.ts (DELETE 204), [fonteId]/reprocessar/route.ts (POST 202); sessao por usuarioAtual() (401 JSON), 404, 413 por Content-Length antes de ler o corpo (e conferencia do tamanho real depois de ler), 415 se o Content-Type nao for o esperado, 422; erro inesperado com correlacao e sem pilha; testes funcionais com next start e upload multipart real"
    alternativa_descartada: "handlers com regra de negocio"
    motivo: "briefing item 8, PR-49, CONVENCOES secao 5 (Handler HTTP)"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "aba Conhecimento em abas-do-agente.ts (caminho conhecimento) e subrotas conhecimento/page.tsx, conhecimento/loading.tsx e conhecimento/[fonteId]/page.tsx (+ loading); a pagina do servidor carrega lista e resumo pelo servico e entrega ao componente cliente PainelDeConhecimento, unico lugar com fetch; opcoes de adicionar em lista extensivel src/componentes/opcoes-de-fonte.ts (arquivos e texto; a FT-08 acrescenta video); logica pura testavel fora do componente: validar arquivo no navegador (extensao e tamanho antes de enviar), reducer da fila de envio por arquivo, decisao de continuar o polling, formatadores de tamanho e data (fuso America/Sao_Paulo); envio por XMLHttpRequest para ter progresso, uma requisicao por arquivo"
    alternativa_descartada: "fetch espalhado nos componentes"
    motivo: "briefing item 9, PR-49, PR-23, CONVENCOES secao 5 (Lacuna de logica de tela sem navegador)"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "badge de status: pendente 'Na fila' neutro, processando 'Processando' acento com spinner, pronto 'Pronto' sucesso, erro 'Erro' perigo, sempre com texto; excluir com confirmacao na propria linha (padrao de BotaoExcluirAgente, sem window.confirm); Reprocessar so na linha em erro; 'Ver conteudo' abre conhecimento/[fonteId] com trechos de 20 em 20 por ?pagina=N, texto como texto puro (nunca HTML); estados vazio (convite), carregando (esqueleto) e erro (Alerta)"
    alternativa_descartada: "window.confirm"
    motivo: "briefing item 9, PR-23, PR-49"
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: "seed: o agente de exemplo ganha uma fonte de texto fictica curta (id fixo, status pronto, arquivo original gravado pelo criarArmazenamento(STORAGE_DIR) importado com caminho relativo e trechos gerados por dividirEmTrechos importado de src/servicos/trechos.js), idempotente por upsert e sem rodar a fila; a seed nao roda em producao"
    alternativa_descartada: "seed com SQL cru ou fonte sem arquivo"
    motivo: "briefing item 9, PR-25"
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: "logica de tela sem jsdom: componentes cliente ganham teste por render de string e por modulos puros, como na FT-03; verificacao visual em navegador registra o que foi visto ou a razao de nao ter sido possivel"
    alternativa_descartada: "instalar jsdom"
    motivo: "CONVENCOES secao 5 (Logica de tela sem navegador), LACUNAS.md (nova baixa da FT-03)"
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: "convencoes: converter as lacunas 5 (armazenamento em teste) e 8 (tarefa em segundo plano) e a regra de STORAGE_DIR em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md; incluir a nova regra de dependencia de extracao"
    alternativa_descartada: "deixar as lacunas abertas"
    motivo: "briefing item 10"
    status: fechada
    bloqueante: false
  - id: D-24
    decisao: "teste funcional de HTTP sobe next start com STORAGE_DIR e DATABASE_URL de teste, faz upload multipart real (FormData) com fixtures pequenas de tests/fixtures (PDF, DOCX, TXT, CSV, HTML, JSON, SRT, VTT geradas por script de teste, sem dado real), espera a fonte ficar pronto pelo GET e confere trechos, exclusao e reprocessamento"
    alternativa_descartada: "teste so de servico"
    motivo: "briefing item 8, PR-26, CONVENCOES secao 3 (Sistema de arquivos e HTTP de entrada)"
    status: fechada
    bloqueante: false
---

# Decisões — conhecimento-arquivos-e-texto

Respondido por buildx em modo autônomo, sem entrevista. A fonte de cada resposta está no último campo de cada linha; as premissas novas PR-45 a PR-49 foram criadas em `docs/projeto/PREMISSAS.md` (degrau 4) antes de responder. Sete eixos cobertos: escopo (D-00, D-06), arquitetura (D-04, D-08, D-13), contrato de dados (D-01, D-02, D-03), estado e observabilidade (D-13, D-15), resiliência (D-07, D-11, D-14), ambiente e segredos (D-03, D-05), definição de pronto (D-18, D-19, D-21). Lacunas da F1 tratadas: 1 e 2 (D-07, D-10), 3 (D-09), 4 (D-16), 5 (D-14), 6 (D-01), 7 e 8 (D-18, D-19, D-20).

## Decisões

```
D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PR-35 e PROJETO.md (Modo escolhido)
D-01 | tabelas Fonte (@@map fontes) e Trecho (@@map trechos): Fonte com id cuid, agenteId (cascata), tipo texto livre arquivo|texto|video|youtube (so arquivo e texto criados), titulo, nomeOriginal?, tipoMime?, tamanhoBytes Int, caminhoArquivo?, status default pendente, mensagemErro?, totalTrechos default 0, caracteres default 0, criadoPorId? (SetNull), criadoEm, atualizadoEm, processadoEm?; Trecho com id, fonteId (cascata), agenteId (cascata, desnormalizado), indice, texto, caracteres; indice por agenteId em Fonte e indices (fonteId, indice) e (agenteId) em Trecho; migration so acrescenta; limparBanco apaga trecho e fonte antes do agente | enum do banco (SQLite nao tem) e Trecho sem agenteId | briefing item 1, PR-04, PR-30, PR-46, base/banco-armazenamento-e-ambiente.md
D-02 | o texto colado tambem vira arquivo original em disco (caminhoArquivo preenchido, tipoMime text/plain, extensao logica txt), para a fila e o reprocessar tratarem arquivo e texto pelo mesmo caminho; caminhoArquivo nulo fica reservado para tipos sem arquivo (youtube, FT-08) | guardar o texto colado numa coluna do banco | briefing item 1 (caminhoArquivo ou nulo), PR-47, PR-05
D-03 | STORAGE_DIR (padrao ./storage, relativo ao cwd) e MAX_UPLOAD_MB (inteiro positivo, padrao 25) em src/lib/ambiente.ts e .env.example; o .gitignore ja ignora storage/; nenhuma leitura de process.env fora de ambiente.ts, com uma excecao declarada: a seed le STORAGE_DIR direto, como ja le DATABASE_URL | ler as variaveis direto nos modulos | briefing itens 2 e 3, CONVENCOES secao 6 (Configuracao e segredo), PR-47
D-04 | src/lib/armazenamento.ts: criarArmazenamento(raiz) devolve gravar(agenteId, fonteId, bytes) -> caminho relativo, ler(caminhoRelativo), apagarFonte(agenteId, fonteId), apagarAgente(agenteId); ids validados por /^[A-Za-z0-9_-]{1,64}$/ e caminho resolvido conferido dentro da raiz (erro se escapar); gravacao por arquivo temporario e rename; permissao 0o600 no arquivo e 0o700 nos diretorios; sem imports com alias @/ (a seed o importa); o padrao com a raiz de ambiente.storageDir e criado por quem usa | modulo dependente de ambiente.ts por alias | briefing item 2, PR-47, PR-13
D-05 | agentes.excluir passa a apagar o diretorio do agente em disco depois de excluir a linha; falha ao apagar vai para o log e nao desfaz a exclusao; teste com diretorio temporario | apagar arquivos so por rotina de limpeza depois | briefing item 2, PR-47, base/banco-armazenamento-e-ambiente.md
D-06 | tipo pela extensao (.pdf .docx .txt .md .csv .html .htm .json .srt .vtt), MIME gravado derivado da extensao, nunca o enviado; ate 10 arquivos por envio; cada um ate MAX_UPLOAD_MB; corpo recusado por Content-Length acima de MAX_UPLOAD_MB x 10 + 1 MB; extensao fora da lista, arquivo vazio ou conteudo que nao bate viram recusa individual com motivo | confiar no Content-Type do navegador | briefing item 3, PR-10, PR-13, PR-45
D-07 | conferencia de conteudo em src/lib/extracao/conteudo.ts: %PDF- no inicio; DOCX = ZIP com word/document.xml; texto decodifica como UTF-8 (BOM removido) e senao Latin-1 (TextDecoder windows-1252), com byte nulo recusado; .json precisa ser JSON valido; DOCX conferido por leitura propria do diretorio central do ZIP (src/lib/extracao/zip.ts, sem dependencia nova) e descompactacao real com teto (node:zlib inflateRawSync com maxOutputLength) de cada entrada: soma real <= 100 MB, razao <= 100:1, entrada cifrada recusada | usar jszip diretamente (licenca dupla MIT ou GPL) ou confiar no tamanho declarado no cabecalho | briefing item 3, PR-45, base/extracao-bibliotecas.md (riscos de zip bomb e licenca do jszip)
D-08 | extracao em src/lib/extracao/index.ts: extrairTexto({formato, bytes}) devolve texto puro; um adaptador por formato (pdf.ts com unpdf, docx.ts com mammoth extractRawText, texto.ts, csv.ts, html.ts com parse5, json.ts, legenda.ts para srt e vtt); qualquer excecao de biblioteca vira ErroDeAplicacao com mensagem generica em portugues sem repassar a da biblioteca; prazo de 120 s; sem next/* e sem rede | adaptadores dentro de src/servicos | briefing item 4, CONVENCOES secao 5 (Adaptador de servico externo em src/lib), PR-45
D-09 | dependencias novas com versao fixa: unpdf 1.8.1, mammoth 1.13.0 e parse5 8.0.1, mais npm audit --audit-level=high em 0; se o build do Next quebrar unpdf ou mammoth, serverExternalPackages em next.config.ts, provado por npm run build e teste de rota (lacuna 3 da base) | pdf-parse e htmlparser2 (mais dependencias) ou parser de HTML escrito a mao | briefing item 4, PR-26, base/extracao-bibliotecas.md
D-10 | regras por formato: PDF (max 500 paginas, texto vazio = erro de PDF escaneado com a mensagem exata da PR-45); DOCX (texto bruto, vazio = erro); TXT e MD (texto); CSV (delimitador , ou ; pelo cabecalho fora de aspas, campos entre aspas, primeira linha = cabecalho, saida 'Colunas: a, b' e uma linha 'coluna: valor; coluna: valor' por registro, valores vazios omitidos); HTML (parse5, ignora script style nav noscript head template iframe svg, titulos como '# ' a '###### ', paragrafos separados por linha em branco, itens de lista com '- ', celulas de tabela separadas por ' | '); JSON (achatado em 'caminho: valor', caminho como a.b[0].c, vazios omitidos); SRT e VTT (sem cabecalho WEBVTT, blocos NOTE, numeracao e linhas de tempo, sem marcas <...>, falas unidas por espaco) | pdf sem aviso de escaneado; html com regex | briefing item 4, PR-45
D-11 | limites de extracao em constantes de src/lib/extracao/limites.ts: 500 paginas, 5.000.000 caracteres, 100 MB descompactado, razao 100, 120 s; extracao vazia (so espaco) e erro com mensagem propria | limites espalhados | briefing item 3, PR-45
D-12 | src/servicos/trechos.ts: dividirEmTrechos(texto, opcoes?) com alvo 1000 caracteres (maximo do trecho), sobreposicao 150, normalizacao antes (CRLF, tres quebras ou mais viram duas, trim), corte por paragrafo, depois frase, depois palavra, depois caractere; nunca vazio; deterministica; sem imports com alias @/ (a seed a importa); testes de propriedade: todo trecho <= 1000, nenhum vazio, os trechos em ordem reconstroem o texto normalizado sem lacuna, e o resultado e igual em duas chamadas | biblioteca de chunking externa | briefing item 5, PR-46
D-13 | fila em src/servicos/fontes-fila.ts: criarFila({relogio, armazenamento, concorrencia=2}) com processarPendentes() aguardavel (roda ate nao haver pendente), reivindicar por updateMany condicional pendente->processando, gravar trechos e pronto numa transacao (deleteMany dos trechos da fonte + createMany em lotes de 500 + update da fonte), erro grava status erro, mensagemErro amigavel e processadoEm, e log JSON com correlacao sem conteudo; retomar() converte processando em pendente; iniciar() liga o acordar automatico; acordar() so agenda trabalho depois de iniciar() (assim os testes de servico controlam a fila por processarPendentes()); singleton no globalThis para o uso real | fila externa (Redis e BullMQ) | briefing item 6, PR-05, PR-48, CONVENCOES (Tarefa em segundo plano)
D-14 | src/instrumentation.ts: register() so faz algo quando process.env.NEXT_RUNTIME === 'nodejs', importa a fila por import dinamico, chama retomar() e iniciar() sem await do processamento (nao bloqueia a subida); nao inicia durante next build, conferido por teste que sobe o servidor de producao | iniciar a fila dentro de handler na primeira requisicao | briefing item 6, PR-48, base/servicos-handlers-e-fila.md (riscos de register e de hot reload; lacuna 5 da base)
D-15 | reprocessar so a partir de erro (409 nos outros estados): zera mensagemErro, volta a pendente e acorda a fila; excluir fonte em processamento e seguro: a transacao final confere que a fonte ainda existe e descarta o resultado se nao | permitir reprocessar fonte pronta | briefing item 6, PR-48
D-16 | src/servicos/fontes.ts: adicionarArquivos(autor, agenteId, arquivos:[{nome, bytes}]) devolve um resultado por arquivo (aceito com a fonte ou recusado com codigo e motivo, sem lancar por arquivo); adicionarTexto(autor, agenteId, {titulo, conteudo}); listar(autor, agenteId); obter(autor, agenteId, fonteId); trechosDaFonte(autor, agenteId, fonteId, {pagina, porPagina=20}); excluir; reprocessar; resumo(autor, agenteId) = {total, prontas, emProcessamento (pendente + processando), comErro, caracteres (soma dos prontos)}; qualquer usuario autenticado gerencia (PR-12); zod na camada de aplicacao; agente inexistente e fonte de outro agente sao 404; a visao devolvida nunca inclui caminhoArquivo | expor o Prisma ao handler | briefing item 7, PR-12, PR-13, PR-49, CONVENCOES secao 6 (Validacao de entrada)
D-17 | titulo do arquivo = nome sanitizado (ultimo segmento depois de / ou \\, sem caracteres de controle, espacos colapsados, ate 200 caracteres, vazio vira 'arquivo'); nomeOriginal guarda o mesmo valor sanitizado; texto colado: titulo 1-120 e conteudo 1-200.000 caracteres, sem ser so espacos | guardar o nome bruto do navegador | briefing item 3, PR-13, PR-45
D-18 | handlers em src/app/api/agentes/[id]/fontes/: route.ts (POST multipart campo arquivos, 202 com resultado por arquivo, 422 se nenhum aceito; GET lista e resumo com Cache-Control no-store), texto/route.ts (POST JSON, 202), [fonteId]/route.ts (DELETE 204), [fonteId]/reprocessar/route.ts (POST 202); sessao por usuarioAtual() (401 JSON), 404, 413 por Content-Length antes de ler o corpo (e conferencia do tamanho real depois de ler), 415 se o Content-Type nao for o esperado, 422; erro inesperado com correlacao e sem pilha; testes funcionais com next start e upload multipart real | handlers com regra de negocio | briefing item 8, PR-49, CONVENCOES secao 5 (Handler HTTP)
D-19 | aba Conhecimento em abas-do-agente.ts (caminho conhecimento) e subrotas conhecimento/page.tsx, conhecimento/loading.tsx e conhecimento/[fonteId]/page.tsx (+ loading); a pagina do servidor carrega lista e resumo pelo servico e entrega ao componente cliente PainelDeConhecimento, unico lugar com fetch; opcoes de adicionar em lista extensivel src/componentes/opcoes-de-fonte.ts (arquivos e texto; a FT-08 acrescenta video); logica pura testavel fora do componente: validar arquivo no navegador (extensao e tamanho antes de enviar), reducer da fila de envio por arquivo, decisao de continuar o polling, formatadores de tamanho e data (fuso America/Sao_Paulo); envio por XMLHttpRequest para ter progresso, uma requisicao por arquivo | fetch espalhado nos componentes | briefing item 9, PR-49, PR-23, CONVENCOES secao 5 (Lacuna de logica de tela sem navegador)
D-20 | badge de status: pendente 'Na fila' neutro, processando 'Processando' acento com spinner, pronto 'Pronto' sucesso, erro 'Erro' perigo, sempre com texto; excluir com confirmacao na propria linha (padrao de BotaoExcluirAgente, sem window.confirm); Reprocessar so na linha em erro; 'Ver conteudo' abre conhecimento/[fonteId] com trechos de 20 em 20 por ?pagina=N, texto como texto puro (nunca HTML); estados vazio (convite), carregando (esqueleto) e erro (Alerta) | window.confirm | briefing item 9, PR-23, PR-49
D-21 | seed: o agente de exemplo ganha uma fonte de texto fictica curta (id fixo, status pronto, arquivo original gravado pelo criarArmazenamento(STORAGE_DIR) importado com caminho relativo e trechos gerados por dividirEmTrechos importado de src/servicos/trechos.js), idempotente por upsert e sem rodar a fila; a seed nao roda em producao | seed com SQL cru ou fonte sem arquivo | briefing item 9, PR-25
D-22 | logica de tela sem jsdom: componentes cliente ganham teste por render de string e por modulos puros, como na FT-03; verificacao visual em navegador registra o que foi visto ou a razao de nao ter sido possivel | instalar jsdom | CONVENCOES secao 5 (Logica de tela sem navegador), LACUNAS.md (nova baixa da FT-03)
D-23 | convencoes: converter as lacunas 5 (armazenamento em teste) e 8 (tarefa em segundo plano) e a regra de STORAGE_DIR em regras com arquivo:linha em CONVENCOES.md e LACUNAS.md; incluir a nova regra de dependencia de extracao | deixar as lacunas abertas | briefing item 10
D-24 | teste funcional de HTTP sobe next start com STORAGE_DIR e DATABASE_URL de teste, faz upload multipart real (FormData) com fixtures pequenas de tests/fixtures (PDF, DOCX, TXT, CSV, HTML, JSON, SRT, VTT geradas por script de teste, sem dado real), espera a fonte ficar pronto pelo GET e confere trechos, exclusao e reprocessamento | teste so de servico | briefing item 8, PR-26, CONVENCOES secao 3 (Sistema de arquivos e HTTP de entrada)
```

## Pendências

Nenhuma pendência. Nenhuma regra de negócio ficou sem resposta nos arquivos do projeto, então `00-BLOQUEIOS.md` segue vazio.
