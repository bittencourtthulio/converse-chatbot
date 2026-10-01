---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-10-01
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: "densidade mvp ou profundo"
    motivo: "respondido por buildx; PROJETO.md (modo autonomo total) e briefing"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "src/lib/log.ts expoe log.debug, log.info, log.aviso e log.erro (msg, campos): uma linha JSON com nivel, quando, msg, correlacao e campos; saida por console.debug, console.info, console.warn e console.error (so aqui); nivel minimo por LOG_LEVEL (padrao info); redacao central por chave e por valor, Error so com nome e codigo, e-mail mascarado"
    alternativa_descartada: "biblioteca de log externa (pino, winston); redacao por quem chama"
    motivo: "PR-92 (nova); PR-21; CONVENCOES secao 6 (Log); base/log-e-erros.md (22 console.* e testes que espiam console.error, por isso o log segue usando console)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "a regra contra console.* em src/ e um teste de arquitetura (varre src/ por console\\.) mais regra no-console do ESLint com excecao para src/lib/log.ts, prisma/seed.ts, scripts/ e tests/; os 22 console.* de src/ viram chamadas ao log e os testes que liam evento passam a ler msg"
    alternativa_descartada: "so lint; so teste"
    motivo: "PR-92; briefing item 1; base/log-e-erros.md; CONVENCOES secao 5 (teste prova a regra com o ESLint real)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "a correlacao e gerada em src/proxy.ts para todas as rotas (matcher que exclui /_next/ e favicon), vai ao handler por cabecalho de requisicao x-correlacao e a resposta leva X-Correlacao; trabalhos em segundo plano (fila, expurgo, atendimento do Telegram) rodam dentro de comCorrelacao (AsyncLocalStorage em src/lib/log.ts), e o log inclui a correlacao do contexto automaticamente"
    alternativa_descartada: "AsyncLocalStorage aberto no proxy (processo e contexto distintos); ler headers() dentro do log (assincrono)"
    motivo: "PR-93 (nova); base/log-e-erros.md (lacuna: ALS do proxy nao chega ao handler); src/proxy.ts:12-28"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "gerarCorrelacao de chat-erros passa a delegar para novaCorrelacao de src/lib/log.ts (8 caracteres hexadecimais, como hoje); mensagemParaOperador e mensagemParaVisitante continuam com o mesmo texto"
    alternativa_descartada: "dois geradores de codigo"
    motivo: "PR-42 (mantida); PR-93"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "erro inesperado em rota de API, em acao de servidor e em fluxo SSE devolve a mensagem generica com Codigo de referencia e grava a linha de log com o nome do erro e o codigo, nunca message nem stack; as rotas leem a correlacao do cabecalho da requisicao, a acao gera uma nova"
    alternativa_descartada: "devolver a mensagem do erro ao operador"
    motivo: "PR-93; PR-42; L17 do PROJETO.md; src/app/api/conversas/resposta.ts:11-18"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "src/app/error.tsx, src/app/global-error.tsx e src/app/not-found.tsx na raiz, em estilo SaaS sobre os tokens, mostram Codigo de referencia (digest no erro; correlacao do cabecalho no 404); src/app/(sistema)/error.tsx passa a usar o mesmo texto; onRequestError em src/instrumentation.ts grava erro_na_requisicao com digest, correlacao, rota, tipo e nome do erro; teste contra next start com banco inacessivel prova que nem rota de API nem pagina mostram pilha"
    alternativa_descartada: "pagina de erro padrao do Next"
    motivo: "PR-93; base/log-e-erros.md; documentacao do Next (instrumentation: onRequestError recebe digest e request.headers); briefing item 1"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "validarAmbiente({env, producao}) em src/lib/ambiente.ts devolve {erros, avisos} e, em producao, lanca Error com a lista de nomes (JWT_SECRET com 32 caracteres ou mais, DATABASE_URL, ENCRYPTION_KEY valida, mais opcionais com formato invalido); instrumentation.register chama antes de tudo; fora de producao nao valida e o comportamento lazy continua; APP_URL ausente ou sem HTTPS em producao e aviso no log"
    alternativa_descartada: "validar tambem em desenvolvimento; derrubar por APP_URL"
    motivo: "PR-94 (nova); PR-21 (variavel obrigatoria ausente derruba o start); CONVENCOES secao 6 (Configuracao); base/ambiente-e-start.md"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "ENCRYPTION_KEY: a regra de validacao de src/lib/cripto.ts e reaproveitada (exportada como validarChaveDeCriptografia) para o validarAmbiente e para a tela Sistema nao divergirem"
    alternativa_descartada: "copiar a regra no ambiente"
    motivo: "PR-94; base/ambiente-e-start.md (a validacao mora em cripto.ts:29); camadas: lib importa lib"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "novas variaveis em ambiente.ts: LOG_LEVEL, BACKUP_DIR (padrao ./backups), BACKUP_MANTER (padrao 7), alem de bancoArquivo (caminho do arquivo SQLite resolvido de DATABASE_URL relativo ao diretorio de execucao, como o adaptador) e fusoHorario (TZ); todas documentadas no arquivo de exemplo de ambiente e no README"
    alternativa_descartada: "ler process.env nos scripts"
    motivo: "CONVENCOES secao 6 (variavel lida so em ambiente.ts); PR-96; base/banco-e-armazenamento.md (lacuna do caminho relativo)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "servico src/servicos/saude.ts: verificarSaude() devolve {status, itens} com banco (SELECT 1, prazo 3 s), diretorio gravavel (arquivo de prova em STORAGE_DIR), FTS5 (trechos_fts em sqlite_master) e midia (verificarMidia com cache de 60 s); falha de banco, disco ou FTS e falha, ffmpeg ou ffprobe ausente e degradado; GET /api/saude (src/app/api/saude/route.ts) devolve so {status}, 200 para ok e degradado e 503 para falha, no-store, sem sessao"
    alternativa_descartada: "detalhe no endpoint publico; degradado como 503"
    motivo: "PR-95 (nova); PR-21; PROJETO.md L18; src/lib/midia.ts:107 verificarMidia serve ao health check"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "servico src/servicos/sistema.ts: obterSistema(admin) devolve versao do app (package.json, lida por src/lib/versao.ts), esquema (migrations aplicadas e a ultima, lidas de _prisma_migrations), uptime, Node, fuso, tamanho do banco e do storage (varredura com teto de 50 mil entradas), midia, contagem da fila de fontes por status, estado e ultima rodada do agendador do expurgo (ultimaExecucaoEm novo no agendador), ENCRYPTION_KEY definida e valida, APP_URL com HTTPS, chave do OpenRouter configurada (sim ou nao) e o ultimo backup; nunca devolve valor de segredo; recusa quem nao e admin (403)"
    alternativa_descartada: "tela que le process.env direto"
    motivo: "PR-95; briefing item 3; src/servicos/integracoes.ts:151 chaveDoOpenrouterConfigurada; src/servicos/expurgo.ts:135"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "tela /configuracoes/sistema (layout.tsx com exigirUsuarioAdmin acima do loading.tsx, page.tsx, loading.tsx), item Sistema no grupo Configuracoes so para admin (icone novo), estado geral no topo, cartoes por assunto, estados carregando e erro pelo loading.tsx e error.tsx, tabela da lista de backups vira cartoes abaixo de 768 px, tokens, temas claro e escuro, 375 px"
    alternativa_descartada: "segunda area de configuracoes"
    motivo: "CONVENCOES secao 5 (Item de menu, Telas de Privacidade e Auditoria); PR-23; base/telas-menu-e-guardas.md"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "src/lib/backup.ts (infraestrutura, sem Prisma): gerarBackup({bancoArquivo, storageDir, backupDir, manter, versaoDoApp, agora}) copia o banco por db.backup do better-sqlite3 para um diretorio de trabalho dentro de BACKUP_DIR, confere PRAGMA integrity_check, le migrations e contagens por tabela da copia, calcula SHA-256, empacota manifest.json, banco/app.db e storage/ (sem audio/, segmentos/ e *.parcial; so os arquivos listados no manifesto) por tar.create com gzip, escreve em arquivo .parcial com modo 0600 e renomeia, aplica a retencao so a nomes do padrao e apaga o diretorio de trabalho; better-sqlite3 12.11.1 vira dependencia direta (ja esta no lock)"
    alternativa_descartada: "VACUUM INTO (renumera o rowid de trechos e desalinha o FTS5); copia crua do arquivo; exec de tar por shell"
    motivo: "PR-96 (nova); base/conteiner-e-ferramentas.md (db.backup copia por passos) e base/banco-e-armazenamento.md (rowid); CONVENCOES secao 4 (rowid e VACUUM); briefing item 4"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "o pacote tar 7.5.22 (versao fixa) e a unica dependencia nova de empacotamento; se npm audit acusar high, a alternativa registrada e um escritor e leitor de tar minimo em src/lib sem dependencia"
    alternativa_descartada: "exec de tar do sistema; escrever o formato sem tentar o pacote"
    motivo: "base/conteiner-e-ferramentas.md (tar 7.5.22 latest); briefing item 4 (pacote tar do npm com versao fixa e npm audit em 0); regra de dependencias das instrucoes do laco"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "servico src/servicos/backup.ts: gerarBackupAgora(admin, origem) exige admin, recusa gerar dois ao mesmo tempo (409), chama a lib com a configuracao de ambiente e grava a auditoria backup_gerado (ator o admin ou Sistema; detalhes origem, bytes e arquivos, sem nome de arquivo com dado pessoal); listarBackups(admin) devolve nome, data e tamanho dos arquivos do padrao; caminhoDoBackup(admin, nome) valida o nome contra o padrao e a posicao dentro de BACKUP_DIR e recusa link simbolico"
    alternativa_descartada: "download por caminho livre"
    motivo: "PR-96; PR-19; briefing item 4; CONVENCOES secao 5 (armazenamento: caminho final conferido dentro da raiz)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "a auditoria ganha a acao backup_gerado (19 acoes, com as chaves de detalhe origem, bytes e arquivos) e a frase 'Gerou um backup do banco e dos arquivos' na tela de Auditoria; tests/auditoria-acoes.test.ts, tests/auditoria-logica.test.ts e o filtro de acoes sao atualizados e declarados"
    alternativa_descartada: "reutilizar restauracao"
    motivo: "briefing item 4; src/servicos/auditoria-acoes.ts:10-29; base/segundo-plano-e-auditoria.md"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "acao de servidor gerarBackupAgoraAcao em src/app/acoes.ts e rota GET /api/backups/[nome] (admin, attachment com nome do padrao, application/gzip, no-store, nosniff, Content-Length, stream de leitura) em src/app/api/backups/[nome]/route.ts; 401 em JSON sem sessao e 403 para nao admin"
    alternativa_descartada: "download pela pagina"
    motivo: "CONVENCOES secao 5 (Handler HTTP, rota de exportacao); briefing item 4"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "scripts/backup.ts (npm run backup) usa a mesma lib e o mesmo servico de aplicacao (origem linha de comando, ator Sistema) com dotenv/config, imprime nome, tamanho e caminho e sai com codigo diferente de zero em falha; o import usa o alias @/ resolvido pelo tsx (provado na primeira task) ou caminhos relativos como a seed"
    alternativa_descartada: "duplicar a logica no script"
    motivo: "PR-96; briefing item 4; prisma/seed.ts:1-5 (importa por caminho relativo)"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "src/lib/restauracao.ts (infraestrutura, sem Prisma): lerEValidarBackup extrai para diretorio temporario no mesmo volume do destino com filtro que recusa caminho absoluto, .., link e tipo que nao seja arquivo ou diretorio, confere manifest.json, tamanho e SHA-256 de cada parte e a ausencia de parte fora do manifesto; compararEsquema compara as migrations do backup com as pastas de prisma/migrations e devolve igual, mais_antigo (o backup e prefixo do app) ou mais_novo ou divergente (recusados); restaurarArquivos faz a copia pre-restauracao, a troca por renomeacao e o desfazer"
    alternativa_descartada: "extrair direto sobre a instalacao"
    motivo: "PR-98 (nova); briefing item 5; CONVENCOES secao 5 (segredo/arquivos: caminho conferido dentro da raiz)"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "scripts/restore.ts (npm run restore -- <arquivo> [--forcar]) recusa se GET http://127.0.0.1:<PORT ou 3000>/api/saude responder (qualquer resposta HTTP), valida, recusa esquema mais novo antes de tocar, restaura, roda prisma migrate deploy (processo filho sem shell) se o backup for mais antigo, importa o Prisma so depois da troca e chama reconstruirIndiceDeTrechos(), registrar({ator: 'sistema', acao: 'restauracao', alvoTipo: 'sistema', detalhes: {origem, resultado}}) no banco restaurado e imprime o resumo e o aviso sobre a ENCRYPTION_KEY"
    alternativa_descartada: "restaurar pela interface; registrar a auditoria antes da troca"
    motivo: "PR-98; base/segundo-plano-e-auditoria.md (restauracao ja existe em ACOES com origem e resultado); src/servicos/recuperacao.ts:126; briefing item 5"
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: "o teste da restauracao (tests/restauracao-fim-a-fim.test.ts) monta a instalacao no banco e storage do proprio teste (migrate deploy do setup, nunca prisma/dev.db), gera o backup para um diretorio temporario, destroi e altera, executa scripts/restore.ts como processo filho contra diretorios limpos (DATABASE_URL, STORAGE_DIR e BACKUP_DIR temporarios) e confere linha a linha com um PrismaClient proprio sobre o banco restaurado: usuarios, agente com chat e canal Telegram cifrado, fontes, trechos, busca FTS, conversa com mensagens e fontes, auditoria com a entrada restauracao, arquivo original no storage, temporarios ausentes e a chave cifrada decifrando com a mesma ENCRYPTION_KEY; negativos em tests/restauracao-recusas.test.ts (adulterado, sem manifest, esquema mais novo, truncado, diretorio sem permissao quando nao e root)"
    alternativa_descartada: "teste so da lib; teste contra o banco real"
    motivo: "PR-20 (teste que restaura numa instalacao limpa e confere os dados); PR-98; briefing item 6; tests/setup.ts:9-36"
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: "src/instrumentation.ts instala o desligamento limpo (SIGTERM e SIGINT, com NEXT_MANUAL_SIG_HANDLE=1 no conteiner): para o agendador do expurgo, pede a fila parar de reivindicar (Fila ganha parar() e aguardarEncerramento(prazo)), espera as gravacoes de auditoria pendentes, grava a linha desligamento no log e sai com 0; fonte que ficar em processando volta a pendente pelo retomar() no proximo start"
    alternativa_descartada: "deixar o Next tratar o sinal e sair com 143 sem drenar"
    motivo: "PR-99 (nova); base/conteiner-e-ferramentas.md (start-server.js:374-392); base/segundo-plano-e-auditoria.md (a fila nao tem parar); briefing item 7"
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: "Dockerfile multi-estagio em node:22-bookworm-slim com ffmpeg, usuario node (nao-root), /data como volume, TZ configuravel, HEALTHCHECK por node fetch em /api/saude, entrypoint docker-entrypoint.sh (migrate deploy e next start para o comando servidor; qualquer outro comando executa direto, o que serve a backup, restore e admin:criar); docker-compose.yml (servico, volume nomeado, env_file, restart unless-stopped, healthcheck, porta, TRUST_PROXY, init, stop_grace_period) e .dockerignore sem o arquivo de segredos, node_modules, storage, backups e *.db; prisma e tsx em dependencies"
    alternativa_descartada: "Alpine; imagem sem entrypoint proprio"
    motivo: "PR-99; PR-24; briefing item 7; docker info responde nesta maquina (base/conteiner-e-ferramentas.md)"
    status: fechada
    bloqueante: false
  - id: D-24
    decisao: "scripts/criar-admin.ts (npm run admin:criar -- <e-mail> <nome>) cria o primeiro administrador com a senha de ADMIN_SENHA ou da entrada padrao, pela funcao de servico criarAdministradorInicial em src/servicos/usuarios.ts (mesmas validacoes de criar), recusa e-mail existente, nunca imprime a senha e audita usuario_criado com ator Sistema"
    alternativa_descartada: "semear a conta de demonstracao em producao"
    motivo: "PR-100 (nova); PR-25 (a seed nunca roda em producao); PR-12"
    status: fechada
    bloqueante: false
  - id: D-25
    decisao: "o CI ganha um job construir-imagem que roda docker build sem publicar; o job verificar existente continua igual"
    alternativa_descartada: "publicar a imagem"
    motivo: "briefing item 8; .github/workflows/ci.yml (job verificar)"
    status: fechada
    bloqueante: false
  - id: D-26
    decisao: "o README ganha as secoes Operacao e backup (requisitos, tabela completa de variaveis, subir com Docker, HTTPS e proxy com exemplo Caddy e TRUST_PROXY, URL publica para chat embutido e webhook do Telegram, backup e restauracao passo a passo, rotina por cron, atualizacao de versao, seguranca com destaque para a ENCRYPTION_KEY, solucao de problemas pelo codigo de referencia); tests/projeto.test.ts confere as secoes, as variaveis novas no exemplo de ambiente, o job de CI, os arquivos de conteiner e as citacoes novas"
    alternativa_descartada: "documentar fora do README"
    motivo: "briefing item 8; tests/projeto.test.ts:130-170 (README conferido por teste)"
    status: fechada
    bloqueante: false
  - id: D-27
    decisao: "a lacuna 6 (log estruturado) e a regra de log de CONVENCOES passam a evidencia com arquivo e linha; novas regras de CONVENCOES: log, correlacao, validacao de ambiente, saude, backup, restauracao, conteiner, desligamento; novas lacunas: backup completo sem incremento, backup e restauracao por processo unico, imagem so testada na arquitetura local, trilha de backup sem assinatura, restauracao com o servidor de pe so por --forcar, medicao do storage com teto; a PEND-06 e a PEND-07 do RECURSAO ganham o conteiner e as telas novas"
    alternativa_descartada: "manter log como decidido_pelo_buildx"
    motivo: "briefing item 9; docs/stack/LACUNAS.md; docs/projeto/RECURSAO.md"
    status: fechada
    bloqueante: false
  - id: D-28
    decisao: "a verificacao no navegador e a do conteiner seguem a regra de seguranca do laco: Chrome proprio com --user-data-dir novo e --remote-debugging-port=0, alvo confirmado antes de interagir; o que nao puder ser visto fica registrado em docs/operacao-e-backup/VERIFICACAO-VISUAL.md"
    alternativa_descartada: "reaproveitar navegador ja aberto ou porta fixa"
    motivo: "instrucoes do laco, secao 5 (incidente da FT-10); briefing item 10"
    status: fechada
    bloqueante: false
  - id: D-29
    decisao: "a suite roda inteira ao fechar cada task que mexe em codigo compartilhado (log, proxy, ambiente, instrumentacao, menu, auditoria, expurgo, fila, acoes, package.json); nas demais fica parcial; criterio declarado no ENTREGA.md; os testes de rota exigem npm run build antes"
    alternativa_descartada: "rodar sempre parcial"
    motivo: "instrucoes do laco (pedido do coordenador); docs/entregas/operacao-e-backup/ENTREGA.md"
    status: fechada
    bloqueante: false
---

# Decisões — operacao-e-backup (FT-11)

Respondidas pelo buildx em modo autônomo (`respondido_por: buildx`). Cada decisão cita a fonte (PROJETO.md, premissa PR-NN, regra de CONVENCOES.md ou arquivo da base); onde nenhuma respondia, a premissa nova foi escrita antes (PR-92 a PR-100). Nenhuma decisão é de regra de negócio.

D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PROJETO.md (modo autonomo total) e briefing

D-01 | src/lib/log.ts expoe log.debug, log.info, log.aviso e log.erro (msg, campos): uma linha JSON com nivel, quando, msg, correlacao e campos; saida por console.debug, console.info, console.warn e console.error (so aqui); nivel minimo por LOG_LEVEL (padrao info); redacao central por chave e por valor, Error so com nome e codigo, e-mail mascarado | biblioteca de log externa (pino, winston); redacao por quem chama | PR-92 (nova); PR-21; CONVENCOES secao 6 (Log); base/log-e-erros.md (22 console.* e testes que espiam console.error, por isso o log segue usando console)

D-02 | a regra contra console.* em src/ e um teste de arquitetura (varre src/ por console\.) mais regra no-console do ESLint com excecao para src/lib/log.ts, prisma/seed.ts, scripts/ e tests/; os 22 console.* de src/ viram chamadas ao log e os testes que liam evento passam a ler msg | so lint; so teste | PR-92; briefing item 1; base/log-e-erros.md; CONVENCOES secao 5 (teste prova a regra com o ESLint real)

D-03 | a correlacao e gerada em src/proxy.ts para todas as rotas (matcher que exclui /_next/ e favicon), vai ao handler por cabecalho de requisicao x-correlacao e a resposta leva X-Correlacao; trabalhos em segundo plano (fila, expurgo, atendimento do Telegram) rodam dentro de comCorrelacao (AsyncLocalStorage em src/lib/log.ts), e o log inclui a correlacao do contexto automaticamente | AsyncLocalStorage aberto no proxy (processo e contexto distintos); ler headers() dentro do log (assincrono) | PR-93 (nova); base/log-e-erros.md (lacuna: ALS do proxy nao chega ao handler); src/proxy.ts:12-28

D-04 | gerarCorrelacao de chat-erros passa a delegar para novaCorrelacao de src/lib/log.ts (8 caracteres hexadecimais, como hoje); mensagemParaOperador e mensagemParaVisitante continuam com o mesmo texto | dois geradores de codigo | PR-42 (mantida); PR-93

D-05 | erro inesperado em rota de API, em acao de servidor e em fluxo SSE devolve a mensagem generica com Codigo de referencia e grava a linha de log com o nome do erro e o codigo, nunca message nem stack; as rotas leem a correlacao do cabecalho da requisicao, a acao gera uma nova | devolver a mensagem do erro ao operador | PR-93; PR-42; L17 do PROJETO.md; src/app/api/conversas/resposta.ts:11-18

D-06 | src/app/error.tsx, src/app/global-error.tsx e src/app/not-found.tsx na raiz, em estilo SaaS sobre os tokens, mostram Codigo de referencia (digest no erro; correlacao do cabecalho no 404); src/app/(sistema)/error.tsx passa a usar o mesmo texto; onRequestError em src/instrumentation.ts grava erro_na_requisicao com digest, correlacao, rota, tipo e nome do erro; teste contra next start com banco inacessivel prova que nem rota de API nem pagina mostram pilha | pagina de erro padrao do Next | PR-93; base/log-e-erros.md; documentacao do Next (instrumentation: onRequestError recebe digest e request.headers); briefing item 1

D-07 | validarAmbiente({env, producao}) em src/lib/ambiente.ts devolve {erros, avisos} e, em producao, lanca Error com a lista de nomes (JWT_SECRET com 32 caracteres ou mais, DATABASE_URL, ENCRYPTION_KEY valida, mais opcionais com formato invalido); instrumentation.register chama antes de tudo; fora de producao nao valida e o comportamento lazy continua; APP_URL ausente ou sem HTTPS em producao e aviso no log | validar tambem em desenvolvimento; derrubar por APP_URL | PR-94 (nova); PR-21 (variavel obrigatoria ausente derruba o start); CONVENCOES secao 6 (Configuracao); base/ambiente-e-start.md

D-08 | ENCRYPTION_KEY: a regra de validacao de src/lib/cripto.ts e reaproveitada (exportada como validarChaveDeCriptografia) para o validarAmbiente e para a tela Sistema nao divergirem | copiar a regra no ambiente | PR-94; base/ambiente-e-start.md (a validacao mora em cripto.ts:29); camadas: lib importa lib

D-09 | novas variaveis em ambiente.ts: LOG_LEVEL, BACKUP_DIR (padrao ./backups), BACKUP_MANTER (padrao 7), alem de bancoArquivo (caminho do arquivo SQLite resolvido de DATABASE_URL relativo ao diretorio de execucao, como o adaptador) e fusoHorario (TZ); todas documentadas no arquivo de exemplo de ambiente e no README | ler process.env nos scripts | CONVENCOES secao 6 (variavel lida so em ambiente.ts); PR-96; base/banco-e-armazenamento.md (lacuna do caminho relativo)

D-10 | servico src/servicos/saude.ts: verificarSaude() devolve {status, itens} com banco (SELECT 1, prazo 3 s), diretorio gravavel (arquivo de prova em STORAGE_DIR), FTS5 (trechos_fts em sqlite_master) e midia (verificarMidia com cache de 60 s); falha de banco, disco ou FTS e falha, ffmpeg ou ffprobe ausente e degradado; GET /api/saude (src/app/api/saude/route.ts) devolve so {status}, 200 para ok e degradado e 503 para falha, no-store, sem sessao | detalhe no endpoint publico; degradado como 503 | PR-95 (nova); PR-21; PROJETO.md L18; src/lib/midia.ts:107 verificarMidia serve ao health check

D-11 | servico src/servicos/sistema.ts: obterSistema(admin) devolve versao do app (package.json, lida por src/lib/versao.ts), esquema (migrations aplicadas e a ultima, lidas de _prisma_migrations), uptime, Node, fuso, tamanho do banco e do storage (varredura com teto de 50 mil entradas), midia, contagem da fila de fontes por status, estado e ultima rodada do agendador do expurgo (ultimaExecucaoEm novo no agendador), ENCRYPTION_KEY definida e valida, APP_URL com HTTPS, chave do OpenRouter configurada (sim ou nao) e o ultimo backup; nunca devolve valor de segredo; recusa quem nao e admin (403) | tela que le process.env direto | PR-95; briefing item 3; src/servicos/integracoes.ts:151 chaveDoOpenrouterConfigurada; src/servicos/expurgo.ts:135

D-12 | tela /configuracoes/sistema (layout.tsx com exigirUsuarioAdmin acima do loading.tsx, page.tsx, loading.tsx), item Sistema no grupo Configuracoes so para admin (icone novo), estado geral no topo, cartoes por assunto, estados carregando e erro pelo loading.tsx e error.tsx, tabela da lista de backups vira cartoes abaixo de 768 px, tokens, temas claro e escuro, 375 px | segunda area de configuracoes | CONVENCOES secao 5 (Item de menu, Telas de Privacidade e Auditoria); PR-23; base/telas-menu-e-guardas.md

D-13 | src/lib/backup.ts (infraestrutura, sem Prisma): gerarBackup({bancoArquivo, storageDir, backupDir, manter, versaoDoApp, agora}) copia o banco por db.backup do better-sqlite3 para um diretorio de trabalho dentro de BACKUP_DIR, confere PRAGMA integrity_check, le migrations e contagens por tabela da copia, calcula SHA-256, empacota manifest.json, banco/app.db e storage/ (sem audio/, segmentos/ e *.parcial; so os arquivos listados no manifesto) por tar.create com gzip, escreve em arquivo .parcial com modo 0600 e renomeia, aplica a retencao so a nomes do padrao e apaga o diretorio de trabalho; better-sqlite3 12.11.1 vira dependencia direta (ja esta no lock) | VACUUM INTO (renumera o rowid de trechos e desalinha o FTS5); copia crua do arquivo; exec de tar por shell | PR-96 (nova); base/conteiner-e-ferramentas.md (db.backup copia por passos) e base/banco-e-armazenamento.md (rowid); CONVENCOES secao 4 (rowid e VACUUM); briefing item 4

D-14 | o pacote tar 7.5.22 (versao fixa) e a unica dependencia nova de empacotamento; se npm audit acusar high, a alternativa registrada e um escritor e leitor de tar minimo em src/lib sem dependencia | exec de tar do sistema; escrever o formato sem tentar o pacote | base/conteiner-e-ferramentas.md (tar 7.5.22 latest); briefing item 4 (pacote tar do npm com versao fixa e npm audit em 0); regra de dependencias das instrucoes do laco

D-15 | servico src/servicos/backup.ts: gerarBackupAgora(admin, origem) exige admin, recusa gerar dois ao mesmo tempo (409), chama a lib com a configuracao de ambiente e grava a auditoria backup_gerado (ator o admin ou Sistema; detalhes origem, bytes e arquivos, sem nome de arquivo com dado pessoal); listarBackups(admin) devolve nome, data e tamanho dos arquivos do padrao; caminhoDoBackup(admin, nome) valida o nome contra o padrao e a posicao dentro de BACKUP_DIR e recusa link simbolico | download por caminho livre | PR-96; PR-19; briefing item 4; CONVENCOES secao 5 (armazenamento: caminho final conferido dentro da raiz)

D-16 | a auditoria ganha a acao backup_gerado (19 acoes, com as chaves de detalhe origem, bytes e arquivos) e a frase 'Gerou um backup do banco e dos arquivos' na tela de Auditoria; tests/auditoria-acoes.test.ts, tests/auditoria-logica.test.ts e o filtro de acoes sao atualizados e declarados | reutilizar restauracao | briefing item 4; src/servicos/auditoria-acoes.ts:10-29; base/segundo-plano-e-auditoria.md

D-17 | acao de servidor gerarBackupAgoraAcao em src/app/acoes.ts e rota GET /api/backups/[nome] (admin, attachment com nome do padrao, application/gzip, no-store, nosniff, Content-Length, stream de leitura) em src/app/api/backups/[nome]/route.ts; 401 em JSON sem sessao e 403 para nao admin | download pela pagina | CONVENCOES secao 5 (Handler HTTP, rota de exportacao); briefing item 4

D-18 | scripts/backup.ts (npm run backup) usa a mesma lib e o mesmo servico de aplicacao (origem linha de comando, ator Sistema) com dotenv/config, imprime nome, tamanho e caminho e sai com codigo diferente de zero em falha; o import usa o alias @/ resolvido pelo tsx (provado na primeira task) ou caminhos relativos como a seed | duplicar a logica no script | PR-96; briefing item 4; prisma/seed.ts:1-5 (importa por caminho relativo)

D-19 | src/lib/restauracao.ts (infraestrutura, sem Prisma): lerEValidarBackup extrai para diretorio temporario no mesmo volume do destino com filtro que recusa caminho absoluto, .., link e tipo que nao seja arquivo ou diretorio, confere manifest.json, tamanho e SHA-256 de cada parte e a ausencia de parte fora do manifesto; compararEsquema compara as migrations do backup com as pastas de prisma/migrations e devolve igual, mais_antigo (o backup e prefixo do app) ou mais_novo ou divergente (recusados); restaurarArquivos faz a copia pre-restauracao, a troca por renomeacao e o desfazer | extrair direto sobre a instalacao | PR-98 (nova); briefing item 5; CONVENCOES secao 5 (segredo/arquivos: caminho conferido dentro da raiz)

D-20 | scripts/restore.ts (npm run restore -- <arquivo> [--forcar]) recusa se GET http://127.0.0.1:<PORT ou 3000>/api/saude responder (qualquer resposta HTTP), valida, recusa esquema mais novo antes de tocar, restaura, roda prisma migrate deploy (processo filho sem shell) se o backup for mais antigo, importa o Prisma so depois da troca e chama reconstruirIndiceDeTrechos(), registrar({ator: 'sistema', acao: 'restauracao', alvoTipo: 'sistema', detalhes: {origem, resultado}}) no banco restaurado e imprime o resumo e o aviso sobre a ENCRYPTION_KEY | restaurar pela interface; registrar a auditoria antes da troca | PR-98; base/segundo-plano-e-auditoria.md (restauracao ja existe em ACOES com origem e resultado); src/servicos/recuperacao.ts:126; briefing item 5

D-21 | o teste da restauracao (tests/restauracao-fim-a-fim.test.ts) monta a instalacao no banco e storage do proprio teste (migrate deploy do setup, nunca prisma/dev.db), gera o backup para um diretorio temporario, destroi e altera, executa scripts/restore.ts como processo filho contra diretorios limpos (DATABASE_URL, STORAGE_DIR e BACKUP_DIR temporarios) e confere linha a linha com um PrismaClient proprio sobre o banco restaurado: usuarios, agente com chat e canal Telegram cifrado, fontes, trechos, busca FTS, conversa com mensagens e fontes, auditoria com a entrada restauracao, arquivo original no storage, temporarios ausentes e a chave cifrada decifrando com a mesma ENCRYPTION_KEY; negativos em tests/restauracao-recusas.test.ts (adulterado, sem manifest, esquema mais novo, truncado, diretorio sem permissao quando nao e root) | teste so da lib; teste contra o banco real | PR-20 (teste que restaura numa instalacao limpa e confere os dados); PR-98; briefing item 6; tests/setup.ts:9-36

D-22 | src/instrumentation.ts instala o desligamento limpo (SIGTERM e SIGINT, com NEXT_MANUAL_SIG_HANDLE=1 no conteiner): para o agendador do expurgo, pede a fila parar de reivindicar (Fila ganha parar() e aguardarEncerramento(prazo)), espera as gravacoes de auditoria pendentes, grava a linha desligamento no log e sai com 0; fonte que ficar em processando volta a pendente pelo retomar() no proximo start | deixar o Next tratar o sinal e sair com 143 sem drenar | PR-99 (nova); base/conteiner-e-ferramentas.md (start-server.js:374-392); base/segundo-plano-e-auditoria.md (a fila nao tem parar); briefing item 7

D-23 | Dockerfile multi-estagio em node:22-bookworm-slim com ffmpeg, usuario node (nao-root), /data como volume, TZ configuravel, HEALTHCHECK por node fetch em /api/saude, entrypoint docker-entrypoint.sh (migrate deploy e next start para o comando servidor; qualquer outro comando executa direto, o que serve a backup, restore e admin:criar); docker-compose.yml (servico, volume nomeado, env_file, restart unless-stopped, healthcheck, porta, TRUST_PROXY, init, stop_grace_period) e .dockerignore sem o arquivo de segredos, node_modules, storage, backups e *.db; prisma e tsx em dependencies | Alpine; imagem sem entrypoint proprio | PR-99; PR-24; briefing item 7; docker info responde nesta maquina (base/conteiner-e-ferramentas.md)

D-24 | scripts/criar-admin.ts (npm run admin:criar -- <e-mail> <nome>) cria o primeiro administrador com a senha de ADMIN_SENHA ou da entrada padrao, pela funcao de servico criarAdministradorInicial em src/servicos/usuarios.ts (mesmas validacoes de criar), recusa e-mail existente, nunca imprime a senha e audita usuario_criado com ator Sistema | semear a conta de demonstracao em producao | PR-100 (nova); PR-25 (a seed nunca roda em producao); PR-12

D-25 | o CI ganha um job construir-imagem que roda docker build sem publicar; o job verificar existente continua igual | publicar a imagem | briefing item 8; .github/workflows/ci.yml (job verificar)

D-26 | o README ganha as secoes Operacao e backup (requisitos, tabela completa de variaveis, subir com Docker, HTTPS e proxy com exemplo Caddy e TRUST_PROXY, URL publica para chat embutido e webhook do Telegram, backup e restauracao passo a passo, rotina por cron, atualizacao de versao, seguranca com destaque para a ENCRYPTION_KEY, solucao de problemas pelo codigo de referencia); tests/projeto.test.ts confere as secoes, as variaveis novas no exemplo de ambiente, o job de CI, os arquivos de conteiner e as citacoes novas | documentar fora do README | briefing item 8; tests/projeto.test.ts:130-170 (README conferido por teste)

D-27 | a lacuna 6 (log estruturado) e a regra de log de CONVENCOES passam a evidencia com arquivo e linha; novas regras de CONVENCOES: log, correlacao, validacao de ambiente, saude, backup, restauracao, conteiner, desligamento; novas lacunas: backup completo sem incremento, backup e restauracao por processo unico, imagem so testada na arquitetura local, trilha de backup sem assinatura, restauracao com o servidor de pe so por --forcar, medicao do storage com teto; a PEND-06 e a PEND-07 do RECURSAO ganham o conteiner e as telas novas | manter log como decidido_pelo_buildx | briefing item 9; docs/stack/LACUNAS.md; docs/projeto/RECURSAO.md

D-28 | a verificacao no navegador e a do conteiner seguem a regra de seguranca do laco: Chrome proprio com --user-data-dir novo e --remote-debugging-port=0, alvo confirmado antes de interagir; o que nao puder ser visto fica registrado em docs/operacao-e-backup/VERIFICACAO-VISUAL.md | reaproveitar navegador ja aberto ou porta fixa | instrucoes do laco, secao 5 (incidente da FT-10); briefing item 10

D-29 | a suite roda inteira ao fechar cada task que mexe em codigo compartilhado (log, proxy, ambiente, instrumentacao, menu, auditoria, expurgo, fila, acoes, package.json); nas demais fica parcial; criterio declarado no ENTREGA.md; os testes de rota exigem npm run build antes | rodar sempre parcial | instrucoes do laco (pedido do coordenador); docs/entregas/operacao-e-backup/ENTREGA.md

Hipóteses a conferir (as decisões do buildx não têm confirmação humana; PR-99 é provisória): imagem base Debian slim (D-23), código de referência da página pelo `digest` e do 404 pelo cabeçalho (D-06), restauração só por linha de comando (D-20).

Pendências bloqueantes: nenhuma.
