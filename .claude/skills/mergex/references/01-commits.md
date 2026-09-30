# E1 — COMMIT POR TASK

Você está no E1. Esta etapa roda **durante a execução do trabalho**, uma vez por task, no momento em que a task fecha. Nada é montado no fim.

A mensagem de commit é o **principal ativo de quem for resolver um conflito depois**. Ela precisa dizer a **intenção**, não só o que mudou. Meses depois, num merge difícil, ela é o único contexto que sobrevive.

## Pré-requisitos verificáveis

- O repositório é versionado (`versionado: true` no `ENTREGA.md`). Se não for, o E1 não tem o que fazer: siga sem erro.
- A branch ativa é a branch do trabalho registrada no `ENTREGA.md`. Confira com `git branch --show-current`. Se estiver em outra branch, **não commite**: relate a divergência e pare.
- A branch ativa **não** é a principal. Commit direto na principal é proibido (regra 11).

## O gatilho — quando commitar

Commite **exatamente quando** as três condições forem verdade ao mesmo tempo:

1. Os **dois testes da task** estão escritos (`teste_integracao` e `teste_funcional`) — mais o `teste_regressao`, quando é a primeira task de um `bug` da runx.
2. A **suíte inteira** rodou e está **verde** — não um subconjunto, não só os testes novos.
3. A task foi marcada `status: concluida` em `tasks.md`, no frontmatter e na prosa.

**Antes disso, não commita.** Suíte vermelha, task `em_andamento`, task `bloqueada`, teste faltando: nenhum commit. Essa é a mesma disciplina que o portão de prontidão (E2) vai cobrar depois — só que aqui ela impede o problema de entrar no histórico.

Um commit por task. **Nunca amontoar tasks distintas** no mesmo commit (regra 3), nem dividir uma task em vários commits temáticos.

## Passo 1 — Selecionar o que entra

Leia em `tasks.md` o campo `arquivos` da task: `cria` e `altera`. Essa é a **lista declarada**.

Compare com o que mudou de verdade:

```
git status --porcelain
```

**Regra dura: nunca commitar arquivo fora da lista declarada na task** (regra 4).

| Situação | O que fazer |
|---|---|
| Arquivo mudou e está declarado | Entra no commit |
| Arquivo declarado não mudou | Não entra; não é erro (pode ter sido feito em task anterior) |
| Arquivo mudou e **não** está declarado | **Não entra.** Registre o desvio e siga |

Arquivo alterado fora da lista é um desvio de escopo. Não o commite e não o apague: deixe-o na árvore, registre a ocorrência em `docs/entregas/<trabalho_id>/ENTREGA.md` na lista `desvios`, e siga para a próxima task. O E2 vai barrar a entrega por isso, com o arquivo nomeado — e é assim que tem que ser: quem decide o que fazer com aquele arquivo é a pessoa.

Adicione **por caminho explícito**, nunca em bloco:

```
git add <caminho-1> <caminho-2> ...
```

Não use `git add .`, `git add -A` nem `git add -u`. Eles arrastam o que não foi declarado.

### Nunca commite

- Amostra de dado real vinda da comparação da legadox (as amostras de caracterização podem conter dado de cliente).
- Arquivo de ambiente, credencial, chave, dump de banco, log de produção.
- Artefato de build ou dependência instalada, salvo quando o repositório versiona isso deliberadamente.

## Passo 2 — Varredura de segredo (obrigatória, a cada commit)

Rode **antes** de cada commit, sobre o que está prestes a ser commitado (regra 5):

```
git diff --cached
```

Procure no conteúdo adicionado:

| Categoria | Sinais |
|---|---|
| Chave de API / token | `api_key`, `apikey`, `secret`, `token`, `bearer `, `authorization:`, sequências longas de base64 ou hex em atribuição literal, prefixos de provedor (`sk-`, `ghp_`, `xox`, `AKIA`, `AIza`) |
| Credencial | `password`, `passwd`, `senha`, `pwd` com valor literal; string de conexão com usuário e senha embutidos (`://usuario:senha@`) |
| Chave privada | `BEGIN RSA PRIVATE KEY`, `BEGIN OPENSSH PRIVATE KEY`, `BEGIN PRIVATE KEY`, `.pem`, `.p12` |
| Dado real de cliente | CPF, CNPJ, e-mail, telefone, cartão, endereço ou nome de pessoa real em fixture, teste, seed ou comentário |

Placeholder óbvio não é segredo: `senha`, `xxx`, `changeme`, `<sua-chave>`, `example.com`, valor de variável de ambiente lido em runtime (`process.env.X`, `os.getenv("X")`). Na dúvida entre placeholder e segredo real, **trate como segredo**.

**Encontrou: aborte o commit.** Não commite parcialmente, não remova o trecho por conta própria.

```
mergex E1 ABORTADO — possível segredo em <arquivo>:<linha>

Trecho: <o padrão encontrado, com o valor MASCARADO — nunca ecoe o segredo>
Categoria: <chave de API | credencial | chave privada | dado real de cliente>

O commit da task <id> não foi feito. Remova o segredo do arquivo (use variável
de ambiente), confirme que ele nunca entrou no histórico, e conclua a task de novo.
```

Desfaça o staging (`git restore --staged <arquivos>`) e siga para a próxima task. A task fica **sem commit** e o E2 vai barrá-la.

**Nunca ecoe o valor do segredo** na saída, no log ou no arquivo de registro: mascare (`sk-...4f2a`).

## Passo 3 — Montar a mensagem

Formato exato:

```
<tipo>(<escopo>): <título da task>

<objetivo da task, uma frase>

Task: <id>
Trabalho: <trabalho_id>
Testes: <o que os dois testes cobrem, resumido>
```

### O tipo

Siga a convenção detectada no repositório (`git log --format=%s -30` mostra se ele usa Conventional Commits ou outra coisa) ou a declarada no `CONVENCOES.md` da stackx. **Convenção do repositório vence** (regra 14).

Na ausência de convenção detectável:

| Origem do trabalho | Tipo |
|---|---|
| sprintx (feature) | `feat` |
| runx `tipo: bug` | `fix` |
| runx demais tipos | `chore` |

### O escopo

O módulo ou área tocada pela task, derivado dos arquivos declarados (a pasta ou o domínio comum a eles). Sem escopo evidente, omita os parênteses: `fix: <título>`.

### O corpo

O `objetivo` da task, literal, uma frase. **Não parafraseie e não invente** — está escrito em `tasks.md` (regra 7).

### O rodapé

- `Task:` o `id` da task (`T-NN.MM`).
- `Trabalho:` o `trabalho_id` (o slug da feature ou o `<OC-ID>-<slug>`).
- `Testes:` uma linha resumindo o que `teste_integracao` e `teste_funcional` cobrem. Quando houver `teste_regressao`, cite-o primeiro: é ele que reproduzia o problema.

### Exemplo

```
fix(fiscal): Corrigir base de cálculo do ICMS-ST com desconto incondicional

Excluir o desconto incondicional da base de ST, conforme a regra vigente.

Task: T-01.02
Trabalho: OC-2026-0184-icms-st-base-desconto
Testes: regressão reproduz a base inflada com desconto; integração valida a nota
fim a fim; funcional confere a base para desconto de 10% sobre item de R$ 100.
```

## Passo 4 — Commitar e registrar

```
git commit -F <arquivo-de-mensagem>
```

Use um arquivo de mensagem (ou `-m` repetido) para preservar as quebras de linha do corpo. Não use `--amend`: reescrever histórico é proibido (regra 11).

Confirme o identificador:

```
git rev-parse --short HEAD
```

Acrescente à lista `commits` do `ENTREGA.md`, com `task` e `commit`, e reescreva `atualizado_em`. Um item por task, na ordem em que fecharam.

Não faça push aqui. Push é E6, e só depois do portão (E2) aprovar.

### Grave o evento no rastro

Acrescente uma linha em `docs/eventos/<trabalho_id>.jsonl`, no formato do
contrato `expx-eventos` v1:

```json
{"ts":"<ISO-8601 UTC>","expx_eventos":1,"trabalho_id":"<id>","ferramenta":"mergex","origem":"skill","evento":"commit_criado","fase":"e1","task":"T-01.02","agente":null,"resultado":"ok","detalhe":"<tipo>(<escopo>): <título>","arquivos":["<caminhos do commit>"]}
```

É com `commit_criado` que o painel mostra, por trabalho, a branch, os commits e
a task de cada um — sem tocar no versionador. **Chave nunca omitida:** valor que
não se aplica é `null`.

O arquivo é append-only e ignorado pelo versionador (é local da máquina de quem
executou). Ninguém o edita à mão.

## Critério de saída

Por task:

- [ ] Só arquivos declarados na task entraram no commit.
- [ ] A varredura de segredo rodou sobre o diff em stage e não achou nada.
- [ ] A mensagem tem tipo, escopo, título, objetivo e o rodapé com `Task`, `Trabalho` e `Testes`.
- [ ] O commit existe e seu identificador está no `ENTREGA.md`.
- [ ] A árvore ficou limpa dos arquivos daquela task.

## Quando falha

| Situação | O que fazer |
|---|---|
| Suíte vermelha | Não commita. A task não está concluída — o E2 vai barrá-la nomeando-a |
| Task sem os dois testes | Não commita. O E2 vai barrá-la |
| Arquivo fora da lista declarada | Não entra no commit; registra em `desvios`; o E2 barra |
| Segredo detectado | Aborta o commit, desfaz o staging, avisa com o valor mascarado |
| Branch errada ou principal | Não commita; relata a divergência e para |
| `git commit` falha (hook, assinatura) | Relata o erro literal do versionador e para; nunca contorna com `--no-verify` |
| Repositório sem versionador | Nada a fazer; segue sem erro |
