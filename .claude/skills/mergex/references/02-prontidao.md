# E2 — PORTÃO DE PRONTIDÃO

Você está no E2. Esta etapa roda **ao fim da execução, antes de qualquer preparação de entrega** — antes do E3, do E4, do E5, do push e do PR.

O portão tem uma função só: **barrar o que não está pronto e explicar o que falta**. Ele nunca maquia, nunca "passa com ressalva", nunca ajusta o trabalho para caber (regra 6). Um portão que deixa passar não é portão.

A saída é binária: `PRONTO` ou `BLOQUEADO`.

## Pré-requisitos verificáveis

- `docs/entregas/<trabalho_id>/ENTREGA.md` existe (o E0 rodou). Se não existir, rode o E0 primeiro (`references/00-abertura.md`) — a branch pode não ter nascido, e o portão precisa saber o que foi commitado.
- O `ORQUESTRADOR.md` e o `tasks.md` do trabalho existem. Sem eles não há o que verificar: relate que o trabalho não está planejado e encerre `BLOQUEADO`.

## As dez verificações

Rode **todas**, sempre, mesmo depois de a primeira falhar. O usuário precisa da lista completa do que falta, não do primeiro erro. Verificação que não se aplica ao trabalho é marcada `n/a`, nunca omitida.

### V1 — Task com status diferente de `concluida`

Leia o frontmatter de todo `tasks.md` do trabalho. Toda task tem que estar `concluida`.

Falha: qualquer task em `pendente`, `em_andamento` ou `bloqueada`. Nomeie cada uma (id e título) e o status atual. Task `bloqueada` aponta o `B-NN` correspondente em `BLOQUEIOS.md`.

### V2 — Task concluída com suíte diferente de verde

Para cada task `concluida`, o campo `suite` tem que ser `verde`.

Falha: `vermelha` ou `nao_executada`. Nomeie a task. `nao_executada` com status `concluida` é uma inconsistência do registro e barra igual.

### V3 — Task sem teste de integração ou sem teste funcional

Para cada task, `teste_integracao` e `teste_funcional` têm que existir e não estar vazios.

Falha: campo ausente, vazio, ou preenchido com marcador de template (`{{...}}`, `TODO`, `NÃO DETERMINADO`). Nomeie a task e o campo.

### V4 — Bug da runx cuja primeira task não tem teste de regressão

Aplica-se só quando o trabalho é da runx com `tipo: bug`. A primeira task da primeira fase tem que ter `teste_regressao` preenchido.

Falha: campo ausente ou vazio. Sem teste de regressão não há prova de que o defeito existia — nem de que sumiu.

Nos demais tipos e nos trabalhos da sprintx: `n/a`.

### V5 — QA da runx reprovado, ou ausente quando exigido

Aplica-se só a trabalhos da runx. Leia `docs/manutencao/<OC-ID>-<slug>/QA.md`.

| Estado | Resultado |
|---|---|
| Contém `VEREDITO: APROVADO` | Passa |
| Contém `VEREDITO: REPROVADO` | **Falha.** Liste os achados ALTA: cada um precisa voltar ao E3 da runx |
| Não existe | **Falha**, quando o fluxo da runx já deveria tê-lo produzido (E2–E8 da mergex rodam entre o E4 e o E5 da runx) |

Trabalho da sprintx: `n/a` — a sprintx não tem estágio de QA equivalente; o que ela tem é a auditoria da F5 (V6).

### V6 — Auditoria da sprintx reprovada

Aplica-se só a trabalhos da sprintx. Leia `docs/<slug>/00-AUDITORIA.md`.

Falha: o arquivo existe e **não** contém `VEREDITO: SIM`, ou existe achado de severidade ALTA em aberto. Auditoria reprovada na F5 faz o portão barrar.

Arquivo ausente: aviso, não bloqueio — a execução pode ter vindo de um fluxo que não passou pela F5.

### V7 — Bloqueio aberto que afeta o escopo entregue

Leia `BLOQUEIOS.md` (runx) ou `00-BLOQUEIOS.md` (sprintx).

Falha: bloqueio com `resolvido_em: null` cuja `task` está dentro do escopo entregue. Nomeie o `B-NN`, a task e a descrição.

Bloqueio resolvido, ou aberto sobre task fora do escopo entregue: não barra, mas entra como aviso na saída.

### V8 — Modo legado

Aplica-se só quando `docs/legado/PERFIL.md` existe. Sem ele: `n/a` em todos os itens abaixo.

| Item | Falha quando |
|---|---|
| Raio calculado | Não há raio de impacto registrado para este trabalho |
| Caracterização | Raio MÉDIO ou ALTO sem testes de caracterização registrados |
| Reversão | Não há plano de reversão registrado |
| Orçamento | O orçamento de mudança declarado foi estourado |
| Aprovação humana | Raio ALTO sem aprovação humana registrada |

Cada item falho é uma linha da saída, com o arquivo onde deveria estar.

### V9 — Arquivo alterado fora da lista declarada no plano

Compare o conjunto de arquivos tocados pelos commits do trabalho com a união dos `arquivos.cria` + `arquivos.altera` de todas as tasks.

```
git diff --name-only <branch-base>...HEAD
```

Falha: arquivo no diff que não está declarado em nenhuma task. Nomeie cada um. Some a isso os `desvios` já registrados pelo E1.

Arquivo declarado que não aparece no diff **não** é falha: pode ter sido criado e revertido dentro do escopo, ou já existir como estava.

### V10 — Segredo, credencial ou dado real de cliente no diff

**Roda sempre, mesmo quando todo o resto passou** (regra 5). É a única verificação que não pode ser pulada por nenhum motivo.

```
git diff <branch-base>...HEAD
```

Aplique a mesma tabela de sinais do `01-commits.md` (chave de API, credencial, chave privada, dado real de cliente). Falha: qualquer ocorrência, **com o valor mascarado na saída**.

Esta verificação existe em duas camadas de propósito: o E1 impede o segredo de entrar, o E2 pega o que entrou por fora do E1 (commit manual do dev, merge da base, arquivo trazido de outra branch).

**Repositório sem versionador:** V9 e V10 rodam sobre os arquivos declarados nas tasks e sobre a árvore de trabalho, em vez do diff. Não pule nenhuma das duas.

## Formato exato da saída

Use `assets/TEMPLATE-prontidao.md`. Grave em `docs/entregas/<trabalho_id>/` **não** é obrigatório — a saída do portão é para a tela e para o campo `portao` do `ENTREGA.md`.

Cabeçalho, sempre:

```
mergex E2 — PORTÃO DE PRONTIDÃO
Trabalho: <trabalho_id>   Branch: <branch>   Data: <AAAA-MM-DD>

RESULTADO: PRONTO
```

ou

```
RESULTADO: BLOQUEADO
```

Depois, a tabela das dez verificações, todas as linhas, sempre:

```
| # | Verificação | Resultado |
|---|---|---|
| V1 | Tasks concluídas | OK |
| V2 | Suíte verde por task | FALHA |
...
```

Resultado por verificação: `OK`, `FALHA`, `AVISO` ou `n/a`.

E, para cada `FALHA`, um bloco com **o que falta e onde corrigir**:

```
V2 — FALHA: suíte não verde
  T-01.03 "Recalcular o rateio por item" — suite: vermelha
  Onde corrigir: docs/manutencao/<OC-ID>-<slug>/sprint-01/tasks.md
  O que fazer: voltar ao E3 da runx, fazer a suíte passar, remarcar a task
```

Avisos vão numa seção própria no fim, sem alterar o resultado.

## Critério de saída

**`PRONTO`** quando nenhuma verificação deu `FALHA`. Grave `portao: pronto` no `ENTREGA.md`, reescreva `atualizado_em`, e siga para o E3.

**`BLOQUEADO`** quando qualquer verificação deu `FALHA`. Grave `portao: bloqueado` no `ENTREGA.md` e **encerre o fluxo da mergex**. Não classifique o diff, não monte a descrição do PR, não gere o pacote de QA, não faça push, não abra PR.

O trabalho fica na branch, commitado até onde estava correto. Nada é desfeito, nada é descartado, nada é maquiado.

## Quando falha

| Situação | O que fazer |
|---|---|
| `tasks.md` sem frontmatter | Leia da prosa e registre o aviso; se não for possível determinar o status, é `FALHA` em V1 |
| `QA.md` ausente em trabalho da runx | `FALHA` em V5 — a entrega ainda não passou pelo E4 da runx |
| `PERFIL.md` ausente | V8 inteira é `n/a`; não invente modo legado |
| Sem versionador | V9 e V10 rodam sobre árvore e tasks; as demais não mudam |
| Branch base indisponível para o diff | Use `git diff --name-only HEAD~<n>..HEAD` sobre os commits do trabalho registrados no `ENTREGA.md`; registre a imprecisão como aviso |
| Verificação impossível de rodar | Marque `FALHA`, nunca `OK`. Ausência de prova não é prova |
