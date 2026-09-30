---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
titulo: Fundacao e esqueleto de aplicacao
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-09-30
atualizado_em: 2026-09-30
concluido_em: 2026-09-30
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05]
caminho_critico: [T-01.01, T-01.02, T-02.02, T-03.03, T-03.04, T-04.01, T-04.03, T-04.04, T-05.02, T-05.03]
modulo_afetado: [apresentacao, aplicacao, infraestrutura, testes, pipeline, documentacao]
arquivos_alterados: [.env.example, .github/workflows/ci.yml, .gitignore, README.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md, eslint.config.mjs, next.config.ts, package.json, src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx, src/app/(sistema)/configuracoes/usuarios/layout.tsx, src/app/(sistema)/configuracoes/usuarios/loading.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx, src/app/(sistema)/error.tsx, src/app/(sistema)/layout.tsx, src/app/(sistema)/page.tsx, src/app/(sistema)/perfil/page.tsx, src/app/(sistema)/perfil/senha/page.tsx, src/app/acoes.ts, src/app/entrar/page.tsx, src/app/layout.tsx, src/app/sessao-servidor.ts, src/componentes/Alerta.tsx, src/componentes/AlternadorDeTema.tsx, src/componentes/Badge.tsx, src/componentes/BarraLateral.tsx, src/componentes/Cabecalho.tsx, src/componentes/CabecalhoDaPagina.tsx, src/componentes/CascaDoSistema.tsx, src/componentes/Esqueleto.tsx, src/componentes/EstadoVazio.tsx, src/componentes/Formulario.tsx, src/componentes/FormularioDeLogin.tsx, src/componentes/Icones.tsx, src/componentes/Logotipo.tsx, src/componentes/MenuDoUsuario.tsx, src/componentes/Navegacao.tsx, src/componentes/iniciais.ts, src/componentes/itens-de-menu.ts, src/estilos/global.css, src/estilos/tokens.css, src/lib/ambiente.ts, src/lib/erros.ts, src/lib/limite-de-uso.ts, src/lib/requisicao.ts, src/servicos/autenticacao.ts, tests/ambiente.test.ts, tests/camadas.test.ts, tests/componentes.test.tsx, tests/iniciais.test.ts, tests/limite-de-login.test.ts, tests/limite-de-uso.test.ts, tests/menu.test.ts, tests/projeto.test.ts, tests/requisicao.test.ts, tests/rotas.test.ts, tests/seed.test.ts, tests/tokens.test.ts, vitest.config.ts]
palavras_chave: [saas, tokens, tema, login, limite-de-uso, cabecalhos, camadas, ci]
worktree: null
---

# Orquestrador — fundacao-e-esqueleto

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/fundacao-e-esqueleto (base: main) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-01 do projeto `plataforma-chatbot-ia`: o esqueleto de autenticação, papéis, painel, usuários, perfil e troca de senha (herdado do template, verde com 61 testes) passa a ter cara de SaaS (barra lateral, cabeçalho, temas claro e escuro, gaveta no celular), nome do produto por `APP_NAME`, limite de tentativas de login e módulo de limite de uso reutilizável, cabeçalhos de segurança, regra de lint das camadas, CI, README, seed verificada e convenções convertidas em evidência.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os cinco arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos vindos do buildx
5. `sprint-01/tasks.md` → `sprint-02/tasks.md` → `sprint-03/tasks.md` → `sprint-04/tasks.md` → `sprint-05/tasks.md` (cada sprint tem uma fase só, no formato condensado)
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos
8. `../projeto/PREMISSAS.md` (PR-35, PR-36 e PR-37 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01: F-01.1, sequencial (T-01.01 → T-01.02 → T-01.03 e T-01.04)
- Sprint 02: F-02.1, sequencial (T-02.01, T-02.02 → T-02.03 → T-02.04, T-02.05)
- Sprint 03: F-03.1, sequencial (T-03.01 → T-03.02 → T-03.03 → T-03.04)
- Sprint 04: F-04.1, sequencial (T-04.01 → T-04.02 e T-04.03 → T-04.04)
- Sprint 05: F-05.1, sequencial (T-05.01 → T-05.02 → T-05.03)

Nenhuma fase nem task roda em paralelo: o plano declara `paralelizavel: false` em todas, e a execução segue a ordem dos ids respeitando `depende_de`.

**Caminho crítico:** T-01.01 → T-01.02 → T-02.02 → T-03.03 → T-03.04 → T-04.01 → T-04.03 → T-04.04 → T-05.02 → T-05.03

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome) para a task T-04.04, se disponíveis.
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`)
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Auditoria de dependências:** `npm audit --audit-level=high`
- **Segredos:** `JWT_SECRET` e `DATABASE_URL` — passados por variável de ambiente inline no comando, ou definidos em `tests/setup.ts` para teste; o exemplo documentado está em `.env.example` (sem valor). NUNCA escreva o valor.

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
8. Commit por task, em português, com a linha de coautoria; nenhum segredo em código, artefato, commit ou log.

## 7. Definição de pronto global

- Login com `admin@exemplo.local` ou `usuario@exemplo.local` (senha `demo1234`) leva ao painel; o admin cadastra um usuário que entra e troca a senha (rotas cobertas por `tests/rotas.test.ts`).
- Interface no estilo SaaS nos temas claro e escuro, gaveta abaixo de 768px, contraste 4,5:1 provado por `tests/tokens.test.ts`, sem cor literal fora de `src/estilos/tokens.css`.
- `APP_NAME` alimenta logotipo, título e login; cinco tentativas de login por minuto por IP e e-mail e vinte por IP.
- Cabeçalhos de segurança conferidos com o servidor de produção.
- `npm run lint` impõe a direção das camadas; `setup` usa `migrate deploy`; CI em `.github/workflows/ci.yml`; README do projeto.
- Suíte verde na árvore de trabalho e em cópia limpa; `npm audit --audit-level=high` com 0; `docs/stack/CONVENCOES.md` convertido com `commit-referencia`.
- Verificação visual registrada ou declarada não realizada.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
