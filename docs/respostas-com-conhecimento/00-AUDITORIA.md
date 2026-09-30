# Auditoria — respostas-com-conhecimento

Data: 2026-09-30

Auditoria feita pelo próprio executor (não há agente `auditor-plano` nem `revisor-testes` neste harness), sem editar o plano durante a auditoria.

**Rodada 1:** 6 sprints, 22 tasks, todas com `teste_integracao`, `teste_funcional` e `criterio_aceite` preenchidos e binários; sem ciclo em `depende_de` (todas as dependências apontam para tasks anteriores existentes); nenhuma task ou fase é paralela (`paralelizavel: false`, `paralela_com: []`), então não há paralelismo falso; a sprint-01 entrega a capacidade de buscar e testar (migration, cascata, apoio), sem regra de negócio do chat; nenhuma task depende de decisão humana; toda D-NN cita fonte. Portão V9: todo arquivo previsto está em `arquivos` de alguma task, os `sprint.md`, `fases.md` e `tasks.md` de cada sprint na última task da sprint, e os arquivos do laço do buildx (MAPA, PREMISSAS, RECURSAO, `.gitignore`, exemplo de ambiente, `package.json`, lockfile, documentos da feature e da entrega) na T-06.03. Consistência com PR-50 a PR-54 e D-00 a D-18 conferida: índice e gatilhos (T-01.01, T-01.02), termos, `MATCH` e limiar (T-02.01, T-02.02), desempenho e `rebuild` (T-02.03), seed (T-02.04), prompt e marcador (T-03.01), fontes e citação (T-03.02, T-03.04), modo fundamentado e continuação (T-03.03), SSE (T-04.01), rota de busca (T-04.03), UI (T-05.x), convenções (T-06.01).

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-05/tasks.md | A T-05.03 reúne componente novo, lógica pura, integração no chat, página e CSS: é a maior task do plano e o pior caso pode passar de quatro vezes o melhor | Na execução, escrever a lógica pura e o componente em passos pequenos, cada um com seu teste; se a task crescer, registrar desvio e dividir o commit, sem mudar o critério |
| MÉDIA | sprint-01/tasks.md | Se os gatilhos de `DELETE` não disparam na cascata (lacuna 1 da base), a T-01.02 precisa alterar `fontes.excluir` e `agentes.excluir`, e isso já está em `arquivos.altera` mas não nos critérios | Aceitar: o critério da T-01.02 é o resultado (índice sem órfãos); o remédio, se preciso, entra como desvio no ENTREGA.md |
| MÉDIA | sprint-03/tasks.md | O evento `fontes` sai antes da gravação da resposta (D-14); se a gravação falhar, o navegador viu fontes de uma resposta que depois vira erro | Aceitar: a bolha termina em erro e as fontes são descartadas pelo reducer (T-05.02 cobre o descarte) |
| BAIXA | sprint-05/tasks.md | A T-05.01 depende de T-04.01 sem necessidade real (o renderizador não usa o protocolo) | Manter: só fixa a ordem de execução |
| BAIXA | sprint-06/tasks.md | Sem jsdom, o comportamento interativo (abrir fonte ao clicar em `[n]`) só é provado por módulo puro e verificação visual | Cobrir a lógica em T-05.03 e declarar o que não for visto em T-06.02 |
| BAIXA | sprint-06/tasks.md | O comportamento do modelo real diante do prompt não é testável (PR-26) | Registrar como limite conhecido no relatório e na descrição do PR |

VEREDITO: SIM — o plano está pronto para execução autônoma.
