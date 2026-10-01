# Auditoria — canal-telegram

Data: 2026-09-30

Auditoria feita pelo próprio executor (não há agente `auditor-plano` nem `revisor-testes` neste harness), sem editar o plano durante a auditoria.

**Rodada 1:** 7 sprints, 20 tasks, todas com `teste_integracao`, `teste_funcional` e `criterio_aceite` preenchidos e binários (o YAML de todos os `tasks.md` foi lido por um analisador; as 20 dependências apontam para tasks existentes e anteriores, formando uma cadeia sem ciclo); nenhuma task ou fase é paralela (`paralelizavel: false`, `paralela_com: []`); a sprint-01 entrega a capacidade de testar (migration, variáveis de ambiente, simulado do Telegram) sem regra de negócio do canal; nenhuma task depende de decisão humana em execução; toda D-NN cita fonte e as premissas PR-63 a PR-70 cobrem as decisões novas. Base conferida: a lacuna 1 e 2 (`retry_after`, taxa de envio) viram comportamento opcional testado na T-02.02; a lacuna 3 (`after()` em `next start`) é provada pela T-05.01 contra o servidor de produção; a lacuna 4 (`update_id`) está resolvida na modelagem (texto, T-01.01); a lacuna 5 (exceção de HTTPS em produção) está resolvida pelo `APP_URL` HTTPS de fachada na T-05.01 e na T-07.01. Testes que poderiam passar com implementação errada: o do token (T-02.03) exige a ausência do token em erro, causa, pilha e console para dez combinações de método e falha, e confere também a presença da mensagem fixa; o do segredo (T-04.01 e T-05.01) cobre ausente, errado e canal inexistente com a mesma resposta; o de dedupe (T-05.01) exige uma só chamada de `sendMessage` para o mesmo `update_id`; o de limites (T-04.04) exige zero chamadas ao OpenRouter falso. Portão V9: todo arquivo previsto está em `arquivos` de alguma task; os `sprint.md`, `fases.md` e `tasks.md` de cada sprint na primeira task da sprint, e os arquivos do laço do buildx (MAPA, PREMISSAS, RECURSAO, PROJETO, `.gitignore`, `.env.example`, `package.json`, lockfile, documentos da feature e da entrega) na T-07.03, última task da última sprint.

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-04/tasks.md | A T-04.03 reúne resposta, "digitando" renovado, linha de fontes, falha do provedor e gravação de estado: é a maior task e o pior caso pode passar de quatro vezes o melhor | Na execução, escrever em passos pequenos, cada um com seu teste; se crescer, dividir o commit sem mudar o critério e registrar desvio |
| MÉDIA | sprint-05/tasks.md | O `after()` do Next precisa funcionar em `next start` com leitura do corpo antes do 200 (lacuna 3) | Aceitar: a T-05.01 prova ou falha cedo; plano B é processar numa promessa solta capturada por `.catch`, como desvio documentado |
| MÉDIA | sprint-03/tasks.md | `exigirTetoDiario` ganha parâmetro de canal e pode quebrar os testes do chat embutido | Parâmetro opcional com padrão `widget`; a T-03.03 exige os testes antigos verdes sem mudança de chamada |
| BAIXA | sprint-06/tasks.md | O cartão cliente é difícil de testar sem DOM: a lógica fica em módulo puro e o render usa `renderToStaticMarkup` | Manter; `tests/chat-embutido-ui.test.tsx` já usa o padrão |
| BAIXA | sprint-07/tasks.md | A T-07.01 depende de ferramenta de navegador que pode faltar | Declarado nos riscos da sprint; a task aceita registrar a indisponibilidade |

VEREDITO: SIM — o plano está pronto para execução autônoma.
