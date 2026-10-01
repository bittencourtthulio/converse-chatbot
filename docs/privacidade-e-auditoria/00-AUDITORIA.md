# Auditoria — privacidade-e-auditoria

Data: 2026-10-01 (rodada 2, reauditoria depois de regerar o plano)

Rodada 1 terminou em `VEREDITO: NÃO` por um achado ALTA (a T-07.01 pedia uma variável de ambiente de teste não declarada, fora da lista de arquivos e contra D-11). O plano foi regerado na F3 endereçando todos os achados ALTA e MÉDIA da rodada 1 (decisão D-25 registrada, `aguardarGravacoesPendentes` e PEND-08 incluídos nos critérios, rollback da primeira transação interativa exigido na T-02.04).

Conferido na rodada 2: as 28 tasks têm os dois testes e critério binário; não há ciclo em `depende_de`; nenhuma task é paralelizável; todo arquivo que o plano prevê tocar está em `arquivos` de alguma task, inclusive `sprint.md`, `fases.md`, MAPA, PREMISSAS, RECURSAO, PROJETO, `.gitignore`, exemplo de ambiente, `package.json`, lockfile e README na T-07.04; a base (identificadores por canal, FK restritiva de `Agente.criadoPorId`, ouvintes, Origin do DELETE público, lote do expurgo) está tratada em D-04, D-06, D-10 e D-14.

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-02/tasks.md (T-02.04 a T-02.06) | Transação interativa do Prisma com o adaptador better-sqlite3 nunca foi usada no repositório | Se falhar na T-02.04, registrar bloqueio em `00-BLOQUEIOS.md` e usar `$transaction([...])` em lote, com o mesmo rollback provado por teste |
| MÉDIA | sprint-02/tasks.md (T-02.03) | A gravação do ouvinte é assíncrona e o `globalThis` dos ouvintes só se prova em `next start` na T-07.01 | O teste da T-02.03 usa `aguardarGravacoesPendentes`; qualquer desvio entra em `desvios` do ENTREGA |
| BAIXA | sprint-06/tasks.md (T-06.04) | O critério "sem a palavra parecer" é complementado pela frase exata da PR-91, mas segue textual | Aceitar |
| BAIXA | todas as sprints | Execução inteiramente sequencial, embora as sprints 04 e 05 pudessem rodar em paralelo | Manter: compartilham `src/app/acoes.ts`, `global.css` e a suíte inteira por task |

VEREDITO: SIM — o plano está pronto para execução autônoma.
