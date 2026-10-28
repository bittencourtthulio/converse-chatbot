# Comparação antes e depois com dado real — {{trabalho_id}}

> Substitua TODOS os marcadores `{{assim}}`. Nenhum marcador pode sobreviver no arquivo final.
> A amostra é ANONIMIZADA e NUNCA é commitada. Este arquivo contém apenas o sumário;
> a amostra e as saídas brutas permanecem fora do repositório.
> Divergência não explicada BLOQUEIA a entrega.

Trabalho: {{trabalho_id}} — {{título do trabalho}}
Faixa do raio: {{ALTO | mudança de cálculo ou regra de negócio em faixa {{faixa}}}}
Executada em: {{AAAA-MM-DD}}

---

## Amostra

Tamanho: {{N}} registros
Critério de seleção: {{critério verificável. "Todas as notas de janeiro" é critério;
                       "uma amostra representativa" não é.}}
Origem: {{base de homologação restaurada | extração anonimizada fornecida por {{quem}}}}
Onde vive (fora do repositório): {{diretório temporário — NÃO commitado}}

Composição deliberada:

| Fatia | Quantos | Por que está na amostra |
|---|---|---|
| casos comuns, alto volume | {{N}} | {{o que a maioria dos clientes vê}} |
| extremos numéricos | {{N}} | {{maior, menor, zero, negativo}} |
| bordas de faixa | {{N}} | {{logo abaixo e logo acima de cada limite}} |
| variantes de configuração | {{N}} | {{regime, categoria, tipo de contrato, alíquota}} |
| registros antigos | {{N}} | {{de antes de mudanças anteriores no mesmo cálculo}} |
| casos historicamente problemáticos | {{N}} | {{o que já gerou chamado nessa área}} |
| nulos e vazios | {{N}} | {{campos que a validação de hoje impediria}} |

---

## Anonimização

Campos removidos ou substituídos: {{lista}}
Campos preservados porque o cálculo os usa: {{lista}}
Esquema de chave estável: {{ex.: CLIENTE-001, NOTA-0042}}
Confirmado que a anonimização NÃO altera o resultado do cálculo: {{sim — como foi confirmado}}

---

## Execução

Versão "antes": {{código atual intocado | referência do versionador}}
Versão "depois": {{código novo}}
Entrada idêntica nas duas execuções: {{sim — a amostra não foi regerada entre elas}}

Não determinismo fixado:

| O quê | Como foi fixado |
|---|---|
| data de referência | {{valor fixo usado}} |
| {{sequencial, aleatório, hora}} | {{como}} |

Efeitos colaterais isolados: {{o que foi isolado — e portanto NÃO foi comparado; ou "nenhum"}}

---

## Resultado

```
Total de casos comparados:  {{N}}
Casos idênticos:            {{N}} ({{%}})
Casos divergentes:          {{N}} ({{%}})
  esperadas:                {{N}}
  esperadas em forma, não em magnitude: {{N}}
  de ruído (provado):       {{N}}
  NÃO EXPLICADAS:           {{N}}   <- qualquer valor > 0 BLOQUEIA a entrega
```

---

## Padrões de divergência

> Reduza a padrões, não só a exemplos. "347 divergências" é ruído informacional;
> "347 divergências, todas em notas com alíquota reduzida, todas com um centavo a menos"
> é um diagnóstico.

### Padrão 1: {{descrição do padrão}}

Quantos casos: {{N}}
Classe: {{esperada | esperada em forma, não em magnitude | de ruído | NÃO EXPLICADA}}
Exemplo (anonimizado): entrada `{{CHAVE-ESTÁVEL}}` → antes {{valor}} / depois {{valor}}
Explicação: {{por que esta divergência é esperada, citando a task que a autoriza}}
Impacto conhecido: {{quem consumia o valor antigo e o que acontece com eles}}

{{Repita para cada padrão.}}

---

## Veredito

{{LIBERADO — zero divergências não explicadas
  | BLOQUEADO — {{N}} divergências não explicadas; a entrega não avança}}

{{Se a Camada 9 não pôde ser executada por falta de acesso a dado real, escreva aqui o
  motivo, registre a lacuna em docs/legado/LACUNAS.md, e mantenha o bloqueio em raio ALTO.
  A liberação sem comparação só existe com aprovação humana explícita que assume o risco,
  registrada no arquivo do raio.}}
