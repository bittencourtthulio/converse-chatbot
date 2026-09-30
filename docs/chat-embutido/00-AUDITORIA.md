# Auditoria — chat-embutido

Data: 2026-09-30

Auditoria feita pelo próprio executor (não há agente `auditor-plano` nem `revisor-testes` neste harness), sem editar o plano durante a auditoria.

**Rodada 1:** 7 sprints, 28 tasks, todas com `teste_integracao`, `teste_funcional` e `criterio_aceite` preenchidos e binários (o `YAML` de todos os `tasks.md` foi lido por um analisador e as 28 dependências apontam para tasks existentes e anteriores); nenhuma task ou fase é paralela (`paralelizavel: false`, `paralela_com: []`), então não há paralelismo falso nem ciclo; a sprint-01 entrega a capacidade de testar (migration, módulos puros, `APP_URL`, `happy-dom`), sem regra de negócio do chat; nenhuma task depende de decisão humana em execução; toda D-NN cita fonte e as premissas PR-55 a PR-62 cobrem as decisões novas. Base conferida: as lacunas 1 e 2 (Prisma no `proxy.ts`, exclusão do `X-Frame-Options` por expressão regular) são provadas pelo teste de produção da T-03.04 e têm plano B na D-09; a lacuna 3 (rota com ponto na pasta) pela T-05.03; a lacuna 4 (`happy-dom`) pela T-01.05 com jsdom como alternativa (D-11); o limite do IP sem `TRUST_PROXY` (lacuna 5) vira aviso na T-06.02 e uso de `X-Forwarded-For` nos testes de rota. Testes que poderiam passar com implementação errada: o teste de "sem trecho interno" (T-02.04, T-03.02) compara com o texto real da base e o de CORS (T-03.01) cobre permitido e não permitido, então discriminam; o teste de `frame-ancestors` (T-03.04) cobre os quatro casos e o DENY restante. Portão V9: todo arquivo previsto está em `arquivos` de alguma task; os `sprint.md`, `fases.md` e `tasks.md` de cada sprint na primeira task da sprint (sprint 07 na T-07.01 e `tasks.md` na T-07.03), e os arquivos do laço do buildx (MAPA, PREMISSAS, RECURSAO, PROJETO, `.gitignore`, `.env.example`, `package.json`, lockfile, documentos da feature e da entrega) na T-07.03, última task da última sprint.

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-04/tasks.md | A T-04.02 reúne componente cliente, CSS e reuso de três módulos: é a maior task de interface e o pior caso pode passar de quatro vezes o melhor | Na execução, escrever o componente e o CSS em passos pequenos, cada um com seu teste; se crescer, dividir o commit sem mudar o critério e registrar desvio |
| MÉDIA | sprint-03/tasks.md | O `proxy.ts` depende de o Prisma rodar no runtime Node do proxy (lacuna 1); se não rodar, o desenho do CSP dinâmico muda | Aceitar: a T-03.04 prova ou falha cedo, e o plano B (outro ponto de cabeçalho) entra como desvio com PR ajustada |
| MÉDIA | sprint-05/tasks.md | `happy-dom` pode não reproduzir `postMessage` com `origin` nem Shadow DOM como o navegador | Aceitar: a T-07.02 verifica no navegador real; se a ferramenta faltar, registrar o que ficou sem verificar |
| BAIXA | sprint-05/tasks.md | A T-05.01 depende da T-04.04 sem necessidade real de código (só fixa a ordem) | Manter |
| BAIXA | sprint-07/tasks.md | A T-07.02 depende de ferramenta de navegador que pode faltar | Declarado nos riscos da sprint; a task aceita registrar a indisponibilidade |
| BAIXA | sprint-03/tasks.md | O limite de 10 por minuto compartilhado pelo IP `desconhecido` atrapalha os testes de rota em sequência | Os testes usam `TRUST_PROXY=1` e `X-Forwarded-For` distinto por caso |

VEREDITO: SIM — o plano está pronto para execução autônoma.
