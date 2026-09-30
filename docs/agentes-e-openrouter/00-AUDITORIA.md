# Auditoria — agentes-e-openrouter

Data: 2026-09-30

Auditoria feita pelo próprio executor: o agente `auditor-plano` e o `revisor-testes` não existem neste harness, então a fase rodou pelos Passos 3 e 4, sem editar arquivo do plano durante a auditoria. A regra "só aponta, nunca corrige" depende aqui da disciplina do executor.

**Rodada 1:** VEREDITO NÃO. Achado ALTA: T-05.06 e T-05.07 sem teste próprio (só `tsc` e lint, com teste remetido à T-05.08). O plano foi regerado na F3 (volta 1 de no máximo 2): a T-05.08 foi fundida nas duas, o achado MÉDIA (espionar `console.error` e `console.log` na T-03.02) foi endereçado e a dependência desnecessária da T-01.02 foi removida.

**Rodada 2 (plano regerado):** 6 sprints, 26 tasks, todas com os dois testes preenchidos e passíveis de falhar com implementação errada; sem ciclo em `depende_de` (conferido); nenhuma task com `paralelizavel: true`; sprint-01 entrega capacidade de testar; nenhuma task depende de decisão humana; cada D-NN cita fonte e a única contradição com a base (`/auth/key` versus `/key`) está em D-05.

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| BAIXA | sprint-05/tasks.md | T-05.03 depende de T-05.02 sem necessidade real (o seletor não usa as abas) | Manter: a ordem evita conflito de edição em `global.css` e não há paralelismo declarado |
| BAIXA | sprint-06/tasks.md | T-06.01 (verificação visual) depende de ferramenta de navegador da sessão, com disponibilidade `NÃO DOCUMENTADO` na base | Na F6, tentar as ferramentas; se indisponíveis, registrar a limitação em `VERIFICACAO-VISUAL.md` e concluir com o teste de integração (servidor de pé, rotas respondendo) e a limitação declarada |
| BAIXA | sprint-05/tasks.md | Os testes de componente usam `react-dom/server` (sem interação): o clique de confirmação da T-05.05 e a contagem viva do contador de instrucoes não são exercitados em navegador | Cobrir a máquina de estados por teste de componente com `react-dom/test-utils` ou `act` se já existir na base de testes; senão, declarar no `VERIFICACAO-VISUAL.md` |
| BAIXA | sprint-03/tasks.md | Testes de rotas exigem `npm run build` antes (`base/interface-e-menu.md`) | Na F6, rodar `npm run build` com `DATABASE_URL` e `JWT_SECRET` inline antes de `npx vitest run tests/rotas.test.ts` |

VEREDITO: SIM — o plano está pronto para execução autônoma.
