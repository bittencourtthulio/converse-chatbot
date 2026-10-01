---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
titulo: Chat embutido por script
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-09-30
atualizado_em: 2026-09-30
concluido_em: 2026-09-30
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06, sprint-07]
caminho_critico: [T-01.01, T-01.02, T-01.03, T-01.04, T-01.05, T-02.01, T-02.02, T-02.03, T-02.04, T-02.05, T-03.01, T-03.02, T-03.03, T-03.04, T-04.01, T-04.02, T-04.03, T-04.04, T-05.01, T-05.02, T-05.03, T-06.01, T-06.02, T-06.03, T-06.04, T-07.01, T-07.02, T-07.03]
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", ".gitignore", "README.md", "docs/chat-embutido/00-AUDITORIA.md", "docs/chat-embutido/00-BLOQUEIOS.md", "docs/chat-embutido/00-DECISOES.md", "docs/chat-embutido/BRIEFING-BUILDX.md", "docs/chat-embutido/FECHAMENTO.md", "docs/chat-embutido/ORQUESTRADOR.md", "docs/chat-embutido/RELATORIO-FEATURE.md", "docs/chat-embutido/VERIFICACAO-VISUAL.md", "docs/chat-embutido/base/00-INDICE.md", "docs/chat-embutido/base/00-LACUNAS.md", "docs/chat-embutido/base/api-publica-e-limites.md", "docs/chat-embutido/base/configuracao-e-painel.md", "docs/chat-embutido/base/embed-e-csp.md", "docs/chat-embutido/base/widget-e-script.md", "docs/chat-embutido/sprint-01/fases.md", "docs/chat-embutido/sprint-01/sprint.md", "docs/chat-embutido/sprint-01/tasks.md", "docs/chat-embutido/sprint-02/fases.md", "docs/chat-embutido/sprint-02/sprint.md", "docs/chat-embutido/sprint-02/tasks.md", "docs/chat-embutido/sprint-03/fases.md", "docs/chat-embutido/sprint-03/sprint.md", "docs/chat-embutido/sprint-03/tasks.md", "docs/chat-embutido/sprint-04/fases.md", "docs/chat-embutido/sprint-04/sprint.md", "docs/chat-embutido/sprint-04/tasks.md", "docs/chat-embutido/sprint-05/fases.md", "docs/chat-embutido/sprint-05/sprint.md", "docs/chat-embutido/sprint-05/tasks.md", "docs/chat-embutido/sprint-06/fases.md", "docs/chat-embutido/sprint-06/sprint.md", "docs/chat-embutido/sprint-06/tasks.md", "docs/chat-embutido/sprint-07/fases.md", "docs/chat-embutido/sprint-07/sprint.md", "docs/chat-embutido/sprint-07/tasks.md", "docs/entregas/chat-embutido/ATENCAO.md", "docs/entregas/chat-embutido/ENTREGA.md", "docs/entregas/chat-embutido/PR.md", "docs/entregas/chat-embutido/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "next.config.ts", "package-lock.json", "package.json", "prisma/migrations/20260930210000_configuracao_do_chat/migration.sql", "prisma/schema.prisma", "prisma/seed.ts", "src/app/(sistema)/agentes/[id]/publicar/loading.tsx", "src/app/(sistema)/agentes/[id]/publicar/page.tsx", "src/app/acoes.ts", "src/app/api/publico/agentes/[id]/config/route.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts", "src/app/api/publico/agentes/[id]/conversar/route.ts", "src/app/api/publico/resposta.ts", "src/app/embed/[id]/not-found.tsx", "src/app/embed/[id]/page.tsx", "src/app/eventos-sse.ts", "src/app/widget.js/route.ts", "src/componentes/AvatarDoChat.tsx", "src/componentes/ChatEmbutido.tsx", "src/componentes/CodigoParaIncorporar.tsx", "src/componentes/FormularioDoChat.tsx", "src/componentes/PainelDePublicacao.tsx", "src/componentes/PreviaDoChat.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/embed-logica.ts", "src/componentes/embed-mensagens.ts", "src/componentes/publicar-logica.ts", "src/estilos/global.css", "src/estilos/tokens.css", "src/lib/ambiente.ts", "src/lib/cor.ts", "src/lib/dominios-permitidos.ts", "src/proxy.ts", "src/servicos/chat-publico-config.ts", "src/servicos/chat-publico-limites.ts", "src/servicos/chat-publico.ts", "src/widget/widget.js", "tests/abas-do-agente.test.tsx", "tests/ajuda.ts", "tests/ambiente-dom.test.ts", "tests/ambiente.test.ts", "tests/apoio/dom.ts", "tests/apoio/publico.ts", "tests/apoio/servir-site-de-teste.ts", "tests/chat-embutido-ui.test.tsx", "tests/chat-publico-config-publica.test.ts", "tests/chat-publico-config.test.ts", "tests/chat-publico-limites.test.ts", "tests/chat-publico.test.ts", "tests/configuracao-do-chat-modelo.test.ts", "tests/cor.test.ts", "tests/dominios-permitidos.test.ts", "tests/embed-cabecalhos.test.ts", "tests/embed-logica.test.ts", "tests/embed-mensagens.test.ts", "tests/embed-pagina.test.ts", "tests/eventos-sse.test.ts", "tests/projeto.test.ts", "tests/publicar-acao.test.ts", "tests/publicar-logica.test.ts", "tests/publicar-rota.test.ts", "tests/publicar-ui.test.tsx", "tests/publico-config-rota.test.ts", "tests/publico-conversa-rota.test.ts", "tests/publico-conversar-rota.test.ts", "tests/rotas.test.ts", "tests/seed.test.ts", "tests/widget-interacao.test.ts", "tests/widget-montagem.test.ts", "tests/widget-rota.test.ts"]
palavras_chave: [widget, iframe, embed, cors, frame-ancestors, limite, visitante, proxy]
---

# Orquestrador — chat-embutido

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/chat-embutido (base: feat/respostas-com-conhecimento) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-06 do projeto `plataforma-chatbot-ia`: o usuário copia um script de uma linha, cola em um site, e um visitante anônimo conversa com o agente por um botão flutuante, dentro dos domínios e dos limites de uso definidos (PR-08, PR-16, PR-17 e o aviso de privacidade do PR-18). Entram a configuração do chat por agente, a API pública (config, conversar, conversa) com limites e teto diário, o `widget.js`, a página `/embed/[id]` com `frame-ancestors` dinâmico por `proxy.ts`, a aba Publicar e a seed publicada.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões D-00 a D-19 (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os quatro arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/` a `sprint-07/`, na ordem, cada uma com `sprint.md`, `fases.md` e `tasks.md`
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados da F5 (quando existir)
8. `../projeto/PREMISSAS.md` (PR-55 a PR-62 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01 (capacidade de testar): F-01.1 (T-01.01 → T-01.02 → T-01.03) → F-01.2 (T-01.04 → T-01.05)
- Sprint 02: F-02.1 (T-02.01 → T-02.02) → F-02.2 (T-02.03 → T-02.04 → T-02.05)
- Sprint 03: F-03.1 (T-03.01 → T-03.02 → T-03.03) → F-03.2 (T-03.04)
- Sprint 04: F-04.1 (T-04.01 → T-04.02) → F-04.2 (T-04.03 → T-04.04)
- Sprint 05: F-05.1 (T-05.01 → T-05.02) → F-05.2 (T-05.03)
- Sprint 06: F-06.1 (T-06.01 → T-06.02) → F-06.2 (T-06.03 → T-06.04)
- Sprint 07: F-07.1 (T-07.01 → T-07.02) → F-07.2 (T-07.03)

Nenhuma fase nem task foi declarada paralela (`paralelizavel: false` em todas): o executor faz tudo em sequência.

**Caminho crítico:** T-01.01, T-01.02, T-01.03, T-01.04, T-01.05, T-02.01, T-02.02, T-02.03, T-02.04, T-02.05, T-03.01, T-03.02, T-03.03, T-03.04, T-04.01, T-04.02, T-04.03, T-04.04, T-05.01, T-05.02, T-05.03, T-06.01, T-06.02, T-06.03, T-06.04, T-07.01, T-07.02, T-07.03

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome, via ToolSearch) para a T-07.02, se disponíveis. Dependência nova: `happy-dom` (devDependência de versão fixa, T-01.05).
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`); os testes de rota exigem `npm run build` antes. Nunca dois `vitest` ao mesmo tempo (compartilham `prisma/test.db`); `DATABASE_URL` não é exportada ao rodar testes.
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Auditoria de dependências:** `npm audit --audit-level=high` (deve dar 0)
- **Migrations:** `npx prisma migrate deploy` (nunca `db push`, PR-30)
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` passados inline nos comandos; `tests/setup.ts` define os de teste. NUNCA escreva o valor. Variável nova: `APP_URL` já existe, ganha a leitura opcional `appUrlPublica`.
- **Convenção de suíte:** `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado (D-19).

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

- A migration `configuracao_do_chat` aplica do zero e só acrescenta; dominios, cor, configuração e limites com teto diário passam nos testes (sprints 01 e 02).
- `GET config` só devolve campos visuais, 404 idêntico para inativo e inexistente, CORS pela lista; `POST conversar` faz stream SSE com fontes reduzidas, erro sempre genérico ao visitante, 429 com `Retry-After`, posse da conversa e `Origin` (sprint 03).
- `/embed/*` sai com `frame-ancestors` conforme a lista (vazia `*`, inativo e inexistente `'self'`) e sem `X-Frame-Options`; o resto segue com `DENY`, provado contra `next start` (sprint 03).
- A página `/embed/[id]` abre sem login, com visitante em `localStorage` protegido e prévia por sessão (sprint 04).
- `widget.js` monta botão e painel em Shadow DOM, é idempotente, silencioso se inativo, confere `event.origin`, e a rota o serve com os cabecalhos do PR-60 (sprint 05).
- A aba Publicar configura, pré-visualiza e copia o snippet; a seed publica o agente de exemplo (sprint 06).
- Suíte inteira, `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes; verificação no navegador registrada; portão da mergex PRONTO; MAPA.md com a FT-06 entregue (sprint 07).

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
