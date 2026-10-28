---
description: Revisa o diff atual (somente leitura) contra as rules do projeto e roda lint, tipos, build e testes.
---

Chame **apenas** o agente `revisor` para auditar o diff de: $ARGUMENTS
(se vazio, use `git diff` da árvore de trabalho mais `git diff main...HEAD`).

Passe a ele a lista de arquivos mudados. Ele devolve achados `[BLOQUEANTE|IMPORTANTE|SUGESTÃO]` com `File`, `Rule`, `Detail`, `Fix`, mais o Summary com a saída real de `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test` e o veredito. Nada é editado.

**Uso:** `/revisar [alvo ou branch]`
**Agentes:** revisor.
