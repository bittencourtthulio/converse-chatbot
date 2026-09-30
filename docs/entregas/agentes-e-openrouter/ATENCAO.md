---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
raio: null
olho_obrigatorio: 11
leitura_rapida: 22
dispensavel: 52
atualizado_em: 2026-09-30
---

# Atenção humana — agentes-e-openrouter

Sem modo legado e sem raio calculado: a classificação vem do tipo de arquivo e da evidência das tasks. O histórico do memox foi consultado para cada arquivo do diff e não trouxe regressão, reprovação de QA nem zona de risco. Segredo, autorização, migração de banco e efeito externo com credencial ficam em OLHO OBRIGATÓRIO; interface, configuração e infraestrutura já coberta por teste em LEITURA RÁPIDA; testes, estilos e documentos em DISPENSÁVEL, porque a suíte de 398 testes os exerce. O tamanho do diff não entrou no critério.

### OLHO OBRIGATÓRIO — ler linha a linha

- `prisma/migrations/20260930145651_configuracao_do_workspace/migration.sql` (A, +7/-0) — O3 migração de banco: só CREATE TABLE (verificado por tests/migracoes.test.ts)
- `prisma/migrations/20260930150122_agentes/migration.sql` (A, +13/-0) — O3 migração de banco: só CREATE TABLE (verificado por tests/migracoes.test.ts)
- `prisma/schema.prisma` (M, +33/-0) — O3 migração/modelo de banco: acrescenta duas tabelas (configuracao_do_workspace guarda a chave cifrada; agentes com chave estrangeira); provado por tests/integracoes.test.ts e tests/agentes.test.ts
- `src/app/(sistema)/configuracoes/integracoes/layout.tsx` (A, +15/-0) — O2 guarda de admin no servidor (307 antes do carregamento); provado por tests/rotas.test.ts
- `src/app/(sistema)/configuracoes/integracoes/page.tsx` (A, +47/-0) — O1 exibe estado da chave: recebe só a máscara; provado por tests/rotas.test.ts (nem a chave nem o texto cifrado na resposta)
- `src/app/acoes.ts` (M, +113/-0) — O2 ações de servidor: chave do OpenRouter, exclusão de agente; mensagemSemSegredo evita vazar a chave em log; provado por tests/acoes-de-agente.test.ts e tests/rotas.test.ts
- `src/lib/ambiente.ts` (M, +18/-0) — O1 configuração e segredo: getter preguiçoso de ENCRYPTION_KEY e URLs do provedor; provado por tests/ambiente.test.ts
- `src/lib/cripto.ts` (A, +86/-0) — O1 segredo: AES-256-GCM, IV, validação de ENCRYPTION_KEY, mensagens sem valor de chave; provado por tests/cripto.test.ts
- `src/lib/openrouter.ts` (A, +191/-0) — O4 efeito externo com credencial: envia a chave em Authorization, timeouts, cancelamento e mapeamento de erros sem vazar corpo; provado por tests/openrouter.test.ts e tests/openrouter-conversar.test.ts contra servidor simulado (nunca contra o provedor real)
- `src/servicos/agentes.ts` (A, +183/-0) — O2 autorização e validação: decisão PR-40 de que qualquer usuário gerencia qualquer agente, exclusão definitiva, zod; provado por tests/agentes.test.ts
- `src/servicos/integracoes.ts` (A, +139/-0) — O1 segredo e autorização: só admin, grava cifrado, estado só com máscara, chave decifrada só para serviços; provado por tests/integracoes.test.ts e tests/integracoes-conexao.test.ts

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` (M, +15/-0) — L2 documenta ENCRYPTION_KEY, OPENROUTER_BASE_URL e APP_URL sem valor; conferido por tests/projeto.test.ts
- `README.md` (M, +13/-4) — L2 documentação de uso conferida por tests/projeto.test.ts
- `prisma/seed.ts` (M, +24/-0) — L1 acrescenta o agente de exemplo, sem chave; recusa em produção intacta; coberta por tests/seed.test.ts
- `src/app/(sistema)/agentes/(lista)/loading.tsx` (A, +10/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/(lista)/page.tsx` (A, +64/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/[id]/carregar-agente.ts` (A, +17/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/[id]/layout.tsx` (A, +29/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/[id]/loading.tsx` (A, +6/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/[id]/page.tsx` (A, +53/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/novo/loading.tsx` (A, +6/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/agentes/novo/page.tsx` (A, +30/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/app/(sistema)/configuracoes/integracoes/loading.tsx` (A, +6/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/AbasDoAgente.tsx` (A, +37/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/BotaoExcluirAgente.tsx` (A, +82/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/FormularioDeAgente.tsx` (A, +139/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/Icones.tsx` (M, +13/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/PainelDaChaveOpenrouter.tsx` (A, +130/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/SeletorDeModelo.tsx` (A, +80/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/abas-do-agente.ts` (A, +16/-0) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/componentes/itens-de-menu.ts` (M, +18/-1) — L1 interface ou componente coberto por teste de rota ou de componente
- `src/lib/erros.ts` (M, +48/-0) — L1 acréscimo de erroDoProvedor à classe de erro; coberto por tests/erros.test.ts
- `src/lib/sse.ts` (A, +70/-0) — L1 infraestrutura coberta por tests/sse.test.ts (14 casos: comentário, JSON partido, erro no meio do stream)

### DISPENSÁVEL — a suíte e a forma já garantem

- `docs/agentes-e-openrouter/00-AUDITORIA.md` (A, +18/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/00-BLOQUEIOS.md` (A, +14/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/00-DECISOES.md` (A, +221/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/BRIEFING-BUILDX.md` (A, +46/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/FECHAMENTO.md` (A, +36/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/ORQUESTRADOR.md` (A, +101/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/RELATORIO-FEATURE.md` (A, +45/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md` (A, +22/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/base/00-INDICE.md` (A, +33/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/base/00-LACUNAS.md` (A, +10/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/base/ambiente-e-segredos.md` (A, +27/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/base/banco-e-migrations.md` (A, +27/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/base/interface-e-menu.md` (A, +30/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/base/openrouter-api.md` (A, +39/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/sprint-01/tasks.md` (A, +216/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/sprint-02/tasks.md` (A, +218/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/sprint-03/tasks.md` (A, +255/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/sprint-04/tasks.md` (A, +179/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/sprint-05/tasks.md` (A, +331/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/agentes-e-openrouter/sprint-06/tasks.md` (A, +177/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/entregas/agentes-e-openrouter/ENTREGA.md` (A, +115/-0) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/projeto/MAPA.md` (M, +7/-4) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/projeto/PREMISSAS.md` (M, +41/-2) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/projeto/PROJETO.md` (M, +1/-1) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/projeto/RECURSAO.md` (M, +2/-2) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/stack/CONVENCOES.md` (M, +13/-10) — D3 documento do método ou do projeto, sem efeito em execução
- `docs/stack/LACUNAS.md` (M, +4/-2) — D3 documento do método ou do projeto, sem efeito em execução
- `src/estilos/global.css` (M, +121/-6) — D2 estilo visual em tokens; sem cor literal (tests/tokens.test.ts)
- `tests/abas-do-agente.test.tsx` (A, +59/-0) — D1 teste
- `tests/acoes-de-agente.test.ts` (A, +96/-0) — D1 teste
- `tests/agentes-modelos.test.ts` (A, +72/-0) — D1 teste
- `tests/agentes.test.ts` (A, +181/-0) — D1 teste
- `tests/ajuda.ts` (M, +2/-0) — D1 teste
- `tests/ambiente.test.ts` (M, +55/-0) — D1 teste
- `tests/apoio/openrouter-falso.ts` (A, +266/-0) — D1 teste
- `tests/componentes.test.tsx` (M, +52/-0) — D1 teste
- `tests/cripto.test.ts` (A, +137/-0) — D1 teste
- `tests/erros.test.ts` (A, +37/-0) — D1 teste
- `tests/formulario-de-agente.test.tsx` (A, +112/-0) — D1 teste
- `tests/integracoes-conexao.test.ts` (A, +103/-0) — D1 teste
- `tests/integracoes.test.ts` (A, +152/-0) — D1 teste
- `tests/menu.test.ts` (M, +36/-0) — D1 teste
- `tests/migracoes.test.ts` (A, +57/-0) — D1 teste
- `tests/openrouter-conversar.test.ts` (A, +137/-0) — D1 teste
- `tests/openrouter-falso.test.ts` (A, +213/-0) — D1 teste
- `tests/openrouter.test.ts` (A, +129/-0) — D1 teste
- `tests/projeto.test.ts` (M, +26/-1) — D1 teste
- `tests/rotas.test.ts` (M, +196/-4) — D1 teste
- `tests/seed.test.ts` (M, +26/-0) — D1 teste
- `tests/seletor-de-modelo.test.tsx` (A, +71/-0) — D1 teste
- `tests/setup.ts` (M, +3/-0) — D1 teste
- `tests/sse.test.ts` (A, +131/-0) — D1 teste
