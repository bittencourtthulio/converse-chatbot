# Auditoria — operacao-e-backup

Data: 2026-10-01 (rodada 1)

Auditoria feita pelo próprio harness (o agente `auditor-plano` não está disponível nesta instalação), lendo só os arquivos do plano: `ORQUESTRADOR.md`, `00-DECISOES.md`, `base/`, e os `sprint.md`, `fases.md` e `tasks.md` das oito sprints. Nenhum arquivo do plano foi alterado nesta fase.

Conferido: as 38 tasks têm `teste_integracao` e `teste_funcional` em uma frase e critério de aceite binário; não há ciclo em `depende_de` e todas são sequenciais (`paralelizavel: false`); nenhuma task pede decisão humana; todo arquivo que o plano prevê tocar está em `arquivos` de alguma task, inclusive `sprint.md`, `fases.md` e `tasks.md` de cada sprint (na primeira task de cada uma), os artefatos de `docs/operacao-e-backup/` e `docs/entregas/operacao-e-backup/`, MAPA, PREMISSAS, RECURSAO, PROJETO, `.gitignore`, exemplo de ambiente, `package.json`, lockfile, README e CI na T-08.04; a base está tratada: o `rowid` e o `VACUUM` (T-01.01 prova a API online), o caminho relativo de `DATABASE_URL` (T-03.01, `bancoArquivo`), a correlação que não atravessa o proxy (D-03, cabeçalho de requisição), o `register()` que pode ser engolido pelo Next (T-03.02 sobe o servidor) e a fila sem `parar` (T-07.01).

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-07/tasks.md (T-07.03 a T-07.05) | A verificação do contêiner depende de rede (Docker Hub, apt, registro npm) e do Docker da máquina, que tem outros contêineres de outros projetos | Usar nomes e rótulos próprios, nunca tocar nos contêineres alheios, e se a rede falhar registrar o bloqueio em `00-BLOQUEIOS.md` e o que não pôde ser verificado |
| MÉDIA | sprint-05/tasks.md (T-05.05) | Nunca se provou que o `tsx` resolve o alias `@/` fora do Next (a seed usa caminho relativo) | A T-05.05 prova no primeiro teste do comando; se falhar, os scripts importam por caminho relativo, sem mudar o plano |
| MÉDIA | sprint-02/tasks.md (T-02.02 a T-02.04) | Cada task troca `console.*` em muitos arquivos e desloca linhas citadas em `docs/stack/CONVENCOES.md` e `tests/projeto.test.ts` | Rodar `tests/projeto.test.ts` a cada edição de serviço e refazer as citações (já nos arquivos de cada task) |
| MÉDIA | sprint-02/tasks.md (T-02.07) | O teste de "a pilha não vaza" depende do build de produção e do comportamento do Next com banco inacessível, nunca exercitado | Se o Next não devolver a página de erro esperada, registrar em `desvios` e ajustar a asserção ao comportamento real sem relaxar a proibição de pilha |
| BAIXA | sprint-07/tasks.md (T-07.04) | O teste do contêiner só roda com `VERIFICAR_CONTEINER=1`, então a suíte padrão o pula | Aceitar: é a única forma de a suíte inteira continuar rodando sem Docker; a execução com a variável é o critério da task |
| BAIXA | todas as sprints | Execução inteiramente sequencial, embora a tela (sprint 04) e a biblioteca de backup (sprint 05) pudessem andar em paralelo | Manter: compartilham `src/estilos/global.css`, `tests/projeto.test.ts` e a suíte inteira por task |

VEREDITO: SIM — o plano está pronto para execução autônoma.
