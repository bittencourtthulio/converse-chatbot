# TEMPLATE — registro da entrega (E0 e E8)

Grave em `docs/entregas/<trabalho_id>/ENTREGA.md`. Substitua todos os
marcadores `{{assim}}`. O frontmatter segue o contrato expx-schema v1
(`references/08-registro.md`): nenhuma chave é omitida — ausente é `null` ou
`[]`. Datas com `date +%Y-%m-%d` do sistema, nunca de memória.
O YAML e a prosa andam juntos. Apague este cabeçalho ao gravar.

`arquivos_alterados` é o **diff real**, não a previsão das tasks. `faixa_atencao` usa o
vocabulário do índice (`alta`/`media`/`baixa`), não o nome da faixa em prosa: OLHO
OBRIGATÓRIO → `alta`, LEITURA RÁPIDA → `media`, DISPENSÁVEL → `baixa`. As duas listas são
`[]` enquanto o E3 não rodou; nunca omita a chave.

---

---
expx_schema: 1
expx_tool: {{sprintx | runx}}
kind: entrega
trabalho_id: {{slug da feature ou OC-ID-slug}}
entregue_por: mergex
titulo: {{titulo do trabalho, uma linha, sem acento no frontmatter}}
tipo_trabalho: {{feature | ocorrencia}}
tipo_ocorrencia: {{tipo da runx | null}}
estado: {{aberto | entregue | bloqueado}}
versionado: {{true | false}}
branch: {{nome da branch | null}}
branch_base: {{nome da base | null}}
commits:
  - task: {{T-NN.MM}}
    commit: {{identificador curto}}
modulo_afetado: [{{modulos em minuscula sem acento, ou vazio}}]
arquivos_alterados: [{{o diff real: git diff --name-only <base>...HEAD, sem repeticao, ou vazio}}]
faixa_atencao:
  - arquivo: {{caminho de arquivos_alterados}}
    faixa: {{alta | media | baixa}}
raio: {{baixo | medio | alto | null}}
atencao:
  olho_obrigatorio: {{n}}
  leitura_rapida: {{n}}
  dispensavel: {{n}}
portao: {{pronto | bloqueado | null}}
desvios: []
push_feito: {{true | false}}
pr_url: {{url | null}}
pr_estado: {{rascunho | aberto | merged | fechado | null}}
criado_em: {{AAAA-MM-DD}}
atualizado_em: {{AAAA-MM-DD}}
entregue_em: {{AAAA-MM-DD | null}}
---

# Entrega — {{título do trabalho}}

{{uma linha: o que foi entregue e onde está}}

## Onde está o quê

| O quê | Onde |
|---|---|
| Descrição do pull request | [PR.md](PR.md) |
| Pacote de QA | [QA-PACOTE.md](QA-PACOTE.md) |
| Classificação da atenção | [ATENCAO.md](ATENCAO.md) |
| Trabalho de origem | [{{pasta}}]({{caminho relativo}}) |
| Pull request | {{url | não aberto}} |

## Estado da entrega

- Portão de prontidão: {{PRONTO | BLOQUEADO}}
- Commits: {{n}}, um por task
- Atenção humana: {{x}} olho obrigatório, {{y}} leitura rápida, {{z}} dispensável
- Push: {{feito | não feito — motivo}}
- Pull request: {{estado}}
- Falta para o merge: {{o que falta — revisão humana, QA, etc.}}

## Avisos

{{insumos ausentes acumulados pelas etapas: sem raio, sem roteiro manual, sem
DIVIDA.md, ferramenta de PR ausente, convenção divergente}}

## Desvios

{{arquivos alterados fora da lista declarada nas tasks, quando houver}}
