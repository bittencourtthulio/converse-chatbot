---
name: legadox-caracterizar
description: "legadox Camada 3 — escreve os testes de caracterização que congelam o comportamento atual antes de alterar qualquer coisa"
argument-hint: "[trabalho ou arquivo: o que precisa ter o comportamento congelado]"
---

Invoque a skill `legadox` e execute a Camada 3 seguindo `references/03-caracterizacao.md`.

Alvo: $ARGUMENTS

Pré-requisitos verificáveis: `docs/legado/raio/<trabalho_id>.md` existe com faixa MEDIO ou ALTO, e **o código está intocado**. Se alguma alteração de implementação já foi feita, você não pode caracterizar — o comportamento congelado seria o novo. Reverta, caracterize, e só então altere.

Em raio BAIXO esta camada não se aplica: diga isso e não escreva nada.

Regra dura: **o teste precisa passar contra o código atual, sem nenhuma modificação em código de produção.** Teste de caracterização que falha de saída significa que o comportamento não foi compreendido — corrija o teste, nunca o sistema.

Não deduza o comportamento do código: **execute e observe**. Escreva a asserção com o valor real observado, não com o valor que você esperava. Quando o valor surpreender, registre a surpresa em comentário no próprio teste.

Cubra as cinco dimensões, não só a lógica: caminho feliz, bordas, desvios, **formato exato da saída** (casas decimais, arredondamento, tipo, ordem, nulo vs vazio, fuso) e efeitos colaterais observáveis.

Marque os testes como caracterização, em suíte ou tag própria, com o cabeçalho previsto no reference — sem isso alguém vai "corrigir" uma asserção que retrata um comportamento errado de propósito.
