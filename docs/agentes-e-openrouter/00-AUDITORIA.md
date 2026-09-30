# Auditoria — agentes-e-openrouter

Data: 2026-09-30

Auditoria feita pelo próprio executor: o agente `auditor-plano` e o `revisor-testes` não existem neste harness, então a fase rodou pelos Passos 3 e 4, sem editar arquivo do plano. A regra "só aponta, nunca corrige" depende aqui da disciplina do executor.

Conferido (rodada 1): 6 sprints, 27 tasks, todas com os dois testes preenchidos; sem ciclo em `depende_de`; nenhuma task com `paralelizavel: true`; sprint-01 entrega capacidade de testar; nenhuma task depende de decisão humana; cada D-NN cita fonte.

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-05/tasks.md | T-05.06 e T-05.07 têm `teste_integracao` que remete ao teste da T-05.08 (tarefa posterior) e `teste_funcional` que é só `tsc` e lint: a task concluiria sem teste próprio que falharia com implementação errada (viola R3 e R4) | Fundir a T-05.08 nas duas: cada página ganha seu bloco em `tests/rotas.test.ts` na própria task, e a T-05.08 deixa de existir |
| MÉDIA | sprint-03/tasks.md | Nenhum teste prova que a chave não vai para `console.error` (a ação imprime o erro inteiro; `base/ambiente-e-segredos.md`) | T-03.02: espionar `console.error` e `console.log` e afirmar que nenhuma chamada contém a chave |
| BAIXA | sprint-01/tasks.md | T-01.02 depende de T-01.01 sem necessidade real | Trocar por `depende_de: []` |
| BAIXA | sprint-05/tasks.md | T-05.03 depende de T-05.02 sem necessidade real (o seletor não usa as abas) | Manter: a ordem evita conflito de edição em `global.css` e não há paralelismo declarado |

VEREDITO: NÃO — o plano não está pronto para execução autônoma.
