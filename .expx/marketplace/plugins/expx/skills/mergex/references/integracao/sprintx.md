# Integração — sprintx

A `sprintx` planeja e executa features novas, em seis fases: F1 INGESTÃO → F2 DESCOBERTA → F3 PLANO → F4 ORQUESTRADOR → F5 AUDITORIA → F6 EXECUÇÃO.

A mergex entra **na F6** e em nenhuma outra fase. Antes da F6 não há código escrito, e a mergex não tem o que versionar.

## Os pontos de acionamento

| Momento na sprintx | Etapa da mergex | O que acontece |
|---|---|---|
| Início da F6, **antes da primeira task** | **E0 ABERTURA** | Cria `feature/<slug>` a partir da base, registra no `ORQUESTRADOR.md` e cria `docs/entregas/<slug>/ENTREGA.md` |
| Ao fechar **cada** task (status `concluida`, suíte verde) | **E1 COMMIT** | Um commit por task, com a mensagem no formato da mergex |
| Fim da F6, com todas as tasks executadas | **E2 → E8** | Portão, classificação, descrição do PR, pacote de QA, push, abertura do PR, registro |

Depois do E8, a mergex devolve o controle. **Ela não sugere o E9** (regra 16).

### E0 — no início da F6

A F6 começa lendo o `ORQUESTRADOR.md` e retomando o estado das tasks. A mergex roda **depois dessa leitura e antes da primeira task**, porque:

- a árvore precisa estar limpa (E0, passo 2), e depois da primeira task ela não estará;
- a branch precisa existir antes do primeiro commit.

Sessão interrompida e retomada: o E0 encontra a branch existente e **retoma nela**, sem criar outra. A F6 continua de onde parou pelo `status` das tasks.

### E1 — no passo 8 do TDD da F6

O `references/06-execucao.md` da sprintx fecha cada task assim: verifica o critério de aceite, marca `status: concluida` no frontmatter e na prosa, com data e resultado da suíte.

**O E1 roda imediatamente depois disso.** A ordem importa: o commit registra a task já marcada como concluída, e é o `tasks.md` atualizado que dá à mensagem de commit o objetivo e os testes.

Task marcada `bloqueada` não gera commit. O E2 vai barrá-la depois — o que está correto: uma feature com task bloqueada não está pronta para entregar.

### E2 a E8 — ao fim da F6

Rodam quando a F6 termina: todas as tasks executadas, ou nada mais executável.

**Auditoria reprovada na F5 faz o E2 barrar** (verificação V6). Se `docs/<slug>/00-AUDITORIA.md` existe e não contém `VEREDITO: SIM`, ou tem achado ALTA em aberto, o portão devolve `BLOQUEADO` e o fluxo encerra. Achado ALTA manda voltar para a F3 — e um plano que voltou para a F3 não tem entrega a fazer.

## O que a mergex consome da sprintx

| Artefato | Onde | Usado em |
|---|---|---|
| `ORQUESTRADOR.md` | `docs/<slug>/` | E0 (registro da branch), E4 (título e objetivo), E2 (comando de teste) |
| `sprint-NN/tasks.md` | `docs/<slug>/` | E1 (objetivo, arquivos, testes), E2 (status, suíte, testes), E3 (cobertura por task) |
| `sprint-NN/fases.md`, `sprint.md` | `docs/<slug>/` | E2 (critérios de saída) |
| `00-BLOQUEIOS.md` | `docs/<slug>/` | E2 (V7 — bloqueio aberto no escopo) |
| `00-AUDITORIA.md` | `docs/<slug>/` | E2 (V6 — auditoria reprovada) |
| `00-DECISOES.md` | `docs/<slug>/` | E4 (contexto da seção "o que muda e por quê") |

O `trabalho_id` da mergex é o **mesmo `<slug>`** da sprintx. Não gere outro.

## O que a mergex NÃO faz com a sprintx

- Não altera o plano, as tasks, as fases nem a auditoria. A única escrita da mergex em artefato da sprintx é **uma linha** no `ORQUESTRADOR.md` registrando a branch (E0).
- Não executa task, não escreve teste, não implementa nada.
- Não substitui a F5. A auditoria audita o plano; o portão verifica a execução.

## Trabalho da sprintx sem modo legado

É o caso normal. Sem `docs/legado/PERFIL.md`:

- **E2:** a verificação V8 inteira é `n/a`.
- **E3:** os critérios O1, O7 e O8 (zona de risco, efeito irreversível, raio ALTO) não podem ser avaliados; registre como fonte ausente. Os demais critérios continuam valendo integralmente — mudança de cálculo, migração, contrato público e código sem cobertura seguem sendo OLHO OBRIGATÓRIO.
- **E4:** as seções 5 (raio), 7 (congelado) e 8 (reverter) são **omitidas**, não preenchidas com texto genérico (regra 10).
- **E8:** `raio: null`.

## Se a mergex não estiver instalada

A F6 da sprintx roda exatamente como antes: executa as tasks, marca os status, roda a suíte e entrega o relatório final. Nenhuma branch é criada, nenhum commit é feito pela skill, e nada quebra. **A ausência da mergex nunca quebra o fluxo da sprintx.**
