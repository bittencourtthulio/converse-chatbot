---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
titulo: Conversa de teste com o agente
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-09-30
atualizado_em: 2026-09-30
concluido_em: 2026-09-30
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06, sprint-07]
caminho_critico: [T-01.01, T-02.01, T-03.01, T-03.02, T-04.01, T-04.02, T-06.02, T-07.01, T-07.02, T-07.03]
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", "README.md", "docs/conversa-de-teste/00-AUDITORIA.md", "docs/conversa-de-teste/00-BLOQUEIOS.md", "docs/conversa-de-teste/00-DECISOES.md", "docs/conversa-de-teste/BRIEFING-BUILDX.md", "docs/conversa-de-teste/FECHAMENTO.md", "docs/conversa-de-teste/ORQUESTRADOR.md", "docs/conversa-de-teste/RELATORIO-FEATURE.md", "docs/conversa-de-teste/VERIFICACAO-VISUAL.md", "docs/conversa-de-teste/base/00-INDICE.md", "docs/conversa-de-teste/base/00-LACUNAS.md", "docs/conversa-de-teste/base/banco-e-testes.md", "docs/conversa-de-teste/base/interface-do-agente.md", "docs/conversa-de-teste/base/servicos-handlers-e-sessao.md", "docs/conversa-de-teste/base/streaming-e-openrouter.md", "docs/conversa-de-teste/sprint-01/tasks.md", "docs/conversa-de-teste/sprint-02/tasks.md", "docs/conversa-de-teste/sprint-03/tasks.md", "docs/conversa-de-teste/sprint-04/tasks.md", "docs/conversa-de-teste/sprint-05/tasks.md", "docs/conversa-de-teste/sprint-06/tasks.md", "docs/conversa-de-teste/sprint-07/tasks.md", "docs/entregas/conversa-de-teste/ATENCAO.md", "docs/entregas/conversa-de-teste/ENTREGA.md", "docs/entregas/conversa-de-teste/PR.md", "docs/entregas/conversa-de-teste/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20260930170000_conversas/migration.sql", "prisma/schema.prisma", "src/app/(sistema)/agentes/[id]/page.tsx", "src/app/(sistema)/agentes/[id]/testar/loading.tsx", "src/app/(sistema)/agentes/[id]/testar/page.tsx", "src/app/api/agentes/[id]/conversar/route.ts", "src/app/eventos-sse.ts", "src/componentes/ChatDeTeste.tsx", "src/componentes/Icones.tsx", "src/componentes/TextoDoModelo.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/estado-da-conversa.ts", "src/componentes/itens-de-menu.ts", "src/componentes/leitor-de-sse.ts", "src/componentes/texto-seguro.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/servicos/chat-erros.ts", "src/servicos/chat-prompt.ts", "src/servicos/chat.ts", "src/servicos/conversas.ts", "src/servicos/integracoes.ts", "tests/abas-do-agente.test.tsx", "tests/ajuda.ts", "tests/ambiente.test.ts", "tests/apoio/chat.ts", "tests/apoio/servir-falso.ts", "tests/chat-de-teste.test.tsx", "tests/chat-erros.test.ts", "tests/chat-falhas.test.ts", "tests/chat-prompt.test.ts", "tests/chat.test.ts", "tests/conversar-rota.test.ts", "tests/conversas-modelo.test.ts", "tests/conversas.test.ts", "tests/estado-da-conversa.test.ts", "tests/eventos-sse.test.ts", "tests/integracoes.test.ts", "tests/leitor-de-sse.test.ts", "tests/projeto.test.ts", "tests/rotas.test.ts", "tests/texto-seguro.test.tsx"]
palavras_chave: [conversa, chat, streaming, sse, openrouter, mensagens, erro, painel]
worktree: null
---

# Orquestrador — conversa-de-teste

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/conversa-de-teste (base: feat/agentes-e-openrouter) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-03 do projeto `plataforma-chatbot-ia`: o usuário conversa com um agente na aba "Testar" do painel e vê a resposta do modelo chegando trecho a trecho, com mensagem clara quando o provedor falha (PR-22). Entram o modelo de dados de conversa e mensagem reutilizável pelos canais futuros, o serviço do turno (`responderMensagem`), as duas saídas de mensagem de erro (operador e visitante), o primeiro handler em `src/app/api` (stream SSE) e a interface de chat.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os quatro arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/tasks.md` → … → `sprint-07/tasks.md` (uma fase por sprint, formato condensado)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `../projeto/PREMISSAS.md` (PR-41 a PR-44 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1 (T-01.01 → T-01.02)
- Sprint 02: F-02.1 (T-02.01, T-02.02, T-02.03)
- Sprint 03: F-03.1 (T-03.01 → T-03.02)
- Sprint 04: F-04.1 (T-04.01 → T-04.02)
- Sprint 05: F-05.1 (T-05.01, T-05.02, T-05.03)
- Sprint 06: F-06.1 (T-06.01 → T-06.02)
- Sprint 07: F-07.1 (T-07.01 → T-07.02 → T-07.03)

Nenhuma fase nem task roda em paralelo: o plano declara `paralelizavel: false` em todas; a execução segue a ordem dos ids respeitando `depende_de`.

**Caminho crítico:** T-01.01 → T-02.01 → T-03.01 → T-03.02 → T-04.01 → T-04.02 → T-06.02 → T-07.01 → T-07.02 → T-07.03

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome) para a T-07.01, se disponíveis.
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`); os testes de rota exigem `npm run build` antes.
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Migration:** SQL gerado por `prisma migrate diff` e gravado na pasta da migration (nunca `db push`); `npx prisma migrate deploy` aplica
- **Auditoria de dependências:** `npm audit --audit-level=high`
- **Segredos:** por variável de ambiente inline no comando, ou definidos em `tests/setup.ts`; documentados em `.env.example` (sem valor). Nenhum teste chama a rede real: `OPENROUTER_BASE_URL` aponta para `tests/apoio/openrouter-falso.ts`.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, tratando cada papel como um portão.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado.
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md`, marcar a task `bloqueada`, pular para a próxima.
5. Só rode em paralelo o que o plano declarou paralelizável (nada).
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Commit por task, em português, com a linha de coautoria; nenhum segredo em código, artefato, commit ou log.
9. Desvio real do plano (arquivo novo que a task não previu) entra em `arquivos` da task e em `desvios` do `ENTREGA.md` no momento em que acontece.

## 7. Definição de pronto global

- Na aba Testar, com o OpenRouter falso, o usuário vê a resposta chegando trecho a trecho, para no meio, começa outra conversa, recarrega e retoma a última.
- Chave inválida, saldo, modelo ou provedor fora mostram mensagem clara ao operador (Alerta); `mensagemParaVisitante` devolve só a frase genérica; nada vaza corpo bruto, chave ou pilha.
- `POST /api/agentes/[id]/conversar` responde 401, 404, 422, 409 e o stream, provado contra o servidor de produção.
- Tabelas `conversas` e `mensagens` com cascata do agente, migration só acrescenta.
- Suíte, `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` verdes; verificação visual registrada ou declarada não realizada; convenções atualizadas.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
