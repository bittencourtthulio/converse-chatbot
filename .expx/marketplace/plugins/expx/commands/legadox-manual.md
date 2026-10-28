---
name: legadox-manual
description: "legadox Camada 8 — gera o roteiro de teste manual para uma pessoa executar na interface, com a seção de colateral"
argument-hint: "[trabalho: slug da feature ou OC-ID da ocorrência]"
---

Invoque a skill `legadox` e execute a Camada 8 seguindo `references/07-teste-manual.md`.

Trabalho: $ARGUMENTS

Pré-requisitos verificáveis: `docs/legado/raio/<trabalho_id>.md` existe com faixa MEDIO ou ALTO, e as tasks já foram executadas — o roteiro cobre o que de fato mudou, não o que estava planejado.

Em raio BAIXO esta camada não se aplica: diga isso e não gere nada.

Produz `docs/legado/manual/<trabalho_id>.md`.

Regra dura: **escrito para uma pessoa que não conhece o código.** Nada de nome de função, arquivo, tabela ou endpoint nos passos. Quem executa é analista de suporte, QA ou o usuário do sistema. E o dado de teste sugerido nunca é dado real de cliente.

Cada caso traz as cinco seções obrigatórias: pré-condição, passos, resultado esperado observável com valor exato, **o que observar de colateral**, e dado de teste sugerido.

A seção de colateral é a razão de esta camada existir e a que quase todo roteiro esquece. Derive-a dos Sinais 2 e 3 do raio: telas vizinhas, relatórios, jobs (dizendo **quando** verificar), integrações, e o comportamento sobre **dado antigo**. Se a mudança tocar cálculo ou formato, inclua um caso próprio verificando que registros criados antes da entrega continuam exibindo o mesmo valor.
