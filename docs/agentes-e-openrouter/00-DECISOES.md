---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
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
    decisao: "src/lib/cripto.ts exporta cifrar(texto), decifrar(texto) e mascararSegredo(texto); formato v1:<iv>:<etiqueta>:<cifrado> em base64url, AES-256-GCM, IV aleatorio de 12 bytes por gravacao, adulteracao e chave errada lancam erro claro"
    alternativa_descartada: "AES-CBC sem autenticacao"
    motivo: "(HIPOTESE) PR-14 e PR-39 (nova)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "ENCRYPTION_KEY lida por getter preguicoso em ambiente.ts (32 bytes em hex ou base64) e so validada quando cifrar ou decifrar e chamada; ausente ou invalida vira ErroDeAplicacao 500 com mensagem clara; tests/setup.ts define chave de teste; .env.example documenta como gerar, sem valor"
    alternativa_descartada: "validar no start, o que derrubaria login e painel sem a chave"
    motivo: "(HIPOTESE) PR-39, CONVENCOES (Configuracao) e instrucao do B4 (ausencia nao derruba o resto)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "tabela singleton ConfiguracaoDoWorkspace (@@map configuracao_do_workspace) com id fixo unica, openrouterChaveCifrada opcional, atualizadoEm e atualizadoPor (id do usuario, sem chave estrangeira); acesso por upsert; migration nova so acrescenta"
    alternativa_descartada: "varias linhas ou variavel de ambiente para a chave"
    motivo: "(HIPOTESE) PR-06 (chave unica do workspace, por admin), PR-30 (migrations aditivas), base/banco-e-migrations.md"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "src/servicos/integracoes.ts: estadoDoOpenrouter(autor), salvarChaveDoOpenrouter(autor, entrada), removerChaveDoOpenrouter(autor), testarConexaoDoOpenrouter(autor), todos com exigirAdmin; e obterChaveDoOpenrouter() sem autor, que devolve a chave decifrada so a outros servicos (FT-03); o estado devolve apenas configurada, mascara, atualizadoEm e nunca a chave nem o texto cifrado"
    alternativa_descartada: "expor a chave cifrada ao navegador"
    motivo: "(HIPOTESE) PR-14 e PR-12; CONVENCOES secao 5 (servico importa src/lib)"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "adaptador src/lib/openrouter.ts: URL base por OPENROUTER_BASE_URL, cabecalhos HTTP-Referer (APP_URL) e X-Title (APP_NAME), listarModelos(chave) com cache de 5 minutos e lista de reserva marcada reserva true, verificarChave(chave) por GET /key, conversar({chave, modelo, mensagens, temperatura, maxTokens, sinal}) devolvendo AsyncIterable<string>; timeouts de 15 s nas chamadas curtas, 30 s ate o primeiro byte e 120 s no total no stream"
    alternativa_descartada: "SDK oficial (dependencia nova)"
    motivo: "(HIPOTESE) PR-06, PR-22, PR-38 (nova), base/openrouter-api.md"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "verificacao de chave usa GET /key, a rota documentada; o briefing cita /auth/key e o servidor falso responde nas duas rotas"
    alternativa_descartada: "usar so /auth/key"
    motivo: "(HIPOTESE) (contradicao com o briefing) base/openrouter-api.md lacuna 1 e limits.md:239"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "parser SSE puro e exportado (lerTrechosDeSSE) com buffer por linha: aceita data: com JSON, ignora linhas de comentario iniciadas por dois pontos, encerra em [DONE], junta JSON partido entre chunks de rede, e trata evento com error no topo ou finish_reason error como falha mesmo com HTTP 200"
    alternativa_descartada: "JSON.parse direto em cada chunk"
    motivo: "(HIPOTESE) base/openrouter-api.md (streaming.md:219-229, 485-499)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "erros do provedor viram ErroDeAplicacao com status 502 (504 no tempo esgotado) e codigos provedor_chave_invalida, provedor_sem_saldo, provedor_modelo_invalido, provedor_limite, provedor_indisponivel, provedor_tempo_esgotado; mensagem em portugues ao operador; corpo bruto e chave nunca entram na mensagem nem no log"
    alternativa_descartada: "repassar error.message do provedor"
    motivo: "(HIPOTESE) PR-22, PR-38, base/openrouter-api.md (riscos)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "servidor simulado tests/apoio/openrouter-falso.ts: iniciarOpenRouterFalso(opcoes) sobe em porta livre e devolve {url, requisicoes, fechar, configurar}; imita /models, /key e /auth/key e /chat/completions com e sem stream, chave invalida, saldo, modelo invalido, limite, erro no meio do stream, comentario PROCESSING, chunks partidos e latencia; documentado em comentario curto para FT-03 e FT-05"
    alternativa_descartada: "mock de fetch por teste"
    motivo: "(HIPOTESE) PR-26 e CONVENCOES secao 3 (servidor local, URL base por variavel)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "tela /configuracoes/integracoes so admin: guarda em layout.tsx da pasta (como usuarios/layout.tsx) e loading.tsx na pasta; campo de chave tipo senha, salvar, testar conexao, remover, estado configurada ou nao com a mascara; acoes em src/app/acoes.ts; item Integracoes no grupo Configuracoes (somenteAdmin)"
    alternativa_descartada: "guarda so na pagina"
    motivo: "(HIPOTESE) PR-12, CONVENCOES (Interface), base/interface-e-menu.md"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "sem rota de API nesta feature: salvar, testar e remover sao acoes de servidor; a lacuna 7 (handler HTTP) continua para a FT-06"
    alternativa_descartada: "criar src/app/api/integracoes"
    motivo: "(HIPOTESE) CONVENCOES secao 5 (handler fino, FT-06) e mapa: nao ha consumidor externo agora"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "teste funcional prova que nem a resposta HTML da pagina nem o JSON/objeto do servico contem a chave em claro nem o texto cifrado; a pagina roda no servidor de producao do teste de rotas com chave gravada"
    alternativa_descartada: "conferir so o servico"
    motivo: "(HIPOTESE) PR-14 e briefing item 5"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "modelo Agente (@@map agentes): id cuid, nome, instrucoes, modelo, temperatura decimal com padrao 0.7, mensagemInicial, criadoPorId com relacao a Usuario, criadoEm, atualizadoEm; migration so acrescenta; limparBanco de tests/ajuda.ts passa a apagar agentes antes de usuarios"
    alternativa_descartada: "agente sem dono"
    motivo: "(HIPOTESE) PR-01, PR-40 (nova), base/banco-e-migrations.md"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "src/servicos/agentes.ts: listar(autor), obter(autor, id), criar(autor, entrada), editar(autor, id, entrada), excluir(autor, id); zod com nome 1-80, instrucoes ate 8000, modelo nao vazio ate 200, temperatura 0 a 2, mensagemInicial ate 500; qualquer usuario autenticado gerencia qualquer agente; inexistente vira naoEncontrado"
    alternativa_descartada: "dono unico por agente"
    motivo: "(HIPOTESE) PR-01, PR-12, PR-13, PR-40"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "telas /agentes (grade de cartoes, estado vazio com chamada para criar, loading.tsx, erro), /agentes/novo e /agentes/[id] com layout compartilhado que mostra o nome do agente e o componente AbasDoAgente; a lista de abas mora em src/componentes/abas-do-agente.ts (por ora so Configuracoes) para as proximas features acrescentarem sem tocar no componente; Configuracoes e a pagina /agentes/[id]"
    alternativa_descartada: "abas hardcoded no componente"
    motivo: "(HIPOTESE) PR-01, PR-23, briefing, D-02 da FT-01 (lista unica)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "seletor de modelo SeletorDeModelo: campo com lista sugerida (datalist) alimentada por listarModelos quando ha chave configurada, mantendo texto livre valido; sem chave, texto livre com aviso e link para Integracoes apenas se o usuario for admin; falha da lista usa a reserva e avisa"
    alternativa_descartada: "select fechado que impede modelo fora da lista"
    motivo: "(HIPOTESE) PR-06, PR-38, briefing item 7"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "item de menu Agentes no topo do grupo sem titulo, abaixo de Painel (icone novo agentes); item Integracoes no grupo Configuracoes; rotas de detalhe herdam o titulo Agentes (novo agente e /agentes/[id]) por regra de prefixo em migalhasDaRota"
    alternativa_descartada: "itens escritos a mao na barra"
    motivo: "(HIPOTESE) D-02 da FT-01, base/interface-e-menu.md"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "exclusao de agente com confirmacao na propria tela (botao Excluir abre bloco de confirmacao com Cancelar e Confirmar exclusao), sem window.confirm; formulario com contador de caracteres nas instrucoes; ambos client components sobre classes existentes"
    alternativa_descartada: "window.confirm"
    motivo: "(HIPOTESE) briefing item 7, PR-23"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "seed cria o agente Assistente de exemplo com instrucoes ficticias em portugues, modelo padrao e sem chave, por upsert com id fixo, dono a conta admin de demonstracao; recusa producao continua"
    alternativa_descartada: "agente dependente de chave"
    motivo: "(HIPOTESE) PR-25, D-14 da FT-01"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "tests/migracoes.test.ts le o SQL de todas as migrations e falha em DROP TABLE ou DROP COLUMN sem a marca -- destrutiva-autorizada na mesma migration; acompanha a regra migracao so acrescenta"
    alternativa_descartada: "conferir por revisao humana"
    motivo: "(HIPOTESE) LACUNAS 9 e CONVENCOES secao 4"
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: "CONVENCOES e LACUNAS atualizados so onde ha evidencia nova: HTTP de saida simulado (tests/apoio/openrouter-falso.ts), adaptador em src/lib (src/lib/openrouter.ts), cripto e migracao aditiva verificada; lacunas 5 (parte HTTP) e 9 resolvidas; 7 e 8 seguem"
    alternativa_descartada: "reescrever as convencoes inteiras"
    motivo: "(HIPOTESE) instrucao do B4 e stackx (evidencia com arquivo e linha)"
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: "observabilidade: sem trilha de auditoria da troca de chave e da exclusao de agente (FT-10, PR-19); log so via console.error do erro inesperado, sem chave nem corpo do provedor; a acao mostra a mensagem do ErroDeAplicacao"
    alternativa_descartada: "auditoria agora"
    motivo: "(HIPOTESE) PR-19 (realizada na FT-10), PR-21 (FT-11)"
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: "resiliencia: lista de modelos cai na reserva sem erro; verificar chave e testar conexao mostram a mensagem do provedor traduzida; ENCRYPTION_KEY ausente ou trocada mostra mensagem clara na tela de Integracoes sem derrubar o restante do sistema"
    alternativa_descartada: "erro generico"
    motivo: "(HIPOTESE) PR-22, PR-38, PR-39"
    status: fechada
    bloqueante: false
  - id: D-24
    decisao: "nenhuma dependencia nova (fetch nativo do Node 22); npm audit segue em 0"
    alternativa_descartada: "biblioteca de SSE ou SDK"
    motivo: "(HIPOTESE) PR-26, CONVENCOES secao 1"
    status: fechada
    bloqueante: false
  - id: D-25
    decisao: "definicao de pronto: admin grava a chave e ve so a mascara, testa a conexao contra o servidor falso, remove; usuario cria, edita e exclui agente com modelo, temperatura e mensagem inicial; menu mostra Agentes e Integracoes; suite, tsc, lint, build e audit verdes; verificacao visual tentada nos dois temas e a 375px"
    alternativa_descartada: "declarar pronto so com testes"
    motivo: "(HIPOTESE) PROJETO.md (criterios de aceite: crio um agente e escolho o modelo) e briefing"
    status: fechada
    bloqueante: false
---

# Decisões — agentes-e-openrouter

Todas respondidas pelo buildx (`respondido_por: buildx`), pelos quatro degraus: PROJETO.md, PREMISSAS.md, CONVENCOES.md e, sem resposta, premissa nova (PR-38, PR-39 e PR-40, origem `f2_autonoma`). Nenhuma regra de negócio ficou sem resposta; nenhum bloqueio.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo

## Decisões

```
D-00 | densidade padrao, construcao autonomo | null | PR-35 (densidade) e PROJETO.md (Modo escolhido)
D-01 | src/lib/cripto.ts exporta cifrar(texto), decifrar(texto) e mascararSegredo(texto); formato v1:<iv>:<etiqueta>:<cifrado> em base64url, AES-256-GCM, IV aleatorio de 12 bytes por gravacao, adulteracao e chave errada lancam erro claro | AES-CBC sem autenticacao | PR-14 e PR-39 (nova)
D-02 | ENCRYPTION_KEY lida por getter preguicoso em ambiente.ts (32 bytes em hex ou base64) e so validada quando cifrar ou decifrar e chamada; ausente ou invalida vira ErroDeAplicacao 500 com mensagem clara; tests/setup.ts define chave de teste; .env.example documenta como gerar, sem valor | validar no start, o que derrubaria login e painel sem a chave | PR-39, CONVENCOES (Configuracao) e instrucao do B4 (ausencia nao derruba o resto)
D-03 | tabela singleton ConfiguracaoDoWorkspace (@@map configuracao_do_workspace) com id fixo unica, openrouterChaveCifrada opcional, atualizadoEm e atualizadoPor (id do usuario, sem chave estrangeira); acesso por upsert; migration nova so acrescenta | varias linhas ou variavel de ambiente para a chave | PR-06 (chave unica do workspace, por admin), PR-30 (migrations aditivas), base/banco-e-migrations.md
D-04 | src/servicos/integracoes.ts: estadoDoOpenrouter(autor), salvarChaveDoOpenrouter(autor, entrada), removerChaveDoOpenrouter(autor), testarConexaoDoOpenrouter(autor), todos com exigirAdmin; e obterChaveDoOpenrouter() sem autor, que devolve a chave decifrada so a outros servicos (FT-03); o estado devolve apenas configurada, mascara, atualizadoEm e nunca a chave nem o texto cifrado | expor a chave cifrada ao navegador | PR-14 e PR-12; CONVENCOES secao 5 (servico importa src/lib)
D-05 | adaptador src/lib/openrouter.ts: URL base por OPENROUTER_BASE_URL, cabecalhos HTTP-Referer (APP_URL) e X-Title (APP_NAME), listarModelos(chave) com cache de 5 minutos e lista de reserva marcada reserva true, verificarChave(chave) por GET /key, conversar({chave, modelo, mensagens, temperatura, maxTokens, sinal}) devolvendo AsyncIterable<string>; timeouts de 15 s nas chamadas curtas, 30 s ate o primeiro byte e 120 s no total no stream | SDK oficial (dependencia nova) | PR-06, PR-22, PR-38 (nova), base/openrouter-api.md
D-06 | verificacao de chave usa GET /key, a rota documentada; o briefing cita /auth/key e o servidor falso responde nas duas rotas | usar so /auth/key | (contradicao com o briefing) base/openrouter-api.md lacuna 1 e limits.md:239
D-07 | parser SSE puro e exportado (lerTrechosDeSSE) com buffer por linha: aceita data: com JSON, ignora linhas de comentario iniciadas por dois pontos, encerra em [DONE], junta JSON partido entre chunks de rede, e trata evento com error no topo ou finish_reason error como falha mesmo com HTTP 200 | JSON.parse direto em cada chunk | base/openrouter-api.md (streaming.md:219-229, 485-499)
D-08 | erros do provedor viram ErroDeAplicacao com status 502 (504 no tempo esgotado) e codigos provedor_chave_invalida, provedor_sem_saldo, provedor_modelo_invalido, provedor_limite, provedor_indisponivel, provedor_tempo_esgotado; mensagem em portugues ao operador; corpo bruto e chave nunca entram na mensagem nem no log | repassar error.message do provedor | PR-22, PR-38, base/openrouter-api.md (riscos)
D-09 | servidor simulado tests/apoio/openrouter-falso.ts: iniciarOpenRouterFalso(opcoes) sobe em porta livre e devolve {url, requisicoes, fechar, configurar}; imita /models, /key e /auth/key e /chat/completions com e sem stream, chave invalida, saldo, modelo invalido, limite, erro no meio do stream, comentario PROCESSING, chunks partidos e latencia; documentado em comentario curto para FT-03 e FT-05 | mock de fetch por teste | PR-26 e CONVENCOES secao 3 (servidor local, URL base por variavel)
D-10 | tela /configuracoes/integracoes so admin: guarda em layout.tsx da pasta (como usuarios/layout.tsx) e loading.tsx na pasta; campo de chave tipo senha, salvar, testar conexao, remover, estado configurada ou nao com a mascara; acoes em src/app/acoes.ts; item Integracoes no grupo Configuracoes (somenteAdmin) | guarda so na pagina | PR-12, CONVENCOES (Interface), base/interface-e-menu.md
D-11 | sem rota de API nesta feature: salvar, testar e remover sao acoes de servidor; a lacuna 7 (handler HTTP) continua para a FT-06 | criar src/app/api/integracoes | CONVENCOES secao 5 (handler fino, FT-06) e mapa: nao ha consumidor externo agora
D-12 | teste funcional prova que nem a resposta HTML da pagina nem o JSON/objeto do servico contem a chave em claro nem o texto cifrado; a pagina roda no servidor de producao do teste de rotas com chave gravada | conferir so o servico | PR-14 e briefing item 5
D-13 | modelo Agente (@@map agentes): id cuid, nome, instrucoes, modelo, temperatura decimal com padrao 0.7, mensagemInicial, criadoPorId com relacao a Usuario, criadoEm, atualizadoEm; migration so acrescenta; limparBanco de tests/ajuda.ts passa a apagar agentes antes de usuarios | agente sem dono | PR-01, PR-40 (nova), base/banco-e-migrations.md
D-14 | src/servicos/agentes.ts: listar(autor), obter(autor, id), criar(autor, entrada), editar(autor, id, entrada), excluir(autor, id); zod com nome 1-80, instrucoes ate 8000, modelo nao vazio ate 200, temperatura 0 a 2, mensagemInicial ate 500; qualquer usuario autenticado gerencia qualquer agente; inexistente vira naoEncontrado | dono unico por agente | PR-01, PR-12, PR-13, PR-40
D-15 | telas /agentes (grade de cartoes, estado vazio com chamada para criar, loading.tsx, erro), /agentes/novo e /agentes/[id] com layout compartilhado que mostra o nome do agente e o componente AbasDoAgente; a lista de abas mora em src/componentes/abas-do-agente.ts (por ora so Configuracoes) para as proximas features acrescentarem sem tocar no componente; Configuracoes e a pagina /agentes/[id] | abas hardcoded no componente | PR-01, PR-23, briefing, D-02 da FT-01 (lista unica)
D-16 | seletor de modelo SeletorDeModelo: campo com lista sugerida (datalist) alimentada por listarModelos quando ha chave configurada, mantendo texto livre valido; sem chave, texto livre com aviso e link para Integracoes apenas se o usuario for admin; falha da lista usa a reserva e avisa | select fechado que impede modelo fora da lista | PR-06, PR-38, briefing item 7
D-17 | item de menu Agentes no topo do grupo sem titulo, abaixo de Painel (icone novo agentes); item Integracoes no grupo Configuracoes; rotas de detalhe herdam o titulo Agentes (novo agente e /agentes/[id]) por regra de prefixo em migalhasDaRota | itens escritos a mao na barra | D-02 da FT-01, base/interface-e-menu.md
D-18 | exclusao de agente com confirmacao na propria tela (botao Excluir abre bloco de confirmacao com Cancelar e Confirmar exclusao), sem window.confirm; formulario com contador de caracteres nas instrucoes; ambos client components sobre classes existentes | window.confirm | briefing item 7, PR-23
D-19 | seed cria o agente Assistente de exemplo com instrucoes ficticias em portugues, modelo padrao e sem chave, por upsert com id fixo, dono a conta admin de demonstracao; recusa producao continua | agente dependente de chave | PR-25, D-14 da FT-01
D-20 | tests/migracoes.test.ts le o SQL de todas as migrations e falha em DROP TABLE ou DROP COLUMN sem a marca -- destrutiva-autorizada na mesma migration; acompanha a regra migracao so acrescenta | conferir por revisao humana | LACUNAS 9 e CONVENCOES secao 4
D-21 | CONVENCOES e LACUNAS atualizados so onde ha evidencia nova: HTTP de saida simulado (tests/apoio/openrouter-falso.ts), adaptador em src/lib (src/lib/openrouter.ts), cripto e migracao aditiva verificada; lacunas 5 (parte HTTP) e 9 resolvidas; 7 e 8 seguem | reescrever as convencoes inteiras | instrucao do B4 e stackx (evidencia com arquivo e linha)
D-22 | observabilidade: sem trilha de auditoria da troca de chave e da exclusao de agente (FT-10, PR-19); log so via console.error do erro inesperado, sem chave nem corpo do provedor; a acao mostra a mensagem do ErroDeAplicacao | auditoria agora | PR-19 (realizada na FT-10), PR-21 (FT-11)
D-23 | resiliencia: lista de modelos cai na reserva sem erro; verificar chave e testar conexao mostram a mensagem do provedor traduzida; ENCRYPTION_KEY ausente ou trocada mostra mensagem clara na tela de Integracoes sem derrubar o restante do sistema | erro generico | PR-22, PR-38, PR-39
D-24 | nenhuma dependencia nova (fetch nativo do Node 22); npm audit segue em 0 | biblioteca de SSE ou SDK | PR-26, CONVENCOES secao 1
D-25 | definicao de pronto: admin grava a chave e ve so a mascara, testa a conexao contra o servidor falso, remove; usuario cria, edita e exclui agente com modelo, temperatura e mensagem inicial; menu mostra Agentes e Integracoes; suite, tsc, lint, build e audit verdes; verificacao visual tentada nos dois temas e a 375px | declarar pronto so com testes | PROJETO.md (criterios de aceite: crio um agente e escolho o modelo) e briefing
```

## Resumo do que foi assumido

Todas as decisões D-01 a D-25 foram fechadas sem resposta do usuário e levam `(HIPOTESE)` no motivo do frontmatter; cada uma cita PROJETO.md, PREMISSAS.md, CONVENCOES.md ou a base.

## Contradições com a base

O briefing cita `/auth/key`; a documentação do OpenRouter lê `GET /key` (`base/00-LACUNAS.md`, lacuna 1). D-05 usa `/key` e o servidor falso responde nas duas rotas.

## Pendências

Nenhuma pendência.
