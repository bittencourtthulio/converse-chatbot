# E6 — PUSH

Você está no E6. Aqui a branch sobe para o remoto. É a primeira etapa que sai da máquina do desenvolvedor.

## Pré-requisitos verificáveis

Todos, sem exceção:

- [ ] O repositório é versionado. Se não for, o E6 não tem o que fazer: registre `push_feito: false` e siga para o E8 (não há PR a abrir).
- [ ] O E2 devolveu `PRONTO`. **Portão bloqueado não sobe.**
- [ ] `docs/entregas/<trabalho_id>/QA-PACOTE.md` existe (E5).
- [ ] A branch ativa é a do trabalho e **não** é a principal.
- [ ] Há remoto configurado (`git remote -v`). Sem remoto: registre `push_feito: false`, informe que o trabalho está commitado localmente, e siga para o E8.

Se qualquer um falhar, o E6 não roda. Diga qual e pare.

## Passo 1 — Confirmar a branch

```
git branch --show-current
```

Compare com `branch` do `ENTREGA.md`. Divergente: pare e relate — não troque de branch para "corrigir".

Confirme que **não** é a principal. Se for, pare imediatamente: nunca push na principal (regra 11). Isso indica que o E0 não rodou ou que alguém trocou de branch no meio; relate e encerre.

## Passo 2 — Verificar o estado do remoto

```
git fetch origin <branch>
```

Depois, verifique se o remoto tem commits que a branch local não tem:

```
git rev-list --count HEAD..origin/<branch>
```

| Resultado | O que fazer |
|---|---|
| A branch não existe no remoto | Normal: primeiro push. Siga |
| Contagem `0` | O remoto está contido no local. Siga |
| Contagem maior que `0` | **PARE.** Não reconcilie |

Remoto à frente significa que alguém subiu algo nessa branch — outra sessão, outra máquina, outra pessoa. Reconciliar (merge, rebase, pull) mexeria em trabalho que não é seu.

```
mergex E6 BLOQUEADO — o remoto tem commits que esta branch não tem

Branch: <branch>
Commits no remoto e não aqui: <n>

A mergex não reconcilia histórico. Traga as alterações do remoto (git pull --ff-only,
ou a estratégia que o time usa), confirme que a suíte continua verde, e rode /mergex-pr
de novo.
```

Registre `push_feito: false` e encerre.

## Passo 3 — Subir

Primeiro push da branch:

```
git push --set-upstream origin <branch>
```

Pushes seguintes:

```
git push origin <branch>
```

**Nunca `--force`. Nunca `--force-with-lease`. Nunca `+<branch>`.** Em nenhuma circunstância, por nenhum motivo, nem para "consertar" um push anterior (regra 11). Se a única saída aparente é forçar, a saída correta é parar e relatar.

## Passo 4 — Confirmar e registrar

Confirme que o remoto tem o que o local tem:

```
git rev-parse HEAD
git rev-parse origin/<branch>
```

Os dois têm que ser iguais.

Registre no `ENTREGA.md`: `push_feito: true` e `atualizado_em` reescrito.

## Critério de saída

- [ ] `origin/<branch>` aponta para o mesmo commit que `HEAD`.
- [ ] Nenhum push forçado foi usado.
- [ ] `push_feito: true` no `ENTREGA.md`.

Siga para o E7.

## Quando falha

| Situação | O que fazer |
|---|---|
| Portão bloqueado | Não sobe. O E6 nem começa |
| Pacote de QA ausente | Não sobe. Rode o E5 antes |
| Branch é a principal | Para imediatamente e relata |
| Remoto à frente | Para e avisa; nunca reconcilia |
| Sem remoto configurado | `push_feito: false`, trabalho commitado localmente, segue para o E8 |
| Push rejeitado por permissão | Relata o erro literal; **nunca configura credencial** (regra 11 e segurança de versionamento) |
| Push rejeitado por hook/proteção de branch | Relata o erro literal; nunca contorna com `--no-verify` |
| Sem versionador | Nada a fazer; segue sem erro |
