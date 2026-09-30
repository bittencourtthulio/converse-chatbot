# Etapa 1 — INDEXAÇÃO

Roteiro operacional da construção do índice. Leia esta etapa antes de qualquer reconstrução.

## Pré-requisitos

1. Existe pelo menos um artefato em uma das fontes abaixo. **Sem nenhum artefato, a etapa termina aqui**: o memox fica inativo, sem erro, e `/memox` informa que não há o que indexar. Um projeto que ainda não fechou trabalho não tem memória — esse é o estado correto.
2. `python3` disponível no `PATH`. O motor usa apenas a biblioteca padrão: sem rede, sem dependência externa, sem modelo.
3. A raiz do projeto é a raiz do repositório Git mais próxima do diretório de trabalho. Sem `.git` em nenhum ancestral, use a raiz do diretório de trabalho atual.

## Passo a passo

### 1.1 — Localize a raiz e leia a configuração

```bash
python3 .claude/skills/memox/assets/memox.py indexar
```

O motor faz, nesta ordem: localiza a raiz, lê `.expx/memoria/config.json` (ou usa os padrões de `assets/TEMPLATE-config.md`), varre as fontes, calcula os sinais derivados, grava `.expx/memoria/indice.json` de forma atômica e registra a marca de tempo em `.expx/memoria/ultima-indexacao`.

Nunca edite `indice.json` à mão. Ele é derivado: qualquer correção feita nele é perdida na próxima reconstrução, e uma entrada que não veio de um artefato viola a regra 1.

### 1.2 — As fontes e o que se extrai de cada uma

| Fonte | Campos extraídos | Origem do dado |
|---|---|---|
| `docs/relatorios/*/tecnico.md` | `trabalho_id`, `titulo`, `fechado_em`, `tipo_ocorrencia`, `modulo_afetado`, `arquivos_alterados`; causa em uma linha e risco residual, da prosa | frontmatter `kind: relatorio_tecnico` |
| `docs/relatorios/INDICE.md` | linha do tempo: data, ocorrência, tipo, módulo, resumo, pasta | frontmatter `kind: relatorios_indice`, lista `entradas` |
| `docs/manutencao/*/01-CAUSA-RAIZ.md` | `modo`, `comprovada`, `evidencia`, `arquivos_impactados`, `decisoes` | frontmatter `kind: causa_raiz` |
| `docs/<slug>/00-DECISOES.md` | cada decisão com `alternativa_descartada` e `motivo` | frontmatter `kind: decisoes` |
| `docs/legado/DIVIDA.md` | dívida por arquivo, com risco estimado | frontmatter `dividas:`, ou tabela em prosa |
| `docs/legado/PERFIL.md` | zonas de risco declaradas | frontmatter `zonas_de_risco:`, ou seção em prosa |
| `<trabalho>/base/00-LACUNAS.md` | o que a documentação não respondia | prosa, uma lacuna por linha |
| `docs/manutencao/*/QA.md` | `veredito`, `executado_em`, `achados` (severidade, arquivo, problema) | frontmatter `kind: qa`, ou a linha `VEREDITO:` da prosa |
| `docs/entregas/*/ENTREGA.md` | `branch`, `commits`, faixa de atenção por arquivo | frontmatter `kind: entrega` |
| `*/ORQUESTRADOR.md` | `titulo`, `tipo_trabalho`, `tipo_ocorrencia`, `concluido_em` | frontmatter `kind: orquestrador` |

O frontmatter é a fonte primária de todo campo estruturado. A prosa só é lida para o que não existe no YAML: a causa em uma linha, o risco residual e as lacunas.

### 1.3 — Chaves construídas

| Chave | Estrutura |
|---|---|
| `por_arquivo` | caminho → lista de entradas (trabalho, data, tipo, causa, papel, artefato) |
| `por_modulo` | módulo → o mesmo, agregado |
| `por_decisao` | módulo → decisões que o afetam, com alternativa descartada e motivo |
| `por_termo` | termo → ids de trabalho, sobre título, causa e resumo |

O campo `papel` distingue `alterado` (o trabalho mudou o arquivo, vindo de `arquivos_alterados`) de `impactado` (o trabalho apontou o arquivo na causa raiz, vindo de `arquivos_impactados`). **A distinção é o que torna o sinal de regressão possível** — não a apague ao agregar.

### 1.4 — Proveniência (regra 1)

Toda entrada guarda o caminho relativo do artefato de origem e a data. Uma entrada sem artefato de origem não entra no índice. Se um campo não puder ser extraído com segurança, grave `null` — nunca invente valor, nunca deduza data.

Caminhos são sempre relativos à raiz do projeto. Caminho absoluto no índice é violação da regra transversal.

### 1.5 — Segredos (regra 7)

Antes de qualquer extração, o conteúdo de cada artefato passa pelo redator. Detectado um segredo — chave de API, chave AWS, token GitHub ou Slack, JWT, chave privada, par credencial/valor, URL com credencial embutida, CPF —, o trecho é substituído por `[redigido pelo memox]` e o artefato entra em `artefatos_contaminados` com o caminho e os tipos encontrados.

O índice registra o caminho e omite o trecho. **O memox não corrige o artefato** (regra 9): ele reporta. Remover o segredo do arquivo em disco é uma ocorrência de segurança, tratada pela `runx`, não pelo memox.

## Formato exato da saída

```
memox — indice reconstruido em .expx/memoria/indice.json
memox — estado do indice
  reconstruido em: AAAA-MM-DD (levou N ms)
  trabalhos indexados: N
  arquivos com historico: N
  modulos: N
  regressoes comprovadas: N
  coincidencias de arquivo (sem evidencia causal): N
  ARTEFATOS CONTAMINADOS (trecho omitido do indice — regra 7):
    <caminho> — <tipos>
  fora do indice:
    <caminho> — <motivo>
```

As duas últimas seções só aparecem quando têm conteúdo.

## Critério de saída

- [ ] `.expx/memoria/indice.json` existe e é JSON válido.
- [ ] `totais.trabalhos` corresponde ao número de trabalhos distintos em disco.
- [ ] Toda entrada de `por_arquivo` tem `artefato` preenchido e data (regra 1).
- [ ] Nenhum caminho absoluto no índice.
- [ ] `.expx/memoria/` está no `.gitignore` (regra 8).
- [ ] Nenhum segredo literal presente no índice; contaminados reportados.

Verificação rápida da última linha:

```bash
grep -o 'sk-[A-Za-z0-9]\{16,\}' .expx/memoria/indice.json   # nada deve casar
```

## Quando falha

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `trabalhos indexados: 0` com artefatos em disco | artefatos sem frontmatter `expx-schema v1` | veja `fora do indice` na saída; o artefato entra quando a skill de origem gravá-lo com frontmatter. **Não acrescente o frontmatter você mesmo** — regra 9 |
| Trabalho sem `arquivos_alterados` | relatório técnico com a chave ausente ou `[]` | o trabalho entra no índice, mas não indexa arquivo. É correto: sem o campo, não há fato a registrar |
| Data ausente em uma entrada | `fechado_em` ausente e sem entrada no `INDICE.md` | a entrada fica com data `null` e vai para o fim da ordenação. Não deduza a data do nome da pasta |
| YAML malformado em um artefato | indentação quebrada, aspas não fechadas | o parser devolve mapa vazio e o artefato é listado em `fora do indice`. Corrija na skill de origem |
| `indice.json` corrompido | interrupção durante a gravação | a gravação é atômica (`.tmp` + `os.replace`), mas se ocorrer, apague `.expx/memoria/` e reconstrua: o índice é descartável (regra 2) |
| Reconstrução lenta (> 2 s) | volume muito acima de 200 trabalhos | verifique se `ignorar` no `config.json` cobre `node_modules`, `dist` e afins |

Falha de indexação **nunca** deve travar o trabalho do usuário. Na dúvida, apague `.expx/memoria/` e reconstrua do zero.
