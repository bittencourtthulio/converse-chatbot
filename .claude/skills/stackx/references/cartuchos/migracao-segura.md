# Cartucho 1 — Migração segura por engine

> **Antes de aplicar qualquer coisa daqui: confirme a engine e a versão exata em
> `docs/stack/CONVENCOES.md` §4.** O comportamento descrito varia por versão, e
> várias das travas abaixo deixaram de existir em versões recentes — aplicar a
> recomendação de uma versão antiga numa nova custa complexidade à toa; o
> contrário custa produção parada. Se o CONVENCOES.md não traz a versão exata,
> isso é lacuna: pare e obtenha a versão antes de recomendar.

**Leia só a seção da sua engine.** Não leia o arquivo inteiro.

Este cartucho alimenta o cálculo de raio de impacto do legadox: **migração que
trava tabela grande é sinal de raio ALTO**, sempre.

---

## O que decide tudo: o que é bloqueado, por quanto tempo, e a fila

Três fatos valem para toda engine relacional e explicam quase todo incidente de
migração:

1. **O tempo de posse do lock importa menos que o tipo dele.** Um lock exclusivo
   de 5ms é inofensivo; o problema é quando ele **espera** para ser adquirido.
2. **Lock pedido entra em fila, e a fila bloqueia quem vem atrás.** Este é o
   mecanismo que derruba sistemas: sua migração espera por uma transação longa,
   e todas as consultas que chegam depois esperam pela sua migração — inclusive
   `SELECT`s que sozinhos nunca seriam bloqueados. A tabela fica indisponível
   sem que sua migração tenha sequer começado.
3. **Migração roda em transação (na maioria dos frameworks).** Isso é bom para
   atomicidade e péssimo para tempo de lock: cada passo segura o lock até o
   commit final. Migração com muitos passos = lock somado.

Corolário operacional, independente de engine: **antes de qualquer DDL em tabela
grande, imponha um timeout curto de aquisição de lock e repita**, em vez de
esperar indefinidamente. Falhar rápido e tentar de novo é infinitamente melhor
que uma fila crescente.

---

## PostgreSQL

### Alterações que NÃO reescrevem a tabela (baratas, mas ainda pegam `ACCESS EXCLUSIVE`)

Adicionar coluna nullable sem default; adicionar coluna com **default constante**
(11+); `DROP COLUMN`; renomear coluna/tabela; alterar `varchar(n)` para `text` ou
aumentar `n`.

**Por quê:** desde a 11 o default constante é guardado no catálogo
(`pg_attribute.attmissingval`) e materializado na leitura, então não há reescrita.
Em 10 e anteriores, o mesmo comando reescreve a tabela inteira — é a diferença de
versão mais cara deste cartucho.

**A armadilha que sobra:** mesmo sem reescrita, essas operações pegam
`ACCESS EXCLUSIVE`, que conflita com **tudo**, incluindo `SELECT`. Se houver uma
transação longa aberta na tabela, você entra na fila e trava a aplicação. Daí:

```sql
SET lock_timeout = '3s';   -- falhe rápido, tente de novo
ALTER TABLE pedidos ADD COLUMN rastreio text;
```

**Default volátil continua reescrevendo.** `DEFAULT now()`, `DEFAULT gen_random_uuid()`
não são constantes: reescrevem. Adicione a coluna sem default e preencha depois.

### Alterações que reescrevem a tabela (caras)

Mudar tipo de coluna (salvo os casos binariamente compatíveis acima); adicionar
`PRIMARY KEY` a tabela existente; alterar `SET NOT NULL` em versões antigas.

**Por quê:** a reescrita cria uma nova cópia física do heap, sob `ACCESS EXCLUSIVE`
do começo ao fim. Em tabela de dezenas de GB isso é indisponibilidade em minutos
ou horas, e ainda exige espaço em disco equivalente à tabela.

### Índice sem bloqueio

```sql
CREATE INDEX CONCURRENTLY idx_pedidos_cliente ON pedidos (cliente_id);
DROP INDEX CONCURRENTLY idx_antigo;
```

**Por quê é necessário:** `CREATE INDEX` comum pega `SHARE`, que bloqueia toda
escrita na tabela pelo tempo inteiro da construção.

**As armadilhas do `CONCURRENTLY`, todas caras:**

- **Não roda dentro de transação.** Como a maioria dos frameworks envolve a
  migração em transação, é preciso desabilitar isso explicitamente na migração
  (Rails: `disable_ddl_transaction!`; Django: `atomic = False`; Alembic e
  ferramentas SQL: rodar fora do bloco transacional). Sem isso a migração falha
  em execução, não em revisão.
- **Falha deixa lixo.** Um `CREATE INDEX CONCURRENTLY` interrompido deixa um
  índice `INVALID` que **não é usado pelo planner mas é mantido em toda escrita**
  — custo sem benefício, invisível em `EXPLAIN`. Toda migração com
  `CONCURRENTLY` precisa de um `DROP INDEX IF EXISTS` antes, e de verificação de
  `pg_index.indisvalid` depois.
- **Espera transações antigas.** O `CONCURRENTLY` faz duas varreduras e espera
  todas as transações concorrentes na tabela terminarem. Uma transação ociosa
  aberta segura a construção indefinidamente — sem bloquear ninguém, mas sem
  terminar nunca.
- **Índice único concorrente** pode falhar ao final por violação, depois de todo
  o trabalho.

### Coluna obrigatória com default em tabela grande

Sequência segura, e a ordem é o ponto inteiro:

1. `ADD COLUMN x tipo` — nullable, sem default (ou com default constante em 11+).
2. Aplicação passa a **escrever** o valor em toda inserção/atualização.
3. Backfill **em lotes**, com commit por lote e pausa entre eles.
4. `ADD CONSTRAINT ck CHECK (x IS NOT NULL) NOT VALID` — instantâneo, passa a
   valer para linhas novas.
5. `VALIDATE CONSTRAINT ck` — varre a tabela sob `SHARE UPDATE EXCLUSIVE`, que
   **não bloqueia leitura nem escrita**.
6. Em 12+: `SET NOT NULL` reconhece o CHECK validado e é instantâneo. Antes da
   12, mantenha o CHECK e não use `SET NOT NULL`.

**Por que o backfill precisa ser em lotes:** um `UPDATE` único em milhões de
linhas segura os locks de linha até o commit, infla o WAL, atrasa a replicação e
gera bloat que o autovacuum vai perseguir por horas. O lote não é elegância, é o
que mantém as transações curtas.

**Por que o CHECK `NOT VALID` antes do `SET NOT NULL`:** `SET NOT NULL` direto
faz uma varredura completa sob `ACCESS EXCLUSIVE`. O caminho pelo CHECK move essa
varredura para um lock que não bloqueia tráfego.

### Renomear coluna em deploy sem indisponibilidade

Renomear é rápido no banco e desastroso na aplicação: **existe uma janela em que
código antigo e novo rodam ao mesmo tempo**, e um dos dois enxerga uma coluna que
não existe. A ordem segura é expandir-e-contrair, em **deploys separados**:

1. Deploy 1 — adiciona a coluna nova (nullable).
2. Deploy 2 — a aplicação escreve nas duas e lê da antiga.
3. Backfill em lotes.
4. Deploy 3 — a aplicação lê da nova, continua escrevendo nas duas.
5. Deploy 4 — para de escrever na antiga.
6. Deploy 5 — remove a antiga.

Cada passo é reversível sozinho. É lento de propósito: a alternativa é a janela
de erro.

**Detalhe que morde:** `DROP COLUMN` não devolve espaço nem invalida o cache de
prepared statements de conexões vivas; consultas com `SELECT *` em conexões
antigas podem falhar até reciclarem.

### Reversão

| Alteração | Reverte? | Como / por quê |
| --------- | -------- | -------------- |
| `ADD COLUMN` | Sim | `DROP COLUMN`. Perde os dados escritos na janela. |
| `DROP COLUMN` | **Não** | Os dados se foram. Só restore. Por isso `DROP` só depois de um deploy inteiro sem uso. |
| `CREATE INDEX CONCURRENTLY` | Sim | `DROP INDEX CONCURRENTLY` |
| Mudança de tipo com reescrita | Parcial | A volta é outra reescrita, e conversões com perda (numérico → menor precisão, `text` → `varchar(n)`) não voltam. |
| `ADD CONSTRAINT` | Sim | `DROP CONSTRAINT` |
| Backfill | **Não** | Sobrescreveu o que havia. Só é reversível se você preservou o valor antigo em outra coluna. |
| `DROP TABLE` | **Não** | — |

**Quando a reversão não é possível:** o plano de reversão não é a migração
inversa, é **restaurar de backup ou seguir para a frente com um fix**. Diga isso
explicitamente no plano da task. Uma migração irreversível exige: backup
verificado imediatamente antes, janela combinada, e um caminho de "seguir em
frente" escrito **antes** de rodar.

---

## MySQL / MariaDB

### O que decide: o algoritmo, e ele varia por versão e por engine de armazenamento

Toda `ALTER TABLE` no InnoDB roda por um de três algoritmos:

- `INSTANT` — só metadados. 8.0.12+ para adicionar coluna; 8.0.29+ permite
  posição arbitrária. MariaDB tem cobertura própria e diferente.
- `INPLACE` — reconstrói sem cópia completa; permite leitura e escrita
  concorrentes na maior parte do tempo, mas pega lock exclusivo breve no início
  e no fim.
- `COPY` — cria tabela nova e copia tudo, **bloqueando escrita** o tempo todo.

**A armadilha central:** o MySQL escolhe o algoritmo em silêncio. Se você não
declara, uma alteração que você acha barata pode cair em `COPY` e travar escrita
por horas. **Declare sempre**, para falhar em vez de degradar:

```sql
ALTER TABLE pedidos ADD COLUMN rastreio VARCHAR(64), ALGORITHM=INSTANT;
-- se não puder ser INSTANT, o comando falha. É o que se quer.
ALTER TABLE pedidos ADD INDEX idx_cliente (cliente_id), ALGORITHM=INPLACE, LOCK=NONE;
```

**Metadata lock:** mesmo uma alteração `INSTANT` precisa do MDL exclusivo, e ele
espera **toda** transação aberta na tabela terminar — inclusive uma transação
ociosa que só leu. Enquanto espera, bloqueia tudo que chega depois. Use
`lock_wait_timeout` baixo e repita.

**`ADD COLUMN ... DEFAULT` é instantâneo (8.0.12+), mas com pegadinha:** o valor
fica em metadados e cada linha nova carrega o registro estendido; muitas colunas
instantâneas acumulam e uma reconstrução futura fica mais cara. Não é motivo para
evitar, é motivo para não abusar.

**Índice não tem `CONCURRENTLY`.** O equivalente é `ALGORITHM=INPLACE, LOCK=NONE`.
Em tabela grande com tráfego pesado, a prática comum é ferramenta externa de
migração online (tabela sombra + triggers + troca atômica) — e a razão de existir
dela é justamente que `INPLACE` ainda pode falhar para certas alterações.

**Mudança de tipo, charset e collation reconstroem.** Mudar `utf8mb3` para
`utf8mb4` reescreve e ainda pode estourar limite de tamanho de índice, porque o
caractere passa de 3 para 4 bytes — a migração que "só troca charset" falha no
índice, no meio.

**Reversão:** DDL no MySQL **não é transacional** (8.0 tem atomic DDL para o
dicionário, o que evita dicionário inconsistente, mas não desfaz dados). Migração
interrompida no meio pode deixar estado parcial. Reversão de `ADD COLUMN` é
`DROP COLUMN`; de reconstrução, é outra reconstrução. Backfill não reverte.

---

## SQLite

**A limitação que define tudo:** `ALTER TABLE` suporta pouca coisa —
`RENAME TABLE`, `RENAME COLUMN` (3.25+), `ADD COLUMN`, `DROP COLUMN` (3.35+). Não
há `ALTER COLUMN` de tipo, nem adicionar constraint a tabela existente.

**Por isso o padrão é o "12-step":** criar tabela nova com o esquema desejado,
copiar os dados, dropar a antiga, renomear. Os frameworks fazem isso por baixo
dos panos — e a armadilha é que **o passo escondido perde o que não foi
recriado**: índices, triggers e views referentes à tabela antiga somem se a
migração não os recriar explicitamente. Verifique depois:

```sql
SELECT type, name FROM sqlite_master WHERE tbl_name = 'pedidos';
PRAGMA foreign_key_check;
```

**Chave estrangeira durante a recriação:** com `foreign_keys=ON`, a recriação
pode falhar ou, pior, cascatear deleção. O procedimento correto usa
`PRAGMA legacy_alter_table` / desliga FK durante a operação e roda
`foreign_key_check` antes de commitar. Desligar e esquecer de checar é como se
corrompe integridade sem erro visível.

**`ADD COLUMN` com default não-constante** (`CURRENT_TIMESTAMP`) é rejeitado —
por design, porque exigiria reescrever linhas existentes.

**Escrita é serializada no arquivo inteiro.** Não existe "migração sem bloqueio":
qualquer migração para o mundo. Sem WAL, leitores também param. Em produção com
SQLite, migração é janela, não estratégia.

**Reversão:** a recriação de tabela é destrutiva por natureza. Backup do arquivo
antes é a única reversão real e é barata — use-a sempre.

---

## SQL Server

**A distinção que importa: alteração de metadados × operação de tamanho de dados.**

Adicionar coluna nullable é metadados. Adicionar `NOT NULL` **com default** é
metadados desde 2012 Enterprise para tipos de largura fixa — mas **não** para
tipos de largura variável, que reescrevem. Essa exceção pega muita gente.

**Lock escalation:** o SQL Server converte muitos locks de linha em lock de
tabela ao passar de um limiar (~5000 locks). Um backfill grande em transação
única vira lock de tabela **no meio do caminho**, sem aviso. É a razão de fazer
backfill em lotes aqui também — e a razão pela qual "funcionou em homologação
com 10 mil linhas" não prova nada.

**Índice online** (`WITH (ONLINE = ON)`) é Enterprise; em edições menores a
criação bloqueia. Recomendar índice online sem confirmar a edição no
CONVENCOES.md é receita de migração que trava no ambiente do cliente.

**DDL é transacional**, ao contrário do MySQL — dá para envolver em transação
explícita e reverter. Mas transação longa em DDL segura locks de esquema e
bloqueia consultas que sequer tocam os dados.

---

## Checklist antes de qualquer migração em tabela grande

- [ ] Engine e **versão exata** confirmadas no CONVENCOES.md §4.
- [ ] Contagem de linhas e tamanho da tabela conhecidos. "Grande" começa onde a
      operação passa de segundos — meça, não estime.
- [ ] Sabe-se se a operação reescreve a tabela nesta versão.
- [ ] Timeout de aquisição de lock definido, com repetição — nunca espera infinita.
- [ ] Backfill em lotes, com commit e pausa por lote.
- [ ] Criação de índice fora de transação, com limpeza de índice inválido antes.
- [ ] Renomeação faseada em deploys separados, nunca em um.
- [ ] Plano de reversão escrito **antes** — e, quando a reversão não existe,
      backup verificado e caminho de "seguir para a frente" definido.
- [ ] Raio de impacto informado ao legadox: reescrita de tabela ou lock exclusivo
      em tabela com tráfego = **raio ALTO**.
