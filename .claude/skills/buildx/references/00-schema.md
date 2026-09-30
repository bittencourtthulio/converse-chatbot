# 00 — Schema dos artefatos do buildx

Leitura obrigatória em qualquer etapa que grave arquivo de estado (B1 a B6).

O buildx adota o contrato **expx-schema v1**, o mesmo do sprintx, runx e prodx. As regras universais R1 a R14 valem sem exceção e não são repetidas aqui. As mais citadas por quem escreve frontmatter no buildx:

| | |
|---|---|
| **R1** | o bloco YAML é a primeira coisa do arquivo, entre `---` |
| **R2** | chave em `snake_case`, minúscula, sem acento |
| **R3** | valor de enum minúsculo e sem acento |
| **R4** | data ISO `AAAA-MM-DD`, obtida do sistema com `date +%Y-%m-%d` |
| **R6** | chave nunca omitida: `[]` para lista vazia, `null` para ausente |
| **R9** | `atualizado_em` reescrito a cada gravação |
| **R10** | nenhum caminho absoluto em nenhum valor |

## Os dois níveis de estado

O contrato v1 nasceu com duas ferramentas que gravam artefato de estado: `sprintx` e `runx`. Ambas descrevem o estado de um **trabalho**, costurado por `trabalho_id`.

O buildx acrescentou um terceiro valor a `expx_tool` — e um nível acima:

```yaml
expx_tool: buildx
```

Ele grava o estado de um **projeto**, costurado por `projeto_id`. Um projeto tem N trabalhos, um por feature do mapa. Por isso os seis kinds do buildx são, junto com `relatorios_indice`, os únicos sem `trabalho_id`.

A ponte entre os níveis são duas chaves que a cadeia acrescenta ao artefato de cada feature: `origem_buildx` (o `projeto_id`) e `feature_id` (o `FT-NN`).

**O contrato e o parser já conhecem tudo isso.** `expx_tool` aceita `buildx`, `estagio` aceita `b1`..`b6`, e os seis kinds estão registrados — kind desconhecido é *rejeitado* pelo parser, não lido com o defeito à vista, então sem esse registro todo artefato de projeto seria descartado em silêncio pelo painel.

O `prodx` ainda não tem os kinds dele no contrato, e por isso os artefatos dele continuam invisíveis ao painel. É a pendência simétrica desta, e vale tratar.

## Cabeçalho comum

Todo artefato do buildx carrega estas quatro chaves antes das específicas:

```yaml
expx_schema: 1
expx_tool: buildx
kind: <um dos seis abaixo>
projeto_id: <slug do projeto>
```

`projeto_id` é a chave que costura tudo — é o slug do projeto, derivado do `PROJETO.md`, e aparece em todo artefato do buildx e no `origem_buildx` de cada feature planejada pelo sprintx.

### Como derivar o `projeto_id`

1. Pegue o nome essencial do sistema descrito, sem verbos de pedido.
2. Minúsculas, sem acento (ç → c, ã → a, é → e).
3. Espaços e separadores viram hífen; remova o que estiver fora de `a-z`, `0-9` e `-`; colapse hifens repetidos.
4. No máximo 5 palavras.

Exemplo: "quero um sistema de gestão de contratos para escritório de advocacia" → `gestao-de-contratos`.

## Os kinds

### `projeto` — `docs/projeto/PROJETO.md`

```yaml
expx_schema: 1
expx_tool: buildx
kind: projeto
projeto_id: gestao-de-contratos
titulo: Sistema de gestao de contratos
modo: autonomo            # autonomo | briefing
criado_em: 2026-08-30
atualizado_em: 2026-08-30
etapa: b3                 # b1 | b2 | b3 | b4 | b5 | b6 | concluido
descricao_original: docs/projeto/PROJETO.md#descricao-original
total_features: 11
features_entregues: 4
features_bloqueadas: 0
ciclos_recursao: 0
```

### `premissas` — `docs/projeto/PREMISSAS.md`

```yaml
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: gestao-de-contratos
atualizado_em: 2026-08-30
total: 23
por_origem:
  catalogo_lacunas: 18
  decisao_de_stack: 3
  f2_autonoma: 2
```

Cada premissa no corpo carrega: `id` (`PR-NN`), `assunto`, `decisao`, `por_que`, `o_que_invalida`, `origem`, `etapa`.

### `mapa` — `docs/projeto/MAPA.md`

```yaml
expx_schema: 1
expx_tool: buildx
kind: mapa
projeto_id: gestao-de-contratos
atualizado_em: 2026-08-30
total_features: 11
pendentes: 6
em_andamento: 1
entregues: 4
bloqueadas: 0
```

Cada feature no corpo carrega o contrato completo do B3: `id`, `slug`, `titulo`, `entrega`, `depende_de`, `paralelizavel`, `origem`, `status`.

### `recursao` — `docs/projeto/RECURSAO.md`

```yaml
expx_schema: 1
expx_tool: buildx
kind: recursao
projeto_id: gestao-de-contratos
atualizado_em: 2026-08-30
ciclo_atual: 2
teto_ciclos: 3
pendencias_abertas: 2
pendencias_resolvidas: 5
```

### `validacao` — `docs/projeto/VALIDACAO.md`

```yaml
expx_schema: 1
expx_tool: buildx
kind: validacao
projeto_id: gestao-de-contratos
data: 2026-08-30
veredito: aprovado          # aprovado | aprovado_com_pendencia | reprovado
itens_conferidos: 34
itens_atendidos: 32
itens_pendentes: 2
```

### `relatorio` — `docs/projeto/RELATORIO.md`

```yaml
expx_schema: 1
expx_tool: buildx
kind: relatorio
projeto_id: gestao-de-contratos
data: 2026-08-30
modo: autonomo
features_entregues: 11
prs_abertos: 11
pendencias_declaradas: 2
premissas_registradas: 23
ciclos_recursao: 2
```

## Enums do buildx

| Campo | Valores |
|---|---|
| `modo` | `autonomo` · `briefing` |
| `etapa` | `b1` · `b2` · `b3` · `b4` · `b5` · `b6` · `concluido` |
| `status` (feature) | `pendente` · `em_andamento` · `entregue` · `bloqueada` |
| `origem` (feature) | `descricao` · `premissa` · `recursao` · `template` |
| `origem` (premissa) | `catalogo_lacunas` · `decisao_de_stack` · `f2_autonoma` · `recursao` · `template` |
| `veredito` (validação) | `aprovado` · `aprovado_com_pendencia` · `reprovado` |
| `classe` (pendência) | `trabalho_novo` · `replanejamento` · `decisao_humana` · `recurso_externo` |

## O que o buildx grava nos artefatos das outras camadas

O buildx nunca reescreve artefato de outra camada. Ele **acrescenta duas chaves** ao frontmatter dos artefatos que a cadeia gera sob seu comando, na gravação normal daquela camada:

| Chave | Onde | Valor |
|---|---|---|
| `origem_buildx` | todo artefato do sprintx da feature | o `projeto_id` |
| `feature_id` | todo artefato do sprintx da feature | o `FT-NN` do `MAPA.md` |

São as duas chaves que permitem, depois, olhar qualquer plano de sprint e saber de qual projeto e de qual feature do mapa ele veio.
