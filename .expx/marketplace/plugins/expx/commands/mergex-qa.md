---
description: Gera o pacote de teste para o QA — etapa E5 da mergex, isolada. Produz um documento executável por quem não programa: o que mudou em linguagem de produto, o roteiro completo, o que observar de colateral, dado de teste fictício, ambiente, e critério objetivo de aprovação. Use ao passar o trabalho para o QA, ao preparar o teste manual, ou ao pedir o roteiro de homologação da entrega.
---

Acione a skill `mergex` e execute **apenas a etapa E5 (pacote para o QA)**, seguindo `references/05-pacote-qa.md`.

Trabalho: $ARGUMENTS

## O que fazer

Grave `docs/entregas/<trabalho_id>/QA-PACOTE.md` com `assets/TEMPLATE-QA-PACOTE.md`, nesta ordem:

1. **O que mudou**, em linguagem de produto — o que a pessoa que usa o sistema vai ver de diferente.
2. **O roteiro de teste manual, completo** — não resumido e não linkado; o QA trabalha dentro deste arquivo.
3. **O que observar de colateral** — telas, relatórios e fluxos vizinhos, em linguagem de navegação.
4. **Dado de teste sugerido**, fictício, descrito pelas características que importam.
5. **Ambiente e como chegar ao estado inicial.**
6. **Critério objetivo de aprovação e de reprovação**, binário, sem adjetivo.
7. **O que NÃO faz parte desta entrega.**

Trabalho da runx: aponte ao fim o **relatório de uso** — o texto que o suporte devolve ao cliente depois da aprovação. Ele é produzido pelo E5 da runx, que roda depois; diga se ainda não existe. Nunca o escreva.

## O critério de qualidade

**O QA não deve precisar ler código para trabalhar.** Antes de gravar, leia o arquivo como se você não soubesse programar. Se em algum ponto for preciso abrir código para entender o que fazer, reescreva aquele ponto.

Sem nome de arquivo, função, classe, tabela, coluna ou endpoint no corpo. Sem jargão de método (task, sprint, fase, raio, caracterização, portão, faixa). **Sem dado real de cliente, nunca. Sem credencial.**
