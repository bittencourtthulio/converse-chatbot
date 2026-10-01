---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-10-01
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: "densidade mvp ou profundo"
    motivo: "respondido por buildx; PROJETO.md (modo autonomo total) e briefing da FT-13 (escopo fechado em 13 itens)"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "o segmento sem fala e gravado como o texto `[sem fala]` (constante MARCADOR_SEM_FALA em src/servicos/transcricao-marcadores.ts) por transcreverMidia quando o modelo devolve vazio: transcricao_vazia ganha UMA repeticao propria (a primeira vazia repete, a segunda vira sem fala) e as demais falhas transitorias seguem com as 2 repeticoes de hoje; juntarPartes escreve `[MM:SS] [sem fala]` para esse segmento e continua ignorando parte vazia de verdade"
    alternativa_descartada: "falhar a fonte depois das repeticoes; nao repetir o vazio nunca"
    motivo: "PR-105 (nova); base/midia-sem-fala.md (transcricao-de-midia.ts:62,138; tests/transcricao-de-midia.test.ts:155 exige repeticao do vazio seguida de fala)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "a fonte de video falha so se NENHUM segmento tiver fala: transcreverMidia conta os segmentos com fala (texto nao vazio e diferente do marcador) e, com zero, lanca `Não encontrei fala neste áudio.` (422, transcricao_vazia); a mensagem que a fila ja tinha para texto vazio passa a ser a mesma"
    alternativa_descartada: "manter `Não encontrei fala neste arquivo para transcrever.`"
    motivo: "PR-105; briefing item 1 (mensagem pedida); base/midia-sem-fala.md (fontes-fila.ts:168-171)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "o marcador nao polui a busca: depois de dividirEmTrechos a fila descarta o trecho cujo texto, tirados os marcadores de tempo e `[sem fala]`, fica vazio (funcao pura trechoSoDeMarcadores em src/servicos/transcricao-marcadores.ts); o trecho que mistura fala e marcador e indexado como esta, o que e inofensivo; se todos os trechos forem descartados a fonte ja falhou pela D-02"
    alternativa_descartada: "indexar tudo; remover o marcador do texto armazenado"
    motivo: "PR-105; base/midia-sem-fala.md (riscos 2 e 3); CONVENCOES secao 3 (funcao pura testavel)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "o OpenRouter falso ganha `silencios` (indices de parte que respondem texto vazio) e o teste de ponta a ponta gera com o ffmpeg um audio de 25 s com 5 s de fala sintetica, 10 s de silencio e 10 s de ruido, com partes de 10 s por segundosPorParte, para provar fonte pronta com `[sem fala]`, busca que acha a fala, retomada sem repagar o segmento ja gravado e fonte em erro quando tudo e mudo"
    alternativa_descartada: "so mock da dependencia do ffmpeg"
    motivo: "PR-105; CONVENCOES (OpenRouter falso em tests/apoio, ffmpeg real no tests/fontes-video-fim-a-fim.test.ts:67); briefing item 1"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "novo modulo src/lib/corpo-limitado.ts (sem next/*): lerCorpoLimitado(corpo, teto) le o ReadableStream contando bytes, cancela a leitura e lanca CorpoGrandeDemais ao passar do teto, e devolve o buffer; a rota POST de fontes usa o mesmo tetoDoCorpo() (MAX_UPLOAD_MB x 10 + 1 MB), recusa por Content-Length declarado como hoje, le o corpo com lerCorpoLimitado e entrega o buffer a `new Response(buffer, {headers: {content-type}}).formData()` para o parse do multipart; 413 com o mesmo erroDeTamanho"
    alternativa_descartada: "contar so no formData; teto igual a MAX_UPLOAD_MB mais folga (quebraria o envio de varios arquivos de PR-45)"
    motivo: "PR-106 (nova); PR-45 (teto de MAX_UPLOAD_MB x 10 + 1 MB); base/upload-e-teto.md; o briefing diz MAX_UPLOAD_MB + folga, mas PR-45 e os testes de upload existentes exigem ate 10 arquivos: o teto continua o da PR-45 (desvio declarado)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "a prova do teto e em dois niveis: unidade (um stream que conta quantos bytes foram puxados para provar que a leitura para logo depois do teto) e rota contra `next start` com MAX_UPLOAD_MB=1 e um corpo `chunked` sem Content-Length maior que o teto, mais o limite de bytes que o cliente conseguiu enviar antes do 413"
    alternativa_descartada: "so o teste de rota"
    motivo: "PR-106; base/upload-e-teto.md (risco 3); tests/video-rota.test.ts (padrao de servidor com limite pequeno)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "novo modulo src/lib/extracao/isolada.ts: extrairTextoIsolado(entrada, {prazoMs, maxPaginas, comando}) cria o processo filho `node --import tsx src/lib/extracao/trabalhador.ts <formato>` (spawn sem shell, `--max-old-space-size=1024`), escreve os bytes na entrada padrao, le uma linha JSON da saida padrao (teto de 32 MB) e traduz para o texto ou para ErroDeAplicacao; ao estourar o prazo mata o filho com SIGKILL e lanca extracao_demorou (422); saida do filho invalida ou inicio impossivel vira extracao_falhou; o filho aplica o limite de paginas ao abrir o PDF, antes de extractText; formatos pesados (pdf, docx, html) usam isto na fila, e o restante segue em extrairTexto"
    alternativa_descartada: "worker_threads; extrair no processo do servidor com prazo"
    motivo: "PR-107 (nova); base/extracao-isolada.md (Dockerfile:55-62 leva src/ e o tsx; scripts/*.ts ja rodam por tsx; Promise.race nao interrompe CPU)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "o limite de paginas e conferido pelo filho com getDocumentProxy().numPages antes de extractText (abrir le so o indice do PDF); o teste usa um PDF sintetico de 501 paginas e exige pdf_paginas_demais, e um 'trabalhador' substituto que trava (`while(true){}`) injetado por `comando` prova o encerramento no prazo e a fonte virando erro; se, tentando de verdade, o filho nao funcionar no build do Next ou no contêiner, a PEND-27 vira decisao_humana com a evidencia (verificado no build da F6)"
    alternativa_descartada: "contar paginas por expressao regular nos bytes"
    motivo: "PR-107; base/extracao-isolada.md (pdf.ts:20-28); briefing item 3 (registrar o motivo se inviavel)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "a fila usa o isolamento por padrao: o default de `extrair` em fontes-fila.ts passa a ser extrairParaFila, que escolhe extrairTextoIsolado para pdf, docx e html e extrairTexto para o resto; a opcao `extrair` injetavel continua, e os testes existentes que injetam extrator nao mudam"
    alternativa_descartada: "trocar extrairTexto por dentro"
    motivo: "PR-107; fontes-fila.ts:31,83 (extrair injetavel); CONVENCOES (dependencias injetaveis)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "novo modulo src/lib/trava-do-servidor.ts (sem next/*): caminhoDaTrava(dir), iniciarBatimento({diretorio, relogio, intervaloMs=10000, host, pid}) que grava `.servidor.lock` de forma atomica (temporario e renomeacao) a cada intervalo e devolve {parar}, lerTrava, avaliarTrava(trava, agora, limiteMs=30000) com viva|velha|ausente e removerTrava que so remove a trava propria (mesmo pid e host); register() em instrumentation.ts inicia o batimento no diretorio do banco (dirname de ambiente.bancoArquivo), desligarComCalma o para e remove a trava, e um listener `exit` a remove de forma sincrona"
    alternativa_descartada: "usar o mtime do arquivo; porta TCP; consultar so /api/saude"
    motivo: "PR-108 (nova); base/restauracao-trava.md (instrumentation.ts:45-47,91-103; lacuna: a visibilidade do mtime em volume compartilhado e NAO DOCUMENTADA, por isso o horario vai no conteudo)"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "scripts/restore.ts chama conferirTravaParaRestaurar({diretorio, agora, forcar}) antes da recusa por /api/saude: batimento mais novo que 30 s recusa (mensagem com o pid, o host e a idade, e a dica de parar o servidor ou usar --forcar), com --forcar so avisa, trava velha e ignorada com um aviso e a trava ausente e silenciosa; relogio e diretorio injetaveis; a recusa por /api/saude continua; o README (secao Operacao e backup) e a lacuna 37 sao atualizados"
    alternativa_descartada: "trocar a recusa HTTP pela trava"
    motivo: "PR-108; PR-98; scripts/restore.ts:63-74; base/restauracao-trava.md"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "a trava nao pode vazar dos testes: tests/apoio/servidor.ts e os testes que chamam register() removem `.servidor.lock` do diretorio do banco de teste ao fim, o .gitignore ignora `.servidor.lock`, e um teste prova que o servidor de producao cria a trava, que SIGTERM a remove e que a restauracao de ponta a ponta com uma trava fresca simulada (outro host) e recusada e com --forcar segue"
    alternativa_descartada: "deixar a trava nos testes"
    motivo: "PR-108; briefing item 4 (a restauracao dos testes nao deixa trava para tras); tests/restauracao-comando.test.ts e tests/apoio/servidor.ts"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "`withCorrelacao` para as rotas de fontes: src/lib/log.ts exporta CABECALHO_DE_CORRELACAO ('X-Correlacao'); o proxy e o novo helper comCorrelacaoNaRota(handler) em src/app/api/agentes/[id]/fontes/resposta.ts usam a mesma constante; o helper usa o x-correlacao da requisicao quando valido e senao gera um codigo novo, roda o handler dentro de comCorrelacao (log.ts:30) para que o codigo do erro e o do cabecalho sejam o mesmo, e poe o X-Correlacao em toda resposta (sucesso, erro, 401, 413, 415); correlacaoDaRequisicao passa a consultar correlacaoAtual() antes de gerar codigo novo"
    alternativa_descartada: "gerar o codigo no helper sem ligar ao log; incluir as rotas no matcher"
    motivo: "PR-109 (nova); PR-93; base/correlacao-nos-uploads.md (proxy.ts:50-56; resposta-de-erro.ts:10-18; correlacao-servidor.ts:15-24)"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "os cinco arquivos de rota de fontes (fontes, [fonteId], [fonteId]/reprocessar, texto, video, youtube) exportam os handlers embrulhados por comCorrelacaoNaRota; o teste de rota (servidor de producao) confere `X-Correlacao` com 8 hexadecimais no sucesso e no erro de documento, de video, de YouTube e de texto, e que o codigo do corpo `Código de referência` do erro 500 simulado e o do cabecalho"
    alternativa_descartada: "so as tres rotas de upload"
    motivo: "PR-109; briefing item 5 (documento, video e YouTube); a lista de handlers e todas as rotas sob o matcher excluido"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "a premissa PR-93 ganha o texto da excecao: o proxy cobre toda rota menos `_next/static`, `_next/image`, `favicon.ico` e `api/agentes/<id>/fontes...`, e estas se cobrem sozinhas (PR-109); e o comentario do proxy.ts e atualizado"
    alternativa_descartada: "deixar a PR-93 sem a excecao"
    motivo: "PR-109; briefing item 5 (atualizar PR-93 se a excecao precisar constar)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "padrao de canal: src/componentes/padrao-de-canal.ts exporta PADROES_DE_CANAL = {painel:'diagonal', widget:'pontos', telegram:'horizontal'} e padraoDoCanal(canal) (canal desconhecido: 'liso'); BadgeDeCanal acrescenta a classe `badge-de-canal-padrao-<padrao>` e o CSS desenha o padrao com repeating-linear-gradient e radial-gradient so com var(--canal-*-borda) (nenhum valor de cor literal); o teste cobre o mapeamento (tres padroes distintos), que cada padrao existe no CSS, a ausencia de cor literal nas regras e o contraste do texto continua o de tokens.test"
    alternativa_descartada: "icone distinto; cor nova"
    motivo: "PR-110 (nova); PR-85; PR-23; base/interface-canal-exclusao-tema.md (global.css:1466-1479; tests/tokens-historico.test.ts:55-76 ja confere contraste)"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "o grafico do painel nao separa canais (uma serie de mensagens por dia, GraficoDeMensagens.tsx:22-86) e nao muda; a PR-110 registra que quando separar usara padraoDoCanal"
    alternativa_descartada: "inventar uma serie por canal nesta feature"
    motivo: "PR-110; base/00-LACUNAS.md (canal-e-badge); briefing item 6 (`quando ele separar canais`)"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "aviso de exclusao do agente: o servico agentes ganha contagensParaExclusao(usuario, id) com {conversas, mensagens, fontes, arquivos, telegram, chatEmbutido}; a pagina do agente (servidor) o chama e passa `impacto` ao BotaoExcluirAgente; a funcao pura descreverImpactoDaExclusao em src/componentes/excluir-agente-logica.ts monta o texto `Também serão apagados: N conversas e M mensagens, as K fontes e os arquivos enviados, o canal Telegram e a configuração do chat embutido. Isso não pode ser desfeito.`; sem `impacto` o botao mostra o mesmo aviso sem numeros"
    alternativa_descartada: "so trocar o texto fixo"
    motivo: "PR-44 (realiza: a tela de exclusao avisa); base/interface-canal-exclusao-tema.md; CONVENCOES (src/app so chama src/servicos)"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "alternador de tema: src/lib/tema.ts exporta CHAVE_DO_TEMA='tema', SCRIPT_DO_TEMA (o mesmo script de hoje) e funcoes puras temaInicial/alternarTema; layout.tsx importa o script; AlternadorDeTema passa a expor aria-pressed (true no escuro) atualizado depois da montagem, sem mudar o HTML do servidor, e continua com aria-label e title; o teste com happy-dom cobre alternar, persistir em localStorage (e seguir sem ele quando setItem lanca), a preferencia do sistema na primeira visita, o script anti-flash executado num documento simulado e data-theme/aria-pressed"
    alternativa_descartada: "testar so a funcao pura"
    motivo: "PR-23; base/interface-canal-exclusao-tema.md (AlternadorDeTema.tsx:11-35; layout.tsx:17); briefing item 8"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "trava de rede: tests/apoio/trava-de-rede.ts exporta HOSTS_PERMITIDOS (lista vazia e comentada), ehLoopback(host) e instalarTravaDeRede(), que troca net.Socket.prototype.connect (cobre http, https, net, tls e o fetch do Node) e globalThis.fetch para recusar host que nao seja localhost, 127.0.0.0/8, ::1 ou socket de dominio Unix, com a mensagem `Rede real bloqueada nos testes (PR-26): tentativa de conexão com <host>. Use um servidor simulado local.`; tests/setup.ts a instala; o teste prova o bloqueio por fetch, http.get, net.connect e que um servidor em loopback responde"
    alternativa_descartada: "so trocar fetch"
    motivo: "PR-112 (nova); PR-26; base/testes-rede-e-instabilidade.md"
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: "auditoria que nao sobe calada: auditoria-ouvintes.ts exporta auditoriaLigada() (le a ligacao de globalThis) e registrarFalhaDaAuditoria()/falhaDaAuditoria(); register() em instrumentation.ts, se ligarAuditoria lancar, registra a falha, loga auditoria_nao_ligou (so o nome do erro) e, quando ambiente.auditoriaExigida (NODE_ENV production, lido so em ambiente.ts) e verdadeiro, relanca com `A trilha de auditoria não pôde ser ligada e o servidor não sobe sem ela.`; fora de producao segue"
    alternativa_descartada: "variavel de opt-out; falhar sempre"
    motivo: "PR-111 (nova); PR-19; PR-94 (falha de configuracao ja derruba o start em producao, instrumentation.ts:16-23); base/auditoria-e-saude.md"
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: "saude e tela Sistema: verificarSaude ganha o item `auditoria` (NomeDoItemDeSaude), ok com `A trilha de auditoria está ligada.` e degradado quando falhaDaAuditoria() e verdadeiro (`A trilha de auditoria não foi ligada: ações críticas não estão sendo registradas.`); sem falha registrada e sem ligacao (testes que nao rodam a instrumentacao) o item e ok com `A trilha de auditoria ainda não foi iniciada.`; DadosDoSistema ganha auditoria:{ativa} e o PainelDoSistema mostra `Trilha de auditoria: ativa` ou `inativa`; README e validacao de ambiente (a regra auditoriaExigida em ambiente.ts) sao atualizados"
    alternativa_descartada: "degradar quando nao esta ligada em qualquer situacao (quebraria os testes de saude)"
    motivo: "PR-111; base/auditoria-e-saude.md (saude.ts:15,111-133; sistema.ts:19-38; sistema-logica.ts:50-55)"
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: "teste instavel: tests/embed-pagina.test.ts passa a proibir o limite com borda de palavra (/\\b4321\\b/) no HTML, que um codigo de referencia de 8 hexadecimais nunca produz, e um caso proprio injeta HTML com `ab4321cd` para provar que o codigo aleatorio nao dispara a regra e que `limiteDiario: 4321` solto dispara; o arquivo roda 30 vezes seguidas sozinho e o resultado vai ao ENTREGA.md"
    alternativa_descartada: "trocar o limite por outro numero"
    motivo: "PEND-30; lacuna 50 de docs/stack/LACUNAS.md; base/testes-rede-e-instabilidade.md (risco 5)"
    status: fechada
    bloqueante: false
  - id: D-24
    decisao: "premissas e documentos: PR-105 a PR-112 ja gravadas (Origem recursao, Etapa b5); ao fechar, LACUNAS (13 resolvida, 37 resolvida, 44 e 50 atualizadas, novas da FT-13) e CONVENCOES ganham as regras novas com arquivo:linha, e RECURSAO move PEND-18 a PEND-27 (as resolvidas) e PEND-30 para Resolvido nos ciclos (ciclo 2, FT-13) com os contadores ajustados; o MAPA fecha a FT-13"
    alternativa_descartada: "deixar as lacunas abertas"
    motivo: "PR-105 a PR-112; briefing item 12; docs/projeto/RECURSAO.md"
    status: fechada
    bloqueante: false
  - id: D-25
    decisao: "verificacao no navegador: Chrome proprio (user-data-dir temporario, porta de depuracao livre, alvo confirmado), servidor de producao local com segredos inline e OpenRouter falso; sobe documento e video com trecho mudo, mostra a badge de canal e o alternador de tema nos dois temas a 375 px e a tela Sistema com a auditoria; verifica o contêiner de novo so se Dockerfile ou entrypoint mudarem (nao devem mudar); o que nao puder ser visto fica em VERIFICACAO-VISUAL.md"
    alternativa_descartada: "reaproveitar um Chrome aberto"
    motivo: "buildx B4 secao 5 (incidente da FT-10); D-20 da FT-12; briefing item 13"
    status: fechada
    bloqueante: false
  - id: D-26
    decisao: "o helper comCorrelacaoNaRota SEMPRE gera um código novo para a requisição (nunca confia no x-correlacao enviado pelo cliente, que nas rotas fora do proxy vem direto de fora), roda o handler dentro de comCorrelacao e correlacaoDaRequisicao consulta correlacaoAtual() antes do cabeçalho; são seis arquivos de rota (fontes, [fonteId], [fonteId]/reprocessar, texto, video, youtube); a constante CABECALHO_DE_CORRELACAO é acrescentada no fim de src/lib/log.ts para não deslocar citações"
    alternativa_descartada: "confiar no cabeçalho de requisição quando válido (D-13 original)"
    motivo: "PR-109; PR-93 (o valor que o cliente mandar é ignorado); auditoria da F5, achado MÉDIA; emenda à D-13 e à D-14"
    status: fechada
    bloqueante: false
  - id: D-27
    decisao: "a trava de rede e instalada por tests/setup-rede.ts, acrescentado ao setupFiles do vitest.config.ts na mesma linha (as citações vitest.config.ts:7 e vizinhas não deslocam), e não por tests/setup.ts; a limpeza global de .servidor.lock vem de tests/setup-trava.ts, também no setupFiles; instalarTravaDeRede e idempotente e trata as formas connect(porta, host), connect(caminho) e connect([opcoes])"
    alternativa_descartada: "editar tests/setup.ts (desloca as citações tests/setup.ts:23-24)"
    motivo: "PR-112; PR-108; auditoria da F5; emenda à D-20 e à D-12; CONVENCOES (citações arquivo:linha conferidas por tests/projeto.test.ts)"
    status: fechada
    bloqueante: false
  - id: D-28
    decisao: "a extração isolada tem uma constante EXTRACAO_ISOLADA_ATIVA em src/lib/extracao/isolada.ts (true por padrão); OpcoesDaFila ganha extrairIsolado (padrão extrairTextoIsolado) para testes espionarem e injetarem prazo e comando; se a T-03.05 provar que o filho não funciona sob o build ou no contêiner, a constante vira false, a fila volta a extrairTexto, a PEND-27 vira decisao_humana e a T-04.01 não depende disso (depende da T-03.04)"
    alternativa_descartada: "falhar a feature inteira se o filho for inviável"
    motivo: "PR-107; D-07 a D-09; auditoria da F5 (desfecho executável do ramo inviável)"
    status: fechada
    bloqueante: false
  - id: D-29
    decisao: "o bloco de fechamento da FT-12 de tests/projeto.test.ts (que fixa em_andamento 0, entregues 12 e pendencias_resolvidas 6) é relaxado na T-01.01 para um estado histórico estável (linha da FT-12 entregue, entregues maior ou igual a 12) e a T-06.03 acrescenta as asserções da FT-13; o MAPA em_andamento 1 já derrubou a suíte antes de qualquer task"
    alternativa_descartada: "manter o placar fixo e deixar a suíte vermelha até o fim"
    motivo: "auditoria da F5, achado ALTA; FECHAMENTO da FT-12 (o teste da FT-11 foi relaxado do mesmo modo)"
    status: fechada
    bloqueante: false
---

# Decisões — robustez-de-midia-e-operacao

> Respondidas pelo buildx (`respondido_por: buildx`) pelos quatro degraus: PROJETO.md, PREMISSAS.md, CONVENCOES.md e, sem resposta nos três, premissa nova. As premissas PR-105 a PR-112 foram criadas antes de responder (degrau 4). Nenhuma regra de negócio nova foi decidida: tudo é como o sistema se protege ou como falha com clareza. Desvio do briefing declarado em D-05: o teto do upload continua o da PR-45 (`MAX_UPLOAD_MB` x 10 + 1 MB), não `MAX_UPLOAD_MB` + folga, porque o envio aceita até 10 arquivos.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (nenhuma pergunta ao usuário; o buildx responde)

## Eixos

1. Escopo de negócio: D-00, D-17, D-24 (treze itens do briefing; PEND-11, PEND-31 e PEND-09 fora).
2. Arquitetura: D-05, D-07, D-09, D-10, D-13, D-16, D-19, D-20.
3. Contrato de dados: D-01, D-02, D-10 (a trava é arquivo, sem migration; nenhuma tabela nova).
4. Estado e observabilidade: D-13, D-14 (correlação), D-21, D-22 (auditoria, saúde e tela Sistema).
5. Resiliência e política de erro: D-01, D-02, D-05, D-07, D-08, D-11, D-21 (falha fechada em produção).
6. Ambiente e segredos: D-21 (`auditoriaExigida` lido só em `ambiente.ts`), D-10 (`.servidor.lock` no diretório do banco); nenhuma variável nova.
7. Definição de pronto: D-04, D-06, D-08, D-12, D-14, D-18, D-19, D-20, D-23, D-25 (cada correção com teste que falha sem ela, registrado em MUTACOES.md e ENTREGA.md).

## Decisões

```
D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PROJETO.md (modo autonomo total) e briefing da FT-13 (escopo fechado em 13 itens)
D-01 | o segmento sem fala e gravado como o texto `[sem fala]` (constante MARCADOR_SEM_FALA em src/servicos/transcricao-marcadores.ts) por transcreverMidia quando o modelo devolve vazio: transcricao_vazia ganha UMA repeticao propria (a primeira vazia repete, a segunda vira sem fala) e as demais falhas transitorias seguem com as 2 repeticoes de hoje; juntarPartes escreve `[MM:SS] [sem fala]` para esse segmento e continua ignorando parte vazia de verdade | falhar a fonte depois das repeticoes; nao repetir o vazio nunca | PR-105 (nova); base/midia-sem-fala.md (transcricao-de-midia.ts:62,138; tests/transcricao-de-midia.test.ts:155 exige repeticao do vazio seguida de fala)
D-02 | a fonte de video falha so se NENHUM segmento tiver fala: transcreverMidia conta os segmentos com fala (texto nao vazio e diferente do marcador) e, com zero, lanca `Não encontrei fala neste áudio.` (422, transcricao_vazia); a mensagem que a fila ja tinha para texto vazio passa a ser a mesma | manter `Não encontrei fala neste arquivo para transcrever.` | PR-105; briefing item 1 (mensagem pedida); base/midia-sem-fala.md (fontes-fila.ts:168-171)
D-03 | o marcador nao polui a busca: depois de dividirEmTrechos a fila descarta o trecho cujo texto, tirados os marcadores de tempo e `[sem fala]`, fica vazio (funcao pura trechoSoDeMarcadores em src/servicos/transcricao-marcadores.ts); o trecho que mistura fala e marcador e indexado como esta, o que e inofensivo; se todos os trechos forem descartados a fonte ja falhou pela D-02 | indexar tudo; remover o marcador do texto armazenado | PR-105; base/midia-sem-fala.md (riscos 2 e 3); CONVENCOES secao 3 (funcao pura testavel)
D-04 | o OpenRouter falso ganha `silencios` (indices de parte que respondem texto vazio) e o teste de ponta a ponta gera com o ffmpeg um audio de 25 s com 5 s de fala sintetica, 10 s de silencio e 10 s de ruido, com partes de 10 s por segundosPorParte, para provar fonte pronta com `[sem fala]`, busca que acha a fala, retomada sem repagar o segmento ja gravado e fonte em erro quando tudo e mudo | so mock da dependencia do ffmpeg | PR-105; CONVENCOES (OpenRouter falso em tests/apoio, ffmpeg real no tests/fontes-video-fim-a-fim.test.ts:67); briefing item 1
D-05 | novo modulo src/lib/corpo-limitado.ts (sem next/*): lerCorpoLimitado(corpo, teto) le o ReadableStream contando bytes, cancela a leitura e lanca CorpoGrandeDemais ao passar do teto, e devolve o buffer; a rota POST de fontes usa o mesmo tetoDoCorpo() (MAX_UPLOAD_MB x 10 + 1 MB), recusa por Content-Length declarado como hoje, le o corpo com lerCorpoLimitado e entrega o buffer a `new Response(buffer, {headers: {content-type}}).formData()` para o parse do multipart; 413 com o mesmo erroDeTamanho | contar so no formData; teto igual a MAX_UPLOAD_MB mais folga (quebraria o envio de varios arquivos de PR-45) | PR-106 (nova); PR-45 (teto de MAX_UPLOAD_MB x 10 + 1 MB); base/upload-e-teto.md; o briefing diz MAX_UPLOAD_MB + folga, mas PR-45 e os testes de upload existentes exigem ate 10 arquivos: o teto continua o da PR-45 (desvio declarado)
D-06 | a prova do teto e em dois niveis: unidade (um stream que conta quantos bytes foram puxados para provar que a leitura para logo depois do teto) e rota contra `next start` com MAX_UPLOAD_MB=1 e um corpo `chunked` sem Content-Length maior que o teto, mais o limite de bytes que o cliente conseguiu enviar antes do 413 | so o teste de rota | PR-106; base/upload-e-teto.md (risco 3); tests/video-rota.test.ts (padrao de servidor com limite pequeno)
D-07 | novo modulo src/lib/extracao/isolada.ts: extrairTextoIsolado(entrada, {prazoMs, maxPaginas, comando}) cria o processo filho `node --import tsx src/lib/extracao/trabalhador.ts <formato>` (spawn sem shell, `--max-old-space-size=1024`), escreve os bytes na entrada padrao, le uma linha JSON da saida padrao (teto de 32 MB) e traduz para o texto ou para ErroDeAplicacao; ao estourar o prazo mata o filho com SIGKILL e lanca extracao_demorou (422); saida do filho invalida ou inicio impossivel vira extracao_falhou; o filho aplica o limite de paginas ao abrir o PDF, antes de extractText; formatos pesados (pdf, docx, html) usam isto na fila, e o restante segue em extrairTexto | worker_threads; extrair no processo do servidor com prazo | PR-107 (nova); base/extracao-isolada.md (Dockerfile:55-62 leva src/ e o tsx; scripts/*.ts ja rodam por tsx; Promise.race nao interrompe CPU)
D-08 | o limite de paginas e conferido pelo filho com getDocumentProxy().numPages antes de extractText (abrir le so o indice do PDF); o teste usa um PDF sintetico de 501 paginas e exige pdf_paginas_demais, e um 'trabalhador' substituto que trava (`while(true){}`) injetado por `comando` prova o encerramento no prazo e a fonte virando erro; se, tentando de verdade, o filho nao funcionar no build do Next ou no contêiner, a PEND-27 vira decisao_humana com a evidencia (verificado no build da F6) | contar paginas por expressao regular nos bytes | PR-107; base/extracao-isolada.md (pdf.ts:20-28); briefing item 3 (registrar o motivo se inviavel)
D-09 | a fila usa o isolamento por padrao: o default de `extrair` em fontes-fila.ts passa a ser extrairParaFila, que escolhe extrairTextoIsolado para pdf, docx e html e extrairTexto para o resto; a opcao `extrair` injetavel continua, e os testes existentes que injetam extrator nao mudam | trocar extrairTexto por dentro | PR-107; fontes-fila.ts:31,83 (extrair injetavel); CONVENCOES (dependencias injetaveis)
D-10 | novo modulo src/lib/trava-do-servidor.ts (sem next/*): caminhoDaTrava(dir), iniciarBatimento({diretorio, relogio, intervaloMs=10000, host, pid}) que grava `.servidor.lock` de forma atomica (temporario e renomeacao) a cada intervalo e devolve {parar}, lerTrava, avaliarTrava(trava, agora, limiteMs=30000) com viva|velha|ausente e removerTrava que so remove a trava propria (mesmo pid e host); register() em instrumentation.ts inicia o batimento no diretorio do banco (dirname de ambiente.bancoArquivo), desligarComCalma o para e remove a trava, e um listener `exit` a remove de forma sincrona | usar o mtime do arquivo; porta TCP; consultar so /api/saude | PR-108 (nova); base/restauracao-trava.md (instrumentation.ts:45-47,91-103; lacuna: a visibilidade do mtime em volume compartilhado e NAO DOCUMENTADA, por isso o horario vai no conteudo)
D-11 | scripts/restore.ts chama conferirTravaParaRestaurar({diretorio, agora, forcar}) antes da recusa por /api/saude: batimento mais novo que 30 s recusa (mensagem com o pid, o host e a idade, e a dica de parar o servidor ou usar --forcar), com --forcar so avisa, trava velha e ignorada com um aviso e a trava ausente e silenciosa; relogio e diretorio injetaveis; a recusa por /api/saude continua; o README (secao Operacao e backup) e a lacuna 37 sao atualizados | trocar a recusa HTTP pela trava | PR-108; PR-98; scripts/restore.ts:63-74; base/restauracao-trava.md
D-12 | a trava nao pode vazar dos testes: tests/apoio/servidor.ts e os testes que chamam register() removem `.servidor.lock` do diretorio do banco de teste ao fim, o .gitignore ignora `.servidor.lock`, e um teste prova que o servidor de producao cria a trava, que SIGTERM a remove e que a restauracao de ponta a ponta com uma trava fresca simulada (outro host) e recusada e com --forcar segue | deixar a trava nos testes | PR-108; briefing item 4 (a restauracao dos testes nao deixa trava para tras); tests/restauracao-comando.test.ts e tests/apoio/servidor.ts
D-13 | `withCorrelacao` para as rotas de fontes: src/lib/log.ts exporta CABECALHO_DE_CORRELACAO ('X-Correlacao'); o proxy e o novo helper comCorrelacaoNaRota(handler) em src/app/api/agentes/[id]/fontes/resposta.ts usam a mesma constante; o helper usa o x-correlacao da requisicao quando valido e senao gera um codigo novo, roda o handler dentro de comCorrelacao (log.ts:30) para que o codigo do erro e o do cabecalho sejam o mesmo, e poe o X-Correlacao em toda resposta (sucesso, erro, 401, 413, 415); correlacaoDaRequisicao passa a consultar correlacaoAtual() antes de gerar codigo novo | gerar o codigo no helper sem ligar ao log; incluir as rotas no matcher | PR-109 (nova); PR-93; base/correlacao-nos-uploads.md (proxy.ts:50-56; resposta-de-erro.ts:10-18; correlacao-servidor.ts:15-24)
D-14 | os cinco arquivos de rota de fontes (fontes, [fonteId], [fonteId]/reprocessar, texto, video, youtube) exportam os handlers embrulhados por comCorrelacaoNaRota; o teste de rota (servidor de producao) confere `X-Correlacao` com 8 hexadecimais no sucesso e no erro de documento, de video, de YouTube e de texto, e que o codigo do corpo `Código de referência` do erro 500 simulado e o do cabecalho | so as tres rotas de upload | PR-109; briefing item 5 (documento, video e YouTube); a lista de handlers e todas as rotas sob o matcher excluido
D-15 | a premissa PR-93 ganha o texto da excecao: o proxy cobre toda rota menos `_next/static`, `_next/image`, `favicon.ico` e `api/agentes/<id>/fontes...`, e estas se cobrem sozinhas (PR-109); e o comentario do proxy.ts e atualizado | deixar a PR-93 sem a excecao | PR-109; briefing item 5 (atualizar PR-93 se a excecao precisar constar)
D-16 | padrao de canal: src/componentes/padrao-de-canal.ts exporta PADROES_DE_CANAL = {painel:'diagonal', widget:'pontos', telegram:'horizontal'} e padraoDoCanal(canal) (canal desconhecido: 'liso'); BadgeDeCanal acrescenta a classe `badge-de-canal-padrao-<padrao>` e o CSS desenha o padrao com repeating-linear-gradient e radial-gradient so com var(--canal-*-borda) (nenhum valor de cor literal); o teste cobre o mapeamento (tres padroes distintos), que cada padrao existe no CSS, a ausencia de cor literal nas regras e o contraste do texto continua o de tokens.test | icone distinto; cor nova | PR-110 (nova); PR-85; PR-23; base/interface-canal-exclusao-tema.md (global.css:1466-1479; tests/tokens-historico.test.ts:55-76 ja confere contraste)
D-17 | o grafico do painel nao separa canais (uma serie de mensagens por dia, GraficoDeMensagens.tsx:22-86) e nao muda; a PR-110 registra que quando separar usara padraoDoCanal | inventar uma serie por canal nesta feature | PR-110; base/00-LACUNAS.md (canal-e-badge); briefing item 6 (`quando ele separar canais`)
D-18 | aviso de exclusao do agente: o servico agentes ganha contagensParaExclusao(usuario, id) com {conversas, mensagens, fontes, arquivos, telegram, chatEmbutido}; a pagina do agente (servidor) o chama e passa `impacto` ao BotaoExcluirAgente; a funcao pura descreverImpactoDaExclusao em src/componentes/excluir-agente-logica.ts monta o texto `Também serão apagados: N conversas e M mensagens, as K fontes e os arquivos enviados, o canal Telegram e a configuração do chat embutido. Isso não pode ser desfeito.`; sem `impacto` o botao mostra o mesmo aviso sem numeros | so trocar o texto fixo | PR-44 (realiza: a tela de exclusao avisa); base/interface-canal-exclusao-tema.md; CONVENCOES (src/app so chama src/servicos)
D-19 | alternador de tema: src/lib/tema.ts exporta CHAVE_DO_TEMA='tema', SCRIPT_DO_TEMA (o mesmo script de hoje) e funcoes puras temaInicial/alternarTema; layout.tsx importa o script; AlternadorDeTema passa a expor aria-pressed (true no escuro) atualizado depois da montagem, sem mudar o HTML do servidor, e continua com aria-label e title; o teste com happy-dom cobre alternar, persistir em localStorage (e seguir sem ele quando setItem lanca), a preferencia do sistema na primeira visita, o script anti-flash executado num documento simulado e data-theme/aria-pressed | testar so a funcao pura | PR-23; base/interface-canal-exclusao-tema.md (AlternadorDeTema.tsx:11-35; layout.tsx:17); briefing item 8
D-20 | trava de rede: tests/apoio/trava-de-rede.ts exporta HOSTS_PERMITIDOS (lista vazia e comentada), ehLoopback(host) e instalarTravaDeRede(), que troca net.Socket.prototype.connect (cobre http, https, net, tls e o fetch do Node) e globalThis.fetch para recusar host que nao seja localhost, 127.0.0.0/8, ::1 ou socket de dominio Unix, com a mensagem `Rede real bloqueada nos testes (PR-26): tentativa de conexão com <host>. Use um servidor simulado local.`; tests/setup.ts a instala; o teste prova o bloqueio por fetch, http.get, net.connect e que um servidor em loopback responde | so trocar fetch | PR-112 (nova); PR-26; base/testes-rede-e-instabilidade.md
D-21 | auditoria que nao sobe calada: auditoria-ouvintes.ts exporta auditoriaLigada() (le a ligacao de globalThis) e registrarFalhaDaAuditoria()/falhaDaAuditoria(); register() em instrumentation.ts, se ligarAuditoria lancar, registra a falha, loga auditoria_nao_ligou (so o nome do erro) e, quando ambiente.auditoriaExigida (NODE_ENV production, lido so em ambiente.ts) e verdadeiro, relanca com `A trilha de auditoria não pôde ser ligada e o servidor não sobe sem ela.`; fora de producao segue | variavel de opt-out; falhar sempre | PR-111 (nova); PR-19; PR-94 (falha de configuracao ja derruba o start em producao, instrumentation.ts:16-23); base/auditoria-e-saude.md
D-22 | saude e tela Sistema: verificarSaude ganha o item `auditoria` (NomeDoItemDeSaude), ok com `A trilha de auditoria está ligada.` e degradado quando falhaDaAuditoria() e verdadeiro (`A trilha de auditoria não foi ligada: ações críticas não estão sendo registradas.`); sem falha registrada e sem ligacao (testes que nao rodam a instrumentacao) o item e ok com `A trilha de auditoria ainda não foi iniciada.`; DadosDoSistema ganha auditoria:{ativa} e o PainelDoSistema mostra `Trilha de auditoria: ativa` ou `inativa`; README e validacao de ambiente (a regra auditoriaExigida em ambiente.ts) sao atualizados | degradar quando nao esta ligada em qualquer situacao (quebraria os testes de saude) | PR-111; base/auditoria-e-saude.md (saude.ts:15,111-133; sistema.ts:19-38; sistema-logica.ts:50-55)
D-23 | teste instavel: tests/embed-pagina.test.ts passa a proibir o limite com borda de palavra (/\b4321\b/) no HTML, que um codigo de referencia de 8 hexadecimais nunca produz, e um caso proprio injeta HTML com `ab4321cd` para provar que o codigo aleatorio nao dispara a regra e que `limiteDiario: 4321` solto dispara; o arquivo roda 30 vezes seguidas sozinho e o resultado vai ao ENTREGA.md | trocar o limite por outro numero | PEND-30; lacuna 50 de docs/stack/LACUNAS.md; base/testes-rede-e-instabilidade.md (risco 5)
D-24 | premissas e documentos: PR-105 a PR-112 ja gravadas (Origem recursao, Etapa b5); ao fechar, LACUNAS (13 resolvida, 37 resolvida, 44 e 50 atualizadas, novas da FT-13) e CONVENCOES ganham as regras novas com arquivo:linha, e RECURSAO move PEND-18 a PEND-27 (as resolvidas) e PEND-30 para Resolvido nos ciclos (ciclo 2, FT-13) com os contadores ajustados; o MAPA fecha a FT-13 | deixar as lacunas abertas | PR-105 a PR-112; briefing item 12; docs/projeto/RECURSAO.md
D-25 | verificacao no navegador: Chrome proprio (user-data-dir temporario, porta de depuracao livre, alvo confirmado), servidor de producao local com segredos inline e OpenRouter falso; sobe documento e video com trecho mudo, mostra a badge de canal e o alternador de tema nos dois temas a 375 px e a tela Sistema com a auditoria; verifica o contêiner de novo so se Dockerfile ou entrypoint mudarem (nao devem mudar); o que nao puder ser visto fica em VERIFICACAO-VISUAL.md | reaproveitar um Chrome aberto | buildx B4 secao 5 (incidente da FT-10); D-20 da FT-12; briefing item 13
D-26 | o helper comCorrelacaoNaRota SEMPRE gera um código novo para a requisição (nunca confia no x-correlacao enviado pelo cliente, que nas rotas fora do proxy vem direto de fora), roda o handler dentro de comCorrelacao e correlacaoDaRequisicao consulta correlacaoAtual() antes do cabeçalho; são seis arquivos de rota (fontes, [fonteId], [fonteId]/reprocessar, texto, video, youtube); a constante CABECALHO_DE_CORRELACAO é acrescentada no fim de src/lib/log.ts para não deslocar citações | confiar no cabeçalho de requisição quando válido (D-13 original) | PR-109; PR-93 (o valor que o cliente mandar é ignorado); auditoria da F5, achado MÉDIA; emenda à D-13 e à D-14
D-27 | a trava de rede e instalada por tests/setup-rede.ts, acrescentado ao setupFiles do vitest.config.ts na mesma linha (as citações vitest.config.ts:7 e vizinhas não deslocam), e não por tests/setup.ts; a limpeza global de .servidor.lock vem de tests/setup-trava.ts, também no setupFiles; instalarTravaDeRede e idempotente e trata as formas connect(porta, host), connect(caminho) e connect([opcoes]) | editar tests/setup.ts (desloca as citações tests/setup.ts:23-24) | PR-112; PR-108; auditoria da F5; emenda à D-20 e à D-12; CONVENCOES (citações arquivo:linha conferidas por tests/projeto.test.ts)
D-28 | a extração isolada tem uma constante EXTRACAO_ISOLADA_ATIVA em src/lib/extracao/isolada.ts (true por padrão); OpcoesDaFila ganha extrairIsolado (padrão extrairTextoIsolado) para testes espionarem e injetarem prazo e comando; se a T-03.05 provar que o filho não funciona sob o build ou no contêiner, a constante vira false, a fila volta a extrairTexto, a PEND-27 vira decisao_humana e a T-04.01 não depende disso (depende da T-03.04) | falhar a feature inteira se o filho for inviável | PR-107; D-07 a D-09; auditoria da F5 (desfecho executável do ramo inviável)
D-29 | o bloco de fechamento da FT-12 de tests/projeto.test.ts (que fixa em_andamento 0, entregues 12 e pendencias_resolvidas 6) é relaxado na T-01.01 para um estado histórico estável (linha da FT-12 entregue, entregues maior ou igual a 12) e a T-06.03 acrescenta as asserções da FT-13; o MAPA em_andamento 1 já derrubou a suíte antes de qualquer task | manter o placar fixo e deixar a suíte vermelha até o fim | auditoria da F5, achado ALTA; FECHAMENTO da FT-12 (o teste da FT-11 foi relaxado do mesmo modo)
```

## Hipóteses assumidas por pesquisa (resumo)

Tudo acima cita PR, convenção ou base. Escolhas sem regra de negócio e reversíveis, vistas como hipóteses: D-01 (uma repetição para o vazio), D-07 e D-08 (processo filho com `tsx`, sem volta silenciosa; se inviável, PEND-27 vira `decisao_humana`), D-10 (batimento de 10 s e limite de 30 s do briefing), D-16 (padrões diagonal, pontos e horizontal). Nenhuma exige o usuário.

## Pendências

Nenhuma pendência.
