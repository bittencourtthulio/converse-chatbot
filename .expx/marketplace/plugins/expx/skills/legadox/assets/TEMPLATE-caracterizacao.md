# Testes de caracterização — {{trabalho_id}}

> Substitua TODOS os marcadores `{{assim}}`. Nenhum marcador pode sobreviver no arquivo final.
> Um teste de caracterização NÃO julga se o comportamento está certo: ele registra o que É.
> Precisa passar contra o código atual, sem nenhuma alteração em código de produção.

Trabalho: {{trabalho_id}} — {{título do trabalho}}
Faixa do raio: {{MEDIO | ALTO}}
Escrito em: {{AAAA-MM-DD}}
Comportamento congelado na data de: {{AAAA-MM-DD}}

---

## Cabeçalho a colar no topo de cada arquivo de teste

```
Testes de CARACTERIZAÇÃO — trabalho {{trabalho_id}}.
Congelam o comportamento vigente em {{AAAA-MM-DD}}, inclusive o que estiver errado.
NÃO corrija uma asserção por parecer errada: a asserção é o retrato do sistema.
Quebra aqui = mudança de comportamento, intencional ou regressão.
```

---

## Onde vivem

Mecanismo de separação usado: {{pasta própria | sufixo no nome do arquivo | tag ou grupo do runner}}
Caminho ou padrão: `{{pasta/ou/padrão}}`
Comando para rodar só a caracterização: `{{comando}}`

---

## O que foi congelado

| # | Caso | O que congela | Entrada | Saída observada hoje |
|---|---|---|---|---|
| 1 | {{nome do caso}} | {{caminho feliz | borda | desvio | formato de saída | efeito colateral}} | {{entrada}} | {{saída exata observada}} |

Cobertura das cinco dimensões obrigatórias:

- [ ] caminho feliz com entrada representativa
- [ ] bordas que o código trata: zero, vazio, nulo, negativo, limite de faixa
- [ ] cada desvio relevante do caminho alvo
- [ ] formato exato da saída: casas decimais, arredondamento, tipo, ordem, nulo vs vazio, fuso
- [ ] efeito colateral observável: o que grava, o que dispara, o que registra

---

## Comportamentos surpreendentes observados

> O item mais valioso deste arquivo para quem o ler daqui a dois anos.
> O que o sistema faz e ninguém esperava, descoberto ao executar e observar.

- `{{caminho/relativo/arquivo.ext}}` — {{o que se esperava}} / {{o que de fato acontece}}

---

## Dependências isoladas

| Dependência | Como foi isolada | Nível usado |
|---|---|---|
| {{qual}} | {{não isolada | dublê pela borda existente | fixação do não determinístico | ponto de costura mínimo}} | {{1 a 4}} |

{{Nenhuma alteração de lógica no comportamento alvo foi feita para tornar o teste possível.
  Se tiver sido necessária, isso é um achado da Camada 4 e o caso sobe para o humano.}}

---

## Caracterizações por propriedade

> Use quando o comportamento não for determinístico e não puder ser fixado.

| Caso | Propriedade afirmada | Por que não foi possível congelar o valor |
|---|---|---|
| {{caso}} | {{ex.: retorna sempre duas casas decimais}} | {{motivo}} |

---

## Limitações declaradas

- {{o que não foi possível caracterizar, e por quê}}

{{Em raio ALTO, o que a caracterização não alcançou é justamente o que a Camada 9
  precisa alcançar com dado real.}}

---

## Diff da caracterização, após a mudança

> Preenchido ao FIM da execução. Cada teste que passou a falhar é exatamente uma das
> duas coisas abaixo. Não existe terceira classificação.

| Teste | Resultado | Classificação | Task que autoriza | Antes → Depois |
|---|---|---|---|---|
| {{nome do teste}} | {{passou | falhou}} | {{mudança intencional | regressão}} | {{id da task | —}} | {{valor antes}} → {{valor depois}} |

### Comportamentos errados corrigidos de propósito

```
Comportamento congelado:     {{o que o sistema fazia}}
Comportamento após a task:   {{o que passa a fazer}}
Autoriza a quebra do teste:  {{id da task}}
Impacto conhecido:           {{quem consumia o valor antigo}}
```
