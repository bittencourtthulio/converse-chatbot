---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
raio: null
olho_obrigatorio: 15
leitura_rapida: 29
dispensavel: 64
atualizado_em: 2026-10-01
---

# Onde gastar atenção — historico-de-conversas

Branch `feat/historico-de-conversas` -> `feat/conhecimento-em-video`. Data: 2026-10-01.

**108 arquivos — 15 olho obrigatório, 29 leitura rápida, 64 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação. Tamanho de diff não é critério.

Sem modo legado e sem raio calculado, e sem agente `revisor-diff` neste harness: a classificação veio do tipo de arquivo e da evidência das tasks, aplicada pelo executor, que escreveu o código e não é imparcial. Leia a faixa OLHO OBRIGATÓRIO sem confiar na justificativa. O que decide **quem lê e apaga o quê, e como o texto de terceiros chega à tela** está em OLHO OBRIGATÓRIO: o serviço de histórico (SQL parametrizado, `LIKE` escapado, rótulo mascarado, exclusão em transação e o ponto de extensão da auditoria), os três handlers (sessão no servidor, 404 e 422, exportação sem dado pessoal no nome), o layout que decide o 404, a transcrição (conteúdo de visitante, sem HTML), as confirmações de apagar (efeito irreversível) e a agregação do painel (janelas, fuso, a chave que nunca vai à página). Não há migration nem mudança de esquema nesta feature. Componentes puros e arquivos novos testados em LEITURA RÁPIDA, assim como os arquivos já existentes que só receberam acréscimo coberto (menu, tokens, CSS, seed) e a documentação; atenção a `tests/rotas.test.ts` e `tests/menu.test.ts`, que **mudam asserções existentes** de propósito. Testes novos e artefatos do método em DISPENSÁVEL; os artefatos do método não casam com D1 a D3 ao pé da letra: D3 foi estendido a documentos produzidos pelo próprio método, escolha do executor, como na FT-08. O memox está instalado e foi consultado em cada arquivo do diff: nenhum tem regressão, reprovação de QA, zona de risco nem dívida registradas, então O9 não subiu faixa nenhuma. O que a revisão humana não substitui: celular real e leitor de tela (PEND-07), o `widget.js` num site de terceiro (não repetido aqui), a exclusão por visitante ou chat, a retenção e a auditoria (FT-10) e a leitura de uma lista com volume alto (a busca por texto não tem índice, lacuna 22 e 24). Os últimos arquivos (`ATENCAO.md`, `PR.md`, `QA-PACOTE.md`) entram na conta porque são criados logo depois desta classificação.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `src/app/(sistema)/(painel)/page.tsx` | A | +60/-0 | O4 papel: o link da chave do OpenRouter só vai ao admin e a chave nunca chega à página; também substitui a página inicial (`(sistema)/page.tsx`) e mantém o atalho Cadastrar usuário |
| `src/app/(sistema)/conversas/(lista)/page.tsx` | A | +64/-0 | O4 dado pessoal e entrada de usuário: os filtros vêm da URL (`searchParams`), a lista mostra rótulo e prévia de conversas, e o 422 do serviço vira aviso; redireciona para a última página quando a atual esvaziou |
| `src/app/(sistema)/conversas/[id]/carregar-conversa.ts` | A | +17/-0 | O4 acesso a dado pessoal: mapeia o 404 do serviço para `notFound()` e lê a conversa uma vez por requisição (`cache`) |
| `src/app/(sistema)/conversas/[id]/layout.tsx` | A | +19/-0 | O4 autorização: confere sessão e existência da conversa acima do `loading.tsx` para o 404 ser de verdade; sem ele o id inexistente sairia 200 |
| `src/app/(sistema)/conversas/[id]/page.tsx` | A | +62/-0 | O4 dado pessoal: mostra a conversa inteira (metadados, transcrição, exportar, apagar); a conversa vai ao cliente como texto, sem o identificador externo |
| `src/app/api/conversas/[id]/exportar/route.ts` | A | +25/-0 | O5 contrato público novo (download `.txt`) e O4 dado pessoal que sai do sistema: nome do arquivo só com o id interno, `Content-Disposition`, `no-store`, `nosniff`, rótulo mascarado no texto |
| `src/app/api/conversas/[id]/route.ts` | A | +17/-0 | O5 contrato público novo (`DELETE /api/conversas/[id]`) e O4 sessão conferida no servidor; efeito irreversível (apaga conversa e mensagens) |
| `src/app/api/conversas/apagar/route.ts` | A | +21/-0 | O5 contrato público novo (`POST /api/conversas/apagar`, `{ids}`) e O4 sessão e limite de 50 no servidor; efeito irreversível em lote |
| `src/app/api/conversas/resposta.ts` | A | +25/-0 | O4 autenticação: `exigirSessao` (401 em JSON) e o erro sem pilha com correlação, compartilhados pelos três handlers |
| `src/componentes/AcoesDaConversa.tsx` | A | +97/-0 | Efeito irreversível: confirmação de apagar uma conversa e navegação de volta por `window.location.href` (com `eslint-disable` justificado); coberto em `happy-dom` |
| `src/componentes/ListaComSelecao.tsx` | A | +119/-0 | Efeito irreversível: a confirmação de apagar em lote é a única barreira antes da exclusão definitiva; sem confirmação na tela (sem `window.confirm`), foco devolvido ao cancelar; coberto por `tests/conversas-lote-ui.test.tsx` em `happy-dom`, mas sem navegador real além da verificação visual |
| `src/componentes/TranscricaoDaConversa.tsx` | A | +88/-0 | O4 conteúdo de terceiros não confiável (XSS): renderiza o texto do visitante e a resposta do modelo; só `TextoDoModelo` e texto de React, nunca `dangerouslySetInnerHTML` (provado com `<script>`, `<img onerror>` e `javascript:` em `tests/conversas-detalhe-ui.test.tsx`) |
| `src/servicos/historico-logica.ts` | A | +154/-0 | O4 mascaramento de dado pessoal (`rotuloDoInterlocutor`, PR-78), escape do `LIKE` (`escaparLike`, injeção de curinga) e validação de entrada dos filtros e do lote; um erro aqui vaza o identificador do visitante ou deixa o texto virar curinga |
| `src/servicos/historico.ts` | A | +301/-0 | O4 dado pessoal: lê o texto de conversas de visitantes e do Telegram, monta o rótulo mascarado e apaga em lote (efeito irreversível: a exclusão não tem reversão); SQL cru parametrizado com `LIKE` sobre o conteúdo (`condicoes`, `universo`), transação de exclusão e ponto de extensão da auditoria. Provado em `tests/historico-*.test.ts`, mas é o arquivo onde o erro custa mais |
| `src/servicos/painel.ts` | A | +185/-0 | O2 regra de cálculo: janelas de 7 e 14 dias, dia local por `strftime(..., 'localtime')` sobre `DateTime` guardado como texto ISO em UTC, dias vazios em zero, e O4 `primeirosPassos` que nunca devolve a chave do OpenRouter (só booleanos); SQL cru parametrizado |

## LEITURA RÁPIDA — conferir intenção, não implementação

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `README.md` | M | +9/-0 | L2 documentação: seção nova "Conversas e painel inicial"; leia por intenção (o que o usuário vê e o que fica para a FT-10) |
| `docs/projeto/MAPA.md` | M | +7/-4 | L2 estado do projeto: FT-09 entregue, contadores e painel |
| `docs/projeto/PREMISSAS.md` | M | +109/-5 | L2 decisões tomadas em nome do humano: PR-78 a PR-85 (leia o campo "O que invalida") e PR-18, PR-25 e PR-27 passam a realizadas também na FT-09 |
| `docs/projeto/PROJETO.md` | M | +1/-1 | L2 contador `features_entregues` 9 |
| `docs/projeto/RECURSAO.md` | M | +2/-2 | L2 acrescenta a FT-09 à PEND-07 (verificação em celular real), sem pendência nova |
| `docs/stack/CONVENCOES.md` | M | +9/-0 | L2 documentação das convenções novas com `arquivo:linha` (conferidas por `tests/projeto.test.ts`) |
| `docs/stack/LACUNAS.md` | M | +2/-0 | L2 documentação: lacunas 22 a 27 |
| `prisma/seed.ts` | M | +98/-0 | L2 acrescenta duas conversas fictícias com id fixo, só se não existem; o guarda de produção não foi tocado e `tests/seed-conversas.test.ts` prova a recusa e a idempotência; sem dado real |
| `src/app/(sistema)/(painel)/loading.tsx` | A | +6/-0 | L3 arquivo novo; esqueleto de carregamento do painel |
| `src/app/(sistema)/conversas/(lista)/loading.tsx` | A | +9/-0 | L3 arquivo novo; esqueleto de carregamento |
| `src/app/(sistema)/conversas/[id]/loading.tsx` | A | +6/-0 | L3 arquivo novo; esqueleto de carregamento |
| `src/app/(sistema)/conversas/[id]/not-found.tsx` | A | +20/-0 | L3 arquivo novo; estado de conversa inexistente, 404 provado em `tests/conversas-detalhe-rota.test.ts` |
| `src/componentes/BadgeDeCanal.tsx` | A | +9/-0 | L3 arquivo novo; texto do canal e classe por token |
| `src/componentes/CartoesDoPainel.tsx` | A | +54/-0 | L3 arquivo novo; números vindos de `painel.ts` |
| `src/componentes/ConversasRecentes.tsx` | A | +42/-0 | L3 arquivo novo; prévia de conversa só como texto de React, provado em `tests/painel-ui.test.tsx` |
| `src/componentes/FiltrosDeConversas.tsx` | A | +65/-0 | L3 arquivo novo; formulário GET sem JavaScript; valores vêm da URL e do React |
| `src/componentes/GraficoDeMensagens.tsx` | A | +86/-0 | L3 arquivo novo; SVG acessível e tabela equivalente, `tests/grafico-de-mensagens.test.tsx` |
| `src/componentes/ListaDeConversas.tsx` | A | +189/-0 | L3 arquivo novo com os dois testes verdes; exibe rótulo e prévia (texto de terceiros) só como texto de React, provado com `<script>` em `tests/conversas-lista-ui.test.tsx` |
| `src/componentes/PrimeirosPassos.tsx` | A | +75/-0 | L3 arquivo novo; esconde o link das Integrações do usuário comum (não é controle de acesso: a página das Integrações confere o papel no servidor) |
| `src/componentes/apagar-conversas.ts` | A | +38/-0 | L3 arquivo novo; só monta o `fetch` das exclusões (o `fetch` é injetável); a exclusão em si é decidida no servidor |
| `src/componentes/conversas-logica.ts` | A | +157/-0 | L3 arquivo novo; filtros da URL, links, reducer do lote em módulo puro, `tests/conversas-logica.test.ts` |
| `src/componentes/itens-de-menu.ts` | M | +1/-0 | L2 camada isolada com cobertura existente: acrescenta o item Conversas; `tests/menu.test.ts` lê a lista real |
| `src/componentes/painel-logica.ts` | A | +60/-0 | L3 arquivo novo; escala das barras e descrição em módulo puro, `tests/painel-logica.test.ts` |
| `src/estilos/global.css` | M | +185/-0 | L2 camada isolada: seções novas e delimitadas das conversas e do painel; `tests/conversas-lista-estilos.test.ts` e `tests/grafico-de-mensagens.test.tsx` leem o CSS real e `tests/tokens.test.ts` varre cor literal; o layout visual só foi visto no navegador (`VERIFICACAO-VISUAL.md`) |
| `src/estilos/tokens.css` | M | +40/-0 | L2 camada isolada com cobertura: tokens novos nos três blocos de tema; `tests/tokens-historico.test.ts` e `tests/tokens.test.ts` conferem existência, blocos escuros idênticos e contraste |
| `tests/apoio/contador-de-consultas.ts` | A | +33/-0 | L3 arquivo novo de apoio de teste; conta consultas pelo log do Prisma e é a prova do "sem N+1" |
| `tests/apoio/historico.ts` | A | +83/-0 | L3 arquivo novo de apoio de teste; fixtures de conversa dos três canais |
| `tests/menu.test.ts` | M | +15/-1 | L2 altera uma asserção existente de propósito (o grupo sem título passa a ter Conversas) e acrescenta casos |
| `tests/rotas.test.ts` | M | +16/-3 | L2 altera asserções existentes de propósito (o painel deixa de mostrar "Ainda não há o que mostrar"): confira que a asserção nova é o comportamento pretendido; também acrescenta `/conversas` à lista de rotas protegidas |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/entregas/historico-de-conversas/ENTREGA.md` | A | +27/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/00-AUDITORIA.md` | A | +20/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/00-BLOQUEIOS.md` | A | +14/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/00-DECISOES.md` | A | +147/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/BRIEFING-BUILDX.md` | A | +45/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/FECHAMENTO.md` | A | +32/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/ORQUESTRADOR.md` | A | +102/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/RELATORIO-FEATURE.md` | A | +54/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/VERIFICACAO-VISUAL.md` | A | +38/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/base/00-INDICE.md` | A | +37/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/base/00-LACUNAS.md` | A | +8/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/base/canais-e-rotulos.md` | A | +30/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/base/conversas-e-modelo.md` | A | +33/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/base/painel-e-agregacao.md` | A | +30/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/base/seed-testes-e-ci.md` | A | +31/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/base/telas-menu-e-componentes.md` | A | +31/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-01/fases.md` | A | +81/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-01/sprint.md` | A | +39/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-01/tasks.md` | A | +144/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-02/fases.md` | A | +84/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-02/sprint.md` | A | +39/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-02/tasks.md` | A | +176/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-03/fases.md` | A | +78/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-03/sprint.md` | A | +39/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-03/tasks.md` | A | +112/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-04/fases.md` | A | +81/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-04/sprint.md` | A | +39/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-04/tasks.md` | A | +144/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-05/fases.md` | A | +81/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-05/sprint.md` | A | +39/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-05/tasks.md` | A | +144/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-06/fases.md` | A | +81/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-06/sprint.md` | A | +39/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/historico-de-conversas/sprint-06/tasks.md` | A | +144/-0 | D3 (estendido): artefato do método da própria feature, não é código |
| `src/app/(sistema)/page.tsx` | D | +0/-33 | D2 movimentação coberta por teste verde: a página inicial foi movida para `(sistema)/(painel)/page.tsx` (o conteúdo novo está em OLHO OBRIGATÓRIO) e `tests/rotas.test.ts` cobre a rota `/` |
| `tests/contador-de-consultas.test.ts` | A | +53/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-apagar-rota.test.ts` | A | +100/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-detalhe-rota.test.ts` | A | +93/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-detalhe-ui.test.tsx` | A | +172/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-exportar-rota.test.ts` | A | +88/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-lista-estilos.test.ts` | A | +58/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-lista-ui.test.tsx` | A | +213/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-logica.test.ts` | A | +109/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/conversas-lote-ui.test.tsx` | A | +146/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/grafico-de-mensagens.test.tsx` | A | +55/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/historico-apagar.test.ts` | A | +125/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/historico-apoio.test.ts` | A | +71/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/historico-consultas.test.ts` | A | +55/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/historico-listar.test.ts` | A | +126/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/historico-logica.test.ts` | A | +113/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/historico-obter.test.ts` | A | +86/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/historico-texto.test.ts` | A | +98/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/painel-logica.test.ts` | A | +59/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/painel-numeros.test.ts` | A | +101/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/painel-passos.test.ts` | A | +114/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/painel-serie.test.ts` | A | +100/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/painel-ui.test.tsx` | A | +163/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/projeto.test.ts` | M | +67/-0 | D1 só acrescenta casos (convenções, lacunas e README da FT-09); nenhuma asserção existente mudou |
| `tests/seed-conversas.test.ts` | A | +109/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/sqlite-formatos.test.ts` | A | +97/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `tests/tokens-historico.test.ts` | A | +80/-0 | D1 arquivo de teste novo, só casos novos; a suíte inteira passa (2251) |
| `docs/entregas/historico-de-conversas/ATENCAO.md` | A | novo | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/entregas/historico-de-conversas/PR.md` | A | novo | D3 (estendido): artefato do método da própria feature, não é código |
| `docs/entregas/historico-de-conversas/QA-PACOTE.md` | A | novo | D3 (estendido): artefato do método da própria feature, não é código |

## Fontes consultadas

- `git diff --name-status` e `--numstat` contra `feat/conhecimento-em-video` (três pontos), mais os três arquivos criados em seguida.
- `docs/historico-de-conversas/sprint-0*/tasks.md`: a task e os dois testes de cada arquivo.
- `docs/stack/CONVENCOES.md`: o que é gerado (nada neste diff) e as regras de camada.
- memox (`.claude/skills/memox/assets/memox.py arquivo`): consultado em cada arquivo do diff; sem regressão, reprovação de QA, zona de risco nem dívida.

## Fontes ausentes

- `docs/legado/PERFIL.md` (zonas de risco), raio de impacto, testes de caracterização e plano de reversão: não existem (projeto sem modo legado). Nenhum arquivo foi avaliado contra zona de risco ou raio; o efeito irreversível da exclusão de conversa entrou por julgamento (sem plano de reversão registrado) e por isso está em OLHO OBRIGATÓRIO.
- Relatório de cobertura: o projeto não tem provedor de cobertura (lacuna 2); O6 foi avaliado pelas tasks e pelos testes que exercem cada arquivo.
- Agente `revisor-diff`: não existe neste harness.
