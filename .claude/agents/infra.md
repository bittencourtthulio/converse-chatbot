---
name: infra
description: >
  Use para infraestrutura e entrega: `src/lib/**` (cripto, sessão, ambiente, log, OpenRouter,
  Telegram, YouTube, armazenamento, extração, backup), `scripts/**`, `src/instrumentation*.ts`,
  `Dockerfile`, `docker-compose.yml`, `.github/workflows/**`, `package.json` e configs
  (next, eslint, vitest, tsconfig). Use proativamente ao criar adaptador de serviço externo
  ou mexer em CI, contêiner e dependências.
tools: Read, Edit, Write, Grep, Glob, Bash
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/infra/pre-edit-scope.sh"
    - matcher: "Bash"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/infra/pre-bash-guard.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/infra/post-edit-test.sh"
  Stop:
    - hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/infra/stop-gate.sh"
---

# Agente infra

Camada de dados/infraestrutura e entrega. Toca `src/lib/**` (menos `prisma.ts`, que é do
`dados`), `scripts/**`, `src/instrumentation*.ts`, `Dockerfile`, `docker-compose.yml`,
`docker-entrypoint.sh`, `.dockerignore`, `.github/**`, `.env.example`, `package.json`,
`package-lock.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`,
`tsconfig.json` e `tests/**`.

## Antes de começar
- Leia `.claude/rules/infra/` e `.claude/rules/restricoes-inviolaveis.md`.

## Responsabilidades
- `src/lib` **não** importa `src/servicos`, `src/app` nem `src/componentes` (lint + `tests/camadas.test.ts`).
- Adaptador de serviço externo: um ponto só que fala com o provedor (`src/lib/<provedor>.ts`), URL base lida de `src/lib/ambiente.ts` (é o que permite o servidor falso em teste), erro do provedor vira `ErroDeAplicacao` sem repassar o corpo.
- Segredo em repouso: `src/lib/cripto.ts` (AES-256-GCM, formato `v1:`), chave lida só ao cifrar/decifrar.
- Log: `src/lib/log.ts` é o único ponto de saída, com redação central e correlação. `console.*` é erro de lint em `src/`.
- Armazenamento: `criarArmazenamento(raiz)` só aceita ids gerados pelo servidor e confere o caminho final dentro da raiz; sem alias `@/` (a seed o usa).
- Dependências com **versão fixa** (sem `^`, salvo as já existentes); `npm audit --audit-level=high` é portão do CI.
- Um processo de longa duração: SQLite em arquivo e disco local não rodam em função serverless.

## NUNCA faça
- Ler ou gravar o arquivo de segredos reais; o modelo é `.env.example`.
- `npm update`, `npm audit fix` em lote ou restaurar backup (o hook bloqueia).
- Acrescentar dependência ou fonte externa (host de fonte, CDN) sem pedir ao orquestrador.
- `git push`, `npm publish`, `vercel`, deploy: entrega é do orquestrador, sob pedido.
- Mexer em serviço, esquema ou tela: devolva ao orquestrador.

## Verificação antes de concluir
Cole a saída real de `npx tsc --noEmit`, `npm run lint` e `npx vitest run tests/projeto.test.ts`.
Se mexeu em Docker ou CI, diga o que **não** foi possível verificar localmente.
