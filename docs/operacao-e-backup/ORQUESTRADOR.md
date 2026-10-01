---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
titulo: Operação e backup
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-01
atualizado_em: 2026-10-01
concluido_em: 2026-10-01
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06, sprint-07, sprint-08]
caminho_critico: [F-01.1, F-01.2, F-02.1, F-02.2, F-03.1, F-03.2, F-04.1, F-04.2, F-05.1, F-05.2, F-05.3, F-06.1, F-06.2, F-07.1, F-07.2, F-08.1, F-08.2]
modulo_afetado: [apresentacao, aplicacao, infraestrutura, scripts, conteiner, testes, documentacao]
palavras_chave: [log, correlacao, saude, backup, restauracao, conteiner, docker, ambiente]
arquivos_alterados: []
---

# Orquestrador — operacao-e-backup

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/operacao-e-backup (base: feat/privacidade-e-auditoria) — aberta em 2026-10-01 pela mergex

## 1. Objetivo

O operador sobe o sistema por contêiner numa máquina limpa, vê o estado de saúde numa tela de Configurações e gera e restaura um backup do banco e dos arquivos. Inclui o log estruturado com redação e correlação (erro com código de referência, sem pilha), a configuração validada no start, o `GET /api/saude`, a tela Configurações > Sistema, o backup consistente em um `.tar.gz` com manifesto, a restauração só por linha de comando com o teste que a prova, o `Dockerfile`, o `docker-compose.yml`, o comando do primeiro administrador e a documentação operacional. Realiza PR-20, PR-21 e PR-24 (FT-11 do `docs/projeto/MAPA.md`) e cria as premissas PR-92 a PR-100.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (D-00 a D-29; premissas novas PR-92 a PR-100 em `docs/projeto/PREMISSAS.md`)
3. `BRIEFING-BUILDX.md` e `base/00-INDICE.md` — e os arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md` (dependências, instalação de teste, núcleo do log)
5. `sprint-02/` (log no sistema, correlação, erro com código de referência), `sprint-03/` (ambiente validado e saúde), `sprint-04/` (tela Sistema), `sprint-05/` (backup), `sprint-06/` (restauração e o teste da PR-20), `sprint-07/` (contêiner, desligamento, administrador inicial), `sprint-08/` (documentação, verificação, fechamento)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

Entrega da mergex: `docs/entregas/operacao-e-backup/ENTREGA.md`.

## 3. Rota de execução

Tudo é sequencial; nenhuma fase nem task foi declarada paralelizável.

- Sprint 01: F-01.1 → F-01.2
- Sprint 02: F-02.1 → F-02.2
- Sprint 03: F-03.1 → F-03.2
- Sprint 04: F-04.1 → F-04.2
- Sprint 05: F-05.1 → F-05.2 → F-05.3
- Sprint 06: F-06.1 → F-06.2
- Sprint 07: F-07.1 → F-07.2
- Sprint 08: F-08.1 → F-08.2

**Caminho crítico:** todas as fases, na ordem acima.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a verificação no navegador usa a extensão do Chrome ou, se ela não conectar, um Chrome próprio sem janela com `--user-data-dir` novo e `--remote-debugging-port=0`, confirmando o alvo antes de interagir; o contêiner é construído e executado com o Docker local (`docker info` responde); serviços externos são simulados (`tests/apoio/openrouter-falso.ts`, `tests/apoio/telegram-falso.ts`).
- **Testes:** `npm test` (suíte inteira, exige `npm run build` antes dos testes de rota); um arquivo: `npx vitest run tests/<arquivo>.test.ts`. Nunca dois ao mesmo tempo. Não exportar `DATABASE_URL` ao rodar os testes (só o `build` a precisa).
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (precisa de `DATABASE_URL` e `JWT_SECRET` no ambiente); auditoria de dependências: `npm audit --audit-level=high`
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` — ficam no arquivo local de ambiente (que o agente não toca), passados inline ao build e ao contêiner de verificação (valores descartáveis) e definidos em `tests/setup.ts` nos testes. NUNCA escreva o valor. Variáveis novas: `LOG_LEVEL`, `BACKUP_DIR`, `BACKUP_MANTER`, `ADMIN_SENHA` (a última só existe na linha de comando do administrador inicial; não é segredo versionado).

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
8. Commit por task (mergex E1); `suite` é `parcial` quando rodou subconjunto e `verde` quando a suíte inteira rodou; a suíte inteira roda ao fechar toda task que mexe em código compartilhado (log, proxy, ambiente, instrumentação, menu, auditoria, expurgo, fila, ações, `package.json`) e ao fim de cada sprint.
9. Nunca dois `vitest` ao mesmo tempo, não matar processo que não iniciou, e o navegador de verificação é só o meu (porta livre, alvo confirmado).

## 7. Definição de pronto global

- O `console.*` some de `src/` (fora de `src/lib/log.ts`), cada resposta leva `X-Correlacao`, e erro inesperado mostra o código de referência sem pilha em rota de API e em página (T-02.01 a T-02.07).
- O start de produção sem `JWT_SECRET`, `DATABASE_URL` e `ENCRYPTION_KEY` falha com os nomes; `GET /api/saude` responde `ok`, `degradado` ou `falha` sem detalhe; a tela Sistema mostra o detalhe só ao admin (T-03.01 a T-04.03).
- `npm run backup` e o botão geram um `.tar.gz` 0600 com manifesto e SHA-256, sem temporários e sem a `ENCRYPTION_KEY`; a auditoria `backup_gerado` aparece; o download só serve o `BACKUP_DIR` (T-05.01 a T-05.07).
- `npm run restore` restaura numa instalação limpa e `tests/restauracao-fim-a-fim.test.ts` confere os dados, a busca FTS, o arquivo, a auditoria `restauracao` e a chave cifrada; os casos de recusa não alteram nada (T-06.01 a T-06.05).
- A imagem constrói, o contêiner sobe com volume, responde `/api/saude`, tem `ffmpeg`, persiste após `down` e `up`, faz backup e restauração por dentro e desliga limpo (T-07.01 a T-07.05).
- `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test` (suíte inteira) e `npm audit --audit-level=high` (0) verdes; verificação no navegador registrada; MAPA, PREMISSAS e RECURSAO fechados (T-08.04).

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
