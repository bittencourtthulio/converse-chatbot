# Etapa 2 — SINAIS DERIVADOS

Listar trabalhos é o mínimo. O que torna o índice útil é o que ele **calcula** a partir da lista: os sinais que ninguém escreveu em nenhum artefato, porque só aparecem quando se cruza vários.

Esta etapa roda dentro da reconstrução (etapa 1). Não é um comando separado.

## Pré-requisitos

Coleta concluída: trabalhos, dívida, zonas de risco e linha do tempo já lidos dos artefatos.

## Os sinais

Calculados por arquivo e agregados por módulo:

| Sinal | Como é calculado | Fonte |
|---|---|---|
| `trabalhos` | contagem de entradas distintas para o caminho | `por_arquivo` |
| `ultimo_trabalho_em` | maior data entre as entradas | `fechado_em` / `INDICE.md` |
| `reprovacoes_qa` | trabalhos com `veredito: reprovado` que tocaram o arquivo **ou** cujo achado cita o arquivo | `QA.md` |
| `regressoes` | ver a seção seguinte — o sinal mais valioso | `01-CAUSA-RAIZ.md` × `tecnico.md` |
| `zona_de_risco` | o arquivo, ou um prefixo dele, está declarado no `PERFIL.md` | `docs/legado/PERFIL.md` |
| `divida` | o arquivo tem dívida registrada, com o risco estimado | `docs/legado/DIVIDA.md` |
| `faixa_atencao_frequente` | faixa mais frequente entre as entregas que citam o arquivo | `docs/entregas/*/ENTREGA.md` |

Um sinal ausente é ausência de evidência, não evidência de ausência. Arquivo sem `reprovacoes_qa` pode simplesmente nunca ter passado por QA. Nunca reporte um sinal ausente como "está tudo bem com este arquivo".

## O sinal de regressão

É o mais valioso e o mais fácil de perder: é o que identifica o arquivo que **"sempre volta"**. Ele alimenta o cálculo de raio da `legadox`, que hoje não tem essa informação.

Também é o único sinal que pode **acusar alguém injustamente**. Por isso a regra é dura, e o padrão é não afirmar.

### As três condições

Um trabalho **B** é registrado como regressão de um trabalho **A** quando, e somente quando, as três valem ao mesmo tempo:

1. **Vínculo por arquivo** — existe pelo menos um caminho em `arquivos_impactados` de B (a causa raiz de B) que também está em `arquivos_alterados` de A (o relatório técnico de A). A direção importa: o arquivo que B aponta como causa é o arquivo que A mudou.
2. **Ordem cronológica** — a data de A é estritamente anterior à data de B, e **as duas datas existem**. Sem uma das datas, não há ordem estabelecida, e sem ordem não há causa.
3. **Causa comprovada** — B tem `modo: causa_raiz` **e** `comprovada: true`. Um trabalho em `modo: analise_impacto` não tem causa a apontar: `arquivos_impactados` ali significa "vou mexer aqui", não "o defeito está aqui". Uma causa `comprovada: false` é hipótese, não prova.

Faltando qualquer uma, o vínculo é registrado como **coincidência de arquivo**, em `coincidencias_arquivo`, com o motivo explícito de por que não foi promovido a regressão.

### Por que essas três, e não outras

A regra 4 é a que sustenta a confiança no memox inteiro: *dois trabalhos tocaram o mesmo arquivo é um fato; dizer que um causou o outro é uma afirmação*. Um arquivo central é tocado por dezenas de trabalhos sem nenhuma relação causal entre eles — chamar isso de regressão transformaria o sinal mais valioso do índice em ruído, e um sinal em que ninguém confia é pior que sinal nenhum.

A condição 3 é a que faz o trabalho pesado. Ela usa uma garantia que a `runx` já dá: bug não passa do E1 sem causa raiz comprovada. O memox se apoia nessa disciplina em vez de tentar inferir causalidade por conta própria.

### O que fica gravado

```json
{
  "arquivos": ["src/frete/calculo.ts"],
  "trabalho_anterior": "OC-2026-0100",
  "data_anterior": "2026-05-10",
  "trabalho_posterior": "OC-2026-0142",
  "data_posterior": "2026-08-29",
  "evidencia": "causa raiz comprovada de OC-2026-0142 aponta para arquivo alterado por OC-2026-0100",
  "origem_causa": "docs/manutencao/OC-2026-0142-arredondamento/01-CAUSA-RAIZ.md",
  "origem_alteracao": "docs/relatorios/2026-05-10-OC-2026-0100-faixa-peso/tecnico.md"
}
```

Os dois campos de origem são obrigatórios em espírito: **quem receber o sinal precisa poder abrir os dois artefatos e conferir a afirmação**. Uma regressão sem os dois caminhos é uma acusação sem prova.

### Quando a evidência é ambígua

Na dúvida, **não afirma regressão**: registra como coincidência de arquivo. Casos concretos:

| Situação | Decisão | Por quê |
|---|---|---|
| B aponta o arquivo, mas B é `analise_impacto` | coincidência, motivo "trabalho posterior sem causa raiz" | em análise de impacto, `arquivos_impactados` é escopo, não diagnóstico |
| B tem `modo: causa_raiz` e `comprovada: false` | coincidência, motivo "causa raiz não comprovada" | hipótese não é prova; a própria `runx` não deixaria isso virar plano |
| Uma das datas ausente | coincidência, motivo "ordem cronológica não estabelecida" | sem ordem, "posterior" não significa nada |
| Mesma data em A e B | coincidência | o critério é *estritamente* anterior; no mesmo dia não há como saber a ordem |
| A e B são o mesmo trabalho | ignorado | um trabalho não regride a si mesmo |
| B aponta arquivo que A apenas *impactou*, sem alterar | coincidência | A não mudou o arquivo; não há alteração de A que possa ter causado B |
| Três ou mais trabalhos na cadeia | cada par é avaliado isoladamente | não existe transitividade: A→B e B→C não estabelece A→C |

**Nunca** promova uma coincidência a regressão por parecer plausível, por o arquivo ser conhecido como problemático, ou por os dois trabalhos serem do mesmo módulo. Plausibilidade não é evidência. Se a evidência não está nos artefatos, ela não existe para o memox.

### Como relatar ao humano

Ao apresentar uma regressão, sempre: os dois trabalhos, as duas datas, o arquivo em comum e os dois caminhos de artefato. Nunca "este arquivo é problemático" sozinho — isso é juízo, não fato indexado.

Ao apresentar uma coincidência, use a palavra **coincidência**, e diga o motivo pelo qual não é regressão. O usuário pode olhar e concluir que houve causalidade; essa conclusão é dele, com os artefatos à vista, e não do índice.

## Critério de saída

- [ ] Todo item de `regressoes` satisfaz as três condições.
- [ ] Todo item de `regressoes` tem `origem_causa` e `origem_alteracao`.
- [ ] Todo item de `coincidencias_arquivo` tem `motivo` preenchido.
- [ ] Nenhum par aparece nas duas listas.
- [ ] `sinais.arquivo` cobre todo caminho presente em `por_arquivo`.

## Quando falha

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Nenhuma regressão detectada num projeto que claramente teve | causas raiz sem `arquivos_impactados`, ou relatórios sem `arquivos_alterados` | confira os artefatos; sem os dois campos o cruzamento é impossível. **Não relaxe as três condições para "achar" regressões** |
| Muitas coincidências e nenhuma regressão | predominância de `analise_impacto` | é o esperado num projeto de melhorias; regressão pressupõe bug com causa comprovada |
| Uma regressão parece errada | as datas dos artefatos não refletem a ordem real dos fatos | corrija a data **no artefato** e reconstrua. O índice reflete o artefato; artefato errado se corrige no artefato (regra 9) |
| Explosão de pares em arquivo muito tocado | arquivo central tocado por dezenas de trabalhos | esperado; o controle de ruído da etapa 3 é quem resolve na hora de exibir |
