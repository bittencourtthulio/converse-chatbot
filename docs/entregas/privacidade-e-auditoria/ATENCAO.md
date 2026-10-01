---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
raio: null
olho_obrigatorio: 32
leitura_rapida: 27
dispensavel: 75
atualizado_em: 2026-10-01
---

# Onde gastar atenção — privacidade-e-auditoria

Branch `feat/privacidade-e-auditoria` -> `feat/historico-de-conversas`. Data: 2026-10-01.

**134 arquivos — 32 olho obrigatório, 27 leitura rápida, 75 dispensável**

A classificação é derivada de evidência registrada, nunca de sensação. Tamanho de diff não é critério.

Sem modo legado e sem raio calculado, e sem agente `revisor-diff` neste harness: a classificação veio do tipo de arquivo e da evidência das tasks, aplicada pelo executor, que escreveu o código e não é imparcial. Leia a faixa OLHO OBRIGATÓRIO sem confiar na justificativa. O que decide **quem apaga o quê, quem fica registrado e como o dado pessoal chega à tela ou sai em arquivo** está em OLHO OBRIGATÓRIO: a trilha de auditoria (única remoção, regra de falha por transação, detalhes sem segredo), a exclusão definitiva de usuário, o expurgo (apaga de vez, corte exato, agendador), o titular (busca, exportação e exclusão sem o identificador completo), a rota nova de exportação e o `DELETE` público do visitante (contratos novos), as ações de servidor e as guardas de admin, a migration (só acrescenta) e as premissas que fixam o prazo de 90 dias e a base legal provisória. Componentes novos e puros, estilos e documentação com teste que confere as citações ficam em LEITURA RÁPIDA; testes novos e os artefatos do método, em DISPENSÁVEL (os artefatos do método não casam com D1 a D3 ao pé da letra: D3 foi estendido a documentos produzidos pelo próprio método, escolha do executor, como na FT-09). O memox está instalado e foi consultado em cada um dos arquivos do diff: nenhum tem regressão, reprovação de QA, zona de risco nem dívida registradas, então O9 não subiu faixa nenhuma. O que a revisão humana não substitui: celular real e leitor de tela (PEND-07), o Telegram real e o `widget.js` em site de terceiro, a confirmação da base legal e dos prazos (PEND-08) e uma lista de auditoria com volume alto. Os três últimos arquivos (`ATENCAO.md`, `PR.md`, `QA-PACOTE.md`) entram na conta porque são criados logo depois desta classificação.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/projeto/PREMISSAS.md` | M | +80/-2 | O2 regra de negócio: PR-86 a PR-91 (retenção de 90 dias, falha de auditoria, exclusão de usuário, titular, aviso e base legal provisória) são decisões tomadas em nome do humano. |
| `prisma/migrations/20261002000000_privacidade_e_auditoria/migration.sql` | A | +25/-0 | O3 migração de banco: só acrescenta (sem DROP, provado por `tests/migracoes.test.ts`); confira o padrão 90 para a linha existente e os dois índices. |
| `prisma/schema.prisma` | M | +31/-2 | O3 migração de banco: tabela `registros_de_auditoria` e três colunas novas em `configuracao_do_workspace`; a relação `Usuario.registros` usa `SET NULL`. |
| `src/app/(sistema)/configuracoes/auditoria/layout.tsx` | A | +15/-0 | O4 autorização: a guarda de admin da tela fica aqui, acima do `loading.tsx` (307 verdadeiro). |
| `src/app/(sistema)/configuracoes/auditoria/page.tsx` | A | +64/-0 | O4: página só de admin com dado pessoal (rótulos "Nome <e-mail>"); filtros vêm da URL e o 422 vira aviso. |
| `src/app/(sistema)/configuracoes/privacidade/layout.tsx` | A | +15/-0 | O4 autorização: a guarda de admin da tela fica aqui, acima do `loading.tsx` (307 verdadeiro). |
| `src/app/(sistema)/configuracoes/privacidade/page.tsx` | A | +31/-0 | O4: página só de admin que monta retenção, aviso, painel e ferramentas do titular; repete a guarda. |
| `src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx` | M | +127/-35 | O4 e efeito irreversível: o botão e a confirmação (digitar o e-mail) da exclusão definitiva. |
| `src/app/acoes.ts` | M | +115/-1 | O4 autorização: ações de servidor novas (excluir usuário, retenção, aviso, busca e apagar titular), todas com guarda de admin. |
| `src/app/api/publico/agentes/[id]/conversa/route.ts` | M | +27/-2 | O5 contrato público: método `DELETE` novo sem sessão, protegido por `X-Visitante-Id`, `Origin` e limite de uso. |
| `src/app/api/titulares/exportar/route.ts` | A | +61/-0 | O5 contrato público e O4: rota nova que entrega dados pessoais; confira sessão, admin, `Origin`, corpo no lugar de URL e cabeçalhos do anexo. |
| `src/componentes/ChatEmbutido.tsx` | M | +71/-0 | O4 dado pessoal: o visitante apaga a própria conversa (confirmação em dois passos, DELETE, limpa o estado local). |
| `src/componentes/FerramentasDoTitular.tsx` | A | +217/-0 | O4 e efeito irreversível: busca, exporta e apaga os dados de uma pessoa; confirmação digitando APAGAR; nunca exibe o identificador completo. |
| `src/componentes/PainelDeDadosPessoais.tsx` | A | +59/-0 | O4: texto de privacidade mostrado ao admin (campos por canal, finalidade, base legal "a confirmar"); precisa ser lido por quem conhece a política da empresa. |
| `src/componentes/embed-logica.ts` | M | +67/-2 | O4 e O5: endereço e chamada `DELETE` com o id do visitante no cabeçalho, máquina de confirmação e tradução de erro. |
| `src/componentes/exportar-titular.ts` | A | +39/-0 | O4 dado pessoal: baixa a exportação por `fetch` e blob; o identificador vai no corpo. |
| `src/componentes/privacidade-logica.ts` | A | +115/-0 | O4: texto fixo do painel de dados pessoais e a base legal, mais as regras de retenção e de confirmação do titular. |
| `src/instrumentation.ts` | M | +15/-1 | O2: a subida do servidor passa a ligar a auditoria e a iniciar o expurgo, que apaga dados; falha de cada um é isolada. |
| `src/servicos/agentes.ts` | M | +21/-2 | O2 e efeito irreversível: a exclusão de agente agora é transacional com a auditoria (lê nome e contagens antes de apagar). |
| `src/servicos/auditoria-acoes.ts` | A | +116/-0 | O4: define o que pode ou não entrar nos detalhes (nenhum segredo, texto de conversa nem identificador) e recusa valor que parece segredo. |
| `src/servicos/auditoria-ouvintes.ts` | A | +89/-0 | O4: liga a auditoria aos pontos de extensão (idempotente, `globalThis`); decide quem aparece como autor (usuário, sistema, visitante). |
| `src/servicos/auditoria.ts` | A | +253/-0 | O4 dado pessoal e autorização: grava o rótulo "Nome <e-mail>"; é a única que remove linhas (`purgarAnterioresA`); a regra de falha (transação x melhor esforço) está aqui. Provado por `tests/auditoria*.test.ts`. |
| `src/servicos/canal-telegram.ts` | M | +14/-4 | O4: ouvintes de canal em `globalThis`; o token e o segredo continuam fora do evento. |
| `src/servicos/chat-publico-config.ts` | M | +13/-5 | O5 contrato público: o aviso de privacidade entregue ao visitante agora cai no padrão do workspace. |
| `src/servicos/chat-publico.ts` | M | +31/-0 | O5 contrato público e O4: o visitante apaga a própria conversa (só as dele, agente ativo, limite de uso, erro sanitizado). |
| `src/servicos/expurgo.ts` | A | +195/-0 | O2 e efeito irreversível: apaga conversas, dedupe do Telegram e auditoria em lotes; o corte exato (`lt`), o relógio e o agendador (sem sobreposição, falha não derruba) estão aqui. |
| `src/servicos/historico.ts` | M | +69/-5 | O4 dado pessoal e efeito irreversível: `apagarConversasDe` (titular e visitante), ouvintes em `globalThis`, `origem` e `usuarioId` anulável no evento. |
| `src/servicos/integracoes.ts` | M | +45/-12 | O4 segredo: troca e remoção da chave do OpenRouter na mesma transação da auditoria, que nunca recebe chave, máscara nem texto cifrado. |
| `src/servicos/privacidade.ts` | A | +167/-0 | O2 regra de negócio e O4: retenção (7 a 3650 dias, nulo = sem expurgo) e aviso padrão, só admin, com confirmação de risco. |
| `src/servicos/telegram-atendimento.ts` | M | +6/-1 | O5 e O4: o `/start` do Telegram passa a anexar o aviso padrão e o link à resposta enviada ao usuário. |
| `src/servicos/titular.ts` | A | +265/-0 | O4 dado pessoal: busca, exporta e apaga os dados de uma pessoa; o identificador completo nunca sai (prefixo, arquivo, auditoria); só admin. |
| `src/servicos/usuarios.ts` | M | +116/-21 | O4 autorização e efeito irreversível: `excluirDefinitivamente` (só admin ativo, nunca a si mesmo nem o último admin) transfere agentes, apaga a conta e derruba sessões; criar e editar passam a gravar a auditoria na mesma transação. |

## LEITURA RÁPIDA — conferir intenção, não implementação

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `.env.example` | M | +7/-0 | L2: documenta a variável nova, sem valor secreto (`tests/projeto.test.ts` confere). |
| `README.md` | M | +13/-1 | L2: seção "Privacidade e auditoria" e a variável nova, conferidas por `tests/projeto.test.ts`. |
| `docs/projeto/MAPA.md` | M | +7/-4 | L2: FT-10 entregue e contadores (documento do laço do buildx). |
| `docs/projeto/PROJETO.md` | M | +1/-1 | L2: só o contador de features entregues. |
| `docs/projeto/RECURSAO.md` | M | +14/-4 | L2: PEND-08 (base legal e prazos) e a PEND-07 com as telas da FT-10; leia a PEND-08, é a decisão que sobra para a empresa. |
| `docs/stack/CONVENCOES.md` | M | +18/-9 | L2: oito linhas novas com arquivo e linha, conferidas por `tests/projeto.test.ts`, e citações de linha refeitas. |
| `docs/stack/LACUNAS.md` | M | +2/-0 | L2: lacunas 28 a 33 e a resolução da 25, conferidas por teste. |
| `src/app/(sistema)/configuracoes/auditoria/loading.tsx` | A | +6/-0 | L3: estado de carregamento, arquivo novo igual ao das outras telas. |
| `src/app/(sistema)/configuracoes/privacidade/loading.tsx` | A | +6/-0 | L3: estado de carregamento, arquivo novo igual ao das outras telas. |
| `src/componentes/FiltrosDeAuditoria.tsx` | A | +59/-0 | L3: formulário GET novo; o filtro é validado no serviço. |
| `src/componentes/FormularioDeRetencao.tsx` | A | +104/-0 | L3: componente novo; a validação de verdade é do servidor (`salvarRetencao`), a tela só habilita o botão. |
| `src/componentes/FormularioDoAvisoPadrao.tsx` | A | +67/-0 | L3: componente novo com teste de marcação; o servidor valida. |
| `src/componentes/FormularioDoChat.tsx` | M | +1/-1 | L2: só o texto de ajuda do aviso do agente ("em branco vale o padrão do workspace"). |
| `src/componentes/ListaDeAuditoria.tsx` | A | +144/-0 | L3: componente novo, só leitura, texto escapado pelo React, sem controle de editar ou apagar (`tests/auditoria-ui.test.tsx`). |
| `src/componentes/auditoria-logica.ts` | A | +235/-0 | L3: módulo puro novo (frases em português por ação), coberto por `tests/auditoria-logica.test.ts`. |
| `src/componentes/excluir-usuario-logica.ts` | A | +25/-0 | L3: regra pura da confirmação do e-mail, coberta por teste; o servidor confere de novo. |
| `src/componentes/itens-de-menu.ts` | M | +12/-0 | L2: dois itens somente-admin; esconder não é o controle de acesso (as guardas estão nos layouts), coberto por `tests/menu.test.ts` e `tests/rotas.test.ts`. |
| `src/estilos/global.css` | M | +109/-2 | L2: seção nova de privacidade e auditoria e o ajuste que tira o estouro lateral de Usuários a 375 px; coberto por `tests/privacidade-estilos.test.ts` e `tests/tokens.test.ts`. |
| `src/lib/ambiente.ts` | M | +7/-0 | L2: getter novo `auditoriaRetencaoDias` (padrão 365) numa camada com cobertura (`tests/ambiente.test.ts`); não atravessa contrato público. |
| `tests/ajuda.ts` | M | +1/-0 | L2: `limparBanco` passa a apagar a tabela nova antes das demais. |
| `tests/apoio/privacidade.ts` | A | +88/-0 | L3: apoio de teste novo (conversas em lote com instante exato e registros de auditoria). |
| `tests/apoio/semear-privacidade.ts` | A | +77/-0 | L3: script novo de semeadura fictícia para a verificação; recusa produção e só apaga o que ele mesmo semeou. |
| `tests/embed-logica.test.ts` | M | +2/-1 | L2: muda uma asserção existente (o campo novo `apagar` em `enderecosDoEmbed`), de propósito. |
| `tests/instrumentacao.test.ts` | M | +90/-0 | L2: acrescenta casos da subida (auditoria e expurgo) e ajusta o `afterEach`; os casos antigos seguem iguais. |
| `tests/menu.test.ts` | M | +19/-0 | L2: acrescenta casos e atualiza a lista esperada do grupo Configurações. |
| `tests/projeto.test.ts` | M | +96/-15 | L2: acrescenta o bloco da FT-10 e refaz citações de linha existentes (mudam asserções existentes porque as linhas se deslocaram). |
| `tests/rotas.test.ts` | M | +19/-1 | L2: acrescenta as duas rotas à lista sem sessão e casos de usuário comum e admin. |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/entregas/privacidade-e-auditoria/ATENCAO.md` | A | criado depois | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/entregas/privacidade-e-auditoria/ENTREGA.md` | A | +105/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/entregas/privacidade-e-auditoria/PR.md` | A | criado depois | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/entregas/privacidade-e-auditoria/QA-PACOTE.md` | A | criado depois | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/00-AUDITORIA.md` | A | +16/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/00-BLOQUEIOS.md` | A | +14/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/00-DECISOES.md` | A | +208/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/BRIEFING-BUILDX.md` | A | +45/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/FECHAMENTO.md` | A | +50/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/ORQUESTRADOR.md` | A | +97/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/RELATORIO-FEATURE.md` | A | +61/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/VERIFICACAO-VISUAL.md` | A | +44/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/00-INDICE.md` | A | +43/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/00-LACUNAS.md` | A | +6/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/canais-e-conversas.md` | A | +25/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/integracoes-e-agentes.md` | A | +25/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/schema-e-migracoes.md` | A | +25/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/segundo-plano-e-ambiente.md` | A | +25/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/telas-menu-e-publico.md` | A | +25/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/testes-e-ci.md` | A | +25/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/base/usuarios-e-sessao.md` | A | +25/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-01/fases.md` | A | +54/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-01/sprint.md` | A | +39/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-01/tasks.md` | A | +110/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-02/fases.md` | A | +54/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-02/sprint.md` | A | +39/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-02/tasks.md` | A | +206/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-03/fases.md` | A | +54/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-03/sprint.md` | A | +39/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-03/tasks.md` | A | +142/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-04/fases.md` | A | +54/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-04/sprint.md` | A | +39/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-04/tasks.md` | A | +78/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-05/fases.md` | A | +54/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-05/sprint.md` | A | +39/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-05/tasks.md` | A | +142/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-06/fases.md` | A | +73/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-06/sprint.md` | A | +40/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-06/tasks.md` | A | +174/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-07/fases.md` | A | +54/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-07/sprint.md` | A | +39/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `docs/privacidade-e-auditoria/sprint-07/tasks.md` | A | +142/-0 | D3 estendido: artefato do método (plano, base, decisões, relatórios, entrega), não é código; mesma escolha da FT-09. |
| `tests/ambiente.test.ts` | M | +20/-1 | D1: só acrescenta casos (retenção da auditoria) e uma variável à lista de limpeza. |
| `tests/auditoria-acoes.test.ts` | A | +69/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria-agentes.test.ts` | A | +78/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria-integracoes.test.ts` | A | +121/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria-logica.test.ts` | A | +141/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria-ouvintes.test.ts` | A | +153/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria-somente-acrescimo.test.ts` | A | +82/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria-ui.test.tsx` | A | +172/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria-usuarios.test.ts` | A | +97/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/auditoria.test.ts` | A | +140/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/embed-apagar-logica.test.ts` | A | +102/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/embed-apagar-ui.test.tsx` | A | +127/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/excluir-usuario-logica.test.ts` | A | +41/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/expurgo-agendador.test.ts` | A | +126/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/expurgo.test.ts` | A | +179/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-acoes.test.ts` | A | +82/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-apoio.test.ts` | A | +73/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-aviso-canais.test.ts` | A | +109/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-estilos.test.ts` | A | +59/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-fim-a-fim.test.ts` | A | +105/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-logica.test.ts` | A | +66/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-modelo.test.ts` | A | +77/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade-ui.test.tsx` | A | +110/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/privacidade.test.ts` | A | +124/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/publico-apagar-rota.test.ts` | A | +115/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/publico-apagar.test.ts` | A | +128/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/titular-acoes.test.ts` | A | +91/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/titular-ui.test.tsx` | A | +168/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/titular.test.ts` | A | +208/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/titulares-exportar-rota.test.ts` | A | +108/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/usuarios-excluir-acao.test.ts` | A | +64/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/usuarios-excluir-ui.test.tsx` | A | +118/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |
| `tests/usuarios-excluir.test.ts` | A | +134/-0 | D1: arquivo de teste novo, só casos novos (nenhuma asserção existente alterada). |

## Fontes consultadas

- `git diff --name-status` e `--numstat` contra `feat/historico-de-conversas` (três pontos): tipo e tamanho de cada arquivo.
- `docs/privacidade-e-auditoria/sprint-0*/tasks.md`: a task que tocou cada arquivo e os dois testes declarados; suíte inteira verde (2544 testes) no estado final.
- `docs/stack/CONVENCOES.md`: camadas, migração que só acrescenta, regra de verificação de citações.
- memox (`.claude/skills/memox/assets/memox.py arquivo`): consultado nos arquivos do diff, sem sinal que suba faixa.

## Fontes ausentes

- `docs/legado/PERFIL.md`: não há zona de risco declarada; a dimensão O1 não foi avaliada, e os critérios O2 a O5 decidiram.
- Raio de impacto, testes de caracterização e plano de reversão da legadox: ausentes; O7 e O8 não puderam ser avaliados, e o efeito irreversível (exclusão e expurgo) foi tratado pelo critério O2.
- Relatório de cobertura: o repositório não tem provedor de cobertura (lacuna 2); a cobertura veio das tasks e dos testes nomeados, não de número medido.
