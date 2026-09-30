# Estrutura de `.expx/memoria/config.json`

Configuração do memox. Criada com os padrões na primeira indexação, e a partir daí é do projeto: **a reconstrução do índice nunca a sobrescreve.**

Config ausente ou inválida não derruba nada: o motor cai nos padrões e segue (falha aberta).

## Arquivo padrão

```json
{
  "max_entradas_recentes": 3,
  "teto_entradas": 8,
  "sempre_incluir": ["regressao", "reprovacao_qa", "zona_de_risco"],
  "fontes": {
    "relatorios": "docs/relatorios",
    "manutencao": "docs/manutencao",
    "entregas": "docs/entregas",
    "legado": "docs/legado",
    "features": "docs"
  },
  "ignorar": [".git", "node_modules", ".expx", "dist", "build", "vendor"]
}
```

## As chaves

### `max_entradas_recentes` — padrão `3`

Quantas entradas recentes por alvo. É o limite que impede um arquivo muito tocado de despejar dezenas de linhas.

Subir para 5 ou 6 num projeto pequeno é razoável. Acima disso, o bloco injetado começa a competir com o próprio prompt do usuário pela atenção, e passa a ser pulado inteiro.

### `teto_entradas` — padrão `8`

Acima de quantas entradas **relevantes** o memox para de listar e passa a informar a contagem.

O teto conta as entradas que sobreviveram à seleção — as recentes mais as promovidas por regressão ou reprovação. Um arquivo com 40 trabalhos e nenhum sinal produz 3 entradas; um com 40 trabalhos e 12 reprovações estoura o teto e vira contagem.

Acima de ~12 o controle de ruído está praticamente desligado: é uma troca consciente de precisão por volume.

### `sempre_incluir` — padrão `["regressao", "reprovacao_qa", "zona_de_risco"]`

Sinais que furam o limite de recência. A idade não os torna irrelevantes: um arquivo que regrediu há dois anos continua sendo um arquivo que regride.

`zona_de_risco` e `divida` são sinais **do arquivo**, não de uma entrada: aparecem na linha de sinais e não promovem entradas antigas.

Esvaziar a lista faz o memox listar só as N mais recentes — o que descarta justamente o sinal mais valioso do índice.

### `fontes`

Onde procurar cada tipo de artefato, relativo à raiz. Ajuste apenas se o projeto usa uma árvore de `docs/` diferente da convenção do ecossistema.

`features` é o diretório onde a `sprintx` cria `docs/<slug>/`; por isso aponta para `docs` e é varrido com profundidade limitada.

### `ignorar`

Diretórios não varridos. Mantenha `node_modules`, `dist`, `build` e `.git`: varrer essas árvores é o único jeito realista de a indexação ficar lenta.

## Ajustes por perfil de projeto

| Situação | Ajuste |
|---|---|
| Projeto novo, poucos trabalhos | padrões; o memox só fica útil a partir do terceiro trabalho fechado |
| Legado com muito histórico por arquivo | baixe `max_entradas_recentes` para `2`; o teto faz o resto |
| Time reclama de ruído na injeção | baixe `max_entradas_recentes`; persistindo, desative o hook e use consulta manual |
| Árvore de `docs/` fora da convenção | ajuste `fontes` |
| Monorepo com `docs/` por pacote | rode o memox por pacote, com `--raiz <pacote>` |

## Verificação

- [ ] JSON válido (`python3 -m json.tool .expx/memoria/config.json`).
- [ ] `max_entradas_recentes` ≤ `teto_entradas`.
- [ ] Todo caminho em `fontes` é relativo.
- [ ] `.expx/memoria/` no `.gitignore` (regra 8) — inclusive a config, que é local.
