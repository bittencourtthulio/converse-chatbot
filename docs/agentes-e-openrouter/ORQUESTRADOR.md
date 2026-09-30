---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
titulo: Agentes e chave do OpenRouter
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f4
status: em_andamento
criado_em: 2026-09-30
atualizado_em: 2026-09-30
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06]
caminho_critico: [T-01.01, T-03.03, T-05.01, T-05.02, T-05.03, T-05.04, T-05.05, T-05.06, T-05.07, T-05.08, T-06.01, T-06.02, T-06.03]
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: []
palavras_chave: [openrouter, agentes, cripto, segredo, sse, integracoes, modelo, temperatura]
worktree: null
---

# Orquestrador — agentes-e-openrouter

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/agentes-e-openrouter (base: feat/fundacao-e-esqueleto) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-02 do projeto `plataforma-chatbot-ia`: o admin cadastra a chave do OpenRouter (criptografada em repouso, só a máscara volta à tela) em Configurações > Integrações, e qualquer usuário cria, edita e exclui agentes escolhendo instruções, modelo, temperatura e mensagem inicial. Entra junto o adaptador do OpenRouter (modelos, verificação de chave e conversa em stream com parser SSE) e o servidor simulado reutilizável pelas FT-03 e FT-05.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os quatro arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/tasks.md` → `sprint-02/tasks.md` → `sprint-03/tasks.md` → `sprint-04/tasks.md` → `sprint-05/tasks.md` → `sprint-06/tasks.md` (uma fase por sprint, formato condensado)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `../projeto/PREMISSAS.md` (PR-38, PR-39, PR-40 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1, sequencial (T-01.01, T-01.02 e T-01.03 → T-01.04)
- Sprint 02: F-02.1, sequencial (T-02.01 → T-02.02 e T-02.03 → T-02.04)
- Sprint 03: F-03.1, sequencial (T-03.01 → T-03.02; T-03.03; T-03.04 → T-03.05)
- Sprint 04: F-04.1, sequencial (T-04.01 → T-04.02 e T-04.03)
- Sprint 05: F-05.1, sequencial (T-05.01 → T-05.02 → T-05.03 → T-05.04 → T-05.05 → T-05.06 → T-05.07 → T-05.08)
- Sprint 06: F-06.1, sequencial (T-06.01 → T-06.02 → T-06.03)

Nenhuma fase nem task roda em paralelo: o plano declara `paralelizavel: false` em todas; a execução segue a ordem dos ids respeitando `depende_de`.

**Caminho crítico:** T-01.01 → T-03.03 → T-05.01 → T-05.02 → T-05.03 → T-05.04 → T-05.05 → T-05.06 → T-05.07 → T-05.08 → T-06.01 → T-06.02 → T-06.03

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome) para a task T-06.01, se disponíveis.
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`)
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Migration:** `npx prisma migrate dev --name <nome>` com `DATABASE_URL` inline (nunca `db push`)
- **Auditoria de dependências:** `npm audit --audit-level=high`
- **Segredos:** `JWT_SECRET`, `DATABASE_URL` e `ENCRYPTION_KEY` — por variável de ambiente inline no comando, ou definidos em `tests/setup.ts` para teste; documentados em `.env.example` (sem valor). NUNCA escreva o valor. Nenhum teste chama a rede real: `OPENROUTER_BASE_URL` aponta para `tests/apoio/openrouter-falso.ts`.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md`, marcar a task `bloqueada`, pular para a próxima. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável (nada).
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Commit por task, em português, com a linha de coautoria; nenhum segredo em código, artefato, commit ou log.
9. Desvio real do plano (arquivo novo que a task não previu) entra em `arquivos` da task e em `desvios` do `ENTREGA.md` no momento em que acontece.

## 7. Definição de pronto global

- O admin grava a chave do OpenRouter, vê só a máscara, testa a conexão (contra o servidor simulado) e remove; a chave em claro e o texto cifrado nunca aparecem em HTML, JSON, log ou mensagem de erro.
- Um usuário cria, edita e exclui agente (nome, instruções, modelo, temperatura, mensagem inicial) com confirmação na tela; o menu tem Agentes e, para admin, Integrações.
- `src/lib/openrouter.ts` lista modelos (cache e reserva), verifica chave e conversa em stream, com parser SSE testado e erros do provedor em pt-BR; `tests/apoio/openrouter-falso.ts` é reutilizável.
- Seed com o "Assistente de exemplo"; teste das migrations contra `DROP` sem marca.
- Suíte, `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` verdes; verificação visual registrada ou declarada não realizada; convenções atualizadas.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
