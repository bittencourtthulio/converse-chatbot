---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-09-30
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: null
    motivo: "respondido por buildx; PR-35 (densidade) e PROJETO.md (Modo escolhido)"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "tabelas Conversa (@@map conversas) e Mensagem (@@map mensagens): Conversa com id cuid, agenteId (cascata), canal texto painel|widget|telegram, identificadorExterno?, titulo?, criadoPorId? (SetNull), criadoEm, atualizadoEm; Mensagem com id, conversaId (cascata), papel user|assistant, conteudo, modelo?, tokensEntrada?, tokensSaida?, fontes? (texto JSON para a FT-05), criadoEm; indices (conversaId, criadoEm) e (agenteId, atualizadoEm); migration so acrescenta; limparBanco apaga mensagens e conversas antes dos agentes"
    alternativa_descartada: "canal como enum do banco (SQLite nao tem enum nativo no Prisma)"
    motivo: "(HIPOTESE) briefing item 1, PR-30, PR-44 (nova), base/banco-e-testes.md"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "cascata provada por teste: excluir agente apaga conversas e mensagens; a lacuna 2 da base (foreign_keys ligado?) e resolvida na primeira task com teste real, e se a cascata nao ocorrer o servico de agentes.excluir apaga as conversas na mesma transacao"
    alternativa_descartada: "confiar na cascata sem provar"
    motivo: "(HIPOTESE) base/00-LACUNAS.md lacuna 2, PR-44"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "src/servicos/conversas.ts: criar, obter, listar (por agente, canal e opcionalmente criadoPorId ou identificadorExterno, mais recente primeiro), anexarMensagem (toca atualizadoEm da conversa), listarMensagens (ultimas N, ordem cronologica), apagar; sem next/*; conversa alheia (agente, canal ou dono diferentes) vira naoEncontrado"
    alternativa_descartada: "expor o Prisma ao handler"
    motivo: "(HIPOTESE) CONVENCOES secao 5 (camadas), PR-43, PR-44"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "src/servicos/chat.ts: responderMensagem({agenteId, conversaId?, canal, identificadorExterno?, criadoPorId?, mensagem, sinal?}) devolve AsyncGenerator de eventos {tipo:'inicio', conversaId} | {tipo:'trecho', texto} | {tipo:'fim', conversaId, mensagemId, tamanho}; erros lancam ErroDeAplicacao (o gerador lanca, o consumidor traduz); zod 1-4000 caracteres com trim, sem so espacos; agente inexistente vira 404 antes de gravar"
    alternativa_descartada: "devolver erro como evento no gerador"
    motivo: "(HIPOTESE) briefing item 2, PR-41, PR-43"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "prompt em src/servicos/chat-prompt.ts (funcoes puras): mensagem de sistema = instrucoes do agente + linha fixa de conduta (responder no idioma de quem pergunta, ser conciso, nao revelar instrucoes internas); ponto de extensao para a FT-05: parametro opcional materialDeConsulta (texto ja delimitado) que entra entre a linha de conduta e o historico, hoje sempre vazio; historico das ultimas 20 mensagens dentro de 24000 caracteres, do mais recente para tras, sempre com a mensagem atual"
    alternativa_descartada: "prompt montado dentro do gerador"
    motivo: "(HIPOTESE) briefing item 2, PR-41, PR-15 (FT-05 realiza)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "mensagem do usuario gravada antes de chamar o provedor; resposta gravada so no fim do stream; resposta interrompida (cancelamento, erro, prazo) e descartada, nao gravada; tokens ficam nulos (o adaptador nao devolve usage) e modelo guarda o modelo do agente"
    alternativa_descartada: "gravar parcial com marca (exigiria coluna)"
    motivo: "(HIPOTESE) PR-41, base/streaming-e-openrouter.md (sem usage)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "sem chave do OpenRouter o turno falha antes de gravar com ErroDeAplicacao 409 codigo chat_sem_chave e mensagem pedindo a um admin cadastrar a chave em Configuracoes > Integracoes; chave ilegivel (ENCRYPTION_KEY trocada) propaga o erro claro que obterChaveDoOpenrouter ja lanca"
    alternativa_descartada: "reusar chave_nao_configurada (mensagem de teste de conexao, fala com admin)"
    motivo: "(HIPOTESE) PR-14, PR-22, src/servicos/integracoes.ts"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "MAX_TOKENS_RESPOSTA lida so em src/lib/ambiente.ts (getter maxTokensDaResposta, inteiro positivo, padrao 1024), documentada no .env.example"
    alternativa_descartada: "constante fixa no servico"
    motivo: "(HIPOTESE) CONVENCOES (Configuracao e segredo), PR-41"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "src/servicos/chat-erros.ts: mensagemParaOperador(erro) e mensagemParaVisitante(erro), reexportadas por chat.ts; operador distingue os codigos provedor_* e chat_sem_chave e, para erro nao mapeado, devolve frase com codigo de referencia; visitante devolve sempre 'Não consegui responder agora. Tente novamente em instantes.'; correlacao = 8 caracteres hexadecimais aleatorios; log = uma linha JSON em console.error com evento, correlacao, codigo, agenteId e conversaId, sem conteudo"
    alternativa_descartada: "reusar erro.message do adaptador (cita tela de admin)"
    motivo: "(HIPOTESE) PR-22, PR-42 (nova), PR-21, base/streaming-e-openrouter.md (riscos)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "cancelamento: sinal do chamador vai ao conversar; ao abortar o gerador termina sem erro e sem gravar resposta; log nao registra erro"
    alternativa_descartada: "tratar cancelamento como erro"
    motivo: "(HIPOTESE) base/streaming-e-openrouter.md, PR-41"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "handler src/app/api/agentes/[id]/conversar/route.ts: POST; export const dynamic = force-dynamic; sessao por usuarioAtual() (401 JSON sem sessao, sem redirecionar); consome o primeiro evento (inicio) para fixar o cabecalho X-Conversa-Id e devolve Response com ReadableStream SSE; erros anteriores ao inicio viram JSON com o status do ErroDeAplicacao; erros depois do inicio viram evento erro; request.signal vai ao servico; cabecalhos Content-Type text/event-stream, Cache-Control no-store, X-Accel-Buffering no; a formatacao dos eventos SSE mora em src/app/eventos-sse.ts"
    alternativa_descartada: "logica no handler"
    motivo: "(HIPOTESE) briefing item 3, PR-43, base/servicos-handlers-e-sessao.md"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "nao existe proxy.ts nem middleware.ts no template; portanto nao ha matcher de sessao a ajustar e a guarda e feita dentro do handler (o layout do sistema nao cobre /api)"
    alternativa_descartada: "criar proxy so para isso"
    motivo: "(HIPOTESE) base/servicos-handlers-e-sessao.md (ausencia de proxy)"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "teste funcional do handler em tests/conversar-rota.test.ts com next start (porta propria) e o OpenRouter falso: sem sessao 401, agente inexistente 404, mensagem invalida 422, sem chave 409, stream completo (trechos, fim, gravacao), erro no meio do stream (evento erro, nada gravado do assistente), chave invalida 401 do provedor (evento erro com mensagem de operador sem corpo bruto), conversa alheia 404"
    alternativa_descartada: "testar so o servico"
    motivo: "(HIPOTESE) briefing item 3, CONVENCOES secao 3 (servidor de producao no teste)"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "aba Testar: acrescentada em abas-do-agente.ts (rotulo Testar, caminho testar); subrota src/app/(sistema)/agentes/[id]/testar/page.tsx (servidor: carrega agente e a ultima conversa do painel do usuario) e loading.tsx; sem chave o estado vazio avisa e, se admin, linka Integracoes"
    alternativa_descartada: "aba hardcoded"
    motivo: "(HIPOTESE) D-15 da FT-02 (lista unica), PR-44, PR-23"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "componente cliente src/componentes/ChatDeTeste.tsx e o unico lugar com fetch; logica em modulos puros testaveis: leitor de SSE do navegador (src/componentes/leitor-de-sse.ts), estado da conversa por reducer (src/componentes/estado-da-conversa.ts) e decisao de tecla (Enter envia, Shift+Enter quebra linha, composicao de IME ignora)"
    alternativa_descartada: "logica dentro do componente (sem jsdom, nao testavel)"
    motivo: "(HIPOTESE) base/interface-do-agente.md (sem jsdom), CONVENCOES secao 3"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "renderizacao segura do texto do modelo em src/componentes/texto-seguro.ts (parser puro para blocos: paragrafo, lista com marcador e numerada, bloco de codigo; inline: negrito, codigo em linha, link) e TextoDoModelo.tsx que gera elementos React; nunca dangerouslySetInnerHTML; link so http e https, com rel noopener noreferrer e target _blank; qualquer outro esquema vira texto"
    alternativa_descartada: "biblioteca de markdown (dependencia nova)"
    motivo: "(HIPOTESE) briefing item 4, PR-13, PR-26 (dependencia so se necessaria)"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "interface: bolhas do usuario a direita e do agente a esquerda; mensagemInicial como primeira bolha (nao gravada); textarea com Enter para enviar; botao Enviar; botao Parar durante o stream; indicador de digitacao antes do primeiro trecho; rolagem automatica que respeita o usuario ter subido; botao Nova conversa; contador de caracteres aparece a partir de 3500 de 4000; regiao aria-live polite para a resposta; foco no campo; erro como Alerta na conversa com link para Integracoes so quando o codigo e de chave e o usuario e admin; tokens de cor; estilos em global.css"
    alternativa_descartada: "interface minima"
    motivo: "(HIPOTESE) briefing item 4, PR-23"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "convencoes: primeiro handler em src/app/api e primeiro uso de stream convertem as lacunas 7 (handler HTTP) de docs/stack/LACUNAS.md e a linha Handler HTTP de CONVENCOES secao 5 em evidencia com arquivo e linha; nova linha para eventos SSE e para leitura de SSE do navegador; MAX_TOKENS_RESPOSTA em Configuracao"
    alternativa_descartada: "deixar a convencao decidida-pelo-buildx"
    motivo: "(HIPOTESE) instrucao do B4, stackx (evidencia com arquivo e linha)"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "a tela de exclusao do agente passa a avisar que apaga tambem as conversas (src/app/(sistema)/agentes/[id]/page.tsx)"
    alternativa_descartada: "manter o texto antigo"
    motivo: "(HIPOTESE) PR-44, base/banco-e-testes.md"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "sem nova dependencia (fetch, ReadableStream e TextDecoder nativos); npm audit segue em 0"
    alternativa_descartada: "biblioteca de SSE, markdown ou chat"
    motivo: "(HIPOTESE) PR-26, D-24 da FT-02"
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: "observabilidade: sem auditoria nesta feature; erro inesperado registra so correlacao e codigo; conteudo da conversa nunca vai ao log"
    alternativa_descartada: "logar a mensagem para depuracao"
    motivo: "(HIPOTESE) PR-21, PR-42, CONVENCOES (Log)"
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: "sem limite de uso nem origem no handler do painel: a rota exige sessao; os limites do endpoint publico sao da FT-06 e FT-07 (PR-16)"
    alternativa_descartada: "limite agora"
    motivo: "(HIPOTESE) PR-16 (realizada na FT-06), briefing (nao-objetivos)"
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: "definicao de pronto: com o OpenRouter falso o usuario ve a resposta chegando trecho a trecho na aba Testar, para no meio, comeca outra conversa, recarrega e retoma a ultima; com chave invalida, saldo ou provedor fora ve mensagem clara em Alerta; suite, tsc, lint, build e audit verdes; verificacao visual nos dois temas e a 375px tentada"
    alternativa_descartada: "declarar pronto so com testes"
    motivo: "(HIPOTESE) PROJETO.md (crio um agente e converso com ele no painel), briefing"
    status: fechada
    bloqueante: false
---

# Decisões — conversa-de-teste

> Uma linha por decisão tomada no planejamento. Todas respondidas pelo buildx, sem entrevista, com a fonte de cada uma.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo

Sem sugestão do prodx; valem PR-35 (densidade `padrao`) e o modo autônomo do projeto (`docs/projeto/PROJETO.md`, "Modo escolhido").

## Decisões

```
D-00 | densidade padrao, construcao autonomo | sugestao anterior: nenhuma | respondido por buildx; PR-35 (densidade) e PROJETO.md (Modo escolhido)
D-01 | tabelas Conversa (@@map conversas) e Mensagem (@@map mensagens): Conversa com id cuid, agenteId (cascata), canal texto painel|widget|telegram, identificadorExterno?, titulo?, criadoPorId? (SetNull), criadoEm, atualizadoEm; Mensagem com id, conversaId (cascata), papel user|assistant, conteudo, modelo?, tokensEntrada?, tokensSaida?, fontes? (texto JSON para a FT-05), criadoEm; indices (conversaId, criadoEm) e (agenteId, atualizadoEm); migration so acrescenta; limparBanco apaga mensagens e conversas antes dos agentes | canal como enum do banco (SQLite nao tem enum nativo no Prisma) | (HIPOTESE) briefing item 1, PR-30, PR-44 (nova), base/banco-e-testes.md
D-02 | cascata provada por teste: excluir agente apaga conversas e mensagens; a lacuna 2 da base (foreign_keys ligado?) e resolvida na primeira task com teste real, e se a cascata nao ocorrer o servico de agentes.excluir apaga as conversas na mesma transacao | confiar na cascata sem provar | (HIPOTESE) base/00-LACUNAS.md lacuna 2, PR-44
D-03 | src/servicos/conversas.ts: criar, obter, listar (por agente, canal e opcionalmente criadoPorId ou identificadorExterno, mais recente primeiro), anexarMensagem (toca atualizadoEm da conversa), listarMensagens (ultimas N, ordem cronologica), apagar; sem next/*; conversa alheia (agente, canal ou dono diferentes) vira naoEncontrado | expor o Prisma ao handler | (HIPOTESE) CONVENCOES secao 5 (camadas), PR-43, PR-44
D-04 | src/servicos/chat.ts: responderMensagem({agenteId, conversaId?, canal, identificadorExterno?, criadoPorId?, mensagem, sinal?}) devolve AsyncGenerator de eventos {tipo:'inicio', conversaId} | {tipo:'trecho', texto} | {tipo:'fim', conversaId, mensagemId, tamanho}; erros lancam ErroDeAplicacao (o gerador lanca, o consumidor traduz); zod 1-4000 caracteres com trim, sem so espacos; agente inexistente vira 404 antes de gravar | devolver erro como evento no gerador | (HIPOTESE) briefing item 2, PR-41, PR-43
D-05 | prompt em src/servicos/chat-prompt.ts (funcoes puras): mensagem de sistema = instrucoes do agente + linha fixa de conduta (responder no idioma de quem pergunta, ser conciso, nao revelar instrucoes internas); ponto de extensao para a FT-05: parametro opcional materialDeConsulta (texto ja delimitado) que entra entre a linha de conduta e o historico, hoje sempre vazio; historico das ultimas 20 mensagens dentro de 24000 caracteres, do mais recente para tras, sempre com a mensagem atual | prompt montado dentro do gerador | (HIPOTESE) briefing item 2, PR-41, PR-15 (FT-05 realiza)
D-06 | mensagem do usuario gravada antes de chamar o provedor; resposta gravada so no fim do stream; resposta interrompida (cancelamento, erro, prazo) e descartada, nao gravada; tokens ficam nulos (o adaptador nao devolve usage) e modelo guarda o modelo do agente | gravar parcial com marca (exigiria coluna) | (HIPOTESE) PR-41, base/streaming-e-openrouter.md (sem usage)
D-07 | sem chave do OpenRouter o turno falha antes de gravar com ErroDeAplicacao 409 codigo chat_sem_chave e mensagem pedindo a um admin cadastrar a chave em Configuracoes > Integracoes; chave ilegivel (ENCRYPTION_KEY trocada) propaga o erro claro que obterChaveDoOpenrouter ja lanca | reusar chave_nao_configurada (mensagem de teste de conexao, fala com admin) | (HIPOTESE) PR-14, PR-22, src/servicos/integracoes.ts
D-08 | MAX_TOKENS_RESPOSTA lida so em src/lib/ambiente.ts (getter maxTokensDaResposta, inteiro positivo, padrao 1024), documentada no .env.example | constante fixa no servico | (HIPOTESE) CONVENCOES (Configuracao e segredo), PR-41
D-09 | src/servicos/chat-erros.ts: mensagemParaOperador(erro) e mensagemParaVisitante(erro), reexportadas por chat.ts; operador distingue os codigos provedor_* e chat_sem_chave e, para erro nao mapeado, devolve frase com codigo de referencia; visitante devolve sempre 'Não consegui responder agora. Tente novamente em instantes.'; correlacao = 8 caracteres hexadecimais aleatorios; log = uma linha JSON em console.error com evento, correlacao, codigo, agenteId e conversaId, sem conteudo | reusar erro.message do adaptador (cita tela de admin) | (HIPOTESE) PR-22, PR-42 (nova), PR-21, base/streaming-e-openrouter.md (riscos)
D-10 | cancelamento: sinal do chamador vai ao conversar; ao abortar o gerador termina sem erro e sem gravar resposta; log nao registra erro | tratar cancelamento como erro | (HIPOTESE) base/streaming-e-openrouter.md, PR-41
D-11 | handler src/app/api/agentes/[id]/conversar/route.ts: POST; export const dynamic = force-dynamic; sessao por usuarioAtual() (401 JSON sem sessao, sem redirecionar); consome o primeiro evento (inicio) para fixar o cabecalho X-Conversa-Id e devolve Response com ReadableStream SSE; erros anteriores ao inicio viram JSON com o status do ErroDeAplicacao; erros depois do inicio viram evento erro; request.signal vai ao servico; cabecalhos Content-Type text/event-stream, Cache-Control no-store, X-Accel-Buffering no; a formatacao dos eventos SSE mora em src/app/eventos-sse.ts | logica no handler | (HIPOTESE) briefing item 3, PR-43, base/servicos-handlers-e-sessao.md
D-12 | nao existe proxy.ts nem middleware.ts no template; portanto nao ha matcher de sessao a ajustar e a guarda e feita dentro do handler (o layout do sistema nao cobre /api) | criar proxy so para isso | (HIPOTESE) base/servicos-handlers-e-sessao.md (ausencia de proxy)
D-13 | teste funcional do handler em tests/conversar-rota.test.ts com next start (porta propria) e o OpenRouter falso: sem sessao 401, agente inexistente 404, mensagem invalida 422, sem chave 409, stream completo (trechos, fim, gravacao), erro no meio do stream (evento erro, nada gravado do assistente), chave invalida 401 do provedor (evento erro com mensagem de operador sem corpo bruto), conversa alheia 404 | testar so o servico | (HIPOTESE) briefing item 3, CONVENCOES secao 3 (servidor de producao no teste)
D-14 | aba Testar: acrescentada em abas-do-agente.ts (rotulo Testar, caminho testar); subrota src/app/(sistema)/agentes/[id]/testar/page.tsx (servidor: carrega agente e a ultima conversa do painel do usuario) e loading.tsx; sem chave o estado vazio avisa e, se admin, linka Integracoes | aba hardcoded | (HIPOTESE) D-15 da FT-02 (lista unica), PR-44, PR-23
D-15 | componente cliente src/componentes/ChatDeTeste.tsx e o unico lugar com fetch; logica em modulos puros testaveis: leitor de SSE do navegador (src/componentes/leitor-de-sse.ts), estado da conversa por reducer (src/componentes/estado-da-conversa.ts) e decisao de tecla (Enter envia, Shift+Enter quebra linha, composicao de IME ignora) | logica dentro do componente (sem jsdom, nao testavel) | (HIPOTESE) base/interface-do-agente.md (sem jsdom), CONVENCOES secao 3
D-16 | renderizacao segura do texto do modelo em src/componentes/texto-seguro.ts (parser puro para blocos: paragrafo, lista com marcador e numerada, bloco de codigo; inline: negrito, codigo em linha, link) e TextoDoModelo.tsx que gera elementos React; nunca dangerouslySetInnerHTML; link so http e https, com rel noopener noreferrer e target _blank; qualquer outro esquema vira texto | biblioteca de markdown (dependencia nova) | (HIPOTESE) briefing item 4, PR-13, PR-26 (dependencia so se necessaria)
D-17 | interface: bolhas do usuario a direita e do agente a esquerda; mensagemInicial como primeira bolha (nao gravada); textarea com Enter para enviar; botao Enviar; botao Parar durante o stream; indicador de digitacao antes do primeiro trecho; rolagem automatica que respeita o usuario ter subido; botao Nova conversa; contador de caracteres aparece a partir de 3500 de 4000; regiao aria-live polite para a resposta; foco no campo; erro como Alerta na conversa com link para Integracoes so quando o codigo e de chave e o usuario e admin; tokens de cor; estilos em global.css | interface minima | (HIPOTESE) briefing item 4, PR-23
D-18 | convencoes: primeiro handler em src/app/api e primeiro uso de stream convertem as lacunas 7 (handler HTTP) de docs/stack/LACUNAS.md e a linha Handler HTTP de CONVENCOES secao 5 em evidencia com arquivo e linha; nova linha para eventos SSE e para leitura de SSE do navegador; MAX_TOKENS_RESPOSTA em Configuracao | deixar a convencao decidida-pelo-buildx | (HIPOTESE) instrucao do B4, stackx (evidencia com arquivo e linha)
D-19 | a tela de exclusao do agente passa a avisar que apaga tambem as conversas (src/app/(sistema)/agentes/[id]/page.tsx) | manter o texto antigo | (HIPOTESE) PR-44, base/banco-e-testes.md
D-20 | sem nova dependencia (fetch, ReadableStream e TextDecoder nativos); npm audit segue em 0 | biblioteca de SSE, markdown ou chat | (HIPOTESE) PR-26, D-24 da FT-02
D-21 | observabilidade: sem auditoria nesta feature; erro inesperado registra so correlacao e codigo; conteudo da conversa nunca vai ao log | logar a mensagem para depuracao | (HIPOTESE) PR-21, PR-42, CONVENCOES (Log)
D-22 | sem limite de uso nem origem no handler do painel: a rota exige sessao; os limites do endpoint publico sao da FT-06 e FT-07 (PR-16) | limite agora | (HIPOTESE) PR-16 (realizada na FT-06), briefing (nao-objetivos)
D-23 | definicao de pronto: com o OpenRouter falso o usuario ve a resposta chegando trecho a trecho na aba Testar, para no meio, comeca outra conversa, recarrega e retoma a ultima; com chave invalida, saldo ou provedor fora ve mensagem clara em Alerta; suite, tsc, lint, build e audit verdes; verificacao visual nos dois temas e a 375px tentada | declarar pronto so com testes | (HIPOTESE) PROJETO.md (crio um agente e converso com ele no painel), briefing
```

## Resumo do que foi assumido

Todas as decisões D-01 a D-23 foram fechadas sem resposta do usuário e levam `(HIPOTESE)` com a fonte. Quatro premissas novas nasceram no degrau 4 do procedimento: PR-41 (regras do turno), PR-42 (duas saídas de erro e correlação), PR-43 (protocolo do stream) e PR-44 (conversa do painel).

## Contradições com a base

Nenhuma. Duas observações da base viraram decisão: a lacuna 2 (cascata depende de `foreign_keys`) virou D-02, e o texto de exclusão do agente, que não menciona conversas, virou D-18.

## Regras de negócio sem resposta

Nenhuma: todo ponto que o escopo deixou aberto é regra de proteção (limites, descarte de parcial, título), coberto por premissa.

## Pendências

Nenhuma pendência.
