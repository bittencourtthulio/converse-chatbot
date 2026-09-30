# TEMPLATE — descrição do pull request (E4)

Substitua todos os marcadores `{{assim}}`. **Seção sem insumo é OMITIDA por
inteiro** — não escreva "não se aplica" nem texto genérico (regra 10).
As seções 5, 7 e 8 só existem em modo legado. Apague este cabeçalho ao gravar.

---

{{o que muda, em uma frase, sem jargão de método}}
{{por que muda, em uma ou duas frases}}

## Arquivos alterados

{{lista completa, agrupada por pasta, em ordem alfabética, com o tipo de mudança:
A adicionado, M modificado, D removido, R renomeado. Nunca resuma com
"e mais N arquivos" — o arquivo omitido é justamente o que colide.}}

```
{{pasta/}}
  {{M arquivo.ext}}
  {{A outro.ext}}
```

Total: {{n}} arquivos.

## Origem

{{runx: identificador da ocorrência, tipo e o relato do cliente em uma linha,
preservado do 00-OCORRENCIA.md, não reescrito}}
{{sprintx: a feature e o slug do trabalho}}

## {{Causa raiz | Análise de impacto}}

{{2 a 3 linhas do que a investigação provou}}

Detalhe: [{{01-CAUSA-RAIZ.md}}]({{caminho relativo}})

## Raio de impacto

> **{{BAIXO | MÉDIO | ALTO}}**

Sinais: {{os sinais que determinaram a faixa}}
Zonas tocadas: {{as zonas de risco do PERFIL.md que este trabalho atinge}}

## O que foi testado

{{um item por task, resumido}}

- {{T-NN.MM — o que os dois testes cobrem}}

Teste de regressão: {{o que ele reproduzia e falhava antes do fix}}
Suíte: {{resultado}} — `{{comando de teste}}`

## O que foi congelado

{{os testes de caracterização e o que fixaram}}
{{inclua explicitamente o comportamento errado preservado de propósito, quando houver}}

## Como reverter

{{o plano de reversão, resumido}}

Efeitos que o versionador NÃO desfaz: {{migração aplicada, dado transformado,
mensagem publicada, arquivo enviado, e-mail disparado}}

## Roteiro de teste manual

[{{QA-PACOTE.md}}]({{caminho relativo}}) — {{n}} casos.
Colaterais a observar: {{telas, relatórios e fluxos vizinhos}}

## Onde eu quero seu olho

### OLHO OBRIGATÓRIO — ler linha a linha

- `{{caminho}}` — {{critério e evidência, uma linha}}

### LEITURA RÁPIDA — conferir intenção, não implementação

- `{{caminho}}` — {{critério e evidência, uma linha}}

### DISPENSÁVEL — a máquina já provou

- `{{caminho}}` — {{critério e evidência, uma linha}}

{{quando não houver nenhum arquivo em OLHO OBRIGATÓRIO, diga isso
explicitamente: é informação forte, não omissão}}

## Fora de escopo

{{o que foi observado e não tocado, do DIVIDA.md}}
