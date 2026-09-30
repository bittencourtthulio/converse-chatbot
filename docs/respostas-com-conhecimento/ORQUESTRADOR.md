---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
titulo: Respostas com base no conhecimento
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f4
status: nao_iniciado
criado_em: 2026-09-30
atualizado_em: 2026-09-30
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06]
caminho_critico: [T-01.01, T-01.03, T-02.01, T-02.02, T-03.01, T-03.03, T-03.04, T-04.01, T-05.01, T-05.02, T-05.03, T-05.04, T-06.01, T-06.02, T-06.03]
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: []
palavras_chave: [fts5, bm25, recuperacao, trechos, fontes, prompt, citacao, busca]
---

# Orquestrador — respostas-com-conhecimento

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/respostas-com-conhecimento (base: feat/conhecimento-arquivos-e-texto) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-05 do projeto `plataforma-chatbot-ia`: o agente responde a partir das fontes da própria base, mostra de quais fontes tirou a resposta e diz que não sabe quando a base não cobre a pergunta (PR-04, PR-15, PR-30). Entram o índice FTS5 por migration, o serviço `buscarTrechos`, o modo fundamentado do turno de chat com prompt delimitado, o evento SSE `fontes` gravado em `Mensagem.fontes`, as Fontes na aba Testar, o cartão "Testar busca" e a rota `POST /api/agentes/[id]/buscar`. Canais públicos (FT-06, FT-07) herdam o modo sem mudança.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões D-00 a D-18 (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os três arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/` a `sprint-06/`, na ordem, cada uma com `sprint.md`, `fases.md` e `tasks.md`
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados da F5 (quando existir)
8. `../projeto/PREMISSAS.md` (PR-50 a PR-54 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01 (capacidade de testar e buscar): F-01.1 (T-01.01) → F-01.2 (T-01.02 → T-01.03)
- Sprint 02: F-02.1 (T-02.01) → F-02.2 (T-02.02 → T-02.03 → T-02.04)
- Sprint 03: F-03.1 (T-03.01 → T-03.02) → F-03.2 (T-03.03 → T-03.04 → T-03.05)
- Sprint 04: F-04.1 (T-04.01 → T-04.02) → F-04.2 (T-04.03)
- Sprint 05: F-05.1 (T-05.01 → T-05.02) → F-05.2 (T-05.03 → T-05.04)
- Sprint 06: F-06.1 (T-06.01 → T-06.02) → F-06.2 (T-06.03)

Nenhuma fase nem task foi declarada paralela (`paralelizavel: false` em todas): o executor faz tudo em sequência.

**Caminho crítico:** T-01.01 → T-01.03 → T-02.01 → T-02.02 → T-03.01 → T-03.03 → T-03.04 → T-04.01 → T-05.01 → T-05.02 → T-05.03 → T-05.04 → T-06.01 → T-06.02 → T-06.03

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome) para a T-06.02, se disponíveis. Nenhuma biblioteca nova.
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`); os testes de rota exigem `npm run build` antes.
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Auditoria de dependências:** `npm audit --audit-level=high` (deve dar 0)
- **Migrations:** `npx prisma migrate deploy` (nunca `db push`, PR-30)
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` — ficam no arquivo de segredos local (que o agente não toca) e são passados inline nos comandos; `tests/setup.ts` define os de teste. NUNCA escreva o valor. Nenhuma variável nova nesta feature.

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
8. Commit por task (mergex E1); arquivo novo não previsto entra em `arquivos` da task e em `desvios` do `ENTREGA.md`.

## 7. Definição de pronto global

- Migration `busca_fts5` aplica do zero por `migrate deploy`; o índice acompanha insert, update, delete, cascata de fonte e agente e reprocessamento (sprint 01).
- `buscarTrechos` devolve só trechos de fontes `pronto` do agente, por BM25, até 6, sem nunca concatenar o texto do usuário no SQL, e a saudação "olá" devolve lista vazia (sprint 02).
- Contra o OpenRouter falso, a requisição do turno mostra material numerado e delimitado com instrução anti-injeção, o trecho malicioso fica dentro do bloco, e a pergunta fora da base gera a instrução de "não encontrei" (sprint 03).
- O SSE emite `fontes` antes do `fim`, `Mensagem.fontes` guarda o JSON e falha de gravação das fontes não derruba a resposta (sprints 03 e 04).
- A aba Testar mostra Fontes e `[n]` clicável e as recupera ao recarregar; "Testar busca" mostra os trechos com pontuação (sprint 05).
- Suíte inteira, `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes; portão da mergex PRONTO; MAPA.md com a FT-05 entregue (sprint 06).

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
