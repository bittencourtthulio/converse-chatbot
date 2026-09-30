---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
raio: null
olho_obrigatorio: 9
leitura_rapida: 14
dispensavel: 52
atualizado_em: 2026-09-30
---

# Atenção humana — conversa-de-teste

Sem modo legado e sem raio calculado: a classificação vem do tipo de arquivo e da evidência das tasks. Autorização por posse, segredo, migração de banco, o que chega ao navegador em caso de erro e o primeiro handler HTTP ficam em OLHO OBRIGATÓRIO; interface, configuração e a montagem do prompt, já cobertas por teste, em LEITURA RÁPIDA; testes, estilos e documentos em DISPENSÁVEL, porque a suíte de 573 testes os exerce. O tamanho do diff não entrou no critério.

### OLHO OBRIGATÓRIO — ler linha a linha

- `prisma/migrations/20260930170000_conversas/migration.sql` (A, +34/-0) — O3 migração de banco: só CREATE TABLE e CREATE INDEX (verificado por tests/migracoes.test.ts); a cascata é provada por tests/conversas-modelo.test.ts
- `prisma/schema.prisma` (M, +47/-1) — O3 modelo de banco: duas tabelas novas com chave estrangeira em cascata do agente e SET NULL do usuário; provado por tests/conversas-modelo.test.ts
- `src/app/api/agentes/[id]/conversar/route.ts` (A, +61/-0) — O2 primeiro handler HTTP: sessão conferida no servidor (401), status por erro e cabeçalhos do stream; provado por tests/conversar-rota.test.ts contra o servidor de produção
- `src/app/eventos-sse.ts` (A, +60/-0) — O1 o que chega ao navegador em caso de erro: só a mensagem do operador, sem texto técnico; provado por tests/eventos-sse.test.ts
- `src/lib/ambiente.ts` (M, +4/-0) — O1 configuração: getter novo de MAX_TOKENS_RESPOSTA; provado por tests/ambiente.test.ts
- `src/servicos/chat-erros.ts` (A, +53/-0) — O1 vazamento de detalhe: decide o que o operador e o visitante veem de um erro; provado por tests/chat-erros.test.ts
- `src/servicos/chat.ts` (A, +152/-0) — O1 turno de conversa: usa a chave do OpenRouter decifrada, define a ordem das gravações (pergunta antes, resposta só no fim), o descarte da resposta parcial e o log sem conteúdo; provado por tests/chat.test.ts e tests/chat-falhas.test.ts
- `src/servicos/conversas.ts` (A, +206/-0) — O2 autorização por posse: conversa de outro usuário, canal ou agente vira 404; provado por tests/conversas.test.ts
- `src/servicos/integracoes.ts` (M, +12/-0) — O1 segredo: função nova que só diz se há chave gravada, sem decifrar; provado por tests/integracoes.test.ts

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` (M, +4/-0) — L2 documenta MAX_TOKENS_RESPOSTA sem valor secreto; conferido por tests/projeto.test.ts
- `README.md` (M, +8/-0) — L2 documentação de uso conferida por tests/projeto.test.ts
- `src/app/(sistema)/agentes/[id]/page.tsx` (M, +1/-1) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/[id]/testar/loading.tsx` (A, +15/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/[id]/testar/page.tsx` (A, +29/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/ChatDeTeste.tsx` (A, +291/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/Icones.tsx` (M, +2/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/TextoDoModelo.tsx` (A, +46/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/abas-do-agente.ts` (M, +4/-1) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/estado-da-conversa.ts` (A, +152/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/itens-de-menu.ts` (M, +2/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/leitor-de-sse.ts` (A, +102/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/texto-seguro.ts` (A, +112/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/servicos/chat-prompt.ts` (A, +57/-0) — L1 monta o prompt e limita o histórico; funções puras cobertas por tests/chat-prompt.test.ts (o ponto de extensão da FT-05 mora aqui)

### DISPENSÁVEL — a máquina já provou

- `docs/conversa-de-teste/00-AUDITORIA.md` (A, +16/-0)
- `docs/conversa-de-teste/00-BLOQUEIOS.md` (A, +14/-0)
- `docs/conversa-de-teste/00-DECISOES.md` (A, +213/-0)
- `docs/conversa-de-teste/BRIEFING-BUILDX.md` (A, +42/-0)
- `docs/conversa-de-teste/FECHAMENTO.md` (A, +36/-0)
- `docs/conversa-de-teste/ORQUESTRADOR.md` (A, +102/-0)
- `docs/conversa-de-teste/RELATORIO-FEATURE.md` (A, +45/-0)
- `docs/conversa-de-teste/VERIFICACAO-VISUAL.md` (A, +26/-0)
- `docs/conversa-de-teste/base/00-INDICE.md` (A, +33/-0)
- `docs/conversa-de-teste/base/00-LACUNAS.md` (A, +10/-0)
- `docs/conversa-de-teste/base/banco-e-testes.md` (A, +27/-0)
- `docs/conversa-de-teste/base/interface-do-agente.md` (A, +28/-0)
- `docs/conversa-de-teste/base/servicos-handlers-e-sessao.md` (A, +28/-0)
- `docs/conversa-de-teste/base/streaming-e-openrouter.md` (A, +32/-0)
- `docs/conversa-de-teste/sprint-01/tasks.md` (A, +140/-0)
- `docs/conversa-de-teste/sprint-02/tasks.md` (A, +177/-0)
- `docs/conversa-de-teste/sprint-03/tasks.md` (A, +141/-0)
- `docs/conversa-de-teste/sprint-04/tasks.md` (A, +141/-0)
- `docs/conversa-de-teste/sprint-05/tasks.md` (A, +176/-0)
- `docs/conversa-de-teste/sprint-06/tasks.md` (A, +140/-0)
- `docs/conversa-de-teste/sprint-07/tasks.md` (A, +177/-0)
- `docs/entregas/conversa-de-teste/ATENCAO.md` (A, +100/-0)
- `docs/entregas/conversa-de-teste/ENTREGA.md` (A, +253/-0)
- `docs/entregas/conversa-de-teste/PR.md` (A, +185/-0)
- `docs/entregas/conversa-de-teste/QA-PACOTE.md` (A, +110/-0)
- `docs/projeto/MAPA.md` (M, +7/-4)
- `docs/projeto/PREMISSAS.md` (M, +54/-2)
- `docs/projeto/PROJETO.md` (M, +1/-1)
- `docs/projeto/RECURSAO.md` (M, +2/-2)
- `docs/stack/CONVENCOES.md` (M, +10/-6)
- `docs/stack/LACUNAS.md` (M, +3/-1)
- `src/estilos/global.css` (M, +111/-0)
- `tests/abas-do-agente.test.tsx` (M, +3/-2)
- `tests/ajuda.ts` (M, +2/-0)
- `tests/ambiente.test.ts` (M, +23/-1)
- `tests/apoio/chat.ts` (A, +39/-0)
- `tests/apoio/servir-falso.ts` (A, +29/-0)
- `tests/chat-de-teste.test.tsx` (A, +139/-0)
- `tests/chat-erros.test.ts` (A, +93/-0)
- `tests/chat-falhas.test.ts` (A, +172/-0)
- `tests/chat-prompt.test.ts` (A, +91/-0)
- `tests/chat.test.ts` (A, +212/-0)
- `tests/conversar-rota.test.ts` (A, +271/-0)
- `tests/conversas-modelo.test.ts` (A, +105/-0)
- `tests/conversas.test.ts` (A, +234/-0)
- `tests/estado-da-conversa.test.ts` (A, +159/-0)
- `tests/eventos-sse.test.ts` (A, +119/-0)
- `tests/integracoes.test.ts` (M, +15/-0)
- `tests/leitor-de-sse.test.ts` (A, +116/-0)
- `tests/projeto.test.ts` (M, +12/-0)
- `tests/rotas.test.ts` (M, +90/-0)
- `tests/texto-seguro.test.tsx` (A, +109/-0)
