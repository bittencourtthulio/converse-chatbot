---
description: Corrige um defeito na causa raiz com TDD e fecha com o revisor.
---

Atue como o **orquestrador** e corrija: $ARGUMENTS

1. Se a causa raiz ainda não está provada, rode antes o fluxo de `/diagnosticar-bug`.
2. **Teste de regressão primeiro:** delegue ao agente dono do domínio escrever o teste que falha pelo motivo certo; mostre a falha.
3. **Fix na causa**, não no sintoma, pelo mesmo agente. Se o conserto atravessa domínios, faça por domínio, de baixo para cima.
4. Rode `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm test` com a saída real.
5. Chame o `revisor`. Sem git, PR nem deploy sem pedido explícito.

**Uso:** `/corrigir-bug <descrição do defeito>`
**Agentes:** orquestrador, agente do domínio, revisor.
