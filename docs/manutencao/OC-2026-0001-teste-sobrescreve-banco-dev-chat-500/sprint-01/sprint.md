---
expx_schema: 1
expx_tool: runx
kind: sprint
trabalho_id: OC-2026-0001
sprint_id: sprint-01
titulo: Isolar os scripts de teste do env do desenvolvedor
status: concluido
criterio_saida: npm test termina com 0 failed e o hash de prisma/dev.db e igual antes e depois
fases: [F-01.1]
riscos: [Outro teste com variavel indefinida pode ler o env do desenvolvedor por outro caminho]
atualizado_em: 2026-10-28
---

# Sprint 01 — Isolar os scripts de teste do env do desenvolvedor

## Objetivo

Impedir que `rodarScript` deixe o `dotenv/config` dos scripts preencher uma variável que o teste deixou indefinida, o que fazia `backup` e `restore` rodarem contra `prisma/dev.db`.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Regressão e isolamento do helper | nenhuma |

## Critério de saída

`npm test` termina com 0 failed e `shasum prisma/dev.db` é igual antes e depois da suíte.

## Riscos conhecidos

- Outro teste que dependa de variável indefinida por outro caminho (ver `01-CAUSA-RAIZ.md`, opção B).

## Fora de escopo

- `scripts/backup.ts`, `scripts/restore.ts`, `scripts/criar-admin.ts` — script de operação real não muda (D-01).
- `src/lib/cripto.ts`, `src/servicos/chat.ts` — comportamento correto (D-02).
- `prisma.config.ts:14` (fallback para `dev.db`) — sugestão de nova ocorrência.
- Recuperar os dados de desenvolvimento perdidos — decisão do usuário (`base/00-LACUNAS.md`, item 4).
