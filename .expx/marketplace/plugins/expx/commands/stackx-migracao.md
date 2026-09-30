---
description: Consulta dirigida ao cartucho de migração segura do stackx — recebe a alteração de esquema pretendida e responde o que trava, por quê, qual a sequência segura, como reverter e qual o raio de impacto.
---

Acione a skill **stackx** e consulte
`references/cartuchos/migracao-segura.md`.

**Alteração pretendida:** `$ARGUMENTS`

Sem argumento, pergunte qual é a alteração e pare. Não varra o repositório em
busca de migrações para revisar — este comando responde sobre **uma** alteração.

## Roteiro

1. **Confirme a engine e a versão exata** em `docs/stack/CONVENCOES.md` §4.

```bash
grep -A3 -iE 'engine|banco|postgres|mysql|sqlite|sql server|maria' docs/stack/CONVENCOES.md
```

   - Sem CONVENCOES.md, ou sem a versão exata: **pare e pergunte a versão**. O
     cartucho é inútil sem ela, e várias travas descritas deixaram de existir em
     versões recentes. Registre a ausência como lacuna.

2. **Leia só a seção da engine em uso.** Não leia o arquivo inteiro.

3. **Dimensione a tabela.** Pergunte, ou verifique: quantas linhas, que tamanho,
   há tráfego de escrita durante o deploy? "Grande" começa onde a operação passa
   de segundos — meça, não estime.

4. Responda nos seis pontos abaixo.

## Formato da resposta

**1. O que trava, e por quê**
O tipo de lock, o que ele conflita, e — mais importante — se a operação
**reescreve** a tabela nesta versão. Sempre o motivo técnico junto da
recomendação: sem o motivo o agente não generaliza para o caso não previsto.

**2. A fila**
Se há transação longa possível na tabela, lembre que o lock pedido entra em fila
e bloqueia quem vem atrás — inclusive leituras que sozinhas nunca seriam
bloqueadas. Recomende timeout curto de aquisição com repetição.

**3. A sequência segura**
Passo a passo, na ordem, com o comando de cada passo. Se exigir deploys
separados (renomear, tornar obrigatória), diga **quantos** e o que roda em cada
um.

**4. O que pode dar errado**
As armadilhas da operação nesta engine — criação de índice fora de transação,
índice inválido deixado por falha, backfill em lote único, default volátil,
limite de tamanho de índice ao trocar charset, escalonamento de lock.

**5. Reversão**
Reverte? Como? Se **não** reverte, diga com todas as letras e exija: backup
verificado imediatamente antes, janela combinada, e caminho de "seguir para a
frente" escrito antes de rodar.

**6. Raio de impacto (legadox)**

| Achado | Raio |
| ------ | ---- |
| Reescreve tabela, ou lock exclusivo em tabela com tráfego | **ALTO** |
| Irreversível (`DROP COLUMN`, `DROP TABLE`, backfill destrutivo) | **ALTO** |
| Índice sem bloqueio, coluna nullable, constraint `NOT VALID` | MÉDIO |
| Só metadados em tabela pequena | BAIXO |

## Regras

- Nunca recomende sem a versão exata confirmada.
- Não execute a migração. Este comando aconselha.
- Se a engine não estiver coberta pelo cartucho, diga isso e responda pelos três
  fatos gerais (tipo de lock × tempo de posse, fila, migração em transação), sem
  inventar comportamento específico daquela engine.
