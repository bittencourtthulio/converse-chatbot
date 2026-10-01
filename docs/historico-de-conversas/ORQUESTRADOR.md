---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
titulo: Historico de conversas e painel
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-10-01
atualizado_em: 2026-10-01
concluido_em: 2026-10-01
sprints: ['sprint-01', 'sprint-02', 'sprint-03', 'sprint-04', 'sprint-05', 'sprint-06']
caminho_critico: ['T-01.01', 'T-01.02', 'T-01.03', 'T-01.04', 'T-02.01', 'T-02.02', 'T-02.03', 'T-02.04', 'T-02.05', 'T-03.01', 'T-03.02', 'T-03.03', 'T-04.01', 'T-04.02', 'T-04.03', 'T-04.04', 'T-05.01', 'T-05.02', 'T-05.03', 'T-05.04', 'T-06.01', 'T-06.02', 'T-06.03', 'T-06.04']
modulo_afetado: [apresentacao, aplicacao, banco, testes, documentacao]
arquivos_alterados: [".env.example", ".gitignore", "README.md", "docs/entregas/historico-de-conversas/ATENCAO.md", "docs/entregas/historico-de-conversas/ENTREGA.md", "docs/entregas/historico-de-conversas/PR.md", "docs/entregas/historico-de-conversas/QA-PACOTE.md", "docs/historico-de-conversas/00-AUDITORIA.md", "docs/historico-de-conversas/00-BLOQUEIOS.md", "docs/historico-de-conversas/00-DECISOES.md", "docs/historico-de-conversas/BRIEFING-BUILDX.md", "docs/historico-de-conversas/FECHAMENTO.md", "docs/historico-de-conversas/ORQUESTRADOR.md", "docs/historico-de-conversas/RELATORIO-FEATURE.md", "docs/historico-de-conversas/VERIFICACAO-VISUAL.md", "docs/historico-de-conversas/base/00-INDICE.md", "docs/historico-de-conversas/base/00-LACUNAS.md", "docs/historico-de-conversas/base/canais-e-rotulos.md", "docs/historico-de-conversas/base/conversas-e-modelo.md", "docs/historico-de-conversas/base/painel-e-agregacao.md", "docs/historico-de-conversas/base/seed-testes-e-ci.md", "docs/historico-de-conversas/base/telas-menu-e-componentes.md", "docs/historico-de-conversas/sprint-01/fases.md", "docs/historico-de-conversas/sprint-01/sprint.md", "docs/historico-de-conversas/sprint-01/tasks.md", "docs/historico-de-conversas/sprint-02/fases.md", "docs/historico-de-conversas/sprint-02/sprint.md", "docs/historico-de-conversas/sprint-02/tasks.md", "docs/historico-de-conversas/sprint-03/fases.md", "docs/historico-de-conversas/sprint-03/sprint.md", "docs/historico-de-conversas/sprint-03/tasks.md", "docs/historico-de-conversas/sprint-04/fases.md", "docs/historico-de-conversas/sprint-04/sprint.md", "docs/historico-de-conversas/sprint-04/tasks.md", "docs/historico-de-conversas/sprint-05/fases.md", "docs/historico-de-conversas/sprint-05/sprint.md", "docs/historico-de-conversas/sprint-05/tasks.md", "docs/historico-de-conversas/sprint-06/fases.md", "docs/historico-de-conversas/sprint-06/sprint.md", "docs/historico-de-conversas/sprint-06/tasks.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "package-lock.json", "package.json", "prisma/seed.ts", "src/app/(sistema)/(painel)/loading.tsx", "src/app/(sistema)/(painel)/page.tsx", "src/app/(sistema)/conversas/(lista)/loading.tsx", "src/app/(sistema)/conversas/(lista)/page.tsx", "src/app/(sistema)/conversas/[id]/carregar-conversa.ts", "src/app/(sistema)/conversas/[id]/layout.tsx", "src/app/(sistema)/conversas/[id]/loading.tsx", "src/app/(sistema)/conversas/[id]/not-found.tsx", "src/app/(sistema)/conversas/[id]/page.tsx", "src/app/(sistema)/page.tsx", "src/app/api/conversas/[id]/exportar/route.ts", "src/app/api/conversas/[id]/route.ts", "src/app/api/conversas/apagar/route.ts", "src/app/api/conversas/resposta.ts", "src/componentes/AcoesDaConversa.tsx", "src/componentes/BadgeDeCanal.tsx", "src/componentes/CartoesDoPainel.tsx", "src/componentes/ConversasRecentes.tsx", "src/componentes/FiltrosDeConversas.tsx", "src/componentes/GraficoDeMensagens.tsx", "src/componentes/ListaComSelecao.tsx", "src/componentes/ListaDeConversas.tsx", "src/componentes/PrimeirosPassos.tsx", "src/componentes/TranscricaoDaConversa.tsx", "src/componentes/apagar-conversas.ts", "src/componentes/conversas-logica.ts", "src/componentes/itens-de-menu.ts", "src/componentes/painel-logica.ts", "src/estilos/global.css", "src/estilos/tokens.css", "src/servicos/historico-logica.ts", "src/servicos/historico.ts", "src/servicos/painel.ts", "tests/apoio/contador-de-consultas.ts", "tests/apoio/historico.ts", "tests/apoio/servir-falso.ts", "tests/apoio/servir-telegram-falso.ts", "tests/contador-de-consultas.test.ts", "tests/conversas-apagar-rota.test.ts", "tests/conversas-detalhe-rota.test.ts", "tests/conversas-detalhe-ui.test.tsx", "tests/conversas-exportar-rota.test.ts", "tests/conversas-lista-estilos.test.ts", "tests/conversas-lista-ui.test.tsx", "tests/conversas-logica.test.ts", "tests/conversas-lote-ui.test.tsx", "tests/grafico-de-mensagens.test.tsx", "tests/historico-apagar.test.ts", "tests/historico-apoio.test.ts", "tests/historico-consultas.test.ts", "tests/historico-listar.test.ts", "tests/historico-logica.test.ts", "tests/historico-obter.test.ts", "tests/historico-texto.test.ts", "tests/menu.test.ts", "tests/painel-logica.test.ts", "tests/painel-numeros.test.ts", "tests/painel-passos.test.ts", "tests/painel-serie.test.ts", "tests/painel-ui.test.tsx", "tests/projeto.test.ts", "tests/rotas.test.ts", "tests/seed-conversas.test.ts", "tests/seed.test.ts", "tests/sqlite-formatos.test.ts", "tests/tokens-historico.test.ts"]
palavras_chave: [historico, conversas, painel, filtros, exportacao, lgpd, grafico, agregacao]
---

# Orquestrador — historico-de-conversas

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/historico-de-conversas (base: feat/conhecimento-em-video) — aberta em 2026-10-01 pela mergex

## 1. Objetivo

FT-09 do projeto `plataforma-chatbot-ia`: o usuário lê as conversas de todos os canais, filtra por agente e canal, vê as fontes de cada resposta, apaga uma conversa (ou várias) e vê no painel inicial os números de agentes, fontes e mensagens, com gráfico acessível dos últimos 14 dias. Entram o serviço `src/servicos/historico.ts`, as rotas de apagar e exportar, as telas `/conversas` e `/conversas/[id]`, o serviço `src/servicos/painel.ts` e a seed com conversas fictícias. Realiza a parte de apagar conversa do PR-18; empilha na ponta da pilha (FT-08).

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões D-00 a D-15 (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os cinco arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/` a `sprint-06/`, na ordem, cada uma com `sprint.md`, `fases.md` e `tasks.md`
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados da F5 (quando existir)
8. `../projeto/PREMISSAS.md` (PR-78 a PR-85 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01 (capacidade de testar): F-01.1 (T-01.01 → T-01.02 → T-01.03) → F-01.2 (T-01.04)
- Sprint 02: F-02.1 (T-02.01 → T-02.02 → T-02.03) → F-02.2 (T-02.04 → T-02.05)
- Sprint 03: F-03.1 (T-03.01 → T-03.02) → F-03.2 (T-03.03)
- Sprint 04: F-04.1 (T-04.01 → T-04.02) → F-04.2 (T-04.03 → T-04.04)
- Sprint 05: F-05.1 (T-05.01 → T-05.02) → F-05.2 (T-05.03 → T-05.04)
- Sprint 06: F-06.1 (T-06.01 → T-06.02 → T-06.03) → F-06.2 (T-06.04)

Nenhuma fase nem task foi declarada paralela (`paralelizavel: false` em todas): o executor faz tudo em sequência, na ordem acima.

**Caminho crítico:** T-01.01, T-01.02, T-01.03, T-01.04, T-02.01, T-02.02, T-02.03, T-02.04, T-02.05, T-03.01, T-03.02, T-03.03, T-04.01, T-04.02, T-04.03, T-04.04, T-05.01, T-05.02, T-05.03, T-05.04, T-06.01, T-06.02, T-06.03, T-06.04

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome, via ToolSearch) para a T-06.02, se disponíveis. Nenhuma dependência nova prevista.
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`); os testes de rota exigem `npm run build` antes. Nunca dois `vitest` ao mesmo tempo (compartilham `prisma/test.db`); `DATABASE_URL` não é exportada ao rodar testes.
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Auditoria de dependências:** `npm audit --audit-level=high` (deve dar 0)
- **Migrations:** nenhuma prevista (a feature não muda o esquema); se surgir, só acrescenta e é escrita à mão.
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` passados inline nos comandos; `tests/setup.ts` define os de teste. NUNCA escreva valor real.
- **Convenção de suíte:** `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado.

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

## 7. Definição de pronto global

- O usuário lê as conversas dos três canais em `/conversas`, filtra por agente, canal, texto e período, e abre o detalhe com as fontes de cada resposta.
- Apagar uma conversa e apagar em lote funcionam com confirmação na tela, cascata nas mensagens e ouvinte `aoApagarConversa` sem conteúdo.
- Exportar baixa `.txt` sem dado pessoal no nome; conteúdo de visitante nunca vira HTML.
- O painel inicial mostra números, gráfico de 14 dias acessível, conversas recentes, alerta de fontes com erro e primeiros passos, mantendo título e subtítulo.
- A listagem prova ausência de N+1 por teste; a agregação do painel tem teste de borda de dia e de fuso.
- A seed traz duas conversas fictícias; tsc, lint, build, a suíte inteira e `npm audit --audit-level=high` (0) estão verdes; a verificação no navegador está registrada.
- MAPA, PREMISSAS (PR-78 a PR-85), RECURSAO, CONVENCOES e LACUNAS atualizados.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
