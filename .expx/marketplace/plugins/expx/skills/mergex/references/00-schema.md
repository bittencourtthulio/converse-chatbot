# Contrato expx-schema v1 — frontmatter dos arquivos de estado da mergex

Leitura OBRIGATÓRIA em qualquer etapa que grave arquivo de estado (E0, E1, E8).

Um painel de operação lê os arquivos gerados por esta skill para mostrar o que aguarda
revisão. Prosa não é contrato: a mesma informação pode ser escrita de dez formas corretas
para um humano e todas quebram um parser. O frontmatter resolve isso sem prejudicar a
leitura humana — a máquina lê o YAML, a pessoa lê a prosa abaixo dele.

O painel apenas LÊ. Esta skill continua sendo a única a escrever `docs/entregas/`.

## Contrato irmão — sprintx e runx

O `expx-schema v1` é compartilhado com a [`sprintx`](https://github.com/bittencourtthulio/sprintx)
(Build, F1–F6) e a [`runx`](https://github.com/bittencourtthulio/runx) (Run, E1–E5). A mergex
não tem kind compartilhado: ela produz um kind só, o `entrega`, exclusivo dela.

O que **é** compartilhado são os **nomes dos campos de indexação**. `modulo_afetado`,
`arquivos_alterados` e `palavras_chave` existem nas três skills com **exatamente estes nomes**
e a mesma semântica, ainda que em kinds diferentes (na `sprintx` vivem no `orquestrador` e no
`fechamento`; na `runx`, no `ocorrencia`, no `causa_raiz` e nos relatórios; na mergex, no
`entrega`). Quem indexa os artefatos das três lê o mesmo nome de campo nos três lados:
**renomear de um lado só quebra o índice**, mesmo que o painel continue funcionando.

| Campo | sprintx | runx | mergex |
|---|---|---|---|
| `modulo_afetado` | `orquestrador`, `fechamento` | `ocorrencia`, `relatorio_tecnico`, `relatorio_uso` | `entrega` |
| `arquivos_alterados` | `orquestrador`, `fechamento` | `relatorio_tecnico` | `entrega` |
| `palavras_chave` | `orquestrador`, `fechamento` | `causa_raiz`, `relatorio_tecnico` | **não se aplica** (ver abaixo) |

Ao mudar um destes nomes, mude nas três skills.

**A semântica de `arquivos_alterados` difere de propósito.** Na `sprintx` e na `runx` ele é a
união dos `arquivos` (`cria` + `altera`) das tasks concluídas — o que o plano declarou. Na
mergex ele é o **diff real**. As duas leituras usam o mesmo nome porque respondem à mesma
pergunta ("que caminhos este trabalho tocou") e o índice as trata igual; a mergex é só a fonte
mais precisa das duas, porque é a única que enxerga o versionador. Quando divergem, é a mergex
que está certa — e a divergência já tem lugar próprio: `desvios`.

## Regras universais

Valem para todo arquivo que leva frontmatter:

1. O bloco YAML é a primeira coisa do arquivo, delimitado por `---` antes e depois.
2. Toda chave em `snake_case`, minúscula, sem acento.
3. Todo valor de enum em minúscula e sem acento: `entregue`, nunca `Entregue`.
4. Datas em ISO: `AAAA-MM-DD`. Obtenha a data com `date +%Y-%m-%d` do sistema, nunca de memória.
5. Booleanos: `true` / `false` (sem aspas).
6. Lista vazia é `[]`. Valor ausente é `null`. **NUNCA omita a chave** — o painel
   diferencia "não se aplica" de "esqueceram de escrever".
7. O frontmatter é a única fonte para o painel. A prosa abaixo dele é para humano e
   continua exatamente como esta skill já a produz.
8. Campos de texto no YAML são de UMA linha. Nada de duplicar prosa longa no YAML.
9. `atualizado_em` é reescrito a cada gravação do arquivo.
10. Nenhum caminho absoluto em nenhum valor.

## Enums

| Enum | Valores |
|---|---|
| `expx_tool` | `sprintx` \| `runx` |
| `entregue_por` | `mergex` |
| `tipo_trabalho` | `feature` \| `ocorrencia` |
| `estado` | `aberto` \| `entregue` \| `bloqueado` |
| `portao` | `pronto` \| `bloqueado` \| `null` (ainda não rodou) |
| `pr_estado` | `rascunho` \| `aberto` \| `merged` \| `fechado` \| `null` |
| `raio` | `baixo` \| `medio` \| `alto` \| `null` (sem modo legado) |
| `faixa` (por arquivo) | `alta` \| `media` \| `baixa` |

`expx_tool` fica como a skill de **origem** do trabalho (`sprintx` ou `runx`) — é ela que
governa o trabalho. O campo `entregue_por: mergex` diz quem gravou este arquivo. Mudar o enum
de `expx_tool` para incluir `mergex` quebraria o painel que lê as três skills (DM-23).

## Cabeçalho comum

Todo arquivo com frontmatter começa com estas quatro chaves, nesta ordem:

```yaml
expx_schema: 1
expx_tool: <sprintx | runx>
kind: <o kind do arquivo>
trabalho_id: <slug da feature ou OC-ID-slug>
```

`trabalho_id` é sempre o mesmo da skill de origem: o `<slug-da-feature>` da sprintx ou o
`<OC-ID>-<slug>` da runx.

## O kind que a mergex produz

### `docs/entregas/<trabalho_id>/ENTREGA.md` → `kind: entrega`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: entrega
trabalho_id: OC-2026-0184-icms-st-base-desconto
entregue_por: mergex
titulo: Corrigir base de calculo do ICMS-ST com desconto incondicional
tipo_trabalho: ocorrencia
tipo_ocorrencia: regra-de-calculo
estado: entregue
versionado: true
branch: fix/OC-2026-0184-icms-st-base-desconto
branch_base: main
commits:
  - task: T-01.01
    commit: a3f19c2
  - task: T-01.02
    commit: 7b2e401
modulo_afetado: [fiscal, relatorios]
arquivos_alterados: [src/fiscal/calculo_icms_st.py, src/fiscal/base_calculo.py, tests/fiscal/test_icms_st_desconto.py]
faixa_atencao:
  - arquivo: src/fiscal/calculo_icms_st.py
    faixa: alta
  - arquivo: src/fiscal/base_calculo.py
    faixa: media
  - arquivo: tests/fiscal/test_icms_st_desconto.py
    faixa: baixa
raio: alto
atencao:
  olho_obrigatorio: 3
  leitura_rapida: 2
  dispensavel: 4
portao: pronto
desvios: []
push_feito: true
pr_url: https://github.com/<org>/<repo>/pull/482
pr_estado: rascunho
criado_em: 2026-08-27
atualizado_em: 2026-08-29
entregue_em: 2026-08-29
---
```

### Campo a campo

| Campo | Regra |
|---|---|
| `trabalho_id` | O slug da sprintx ou o `<OC-ID>-<slug>` da runx. O mesmo da pasta de origem |
| `entregue_por` | Sempre `mergex` |
| `tipo_ocorrencia` | O tipo da runx; `null` quando `tipo_trabalho: feature` |
| `estado` | `aberto` no E0; `entregue` quando o fluxo completou; `bloqueado` quando o portão barrou |
| `versionado` | `false` em repositório sem versionador |
| `branch`, `branch_base` | `null` quando `versionado: false` |
| `commits` | Um item por task commitada, na ordem em que fecharam; `[]` sem versionador |
| `modulo_afetado` | Os módulos que a entrega toca (ver abaixo) |
| `arquivos_alterados` | **O diff real** — ver abaixo. É o campo mais importante deste kind |
| `faixa_atencao` | A faixa de atenção por arquivo (ver abaixo) |
| `raio` | A faixa da legadox; `null` sem modo legado — **nunca invente uma faixa** |
| `atencao` | As três contagens do E3; zeros quando o E3 não rodou |
| `portao` | O resultado do E2 |
| `desvios` | Arquivos alterados fora da lista declarada, detectados no E1 e no E2; `[]` quando não houve |
| `push_feito` | `true` só quando o E6 confirmou que o remoto tem o mesmo commit |
| `pr_url` | A URL devolvida pelo E7; `null` quando o PR não foi aberto — **não é falha** |
| `pr_estado` | `rascunho` na abertura normal; `aberto` quando o QA já aprovou; `merged`/`fechado` quando o E9 ou uma pessoa atualizarem |
| `entregue_em` | A data em que o fluxo completou; `null` enquanto `estado` não for `entregue` |

## Os campos de indexação

Três campos existem para que a entrega seja **indexável por arquivo e por módulo**. Eles são
listas e seguem a regra universal 6: **nunca omita a chave**; vazia é `[]`, jamais ausente.

### `arquivos_alterados` — o diff real, não a previsão do plano

**É o campo mais importante deste kind, e a razão de a mergex ser quem o grava.**

A `sprintx` e a `runx` declaram nas tasks os arquivos que o trabalho *pretende* tocar. A
mergex é a única camada do método que conhece o **diff real**: o que de fato mudou, incluindo
o que ninguém previu e excluindo o que foi previsto e não foi necessário. Um índice alimentado
pela previsão do plano indexa a intenção; alimentado pelo diff, indexa o fato.

- Fonte: `git diff --name-only <branch_base>...HEAD`, a mesma base do E3 (três pontos).
- Caminhos **relativos à raiz do repositório**, na forma exata em que o versionador os devolve.
- Sem repetição, ordenados alfabeticamente.
- Inclui arquivo removido (`D`) e as duas pontas de um renomeado (`R`): o caminho antigo
  deixou de existir e o novo passou a existir, e as duas coisas são histórico daquele caminho.
- Sem versionador (`versionado: false`), é a união dos campos `arquivos` (`cria` + `altera`)
  das tasks **concluídas** — a melhor aproximação disponível. Registre o aviso de que a base
  foi o plano, não o diff.
- Vazio só quando não há diff, o que o E2 já deveria ter barrado.

**Divergência entre `arquivos_alterados` e a lista declarada nas tasks vai para `desvios`, não
para uma correção silenciosa deste campo.** Este campo diz o que aconteceu; `desvios` diz o
que aconteceu fora do previsto. Os dois são verdadeiros ao mesmo tempo.

### `modulo_afetado`

Os módulos que a entrega toca, em minúscula e sem acento, um termo por módulo (`autenticacao`,
não `Autenticação`; `relatorios`, não `Relatórios`). Mesmo nome de campo e mesma semântica da
`sprintx` e da `runx`.

Derivação, nesta ordem de precedência:

1. O `modulo_afetado` já declarado pela skill de origem (`ORQUESTRADOR.md` da sprintx,
   `00-OCORRENCIA.md` da runx). **Existindo, é copiado sem reinterpretar** — a origem é a fonte.
2. Não existindo, derivado dos caminhos de `arquivos_alterados`, pelas camadas do
   `CONVENCOES.md` da stackx quando ele existe, ou pela estrutura de pastas quando não.
3. Não sendo possível derivar com segurança, `[]` e um aviso. **Nunca invente um módulo.**

### `faixa_atencao` — a faixa de atenção por arquivo

Uma lista de objetos `{arquivo, faixa}`, um por arquivo classificado no E3.

```yaml
faixa_atencao:
  - arquivo: src/fiscal/calculo_icms_st.py
    faixa: alta
```

- `arquivo` é um caminho de `arquivos_alterados`, na mesma forma exata. Um caminho aqui que não
  esteja lá é erro de gravação.
- `faixa` usa o vocabulário do índice — `alta` \| `media` \| `baixa` —, não o nome da faixa em
  prosa. O mapeamento é fixo:

| Faixa da mergex (E3) | `faixa` no YAML |
|---|---|
| OLHO OBRIGATÓRIO | `alta` |
| LEITURA RÁPIDA | `media` |
| DISPENSÁVEL | `baixa` |

Este campo é a contraparte **por arquivo** do campo `atencao`, que traz só as contagens. As
contagens dizem quanto de olho humano a entrega pediu; a lista diz **onde**. Sem ela, o
histórico de faixa de um arquivo não existe — e é ele que fecha o ciclo com o memox.

`faixa_atencao` é `[]` enquanto o E3 não rodou (no E0 e durante o E1), e é gravado inteiro no
E3, junto com as contagens.

**Por que dois campos e não um.** `atencao` é lido pelo painel para mostrar quanto de revisão
cada PR está pedindo; `faixa_atencao` é lido pelo índice para saber o passado de um caminho.
Derivar um do outro é impossível nos dois sentidos: das contagens não se recupera quais
arquivos, e varrer a lista a cada render do painel custaria mais que ler três inteiros.

### `palavras_chave` — por que a mergex NÃO o grava

`palavras_chave` existe na `sprintx` (no `orquestrador` e no `fechamento`) e na `runx` (no
`causa_raiz` e nos relatórios), e **não existe** no `kind: entrega`. Isso é deliberado, não
esquecimento.

As palavras-chave descrevem **o trabalho** — o assunto, o domínio, o defeito. Quem sabe disso é
a skill que investigou ou planejou: a runx tem a causa raiz, a sprintx tem a descoberta. A
mergex não sabe nada sobre o assunto que já não esteja escrito nesses artefatos; gerar termos
próprios aqui seria conteúdo novo (regra 7), e termos diferentes dos da origem para o mesmo
trabalho quebrariam a busca por termo do índice, que casa string exata.

O índice já encontra o trabalho pelas palavras-chave que a origem gravou, e chega ao
`ENTREGA.md` pelo `trabalho_id`. **Não acrescente `palavras_chave` a este kind** sem que as
três skills concordem sobre quem é a fonte.

A regra prática: a mergex grava o que **só ela** sabe (o diff real, a faixa por arquivo, a
branch, os commits) e copia o que a origem já declarou (`modulo_afetado`). O que ela não sabe,
ela não inventa.

## Arquivos SEM frontmatter

Não recebem frontmatter, porque o painel não os lê individualmente:

- `PR.md` — a descrição do pull request;
- `QA-PACOTE.md` — o pacote executável pelo QA;
- `ATENCAO.md` — a classificação das três faixas.

Não acrescente frontmatter a eles: um `kind` fora deste contrato é uma violação, não uma
extensão. A informação que a máquina precisa dos três já está no `ENTREGA.md` — as contagens
em `atencao`, a faixa por arquivo em `faixa_atencao`, e os caminhos em `arquivos_alterados`.

## Regra de migração — entregas que já existem

Ao abrir um `ENTREGA.md` que já existe e não tem os campos de indexação:

1. A skill os acrescenta na PRÓXIMA VEZ que gravar aquele arquivo, inferindo os valores do
   que já existe: `arquivos_alterados` do diff da branch registrada, `faixa_atencao` do
   `ATENCAO.md` da mesma pasta, `modulo_afetado` da skill de origem.
2. A skill NUNCA reescreve em massa nem sai migrando entregas que não vai tocar.
3. Se um valor não puder ser inferido com segurança, use `[]` e siga — nunca invente, nunca
   pergunte, nunca pare. A chave sempre existe.
4. Migrar o frontmatter NÃO autoriza reescrever a prosa nem apagar o histórico de `commits`.

## Verificação antes de gravar

- [ ] O bloco `---` é a primeira coisa do arquivo e está fechado.
- [ ] O cabeçalho comum (`expx_schema`, `expx_tool`, `kind`, `trabalho_id`) está presente.
- [ ] Nenhuma chave do kind foi omitida — ausente é `null`/`[]`, nunca chave faltando.
- [ ] Nenhum acento em chave ou em valor de enum.
- [ ] Datas em `AAAA-MM-DD`; `atualizado_em` reescrito nesta gravação.
- [ ] `arquivos_alterados` veio do diff real, sem repetição, e não da previsão das tasks.
- [ ] Todo caminho de `faixa_atencao` está em `arquivos_alterados`.
- [ ] `faixa` usa `alta`/`media`/`baixa`, nunca o nome da faixa em prosa.
- [ ] `modulo_afetado` em minúscula e sem acento.
- [ ] Nenhum caminho absoluto em nenhum valor.
