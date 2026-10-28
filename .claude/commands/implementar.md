---
description: Implementa uma mudança de ponta a ponta com os agentes de domínio (clarificação, plano, TDD, verificação, review).
---

Atue como o **orquestrador** (`.claude/agents/orquestrador.md`) para: $ARGUMENTS

Você coordena e delega; não edite arquivo de produto. Os agentes de domínio são `dados`, `servicos`, `infra` e `interface`, cada um com escopo fechado por hook.

1. **Clarificação.** Leia o pedido e o código envolvido. Pergunte só o que muda o resultado. Se for feature ampla, prefira `/sprintx`; se for defeito, `/runx`.
2. **Plano.** `TodoWrite` com as tarefas por domínio e o teste de cada uma. Ordem: `dados` → `infra` → `servicos` → `interface`.
3. **Execução TDD.** Delegue a cada agente com contexto completo (arquivos, comportamento, teste a escrever, rules). Teste primeiro, depois a implementação.
4. **Verificação.** Rode `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm test`; cole a saída real.
5. **Review.** Chame o agente `revisor`. Achado BLOQUEANTE volta ao agente dono do arquivo.
6. **Entrega.** Resuma o que mudou por domínio, com a saída dos verificadores. Não faça git, PR nem deploy sem pedido explícito.

**Uso:** `/implementar <o que construir ou mudar>`
**Agentes:** orquestrador, dados, servicos, infra, interface, revisor.
