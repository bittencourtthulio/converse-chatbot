---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
titulo: Respostas com base no conhecimento
tipo_trabalho: feature
fechado_em: 2026-09-30
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: ["README.md", "docs/entregas/respostas-com-conhecimento/ATENCAO.md", "docs/entregas/respostas-com-conhecimento/ENTREGA.md", "docs/entregas/respostas-com-conhecimento/PR.md", "docs/entregas/respostas-com-conhecimento/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/respostas-com-conhecimento/00-AUDITORIA.md", "docs/respostas-com-conhecimento/00-BLOQUEIOS.md", "docs/respostas-com-conhecimento/00-DECISOES.md", "docs/respostas-com-conhecimento/BRIEFING-BUILDX.md", "docs/respostas-com-conhecimento/FECHAMENTO.md", "docs/respostas-com-conhecimento/ORQUESTRADOR.md", "docs/respostas-com-conhecimento/RELATORIO-FEATURE.md", "docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md", "docs/respostas-com-conhecimento/base/00-INDICE.md", "docs/respostas-com-conhecimento/base/00-LACUNAS.md", "docs/respostas-com-conhecimento/base/fts5-e-migration.md", "docs/respostas-com-conhecimento/base/interface-testar-e-conhecimento.md", "docs/respostas-com-conhecimento/base/turno-de-chat-e-sse.md", "docs/respostas-com-conhecimento/sprint-01/fases.md", "docs/respostas-com-conhecimento/sprint-01/sprint.md", "docs/respostas-com-conhecimento/sprint-01/tasks.md", "docs/respostas-com-conhecimento/sprint-02/fases.md", "docs/respostas-com-conhecimento/sprint-02/sprint.md", "docs/respostas-com-conhecimento/sprint-02/tasks.md", "docs/respostas-com-conhecimento/sprint-03/fases.md", "docs/respostas-com-conhecimento/sprint-03/sprint.md", "docs/respostas-com-conhecimento/sprint-03/tasks.md", "docs/respostas-com-conhecimento/sprint-04/fases.md", "docs/respostas-com-conhecimento/sprint-04/sprint.md", "docs/respostas-com-conhecimento/sprint-04/tasks.md", "docs/respostas-com-conhecimento/sprint-05/fases.md", "docs/respostas-com-conhecimento/sprint-05/sprint.md", "docs/respostas-com-conhecimento/sprint-05/tasks.md", "docs/respostas-com-conhecimento/sprint-06/fases.md", "docs/respostas-com-conhecimento/sprint-06/sprint.md", "docs/respostas-com-conhecimento/sprint-06/tasks.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20260930190000_busca_fts5/migration.sql", "src/app/api/agentes/[id]/buscar/route.ts", "src/app/eventos-sse.ts", "src/componentes/ChatDeTeste.tsx", "src/componentes/FontesDaResposta.tsx", "src/componentes/PainelDeConhecimento.tsx", "src/componentes/TestarBusca.tsx", "src/componentes/TextoDoModelo.tsx", "src/componentes/busca-logica.ts", "src/componentes/estado-da-conversa.ts", "src/componentes/fontes-da-resposta-logica.ts", "src/componentes/leitor-de-sse.ts", "src/componentes/texto-seguro.ts", "src/estilos/global.css", "src/servicos/chat-prompt.ts", "src/servicos/chat.ts", "src/servicos/conversas.ts", "src/servicos/fontes-da-resposta.ts", "src/servicos/recuperacao-termos.ts", "src/servicos/recuperacao.ts", "tests/apoio-conhecimento.test.ts", "tests/apoio/conhecimento.ts", "tests/busca-logica.test.ts", "tests/buscar-rota.test.ts", "tests/chat-fontes.test.ts", "tests/chat-fundamentado.test.ts", "tests/chat-prompt-fundamentado.test.ts", "tests/conversar-rota.test.ts", "tests/conversas.test.ts", "tests/estado-da-conversa.test.ts", "tests/eventos-sse.test.ts", "tests/fontes-da-resposta-ui.test.tsx", "tests/fontes-da-resposta.test.ts", "tests/indice-fts5-cascata.test.ts", "tests/indice-fts5.test.ts", "tests/leitor-de-sse.test.ts", "tests/painel-de-conhecimento.test.tsx", "tests/projeto.test.ts", "tests/recuperacao-desempenho.test.ts", "tests/recuperacao-termos.test.ts", "tests/recuperacao.test.ts", "tests/seed.test.ts", "tests/texto-seguro.test.tsx"]
palavras_chave: [fts5, bm25, recuperacao, trechos, fontes, prompt, citacao, busca]
resumo: O agente responde a partir das fontes da própria base, mostra de quais fontes tirou a resposta e diz que não sabe quando a base não cobre a pergunta.
decisao_principal: "D-01, D-10 e D-13: índice FTS5 de conteúdo externo mantido por gatilhos em migration escrita à mão; o conteúdo da base entra no prompt como dado, num bloco com marcador aleatório por requisição; o evento fontes sai antes do fim e o JSON vai para Mensagem.fontes"
risco_residual: O comportamento do modelo real diante do prompt (citar [n], ignorar instruções do material, dizer que não encontrou) não é testável sem o provedor; o rowid de trechos pode desalinhar o índice após VACUUM ou restauração (remédio reconstruirIndiceDeTrechos); 375 px e o tema claro da aba Testar com fontes não foram vistos no navegador.
testes_adicionados: 174
---

# Fechamento — respostas-com-conhecimento

## O que foi entregue

Índice FTS5 por migration, serviço de recuperação, modo fundamentado do turno de chat, evento `fontes` gravado em `Mensagem.fontes`, Fontes e referências `[n]` na aba Testar, cartão "Testar busca" e rota de busca.

## Decisão principal

O conteúdo da base é dado, não instrução (PR-15): entra na mensagem de sistema num bloco com marcador aleatório por requisição, higienizado e com orçamento; a busca usa `prisma.$queryRaw` parametrizado, com a pergunta reduzida a termos limpos (PR-51). A lista completa de arquivos está em `docs/entregas/respostas-com-conhecimento/ENTREGA.md`.

## Risco residual

O modelo real não é testável nos testes; índice e `rowid`; verificação visual parcial.

## Onde isto mexeu

Apresentação (`src/app`, `src/componentes`, `src/estilos`), aplicação (`src/servicos/recuperacao*.ts`, `fontes-da-resposta.ts`, `chat.ts`, `chat-prompt.ts`, `conversas.ts`), banco (uma migration aditiva com tabela virtual), testes e documentação. Nenhuma dependência nem variável de ambiente nova.
