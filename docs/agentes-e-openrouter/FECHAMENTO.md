---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
titulo: Agentes e chave do OpenRouter
tipo_trabalho: feature
fechado_em: 2026-09-30
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [.env.example, .gitignore, README.md, docs/agentes-e-openrouter/00-AUDITORIA.md, docs/agentes-e-openrouter/00-BLOQUEIOS.md, docs/agentes-e-openrouter/00-DECISOES.md, docs/agentes-e-openrouter/BRIEFING-BUILDX.md, docs/agentes-e-openrouter/FECHAMENTO.md, docs/agentes-e-openrouter/ORQUESTRADOR.md, docs/agentes-e-openrouter/RELATORIO-FEATURE.md, docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md, docs/agentes-e-openrouter/base/00-INDICE.md, docs/agentes-e-openrouter/base/00-LACUNAS.md, docs/agentes-e-openrouter/base/ambiente-e-segredos.md, docs/agentes-e-openrouter/base/banco-e-migrations.md, docs/agentes-e-openrouter/base/interface-e-menu.md, docs/agentes-e-openrouter/base/openrouter-api.md, docs/agentes-e-openrouter/sprint-01/tasks.md, docs/agentes-e-openrouter/sprint-02/tasks.md, docs/agentes-e-openrouter/sprint-03/tasks.md, docs/agentes-e-openrouter/sprint-04/tasks.md, docs/agentes-e-openrouter/sprint-05/tasks.md, docs/agentes-e-openrouter/sprint-06/tasks.md, docs/entregas/agentes-e-openrouter/ENTREGA.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/projeto/PROJETO.md, docs/projeto/RECURSAO.md, docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md, package-lock.json, package.json, prisma/migrations/20260930145651_configuracao_do_workspace/migration.sql, prisma/migrations/20260930150122_agentes/migration.sql, prisma/schema.prisma, prisma/seed.ts, src/app/(sistema)/agentes/(lista)/loading.tsx, src/app/(sistema)/agentes/(lista)/page.tsx, src/app/(sistema)/agentes/[id, , src/app/(sistema)/agentes/novo/loading.tsx, src/app/(sistema)/agentes/novo/page.tsx, src/app/(sistema)/configuracoes/integracoes/layout.tsx, src/app/(sistema)/configuracoes/integracoes/loading.tsx, src/app/(sistema)/configuracoes/integracoes/page.tsx, src/app/acoes.ts, src/componentes/AbasDoAgente.tsx, src/componentes/BotaoExcluirAgente.tsx, src/componentes/FormularioDeAgente.tsx, src/componentes/Icones.tsx, src/componentes/PainelDaChaveOpenrouter.tsx, src/componentes/SeletorDeModelo.tsx, src/componentes/abas-do-agente.ts, src/componentes/itens-de-menu.ts, src/estilos/global.css, src/lib/ambiente.ts, src/lib/cripto.ts, src/lib/erros.ts, src/lib/openrouter.ts, src/lib/sse.ts, src/servicos/agentes.ts, src/servicos/integracoes.ts, tests/abas-do-agente.test.tsx, tests/acoes-de-agente.test.ts, tests/agentes-modelos.test.ts, tests/agentes.test.ts, tests/ajuda.ts, tests/ambiente.test.ts, tests/apoio/openrouter-falso.ts, tests/componentes.test.tsx, tests/cripto.test.ts, tests/erros.test.ts, tests/formulario-de-agente.test.tsx, tests/integracoes-conexao.test.ts, tests/integracoes.test.ts, tests/menu.test.ts, tests/migracoes.test.ts, tests/openrouter-conversar.test.ts, tests/openrouter-falso.test.ts, tests/openrouter.test.ts, tests/projeto.test.ts, tests/rotas.test.ts, tests/seed.test.ts, tests/seletor-de-modelo.test.tsx, tests/setup.ts, tests/sse.test.ts]
palavras_chave: [openrouter, agentes, cripto, segredo, sse, integracoes, modelo, temperatura]
resumo: O admin cadastra a chave do OpenRouter (criptografada, só a máscara volta à tela) e qualquer usuário cria, edita e exclui agentes com instruções, modelo, temperatura e mensagem inicial.
decisao_principal: "D-05: adaptador src/lib/openrouter.ts com listarModelos (cache e reserva), verificarChave e conversar em stream (AsyncIterable de trechos), testado contra o servidor simulado tests/apoio/openrouter-falso.ts"
risco_residual: A conversa em stream (conversar) só foi provada contra o servidor simulado, nunca contra o OpenRouter de verdade; os formulários de agente e de chave não foram vistos a 375 px em navegador (só o layout em quadros estáticos); a rota de verificação de chave usa /key (documentada), não /auth/key do briefing.
testes_adicionados: 214
---

# Fechamento — agentes-e-openrouter

## O que foi entregue

O admin cadastra a chave do OpenRouter em Configurações > Integrações (AES-256-GCM em repouso, máscara na tela, nunca devolvida ao navegador, "Testar conexão" e remover) e qualquer usuário cria, edita e exclui agentes escolhendo instruções, modelo, temperatura e mensagem inicial, com um componente de abas extensível. Junto vieram o adaptador do OpenRouter (modelos com cache e reserva, verificação de chave e conversa em stream com parser SSE) e o servidor simulado reutilizável.

## Decisão principal

D-05: o adaptador `src/lib/openrouter.ts` é o único ponto que fala com o provedor; erros viram `ErroDeAplicacao` em português sem o corpo do provedor, e os testes usam `tests/apoio/openrouter-falso.ts`, nunca a rede real.

## Risco residual

A conversa em stream só foi provada contra o servidor simulado. Os formulários não foram vistos a 375 px em navegador. A verificação de chave usa `/key`, a rota documentada, e não `/auth/key` do briefing.

## Onde isto mexeu

Apresentação (`src/app`, `src/componentes`, `src/estilos`), aplicação (`src/servicos/agentes.ts`, `src/servicos/integracoes.ts`), infraestrutura (`src/lib/cripto.ts`, `openrouter.ts`, `sse.ts`, `ambiente.ts`, `erros.ts`), banco (duas migrations aditivas e `prisma/seed.ts`), testes e documentação.
