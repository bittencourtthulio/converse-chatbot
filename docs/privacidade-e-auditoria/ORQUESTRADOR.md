---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
titulo: Privacidade e auditoria
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-01
atualizado_em: 2026-10-01
concluido_em: 2026-10-01
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06, sprint-07]
caminho_critico: [F-01.1, F-01.2, F-02.1, F-02.2, F-03.1, F-03.2, F-04.1, F-04.2, F-05.1, F-05.2, F-06.1, F-06.2, F-06.3, F-07.1, F-07.2]
---

# Orquestrador — privacidade-e-auditoria

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/privacidade-e-auditoria (base: feat/historico-de-conversas) — aberta em 2026-10-01 pela mergex

## 1. Objetivo

O admin define por quantos dias as conversas ficam guardadas (expurgo automático), exclui definitivamente um usuário da equipe e consulta o registro somente-acréscimo de quem alterou chave, usuários, agentes e canais. Inclui os direitos do titular (admin exporta e apaga; o visitante apaga a própria conversa), o aviso de privacidade padrão e o painel de dados pessoais tratados. Realiza PR-18 e PR-19 (FT-10 do `docs/projeto/MAPA.md`).

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (D-00 a D-25; premissas novas PR-86 a PR-91 em `docs/projeto/PREMISSAS.md`)
3. `BRIEFING-BUILDX.md` e `base/00-INDICE.md` — e os arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md` (esquema, fixtures, ambiente)
5. `sprint-02/` (serviço de auditoria e ligações), `sprint-03/` (exclusão de usuário, retenção, aviso), `sprint-04/` (expurgo), `sprint-05/` (titular e visitante), `sprint-06/` (telas), `sprint-07/` (prova, verificação, fechamento)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

Entrega da mergex: `docs/entregas/privacidade-e-auditoria/ENTREGA.md`.

## 3. Rota de execução

Tudo é sequencial; nenhuma fase nem task foi declarada paralelizável.

- Sprint 01: F-01.1 → F-01.2
- Sprint 02: F-02.1 → F-02.2
- Sprint 03: F-03.1 → F-03.2
- Sprint 04: F-04.1 → F-04.2
- Sprint 05: F-05.1 → F-05.2
- Sprint 06: F-06.1 → F-06.2 → F-06.3
- Sprint 07: F-07.1 → F-07.2

**Caminho crítico:** todas as fases, na ordem acima: F-01.1 → F-01.2 → F-02.1 → F-02.2 → F-03.1 → F-03.2 → F-04.1 → F-04.2 → F-05.1 → F-05.2 → F-06.1 → F-06.2 → F-06.3 → F-07.1 → F-07.2.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a verificação no navegador usa a extensão do Chrome ou um Chrome sem janela por CDP; serviços externos são simulados (`tests/apoio/openrouter-falso.ts`, `tests/apoio/telegram-falso.ts`).
- **Testes:** `npm test` (suíte inteira, exige `npm run build` antes dos testes de rota); um arquivo: `npx vitest run tests/<arquivo>.test.ts`. Nunca dois ao mesmo tempo.
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (precisa de `DATABASE_URL` e `JWT_SECRET` no ambiente); auditoria de dependências: `npm audit --audit-level=high`
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` — ficam no arquivo local de ambiente (que o agente não toca), passados inline ao build e definidos em `tests/setup.ts` nos testes. NUNCA escreva o valor. Variável nova: `AUDITORIA_RETENCAO_DIAS` (não é segredo, documentada no exemplo de ambiente).

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Commit por task (mergex E1); `suite` é `parcial` quando rodou subconjunto e `verde` quando a suíte inteira rodou; a suíte inteira roda ao fechar toda task que mexe em código compartilhado.

## 7. Definição de pronto global

- O admin troca a chave do OpenRouter, cria, edita e exclui usuário, conecta e desconecta o Telegram simulado, apaga conversa e ajusta a retenção, e vê cada ação na tela `/configuracoes/auditoria` (D-21 de `00-DECISOES.md`).
- O expurgo apaga só o que passou do corte, em lotes, e roda pela subida do servidor; testes de fronteira passam (T-04.01, T-04.02).
- O visitante apaga a própria conversa e nunca a de outro; o admin busca, exporta e apaga os dados de um titular (T-05.01 a T-05.04).
- Nenhuma rota ou ação altera ou apaga registro de auditoria além da purga por idade (T-02.02).
- `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test` (suíte inteira) e `npm audit --audit-level=high` (0) verdes; verificação no navegador registrada; MAPA, PREMISSAS, RECURSAO e PROJETO fechados (T-07.04).

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
