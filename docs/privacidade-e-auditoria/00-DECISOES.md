---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
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
    decisao: "tabela RegistroDeAuditoria e servico src/servicos/auditoria.ts com registrar e listar, acoes de conjunto fechado validado por zod, somente-acrescimo; migration que so acrescenta"
    alternativa_descartada: "edicao ou remocao de registro; acao em texto livre"
    motivo: "PR-86 (nova); PR-19; CONVENCOES secao 4 (migracao so acrescenta)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "registrar aceita um cliente de transacao opcional; chave, usuario (criar, editar, excluir) e exclusao de agente gravam na mesma transacao; o restante grava logo depois com erro em log sem derrubar a acao"
    alternativa_descartada: "gravar tudo de forma imediata; transacao em tudo"
    motivo: "PR-87 (nova); PR-19"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "detalhes JSON de ate 1000 caracteres, validados por lista de chaves permitidas por acao, sem segredo, sem mascara de chave, sem conteudo de conversa e sem identificador de visitante ou chat"
    alternativa_descartada: "detalhes livres"
    motivo: "PR-86 (nova); PR-14 (segredo nunca devolvido); PR-18"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "ouvintes aoAlterarCanal e aoApagarConversa ligados por ligarAuditoria() idempotente chamada em src/instrumentation.ts; conjuntos de ouvintes em globalThis; teste contra next start prova que o registro acontece pelo servidor de producao"
    alternativa_descartada: "ligar por import circular dos servicos; Set em variavel de modulo"
    motivo: "PR-86 (nova); lacuna 2 da base; CONVENCOES secao 5 (instrumentation e fila em globalThis)"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "a auditoria do canal grava o agenteId como alvo e o nome do agente nos detalhes (lido na hora); a conversa apagada grava canal e contagem de mensagens"
    alternativa_descartada: "gravar so o id"
    motivo: "PR-86; briefing item 1"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "excluirDefinitivamente(id, adminId) em usuarios.ts: recusa a si mesmo e o ultimo admin ativo (409); transacao: agentes do usuario passam ao admin que exclui, SET NULL ja existente em conversas e fontes, atualizadoPor limpo, delete do usuario, auditoria com o rotulo"
    alternativa_descartada: "tornar Agente.criadoPorId anulavel por migration destrutiva; apagar agentes junto"
    motivo: "PR-88 (nova); lacuna 1 da base (criadoPorId obrigatorio com FK restritiva); CONVENCOES secao 4"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "a UI de exclusao fica em Configuracoes > Usuarios: acao Excluir definitivamente so para admin e nunca na propria linha, confirmacao na propria tela exigindo digitar o e-mail do usuario, texto de irreversibilidade e de que desativar e a alternativa"
    alternativa_descartada: "window.confirm; confirmar so por clique"
    motivo: "briefing item 2; CONVENCOES secao Interface; PR-80 (confirmacao na tela)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "retencaoDiasConversas em ConfiguracaoDoWorkspace, inteiro anulavel, padrao 90, faixa 7 a 3650, nulo = sem expurgo automatico por escolha explicita com aviso; migration so acrescenta com padrao 90 para a linha existente e para a ausente"
    alternativa_descartada: "retencao por agente; campo obrigatorio sem opcao de desligar"
    motivo: "PR-89 (nova); PR-18"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "expurgo.ts: corte por atualizadoEm estritamente anterior a agora menos N dias em instante UTC; lotes de 500; 1 minuto apos a subida e a cada 6 horas sem sobreposicao; relogio e intervalos injetaveis; idempotente; falha vira log e nao derruba; tambem purga AtualizacaoTelegram (reuso de purgarAtualizacoes) e auditoria com mais de 365 dias (AUDITORIA_RETENCAO_DIAS) mesmo sem retencao de conversas; registra expurgo_automatico com contagens so quando apagou algo"
    alternativa_descartada: "cron externo; transacao unica para tudo"
    motivo: "PR-89 (nova); lacuna 3 da base; CONVENCOES secao 5 (tarefa em segundo plano)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "variavel nova AUDITORIA_RETENCAO_DIAS (inteiro positivo, padrao 365) lida so em src/lib/ambiente.ts, documentada em .env.example e README"
    alternativa_descartada: "ler direto de process.env"
    motivo: "CONVENCOES secao 6 (Configuracao e segredo); PR-89"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "direitos do titular pelo admin: buscar por canal e identificador (widget id completo ou prefixo de 6 ou mais caracteres com lista de titulares para desambiguar; telegram id do chat), resumo, exportar JSON e TXT e apagar tudo do titular por deleteMany com aviso aoApagarConversa por conversa"
    alternativa_descartada: "exigir id completo; apagar por filtro de agente"
    motivo: "PR-90 (nova); relatorio da FT-09 (exclusao por identificadorExterno)"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "exportacao do titular: Content-Disposition attachment com nome sem o identificador (titular-<canal>-<data>), no-store, nosniff; registra dados_do_titular_exportados com contagem"
    alternativa_descartada: "nome do arquivo com o id do visitante"
    motivo: "PR-90 (nova); PR-78 (identificador completo nunca no nome do arquivo); PR-83"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "visitante apaga a propria conversa por DELETE /api/publico/agentes/[id]/conversa com X-Visitante-Id, so as conversas dele naquele agente, exige agente ativo, Origin da plataforma como no POST, limite de uso por IP e agente; botao no embed com confirmacao na tela, limpa o localStorage e recomeca; auditoria com usuarioId nulo e rotulo Visitante (chat embutido)"
    alternativa_descartada: "POST com corpo; apagar sem verificar o dono"
    motivo: "PR-90 (nova); PR-56 (visitanteId no cabecalho, nunca na URL); PR-58 (Origin); PR-16 (limite de uso); lacuna 4 da base"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "aviso de privacidade padrao do workspace (texto ate 300, URL http ou https opcional) em ConfiguracaoDoWorkspace: fallback do aviso do chat quando o agente nao tem texto e anexo ao /start do Telegram; painel somente leitura Dados pessoais tratados com base legal legitimo interesse a confirmar pela empresa"
    alternativa_descartada: "copiar o texto para cada agente; afirmar parecer juridico"
    motivo: "PR-91 (nova); PR-18; PR-17/FT-06 (aviso por agente)"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "telas /configuracoes/privacidade e /configuracoes/auditoria com guarda de admin em layout.tsx, itens Privacidade e Auditoria no grupo Configuracoes somente-admin; auditoria so leitura com filtros acao, usuario e periodo, paginacao de 25, detalhes em pt-BR por acao, estados vazio, carregando e erro, cartoes abaixo de 768px"
    alternativa_descartada: "pagina unica; filtros no cliente"
    motivo: "CONVENCOES secao Interface; briefing item 6; lista de itens em itens-de-menu.ts"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "contrato HTTP das telas: filtros da auditoria em searchParams validados por zod no servico (422 vira mensagem na tela); acoes de servidor em src/app/acoes.ts para salvar retencao, aviso e excluir usuario; rotas de API so para exportar o titular (GET) e o DELETE publico"
    alternativa_descartada: "API para tudo"
    motivo: "CONVENCOES secao 5 (Handler HTTP e Acao de formulario)"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "restauracao existe como tipo de acao e ponto de chamada (registrar({acao:'restauracao'})) sem implementacao; a FT-11 o chama"
    alternativa_descartada: "implementar restauracao aqui"
    motivo: "briefing (nao-objetivo FT-11); PR-19"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "estado e observabilidade: toda acao critica grava auditoria; falha da auditoria nao critica vai ao log com evento e sem detalhes; o expurgo registra contagens"
    alternativa_descartada: "log com conteudo"
    motivo: "PR-87; CONVENCOES secao Log (nunca conteudo de mensagem)"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "resiliencia: expurgo e auditoria nao derrubam o servidor nem a acao confirmada; lote de expurgo e idempotente e pode ser repetido; se o banco estiver bloqueado, a rodada falha, loga e tenta na proxima"
    alternativa_descartada: "tentar de novo em laco"
    motivo: "PR-89; PR-87"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "segredos e ambiente: nenhuma variavel de segredo nova; AUDITORIA_RETENCAO_DIAS e o unico ajuste de ambiente; ENCRYPTION_KEY nao e tocada"
    alternativa_descartada: "guardar chave de auditoria"
    motivo: "CONVENCOES secao Configuracao e segredo"
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: "definicao de pronto: o admin troca chave, cria, edita e exclui usuario, conecta e desconecta o Telegram simulado, apaga conversa e ajusta retencao e ve cada acao na tela de auditoria; expurgo contra dados semeados com datas antigas; visitante apaga a propria conversa; exportacao do titular baixa; dois temas e 375px"
    alternativa_descartada: "validar so por teste automatico"
    motivo: "PROJETO.md (criterios de aceite) e briefing item 8"
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: "aviso exibido no embed passa a vir de configuracaoPublica com fallback no workspace; a previa da aba Publicar tambem; o campo do agente ganha texto de ajuda dizendo que vazio usa o padrao do workspace"
    alternativa_descartada: "copiar o padrao para o agente"
    motivo: "PR-91 (nova)"
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: "ConversaApagada ganha origem (usuario, titular, visitante) e usuarioId anulavel; o ouvinte da auditoria nao grava conversa_apagada para origem titular (o resumo dados_do_titular_apagados ja a cobre) e grava para visitante com rotulo Visitante (chat embutido)"
    alternativa_descartada: "um registro por conversa em toda exclusao do titular"
    motivo: "D-14 e D-12; PR-90 (nova); decisao da F3 para evitar centenas de registros por pedido de titular"
    status: fechada
    bloqueante: false
  - id: D-24
    decisao: "busca do titular: o identificador digitado (prefixo de 6 ou mais caracteres no widget, id exato no Telegram) deve resolver a um titular unico; se varios, a tela lista prefixos de 10 caracteres com contagens e pede mais caracteres; nenhuma tela, URL ou nome de arquivo leva o identificador completo; exportacao e apagar usam POST com o identificador no corpo"
    alternativa_descartada: "passar o id completo ao cliente; GET com id na URL"
    motivo: "PR-78 e PR-90; PR-56 (visitanteId nunca na URL)"
    status: fechada
    bloqueante: false
  - id: D-25
    decisao: "a prova de que o expurgo roda pela subida e register iniciar o agendador (tests/instrumentacao.test.ts); a prova do expurgo com dados antigos e executarExpurgo com relogio injetado; nenhuma variavel de ambiente de teste e criada; a gravacao de melhor esforco expoe aguardarGravacoesPendentes para os testes"
    alternativa_descartada: "variavel de ambiente para encurtar a primeira rodada do expurgo"
    motivo: "achado ALTA da auditoria F5 rodada 1; D-11 (so AUDITORIA_RETENCAO_DIAS entra no ambiente)"
    status: fechada
    bloqueante: false
---

# Decisões — privacidade-e-auditoria

Respondido por buildx (modo autônomo): cada decisão cita a fonte (PROJETO.md, PR-NN ou CONVENCOES). Premissas novas desta F2: PR-86 a PR-91 em `docs/projeto/PREMISSAS.md`. As quatro lacunas da base ficaram fechadas em D-06, D-04, D-10 e D-14.

## Decisões

```
D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PROJETO.md (modo autonomo total) e briefing
D-01 | tabela RegistroDeAuditoria e servico src/servicos/auditoria.ts com registrar e listar, acoes de conjunto fechado validado por zod, somente-acrescimo; migration que so acrescenta | edicao ou remocao de registro; acao em texto livre | PR-86 (nova); PR-19; CONVENCOES secao 4 (migracao so acrescenta)
D-02 | registrar aceita um cliente de transacao opcional; chave, usuario (criar, editar, excluir) e exclusao de agente gravam na mesma transacao; o restante grava logo depois com erro em log sem derrubar a acao | gravar tudo de forma imediata; transacao em tudo | PR-87 (nova); PR-19
D-03 | detalhes JSON de ate 1000 caracteres, validados por lista de chaves permitidas por acao, sem segredo, sem mascara de chave, sem conteudo de conversa e sem identificador de visitante ou chat | detalhes livres | PR-86 (nova); PR-14 (segredo nunca devolvido); PR-18
D-04 | ouvintes aoAlterarCanal e aoApagarConversa ligados por ligarAuditoria() idempotente chamada em src/instrumentation.ts; conjuntos de ouvintes em globalThis; teste contra next start prova que o registro acontece pelo servidor de producao | ligar por import circular dos servicos; Set em variavel de modulo | PR-86 (nova); lacuna 2 da base; CONVENCOES secao 5 (instrumentation e fila em globalThis)
D-05 | a auditoria do canal grava o agenteId como alvo e o nome do agente nos detalhes (lido na hora); a conversa apagada grava canal e contagem de mensagens | gravar so o id | PR-86; briefing item 1
D-06 | excluirDefinitivamente(id, adminId) em usuarios.ts: recusa a si mesmo e o ultimo admin ativo (409); transacao: agentes do usuario passam ao admin que exclui, SET NULL ja existente em conversas e fontes, atualizadoPor limpo, delete do usuario, auditoria com o rotulo | tornar Agente.criadoPorId anulavel por migration destrutiva; apagar agentes junto | PR-88 (nova); lacuna 1 da base (criadoPorId obrigatorio com FK restritiva); CONVENCOES secao 4
D-07 | a UI de exclusao fica em Configuracoes > Usuarios: acao Excluir definitivamente so para admin e nunca na propria linha, confirmacao na propria tela exigindo digitar o e-mail do usuario, texto de irreversibilidade e de que desativar e a alternativa | window.confirm; confirmar so por clique | briefing item 2; CONVENCOES secao Interface; PR-80 (confirmacao na tela)
D-08 | retencaoDiasConversas em ConfiguracaoDoWorkspace, inteiro anulavel, padrao 90, faixa 7 a 3650, nulo = sem expurgo automatico por escolha explicita com aviso; migration so acrescenta com padrao 90 para a linha existente e para a ausente | retencao por agente; campo obrigatorio sem opcao de desligar | PR-89 (nova); PR-18
D-09 | expurgo.ts: corte por atualizadoEm estritamente anterior a agora menos N dias em instante UTC; lotes de 500; 1 minuto apos a subida e a cada 6 horas sem sobreposicao; relogio e intervalos injetaveis; idempotente; falha vira log e nao derruba; tambem purga AtualizacaoTelegram (reuso de purgarAtualizacoes) e auditoria com mais de 365 dias (AUDITORIA_RETENCAO_DIAS) mesmo sem retencao de conversas; registra expurgo_automatico com contagens so quando apagou algo | cron externo; transacao unica para tudo | PR-89 (nova); lacuna 3 da base; CONVENCOES secao 5 (tarefa em segundo plano)
D-10 | variavel nova AUDITORIA_RETENCAO_DIAS (inteiro positivo, padrao 365) lida so em src/lib/ambiente.ts, documentada em .env.example e README | ler direto de process.env | CONVENCOES secao 6 (Configuracao e segredo); PR-89
D-11 | direitos do titular pelo admin: buscar por canal e identificador (widget id completo ou prefixo de 6 ou mais caracteres com lista de titulares para desambiguar; telegram id do chat), resumo, exportar JSON e TXT e apagar tudo do titular por deleteMany com aviso aoApagarConversa por conversa | exigir id completo; apagar por filtro de agente | PR-90 (nova); relatorio da FT-09 (exclusao por identificadorExterno)
D-12 | exportacao do titular: Content-Disposition attachment com nome sem o identificador (titular-<canal>-<data>), no-store, nosniff; registra dados_do_titular_exportados com contagem | nome do arquivo com o id do visitante | PR-90 (nova); PR-78 (identificador completo nunca no nome do arquivo); PR-83
D-13 | visitante apaga a propria conversa por DELETE /api/publico/agentes/[id]/conversa com X-Visitante-Id, so as conversas dele naquele agente, exige agente ativo, Origin da plataforma como no POST, limite de uso por IP e agente; botao no embed com confirmacao na tela, limpa o localStorage e recomeca; auditoria com usuarioId nulo e rotulo Visitante (chat embutido) | POST com corpo; apagar sem verificar o dono | PR-90 (nova); PR-56 (visitanteId no cabecalho, nunca na URL); PR-58 (Origin); PR-16 (limite de uso); lacuna 4 da base
D-14 | aviso de privacidade padrao do workspace (texto ate 300, URL http ou https opcional) em ConfiguracaoDoWorkspace: fallback do aviso do chat quando o agente nao tem texto e anexo ao /start do Telegram; painel somente leitura Dados pessoais tratados com base legal legitimo interesse a confirmar pela empresa | copiar o texto para cada agente; afirmar parecer juridico | PR-91 (nova); PR-18; PR-17/FT-06 (aviso por agente)
D-15 | telas /configuracoes/privacidade e /configuracoes/auditoria com guarda de admin em layout.tsx, itens Privacidade e Auditoria no grupo Configuracoes somente-admin; auditoria so leitura com filtros acao, usuario e periodo, paginacao de 25, detalhes em pt-BR por acao, estados vazio, carregando e erro, cartoes abaixo de 768px | pagina unica; filtros no cliente | CONVENCOES secao Interface; briefing item 6; lista de itens em itens-de-menu.ts
D-16 | contrato HTTP das telas: filtros da auditoria em searchParams validados por zod no servico (422 vira mensagem na tela); acoes de servidor em src/app/acoes.ts para salvar retencao, aviso e excluir usuario; rotas de API so para exportar o titular (GET) e o DELETE publico | API para tudo | CONVENCOES secao 5 (Handler HTTP e Acao de formulario)
D-17 | restauracao existe como tipo de acao e ponto de chamada (registrar({acao:'restauracao'})) sem implementacao; a FT-11 o chama | implementar restauracao aqui | briefing (nao-objetivo FT-11); PR-19
D-18 | estado e observabilidade: toda acao critica grava auditoria; falha da auditoria nao critica vai ao log com evento e sem detalhes; o expurgo registra contagens | log com conteudo | PR-87; CONVENCOES secao Log (nunca conteudo de mensagem)
D-19 | resiliencia: expurgo e auditoria nao derrubam o servidor nem a acao confirmada; lote de expurgo e idempotente e pode ser repetido; se o banco estiver bloqueado, a rodada falha, loga e tenta na proxima | tentar de novo em laco | PR-89; PR-87
D-20 | segredos e ambiente: nenhuma variavel de segredo nova; AUDITORIA_RETENCAO_DIAS e o unico ajuste de ambiente; ENCRYPTION_KEY nao e tocada | guardar chave de auditoria | CONVENCOES secao Configuracao e segredo
D-21 | definicao de pronto: o admin troca chave, cria, edita e exclui usuario, conecta e desconecta o Telegram simulado, apaga conversa e ajusta retencao e ve cada acao na tela de auditoria; expurgo contra dados semeados com datas antigas; visitante apaga a propria conversa; exportacao do titular baixa; dois temas e 375px | validar so por teste automatico | PROJETO.md (criterios de aceite) e briefing item 8
D-22 | aviso exibido no embed passa a vir de configuracaoPublica com fallback no workspace; a previa da aba Publicar tambem; o campo do agente ganha texto de ajuda dizendo que vazio usa o padrao do workspace | copiar o padrao para o agente | PR-91 (nova)
D-23 | ConversaApagada ganha origem (usuario, titular, visitante) e usuarioId anulavel; o ouvinte da auditoria nao grava conversa_apagada para origem titular (o resumo dados_do_titular_apagados ja a cobre) e grava para visitante com rotulo Visitante (chat embutido) | um registro por conversa em toda exclusao do titular | D-14 e D-12; PR-90 (nova); decisao da F3 para evitar centenas de registros por pedido de titular
D-24 | busca do titular: o identificador digitado (prefixo de 6 ou mais caracteres no widget, id exato no Telegram) deve resolver a um titular unico; se varios, a tela lista prefixos de 10 caracteres com contagens e pede mais caracteres; nenhuma tela, URL ou nome de arquivo leva o identificador completo; exportacao e apagar usam POST com o identificador no corpo | passar o id completo ao cliente; GET com id na URL | PR-78 e PR-90; PR-56 (visitanteId nunca na URL)
D-25 | a prova de que o expurgo roda pela subida e register iniciar o agendador (tests/instrumentacao.test.ts); a prova do expurgo com dados antigos e executarExpurgo com relogio injetado; nenhuma variavel de ambiente de teste e criada; a gravacao de melhor esforco expoe aguardarGravacoesPendentes para os testes | variavel de ambiente para encurtar a primeira rodada do expurgo | achado ALTA da auditoria F5 rodada 1; D-11 (so AUDITORIA_RETENCAO_DIAS entra no ambiente)
```

## Pendências

Nenhuma pendência. Regra de negócio que nenhum arquivo respondia: nenhuma (a base legal é provisória e marcada na PR-91, sem bloqueio).
