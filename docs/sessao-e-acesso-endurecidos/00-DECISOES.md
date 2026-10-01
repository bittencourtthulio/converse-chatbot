---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-10-01
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: "densidade mvp ou profundo"
    motivo: "respondido por buildx; PROJETO.md (modo autonomo total) e briefing de FT-12 (escopo fechado em nove itens)"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "o token de sessao leva as claims sub, papel, jti (UUID do login), v (versao de sessao do usuario), ini (inicio absoluto da sessao, em segundos) e iat/exp; a ausencia de jti, v ou ini recusa o token (401): quem tinha sessao aberta no deploy entra de novo uma vez"
    alternativa_descartada: "aceitar token legado como versao 0 e nao revogavel"
    motivo: "PR-101 (nova); base/sessao-e-cookie.md (hoje sem jti); regra: token sem jti nao seria revogavel, e a janela e de no maximo 15 minutos"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "migration 20261003000000_sessao_e_acesso_endurecidos so acrescenta: tabela sessoes_revogadas (jti chave primaria, usuarioId texto sem chave estrangeira, revogadaEm padrao agora, expiraEm com indice) e a coluna usuarios.versaoDaSessao inteiro padrao 0; o modelo Prisma ganha SessaoRevogada e Usuario.versaoDaSessao e sessoesValidasDesde fica como legado nao lido"
    alternativa_descartada: "remover sessoesValidasDesde; chave estrangeira para usuarios com cascata"
    motivo: "PR-101; PR-103; base/testes-expurgo-e-ambiente.md (tests/migracoes.test.ts proibe DROP; restauracao-comando.test.ts:142 usa a coluna); sem chave estrangeira para a exclusao definitiva de usuario nunca falhar"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "sair le o cookie, chama revogarSessao(token) do servico (verifica a assinatura, ignora token invalido ou ja expirado, grava o jti idempotente com expiraEm = ini + SESSAO_MAXIMA_HORAS), apaga o cookie e redireciona a /entrar; falha ao gravar a revogacao vai ao log pelo nome do erro e nao impede apagar o cookie"
    alternativa_descartada: "falhar o logout se a revogacao falhar; auditar o logout"
    motivo: "PR-101; PR-19 (lista de acoes auditadas e fechada, logout nao entra); CONVENCOES secao 6 (Log: so o nome do erro)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "usuarioDaSessao(token, {agora}) valida na ordem: assinatura e expiracao pelo relogio injetado, jti revogado, usuario existente e ativo, versao do token menor que a do usuario (mensagem Sessao encerrada por troca de senha), e inicio mais limite absoluto ja passado; o proxy e as guardas usam a mesma funcao"
    alternativa_descartada: "validacao separada no proxy"
    motivo: "PR-101; PR-102; PR-103; base/sessao-e-cookie.md (usuarioDaSessao e o unico caminho de validacao)"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "a renovacao e renovarSessaoSePreciso(token, {agora}) em src/servicos/autenticacao.ts: valida como usuarioDaSessao e, se passou a metade do TTL desde o iat e ainda ha folga ate o limite absoluto, devolve um token novo com o mesmo jti, v e ini, iat = agora e exp = min(agora + TTL, ini + maximo), mais os segundos de Max-Age; senao devolve null"
    alternativa_descartada: "renovar a cada requisicao; novo jti a cada renovacao"
    motivo: "PR-102 (nova); novo jti deixaria o token roubado antes do logout fora da revogacao, o mesmo jti a cobre mesmo com renovacao concorrente"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "src/proxy.ts chama a renovacao quando ha cookie expx_sessao, a requisicao nao e uma Server Action (nem POST a uma pagina, que cobre o formulario sem JavaScript, nem cabecalho next-action; POST a /api renova) e o caminho nao e publico (/embed, /api/publico, /api/telegram, /api/saude); grava o cookie novo com response.cookies.set e opcoesDoCookie(maxAge); qualquer falha vai ao log como aviso renovacao_falhou (so o nome do erro) e a requisicao segue sem renovar; o proxy nunca redireciona nem nega, as guardas dos handlers decidem"
    alternativa_descartada: "renovar dentro do componente de servidor (proibido no Next 16); proxy decidindo acesso"
    motivo: "PR-102; base/proxy-e-renovacao.md (proxy.md Using Cookies, authentication.md Setting cookies); lacuna 1 da F1: o Set-Cookie do proxy numa resposta de Server Action que apaga o cookie e NAO DOCUMENTADO, por isso a acao fica de fora e o teste de ponta a ponta prova o logout"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "o matcher do proxy continua o mesmo (exclui estaticos e as rotas de upload /api/agentes/<id>/fontes...); o uso so por upload nao estende a sessao e isso e declarado na premissa e nas convencoes"
    alternativa_descartada: "incluir os uploads no matcher"
    motivo: "PR-102; base/proxy-e-renovacao.md; src/proxy.ts:47-56 e FECHAMENTO da FT-11 (o proxy trunca corpo de upload grande)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "SESSAO_MAXIMA_HORAS (inteiro positivo, padrao 12) e lida so em src/lib/ambiente.ts (getter sessaoMaximaHoras, entra em INTEIROS_OPCIONAIS do validarAmbiente e no .env.example); assinarSessao limita o exp do login a min(iat + TTL, iat + maximo)"
    alternativa_descartada: "valor fixo no codigo; maximo em dias"
    motivo: "PR-102; CONVENCOES secao 6 (Configuracao e segredo: variavel lida so em ambiente.ts, documentada no .env.example)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "o relogio e injetavel como agora em segundos nas funcoes de lib/sessao (assinarSessao, lerSessao com currentDate do jose) e de servicos/autenticacao; criarLimitador passa a ter o padrao () => Date.now() (nao a referencia Date.now) para vi.setSystemTime alcancar o limitador padrao nos testes de acao"
    alternativa_descartada: "relogio global mockado so nos testes; esperar 60 s reais"
    motivo: "PR-36; base/limites-de-uso.md (lacuna: Date.now capturado por referencia); CONVENCOES secao 3 (relogio injetavel e o padrao do projeto)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "Usuario.versaoDaSessao substitui o corte por relogio: assinarSessao no login grava v = versao atual; trocarSenha incrementa a versao com a senha nova na mesma atualizacao e devolve token com a versao nova; sessoesValidasDesde deixa de ser lida e gravada; tokens de versao menor caem, e usuarios existentes ficam com versao 0"
    alternativa_descartada: "manter o corte e so avancar o iat; usar < em vez de <="
    motivo: "PR-103 (nova); base/troca-de-senha-e-versao.md (janela de 1 s, achado A-1)"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "a ordem de login: entrar le usuario.versaoDaSessao e gera jti (crypto.randomUUID) e ini = iat; duas trocas seguidas deixam so o token da ultima valido; a troca de senha continua exigindo a senha atual e mantendo o token devolvido na sessao de quem trocou"
    alternativa_descartada: "reemitir token em outro ponto"
    motivo: "PR-31; tests/perfil.test.ts:162,181 (propriedades preservadas)"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "guardas em profundidade: conversas/[id]/page.tsx chama exigirUsuario() na propria pagina; auditoria.listar(autor, entrada) chama exigirAdmin(autor) primeiro e a pagina de auditoria e os testes passam o ator; a varredura dos servicos de admin (usuarios, integracoes, privacidade, titular, sistema, backup) confirmou que cada funcao so de admin ja se defende, e o resultado fica listado em docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md"
    alternativa_descartada: "so documentar o achado; mover a guarda para o proxy"
    motivo: "PR-104 (nova); PR-12; base/guardas-de-acesso.md; achados R-01 e R-02 do B6"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "o teste de arquitetura tests/guardas-arquitetura.test.ts enumera por fs as paginas de src/app/(sistema) e as rotas de src/app/api, exige guarda no proprio arquivo (exigirUsuario ou exigirUsuarioAdmin nas paginas, exigirUsuarioAdmin nas de configuracoes, usuarioAtual ou exigirSessao nas rotas), tem uma lista explicita e comentada de excecoes publicas e falha se uma excecao deixar de existir; a verificacao e uma funcao pura testada com amostras sinteticas que provam que ela falha sem a guarda"
    alternativa_descartada: "varredura por regex no CI sem teste da propria regra; so revisao humana"
    motivo: "PR-104; CONVENCOES secao 5 (tests/camadas.test.ts usa amostras para provar a regra); regra da FT-12: o teste tem de falhar quando a protecao e removida"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "GET /api/publico/agentes/[id]/conversa passa o IP (ipDoCliente) a retomarConversaDoVisitante, que valida o visitante, chama exigirLimiteDeIp e so depois confere o agente; compartilha a chave chat:ip-agente do POST e do DELETE; a resposta de bloqueio sai por erroPublico (429 com Retry-After, frase unica, sem dado do agente)"
    alternativa_descartada: "limite proprio para a leitura; sem limite"
    motivo: "PR-56; PR-57; base/limites-de-uso.md; achado 4 de premissas-35-70.md"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "o teste do limite de login chama a acao autenticar com next/headers e next/navigation simulados e o sessao-servidor REAL (cookie falso que registra set e delete), com TRUST_PROXY=1 e x-forwarded-for por teste; prova a sexta tentativa por minuto do mesmo IP e e-mail e a vigesima primeira do mesmo IP, a mensagem Muitas tentativas, credencial certa dentro do limite entrando, e o reinicio apos 60 s com vi.setSystemTime"
    alternativa_descartada: "simular exigirLimiteDeLogin; esperar 60 s reais"
    motivo: "PR-36; PR-16; base/limites-de-uso.md; tests/telegram-acoes.test.ts:12-35 (padrao de simular so as bordas do framework)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "os atributos do cookie sao provados em tres niveis: opcoesDoCookie() com NODE_ENV test e production (HttpOnly, SameSite lax, Path /, Secure so em producao, Max-Age igual ao TTL ou ao restante), o Set-Cookie do login real contra o servidor de producao (formulario da acao enviado sem JavaScript) e salvarSenha chamando o gravarCookieDeSessao real com cookies() simulado"
    alternativa_descartada: "so o teste de unidade; simular gravarCookieDeSessao"
    motivo: "PR-27; PR-31; achado A-02 do B6; base/sessao-e-cookie.md"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "a prova de ponta a ponta usa um servidor de producao proprio (porta propria, JWT_TTL_SEGUNDOS curto e OpenRouter simulado) em tests/sessao-fim-a-fim.test.ts: logout e reuso do cookie roubado, renovacao do cookie depois da metade do TTL, usuario ativo alem do TTL e inativo derrubado, login imediato apos a troca de senha, outras sessoes preservadas no logout; o limite absoluto e a revogacao sem renovar sao provados no servico com relogio injetado"
    alternativa_descartada: "relogio do servidor adiantado por variavel de ambiente de producao"
    motivo: "PR-101; PR-102; PR-103; base/testes-expurgo-e-ambiente.md (o relogio do servidor filho nao e injetavel; um relogio falso por variavel no codigo de producao seria superficie de ataque)"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "o expurgo apaga as revogacoes com expiraEm anterior a agora na mesma rodada e devolve a contagem em sessoesRevogadas; essa contagem nao muda a condicao de gravar a auditoria expurgo_automatico nem os detalhes dela"
    alternativa_descartada: "contar nas condicoes da auditoria; agendador novo"
    motivo: "PR-101; src/servicos/expurgo.ts:61-100 (rodada unica, relogio injetavel agora)"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "limparBanco de tests/ajuda.ts passa a apagar a tabela sessoes_revogadas; o tipo UsuarioAutenticado nao muda"
    alternativa_descartada: "incluir a versao no usuario autenticado"
    motivo: "base/testes-expurgo-e-ambiente.md; manter o contrato das telas e dos 40 arquivos de teste que usam criarUsuario"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "a verificacao no navegador usa um Chrome proprio (user-data-dir temporario, porta de depuracao livre, alvo confirmado antes de interagir), servidor de producao local com JWT_TTL_SEGUNDOS reduzido e segredos inline, nos dois temas e a 375 px; o que nao puder ser visto fica registrado em VERIFICACAO-VISUAL.md"
    alternativa_descartada: "reaproveitar um Chrome aberto; porta de depuracao fixa"
    motivo: "buildx B4 secao 5 (incidente da FT-10); docs/operacao-e-backup/VERIFICACAO-VISUAL.md"
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: "documentos: premissas PR-101 a PR-104 (Origem recursao, Etapa b5) ja gravadas; ao fechar, LACUNAS e CONVENCOES ganham a sessao revogavel e renovavel, a regra guarda no layout e na pagina e o teste de arquitetura; RECURSAO move PEND-12 a PEND-17 para Resolvido no ciclo 2 (FT-12)"
    alternativa_descartada: "deixar as lacunas abertas"
    motivo: "PR-101 a PR-104; briefing item 8; docs/projeto/RECURSAO.md"
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: "telas: nenhuma tela nova; a mensagem de login bloqueado e a de sessao encerrada reutilizam os componentes e textos existentes (Alerta de erro do FormularioDeLogin)"
    alternativa_descartada: "pagina de sessao expirada"
    motivo: "PROJETO.md (interface); CONVENCOES secao 6 (Interface); briefing (escopo so de sessao e acesso)"
    status: fechada
    bloqueante: false
---

# Decisões — sessao-e-acesso-endurecidos

> Respondidas pelo buildx (`respondido_por: buildx`) pelos quatro degraus: PROJETO.md, PREMISSAS.md, CONVENCOES.md e, sem resposta nos três, premissa nova. Decisão fechada por pesquisa leva `(HIPOTESE)` no motivo apenas quando não vem de premissa registrada; as premissas PR-101 a PR-104 foram criadas antes de responder (degrau 4). Nenhuma regra de negócio nova foi decidida: tudo é como o sistema se protege.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (nenhuma pergunta ao usuário; o buildx responde)

## Eixos

1. Escopo de negócio: D-00, D-12, D-14, D-21, D-22 (nove itens do briefing; FT-13 e PEND-11 fora).
2. Arquitetura: D-02, D-04 a D-07, D-09, D-11, D-13.
3. Contrato de dados: D-01, D-02, D-10, D-18.
4. Estado e observabilidade: D-03, D-06 (log só com o nome do erro).
5. Resiliência e política de erro: D-03, D-06 (falha de revogação e de renovação não derrubam o usuário).
6. Ambiente e segredos: D-08 (`SESSAO_MAXIMA_HORAS`), D-09.
7. Definição de pronto: D-15, D-16, D-17, D-19, D-20 (cada proteção com teste que falha sem ela, registrado no ENTREGA.md).

## Decisões

```
D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PROJETO.md (modo autonomo total) e briefing de FT-12 (escopo fechado em nove itens)
D-01 | o token de sessao leva as claims sub, papel, jti (UUID do login), v (versao de sessao do usuario), ini (inicio absoluto da sessao, em segundos) e iat/exp; a ausencia de jti, v ou ini recusa o token (401): quem tinha sessao aberta no deploy entra de novo uma vez | aceitar token legado como versao 0 e nao revogavel | PR-101 (nova); base/sessao-e-cookie.md (hoje sem jti); regra: token sem jti nao seria revogavel, e a janela e de no maximo 15 minutos
D-02 | migration 20261003000000_sessao_e_acesso_endurecidos so acrescenta: tabela sessoes_revogadas (jti chave primaria, usuarioId texto sem chave estrangeira, revogadaEm padrao agora, expiraEm com indice) e a coluna usuarios.versaoDaSessao inteiro padrao 0; o modelo Prisma ganha SessaoRevogada e Usuario.versaoDaSessao e sessoesValidasDesde fica como legado nao lido | remover sessoesValidasDesde; chave estrangeira para usuarios com cascata | PR-101; PR-103; base/testes-expurgo-e-ambiente.md (tests/migracoes.test.ts proibe DROP; restauracao-comando.test.ts:142 usa a coluna); sem chave estrangeira para a exclusao definitiva de usuario nunca falhar
D-03 | sair le o cookie, chama revogarSessao(token) do servico (verifica a assinatura, ignora token invalido ou ja expirado, grava o jti idempotente com expiraEm = ini + SESSAO_MAXIMA_HORAS), apaga o cookie e redireciona a /entrar; falha ao gravar a revogacao vai ao log pelo nome do erro e nao impede apagar o cookie | falhar o logout se a revogacao falhar; auditar o logout | PR-101; PR-19 (lista de acoes auditadas e fechada, logout nao entra); CONVENCOES secao 6 (Log: so o nome do erro)
D-04 | usuarioDaSessao(token, {agora}) valida na ordem: assinatura e expiracao pelo relogio injetado, jti revogado, usuario existente e ativo, versao do token menor que a do usuario (mensagem Sessao encerrada por troca de senha), e inicio mais limite absoluto ja passado; o proxy e as guardas usam a mesma funcao | validacao separada no proxy | PR-101; PR-102; PR-103; base/sessao-e-cookie.md (usuarioDaSessao e o unico caminho de validacao)
D-05 | a renovacao e renovarSessaoSePreciso(token, {agora}) em src/servicos/autenticacao.ts: valida como usuarioDaSessao e, se passou a metade do TTL desde o iat e ainda ha folga ate o limite absoluto, devolve um token novo com o mesmo jti, v e ini, iat = agora e exp = min(agora + TTL, ini + maximo), mais os segundos de Max-Age; senao devolve null | renovar a cada requisicao; novo jti a cada renovacao | PR-102 (nova); novo jti deixaria o token roubado antes do logout fora da revogacao, o mesmo jti a cobre mesmo com renovacao concorrente
D-06 | src/proxy.ts chama a renovacao quando ha cookie expx_sessao, a requisicao nao e uma Server Action (nem POST a uma pagina, que cobre o formulario sem JavaScript, nem cabecalho next-action; POST a /api renova) e o caminho nao e publico (/embed, /api/publico, /api/telegram, /api/saude); grava o cookie novo com response.cookies.set e opcoesDoCookie(maxAge); qualquer falha vai ao log como aviso renovacao_falhou (so o nome do erro) e a requisicao segue sem renovar; o proxy nunca redireciona nem nega, as guardas dos handlers decidem | renovar dentro do componente de servidor (proibido no Next 16); proxy decidindo acesso | PR-102; base/proxy-e-renovacao.md (proxy.md Using Cookies, authentication.md Setting cookies); lacuna 1 da F1: o Set-Cookie do proxy numa resposta de Server Action que apaga o cookie e NAO DOCUMENTADO, por isso a acao fica de fora e o teste de ponta a ponta prova o logout
D-07 | o matcher do proxy continua o mesmo (exclui estaticos e as rotas de upload /api/agentes/<id>/fontes...); o uso so por upload nao estende a sessao e isso e declarado na premissa e nas convencoes | incluir os uploads no matcher | PR-102; base/proxy-e-renovacao.md; src/proxy.ts:47-56 e FECHAMENTO da FT-11 (o proxy trunca corpo de upload grande)
D-08 | SESSAO_MAXIMA_HORAS (inteiro positivo, padrao 12) e lida so em src/lib/ambiente.ts (getter sessaoMaximaHoras, entra em INTEIROS_OPCIONAIS do validarAmbiente e no .env.example); assinarSessao limita o exp do login a min(iat + TTL, iat + maximo) | valor fixo no codigo; maximo em dias | PR-102; CONVENCOES secao 6 (Configuracao e segredo: variavel lida so em ambiente.ts, documentada no .env.example)
D-09 | o relogio e injetavel como agora em segundos nas funcoes de lib/sessao (assinarSessao, lerSessao com currentDate do jose) e de servicos/autenticacao; criarLimitador passa a ter o padrao () => Date.now() (nao a referencia Date.now) para vi.setSystemTime alcancar o limitador padrao nos testes de acao | relogio global mockado so nos testes; esperar 60 s reais | PR-36; base/limites-de-uso.md (lacuna: Date.now capturado por referencia); CONVENCOES secao 3 (relogio injetavel e o padrao do projeto)
D-10 | Usuario.versaoDaSessao substitui o corte por relogio: assinarSessao no login grava v = versao atual; trocarSenha incrementa a versao com a senha nova na mesma atualizacao e devolve token com a versao nova; sessoesValidasDesde deixa de ser lida e gravada; tokens de versao menor caem, e usuarios existentes ficam com versao 0 | manter o corte e so avancar o iat; usar < em vez de <= | PR-103 (nova); base/troca-de-senha-e-versao.md (janela de 1 s, achado A-1)
D-11 | a ordem de login: entrar le usuario.versaoDaSessao e gera jti (crypto.randomUUID) e ini = iat; duas trocas seguidas deixam so o token da ultima valido; a troca de senha continua exigindo a senha atual e mantendo o token devolvido na sessao de quem trocou | reemitir token em outro ponto | PR-31; tests/perfil.test.ts:162,181 (propriedades preservadas)
D-12 | guardas em profundidade: conversas/[id]/page.tsx chama exigirUsuario() na propria pagina; auditoria.listar(autor, entrada) chama exigirAdmin(autor) primeiro e a pagina de auditoria e os testes passam o ator; a varredura dos servicos de admin (usuarios, integracoes, privacidade, titular, sistema, backup) confirmou que cada funcao so de admin ja se defende, e o resultado fica listado em docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md | so documentar o achado; mover a guarda para o proxy | PR-104 (nova); PR-12; base/guardas-de-acesso.md; achados R-01 e R-02 do B6
D-13 | o teste de arquitetura tests/guardas-arquitetura.test.ts enumera por fs as paginas de src/app/(sistema) e as rotas de src/app/api, exige guarda no proprio arquivo (exigirUsuario ou exigirUsuarioAdmin nas paginas, exigirUsuarioAdmin nas de configuracoes, usuarioAtual ou exigirSessao nas rotas), tem uma lista explicita e comentada de excecoes publicas e falha se uma excecao deixar de existir; a verificacao e uma funcao pura testada com amostras sinteticas que provam que ela falha sem a guarda | varredura por regex no CI sem teste da propria regra; so revisao humana | PR-104; CONVENCOES secao 5 (tests/camadas.test.ts usa amostras para provar a regra); regra da FT-12: o teste tem de falhar quando a protecao e removida
D-14 | GET /api/publico/agentes/[id]/conversa passa o IP (ipDoCliente) a retomarConversaDoVisitante, que valida o visitante, chama exigirLimiteDeIp e so depois confere o agente; compartilha a chave chat:ip-agente do POST e do DELETE; a resposta de bloqueio sai por erroPublico (429 com Retry-After, frase unica, sem dado do agente) | limite proprio para a leitura; sem limite | PR-56; PR-57; base/limites-de-uso.md; achado 4 de premissas-35-70.md
D-15 | o teste do limite de login chama a acao autenticar com next/headers e next/navigation simulados e o sessao-servidor REAL (cookie falso que registra set e delete), com TRUST_PROXY=1 e x-forwarded-for por teste; prova a sexta tentativa por minuto do mesmo IP e e-mail e a vigesima primeira do mesmo IP, a mensagem Muitas tentativas, credencial certa dentro do limite entrando, e o reinicio apos 60 s com vi.setSystemTime | simular exigirLimiteDeLogin; esperar 60 s reais | PR-36; PR-16; base/limites-de-uso.md; tests/telegram-acoes.test.ts:12-35 (padrao de simular so as bordas do framework)
D-16 | os atributos do cookie sao provados em tres niveis: opcoesDoCookie() com NODE_ENV test e production (HttpOnly, SameSite lax, Path /, Secure so em producao, Max-Age igual ao TTL ou ao restante), o Set-Cookie do login real contra o servidor de producao (formulario da acao enviado sem JavaScript) e salvarSenha chamando o gravarCookieDeSessao real com cookies() simulado | so o teste de unidade; simular gravarCookieDeSessao | PR-27; PR-31; achado A-02 do B6; base/sessao-e-cookie.md
D-17 | a prova de ponta a ponta usa um servidor de producao proprio (porta propria, JWT_TTL_SEGUNDOS curto e OpenRouter simulado) em tests/sessao-fim-a-fim.test.ts: logout e reuso do cookie roubado, renovacao do cookie depois da metade do TTL, usuario ativo alem do TTL e inativo derrubado, login imediato apos a troca de senha, outras sessoes preservadas no logout; o limite absoluto e a revogacao sem renovar sao provados no servico com relogio injetado | relogio do servidor adiantado por variavel de ambiente de producao | PR-101; PR-102; PR-103; base/testes-expurgo-e-ambiente.md (o relogio do servidor filho nao e injetavel; um relogio falso por variavel no codigo de producao seria superficie de ataque)
D-18 | o expurgo apaga as revogacoes com expiraEm anterior a agora na mesma rodada e devolve a contagem em sessoesRevogadas; essa contagem nao muda a condicao de gravar a auditoria expurgo_automatico nem os detalhes dela | contar nas condicoes da auditoria; agendador novo | PR-101; src/servicos/expurgo.ts:61-100 (rodada unica, relogio injetavel agora)
D-19 | limparBanco de tests/ajuda.ts passa a apagar a tabela sessoes_revogadas; o tipo UsuarioAutenticado nao muda | incluir a versao no usuario autenticado | base/testes-expurgo-e-ambiente.md; manter o contrato das telas e dos 40 arquivos de teste que usam criarUsuario
D-20 | a verificacao no navegador usa um Chrome proprio (user-data-dir temporario, porta de depuracao livre, alvo confirmado antes de interagir), servidor de producao local com JWT_TTL_SEGUNDOS reduzido e segredos inline, nos dois temas e a 375 px; o que nao puder ser visto fica registrado em VERIFICACAO-VISUAL.md | reaproveitar um Chrome aberto; porta de depuracao fixa | buildx B4 secao 5 (incidente da FT-10); docs/operacao-e-backup/VERIFICACAO-VISUAL.md
D-21 | documentos: premissas PR-101 a PR-104 (Origem recursao, Etapa b5) ja gravadas; ao fechar, LACUNAS e CONVENCOES ganham a sessao revogavel e renovavel, a regra guarda no layout e na pagina e o teste de arquitetura; RECURSAO move PEND-12 a PEND-17 para Resolvido no ciclo 2 (FT-12) | deixar as lacunas abertas | PR-101 a PR-104; briefing item 8; docs/projeto/RECURSAO.md
D-22 | telas: nenhuma tela nova; a mensagem de login bloqueado e a de sessao encerrada reutilizam os componentes e textos existentes (Alerta de erro do FormularioDeLogin) | pagina de sessao expirada | PROJETO.md (interface); CONVENCOES secao 6 (Interface); briefing (escopo so de sessao e acesso)
```

## Hipóteses assumidas por pesquisa (resumo)

Tudo acima cita PR, convenção ou base. As escolhas sem regra de negócio e reversíveis, vistas como hipóteses: D-01 (recusar token sem `jti`, custo de um novo login por usuário no deploy), D-03 (falha de revogação não bloqueia o logout, só vai ao log), D-06 (renovar só fora de Server Action e rota pública), D-07 (uploads não renovam). Nenhuma exige o usuário.

## Pendências

Nenhuma pendência.
