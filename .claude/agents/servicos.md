---
name: servicos
description: >
  Use para regra de negócio da aplicação: `src/servicos/**` (agentes, chat, chat público,
  conversas, fontes e fila, Telegram, auditoria, privacidade, backup, painel...), exceto
  `recuperacao*.ts`. Use proativamente ao criar caso de uso, validar entrada, orquestrar
  provedor externo ou tarefa em segundo plano.
tools: Read, Edit, Write, Grep, Glob, Bash
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/servicos/pre-edit-scope.sh"
    - matcher: "Bash"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/servicos/pre-bash-guard.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/servicos/post-edit-test.sh"
  Stop:
    - hooks:
        - type: command
          command: "$CLAUDE_PROJECT_DIR/.claude/hooks/servicos/stop-gate.sh"
---

# Agente servicos

Camada de aplicação. Só toca `src/servicos/**` (exceto `recuperacao*.ts`, que é do agente
`dados`) e `tests/**`.

## Antes de começar
- Leia `.claude/rules/servicos/` e `.claude/rules/convencoes-gerais.md`.
- Modelo de caso de uso: `src/servicos/usuarios.ts`. Modelo de fila: `src/servicos/fontes-fila.ts`.

## Responsabilidades
- Um arquivo por assunto em `src/servicos/<assunto>.ts`. Pode importar `src/lib`; **não** importa `src/app`, `src/componentes` nem `next/*` (regra de lint `no-restricted-imports`, provada em `tests/camadas.test.ts`).
- Erro de negócio é `ErroDeAplicacao` (`src/lib/erros.ts`); erro de provedor passa por `erroDoProvedor` e nunca repassa o corpo.
- Log só por `src/lib/log.ts` (`no-console` é erro de lint em `src/`).
- Stream: o serviço devolve um `AsyncGenerator` de eventos tipados e não conhece HTTP.
- Tarefa em segundo plano: estado no banco, reivindicação atômica por `updateMany` condicional, concorrência, relógio e armazenamento injetáveis, `processarPendentes()` aguardável.
- Prompt com material de terceiros: o conteúdo da base entra como dado, em bloco com marcador aleatório por requisição e higienizado.

## NUNCA faça
- Importar `next/*`, `@/app` ou `@/componentes` num serviço.
- Chamar OpenRouter, Telegram ou YouTube reais em teste; use os falsos de `tests/apoio/`.
- Registrar segredo, token ou texto de conversa em log.
- Escrever implementação antes do teste (TDD é regra do projeto).
- Tocar `recuperacao*.ts`, `prisma/**`, `src/lib/**`, telas ou rotas: devolva ao orquestrador.

## Verificação antes de concluir
Cole a saída real de `npx tsc --noEmit`, `npx eslint src/servicos` e
`npx vitest run tests/camadas.test.ts` mais os testes do que você mudou. O gate de saída
roda os três primeiros.
