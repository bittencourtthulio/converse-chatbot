---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
raio: null
olho_obrigatorio: 38
leitura_rapida: 46
dispensavel: 85
atualizado_em: 2026-10-01
---

# Onde gastar atenção — operacao-e-backup

Branch `feat/operacao-e-backup` -> `feat/privacidade-e-auditoria`. Data: 2026-10-01.

**169 arquivos — 38 olho obrigatório, 46 leitura rápida, 85 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação. Tamanho de diff não é critério.

Sem modo legado, sem raio calculado e sem agente `revisor-diff` neste harness: a classificação veio do tipo de arquivo e da evidência das tasks, aplicada pelo executor, que escreveu o código e não é imparcial. Leia a faixa DISPENSÁVEL com essa ressalva em mente.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.dockerignore` | A | +31/-0 | O7: sem critério de cobertura própria além do teste estático e da verificação opt-in do contêiner; define usuário, volume, migrations a cada subida e o que entra na imagem (nada de `.env` nem de dados). Classificado no padrão |
| `.github/workflows/ci.yml` | M | +10/-0 | padrão sem evidência de cobertura: o job `construir-imagem` roda `docker build` sem publicar nem usar segredo; só o teste estático o cobre |
| `Dockerfile` | A | +73/-0 | O7: sem critério de cobertura própria além do teste estático e da verificação opt-in do contêiner; define usuário, volume, migrations a cada subida e o que entra na imagem (nada de `.env` nem de dados). Classificado no padrão |
| `docker-compose.yml` | A | +43/-0 | O7: sem critério de cobertura própria além do teste estático e da verificação opt-in do contêiner; define usuário, volume, migrations a cada subida e o que entra na imagem (nada de `.env` nem de dados). Classificado no padrão |
| `docker-entrypoint.sh` | A | +25/-0 | O7: sem critério de cobertura própria além do teste estático e da verificação opt-in do contêiner; define usuário, volume, migrations a cada subida e o que entra na imagem (nada de `.env` nem de dados). Classificado no padrão |
| `docs/projeto/PREMISSAS.md` | M | +119/-2 | O2 regra de negócio: PR-92 a PR-100 são decisões tomadas em nome do humano (formato do backup, restauração só por linha de comando, imagem e usuário do contêiner); a PR-99 é `Provisória: true` |
| `package.json` | M | +9/-3 | O2: dependências novas (`tar`, `better-sqlite3`) e `prisma` e `tsx` movidos para produção, mais os scripts `backup`, `restore` e `admin:criar`; versões fixas e `npm audit` com 0 high |
| `scripts/backup.ts` | A | +53/-0 | O4 dado pessoal: o backup leva conversas e usuários; modo 0600, retenção que remove arquivos (só pelo padrão de nome) e exclusão de temporários |
| `scripts/criar-admin.ts` | A | +63/-0 | O4 autorização: `criarAdministradorInicial` e o comando do primeiro administrador (senha só por `ADMIN_SENHA` ou entrada padrão, nunca por argumento; recusa se já há admin) |
| `scripts/restore.ts` | A | +160/-0 | O2 e efeito irreversível: comando que restaura; recusa rodar com o servidor de pé e grava a auditoria `restauracao` no banco restaurado |
| `src/app/(sistema)/configuracoes/sistema/layout.tsx` | A | +11/-0 | O4 autorização: a guarda de admin da tela fica aqui, acima do `loading.tsx` |
| `src/app/(sistema)/configuracoes/sistema/page.tsx` | A | +24/-0 | O4: página só de admin que monta o painel, a lista de backups e o gerador; repete a guarda |
| `src/app/acoes.ts` | M | +53/-43 | O4 autorização: ação de servidor `gerarBackupDaTela` (só admin) e `mensagemDe` que devolve o código de referência em vez da pilha |
| `src/app/api/agentes/[id]/conversar/route.ts` | M | +5/-6 | O5 contrato público: o corpo do erro inesperado passa a trazer o código de referência e nunca a mensagem interna; confira que os formatos públicos existentes (status, SSE) não mudaram |
| `src/app/api/agentes/[id]/fontes/resposta.ts` | M | +4/-9 | O5 contrato público: o corpo do erro inesperado passa a trazer o código de referência e nunca a mensagem interna; confira que os formatos públicos existentes (status, SSE) não mudaram |
| `src/app/api/backups/[nome]/route.ts` | A | +30/-0 | O4 e O5: rota nova que entrega o arquivo de backup; confira a guarda de admin, o nome validado (sem caminho) e os cabeçalhos do anexo |
| `src/app/api/conversas/resposta.ts` | M | +4/-9 | O5 contrato público: o corpo do erro inesperado passa a trazer o código de referência e nunca a mensagem interna; confira que os formatos públicos existentes (status, SSE) não mudaram |
| `src/app/api/publico/resposta.ts` | M | +4/-0 | O5 contrato público: o corpo do erro inesperado passa a trazer o código de referência e nunca a mensagem interna; confira que os formatos públicos existentes (status, SSE) não mudaram |
| `src/app/api/resposta-de-erro.ts` | A | +18/-0 | O5 contrato público: o corpo do erro inesperado passa a trazer o código de referência e nunca a mensagem interna; confira que os formatos públicos existentes (status, SSE) não mudaram |
| `src/app/api/saude/route.ts` | A | +17/-0 | O5 contrato público: `GET /api/saude` responde sem sessão (usado pelo `HEALTHCHECK`); confira que só devolve o estado (`ok`, `degradado`, `falha`) e nenhum detalhe interno |
| `src/app/correlacao-servidor.ts` | A | +23/-0 | O5: lê a correlação do cabeçalho da requisição para as páginas e ações; erro aqui afeta toda página de erro |
| `src/app/eventos-sse.ts` | M | +2/-1 | O5 contrato público: o corpo do erro inesperado passa a trazer o código de referência e nunca a mensagem interna; confira que os formatos públicos existentes (status, SSE) não mudaram |
| `src/instrumentation.ts` | M | +106/-6 | O2 e efeito irreversível: validação do ambiente no start, filtro do console do Next, desligamento limpo no SIGTERM e `onRequestError` |
| `src/lib/ambiente.ts` | M | +147/-0 | O4 segredo: validação de `JWT_SECRET` e `ENCRYPTION_KEY` no start (mensagem lista nomes, nunca valores); `cripto.ts` compartilha a regra da chave |
| `src/lib/backup.ts` | A | +267/-0 | O4 dado pessoal: o backup leva conversas e usuários; modo 0600, retenção que remove arquivos (só pelo padrão de nome) e exclusão de temporários |
| `src/lib/cripto.ts` | M | +5/-14 | O4 segredo: validação de `JWT_SECRET` e `ENCRYPTION_KEY` no start (mensagem lista nomes, nunca valores); `cripto.ts` compartilha a regra da chave |
| `src/lib/log.ts` | A | +202/-0 | O4 segredo: redação central de chaves, tokens e conteúdo no log; é o único ponto com `console` |
| `src/lib/restauracao.ts` | A | +358/-0 | O2 e efeito irreversível: troca o banco e o `storage/` da instalação; as recusas (links, caminhos, adulteração, esquema mais novo), a cópia `pre-restauracao` e o desfazer estão aqui (T-06.01, T-06.02) |
| `src/proxy.ts` | M | +37/-14 | O5: roda em toda requisição (código de correlação, `X-Correlacao`, CSP do `/embed`) e o matcher exclui as rotas de upload por causa do limite de 10 MB |
| `src/servicos/auditoria-acoes.ts` | M | +2/-0 | O4: ação `backup_gerado` entra no conjunto fechado de ações (19); os detalhes continuam sem segredo |
| `src/servicos/auditoria.ts` | M | +2/-7 | O4: ação `backup_gerado` entra no conjunto fechado de ações (19); os detalhes continuam sem segredo |
| `src/servicos/backup.ts` | A | +119/-0 | O4 dado pessoal: o backup leva conversas e usuários; modo 0600, retenção que remove arquivos (só pelo padrão de nome) e exclusão de temporários |
| `src/servicos/chat-erros.ts` | M | +3/-3 | O5 contrato público: o corpo do erro inesperado passa a trazer o código de referência e nunca a mensagem interna; confira que os formatos públicos existentes (status, SSE) não mudaram |
| `src/servicos/expurgo.ts` | M | +10/-1 | O2: `parar` e `aguardarEncerramento` da fila e `ultimaExecucaoEm` do expurgo; o desligamento depende deles para não perder gravações |
| `src/servicos/fontes-fila.ts` | M | +45/-12 | O2: `parar` e `aguardarEncerramento` da fila e `ultimaExecucaoEm` do expurgo; o desligamento depende deles para não perder gravações |
| `src/servicos/saude.ts` | A | +133/-0 | O5 contrato público: `GET /api/saude` responde sem sessão (usado pelo `HEALTHCHECK`); confira que só devolve o estado (`ok`, `degradado`, `falha`) e nenhum detalhe interno |
| `src/servicos/sistema.ts` | A | +143/-0 | O4: reúne o que a tela Sistema mostra (versão, tamanhos, configuração em sim ou não); confira que nenhum valor de segredo sai |
| `src/servicos/usuarios.ts` | M | +22/-12 | O4 autorização: `criarAdministradorInicial` e o comando do primeiro administrador (senha só por `ADMIN_SENHA` ou entrada padrão, nunca por argumento; recusa se já há admin) |

## LEITURA RÁPIDA — conferir a intenção

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.env.example` | M | +29/-0 | L2: variáveis novas sem valor secreto, conferidas por `tests/projeto.test.ts` |
| `.gitignore` | M | +2/-2 | L2: `/backups/` só na raiz (antes escondia `src/app/api/backups`) |
| `README.md` | M | +114/-0 | L2: seção "Operação e backup" conferida por `tests/projeto.test.ts`; é o que o operador segue, então vale conferir os comandos |
| `docs/projeto/MAPA.md` | M | +7/-4 | L2: estado da FT-11 conferido por `tests/projeto.test.ts` |
| `docs/projeto/PROJETO.md` | M | +1/-1 | L2: contagem de features entregues conferida por `tests/projeto.test.ts` |
| `docs/projeto/RECURSAO.md` | M | +12/-4 | L2: PEND-09 nova e a PEND-07 ampliada; leia o texto da PEND-09 (decisão de hospedagem e cópia externa) |
| `docs/stack/CONVENCOES.md` | M | +38/-30 | L2: convenções novas com arquivo e linha, conferidas por `tests/projeto.test.ts` (34 citações) |
| `docs/stack/LACUNAS.md` | M | +7/-5 | L2: lacunas 34 a 42 e as resolvidas, conferidas por `tests/projeto.test.ts` |
| `eslint.config.mjs` | M | +7/-0 | L2: regra `no-console` em `src/**` exceto `log.ts`, coberta por `tests/log-arquitetura.test.ts` |
| `src/app/(sistema)/configuracoes/sistema/loading.tsx` | A | +6/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/app/(sistema)/error.tsx` | M | +5/-6 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/app/error.tsx` | A | +25/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/app/global-error.tsx` | A | +31/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/app/not-found.tsx` | A | +21/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/componentes/CodigoDeReferencia.tsx` | A | +12/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/componentes/GeradorDeBackup.tsx` | A | +32/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/componentes/Icones.tsx` | M | +7/-0 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/componentes/ListaDeBackups.tsx` | A | +33/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/componentes/PaginaDeErro.tsx` | A | +32/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/componentes/PainelDoSistema.tsx` | A | +163/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/componentes/auditoria-logica.ts` | M | +9/-0 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/componentes/itens-de-menu.ts` | M | +7/-1 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/componentes/sistema-logica.ts` | A | +75/-0 | L3: código novo em arquivo novo, com os dois testes da task verdes |
| `src/estilos/global.css` | M | +91/-0 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/lib/versao.ts` | A | +36/-0 | L3: arquivo novo (versão e migrations lidas do disco) com `tests/versao.test.ts` verde |
| `src/servicos/agentes.ts` | M | +2/-1 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/servicos/canal-telegram.ts` | M | +2/-1 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/servicos/chat.ts` | M | +9/-11 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/servicos/fontes.ts` | M | +3/-2 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/servicos/historico.ts` | M | +2/-1 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/servicos/telegram-webhook.ts` | M | +12/-8 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `src/servicos/transcricao-de-midia.ts` | M | +7/-9 | L2: camada isolada com cobertura existente; a mudança troca o `console` ou o tratamento de erro pelo log estruturado, e a suíte inteira está verde |
| `tests/agentes.test.ts` | M | +1/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/ambiente.test.ts` | M | +20/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/auditoria-acoes.test.ts` | M | +3/-2 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/auditoria.test.ts` | M | +11/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/chat-falhas.test.ts` | M | +1/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/expurgo-agendador.test.ts` | M | +35/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/fontes-ciclo.test.ts` | M | +1/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/fontes-fila-video.test.ts` | M | +1/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/fontes-fila.test.ts` | M | +1/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/historico-apagar.test.ts` | M | +4/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/instrumentacao.test.ts` | M | +63/-4 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/menu.test.ts` | M | +13/-2 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/projeto.test.ts` | M | +225/-47 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |
| `tests/usuarios.test.ts` | M | +41/-1 | o diff altera ou remove linhas em teste existente (citações e asserções de convenção): confira que nenhuma asserção foi enfraquecida |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/entregas/operacao-e-backup/ENTREGA.md` | A | +46/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/00-AUDITORIA.md` | A | +18/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/00-BLOQUEIOS.md` | A | +14/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/00-DECISOES.md` | A | +261/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/BRIEFING-BUILDX.md` | A | +47/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/FECHAMENTO.md` | A | +45/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/ORQUESTRADOR.md` | A | +103/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/RELATORIO-FEATURE.md` | A | +60/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/VERIFICACAO-CONTEINER.md` | A | +28/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/VERIFICACAO-VISUAL.md` | A | +21/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/00-INDICE.md` | A | +43/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/00-LACUNAS.md` | A | +9/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/ambiente-e-start.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/banco-e-armazenamento.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/conteiner-e-ferramentas.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/log-e-erros.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/segundo-plano-e-auditoria.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/telas-menu-e-guardas.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/base/testes-ci-e-docs.md` | A | +25/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-01/fases.md` | A | +81/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-01/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-01/tasks.md` | A | +110/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-02/fases.md` | A | +93/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-02/sprint.md` | A | +40/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-02/tasks.md` | A | +238/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-03/fases.md` | A | +84/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-03/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-03/tasks.md` | A | +142/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-04/fases.md` | A | +81/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-04/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-04/tasks.md` | A | +110/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-05/fases.md` | A | +114/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-05/sprint.md` | A | +41/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-05/tasks.md` | A | +238/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-06/fases.md` | A | +87/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-06/sprint.md` | A | +40/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-06/tasks.md` | A | +174/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-07/fases.md` | A | +87/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-07/sprint.md` | A | +40/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-07/tasks.md` | A | +174/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-08/fases.md` | A | +84/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-08/sprint.md` | A | +39/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `docs/operacao-e-backup/sprint-08/tasks.md` | A | +142/-0 | D3: documento de plano, auditoria, entrega ou verificação gerado pelo fluxo (sprintx, mergex), sem efeito em execução |
| `package-lock.json` | M | +83/-162 | D3: lockfile gerado pelo npm; a mudança de dependência é lida em package.json |
| `tests/ambiente-start.test.ts` | A | +93/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/ambiente-validar.test.ts` | A | +163/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/apoio/backups-de-teste.ts` | A | +112/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/apoio/comando.ts` | A | +48/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/apoio/instalacao.ts` | A | +173/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/auditoria-logica.test.ts` | M | +13/-0 | D1: o diff só acrescenta casos em arquivo de teste existente |
| `tests/backup-acao.test.ts` | A | +86/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/backup-comando.test.ts` | A | +103/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/backup-lib.test.ts` | A | +146/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/backup-retencao.test.ts` | A | +162/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/backup-servico.test.ts` | A | +170/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/backup-ui.test.tsx` | A | +85/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/backups-rota.test.ts` | A | +100/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/chat-fontes.test.ts` | M | +20/-0 | D1: o diff só acrescenta casos em arquivo de teste existente |
| `tests/conteiner-imagem.test.ts` | A | +272/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/conteiner.test.ts` | A | +156/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/correlacao.test.ts` | A | +139/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/criar-admin.test.ts` | A | +116/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/dependencias-operacao.test.ts` | A | +126/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/desligamento.test.ts` | A | +171/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/erro-inesperado.test.ts` | A | +136/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/erro-paginas.test.tsx` | A | +135/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/instalacao-apoio.test.ts` | A | +94/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/log-arquitetura.test.ts` | A | +59/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/log-servicos.test.ts` | A | +86/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/log.test.ts` | A | +298/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/painel-do-sistema.test.tsx` | A | +126/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/pilha-nao-vaza.test.ts` | A | +110/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/restauracao-comando.test.ts` | A | +238/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/restauracao-fim-a-fim.test.ts` | A | +164/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/restauracao-recusas.test.ts` | A | +117/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/restauracao-troca.test.ts` | A | +161/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/restauracao-validacao.test.ts` | A | +198/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/saude-rota.test.ts` | A | +41/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/saude.test.ts` | A | +125/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/setup.ts` | M | +4/-0 | D1: o diff só acrescenta casos em arquivo de teste existente |
| `tests/sistema-estilos.test.ts` | A | +55/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/sistema-logica.test.ts` | A | +72/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/sistema-pagina.test.tsx` | A | +67/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/sistema.test.ts` | A | +160/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |
| `tests/versao.test.ts` | A | +17/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada) |

## Fontes consultadas

- `git diff --name-status` e `--numstat` contra `feat/privacidade-e-auditoria` (três pontos): tipo e tamanho de cada arquivo.
- `docs/operacao-e-backup/sprint-0*/tasks.md`: a task que tocou cada arquivo e os dois testes declarados; suíte inteira verde (2863 testes) no estado final, com `tsc`, `lint`, `build` e `npm audit` verdes.
- `docs/stack/CONVENCOES.md`: camadas, regra do log único, regra de verificação de citações.

## Fontes ausentes

- `docs/legado/PERFIL.md`: não há zona de risco declarada; a dimensão O1 não foi avaliada.
- Raio de impacto, testes de caracterização e plano de reversão da legadox: ausentes; O7 e O8 não puderam ser avaliados, e o efeito irreversível (restauração) foi tratado pelo critério O2.
- Relatório de cobertura: o repositório não tem provedor de cobertura (lacuna 2); a cobertura veio das tasks e dos testes nomeados.
- memox: não consultado (motor ausente neste repositório).
