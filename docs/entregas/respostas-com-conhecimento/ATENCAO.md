---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
raio: null
olho_obrigatorio: 12
leitura_rapida: 9
dispensavel: 64
atualizado_em: 2026-09-30
---

# Atenção humana — respostas-com-conhecimento

Branch `feat/respostas-com-conhecimento` -> `feat/conhecimento-arquivos-e-texto`. Data: 2026-09-30.

**85 arquivos — 12 olho obrigatório, 9 leitura rápida, 64 dispensável**

Sem modo legado e sem raio calculado: a classificação vem do tipo de arquivo e da evidência das tasks. SQL cru com entrada do usuário, migração com gatilhos, prompt com texto de terceiros (injeção), protocolo SSE, formato persistido em `Mensagem.fontes`, rota pública nova e renderização de texto do modelo ficam em OLHO OBRIGATÓRIO; componentes, lógica pura e estilos já cobertos por teste, em LEITURA RÁPIDA; testes e documentos em DISPENSÁVEL, porque a suíte de 1065 testes exerce os primeiros. O tamanho do diff não entrou no critério. O memox estava instalado e foi consultado nos 27 arquivos alterados que já existiam: nenhum tem regressão ou reprovação de QA registrada (O9 não se aplica); trouxe só `faixa_atencao_frequente`, que não altera faixa. Os quatro últimos arquivos (`ATENCAO.md`, `PR.md`, `QA-PACOTE.md`, `FECHAMENTO.md`) entram na conta porque são criados logo depois desta classificação. O que a revisão humana não consegue substituir: o comportamento do modelo real diante do prompt (citar `[n]`, tratar o material como dado, dizer que não encontrou) não é testável sem chamar o provedor.

## OLHO OBRIGATÓRIO — ler linha a linha

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `prisma/migrations/20260930190000_busca_fts5/migration.sql` | A | +33/-0 | O3 migração de banco com SQL cru: tabela virtual FTS5 e três gatilhos que rodam em toda escrita de `trechos`, inclusive na cascata; só acrescenta (tests/migracoes.test.ts); provada do zero, sobre dados pré-existentes e na cascata por tests/indice-fts5.test.ts e tests/indice-fts5-cascata.test.ts |
| `src/app/api/agentes/[id]/buscar/route.ts` | A | +21/-0 | O4 contrato público novo (POST buscar) e O2 sessão no servidor: 401, 404, 422, sem cache; provado pelo servidor de produção em tests/buscar-rota.test.ts |
| `src/app/eventos-sse.ts` | M | +7/-2 | O4 protocolo SSE estendido com o evento `fontes` sem encerrar o fluxo; provado por tests/eventos-sse.test.ts e tests/conversar-rota.test.ts |
| `src/componentes/TextoDoModelo.tsx` | M | +34/-8 | O1 mesmo renderizador seguro: o botão de referência é elemento React, sem `dangerouslySetInnerHTML`; provado por tests/texto-seguro.test.tsx |
| `src/componentes/leitor-de-sse.ts` | M | +38/-2 | O4 lado do navegador do protocolo SSE: valida o formato de `fontes` e continua ignorando nome desconhecido; provado por tests/leitor-de-sse.test.ts |
| `src/componentes/texto-seguro.ts` | M | +21/-9 | O1 renderização de texto de origem não confiável (o modelo): o novo nó `referencia` só existe para números conhecidos e nunca vira HTML; provado por tests/texto-seguro.test.tsx |
| `src/servicos/chat-prompt.ts` | M | +85/-0 | O1 injeção de prompt (PR-15): marcador aleatório, higienização do texto de terceiros, orçamento e instruções; provado na estrutura por tests/chat-prompt-fundamentado.test.ts e tests/chat-fundamentado.test.ts (o comportamento do modelo real não é testável) |
| `src/servicos/chat.ts` | M | +78/-7 | O1 fluxo do turno: decide o modo fundamentado, trata falha da busca como erro, emite `fontes` antes do `fim` e regrava a resposta sem fontes se a gravação falhar (PR-53); provado por tests/chat-fundamentado.test.ts e tests/chat-fontes.test.ts |
| `src/servicos/conversas.ts` | M | +17/-6 | O4 contrato de retomada da conversa: `retomarDoPainel` passa a devolver `fontes` lidas de `Mensagem.fontes`; provado por tests/conversas.test.ts |
| `src/servicos/fontes-da-resposta.ts` | A | +89/-0 | O4 formato persistido em `Mensagem.fontes` (lido pela FT-09) e regra de citação `[n]`; leitura defensiva de JSON; provado por tests/fontes-da-resposta.test.ts |
| `src/servicos/recuperacao-termos.ts` | A | +73/-0 | O1 é o que impede a pergunta do usuário de virar sintaxe do FTS5: só letras e dígitos, entre aspas, teto de 12 termos; provado contra o FTS5 real em tests/recuperacao-termos.test.ts |
| `src/servicos/recuperacao.ts` | A | +128/-0 | O1 o único SQL cru do sistema, com entrada do usuário (a pergunta): `$queryRaw` parametrizado, filtro por agente e por fonte pronta, teto de 6; provado por tests/recuperacao.test.ts (perguntas hostis, agente com SQL no id, guarda de `$queryRawUnsafe`) |

## LEITURA RÁPIDA — conferir intenção, não implementação

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `docs/projeto/PREMISSAS.md` | M | +67/-2 | L3 cinco premissas novas (PR-50 a PR-54) que registram decisões em nome do humano: conferir o campo "O que invalida" de cada uma |
| `src/componentes/ChatDeTeste.tsx` | M | +33/-4 | L2 tela já coberta por teste de markup: liga o evento `fontes`, as referências e o foco ao chip; o clique só foi visto no navegador (VERIFICACAO-VISUAL.md) |
| `src/componentes/FontesDaResposta.tsx` | A | +82/-0 | L2 componente de apresentação coberto por tests/fontes-da-resposta-ui.test.tsx; todo texto passa pelo React |
| `src/componentes/PainelDeConhecimento.tsx` | M | +3/-0 | L2 acrescenta o cartão; coberto por tests/painel-de-conhecimento.test.tsx |
| `src/componentes/TestarBusca.tsx` | A | +122/-0 | L2 componente cliente com `fetch` simples; lógica em busca-logica.ts; conferir os textos e os estados vazio, carregando e erro |
| `src/componentes/busca-logica.ts` | A | +61/-0 | L1 lógica pura coberta por tests/busca-logica.test.ts |
| `src/componentes/estado-da-conversa.ts` | M | +15/-2 | L1 reducer puro coberto por tests/estado-da-conversa.test.ts |
| `src/componentes/fontes-da-resposta-logica.ts` | A | +38/-0 | L1 lógica pura coberta por tests/fontes-da-resposta-ui.test.tsx |
| `src/estilos/global.css` | M | +117/-0 | L2 estilos novos só com tokens (tests/tokens.test.ts); conferir contraste nos dois temas na tela |

## DISPENSÁVEL — a máquina já provou

| Arquivo | Mudança | Tamanho | Por quê |
|---|---|---|---|
| `README.md` | M | +9/-1 | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/respostas-com-conhecimento/ATENCAO.md` | A | novo (criado depois) | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/respostas-com-conhecimento/ENTREGA.md` | A | +37/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/respostas-com-conhecimento/PR.md` | A | novo (criado depois) | D3 documento (artefato do método ou texto): não executa |
| `docs/entregas/respostas-com-conhecimento/QA-PACOTE.md` | A | novo (criado depois) | D3 documento (artefato do método ou texto): não executa |
| `docs/projeto/MAPA.md` | M | +7/-4 | D3 documento (artefato do método ou texto): não executa |
| `docs/projeto/PROJETO.md` | M | +1/-1 | D3 documento (artefato do método ou texto): não executa |
| `docs/projeto/RECURSAO.md` | M | +2/-2 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/00-AUDITORIA.md` | A | +18/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/00-BLOQUEIOS.md` | A | +14/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/00-DECISOES.md` | A | +175/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/BRIEFING-BUILDX.md` | A | +45/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/FECHAMENTO.md` | A | novo (criado depois) | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/ORQUESTRADOR.md` | A | +101/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/RELATORIO-FEATURE.md` | A | +53/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md` | A | +27/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/base/00-INDICE.md` | A | +29/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/base/00-LACUNAS.md` | A | +11/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/base/fts5-e-migration.md` | A | +36/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/base/interface-testar-e-conhecimento.md` | A | +30/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/base/turno-de-chat-e-sse.md` | A | +34/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-01/fases.md` | A | +63/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-01/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-01/tasks.md` | A | +118/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-02/fases.md` | A | +65/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-02/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-02/tasks.md` | A | +152/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-03/fases.md` | A | +67/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-03/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-03/tasks.md` | A | +186/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-04/fases.md` | A | +62/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-04/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-04/tasks.md` | A | +118/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-05/fases.md` | A | +65/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-05/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-05/tasks.md` | A | +152/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-06/fases.md` | A | +63/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-06/sprint.md` | A | +39/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/respostas-com-conhecimento/sprint-06/tasks.md` | A | +118/-0 | D3 documento (artefato do método ou texto): não executa |
| `docs/stack/CONVENCOES.md` | M | +11/-3 | D3 documento (artefato do método ou texto): não executa |
| `docs/stack/LACUNAS.md` | M | +2/-0 | D3 documento (artefato do método ou texto): não executa |
| `tests/apoio-conhecimento.test.ts` | A | +45/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/apoio/conhecimento.ts` | A | +49/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/busca-logica.test.ts` | A | +84/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/buscar-rota.test.ts` | A | +109/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/chat-fontes.test.ts` | A | +122/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/chat-fundamentado.test.ts` | A | +174/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/chat-prompt-fundamentado.test.ts` | A | +150/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/conversar-rota.test.ts` | M | +32/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/conversas.test.ts` | M | +20/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/estado-da-conversa.test.ts` | M | +46/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/eventos-sse.test.ts` | M | +36/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/fontes-da-resposta-ui.test.tsx` | A | +145/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/fontes-da-resposta.test.ts` | A | +93/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/indice-fts5-cascata.test.ts` | A | +96/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/indice-fts5.test.ts` | A | +115/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/leitor-de-sse.test.ts` | M | +33/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/painel-de-conhecimento.test.tsx` | M | +22/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/projeto.test.ts` | M | +47/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/recuperacao-desempenho.test.ts` | A | +56/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/recuperacao-termos.test.ts` | A | +100/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/recuperacao.test.ts` | A | +165/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/seed.test.ts` | M | +23/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |
| `tests/texto-seguro.test.tsx` | M | +54/-0 | D1 teste ou apoio de teste: a própria suíte de 1065 testes o exerce |

## Fontes consultadas

- `git diff --name-status` e `--numstat` contra a base (PRs empilhados)
- `docs/respostas-com-conhecimento/sprint-*/tasks.md` (testes por task)
- `docs/stack/CONVENCOES.md` (camadas e regras de segurança)
- memox (histórico por arquivo): sem regressão nem reprovação de QA

## Fontes ausentes

- `docs/legado/PERFIL.md`, raio da legadox, testes de caracterização e plano de reversão: não existem (projeto sem legado); a dimensão de zona de risco declarada não foi avaliada
- Relatório de cobertura de teste: o projeto não tem provedor de cobertura (docs/stack/LACUNAS.md, lacuna 2)
