---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-10-01
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: "densidade mvp ou profundo"
    motivo: "respondido por buildx; PROJETO.md (modo autonomo total) e escopo do briefing"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "servico unico src/servicos/historico.ts (aplicacao) com listarConversas, obterConversa, apagarConversa, apagarConversas, aoApagarConversa e exportarConversaTexto; nao reaproveita conversas.listar (que exige agente e canal); conversas.ts nao muda"
    alternativa_descartada: "estender conversas.listar com filtros opcionais"
    motivo: "(HIPOTESE) CONVENCOES secao 5 (caso de uso em src/servicos/<assunto>.ts); base/conversas-e-modelo.md (listar exige agente e canal)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "listagem sem N+1: uma consulta agregada por $queryRaw parametrizado devolve pagina, contagem de mensagens, ultima atividade e previa da ultima mensagem; o total vem de uma segunda consulta; o teste prova o numero de consultas com um contador sobre o cliente"
    alternativa_descartada: "findMany com include e contagem por conversa"
    motivo: "(HIPOTESE) CONVENCOES secao Consulta SQL (queryRaw parametrizado); briefing item 1; lacuna 3 da base: contador sera construido no teste"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "filtro por texto: LIKE com ESCAPE parametrizado sobre Mensagem.conteudo, texto ate 200 caracteres, ate 200 conversas casadas, sem FTS novo"
    alternativa_descartada: "FTS5 para conversas; busca no cliente"
    motivo: "PR-79 (nova); PR-30 e CONVENCOES (texto do usuario nunca concatenado em SQL)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "rotulo do interlocutor mascarado (widget: Visitante + 6 primeiros do visitanteId; telegram: titulo; painel: nome do usuario ou Usuario removido)"
    alternativa_descartada: "mostrar identificadorExterno completo"
    motivo: "PR-78 (nova); PR-18"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "apagar em lote com maximo de 50 ids, transacao unica, so o que existe, contagem devolvida, ouvinte aoApagarConversa sem conteudo nem identificador externo; confirmacao na propria tela"
    alternativa_descartada: "window.confirm; sem limite de lote"
    motivo: "PR-80 (nova); PR-18; padrao aoAlterarCanal em canal-telegram.ts (CONVENCOES secao 5)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "contrato HTTP: DELETE /api/conversas/[id], POST /api/conversas/apagar, GET /api/conversas/[id]/exportar (text/plain, attachment, nome conversa-<id>.txt); sessao por usuarioAtual (401), 404 e 422; telas /conversas e /conversas/[id] como paginas do servidor com filtros em searchParams e apagar por acao no cliente chamando os handlers"
    alternativa_descartada: "somente acoes de servidor"
    motivo: "PR-83 (nova); CONVENCOES secao 5 (Handler HTTP fino)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "a lista usa filtros por searchParams (agente, canal, texto, de, ate, pagina) validados por zod no servico; periodo no fuso do servidor; tabela em tela larga e cartoes abaixo de 768px por CSS"
    alternativa_descartada: "filtros no estado do cliente"
    motivo: "(HIPOTESE) CONVENCOES secao Interface (375px, 44px, tokens); padrao das paginas de agentes"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "detalhe reusa TextoDoModelo para o conteudo (nunca dangerouslySetInnerHTML) e FontesDaResposta para as fontes, com o estado de abertura em componente cliente pequeno; teste com script e img onerror"
    alternativa_descartada: "renderizador novo"
    motivo: "(HIPOTESE) CONVENCOES secao 5 (Texto de origem nao confiavel); base/telas-menu-e-componentes.md"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "painel: servico src/servicos/painel.ts com agregacao SQL (queryRaw), fuso do servidor, dias vazios com zero, injecao do instante para teste; grafico SVG com role=img, rotulo e tabela equivalente; lista de primeiros passos que se oculta sozinha; titulo e subtitulo do painel preservados"
    alternativa_descartada: "grafico por biblioteca; fuso do usuario"
    motivo: "PR-81 e PR-82 (novas); PR-57 (fuso do teto diario)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "tokens novos de canal e de serie do grafico em tokens.css nos tres blocos, contraste conferido por tokens.test.ts; canais tambem por texto"
    alternativa_descartada: "cores literais nos componentes"
    motivo: "PR-85 (nova); lacuna 4 da base; PR-23"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "formato do DateTime no SQLite sera provado por teste antes do strftime; a agregacao e escrita sobre o formato descoberto"
    alternativa_descartada: "assumir inteiro ou ISO sem prova"
    motivo: "(HIPOTESE) lacuna 1 da base; regra de nada de invencao"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "seed ganha duas conversas ficticias de id fixo (painel e widget) com fontes que citam a fonte de exemplo, idempotente, sem dado real"
    alternativa_descartada: "conversas aleatorias"
    motivo: "PR-84 (nova); PR-25"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "item de menu Conversas no grupo sem titulo, logo abaixo de Agentes, icone conversa; migalhas herdam o titulo para /conversas/<id>; testes de menu e do painel (rotas.test.ts) atualizados e declarados"
    alternativa_descartada: "rota fora do menu"
    motivo: "CONVENCOES secao 5 (Item de menu: lista unica); briefing item 3"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "premissas novas PR-78 a PR-85 e conversao das lacunas em CONVENCOES e LACUNAS com arquivo:linha na task de fechamento; nenhuma variavel de ambiente nova, nenhuma dependencia nova"
    alternativa_descartada: "biblioteca de grafico ou de paginacao"
    motivo: "(HIPOTESE) CONVENCOES secao Configuracao (so ambiente.ts); PR-26 (dependencias so se necessarias)"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "definicao de pronto: o usuario le conversas dos tres canais, filtra por agente e canal, ve as fontes de cada resposta, apaga uma e um lote, exporta em .txt e ve o painel com numeros e grafico, nos dois temas e a 375px"
    alternativa_descartada: "entrega so do servico"
    motivo: "PROJETO.md (criterios de aceite de negocio) e entrega da FT-09 no MAPA.md"
    status: fechada
    bloqueante: false
---

# Decisões — historico-de-conversas

> Respondido por buildx (modo autônomo total), nos quatro degraus: PROJETO.md, PREMISSAS.md, CONVENCOES.md e premissa nova (PR-78 a PR-85, origem f2_autonoma, etapa b4). Nenhum item é regra de negócio sem resposta nos arquivos; nenhum bloqueio.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo

## Decisões

```
D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PROJETO.md (modo autonomo total) e escopo do briefing
D-01 | servico unico src/servicos/historico.ts (aplicacao) com listarConversas, obterConversa, apagarConversa, apagarConversas, aoApagarConversa e exportarConversaTexto; nao reaproveita conversas.listar (que exige agente e canal); conversas.ts nao muda | estender conversas.listar com filtros opcionais | (HIPOTESE) CONVENCOES secao 5 (caso de uso em src/servicos/<assunto>.ts); base/conversas-e-modelo.md (listar exige agente e canal)
D-02 | listagem sem N+1: uma consulta agregada por $queryRaw parametrizado devolve pagina, contagem de mensagens, ultima atividade e previa da ultima mensagem; o total vem de uma segunda consulta; o teste prova o numero de consultas com um contador sobre o cliente | findMany com include e contagem por conversa | (HIPOTESE) CONVENCOES secao Consulta SQL (queryRaw parametrizado); briefing item 1; lacuna 3 da base: contador sera construido no teste
D-03 | filtro por texto: LIKE com ESCAPE parametrizado sobre Mensagem.conteudo, texto ate 200 caracteres, ate 200 conversas casadas, sem FTS novo | FTS5 para conversas; busca no cliente | PR-79 (nova); PR-30 e CONVENCOES (texto do usuario nunca concatenado em SQL)
D-04 | rotulo do interlocutor mascarado (widget: Visitante + 6 primeiros do visitanteId; telegram: titulo; painel: nome do usuario ou Usuario removido) | mostrar identificadorExterno completo | PR-78 (nova); PR-18
D-05 | apagar em lote com maximo de 50 ids, transacao unica, so o que existe, contagem devolvida, ouvinte aoApagarConversa sem conteudo nem identificador externo; confirmacao na propria tela | window.confirm; sem limite de lote | PR-80 (nova); PR-18; padrao aoAlterarCanal em canal-telegram.ts (CONVENCOES secao 5)
D-06 | contrato HTTP: DELETE /api/conversas/[id], POST /api/conversas/apagar, GET /api/conversas/[id]/exportar (text/plain, attachment, nome conversa-<id>.txt); sessao por usuarioAtual (401), 404 e 422; telas /conversas e /conversas/[id] como paginas do servidor com filtros em searchParams e apagar por acao no cliente chamando os handlers | somente acoes de servidor | PR-83 (nova); CONVENCOES secao 5 (Handler HTTP fino)
D-07 | a lista usa filtros por searchParams (agente, canal, texto, de, ate, pagina) validados por zod no servico; periodo no fuso do servidor; tabela em tela larga e cartoes abaixo de 768px por CSS | filtros no estado do cliente | (HIPOTESE) CONVENCOES secao Interface (375px, 44px, tokens); padrao das paginas de agentes
D-08 | detalhe reusa TextoDoModelo para o conteudo (nunca dangerouslySetInnerHTML) e FontesDaResposta para as fontes, com o estado de abertura em componente cliente pequeno; teste com script e img onerror | renderizador novo | (HIPOTESE) CONVENCOES secao 5 (Texto de origem nao confiavel); base/telas-menu-e-componentes.md
D-09 | painel: servico src/servicos/painel.ts com agregacao SQL (queryRaw), fuso do servidor, dias vazios com zero, injecao do instante para teste; grafico SVG com role=img, rotulo e tabela equivalente; lista de primeiros passos que se oculta sozinha; titulo e subtitulo do painel preservados | grafico por biblioteca; fuso do usuario | PR-81 e PR-82 (novas); PR-57 (fuso do teto diario)
D-10 | tokens novos de canal e de serie do grafico em tokens.css nos tres blocos, contraste conferido por tokens.test.ts; canais tambem por texto | cores literais nos componentes | PR-85 (nova); lacuna 4 da base; PR-23
D-11 | formato do DateTime no SQLite sera provado por teste antes do strftime; a agregacao e escrita sobre o formato descoberto | assumir inteiro ou ISO sem prova | (HIPOTESE) lacuna 1 da base; regra de nada de invencao
D-12 | seed ganha duas conversas ficticias de id fixo (painel e widget) com fontes que citam a fonte de exemplo, idempotente, sem dado real | conversas aleatorias | PR-84 (nova); PR-25
D-13 | item de menu Conversas no grupo sem titulo, logo abaixo de Agentes, icone conversa; migalhas herdam o titulo para /conversas/<id>; testes de menu e do painel (rotas.test.ts) atualizados e declarados | rota fora do menu | CONVENCOES secao 5 (Item de menu: lista unica); briefing item 3
D-14 | premissas novas PR-78 a PR-85 e conversao das lacunas em CONVENCOES e LACUNAS com arquivo:linha na task de fechamento; nenhuma variavel de ambiente nova, nenhuma dependencia nova | biblioteca de grafico ou de paginacao | (HIPOTESE) CONVENCOES secao Configuracao (so ambiente.ts); PR-26 (dependencias so se necessarias)
D-15 | definicao de pronto: o usuario le conversas dos tres canais, filtra por agente e canal, ve as fontes de cada resposta, apaga uma e um lote, exporta em .txt e ve o painel com numeros e grafico, nos dois temas e a 375px | entrega so do servico | PROJETO.md (criterios de aceite de negocio) e entrega da FT-09 no MAPA.md
```

## Pendências

Nenhuma pendência.

## Resumo das hipóteses

As decisões marcadas (HIPOTESE) são de arquitetura e de tela, derivadas de convenções existentes e da base; as demais citam premissa (PR-78 a PR-85) ou PROJETO.md. As lacunas 1 a 4 da F1 foram tratadas: formato do DateTime (D-11, prova por teste), sensibilidade do LIKE (D-03/PR-79, prova por teste), contador de consultas (D-02) e tokens (D-10).
