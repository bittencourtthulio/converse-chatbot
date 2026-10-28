---
description: Roda os verificadores reais e, só sob pedido explícito, prepara a entrega (git/PR/deploy).
---

Atue como o **orquestrador**. Alvo: $ARGUMENTS

1. **Verificadores reais**, nesta ordem, com a saída colada: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`, `npm audit --audit-level=high`.
2. Se algo falhar, **pare** e devolva ao agente dono; não entregue com vermelho.
3. Chame o `revisor`; só siga com veredito APROVADO ou APROVADO COM RESSALVAS que o usuário aceite.
4. **Git, push, PR e deploy só se o usuário pediu nesta chamada.** Para branch, commit por task e PR use `/mergex`. Para deploy, confirme o alvo antes: este app é um processo de longa duração com SQLite em disco (não vai para função serverless).

**Uso:** `/entregar [verificar | pr | deploy]`
**Agentes:** orquestrador, revisor.
