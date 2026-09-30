# Auditoria — conversa-de-teste

Data: 2026-09-30

Auditoria feita pelo próprio executor (os agentes `auditor-plano` e `revisor-testes` não existem neste harness), sem editar o plano durante a auditoria.

**Rodada 1:** 7 sprints, 17 tasks, todas com `teste_integracao`, `teste_funcional` e `criterio_aceite` preenchidos e binários; sem ciclo em `depende_de` (conferido); nenhuma task `paralelizavel: true`; a sprint-01 entrega a capacidade de testar (tabelas, cascata provada e configuração), sem regra de negócio; nenhuma task depende de decisão humana; cada D-NN cita fonte e não há contradição com a base.

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| BAIXA | sprint-01/tasks.md | O nome da migration (`20260930170000_conversas`) é previsto: o SQL será gerado por `prisma migrate diff` e gravado nessa pasta | Manter o nome; se o gerador exigir outro, declarar em `desvios` |
| BAIXA | sprint-06/tasks.md | Sem jsdom, foco, rolagem e Enter no navegador não são exercitados por teste (base/interface-do-agente.md) | Cobrir a lógica nos módulos puros (T-05.03) e o resto na verificação visual T-07.01, declarando o que não for visto |
| BAIXA | sprint-04/tasks.md | O teste de rota exige `npm run build` antes | Rodar o build com `DATABASE_URL` e `JWT_SECRET` inline antes de `npx vitest run tests/conversar-rota.test.ts` |
| BAIXA | sprint-07/tasks.md | T-07.03 declara arquivos de `docs/entregas/conversa-de-teste/` que a mergex cria depois (PR, QA, ATENCAO) | Aceitável: o portão V9 exige a declaração; a criação ocorre no mergex-pr, mergex-qa e mergex-atencao |

VEREDITO: SIM — o plano está pronto para execução autônoma.
