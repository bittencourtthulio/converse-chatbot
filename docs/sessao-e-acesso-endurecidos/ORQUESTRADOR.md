---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
titulo: Sessao e acesso endurecidos
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-01
atualizado_em: 2026-10-01
concluido_em: 2026-10-01
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06]
caminho_critico: [F-01.1, F-01.2, F-02.1, F-02.2, F-02.3, F-03.1, F-03.2, F-04.1, F-04.2, F-05.1, F-05.2, F-06.1, F-06.2]
modulo_afetado: [apresentacao, aplicacao, infraestrutura, testes, documentacao]
arquivos_alterados: [".env.example", ".gitignore", "README.md", "docs/entregas/sessao-e-acesso-endurecidos/ATENCAO.md", "docs/entregas/sessao-e-acesso-endurecidos/ENTREGA.md", "docs/entregas/sessao-e-acesso-endurecidos/PR.md", "docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/sessao-e-acesso-endurecidos/00-AUDITORIA.md", "docs/sessao-e-acesso-endurecidos/00-BLOQUEIOS.md", "docs/sessao-e-acesso-endurecidos/00-DECISOES.md", "docs/sessao-e-acesso-endurecidos/BRIEFING-BUILDX.md", "docs/sessao-e-acesso-endurecidos/FECHAMENTO.md", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "docs/sessao-e-acesso-endurecidos/ORQUESTRADOR.md", "docs/sessao-e-acesso-endurecidos/RELATORIO-FEATURE.md", "docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md", "docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md", "docs/sessao-e-acesso-endurecidos/base/00-INDICE.md", "docs/sessao-e-acesso-endurecidos/base/00-LACUNAS.md", "docs/sessao-e-acesso-endurecidos/base/guardas-de-acesso.md", "docs/sessao-e-acesso-endurecidos/base/limites-de-uso.md", "docs/sessao-e-acesso-endurecidos/base/proxy-e-renovacao.md", "docs/sessao-e-acesso-endurecidos/base/sessao-e-cookie.md", "docs/sessao-e-acesso-endurecidos/base/testes-expurgo-e-ambiente.md", "docs/sessao-e-acesso-endurecidos/base/troca-de-senha-e-versao.md", "docs/sessao-e-acesso-endurecidos/sprint-01/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-01/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-01/tasks.md", "docs/sessao-e-acesso-endurecidos/sprint-02/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-02/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-02/tasks.md", "docs/sessao-e-acesso-endurecidos/sprint-03/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-03/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-03/tasks.md", "docs/sessao-e-acesso-endurecidos/sprint-04/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-04/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-04/tasks.md", "docs/sessao-e-acesso-endurecidos/sprint-05/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-05/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-05/tasks.md", "docs/sessao-e-acesso-endurecidos/sprint-06/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-06/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-06/tasks.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "package-lock.json", "package.json", "prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/migration.sql", "prisma/schema.prisma", "src/app/(sistema)/configuracoes/auditoria/page.tsx", "src/app/(sistema)/conversas/[id]/page.tsx", "src/app/acoes.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts", "src/app/renovar-sessao.ts", "src/app/sessao-servidor.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/lib/limite-de-uso.ts", "src/lib/sessao.ts", "src/proxy.ts", "src/servicos/auditoria.ts", "src/servicos/autenticacao.ts", "src/servicos/chat-publico.ts", "src/servicos/expurgo.ts", "src/servicos/perfil.ts", "tests/acao-autenticar-limite.test.ts", "tests/acao-sair.test.ts", "tests/acao-salvar-senha.test.ts", "tests/ajuda.ts", "tests/ambiente-validar.test.ts", "tests/ambiente.test.ts", "tests/apoio-login-http.test.ts", "tests/apoio-next-falso.test.ts", "tests/apoio/guardas.ts", "tests/apoio/login-http.ts", "tests/apoio/next-falso.ts", "tests/auditoria-guarda.test.ts", "tests/auditoria-somente-acrescimo.test.ts", "tests/auditoria.test.ts", "tests/autenticacao.test.ts", "tests/backup-servico.test.ts", "tests/chat-publico.test.ts", "tests/conversas-detalhe-guarda.test.tsx", "tests/expurgo-agendador.test.ts", "tests/expurgo-sessoes.test.ts", "tests/expurgo.test.ts", "tests/guardas-arquitetura.test.ts", "tests/limite-de-uso.test.ts", "tests/perfil.test.ts", "tests/projeto.test.ts", "tests/proxy-renovacao.test.ts", "tests/publico-conversa-limite.test.ts", "tests/publico-conversa-rota.test.ts", "tests/sessao-cookie.test.ts", "tests/sessao-esquema.test.ts", "tests/sessao-fim-a-fim.test.ts", "tests/sessao-renovacao.test.ts", "tests/sessao-revogacao.test.ts", "tests/sessao-token.test.ts", "tests/sessao-versao.test.ts"]
palavras_chave: [sessao, jwt, revogacao, renovacao, cookie, limite, guarda, proxy]
---

# Orquestrador — sessao-e-acesso-endurecidos

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/sessao-e-acesso-endurecidos (base: buildx/b5-ciclo-2) — aberta em 2026-10-01 pela mergex

## 1. Objetivo

O usuário que sai tem a sessão encerrada de fato (identificador `jti` e tabela de revogados), quem usa o sistema continua logado por renovação deslizante com limite absoluto de duração, o login logo depois de trocar a senha funciona (contador de versão de sessão) e o excesso de tentativas de login e de leituras públicas é barrado. Cada proteção tem teste que falha sem ela; as guardas de tela, rota e serviço de administração têm teste de arquitetura. Realiza PR-12, PR-16, PR-27, PR-31, PR-36 e PR-56 (FT-12 do `docs/projeto/MAPA.md`) e cria as premissas PR-101 a PR-104.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (D-00 a D-22; premissas novas PR-101 a PR-104 em `docs/projeto/PREMISSAS.md`)
3. `BRIEFING-BUILDX.md` e `base/00-INDICE.md` — e os arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md` (relógio e cookies falsos, login por formulário em produção)
5. `sprint-02/` (token, revogação, versão, renovação, expurgo), `sprint-03/` (ação sair, troca de senha, proxy), `sprint-04/` (limite de login e de leitura pública, guardas), `sprint-05/` (ponta a ponta), `sprint-06/` (documentação, verificação, fechamento)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos
8. `MUTACOES.md` — a mutação temporária que prova cada proteção (criado na T-01.01)

Entrega da mergex: `docs/entregas/sessao-e-acesso-endurecidos/ENTREGA.md`.

## 3. Rota de execução

Tudo é sequencial; nenhuma fase nem task foi declarada paralelizável (o banco de teste é um arquivo só e a suíte roda sem paralelismo).

- Sprint 01: F-01.1 → F-01.2
- Sprint 02: F-02.1 → F-02.2 → F-02.3
- Sprint 03: F-03.1 → F-03.2
- Sprint 04: F-04.1 → F-04.2
- Sprint 05: F-05.1 → F-05.2
- Sprint 06: F-06.1 → F-06.2

**Caminho crítico:** todas as fases, na ordem acima.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; a verificação no navegador usa a extensão do Chrome ou, se ela não conectar, um Chrome próprio sem janela com `--user-data-dir` novo e `--remote-debugging-port=0` (porta livre), confirmando que o alvo é a aba própria e a URL é a do servidor local antes de interagir; serviços externos são simulados (`tests/apoio/openrouter-falso.ts`).
- **Testes:** `npm test` (suíte inteira, exige `npm run build` antes dos testes de rota); um arquivo: `npx vitest run tests/<arquivo>.test.ts`. Nunca dois ao mesmo tempo. Não exportar `DATABASE_URL` ao rodar os testes (só o `build` a precisa). Portas dos servidores de produção dos testes novos: 3250 (`tests/apoio-login-http.test.ts`), 3251 (`tests/publico-conversa-limite.test.ts`), 3252 (`tests/sessao-fim-a-fim.test.ts`).
- **Build antes dos testes de servidor:** os testes que sobem `next start` (`tests/apoio-login-http.test.ts`, `tests/publico-conversa-limite.test.ts`, `tests/sessao-fim-a-fim.test.ts` e os de rota existentes) usam o `.next` que existir; rode `npm run build` depois da última mudança em `src/` e antes deles. Uma suíte inteira só vale como `verde` com um build posterior à última mudança em `src/`.
- **Citações de linha:** `tests/projeto.test.ts` confere citações `arquivo:linha` de `docs/stack/CONVENCOES.md` e `LACUNAS.md`; toda task que altera `src/` reajusta as citações nos três arquivos (declarados em `arquivos.altera`).
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (precisa de `DATABASE_URL` e `JWT_SECRET` no ambiente); auditoria de dependências: `npm audit --audit-level=high`; migrations: `npx prisma migrate deploy` e `npx prisma generate` (o cliente em `src/gerado` é ignorado pelo git).
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` — ficam no arquivo local de ambiente (que o agente não toca), passados inline ao build e ao servidor de verificação (valores descartáveis) e definidos em `tests/setup.ts` nos testes. NUNCA escreva o valor. Variável nova: `SESSAO_MAXIMA_HORAS` (não é segredo; lida só em `src/lib/ambiente.ts`, documentada em `.env.example`).

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem. Quando a proteção já existe e só falta a prova (T-04.01, T-03.02, T-02.04), o "vermelho" vem da mutação temporária, registrada em `MUTACOES.md`.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte (`parcial` quando rodou subconjunto, `verde` só quando a suíte inteira rodou; nunca reescreva `parcial` para `verde` sem rodar — PEND-10).
7. Critério de saída de fase/sprint não atendido = não avança.
8. Máquina compartilhada: `database is locked` ou estouro de tempo com carga alheia se resolve esperando, não culpando o código; não mate processo que você não iniciou.

## 7. Definição de pronto global

- `sair` grava o `jti` em `sessoes_revogadas` e o token copiado antes do logout é recusado (página 307, API 401) contra o servidor de produção; outras sessões do mesmo usuário continuam.
- Usuário ativo continua logado além de `JWT_TTL_SEGUNDOS` por renovação do cookie no proxy; inativo é derrubado; nenhuma sessão passa de `SESSAO_MAXIMA_HORAS`; token revogado ou de versão antiga não renova.
- Login logo depois da troca de senha funciona; duas trocas seguidas deixam só a última sessão; usuários existentes seguem na versão 0.
- O limite de login (5 por minuto por IP e e-mail, 20 por IP) está provado na ação `autenticar`; o GET público da conversa tem limite; os atributos do cookie estão provados em unidade, na ação e no `Set-Cookie` real.
- `auditoria.listar` e a página de detalhe da conversa se defendem sozinhas; o teste de arquitetura enumera telas e rotas e a varredura dos serviços está em `VARREDURA-DE-GUARDAS.md`.
- Cada proteção tem a mutação registrada em `MUTACOES.md`; `npx tsc --noEmit`, `npm run lint`, `npm run build`, a suíte inteira e `npm audit --audit-level=high` (0) verdes; verificação no navegador registrada; MAPA, PREMISSAS (PR-101 a PR-104) e RECURSAO (PEND-12 a PEND-17 resolvidas) fechados.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
