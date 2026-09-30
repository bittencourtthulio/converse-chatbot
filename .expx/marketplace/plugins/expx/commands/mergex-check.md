---
description: Verifica se o trabalho está realmente pronto para entregar — etapa E2 da mergex, o portão de prontidão, isolada. Roda as dez verificações (tasks concluídas, suíte verde, dois testes por task, teste de regressão, QA, auditoria, bloqueios, modo legado, arquivos fora do escopo, segredos no diff) e devolve PRONTO ou BLOQUEADO com o que falta. Use antes de entregar, ao perguntar se está pronto para PR, ou para conferir a entrega.
---

Acione a skill `mergex` e execute **apenas a etapa E2 (portão de prontidão)**, seguindo `references/02-prontidao.md`.

Trabalho: $ARGUMENTS

## O que fazer

Rode **todas as dez verificações**, mesmo depois de a primeira falhar — o usuário precisa da lista completa do que falta, não do primeiro erro. Verificação que não se aplica é marcada `n/a`, nunca omitida.

| # | Verificação |
|---|---|
| V1 | Task com status diferente de `concluida` |
| V2 | Task concluída com suíte diferente de verde |
| V3 | Task sem teste de integração ou sem teste funcional |
| V4 | Bug da runx cuja primeira task não tem teste de regressão |
| V5 | QA da runx reprovado, ou ausente quando exigido |
| V6 | Auditoria da sprintx reprovada |
| V7 | Bloqueio aberto que afeta o escopo entregue |
| V8 | Modo legado: raio, caracterização, reversão, orçamento, aprovação |
| V9 | Arquivo alterado fora da lista declarada no plano |
| V10 | Segredo, credencial ou dado real de cliente no diff |

**V10 roda sempre, mesmo quando todo o resto passou.**

Use `assets/TEMPLATE-prontidao.md`. A saída é binária: `PRONTO` ou `BLOQUEADO`, com o que falta e onde corrigir.

O portão barra e explica. **Nunca maquia, nunca passa com ressalva, nunca ajusta o trabalho para caber.** Este comando só verifica: não commite, não suba nada, não abra PR.
