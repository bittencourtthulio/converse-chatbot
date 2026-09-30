# Auditoria — fundacao-e-esqueleto

Data: 2026-09-30

Auditoria feita pelo próprio executor: o agente `auditor-plano` e o `revisor-testes` não existem neste harness (a pasta de agentes do projeto não existe), então a fase rodou pelos Passos 3 e 4, sem edição de arquivo do plano. Esta limitação fica registrada: a regra "só aponta, nunca corrige" depende aqui da disciplina do executor.

Conferido: 5 sprints, 20 tasks, todas com `teste_integracao` e `teste_funcional` preenchidos; sem ciclo em `depende_de`; nenhuma task com `paralelizavel: true`; sprint-01 entrega capacidade de verificar; nenhuma task depende de decisão humana; cada decisão D-NN cita fonte; nenhuma contradição com a base sem D-NN (a violação de camadas da lacuna 2 é tratada por D-12 e T-01.01).

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-04/tasks.md | T-04.04 (verificação visual) depende de ferramenta de navegador da sessão, e seu teste funcional é observação, não asserção automática; a base registra a disponibilidade como NÃO DOCUMENTADO | Na F6, tentar as ferramentas de navegador; se indisponíveis, gravar a limitação em `VERIFICACAO-VISUAL.md` e concluir a task apenas com o teste de integração (servidor de pé, rotas 200) e a limitação declarada; o contraste e a ausência de cor literal já ficam provados por `tests/tokens.test.ts` |
| MÉDIA | sprint-05/tasks.md | T-05.02 precisa de rede para `npm ci` e `npm audit`, pré-requisito externo não declarado | Na F6, se a rede falhar, registrar em `00-BLOQUEIOS.md` e seguir; o registro do npm é o único recurso externo da feature |
| MÉDIA | sprint-02/tasks.md, sprint-03/tasks.md, sprint-04/tasks.md | Os testes que alteram `tests/rotas.test.ts` usam o servidor de produção (`next start`), que serve o último `npm run build`; sem rebuild antes do teste, o teste enxerga código antigo e pode passar ou falhar por engano | Na F6, rodar `npm run build` (com `DATABASE_URL` e `JWT_SECRET` inline) antes de `npx vitest run tests/rotas.test.ts` em toda task que afeta rota ou cabeçalho |
| MÉDIA | sprint-03/tasks.md | O teste de tokens varre `src` em busca de cor literal; `src/gerado/` (client do Prisma) fica fora da varredura por ser código gerado | Excluir `src/gerado` da varredura, como o ESLint já faz (`eslint.config.mjs:4`) |
| BAIXA | sprint-01/tasks.md | T-01.04 verifica comportamento já existente da seed, então o teste nasce verde | Aceitar: é tarefa de verificação (PR-25); conferir que o teste falharia se o guarda de produção fosse removido |
| BAIXA | sprint-02/tasks.md | T-02.05 declara `depende_de: [T-02.02]` sem necessidade real (só edita `next.config.ts` e `tests/rotas.test.ts`) | Manter: a ordem evita conflito de edição em `tests/rotas.test.ts`, e não há paralelismo declarado |
| BAIXA | sprint-04/tasks.md | O critério de T-04.03 não cobre a linha de estado vazio da tabela de usuários sem registros | Cobrir no componente de tabela com `EstadoVazio` e afirmar no teste de componentes, se couber sem nova task |
| BAIXA | sprint-05/tasks.md | O critério de T-05.03 ("só regras sem código ainda existente") é verificável por `grep`, mas depende de julgar quais regras ainda não têm código | Listar essas regras nominalmente no relatório da task |

VEREDITO: SIM — o plano está pronto para execução autônoma.
