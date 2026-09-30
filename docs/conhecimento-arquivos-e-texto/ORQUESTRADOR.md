---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
titulo: Base de conhecimento, arquivos e textos
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f4
status: em_andamento
criado_em: 2026-09-30
atualizado_em: 2026-09-30
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06, sprint-07]
caminho_critico: [T-01.01, T-01.03, T-01.04, T-03.07, T-03.09, T-04.01, T-04.02, T-04.03, T-04.04, T-04.05, T-04.06, T-05.01, T-05.02, T-05.03, T-05.04, T-06.01, T-06.03, T-06.04, T-06.05, T-06.06, T-07.01, T-07.02, T-07.03, T-07.04]
---

# Orquestrador — conhecimento-arquivos-e-texto

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/conhecimento-arquivos-e-texto (base: feat/conversa-de-teste) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-04 do projeto `plataforma-chatbot-ia`: o usuário sobe arquivos (PDF, Word, texto, Markdown, CSV, HTML, JSON, legendas) e cola textos na base de um agente e acompanha cada fonte de "processando" até "pronto" ou o motivo do erro (PR-05, PR-10, PR-11, PR-13). Entram o modelo `Fonte`/`Trecho`, o armazenamento em `STORAGE_DIR`, a validação e a extração por formato, a divisão em trechos, a fila em segundo plano no mesmo processo, o serviço, cinco rotas HTTP e a aba "Conhecimento". Busca e resposta com fontes são da FT-05.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões D-00 a D-22 (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os quatro arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/` a `sprint-07/`, na ordem, cada uma com `sprint.md`, `fases.md` e `tasks.md`
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `../projeto/PREMISSAS.md` (PR-45 a PR-49 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01 (capacidade de testar): F-01.1 (T-01.01 → T-01.02) → F-01.2 (T-01.03 → T-01.04)
- Sprint 02: F-02.1 (T-02.01, T-02.02, T-02.03) ∥ F-02.2 (T-02.04)
- Sprint 03: F-03.1 (T-03.01, T-03.02, T-03.03) ∥ F-03.2 (T-03.04 a T-03.08) → F-03.3 (T-03.09)
- Sprint 04: F-04.1 (T-04.01 → T-04.02) → F-04.2 (T-04.03 → T-04.04 → T-04.05) → F-04.3 (T-04.06)
- Sprint 05: F-05.1 (T-05.01 → T-05.02 → T-05.03) → F-05.2 (T-05.04)
- Sprint 06: F-06.1 (T-06.01) ∥ F-06.2 (T-06.02) → F-06.3 (T-06.03 → T-06.04) → F-06.4 (T-06.05 → T-06.06)
- Sprint 07: F-07.1 (T-07.01 → T-07.02 → T-07.03) → F-07.2 (T-07.04)

Só o que `fases.md` e `paralelizavel` declaram roda em paralelo; o executor, sendo único, faz as fases paralelas em sequência.

**Caminho crítico:** T-01.01 → T-01.03 → T-01.04 → T-03.07 → T-03.09 → T-04.01 → T-04.02 → T-04.03 → T-04.04 → T-04.05 → T-04.06 → T-05.01 → T-05.02 → T-05.03 → T-05.04 → T-06.01 → T-06.03 → T-06.04 → T-06.05 → T-06.06 → T-07.01 → T-07.02 → T-07.03 → T-07.04

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome) para a T-07.02, se disponíveis. Bibliotecas de execução novas: `unpdf`, `mammoth`, `parse5` (versão fixa).
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`); os testes de rota exigem `npm run build` antes.
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Migration:** SQL gerado por `prisma migrate diff` e gravado na pasta da migration (nunca `db push`); `npx prisma migrate deploy` aplica
- **Auditoria de dependências:** `npm audit --audit-level=high`
- **Segredos e configuração:** `JWT_SECRET`, `ENCRYPTION_KEY` por variável de ambiente inline ou em `tests/setup.ts`; `STORAGE_DIR` e `MAX_UPLOAD_MB` documentadas em `.env.example` (sem valor secreto). O arquivo de segredos local não é tocado. Nenhum teste chama a rede real.

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
5. Só rode em paralelo o que o plano declarou paralelizável.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Commit por task, em português, com a linha de coautoria; nenhum segredo em código, artefato, commit ou log.
9. Desvio real do plano (arquivo novo que a task não previu) entra em `arquivos` da task e em `desvios` do `ENTREGA.md` no momento em que acontece.

## 7. Definição de pronto global

- Na aba Conhecimento, o usuário envia arquivos dos nove formatos e cola um texto, vê cada fonte passar de "Na fila"/"Processando" para "Pronto" (ou "Erro" com o motivo), reprocessa a que falhou, exclui com confirmação e abre "Ver conteúdo" com os trechos paginados.
- Arquivo com extensão, conteúdo, tamanho ou descompactação inválidos é recusado por arquivo, com motivo em português e sem caminho interno; o nome enviado nunca entra em caminho.
- As cinco rotas respondem 401, 404, 413, 415, 422 e os sucessos, provado contra o servidor de produção com upload multipart real.
- Reiniciar o servidor devolve `processando` a `pendente` e a fila retoma; excluir fonte apaga arquivo e diretório; excluir agente apaga o diretório do agente.
- Tabelas `fontes` e `trechos` com cascata, migration só acrescenta; a seed traz uma fonte de exemplo pronta.
- Suíte, `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` verdes; verificação visual registrada ou declarada não realizada; convenções atualizadas.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
