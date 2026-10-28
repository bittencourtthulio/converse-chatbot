---
expx_schema: 1
expx_tool: runx
kind: orquestrador
trabalho_id: OC-2026-0001
titulo: Teste sobrescreve o banco de desenvolvimento e o chat devolve 500
tipo_trabalho: ocorrencia
tipo_ocorrencia: bug
estagio: e5
status: concluido
criado_em: 2026-10-28
atualizado_em: 2026-10-28
concluido_em: 2026-10-28
sprints: [sprint-01]
caminho_critico: [F-01.1, T-01.01, T-01.02, T-01.03]
---

# Orquestrador — OC-2026-0001

## 1. Objetivo

Testes de comando (`backup`, `restore`) rodavam contra `prisma/dev.db` porque o `dotenv/config` dos scripts preenchia `DATABASE_URL` a partir do arquivo de ambiente do desenvolvedor. O banco de desenvolvimento ficou com dados de fixture e o chat deu 500 (`segredo_ilegivel`). Corrigir o isolamento no helper de teste.

## 2. Mapa dos arquivos e ordem de leitura

1. `00-OCORRENCIA.md` — o relato.
2. `01-CAUSA-RAIZ.md` — causa comprovada, escopo e decisões D-01, D-02.
3. `base/` — `scripts-e-testes-de-comando.md`, `chave-openrouter-e-conversar.md`, `00-LACUNAS.md`.
4. `sprint-01/` — `sprint.md`, `fases.md`, `tasks.md`.
5. `BLOQUEIOS.md` — preenchido no E3.

## 3. Rota de execução

Sequencial, sem paralelismo: F-01.1 → T-01.01 (teste, deve falhar) → T-01.02 (fix). Caminho crítico: as duas tasks.

## 4. Ferramentas

- Teste: `npm test` (`vitest run`); um arquivo: `npx vitest run tests/backup-comando.test.ts`.
- Lint: `npm run lint`.
- Type check: `npx tsc --noEmit` (não há script; existe `tsconfig.json`).
- Guarda do banco: `shasum prisma/dev.db` antes e depois da suíte.

## 5. Regras de autonomia

Durante o E3 não se pergunta nada; dúvida vira registro em `BLOQUEIOS.md`. Só se tocam os arquivos de `arquivos` das tasks. Nunca ler nem imprimir o arquivo de ambiente do desenvolvedor (um hook da sessão o bloqueia).

## 6. Definição de pronto

- T-01.01 falhou antes do fix e passa depois.
- `npm test` com 0 failed; lint e type check sem erro novo.
- `shasum prisma/dev.db` igual antes e depois.
- QA aprovado; relatórios e `docs/relatorios/INDICE.md` gravados.

## 7. Como retomar

Olhar o disco: sem `QA.md` e com task pendente em `sprint-01/tasks.md`, é E3; continuar pela primeira task `pendente` com dependências concluídas.
