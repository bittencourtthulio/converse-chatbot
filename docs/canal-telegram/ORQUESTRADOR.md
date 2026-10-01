---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
titulo: Canal Telegram
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f4
status: em_andamento
criado_em: 2026-09-30
atualizado_em: 2026-09-30
concluido_em: null
sprints: ['sprint-01', 'sprint-02', 'sprint-03', 'sprint-04', 'sprint-05', 'sprint-06', 'sprint-07']
caminho_critico: ['T-01.01', 'T-01.02', 'T-01.03', 'T-02.01', 'T-02.02', 'T-02.03', 'T-03.01', 'T-03.02', 'T-03.03', 'T-04.01', 'T-04.02', 'T-04.03', 'T-04.04', 'T-05.01', 'T-05.02', 'T-06.01', 'T-06.02', 'T-07.01', 'T-07.02', 'T-07.03']
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: []
palavras_chave: [telegram, webhook, bot, token, canal, dedupe, limite, segredo]
---

# Orquestrador — canal-telegram

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/canal-telegram (base: feat/chat-embutido) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-07 do projeto `plataforma-chatbot-ia`: o usuário conecta o token de um bot do Telegram a um agente e passa a conversar com esse agente pelo aplicativo (PR-07, PR-14, PR-16). Entram os modelos do canal e de dedupe, o adaptador `src/lib/telegram.ts`, o simulado `tests/apoio/telegram-falso.ts`, o serviço do canal, o webhook `POST /api/telegram/[agenteId]/webhook` com resposta rápida, o atendimento (comandos, fontes, limites), a aba Canais e as variáveis `TELEGRAM_API_BASE` e `TELEGRAM_PERMITIR_URL_NAO_HTTPS`. A FT-07 não depende funcionalmente da FT-06: a branch só empilha sobre ela.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões D-00 a D-13 (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os quatro arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/` a `sprint-07/`, na ordem, cada uma com `sprint.md`, `fases.md` e `tasks.md`
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados da F5 (quando existir)
8. `../projeto/PREMISSAS.md` (PR-63 a PR-70 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01 (capacidade de testar): F-01.1 (T-01.01 → T-01.02) → F-01.2 (T-01.03)
- Sprint 02: F-02.1 (T-02.01) → F-02.2 (T-02.02 → T-02.03)
- Sprint 03: F-03.1 (T-03.01) → F-03.2 (T-03.02 → T-03.03)
- Sprint 04: F-04.1 (T-04.01) → F-04.2 (T-04.02 → T-04.03 → T-04.04)
- Sprint 05: F-05.1 (T-05.01) → F-05.2 (T-05.02)
- Sprint 06: F-06.1 (T-06.01) → F-06.2 (T-06.02)
- Sprint 07: F-07.1 (T-07.01 → T-07.02) → F-07.2 (T-07.03)

Nenhuma fase nem task foi declarada paralela (`paralelizavel: false` em todas): o executor faz tudo em sequência.

**Caminho crítico:** T-01.01, T-01.02, T-01.03, T-02.01, T-02.02, T-02.03, T-03.01, T-03.02, T-03.03, T-04.01, T-04.02, T-04.03, T-04.04, T-05.01, T-05.02, T-06.01, T-06.02, T-07.01, T-07.02, T-07.03

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome, via ToolSearch) para a T-07.01, se disponíveis. Nenhuma dependência nova prevista.
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`); os testes de rota exigem `npm run build` antes. Nunca dois `vitest` ao mesmo tempo (compartilham `prisma/test.db`); `DATABASE_URL` não é exportada ao rodar testes.
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Auditoria de dependências:** `npm audit --audit-level=high` (deve dar 0)
- **Migrations:** `npx prisma migrate deploy` (nunca `db push`, PR-30); a migration nova é escrita à mão e conferida com `prisma migrate diff` ou `migrate dev` num banco temporário.
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` passados inline nos comandos; `tests/setup.ts` define os de teste. O token do bot de teste é um valor fictício definido no teste. NUNCA escreva valor real.
- **Convenção de suíte:** `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Commit por task (mergex E1); arquivo novo não previsto entra em `arquivos` da task e em `desvios` do `ENTREGA.md`.

## 7. Definição de pronto global

- A migration `canal_telegram` aplica do zero e só acrescenta; modelos e variáveis passam nos testes e o simulado do Telegram está testado (sprint 01).
- O adaptador cobre os seis métodos com erro em português e o token nunca aparece em erro, log ou pilha (sprint 02).
- O serviço conecta com token cifrado, segredo em hash e HTTPS exigido, e desconecta, pausa, retoma e verifica (sprint 03).
- O atendimento autentica, deduplica, trata comandos, responde com fontes em texto puro e aplica os limites (sprint 04).
- O webhook responde 200 rápido e atende depois contra `next start`; as ações de servidor gerenciam o canal sem expor o token (sprint 05).
- A aba Canais mostra o cartão do Telegram com todos os estados, aviso de `APP_URL`, 375 px e dois temas (sprint 06).
- Suíte inteira, `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes; verificação ponta a ponta registrada; portão da mergex PRONTO; MAPA.md com a FT-07 entregue (sprint 07).

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
