# E0 — ABERTURA

Você está no E0. Esta etapa roda **quando o trabalho começa**, não no fim: acionada pela `sprintx` no início da F6 e pela `runx` no início do E3, antes da primeira task.

Objetivo: garantir que exista uma branch própria para este trabalho, nascida antes da primeira linha de código, sem passar por cima do trabalho não salvo de ninguém.

Você não pergunta nada e não pede autorização. A única coisa que interrompe o E0 é árvore suja (passo 2), e nesse caso você **para e avisa** — não é uma pergunta, é um bloqueio.

## Pré-requisitos verificáveis

- Existe um trabalho em andamento com `trabalho_id` conhecido:
  - sprintx: `docs/<slug>/ORQUESTRADOR.md` existe;
  - runx: `docs/manutencao/<OC-ID>-<slug>/ORQUESTRADOR.md` existe.
- Se nenhum dos dois existe, não há trabalho para abrir. Diga que a mergex precisa de um trabalho planejado (F4 da sprintx ou E2 da runx) e encerre sem criar nada.

## Passo 1 — Detectar se o repositório usa versionamento

```
git rev-parse --is-inside-work-tree
```

**Se o comando falhar ou não houver `git`:** o repositório não usa versionamento. Registre no `ENTREGA.md` (passo 5) `versionado: false` e **siga o trabalho normalmente, sem nenhuma operação de versionamento**. Ausência de versionador nunca é erro nem bloqueio (regra 15).

Nesse modo, E0, E1, E6 e E7 não têm o que fazer; E2, E3, E4, E5 e E8 continuam valendo — a classificação de atenção é feita sobre os arquivos declarados nas tasks em vez do diff, e o revisor recebe `PR.md` como documento.

Confirme também a raiz do repositório, que ancora `docs/entregas/`:

```
git rev-parse --show-toplevel
```

## Passo 2 — Exigir árvore limpa

```
git status --porcelain
```

**Saída vazia:** siga.

**Qualquer linha na saída:** há alteração não commitada pendente. **PARE.** Não crie branch, não troque de branch, não commite, não guarde em stash, não descarte nada (regra 2).

Avise exatamente assim, listando os arquivos:

```
mergex E0 BLOQUEADO — árvore de trabalho suja

Há alteração não commitada em:
  <lista dos arquivos de git status --porcelain>

A mergex não cria nem troca branch por cima de trabalho não salvo.
Commite, guarde em stash ou descarte essas alterações e rode /mergex-abrir de novo.
```

E encerre o E0. Quem decide o destino daquele trabalho é a pessoa, não a skill.

Arquivo apenas não rastreado (`??`) também conta: pode ser trabalho de alguém. A skill não julga o conteúdo.

## Passo 3 — Determinar a branch base

Nesta ordem, parando no primeiro que responder:

1. **Convenção declarada:** `docs/stack/CONVENCOES.md` da stackx, se existir, na seção de versionamento. Ponto marcado como `PROPOSTA` **não governa**: vira aviso, não regra.
2. **Convenção detectada no repositório:** a branch padrão do remoto —
   ```
   git symbolic-ref refs/remotes/origin/HEAD
   ```
3. **A principal atual:** a branch em que o repositório está agora (`git branch --show-current`), se ela for `main`, `master`, `develop` ou equivalente detectada.

Registre qual das três respondeu. Ela vai para `branch_base` no `ENTREGA.md`.

Se a branch atual **não** for a base determinada e já for uma branch de trabalho de outra coisa, use a base determinada como ponto de partida — nunca ramifique um trabalho de dentro de outro sem que isso esteja declarado.

## Passo 4 — Criar a branch do trabalho

### Nome da branch

Convenção padrão da mergex:

| Origem | Padrão |
|---|---|
| trabalho da sprintx | `feature/<slug>` |
| `tipo: bug` da runx | `fix/<OC-ID>-<slug>` |
| demais tipos da runx (melhoria, campo novo, novo relatório, regra de cálculo) | `chore/<OC-ID>-<slug>` |

**Convenção detectada no repositório ou declarada no `CONVENCOES.md` da stackx vence a padrão acima** (regra 14). Para detectar, olhe os prefixos das branches existentes:

```
git branch -a --format='%(refname:short)'
```

Se a maioria das branches de trabalho usa outro prefixo ou outro separador, siga o que o repositório faz e registre a decisão no `ENTREGA.md`.

O `<slug>` é o mesmo já usado pela skill de origem — não gere um novo.

### Criação

Verifique **antes** se a branch já existe:

```
git rev-parse --verify --quiet <nome-da-branch>
```

**Se já existe:** **retome nela**, não crie outra (`git switch <nome>`). Este é o caso de sessão interrompida e precisa funcionar sem intervenção. Registre no `ENTREGA.md` que a branch foi retomada e siga direto para o passo 5.

**Se não existe:** crie a partir da base determinada:

```
git switch -c <nome-da-branch> <branch-base>
```

Confirme depois com `git branch --show-current`. Se a criação falhou, relate o erro do versionador literalmente e encerre — não tente contornar.

## Passo 5 — Registrar

Três gravações: duas de método, e uma terceira que é só exibição.

**1. No `ORQUESTRADOR.md` do trabalho** (da sprintx ou da runx), acrescente ou atualize a linha da branch, na prosa:

```
Branch do trabalho: <nome-da-branch> (base: <branch-base>) — aberta em <AAAA-MM-DD> pela mergex
```

Obtenha a data com `date +%Y-%m-%d` do sistema, nunca de memória. Não reescreva mais nada do `ORQUESTRADOR.md`: a mergex só acrescenta essa linha.

**2. Crie `docs/entregas/<trabalho_id>/ENTREGA.md`** a partir de `assets/TEMPLATE-ENTREGA.md`, com estado **aberto**:

- `estado: aberto`
- `branch` e `branch_base` preenchidos
- `versionado: true` (ou `false`, se o passo 1 assim determinou)
- `commits: []` — a lista cresce no E1
- `portao: null`, `push_feito: false`, `pr_url: null`, `pr_estado: null`
- `criado_em` e `atualizado_em` com a data de hoje

Crie a pasta `docs/entregas/<trabalho_id>/` se não existir. Leia o contrato do frontmatter em `08-registro.md` antes de gravar.

**3. Atualize `.expx/estado.json`**, o arquivo que a barra de status lê:

- `branch`: o nome da branch, **completo e sem corte** — a criada agora ou a retomada;
- `pr_estado`: `null` — no E0 nunca existe pull request, inclusive na retomada de uma branch
  cujo PR já tenha sido aberto antes. Se ele já existia, o E7 o repõe.

**Repositório sem versionador (passo 1): não grave nada.** Os dois campos ficam `null`, que
é o valor que já têm.

O procedimento é o de `10-estado.md`: só se `.expx/` existir, alterando apenas estes dois
campos e preservando os das outras skills, com gravação em temporário e renomeação. Falha de
gravação vai para o rastro e **não interrompe o E0** — a barra nunca barra trabalho.

## Critério de saída

O E0 terminou quando **todas** são verdade:

- [ ] A detecção de versionamento foi feita e registrada.
- [ ] `git status --porcelain` estava vazio na hora de criar/trocar a branch (ou o repositório não é versionado).
- [ ] A branch do trabalho existe e está ativa — criada agora ou retomada.
- [ ] `ORQUESTRADOR.md` tem a linha da branch.
- [ ] `docs/entregas/<trabalho_id>/ENTREGA.md` existe com `estado: aberto` e frontmatter válido.
- [ ] `.expx/estado.json` tem `branch` e `pr_estado: null` — **ou** `.expx/` não existe, ou o repositório não é versionado, e nesses casos nada foi gravado. Este item nunca reprova o E0.

Devolva ao chamador uma linha só: `mergex E0 OK — branch <nome> (base <base>), entrega registrada.` E devolva o controle: quem executa as tasks é a skill de origem.

## Quando falha

| Situação | O que fazer |
|---|---|
| Sem `git` / sem repositório | `versionado: false`, segue sem versionamento, sem erro (regra 15) |
| Árvore suja | PARA e avisa, sem criar nem trocar branch (regra 2) |
| Branch já existe | Retoma nela, não cria outra |
| Branch base não determinável | Usa a branch atual, registra a incerteza como aviso no `ENTREGA.md` |
| `git switch -c` falha | Relata o erro literal e encerra; nunca força, nunca descarta nada |
| Sem trabalho planejado | Diz o que falta (F4 da sprintx / E2 da runx) e encerra |
| `.expx/` não existe | Segue sem gravar o estado da barra, sem erro e sem aviso; **nunca cria o diretório** |
| Gravação do `estado.json` falhou | Registra no rastro e segue; o E0 continua OK |
