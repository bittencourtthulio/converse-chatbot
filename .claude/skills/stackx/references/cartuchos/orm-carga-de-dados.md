# Cartucho 2 — N+1 e carga de dados no ORM

> **Confirme o ORM e a versão exata em `docs/stack/CONVENCOES.md` §4 antes de
> aplicar.** As APIs e os padrões de detecção abaixo mudam entre versões maiores,
> e alguns dos comportamentos descritos foram alterados por default em versões
> recentes.

**Leia só a seção do seu ORM.** A primeira seção vale para todos.

---

## Por que este cartucho existe

Consulta N+1 é o defeito mais caro que **passa em todos os testes**. Com 3 linhas
de massa de teste, 4 consultas e 1 consulta rodam igual. Com 5.000 linhas em
produção, viram 5.001 idas ao banco — e o custo não é o banco, é a **latência de
rede multiplicada**: 5.000 × 1ms de round-trip = 5 segundos de CPU ociosa
esperando.

Por isso não adianta revisar procurando "código feio": o código de um N+1 é
bonito. É um laço lendo uma propriedade. A detecção precisa ser mecânica.

**A regra transversal, para qualquer ORM:** a fronteira perigosa é onde uma
coleção encontra um acesso a relação. Todo `for`/`map`/`each` sobre resultado de
consulta que toca uma propriedade de outra entidade é suspeito até prova em
contrário. Serialização é o lugar clássico, porque o laço fica escondido dentro
do serializador — o código que você lê não tem laço nenhum.

**Como provar, sem depender de instinto:** conte consultas num teste. É o único
método que não mente e o único que impede regressão.

```
carregar 1 registro  → N consultas
carregar 10 registros → N consultas  ✓ constante
carregar 10 registros → N+9 consultas ✗ N+1
```

Um teste que afirma "esta rota faz no máximo 4 consultas" é barato de escrever e
pega o problema para sempre. Sem ele, o N+1 volta na próxima refatoração — e a
volta é silenciosa.

**O outro lado da moeda, que a correção ingênua cria:** carregar tudo de uma vez
resolve o N+1 e cria explosão de memória e produto cartesiano. Trocar 5.000
consultas por uma consulta que traz 400 MB não é vitória. As duas patologias são
o mesmo erro — não pensar no volume — em direções opostas.

---

## O que os benchmarks de teste escondem

| Sintoma em produção | Por que o teste não pegou |
| ------------------- | ------------------------- |
| N+1 | Massa pequena: 3 linhas dão 3 consultas extras, imperceptíveis |
| Produto cartesiano em join múltiplo | Com 3 × 2 × 2 dá 12 linhas; com 3.000 × 20 × 20 dá 1,2 milhão |
| Paginação lenta no fim | `OFFSET` grande nunca é exercitado: o teste pagina a página 1 |
| Falta de índice | Com 100 linhas o planner faz varredura completa e é rápido |
| Carga preguiçosa fora da sessão | O teste mantém a sessão aberta o tempo todo; a produção fecha antes de serializar |
| Transação longa | O teste não tem concorrência, então o lock não aparece |

---

## Prisma

**A boa notícia:** o `include`/`select` é explícito, então o N+1 clássico por
acesso preguiçoso não existe — não há lazy loading.

**As armadilhas reais:**

- **`include` aninhado gera consultas separadas por nível, não join.** É bom
  (sem produto cartesiano) e ruim: um `include` de 3 níveis sobre uma lista faz
  uma consulta por nível com `IN (...)` gigante. Com listas grandes, esse `IN`
  passa de milhares de itens e o planner degrada.
- **O N+1 aparece no código de aplicação**, num `Promise.all` de `findUnique`
  dentro de um `map`. Parece paralelo e eficiente; são N consultas. A correção é
  um `findMany` com `where: { id: { in: ids } }` e reagrupamento em memória.
- **`select` ausente traz todas as colunas**, incluindo colunas grandes (texto,
  JSON, blob). Numa listagem, isso é a diferença entre 2 MB e 200 MB
  trafegados — e não aparece no tempo de consulta, aparece na memória do processo.
- **Relação sem `include` volta `undefined`, não erro.** O bug vira `null` na
  resposta, silenciosamente, em vez de exceção.

**Detecção:** ligue o log de consultas (`log: ['query']`) num teste e conte. Um
middleware/extension que conta consultas por requisição e falha acima de um
limite é o portão que impede regressão.

---

## TypeORM

- **`lazy: true` retorna Promise e faz consulta a cada acesso.** Um `map` sobre a
  coleção acessando `await item.relacao` é N+1 perfeito, e parece código async
  normal.
- **`eager: true` na entidade é pior**, porque carrega **sempre**, inclusive na
  consulta em que você não precisa da relação — e é invisível no ponto de uso.
  Eager em relação com muitos filhos degrada toda consulta da entidade.
- **`leftJoinAndSelect` de várias coleções na mesma query gera produto
  cartesiano.** Duas coleções de 50 itens cada dão 2.500 linhas para 1 entidade.
  Com paginação fica pior: o `LIMIT` corta linhas do produto, não entidades, e a
  página vem com menos registros do que deveria — bug de dados, não de
  performance. Use consultas separadas ou a estratégia de carga por relação.
- **`find` com `relations` profundas** monta joins que o planner não consegue
  otimizar bem.

---

## Sequelize

- **`include` gera join por padrão**, com o mesmo problema de produto cartesiano
  e o mesmo bug de `limit` cortando linhas do join. `separate: true` em coleções
  troca o join por consulta separada — resolve a contagem, custa uma consulta.
- **`getters` de associação** (`instance.getPosts()`) dentro de laço é N+1.
- **Hooks** (`afterFind`) que carregam dados por instância multiplicam consultas
  invisivelmente: o custo não está no código que você está lendo.

---

## Django ORM

- **Acesso a `obj.relacao` fora de `select_related`/`prefetch_related` dispara
  consulta.** No template ou no serializador, isso é N+1 e não aparece na view.
- **`select_related` é join** (só para ForeignKey/OneToOne);
  **`prefetch_related` é segunda consulta** (para ManyToMany e reverso). Usar o
  errado não dá erro: dá lentidão.
- **`prefetch_related` mais filtro depois** descarta o prefetch e reconsulta.
  Filtrar em Python o que já foi prefetchado é o caminho; filtrar via ORM
  refaz tudo.
- **`.count()` num queryset já avaliado** consulta de novo; `len()` usa o cache.
  O inverso — `len()` num queryset não avaliado — carrega tudo na memória.
- **`.exists()` versus `if queryset:`** — o segundo materializa todas as linhas
  para decidir um booleano.
- **`only()`/`defer()` mais acesso ao campo deferido** dispara uma consulta **por
  objeto** para buscar aquele campo. A otimização vira N+1.
- **Detecção:** `assertNumQueries` nos testes; `django-debug-toolbar` no
  desenvolvimento.

---

## SQLAlchemy

- **O default de relação é `lazy="select"`**: acesso dispara consulta.
- **`DetachedInstanceError`** ao acessar relação depois da sessão fechar é o
  mesmo problema mostrando a cara: o código estava contando com lazy load.
  Corrigir "abrindo a sessão por mais tempo" troca N+1 por transação longa —
  duas patologias pelo preço de uma.
- **`joinedload` × `selectinload`**: `joinedload` faz um join (produto cartesiano
  em coleções, e quebra `LIMIT` do mesmo jeito); `selectinload` faz uma segunda
  consulta com `IN`. Para coleção, `selectinload` quase sempre. Para
  many-to-one, `joinedload`.
- **`lazy="dynamic"`** devolve query, não coleção: `len()` nela carrega tudo.
- **Detecção:** evento `before_cursor_execute` contando consultas, com asserção
  no teste.

---

## Active Record (Rails)

- **`includes` decide sozinho entre duas estratégias** (`preload` com duas
  consultas × `eager_load` com join), e a decisão muda se você usar `references`
  ou filtrar pela associação. O mesmo código muda de plano conforme o `where`.
  Quando o comportamento importa, use `preload` ou `eager_load` explicitamente.
- **`includes` mais método na associação em laço** ainda pode ser N+1 se o método
  toca outra associação não incluída.
- **Contador em laço** (`post.comments.count`) é uma consulta por post;
  `counter_cache` ou `size` sobre associação carregada resolve. `count` sempre
  consulta, `size` usa o cache se houver, `length` carrega.
- **Escopo default com `order`/`include`** aplica em toda consulta, inclusive
  onde não faz sentido — e some do código que você lê.
- **Detecção:** `bullet` em desenvolvimento; `ActiveSupport::Notifications` para
  contar consultas em teste.

---

## Eloquent (Laravel)

- **Lazy loading é o padrão**: `$pedido->cliente` num laço é N+1.
  `Model::preventLazyLoading()` em ambiente de desenvolvimento e teste transforma
  o N+1 em **exceção** — é a medida de maior retorno deste cartucho inteiro,
  porque converte um problema de performance invisível em erro visível no CI.
- **`with()` aninhado** resolve, mas `with('a.b.c')` sobre lista grande gera `IN`
  enorme por nível.
- **Accessors que tocam relação** escondem o N+1 dentro do modelo.
- **`$model->relacao()->count()` em laço** — uma consulta por item;
  `withCount()` resolve numa só.

---

## GraphQL, em qualquer ORM

O N+1 aqui é estrutural, não acidental: cada resolver de campo roda **por
item da lista**, e o resolver não sabe que está num laço. Uma consulta de 100
itens com 3 campos de relação vira 301 consultas sem que exista laço algum no
código.

A solução é batching por camada (padrão DataLoader): acumular as chaves pedidas
no mesmo tick e resolver em uma consulta. Sem isso, otimizar resolver a resolver
não converge — o problema volta a cada campo novo.

**Consequência de projeto:** se o CONVENCOES.md registra GraphQL sem camada de
batching, isso é **lacuna de impacto ALTO**, não detalhe de implementação.

---

## Checklist ao revisar código que carrega dados

- [ ] Todo laço sobre resultado de consulta foi verificado quanto a acesso de
      relação — inclusive o laço escondido no serializador.
- [ ] Existe teste contando consultas na rota/caso de uso crítico.
- [ ] A correção não trocou N+1 por produto cartesiano (join de duas coleções).
- [ ] Paginação usa `LIMIT` sobre entidades, não sobre linhas de join.
- [ ] Listagem seleciona colunas explicitamente, sem trazer colunas grandes.
- [ ] Não há carga preguiçosa depois do fechamento da sessão/transação.
- [ ] Em GraphQL, há batching por camada.
- [ ] O volume real de produção foi considerado — não o volume da fixture.
