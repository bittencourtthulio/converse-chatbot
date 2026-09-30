---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
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
    decisao: "tabela 1:1 configuracao_do_chat (modelo ConfiguracaoDoChat, agenteId como chave, cascata) por migration que so acrescenta; linha ausente vale os padroes; servico src/servicos/chat-publico-config.ts com obterConfiguracao(autor, agenteId), salvarConfiguracao(autor, agenteId, entrada) em zod, configuracaoPublica(agenteId) e dominiosDoEmbed(agenteId)"
    alternativa_descartada: "colunas novas em Agente"
    motivo: "(HIPOTESE) PR-55; briefing item 1; base/configuracao-e-painel.md (migrations so acrescentam, tests/migracoes.test.ts)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "validacoes da configuracao: titulo ate 60, cor #rrggbb (expande #rgb, minusculas), posicao direita|esquerda, avatar iniciais|chat|robo|estrela|fone, aviso ate 300 e URL http/https ate 500, ate 20 dominios, limiteDiario 1 a 100000 (padrao 500), ate 3 sugestoes de 1 a 80"
    alternativa_descartada: "aceitar texto livre e validar so na tela"
    motivo: "(HIPOTESE) PR-55; PR-13 (toda entrada validada no servidor); CONVENCOES secao 6 (zod na aplicacao)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "regras de dominio em modulo puro src/lib/dominios-permitidos.ts: normalizarDominio, normalizarLista, origemPermitida(origem, lista), cabecalhoFrameAncestors(lista); entrada sem porta vale so a porta padrao, curinga so no inicio, lista vazia libera tudo"
    alternativa_descartada: "conferir so por sufixo de texto"
    motivo: "(HIPOTESE) PR-58; semantica de host-source do CSP; base/embed-e-csp.md; o modulo e compartilhado pelo servico, pelo CORS e pelo proxy"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "a restricao de dominio e garantida por frame-ancestors e pelo CORS do config; o POST conversar recusa com 403 Origin de navegador que nao seja a da plataforma (Host ou APP_URL); a decisao vira a premissa PR-58 e cada ponto e testado"
    alternativa_descartada: "conferir Origin do POST como controle de dominio"
    motivo: "(HIPOTESE) PR-58 (premissa nova criada na F2); nota do pedido sobre PR-17"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "servico src/servicos/chat-publico.ts (camada de aplicacao, sem next/*): validarVisitanteId, exigirAgenteAtivo (404 igual para inexistente e inativo), exigirLimites({ip, agenteId, conversaId, limitador}), teto diario contado no banco, abrirConversaPublica que reusa responderMensagem com canal widget, retomarConversaDoVisitante (50 ultimas) e reducao do evento fontes; o handler HTTP so traduz"
    alternativa_descartada: "logica no handler"
    motivo: "(HIPOTESE) PR-56, PR-57; CONVENCOES secao 5 (handler fino, serviço sem next)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "limites: ip+agente 10/min, ip 30/min (criarLimitador, relogio injetavel), 60 mensagens por conversa, teto diario no banco; 429 com Retry-After (exceto conversa cheia); mensagens amigaveis fixas; o limitador do chat e injetavel para o teste"
    alternativa_descartada: "limite unico generico"
    motivo: "(HIPOTESE) PR-57; PR-16; CONVENCOES 'Limite de uso' (verificarLimite, relogio injetavel)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "traducao SSE publica: fluxoDeEventos ganha parametro opcional para mapear o erro; o publico usa mensagemParaVisitante e codigo 'indisponivel'; o evento fontes publico e reduzido (titulo, citada, numeros, sem trechoTexto nem id real) no mesmo formato do painel"
    alternativa_descartada: "criar outro tradutor de SSE"
    motivo: "(HIPOTESE) PR-56; PR-42 (duas saidas de mensagem); base/api-publica-e-limites.md (fluxoDeEventos usa mensagemParaOperador)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "rotas publicas: GET config, OPTIONS config, POST conversar, GET conversa (cabecalho X-Visitante-Id) em src/app/api/publico/agentes/[id]/; dynamic force-dynamic; Cache-Control no-store; nenhum cookie lido"
    alternativa_descartada: "parametro visitanteId na URL"
    motivo: "(HIPOTESE) PR-56; CONVENCOES secao 5 (handler fino)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "src/proxy.ts com matcher /embed/:path*, le dominiosDoEmbed e define a Content-Security-Policy frame-ancestors; next.config.ts troca a regra unica por duas (seguranca comum em tudo, X-Frame-Options DENY em tudo menos /embed); provado por teste de producao para lista vazia, com dominios, agente inativo e inexistente; se o Prisma nao rodar no proxy, registra desvio e usa outro ponto"
    alternativa_descartada: "route handler que devolve HTML; CSP estatica"
    motivo: "(HIPOTESE) PR-59; base/embed-e-csp.md lacunas 1 e 2; proxy.md do Next 16 (runtime Node)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "rota /widget.js em src/app/widget.js/route.ts, force-static, le src/widget/widget.js na construcao; cabecalhos do PR-60 dentro da resposta e provados em producao; cores literais do script registradas como excecao em CONVENCOES"
    alternativa_descartada: "minificador ou bundler novo; ler o arquivo a cada requisicao"
    motivo: "(HIPOTESE) PR-60; base/widget-e-script.md lacuna 3; pedido da feature (sem minificador novo)"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "happy-dom como devDependencia de versao fixa, por arquivo de teste com '// @vitest-environment happy-dom'; npm audit --audit-level=high deve seguir em 0; se happy-dom nao suportar Shadow DOM ou postMessage com origin o suficiente, usar jsdom e registrar"
    alternativa_descartada: "jsdom como primeira escolha; ambiente global no vitest.config"
    motivo: "(HIPOTESE) briefing item 3; base/widget-e-script.md lacuna 4; CONVENCOES secao 3 (ambiente node)"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "pagina /embed/[id] em src/app/embed/[id]/page.tsx com loading proprio opcional; componente cliente ChatEmbutido em src/componentes, logica pura em modulos *-logica.ts (visitante, cor, estado) testados sem navegador; reuso de lerEventos, reduzir/estadoInicial, TextoDoModelo e FontesDaResposta simples; chips so com titulo; previa por ?previa=1 com sessao, endpoint do painel e postMessage de mesma origem"
    alternativa_descartada: "duplicar o renderizador de texto"
    motivo: "(HIPOTESE) PR-61; CONVENCOES secao 5 ('Texto de origem nao confiavel', 'Logica de tela sem navegador')"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "contraste da cor do agente em src/lib/cor.ts (hex para rgb, luminancia relativa, razaoDeContraste, corDoTextoSobre, avisoDeBaixoContraste); a pagina escolhe o texto claro ou escuro dos tokens novos --fg-sobre-cor-clara e --fg-sobre-cor-escura; as amostras e o padrao de cor nascem de trios RGB para nao haver cor literal em src"
    alternativa_descartada: "escrever hex nas amostras"
    motivo: "(HIPOTESE) PR-61; tests/tokens.test.ts (proibe hex em .ts e .tsx de src); PR-23"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "aba Publicar: 'Publicar' em abas-do-agente.ts e subrota src/app/(sistema)/agentes/[id]/publicar/ (page, loading, erro pelo error.tsx do sistema); formulario com Server Action salvarChat em src/app/acoes.ts; bloco de codigo com Copiar e fallback de navegator.clipboard; avisos do PR-62; previa em iframe"
    alternativa_descartada: "pagina de canais generica"
    motivo: "(HIPOTESE) PR-62; CONVENCOES secao 5 ('Aba da pagina de um agente', 'Acao de formulario')"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "ambiente.appUrlPublica (opcional, sem padrao) acrescentada em src/lib/ambiente.ts e documentada no .env.example; a origem do snippet e APP_URL ou a da requisicao"
    alternativa_descartada: "reusar appUrl com padrao localhost"
    motivo: "(HIPOTESE) PR-62; base/configuracao-e-painel.md (appUrl ja tem padrao)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "seed: o agente de exemplo ganha configuracao de chat publicada (ativo, titulo, sugestoes, aviso de privacidade, dominios vazios) com upsert idempotente e update vazio"
    alternativa_descartada: "nao publicar na seed"
    motivo: "(HIPOTESE) PR-25; pedido da feature item 5; prisma/seed.ts (update: {})"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "o teto diario conta Mensagem user do canal widget do agente desde 00:00 do fuso do servidor; o relatorio informa a FT-09 (identificadorExterno = visitanteId, canal widget) e a FT-10 (aviso de privacidade em configuracao_do_chat.avisoDePrivacidade)"
    alternativa_descartada: "contar respostas"
    motivo: "(HIPOTESE) PR-57; PR-55; pedido do relatorio final"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "verificacao ponta a ponta no navegador real com Chrome via ToolSearch, app de producao, OpenRouter falso com tests/apoio/servir-falso.ts e pagina estatica em outra porta; se a ferramenta faltar, registrar o que ficou sem verificar"
    alternativa_descartada: "so testes automatizados"
    motivo: "(HIPOTESE) pedido da feature item 7; PEND-07; CONVENCOES (testes nunca chamam a rede real)"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "suite: verde so quando a suite inteira rodou na task; parcial com o subconjunto declarado quando nao; convencao declarada aqui no inicio e repetida no ENTREGA.md"
    alternativa_descartada: "reescrever o registro depois"
    motivo: "(HIPOTESE) instrucao do coordenador do laço (licoes do laco)"
    status: fechada
    bloqueante: false
---

# Decisões — chat-embutido

> Respondidas por buildx (modo autônomo, sem entrevista). Cada decisão cita a fonte: PROJETO.md, PR-NN, regra do CONVENCOES.md ou premissa nova criada nesta F2 (PR-55 a PR-62).

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo

Confirmados pelo PROJETO.md (modo autônomo total) e pelo PR-35.

## Decisões

```
D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PR-35 e PROJETO.md (Modo escolhido)
D-01 | tabela 1:1 configuracao_do_chat (modelo ConfiguracaoDoChat, agenteId como chave, cascata) por migration que so acrescenta; linha ausente vale os padroes; servico src/servicos/chat-publico-config.ts com obterConfiguracao(autor, agenteId), salvarConfiguracao(autor, agenteId, entrada) em zod, configuracaoPublica(agenteId) e dominiosDoEmbed(agenteId) | colunas novas em Agente | (HIPOTESE) PR-55; briefing item 1; base/configuracao-e-painel.md (migrations so acrescentam, tests/migracoes.test.ts)
D-02 | validacoes da configuracao: titulo ate 60, cor #rrggbb (expande #rgb, minusculas), posicao direita|esquerda, avatar iniciais|chat|robo|estrela|fone, aviso ate 300 e URL http/https ate 500, ate 20 dominios, limiteDiario 1 a 100000 (padrao 500), ate 3 sugestoes de 1 a 80 | aceitar texto livre e validar so na tela | (HIPOTESE) PR-55; PR-13 (toda entrada validada no servidor); CONVENCOES secao 6 (zod na aplicacao)
D-03 | regras de dominio em modulo puro src/lib/dominios-permitidos.ts: normalizarDominio, normalizarLista, origemPermitida(origem, lista), cabecalhoFrameAncestors(lista); entrada sem porta vale so a porta padrao, curinga so no inicio, lista vazia libera tudo | conferir so por sufixo de texto | (HIPOTESE) PR-58; semantica de host-source do CSP; base/embed-e-csp.md; o modulo e compartilhado pelo servico, pelo CORS e pelo proxy
D-04 | a restricao de dominio e garantida por frame-ancestors e pelo CORS do config; o POST conversar recusa com 403 Origin de navegador que nao seja a da plataforma (Host ou APP_URL); a decisao vira a premissa PR-58 e cada ponto e testado | conferir Origin do POST como controle de dominio | (HIPOTESE) PR-58 (premissa nova criada na F2); nota do pedido sobre PR-17
D-05 | servico src/servicos/chat-publico.ts (camada de aplicacao, sem next/*): validarVisitanteId, exigirAgenteAtivo (404 igual para inexistente e inativo), exigirLimites({ip, agenteId, conversaId, limitador}), teto diario contado no banco, abrirConversaPublica que reusa responderMensagem com canal widget, retomarConversaDoVisitante (50 ultimas) e reducao do evento fontes; o handler HTTP so traduz | logica no handler | (HIPOTESE) PR-56, PR-57; CONVENCOES secao 5 (handler fino, serviço sem next)
D-06 | limites: ip+agente 10/min, ip 30/min (criarLimitador, relogio injetavel), 60 mensagens por conversa, teto diario no banco; 429 com Retry-After (exceto conversa cheia); mensagens amigaveis fixas; o limitador do chat e injetavel para o teste | limite unico generico | (HIPOTESE) PR-57; PR-16; CONVENCOES 'Limite de uso' (verificarLimite, relogio injetavel)
D-07 | traducao SSE publica: fluxoDeEventos ganha parametro opcional para mapear o erro; o publico usa mensagemParaVisitante e codigo 'indisponivel'; o evento fontes publico e reduzido (titulo, citada, numeros, sem trechoTexto nem id real) no mesmo formato do painel | criar outro tradutor de SSE | (HIPOTESE) PR-56; PR-42 (duas saidas de mensagem); base/api-publica-e-limites.md (fluxoDeEventos usa mensagemParaOperador)
D-08 | rotas publicas: GET config, OPTIONS config, POST conversar, GET conversa (cabecalho X-Visitante-Id) em src/app/api/publico/agentes/[id]/; dynamic force-dynamic; Cache-Control no-store; nenhum cookie lido | parametro visitanteId na URL | (HIPOTESE) PR-56; CONVENCOES secao 5 (handler fino)
D-09 | src/proxy.ts com matcher /embed/:path*, le dominiosDoEmbed e define a Content-Security-Policy frame-ancestors; next.config.ts troca a regra unica por duas (seguranca comum em tudo, X-Frame-Options DENY em tudo menos /embed); provado por teste de producao para lista vazia, com dominios, agente inativo e inexistente; se o Prisma nao rodar no proxy, registra desvio e usa outro ponto | route handler que devolve HTML; CSP estatica | (HIPOTESE) PR-59; base/embed-e-csp.md lacunas 1 e 2; proxy.md do Next 16 (runtime Node)
D-10 | rota /widget.js em src/app/widget.js/route.ts, force-static, le src/widget/widget.js na construcao; cabecalhos do PR-60 dentro da resposta e provados em producao; cores literais do script registradas como excecao em CONVENCOES | minificador ou bundler novo; ler o arquivo a cada requisicao | (HIPOTESE) PR-60; base/widget-e-script.md lacuna 3; pedido da feature (sem minificador novo)
D-11 | happy-dom como devDependencia de versao fixa, por arquivo de teste com '// @vitest-environment happy-dom'; npm audit --audit-level=high deve seguir em 0; se happy-dom nao suportar Shadow DOM ou postMessage com origin o suficiente, usar jsdom e registrar | jsdom como primeira escolha; ambiente global no vitest.config | (HIPOTESE) briefing item 3; base/widget-e-script.md lacuna 4; CONVENCOES secao 3 (ambiente node)
D-12 | pagina /embed/[id] em src/app/embed/[id]/page.tsx com loading proprio opcional; componente cliente ChatEmbutido em src/componentes, logica pura em modulos *-logica.ts (visitante, cor, estado) testados sem navegador; reuso de lerEventos, reduzir/estadoInicial, TextoDoModelo e FontesDaResposta simples; chips so com titulo; previa por ?previa=1 com sessao, endpoint do painel e postMessage de mesma origem | duplicar o renderizador de texto | (HIPOTESE) PR-61; CONVENCOES secao 5 ('Texto de origem nao confiavel', 'Logica de tela sem navegador')
D-13 | contraste da cor do agente em src/lib/cor.ts (hex para rgb, luminancia relativa, razaoDeContraste, corDoTextoSobre, avisoDeBaixoContraste); a pagina escolhe o texto claro ou escuro dos tokens novos --fg-sobre-cor-clara e --fg-sobre-cor-escura; as amostras e o padrao de cor nascem de trios RGB para nao haver cor literal em src | escrever hex nas amostras | (HIPOTESE) PR-61; tests/tokens.test.ts (proibe hex em .ts e .tsx de src); PR-23
D-14 | aba Publicar: 'Publicar' em abas-do-agente.ts e subrota src/app/(sistema)/agentes/[id]/publicar/ (page, loading, erro pelo error.tsx do sistema); formulario com Server Action salvarChat em src/app/acoes.ts; bloco de codigo com Copiar e fallback de navegator.clipboard; avisos do PR-62; previa em iframe | pagina de canais generica | (HIPOTESE) PR-62; CONVENCOES secao 5 ('Aba da pagina de um agente', 'Acao de formulario')
D-15 | ambiente.appUrlPublica (opcional, sem padrao) acrescentada em src/lib/ambiente.ts e documentada no .env.example; a origem do snippet e APP_URL ou a da requisicao | reusar appUrl com padrao localhost | (HIPOTESE) PR-62; base/configuracao-e-painel.md (appUrl ja tem padrao)
D-16 | seed: o agente de exemplo ganha configuracao de chat publicada (ativo, titulo, sugestoes, aviso de privacidade, dominios vazios) com upsert idempotente e update vazio | nao publicar na seed | (HIPOTESE) PR-25; pedido da feature item 5; prisma/seed.ts (update: {})
D-17 | o teto diario conta Mensagem user do canal widget do agente desde 00:00 do fuso do servidor; o relatorio informa a FT-09 (identificadorExterno = visitanteId, canal widget) e a FT-10 (aviso de privacidade em configuracao_do_chat.avisoDePrivacidade) | contar respostas | (HIPOTESE) PR-57; PR-55; pedido do relatorio final
D-18 | verificacao ponta a ponta no navegador real com Chrome via ToolSearch, app de producao, OpenRouter falso com tests/apoio/servir-falso.ts e pagina estatica em outra porta; se a ferramenta faltar, registrar o que ficou sem verificar | so testes automatizados | (HIPOTESE) pedido da feature item 7; PEND-07; CONVENCOES (testes nunca chamam a rede real)
D-19 | suite: verde so quando a suite inteira rodou na task; parcial com o subconjunto declarado quando nao; convencao declarada aqui no inicio e repetida no ENTREGA.md | reescrever o registro depois | (HIPOTESE) instrucao do coordenador do laço (licoes do laco)
```

## Premissas novas desta F2

PR-55 configuração do chat; PR-56 contrato da API pública; PR-57 limites e teto diário; PR-58 domínios, CORS e `frame-ancestors`; PR-59 cabeçalhos do iframe por `proxy.ts`; PR-60 script e protocolo; PR-61 página do iframe; PR-62 código para incorporar e `APP_URL`.

## Lacunas da F1 tratadas

1 a 4 e 6: provadas por teste nas tasks de cabeçalhos, script e verificação (D-09, D-10, D-11, D-18); 5: limite conhecido, vira aviso na tela Publicar (PR-57, PR-62).

## Pendências

Nenhuma pendência. Nenhuma regra de negócio ficou sem resposta nos arquivos do projeto.
